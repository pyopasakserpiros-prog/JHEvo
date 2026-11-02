/* sect.js — โครงสร้างสำนัก: ระดับศิษย์ ตำแหน่ง นโยบายที่มาจากนิสัยเจ้าสำนักจริง การประชุมสภา การสืบทอด
 * หลักการ: เจ้าสำนักตัดสินใจจาก "ตัวตน" (HC) ของเขา → นโยบาย → ผลต่อทั้งสำนัก (ดู policy ที่ถูกอ่านโดย ai/events/economy) */
(function (g) {
  'use strict';
  const U = g.U || require('./util.js'), HC = g.HC, CULT = g.CULT, ECO = g.ECO, MAP = g.MAP, JD = g.JD;
  const clamp = U.clamp;
  const SECT = {};

  SECT.MAX_QUEUE = 6;
  SECT.HOUSING_IDS = ['dorm_outer', 'dorm_inner', 'dorm_core'];

  /* ---------- Authoritative Facility Progression & Housing Capacity (Max = 100) ---------- */
  SECT.FACILITY_SPECS = {
    dorm_outer: { maxLevel: 5, bedsByLevel: [0, 24, 32, 40, 48, 56], costBase: 550, category: 'housing' },
    dorm_inner: { maxLevel: 4, bedsByLevel: [0, 14, 19, 24, 28], costBase: 700, category: 'housing' },
    dorm_core: { maxLevel: 3, bedsByLevel: [0, 8, 12, 16], costBase: 900, category: 'housing' },
    elder_quarters: { maxLevel: 1, costBase: 900, category: 'housing_exec' },
    farm: { maxLevel: 5, costBase: 500, category: 'production' },
    canteen: { maxLevel: 4, costBase: 550, category: 'service' },
    meditation_hall: { maxLevel: 4, costBase: 650, category: 'cultivation' },
    training_ground: { maxLevel: 4, costBase: 600, category: 'martial' },
    herb_garden: { maxLevel: 4, costBase: 550, category: 'production' },
    alchemy: { maxLevel: 3, costBase: 650, category: 'craft' },
    forge: { maxLevel: 3, costBase: 650, category: 'craft' },
    mine: { maxLevel: 3, costBase: 600, category: 'production' },
    infirmary: { maxLevel: 3, costBase: 550, category: 'service' },
    scripture: { maxLevel: 3, costBase: 700, category: 'scholar' },
    tea_garden: { maxLevel: 2, costBase: 500, category: 'production' },
    shrine: { maxLevel: 2, costBase: 550, category: 'service' },
    market: { maxLevel: 2, costBase: 600, category: 'commerce' },
    main_hall: { maxLevel: 1, category: 'admin' },
    treasury: { maxLevel: 1, category: 'admin' },
    mission_hall: { maxLevel: 1, category: 'admin' },
    discipline: { maxLevel: 1, category: 'admin' },
    gate: { maxLevel: 1, category: 'defense' },
    watchtower_w: { maxLevel: 1, category: 'defense' },
    watchtower_e: { maxLevel: 1, category: 'defense' },
    waterfall: { maxLevel: 1, category: 'landmark' },
    spirit_tree: { maxLevel: 1, category: 'landmark' },
    plaza: { maxLevel: 1, category: 'landmark' }
  };

  SECT.maxBuildingLevel = bOrId => {
    const id = typeof bOrId === 'string' ? bOrId : (bOrId && bOrId.id);
    const sp = SECT.FACILITY_SPECS[id];
    return sp && Number.isFinite(sp.maxLevel) ? sp.maxLevel : 3;
  };

  SECT.upgradeCost = b => {
    if (!b) return 600;
    const sp = SECT.FACILITY_SPECS[b.id];
    const base = (sp && sp.costBase) || 600;
    return Math.round(base * b.level * b.level);
  };

  SECT.housingCapacity = W => {
    if (!W || !W.map || !W.map.byId) return 46;
    return SECT.HOUSING_IDS.reduce((sum, id) => {
      const b = W.map.byId[id];
      if (!b || !Array.isArray(b.stations)) return sum;
      return sum + b.stations.filter(st => st && (!st.k || st.k === 'bed')).length;
    }, 0);
  };

  SECT.maxHousingCapacity = () => {
    return SECT.HOUSING_IDS.reduce((sum, id) => {
      const sp = SECT.FACILITY_SPECS[id];
      return sum + (sp && sp.bedsByLevel ? sp.bedsByLevel[sp.maxLevel] : 0);
    }, 0);
  };

  SECT.memberOccupancy = W => {
    if (!W || !Array.isArray(W.npcs)) return 0;
    const seen = new Set();
    let count = 0;
    for (const n of W.npcs) {
      if (!n || n.dead || n.exiled || !n.id || seen.has(n.id)) continue;
      seen.add(n.id);
      count++;
    }
    return count;
  };

  SECT.freeHousingBeds = W => Math.max(0, SECT.housingCapacity(W) - SECT.memberOccupancy(W));

  SECT.upgradeBuildingTo = (W, bOrId, targetLevel) => {
    if (!W || !W.map || !W.map.byId) return { ok: false, reason: 'invalid-world' };
    const b = typeof bOrId === 'string' ? W.map.byId[bOrId] : bOrId;
    if (!b) return { ok: false, reason: 'building-not-found' };
    const maxL = SECT.maxBuildingLevel(b);
    const goal = clamp(Math.floor(Number(targetLevel) || b.level), 1, maxL);
    b.building = null;
    while (b.level < goal) {
      b.level++;
      if (g.SIM && g.SIM.expandStations) g.SIM.expandStations(W, b);
    }
    return { ok: true, id: b.id, level: b.level, maxLevel: maxL, capacity: SECT.housingCapacity(W) };
  };

  /* ---------- Applicant Talent Tier Distribution & CA/PA Privacy ---------- */
  SECT.TALENT_TIERS = {
    COMMON: { id: 'COMMON', nameTh: 'สามัญ', quality: [0.34, 0.50], rootGrades: ['DEFECTIVE', 'MORTAL'], traitCount: [1, 2], isGifted: false, isExceptional: false },
    STEADY: { id: 'STEADY', nameTh: 'มุ่งมั่น', quality: [0.46, 0.60], rootGrades: ['MORTAL', 'SPIRIT'], traitCount: [2, 3], isGifted: false, isExceptional: false },
    GIFTED: { id: 'GIFTED', nameTh: 'พรสวรรค์เด่น', quality: [0.58, 0.72], rootGrades: ['SPIRIT', 'TRUE'], traitCount: [2, 3], isGifted: true, isExceptional: false },
    PRODIGY: { id: 'PRODIGY', nameTh: 'อัจฉริยะ', quality: [0.72, 0.85], rootGrades: ['TRUE', 'HEAVENLY'], traitCount: [3, 4], isGifted: true, isExceptional: true },
    HEAVENLY_CHILD: { id: 'HEAVENLY_CHILD', nameTh: 'บุตรสวรรค์', quality: [0.85, 0.96], rootGrades: ['HEAVENLY'], traitCount: [3, 4], isGifted: true, isExceptional: true }
  };
  SECT.TALENT_TIER_IDS = ['COMMON', 'STEADY', 'GIFTED', 'PRODIGY', 'HEAVENLY_CHILD'];

  SECT.applicantTierWeights = fame => {
    const f = Math.max(0, Number.isFinite(fame) ? fame : 12);
    const u = clamp(Math.sqrt(f) / 28, 0, 1);
    const GIFTED = +(0.060 + 0.165 * u).toFixed(6);
    const PRODIGY = +(0.012 + 0.068 * u).toFixed(6);
    const HEAVENLY_CHILD = +(0.003 + 0.022 * u).toFixed(6);
    const STEADY = +(0.220 + 0.080 * u).toFixed(6);
    const COMMON = +(1 - (GIFTED + PRODIGY + HEAVENLY_CHILD + STEADY)).toFixed(6);
    return { COMMON, STEADY, GIFTED, PRODIGY, HEAVENLY_CHILD };
  };

  SECT.rollApplicantTier = (rng, fame) => {
    const weights = SECT.applicantTierWeights(fame);
    const tierId = (rng && rng.weighted) ? rng.weighted(SECT.TALENT_TIER_IDS, k => weights[k]) : 'COMMON';
    const spec = SECT.TALENT_TIERS[tierId] || SECT.TALENT_TIERS.COMMON;
    const quality = (rng && rng.float) ? rng.float(spec.quality[0], spec.quality[1]) : (spec.quality[0] + spec.quality[1]) / 2;
    const rootGrade = (rng && rng.pick) ? rng.pick(spec.rootGrades) : spec.rootGrades[0];
    const traitCount = (rng && rng.int) ? rng.int(spec.traitCount[0], spec.traitCount[1]) : spec.traitCount[0];
    return {
      tierId: spec.id,
      nameTh: spec.nameTh,
      quality,
      rootGrade,
      traitCount,
      isGifted: spec.isGifted,
      isExceptional: spec.isExceptional
    };
  };

  // Internal diagnostic helper for test/simulation verification only (never used by UI or recruitment evaluation)
  SECT.hiddenPotential = n => {
    if (!n || !n.h) return { paScore: 0, tierId: 'COMMON' };
    const a = n.h.aptitudes || {}, it = n.h.intellect || {}, ph = n.h.physiology || {};
    const rootTier = (HC.ROOT_BY_ID[n.h.root && n.h.root.grade] || { tier: 1 }).tier;
    const paScore = (
      (a.cultivation || 50) * 0.30 +
      (a.comprehension || 50) * 0.20 +
      (a.combat || 50) * 0.15 +
      (a.crafting || 50) * 0.10 +
      (it.learningSpeed || 50) * 0.10 +
      (ph.spiritualFoundation || 50) * 0.08 +
      (ph.meridianCapacity || 50) * 0.07 +
      (rootTier - 1) * 4.5
    );
    const tierId = (n.ext && n.ext.applicant && n.ext.applicant.tierId)
      ? n.ext.applicant.tierId
      : (paScore >= 82 || rootTier >= 5 ? 'HEAVENLY_CHILD' : paScore >= 72 || rootTier >= 4 ? 'PRODIGY' : paScore >= 61 ? 'GIFTED' : paScore >= 49 ? 'STEADY' : 'COMMON');
    return { paScore: +paScore.toFixed(2), tierId, rootGrade: n.h.root && n.h.root.grade };
  };

  // Strictly observable current capability (CA) — NEVER reads hidden PA fields:
  // aptitudes, affinities, root, constitution, traits, innate, destiny, intellect, spiritualFoundation, meridianCapacity, meridianIntegrity, senseAcuity, or n.ext.applicant
  SECT.observableCapability = (W, n) => {
    if (!n || !n.h) {
      return { caScore: 0, physicalScore: 0, demeanorScore: 0, martialSkill: 0, craftSkill: 0, civicSkill: 0, healthScore: 0, roleFit: 'general', bestRoleTh: 'แรงงานทั่วไป', summaryTh: 'ไม่ทราบข้อมูล', tags: [] };
    }
    const ph = n.h.physiology || {};
    const pe = n.h.personality || {};
    const so = n.h.social || {};
    const sk = n.h.skills || {};
    const st = n.h.state || {};

    const physicalScore = (
      (ph.strength || 40) * 0.20 +
      (ph.endurance || 40) * 0.20 +
      (ph.toughness || 40) * 0.15 +
      (ph.dexterity || 40) * 0.15 +
      (ph.agility || 40) * 0.15 +
      (ph.vitality || 40) * 0.15
    );
    const demeanorScore = (
      (pe.discipline || 45) * 0.35 +
      (pe.integrity || 45) * 0.25 +
      (pe.composure || 45) * 0.20 +
      (pe.courage || 45) * 0.10 +
      (so.charisma || 45) * 0.10
    );
    const martialSkill = Math.max(sk.SWORD || 0, sk.BLADE || 0, sk.SPEAR || 0, sk.FIST_PALM || 0, sk.BOW || 0, sk.STAFF || 0, sk.FOCUS || 0, sk.BODY_REFINING || 0, sk.LIGHTFOOT || 0);
    const craftSkill = Math.max(sk.ALCHEMY || 0, sk.FORGING || 0, sk.MEDICINE || 0, sk.HERB_LORE || 0, sk.SCRIPTURE || 0);
    const civicSkill = Math.max(sk.farming || 0, sk.cooking || 0, sk.mining || 0, sk.herbalism || 0, sk.administration || 0, sk.trading || 0, sk.survival || 0, sk.construction || 0);
    const stage = CULT.equivalentStage(n);
    const injPenalty = Array.isArray(n.inj) ? n.inj.length * 6 : 0;
    const healthScore = clamp((st.energy == null ? 80 : st.energy) * 0.5 + 50 - injPenalty, 10, 100);

    // Evaluate current sect staffing fit from observable skills only
    let roleFit = 'general', bestRoleTh = 'งานทั่วไป', needBonus = 0;
    const roleScores = [
      { id: 'martial', label: 'ฝึกยุทธ์/ป้องกัน', val: martialSkill * 1.1 + (ph.strength || 40) * 0.35 + (pe.courage || 45) * 0.25 },
      { id: 'alchemy', label: 'ปรุงยา/การแพทย์', val: Math.max(sk.ALCHEMY || 0, sk.MEDICINE || 0, sk.HERB_LORE || 0) * 1.2 + (ph.dexterity || 40) * 0.3 },
      { id: 'forge', label: 'ช่างหลอม/ก่อสร้าง', val: Math.max(sk.FORGING || 0, sk.construction || 0, sk.mining || 0) * 1.2 + (ph.strength || 40) * 0.35 },
      { id: 'provision', label: 'เกษตร/โรงครัว', val: Math.max(sk.farming || 0, sk.cooking || 0, sk.herbalism || 0) * 1.25 + (ph.endurance || 40) * 0.35 },
      { id: 'admin', label: 'ธุรการ/การค้า', val: Math.max(sk.administration || 0, sk.trading || 0, sk.SCRIPTURE || 0) * 1.2 + (pe.discipline || 45) * 0.35 }
    ].sort((a, b) => b.val - a.val);

    if (roleScores[0] && roleScores[0].val >= 28) {
      roleFit = roleScores[0].id;
      bestRoleTh = roleScores[0].label;
    }

    if (W && W.sect) {
      const pop = Math.max(1, SECT.memberOccupancy(W));
      const foodDays = (ECO.count(W, 'meal') + ECO.count(W, 'grain') * 3) / (pop * 3);
      if (foodDays < 8 && (sk.farming || 0) + (sk.cooking || 0) >= 12) needBonus += 5;
      if ((W.sect.shortageDirectives || []).some(d => d.source === 'alchemy') && (sk.ALCHEMY || 0) + (sk.herbalism || 0) >= 10) needBonus += 4;
      if (pop < 16) needBonus += 3;
    }

    const caScore = +(
      physicalScore * 0.34 +
      demeanorScore * 0.32 +
      Math.max(martialSkill, craftSkill, civicSkill) * 0.45 +
      (martialSkill + craftSkill + civicSkill) * 0.08 +
      stage * 5 +
      (healthScore - 50) * 0.08 +
      needBonus
    ).toFixed(2);

    const tags = [];
    if (physicalScore >= 60) tags.push('ร่างกายกำยำ');
    else if (physicalScore < 42) tags.push('รูปร่างบอบบาง');
    if (demeanorScore >= 60) tags.push('กิริยาสำรวมมีวินัย');
    if (martialSkill >= 14) tags.push('มีพื้นฐานยุทธ์');
    if (craftSkill >= 12) tags.push('คุ้นงานช่าง/โอสถ');
    if (civicSkill >= 14) tags.push('คล่องงานดูแลสำนัก');
    if (!tags.length) tags.push('พื้นฐานปุถุชนทั่วไป');

    const gradeTh = caScore >= 64 ? 'โดดเด่นพร้อมใช้งาน' : caScore >= 52 ? 'หน่วยก้านดี' : caScore >= 42 ? 'พอฝึกหัดได้' : 'พื้นฐานยังอ่อน';
    const summaryTh = gradeTh + ' · ถนัด' + bestRoleTh + ' (' + tags.slice(0, 2).join(', ') + ')';

    return {
      caScore,
      physicalScore: Math.round(physicalScore),
      demeanorScore: Math.round(demeanorScore),
      martialSkill: Math.round(martialSkill),
      craftSkill: Math.round(craftSkill),
      civicSkill: Math.round(civicSkill),
      healthScore: Math.round(healthScore),
      roleFit,
      bestRoleTh,
      gradeTh,
      summaryTh,
      tags
    };
  };

  SECT.RANKS = [
    { id: 0, nameTh: 'ผู้ฝึกหัด', dorm: 'dorm_outer', stipend: 2, color: '#9aa3a8' },
    { id: 1, nameTh: 'ศิษย์นอก', dorm: 'dorm_outer', stipend: 5, color: '#8fae8b' },
    { id: 2, nameTh: 'ศิษย์ใน', dorm: 'dorm_inner', stipend: 12, color: '#5ea6d9' },
    { id: 3, nameTh: 'ศิษย์แกนกลาง', dorm: 'dorm_core', stipend: 25, color: '#b07ae0' },
    { id: 4, nameTh: 'ผู้อาวุโส', dorm: 'elder_quarters', stipend: 55, color: '#d9534f' },
    { id: 5, nameTh: 'รองเจ้าสำนัก', dorm: 'elder_quarters', stipend: 85, color: '#f0a030' },
    { id: 6, nameTh: 'เจ้าสำนัก', dorm: 'elder_quarters', stipend: 130, color: '#f6d44a' }
  ];
  SECT.POSTS = {
    martial: { nameTh: 'ผู้อาวุโสหอยุทธ์', hall: 'training_ground', desc: 'ฝึกศิษย์ จัดประลอง กำหนดหลักสูตรยุทธ์' },
    alchemy: { nameTh: 'ผู้อาวุโสหอโอสถ', hall: 'alchemy', desc: 'กำหนดการปรุงโอสถ ดูแลคุณภาพและสต็อกยา' },
    forge: { nameTh: 'ผู้อาวุโสโรงหลอม', hall: 'forge', desc: 'ดูแลหลอมอาวุธ เกราะ ยันต์ ค่ายกล' },
    scripture: { nameTh: 'ผู้อาวุโสหอคัมภีร์', hall: 'scripture', desc: 'คุมตำราวิชา วิจัยตำรับใหม่ ควบคุมการเข้าถึงวิชา' },
    discipline: { nameTh: 'ผู้คุมกฎสำนัก', hall: 'discipline', desc: 'บังคับใช้กฎ ลงโทษ สืบสวนทุจริต' },
    treasury: { nameTh: 'ผู้อาวุโสหอคลัง', hall: 'treasury', desc: 'คุมศิลาวิญญาณ จัดสรรเบี้ยหวัด สั่งซื้อวัตถุดิบ' },
    mission: { nameTh: 'ผู้อาวุโสฝ่ายกิจการนอกสำนัก', hall: 'mission_hall', desc: 'จัดคณะเดินทางนอกสำนัก ค้าขาย ล่าอสูร หาศิษย์ใหม่' },
    guard: { nameTh: 'หัวหน้าองครักษ์', hall: 'gate', desc: 'เฝ้าประตู สำนัก ตรวจตรา ป้องกันศัตรู' },
    registry: { nameTh: 'ผู้อาวุโสหอทะเบียน', hall: 'main_hall', desc: 'พิจารณาผู้สมัครเข้าสำนัก จัดทำทะเบียนศิษย์ แทนเจ้าสำนัก' },
    healer: { nameTh: 'หมอหลวงสำนัก', hall: 'infirmary', desc: 'รักษาผู้บาดเจ็บ ดูแลสุขภาพทั้งสำนัก' },
    disciples: { nameTh: 'ศิษย์สืบทอด', hall: 'main_hall', desc: 'ศิษย์เอกผู้สืบทอดตำแหน่งเจ้าสำนัก ได้รับการเสนอชื่อและโหวตเลือกจากเจ้าสำนักและเหล่าผู้อาวุโส' }
  };
  SECT.PLANNED_POSTS = {
    diplomacy: { nameTh: 'ฝ่ายการทูต', requires: 'ระบบภารกิจและข้อตกลงทางการทูตที่มอบหมายเฉพาะฝ่าย' },
    intelligence: { nameTh: 'ฝ่ายข่าวกรอง', requires: 'ระบบข่าวและการยืนยันแหล่งข่าว' },
    beastcare: { nameTh: 'ฝ่ายสัตว์วิญญาณ', requires: 'ระบบจับ เลี้ยง และดูแลสัตว์' },
    formation: { nameTh: 'ฝ่ายค่ายกลป้องกัน', requires: 'ระบบค่ายกลประจำพื้นที่และการบำรุงรักษา' }
  };
  Object.assign(SECT.POSTS, {
    commander: { nameTh: 'แม่ทัพสำนัก', hall: 'training_ground', desc: 'ประเมินศัตรู ระดมกำลัง และนำการป้องกันสำนัก' },
    provision: { nameTh: 'ผู้อาวุโสฝ่ายเสบียง', hall: 'main_hall', desc: 'ตรวจอาหารสำรอง วางแผนเพาะปลูกและประกอบอาหาร' },
    herbal: { nameTh: 'ผู้อาวุโสฝ่ายสมุนไพร', hall: 'main_hall', desc: 'ประเมินสมุนไพรที่ขาดและประสานการปลูกหรือเก็บ' },
    wildwarden: { nameTh: 'ผู้อาวุโสฝ่ายลาดตระเวนอสูร', hall: 'gate', desc: 'ตรวจพื้นที่อสูร แจ้งความเสี่ยงและความพร้อมของผู้ล่า' },
    steward: { nameTh: 'ผู้อาวุโสฝ่ายอาคารสถานที่', hall: 'main_hall', desc: 'ตรวจสถานีแออัดและเสนอขยายโดยเจ้าสำนักอนุมัติ' }
  });
  SECT.POST_IDS = Object.keys(SECT.POSTS);
  // A future office becomes assignable only after its implementation joins POSTS.
  SECT.ARCHETYPES = {
    sword: {
      id: 'sword',
      nameTh: 'สำนักกระบี่เซียน',
      titleTh: 'วิถีกระบี่เหินเมฆา',
      descTh: 'สำนักมุ่งเน้นเพลงกระบี่อันคมกริบและปราณกระบี่พิสุทธิ์ ทรงอานุภาพทั้งระยะประชิดและการควบคุมกระบี่บิน',
      path: 'XIAN',
      subs: ['SWORD_IMMORTAL', 'PURE_SWORD_SAINT', 'MIND_SWORD_TELEKINESIS', 'YIN_YANG_HARMONY'],
      techs: ['ART190_XIAN_001', 'ART190_XIAN_031', 'PASS_SWORD_FAMILIAR_T1', 'MP_SWORD_PURE_THRUST_T1', 'ART190_XIAN_013', 'MP_SWORD_POISE', 'MP_SWORD_FLOWING_PARRY_T2', 'ART190_XIAN_002', 'PASS_SWORD_EDGE_T3', 'PASS_SWORD_INTENT_T3', 'MP_SWORD_SHADOWLESS_SWIFT_T3', 'ART190_XIAN_016', 'ART190_XIAN_038', 'MP_SWORD_TENDON_SEVER_T4', 'ART190_XIAN_009', 'PASS_SWORD_HEART_CLARITY_T5', 'ART_V212_XIAN_ZITHER_T1', 'ART_V212_XIAN_PHANTOM_T6', 'PASS_V212_ADAPTIVE_ARSENAL_T2', 'ART_V212_XIAN_ZITHER_T3', 'ART_V212_SAGE_HARMONY_T1'],
      crystals: { 'S:SWORD_IMMORTAL': 2, 'S:PURE_SWORD_SAINT': 1, 'S:YIN_YANG_HARMONY': 1 }
    },
    blade: {
      id: 'blade',
      nameTh: 'สำนักดาบคลั่ง',
      titleTh: 'วิถีดาบผ่าพิภพ',
      descTh: 'สำนักสายพลังกาย ดาบหนัก ดาบใหญ่ และการทำลายล้างไร้ขอบเขต ฟันขาดทุกปราการด้วยพละกำลังมหาศาล',
      path: 'BODY',
      subs: ['TIGER_SOVEREIGN', 'OVERLORD_HEAVY_BLADE', 'ASHURA_SLAUGHTER_BLADE', 'SOLAR_FORGE', 'BLOOD_DEMON'],
      techs: ['PASS_BLADE_FOUNDATION_T1', 'ART190_BODY_001', 'MP_BLADE_SWIFT_DRAW_T1', 'ART190_BODY_021', 'MP_BLADE_IRON_CLEAVER_T2', 'PASS_BLADE_HEAVY_CLEAVE_T3', 'MP_BLADE_CROSS_EXECUTION_T3', 'ART190_BODY_012', 'ART190_BODY_006', 'MP_BLADE_FROST_CRESCENT_T4', 'ART190_XIAN_018', 'PASS_BLADE_BLOOD_EDGE_T5', 'ART190_BODY_004', 'ART190_BODY_027', 'MP_BLADE_MOUNTAIN_SPLITTER_T5', 'ART_V212_DEMON_BLOOD_SPEAR_T1', 'ART_V212_KARMA_ASURA_T1', 'PASS_V212_ADAPTIVE_ARSENAL_T2'],
      crystals: { 'S:TIGER_SOVEREIGN': 2, 'S:OVERLORD_HEAVY_BLADE': 1, 'S:SOLAR_FORGE': 1 }
    },
    spear: {
      id: 'spear',
      nameTh: 'สำนักทวนมังกร',
      titleTh: 'วิถีทวนทะลวงเมฆา',
      descTh: 'สำนักสายทวนและหอกยาว เน้นระยะการรบที่ได้เปรียบ ทะลวงแนวรบ ค่ายกลทัพ และป้องกันรอบด้าน',
      path: 'BODY',
      subs: ['BLOOD_DRAGON', 'WAR_SPEAR_SOVEREIGN', 'CLOUD_DRAGON_SPEAR', 'WAR_DEITY', 'STAFF_GUARD'],
      techs: ['PASS_SPEAR_REACH_T1', 'INNATE_WAR_DEITY_BANNER_SPEAR', 'ART190_BODY_002', 'MP_SPEAR_LINE', 'MP_SPEAR_MILITARY_DRILL_T1', 'SRC110_NW_ART_126', 'ART190_GOD_032', 'MP_SPEAR_IRON_BREAKER_T3', 'ART190_BODY_026', 'PASS_SPEAR_DRAGON_SPINE_T3', 'ART190_GOD_006', 'MP_SPEAR_PHALANX_WALL_T4', 'ART190_BODY_039', 'ART190_XIAN_029', 'PASS_SPEAR_PIERCING_AURA_T5', 'ART_V212_BODY_THUNDER_T1', 'ART_V212_BODY_THUNDER_T3', 'ART_V212_DEMON_BLOOD_SPEAR_T1', 'ART_V212_SOUL_VOID_SPEAR_T1'],
      crystals: { 'S:BLOOD_DRAGON': 2, 'S:WAR_SPEAR_SOVEREIGN': 1, 'S:WAR_DEITY': 1 }
    },
    fist: {
      id: 'fist',
      nameTh: 'สำนักหมัดกายทอง',
      titleTh: 'วิถีหมัดกายทองคำ',
      descTh: 'สำนักหมัดมวย ฝ่ามือ และกายทองคำวัชระ ทรงพลังประชิดตัว ความทนทานสูงสุด และสะท้อนการโจมตี',
      path: 'BODY',
      subs: ['VAJRA_BODHI', 'TITAN_MOUNTAIN_BODY', 'THUNDER_BODY'],
      techs: ['ART190_BODY_001', 'MP_FIST_IRON_JAB_T1', 'ART190_BODY_021', 'MP_FIST_JOINT_LOCK_CLAW_T2', 'ART190_BODY_003', 'ART190_BODY_013', 'MP_FIST_BAJI_SHOULDER_T3', 'ART190_BODY_032', 'ART190_BODY_015', 'MP_FIST_TEMPEST_KICK_T4', 'ART190_BODY_004', 'ART190_BODY_018', 'ART190_BODY_027', 'ART190_BODY_009', 'ART190_BODY_029', 'MP_FIST_SHOCKWAVE_PALM_T5', 'ART_V212_BODY_THUNDER_T1', 'ART_V212_BODY_THUNDER_T3', 'ART_V212_BODY_THUNDER_T6'],
      crystals: { 'S:VAJRA_BODHI': 2, 'S:TITAN_MOUNTAIN_BODY': 1 }
    },
    alchemy: {
      id: 'alchemy',
      nameTh: 'สำนักโอสถเต๋า',
      titleTh: 'วิถีโอสถบงกชสวรรค์',
      descTh: 'สำนักมุ่งเน้นการหลอมโอสถ โคจรปราณเบญจธาตุ และยันต์ค่ายกลสวรรค์ เพิ่มอายุขัยและฟื้นฟูชีพจร',
      path: 'XIAN',
      subs: ['ELIXIR_DAO', 'FIVE_ELEMENTS', 'ASTRAL_ARRAY'],
      techs: ['ART190_XIAN_021', 'ART190_XIAN_051', 'MP_FOCUS_IRON_FAN_T1', 'ART190_XIAN_003', 'ART190_XIAN_033', 'ART190_XIAN_063', 'PASS_MERIDIAN_DISCIPLINE_T2', 'MP_FOCUS_ACUPOINT_NEEDLE_T2', 'ART190_XIAN_015', 'ART190_XIAN_045', 'MP_FOCUS_ABACUS_TACTIC_T3', 'ART190_XIAN_027', 'ART190_XIAN_057', 'ART190_XIAN_039', 'ART190_XIAN_069'],
      crystals: { 'S:ELIXIR_DAO': 2, 'S:FIVE_ELEMENTS': 1 }
    },
    bow: {
      id: 'bow',
      nameTh: 'สำนักเกาทัณฑ์ดาราสวรรค์',
      titleTh: 'วิถีเกาทัณฑ์ทะลวงมิติ',
      descTh: 'สำนักสายธนูและเกาทัณฑ์ ยิงสังหารศัตรูจากระยะไกล ปราณดาราทะลวงมิติ และศรเงาปลิดวิญญาณ',
      path: 'XIAN',
      subs: ['STAR_ARCHER', 'SHADOW_ARCHER', 'IRON_BOW_SENTINEL', 'SUN_BOW_DEITY', 'ZITHER_HEART_BOW'],
      techs: ['PASS_BOW_STILLNESS_T1', 'MP_BOW_BASIC', 'MP_BOW_IRON_DRAW_T1', 'INNATE_STAR_ARCHER_ASTRAL_LOCK', 'MP_BOW_RAIN', 'MP_BOW_RAPID_VOLLEY_T2', 'MP_BOW_SUN_RAY_T2', 'MP_BOW_FOCUS', 'MP_BOW_PIERCE_CLOUD', 'PASS_BOW_HAWK_EYE_T3', 'MP_BOW_ARMOR_BODKIN_T3', 'MP_BOW_SHADOW_SNIPE', 'MP_BOW_PARTING_SHOT_T4', 'MP_BOW_METEOR_STORM', 'MP_BOW_SIEGE_BALLISTA_T5', 'ART_V212_GOD_SUN_BOW_T1', 'ART_V212_GOD_SUN_BOW_T3', 'ART_V212_GOD_SUN_BOW_T6', 'ART_V212_MECH_BALLISTA_T1'],
      crystals: { 'S:STAR_ARCHER': 2, 'S:SHADOW_ARCHER': 1, 'S:SUN_BOW_DEITY': 1 }
    },
    staff: {
      id: 'staff',
      nameTh: 'สำนักพลองโพธิ์วัชระ',
      titleTh: 'วิถีพลองค้ำจุนฟ้าดิน',
      descTh: 'สำนักสายพลองและกระบองยาว ผสานปราณคุ้มกายตั้งรับเหนียวแน่น กวาดล้างศัตรูเป็นหมู่คณะ และสะกดทัพหน้า',
      path: 'BODY',
      subs: ['STAFF_GUARD', 'VAJRA_BODHI', 'GOLDEN_ARHAT_STAFF'],
      techs: ['MP_STAFF_SWEEP_BASIC_T1', 'MP_STAFF_VINE_SWEEP_T1', 'MP_STAFF_IRON_REVOLVE_T2', 'MP_STAFF_POLE_VAULT_T2', 'MP_STAFF_GOLDEN_LIGHT_T2', 'MP_STAFF_CRUSHING_BLOW_T3', 'PASS_STAFF_KINETIC_LEVER_T3', 'MP_STAFF_SOLAR_ANVIL_T3', 'MP_STAFF_ARHAT_EIGHTEEN_T4', 'MP_STAFF_UNDERWORLD_GAVEL_T4', 'MP_STAFF_MOUNTAIN_ANCHOR_T5', 'MP_STAFF_ZEN_LOTUS_T5', 'ART_V212_GOD_JUDGE_T1', 'ART_V212_SOUL_VOID_SPEAR_T1', 'ART_V212_DEMON_GHOST_T1'],
      crystals: { 'S:STAFF_GUARD': 2, 'S:GOLDEN_ARHAT_STAFF': 1 }
    },
    focus: {
      id: 'focus',
      nameTh: 'สำนักศาสตราอาคมดารา',
      titleTh: 'วิถีค่ายกลและจิตตานุภาพ',
      descTh: 'สำนักสายศาสตราอาคม พัด พิณ กระจกวิญญาณ และค่ายกลดารา ควบคุมสนามรบและโจมตีด้วยพลังจิตวิญญาณ',
      path: 'HEART_SOUL',
      subs: ['CALLIGRAPHY_PAINTING_SAGE', 'ZEN_VOID_MIND', 'DREAM_ILLUSION_WEAVER', 'ASTRAL_ARRAY'],
      techs: ['MP_FOCUS_IRON_FAN_T1', 'MP_FOCUS_ACUPOINT_NEEDLE_T2', 'MP_FOCUS_ABACUS_TACTIC_T3', 'MP_FOCUS_SOUL_BELL_T3', 'PASS_FOCUS_SCHOLAR_POISE_T4', 'MP_HYB_BOW_FOCUS_ZITHER_T4', 'MP_FOCUS_SONIC_ZITHER_T5', 'MP_FOCUS_ASTRAL_BANNER_T5', 'MP_FOCUS_CELESTIAL_ZITHER_T5', 'MP_HYB_BLADE_FOCUS_FLYING_T5', 'MP_FOCUS_GRANDMASTER_FAN_T6', 'MP_FOCUS_CAULDRON_FIRE_T6', 'MP_FOCUS_FATE_MIRROR_T6', 'MP_FOCUS_PRIMORDIAL_BRUSH_T7', 'ART_V212_SOUL_DREAM_T1', 'ART_V212_SOUL_DREAM_T6', 'ART_V212_XIAN_ZITHER_T1', 'ART_V212_XIAN_ZITHER_T6'],
      crystals: { 'S:CALLIGRAPHY_PAINTING_SAGE': 2, 'S:ZEN_VOID_MIND': 1 }
    },
    god: {
      id: 'god',
      nameTh: 'สำนักเทพบรรพกาล',
      titleTh: 'วิถีเทพบรรพกาลและวิญญาณศักดิ์สิทธิ์',
      descTh: 'สำนักสายพลังศรัทธาและเทพบรรพกาล ร่างเทพทองคำ แสงสุริยัน และปราณสายฟ้าทัณฑ์ ทรงอานุภาพพลังทำลายกว้างขวาง',
      path: 'GOD',
      subs: ['WAR_DEITY', 'MERCY_DEITY', 'SUN_BOW_DEITY', 'OCEAN_SOVEREIGN', 'GOLDEN_ARHAT_STAFF'],
      techs: ['MP_BASE_GOD', 'ART190_GOD_001', 'ART190_GOD_002', 'ART190_GOD_003', 'ART190_GOD_006', 'ART190_GOD_011', 'ART190_GOD_021', 'ART190_GOD_031', 'INNATE_WAR_DEITY_BANNER_SPEAR', 'ART_CROSS_V208_006', 'ART_V212_GOD_JUDGE_T1', 'ART_V212_GOD_JUDGE_T3', 'ART_V212_GOD_JUDGE_T5', 'ART_V212_GOD_SUN_BOW_T1', 'ART_V212_GOD_SUN_BOW_T3', 'ART_V212_GOD_OCEAN_T2', 'ART_V212_GOD_OCEAN_T6'],
      crystals: { 'S:WAR_DEITY': 2, 'S:MERCY_DEITY': 1, 'S:SUN_BOW_DEITY': 1 }
    },
    demon: {
      id: 'demon',
      nameTh: 'สำนักมารสวรรค์',
      titleTh: 'วิถีมารกลืนสวรรค์และโลหิตอมตะ',
      descTh: 'สำนักสายมารและอสูรโลหิต กลืนกินพลังศัตรู รวดเร็วดั่งเงาพราย สังหารฉับพลัน และฟื้นฟูกายาจากโลหิต',
      path: 'DEMON',
      subs: ['HEAVEN_DEVOURING_DEMON', 'SHADOW_ASSASSIN', 'NETHER_GHOST_KING', 'VENOM_GU_SOVEREIGN', 'ASHURA_SLAUGHTER_BLADE'],
      techs: ['MP_BASE_DEMON', 'ART_V112_DEMON_NIGHT_CLOAK_T1', 'ART_DEMON_SHADOW_STRIKE_T1', 'ART_V210_CHAIN_SHADOW_DAGGER', 'ART190_BODY_006', 'ART_V112_DEMON_SILENT_DAGGER_T3', 'ART_CROSS_V208_005', 'ART_V212_DEMON_GHOST_T1', 'ART_V212_DEMON_GHOST_T6', 'ART_V212_DEMON_BLOOD_SPEAR_T1', 'ART_V212_DEMON_BLOOD_SPEAR_T6'],
      crystals: { 'S:HEAVEN_DEVOURING_DEMON': 2, 'S:SHADOW_ASSASSIN': 1, 'S:NETHER_GHOST_KING': 1 }
    },
    mech: {
      id: 'mech',
      nameTh: 'สำนักกลจักรวิญญาณ',
      titleTh: 'วิถีกลจักรเชิดหุ่นและวิญญาณศาสตรา',
      descTh: 'สำนักผู้สร้างหุ่นเชิดกลไก ค่ายกลป้อมปราการ เกราะกลไก และศาสตราบิน บัญชาสมรภูมิด้วยกลศาสตร์และจิตควบคุม',
      path: 'MECH_PUPPET',
      subs: ['HEAVENLY_GOLEM', 'THOUSAND_THREAD_ASSASSIN', 'CELESTIAL_BALLISTA', 'ASTRAL_CLOCKWORK_PRIME', 'SOUL_VESSEL_AVATAR'],
      techs: ['MP_BASE_MECH_PUPPET', 'ART_MECH_PUPPET_001', 'ART_MECH_PUPPET_002', 'ART_MECH_PUPPET_003', 'ART_MECH_PUPPET_004', 'ART_CROSS_V208_001', 'ART_CROSS_V208_007', 'INNATE_THOUSAND_THREAD_SOUL', 'ART_V212_MECH_BALLISTA_T1', 'ART_V212_MECH_ORBITER_T5', 'PASS_V212_ADAPTIVE_ARSENAL_T2'],
      crystals: { 'S:HEAVENLY_GOLEM': 2, 'S:THOUSAND_THREAD_ASSASSIN': 1, 'S:CELESTIAL_BALLISTA': 1 }
    },
    karma: {
      id: 'karma',
      nameTh: 'สำนักกรรมวัฏสวรรค์',
      titleTh: 'วิถีกรรมวัฏและสังสารวัฏ',
      descTh: 'สำนักผู้คุมด้ายชะตากรรม บัญชีกรรมเกิดดับ และปราณวัฏจักรหกภพ สะท้อนดาเมจตามหนี้กรรมและคืนชีพจากเถ้าถ่าน',
      path: 'KARMA_SAMSARA',
      subs: ['SIX_PATHS_WHEEL', 'REVERSED_RETRIBUTION', 'FATE_SEVERING_THREAD', 'LOTUS_MERCY_PURIFIER', 'PAST_LIFE_MIRROR'],
      techs: ['MP_BASE_KARMA_SAMSARA', 'ART_KARMA_SAMSARA_001', 'ART_KARMA_SAMSARA_002', 'ART_KARMA_SAMSARA_003', 'ART_KARMA_SAMSARA_004', 'ART_CROSS_V208_004', 'ART_CROSS_V208_008', 'INNATE_SIX_PATHS_WHEEL', 'ART_V212_KARMA_ASURA_T1', 'ART_V212_KARMA_MIRROR_T1', 'ART_V212_KARMA_MIRROR_T6', 'ART_V212_GOD_JUDGE_T1'],
      crystals: { 'S:SIX_PATHS_WHEEL': 2, 'S:REVERSED_RETRIBUTION': 1, 'S:FATE_SEVERING_THREAD': 1 }
    },
    beast: {
      id: 'beast',
      nameTh: 'สำนักราชันย์อสูร',
      titleTh: 'วิถีราชันย์อสูรและพันธสัญญาวิญญาณ',
      descTh: 'สำนักผู้ทำพันธสัญญาเทพอสูร หลอมรวมสายเลือด ผสานร่างอสูร และบัญชาฝูงสัตว์วิญญาณรบเคียงบ่าเคียงไหล่',
      path: 'BEAST_SOVEREIGN',
      subs: ['MYRIAD_BEAST_PACK', 'PRIMORDIAL_BLOOD_MUTATOR', 'SYMBIOTIC_BEAST_WARRIOR', 'COLOSSUS_SHIELD_TAMER', 'ABYSSAL_DRAGON_TOTEM'],
      techs: ['MP_BASE_BEAST_SOVEREIGN', 'ART_BEAST_SOV_001', 'ART_BEAST_SOV_002', 'ART_BEAST_SOV_003', 'ART_BEAST_SOV_004', 'ART_CROSS_V208_003', 'ART_CROSS_V208_009', 'INNATE_MYRIAD_PACK_COMMAND', 'ART_V212_BEAST_SWARM_T1', 'ART_V212_BEAST_SWARM_T5', 'PASS_V212_ADAPTIVE_ARSENAL_T2'],
      crystals: { 'S:MYRIAD_BEAST_PACK': 2, 'S:PRIMORDIAL_BLOOD_MUTATOR': 1, 'S:SYMBIOTIC_BEAST_WARRIOR': 1 }
    },
    sage: {
      id: 'sage',
      nameTh: 'สำนักปราชญ์โอสถคีตเวทย์',
      titleTh: 'วิถีปราชญ์โอสถและคีตเวทย์หนุนนำ',
      descTh: 'สำนักยอดวิชาเยียวยา สกัดจุดเข็มทอง บรรเลงพิณคลายมาร ปรุงน้ำทิพย์ และกางเกราะค่ายกลเสริมพลังทั่วสำนัก',
      path: 'SAGE_SUPPORT',
      subs: ['GOLDEN_NEEDLE_SAINT', 'CELESTIAL_ZITHER_ENVOY', 'DIVINE_NECTAR_APOTHECARY', 'WAR_BANNER_CHORISTER', 'QIMEN_TALISMAN_PATRON'],
      techs: ['MP_BASE_SAGE_SUPPORT', 'ART_SAGE_SUP_001', 'ART_SAGE_SUP_002', 'ART_SAGE_SUP_003', 'ART_SAGE_SUP_004', 'ART_CROSS_V208_002', 'ART_CROSS_V208_010', 'INNATE_GOLDEN_NEEDLE_PULSE', 'INNATE_CELESTIAL_ZITHER_CHORD', 'ART_V212_SAGE_HARMONY_T1', 'ART_V212_SAGE_SANCTUARY_T2', 'ART_V212_SAGE_APEX_T7', 'ART_V212_XIAN_ZITHER_T1'],
      crystals: { 'S:GOLDEN_NEEDLE_SAINT': 2, 'S:CELESTIAL_ZITHER_ENVOY': 1, 'S:DIVINE_NECTAR_APOTHECARY': 1 }
    },
    artisan: {
      id: 'artisan',
      nameTh: 'สำนักรังสรรค์โอสถและศาสตราเทวะ',
      titleTh: 'วิถีรังสรรค์โอสถและศาสตราเทวะ',
      descTh: 'สำนักปรมาจารย์เตาโอสถและทั่งตีเหล็กสวรรค์ ใช้การปรุงโอสถ การตีศาสตรา และการจารึกอักขระเป็นหัวใจของการบำเพ็ญตบะ',
      path: 'CRAFT_CREATION',
      subs: ['PILL_FURNACE_IMMORTAL', 'HEAVENLY_ANVIL_SMITH', 'SPIRIT_SWORD_ARTIFICER', 'RUNE_ARRAY_ENGRAVER', 'DIVINE_FLAME_SMELTER', 'POISON_VENOM_CAULDRON'],
      techs: ['MP_BASE_CRAFT_CREATION', 'ART_CRAFT_001', 'ART_CRAFT_002', 'ART_CRAFT_003', 'ART_CRAFT_004', 'ART_CRAFT_005', 'ART_CRAFT_006', 'PASS_CRAFT_001', 'ART_CROSS_CRAFT_001', 'ART_CROSS_CRAFT_002', 'PASS_CROSS_CRAFT_004', 'PASS_V212_ADAPTIVE_ARSENAL_T2'],
      crystals: { 'S:PILL_FURNACE_IMMORTAL': 2, 'S:HEAVENLY_ANVIL_SMITH': 1, 'S:SPIRIT_SWORD_ARTIFICER': 1 }
    }
  };

  SECT.FOUNDATION_CURRICULUM = [
    'MP_BASE_XIAN', 'MP_BASE_BODY', 'MP_BASE_GOD', 'MP_BASE_DEMON', 'MP_BASE_HEART_SOUL',
    'MP_BASE_MECH_PUPPET', 'MP_BASE_KARMA_SAMSARA', 'MP_BASE_BEAST_SOVEREIGN', 'MP_BASE_SAGE_SUPPORT', 'MP_BASE_CRAFT_CREATION',
    'ART_V212_XIAN_ZITHER_T1', 'ART_V212_BODY_THUNDER_T1', 'ART_V212_GOD_JUDGE_T1', 'ART_V212_GOD_SUN_BOW_T1',
    'ART_V212_DEMON_GHOST_T1', 'ART_V212_DEMON_BLOOD_SPEAR_T1', 'ART_V212_SOUL_VOID_SPEAR_T1', 'ART_V212_SOUL_DREAM_T1',
    'ART_V212_MECH_BALLISTA_T1', 'ART_V212_KARMA_ASURA_T1', 'ART_V212_KARMA_MIRROR_T1', 'ART_V212_BEAST_SWARM_T1',
    'ART_V212_SAGE_HARMONY_T1', 'PASS_V212_ADAPTIVE_ARSENAL_T2'
  ];

  SECT.ARCHETYPE_WEAPON = {
    sword:   { family: 'SWORD', skill: 'SWORD', starterWeapon: 'MP_SWORD_1', masterWeapon: 'MP_SWORD_2' },
    blade:   { family: 'BLADE', skill: 'BLADE', starterWeapon: 'MP_BLADE_1', masterWeapon: 'MP_BLADE_2' },
    spear:   { family: 'SPEAR', skill: 'SPEAR', starterWeapon: 'MP_SPEAR_1', masterWeapon: 'MP_SPEAR_2' },
    fist:    { family: 'FIST', skill: 'FIST_PALM', starterWeapon: 'MP_FIST_1', masterWeapon: 'MP_FIST_2' },
    alchemy: { family: 'FOCUS', skill: 'FOCUS', starterWeapon: 'MP_FOCUS_1', masterWeapon: 'MP_FOCUS_2' },
    bow:     { family: 'BOW', skill: 'BOW', starterWeapon: 'MP_BOW_1', masterWeapon: 'MP_BOW_2' },
    staff:   { family: 'STAFF', skill: 'STAFF', starterWeapon: 'MP_STAFF_1', masterWeapon: 'MP_STAFF_2' },
    focus:   { family: 'FOCUS', skill: 'FOCUS', starterWeapon: 'MP_FOCUS_1', masterWeapon: 'MP_FOCUS_2' },
    god:     { family: 'SPEAR', skill: 'SPEAR', starterWeapon: 'MP_SPEAR_1', masterWeapon: 'MP_SPEAR_2' },
    demon:   { family: 'BLADE', skill: 'BLADE', starterWeapon: 'MP_BLADE_1', masterWeapon: 'MP_BLADE_2' },
    mech:    { family: 'FOCUS', skill: 'FOCUS', starterWeapon: 'MP_FOCUS_1', masterWeapon: 'MP_FOCUS_2' },
    karma:   { family: 'STAFF', skill: 'STAFF', starterWeapon: 'MP_STAFF_1', masterWeapon: 'MP_STAFF_2' },
    beast:   { family: 'FIST', skill: 'FIST_PALM', starterWeapon: 'MP_FIST_1', masterWeapon: 'MP_FIST_2' },
    sage:    { family: 'FOCUS', skill: 'FOCUS', starterWeapon: 'MP_FOCUS_1', masterWeapon: 'MP_FOCUS_2' },
    artisan: { family: 'FOCUS', skill: 'FOCUS', starterWeapon: 'MP_FOCUS_1', masterWeapon: 'MP_FOCUS_2' }
  };

  SECT.officeState = (W, id) => {
    if (!SECT.POSTS[id]) return { enabled: false, reason: SECT.PLANNED_POSTS[id]?.requires || 'ยังไม่มีระบบรองรับตำแหน่งนี้' };
    if (id === 'disciples') {
      const pop = W.npcs.filter(n => !n.dead && !n.exiled).length;
      return { enabled: pop >= 2, reason: pop < 2 ? 'รอสมาชิกอย่างน้อย 2 คน' : '' };
    }
    const min = id === 'commander' ? 12 : ['provision', 'herbal', 'wildwarden', 'steward'].includes(id) ? 16 : 0;
    const pop = W.npcs.filter(n => !n.dead && !n.exiled).length;
    return { enabled: pop >= min, reason: pop < min ? 'รอสมาชิกอย่างน้อย ' + min + ' คน' : '' };
  };

  SECT.rankOf = npc => SECT.RANKS[npc.rank];
  SECT.title = npc => npc.rank === 6 ? 'เจ้าสำนัก' : npc.rank === 5 ? 'รองเจ้าสำนัก' : npc.post ? SECT.POSTS[npc.post].nameTh : npc.assist ? 'ผู้ช่วย' + SECT.POSTS[npc.assist].nameTh.replace(/^ผู้อาวุโส|^หัวหน้า|^หมอหลวง/, '') : SECT.RANKS[npc.rank].nameTh;

  /* ---------- สไตล์การปกครอง = ฟังก์ชันของตัวตน ---------- */
  function mix(npc, list) { // list: ['path', w] (w<0 = กลับค่า)
    let s = 0, wsum = 0;
    list.forEach(([p, w]) => { const v = HC.eff(npc, p); s += (w >= 0 ? v : 100 - v) * Math.abs(w); wsum += Math.abs(w); });
    return clamp(s / wsum, 0, 100);
  }
  SECT.styleOf = npc => {
    const d = HC.derived(npc);
    const st = {
      openness: mix(npc, [['personality.trustfulness', .3], ['personality.empathy', .2], ['personality.curiosity', .25], ['personality.caution', -.2], ['personality.pride', -.15]]),
      strictness: mix(npc, [['personality.discipline', .3], ['personality.integrity', .15], ['personality.aggression', .2], ['personality.empathy', -.25], ['personality.pride', .1], ['personality.composure', .05]]),
      meritocracy: mix(npc, [['personality.rationality', .3], ['personality.integrity', .3], ['values.familyClan', -.2], ['personality.loyalty', -.05], ['intellect.judgement', .15]]),
      expansion: mix(npc, [['personality.ambition', .3], ['personality.courage', .2], ['values.powerStatus', .25], ['personality.aggression', .1], ['personality.caution', -.2]]),
      generosity: mix(npc, [['personality.empathy', .35], ['values.wealthResource', -.3], ['values.familyClan', .1], ['personality.integrity', .1], ['personality.trustfulness', .15]]),
      secrecy: mix(npc, [['personality.caution', .3], ['personality.trustfulness', -.25], ['personality.pride', .15], ['values.powerStatus', .15], ['personality.curiosity', -.1]]),
      risk: d.riskTolerance
    };
    const raw = {
      martial: HC.eff(npc, 'values.martialPeak') * .6 + HC.eff(npc, 'personality.aggression') * .2 + HC.eff(npc, 'interests.combat') * .2,
      craft: HC.eff(npc, 'values.knowledgeCraft') * .45 + HC.eff(npc, 'personality.creativity') * .2 + (HC.eff(npc, 'interests.alchemy') + HC.eff(npc, 'interests.forging')) * .175,
      scholar: HC.eff(npc, 'personality.curiosity') * .35 + HC.eff(npc, 'personality.rationality') * .25 + HC.eff(npc, 'interests.scholarship') * .4,
      commerce: HC.eff(npc, 'values.wealthResource') * .5 + HC.eff(npc, 'aptitudes.socialCommerce') * .25 + HC.eff(npc, 'interests.trade') * .25,
      faith: HC.eff(npc, 'values.honorLegacy') * .35 + HC.eff(npc, 'values.sectDuty') * .35 + HC.eff(npc, 'interests.worship') * .3
    };
    let tot = 0; const f = {};
    Object.keys(raw).forEach(k => { f[k] = Math.pow(Math.max(5, raw[k]) / 50, 3); tot += f[k]; });
    Object.keys(f).forEach(k => f[k] /= tot);
    st.focus = f;
    return st;
  };
  SECT.initPolicy = W => {
    const m = W.byId[W.sect.masterId]; const t = SECT.styleOf(m);
    return JSON.parse(JSON.stringify(t));
  };
  SECT.targetPolicy = W => {
    const m = W.byId[W.sect.masterId], dp = W.byId[W.sect.deputyId];
    const els = SECT.POST_IDS.map(p => W.byId[W.sect.posts[p]]).filter(Boolean);
    const sm = SECT.styleOf(m), sd = dp ? SECT.styleOf(dp) : sm;
    const se = els.map(SECT.styleOf);
    const out = { focus: {} };
    ['openness', 'strictness', 'meritocracy', 'expansion', 'generosity', 'secrecy', 'risk'].forEach(k => {
      const e = se.length ? se.reduce((s, x) => s + x[k], 0) / se.length : sm[k];
      out[k] = sm[k] * 0.78 + sd[k] * 0.14 + e * 0.08;
    });
    Object.keys(sm.focus).forEach(k => { const e = se.length ? se.reduce((s, x) => s + x.focus[k], 0) / se.length : sm.focus[k]; out.focus[k] = sm.focus[k] * 0.78 + (dp ? sd.focus[k] : sm.focus[k]) * 0.14 + e * 0.08; });
    return out;
  };
  SECT.policyLabel = (k, v) => {
    const t = v >= 72 ? 'สูงมาก' : v >= 58 ? 'สูง' : v >= 42 ? 'กลาง' : v >= 28 ? 'ต่ำ' : 'ต่ำมาก';
    return t;
  };
  SECT.POLICY_TH = { openness: 'เปิดรับคนนอก', strictness: 'เข้มงวดกฎ', meritocracy: 'ยึดความสามารถ', expansion: 'ขยายอิทธิพล', generosity: 'ใจกว้างแจกจ่าย', secrecy: 'หวงวิชา', risk: 'กล้าเสี่ยง' };
  SECT.FOCUS_TH = { martial: 'ยุทธ์', craft: 'หัตถศิลป์', scholar: 'ปราชญ์', commerce: 'ค้าขาย', faith: 'ศรัทธา-สืบทอด' };

  /* ---------- ตำแหน่ง ---------- */
  SECT.relevance = (post, n) => {
    const e = p => HC.eff(n, p), sk = n.h.skills;
    const martial = Math.max(sk.SWORD || 0, sk.BLADE || 0, sk.SPEAR || 0, sk.FIST_PALM || 0, sk.BOW || 0, sk.STAFF || 0, sk.FOCUS || 0, sk.BODY_REFINING || 0);
    const stage = CULT.equivalentStage(n);
    switch (post) {
      case 'commander': return e('social.leadership') * .3 + e('intellect.judgement') * .25 + e('personality.courage') * .2 + e('personality.loyalty') * .15 + stage * 4;
      case 'provision': return (sk.cooking || 0) * .35 + e('intellect.planning') * .25 + e('intellect.numeracy') * .15 + e('personality.discipline') * .25;
      case 'herbal': return (sk.herbalism || 0) * .4 + e('interests.herbs') * .25 + e('intellect.planning') * .2 + e('personality.caution') * .15;
      case 'wildwarden': return (sk.survival || 0) * .3 + e('intellect.perceptiveness') * .25 + e('intellect.judgement') * .25 + e('personality.courage') * .2;
      case 'steward': return (sk.administration || 0) * .3 + e('interests.building') * .25 + e('intellect.planning') * .3 + e('personality.integrity') * .15;
      case 'martial': return martial * .35 + e('aptitudes.combat') * .2 + e('social.teaching') * .2 + stage * 6 + e('personality.discipline') * .1;
      case 'alchemy': return sk.ALCHEMY * .45 + e('aptitudes.crafting') * .2 + e('intellect.reasoning') * .1 + e('interests.alchemy') * .1 + stage * 3;
      case 'forge': return sk.FORGING * .4 + (sk.ARRAY + sk.TALISMAN) * .1 + e('aptitudes.crafting') * .2 + e('physiology.dexterity') * .1 + stage * 3;
      case 'scripture': return sk.SCRIPTURE * .35 + e('intellect.comprehension') * .25 + e('intellect.memory') * .15 + e('values.knowledgeCraft') * .1 + stage * 3;
      case 'discipline': return e('personality.integrity') * .25 + e('personality.discipline') * .2 + e('social.intimidation') * .15 + e('intellect.perceptiveness') * .15 + martial * .1 + stage * 4 + e('personality.empathy') * -.05 + 5;
      case 'treasury': return e('intellect.numeracy') * .25 + sk.trading * .2 + sk.administration * .25 + e('personality.integrity') * .2 + e('personality.caution') * .1;
      case 'mission': return e('intellect.planning') * .25 + e('social.leadership') * .2 + sk.survival * .15 + sk.diplomacy * .1 + e('intellect.judgement') * .2 + stage * 3;
      case 'guard': return martial * .25 + e('intellect.perceptiveness') * .2 + e('social.leadership') * .15 + e('personality.courage') * .2 + stage * 6;
      case 'registry': return e('intellect.judgement') * .25 + e('intellect.readPeople') * .25 + sk.administration * .2 + e('personality.integrity') * .15 + e('personality.empathy') * .1 + stage * 2;
      case 'healer': return sk.MEDICINE * .45 + e('personality.empathy') * .2 + sk.ALCHEMY * .1 + e('aptitudes.crafting') * .1 + e('affinities.MEDICINE') * .1;
      case 'disciples': {
        const cultPower = (g.CULT && g.CULT.power) ? g.CULT.power(n) : 0;
        const eqStage = (g.CULT && g.CULT.equivalentStage) ? g.CULT.equivalentStage(n) : (n.cult ? n.cult.stage : 0);
        return eqStage * 7 + (cultPower / 50) + e('personality.loyalty') * 0.25 + e('personality.integrity') * 0.20 + e('social.leadership') * 0.22 + e('values.sectDuty') * 0.20 + (n.merit || 0) * 0.05 - Math.max(0, (n.h.state.heartDemon || 0) - 20) * 0.25;
      }
    }
    return 0;
  };
  SECT.holder = (W, post) => { const id = W.sect.posts[post]; return id ? W.byId[id] : null; };
  SECT.alive = n => n && !n.dead;
  SECT.isOfficerAvailable = (W, n) => Boolean(n && !n.dead && !n.exiled && !n.away && !n.sealed && !n.sealedBt && !(n.jail > W.t) && !(n.punished > W.t));

  const GOVERNANCE_ROLES = {
    treasury: { primary: 'administration', secondary: 'trading', nameTh: 'จัดบัญชีและลดรายจ่าย' },
    steward: { primary: 'construction', secondary: 'administration', nameTh: 'กำกับการก่อสร้าง' },
    mission: { primary: 'trading', secondary: 'survival', nameTh: 'วางแผนขนส่งและเสบียง' },
    provision: { primary: 'administration', secondary: 'cooking', nameTh: 'รักษาคลังเสบียง' }
  };
  // Inspection must never hydrate state, practice skills, cache, or advance RNG.
  SECT.governanceSummary = W => {
    const contributors = {};
    const S = W && W.sect;
    if (!S || !W.byId || !Array.isArray(W.npcs)) return { upkeepReduction: 0, constructionSpeedBonus: 0, logisticsEfficiency: 0, contributors };
    const read = (n, key) => Number.isFinite(n.h && n.h.skills && n.h.skills[key]) ? clamp(n.h.skills[key], 0, 100) : 0;
    const available = n => SECT.isOfficerAvailable(W, n) && W.npcs.includes(n);
    Object.keys(GOVERNANCE_ROLES).forEach(role => {
      const cfg = GOVERNANCE_ROLES[role], holder = W.byId[(S.posts || {})[role]];
      const delegation = (S.delegations || {})[role];
      const delegate = delegation && delegation.holderId === (holder && holder.id) && delegation.until > W.t && !available(holder) ? W.byId[delegation.delegateId] : null;
      const candidates = [available(holder) ? holder : delegate, W.byId[S.masterId], W.byId[S.deputyId]];
      let best = null;
      candidates.forEach(n => {
        if (!available(n)) return;
        const primary = read(n, cfg.primary), secondary = read(n, cfg.secondary);
        if (primary < 25) return;
        const path = n.cult && n.cult.path;
        const sub = path === 'STRATEGY_GOVERNANCE' ? CULT.subInfo(path, n.cult.sub) : null;
        const specialty = sub && sub.governanceRole;
        const matches = specialty === role || (specialty === 'logistics' && (role === 'mission' || role === 'provision')) || (specialty === 'steward' && role === 'treasury');
        const specialist = path === 'STRATEGY_GOVERNANCE' ? 1.05 + (matches ? 0.10 : 0) : 1;
        const score = clamp((primary * 0.7 + secondary * 0.3) / 100 * specialist, 0, 1);
        if (!best || score > best.score) best = { npcId: n.id, nameTh: cfg.nameTh, primarySkill: cfg.primary, secondarySkill: cfg.secondary, specialty: specialty || null, score };
      });
      if (best) contributors[role] = best;
    });
    const score = role => contributors[role] ? contributors[role].score : 0;
    return {
      upkeepReduction: +(score('treasury') * 0.08).toFixed(4),
      constructionSpeedBonus: +(score('steward') * 0.12).toFixed(4),
      logisticsEfficiency: +(Math.max(score('mission'), score('provision')) * 0.20).toFixed(4),
      contributors
    };
  };

  // Called only after a real authorized office duty; timestamps survive save/load.
  SECT.governancePractice = (W, n, role) => {
    const cfg = GOVERNANCE_ROLES[role];
    if (!cfg || !W || !W.sect || !n || !SECT.isOfficerAvailable(W, n) || !W.npcs.includes(n) || !g.MARTIAL || !g.MARTIAL.skillPractice) return false;
    const S = W.sect, delegation = (S.delegations || {})[role];
    const delegated = delegation && delegation.delegateId === n.id && delegation.until > W.t && delegation.holderId === (S.posts || {})[role] && !SECT.isOfficerAvailable(W, W.byId[delegation.holderId]);
    const appointed = (S.posts || {})[role] === n.id || (role === 'master' && S.masterId === n.id) || (role === 'deputy' && S.deputyId === n.id);
    if (!appointed && !delegated) return false;
    if (Number.isFinite(n.governancePracticeAt) && W.t - n.governancePracticeAt < 120) return false;
    g.MARTIAL.skillPractice(n, cfg.primary, 0.35, 1.05);
    g.MARTIAL.skillPractice(n, cfg.secondary, 0.15, 1.0);
    n.governancePracticeAt = W.t;
    return true;
  };

  SECT.appointScore = (W, post, n, by) => {
    const pol = W.sect.policy, rel = by ? SECT.relationScore(by, n) : 0;
    const flat = (by && g.COG && g.COG.flatteryBonus) ? g.COG.flatteryBonus(by, n) : 0;
    const merit = SECT.relevance(post, n) + (n.rank >= 3 ? 8 : 0) + (n.merit || 0) * 0.03;
    const meritK = 0.35 + pol.meritocracy / 100 * 0.65;
    return merit * meritK + (rel + flat * 1.2) * (1 - meritK) * 0.55 + (CULT.equivalentStage(n) * 2) - (n.h.state.heartDemon > 40 ? 6 : 0);
  };
  SECT.relationScore = (a, b) => { const r = a.h.mind.relations[b.id]; return r ? r.a * 0.6 + r.t * 0.2 + r.r * 0.2 : 0; };
  SECT.eligible = (W, post, n) => {
    if (!SECT.officeState(W, post).enabled) return false;
    if (n.dead || n.away || n.sealed || n.sealedBt || (n.jail > W.t) || (n.punished > W.t) || n.exiled) return false;
    if (n.id === W.sect.masterId || n.id === W.sect.deputyId) return false;
    if (post === 'disciples') {
      return n.rank >= 1 && n.rank <= 4 && (n.cult ? n.cult.stage >= 1 : n.rank >= 2);
    }
    const small = W.npcs.length < 14;
    return n.rank >= (small ? 1 : 2) && !n.post && (n.cult ? CULT.equivalentStage(n) >= (small ? 1 : 2) : n.rank >= 3);
  };
  SECT.appoint = (W, post, n, why) => {
    if (!SECT.officeState(W, post).enabled) return false;
    const old = SECT.holder(W, post); if (old && old.id === n.id) return;
    if (old) {
      old.post = null;
      if (old.rank === 4 && post !== 'disciples') old.rank = 3;
    }
    n.post = post; n.assist = null;
    if (post === 'disciples') {
      if (n.rank < 3) n.rank = 3;
      W.sect.successorId = n.id;
    } else {
      if (n.rank < 4) n.rank = 4;
    }
    W.sect.posts[post] = n.id; n.sat = Math.min(100, (n.sat || 60) + 12);
    HC.experience(n, 'promoted', 1);
    SECT.reassignBed(W, n);
    W.log('appoint', n.h.name.given + ' ได้รับตำแหน่ง' + SECT.POSTS[post].nameTh + (why ? ' — ' + why : ''), [n.id]);
    SECT.resentOthers(W, post, n);
  };
  SECT.dismiss = (W, post, why) => {
    const n = SECT.holder(W, post); if (!n) return;
    n.post = null;
    if (post === 'disciples') {
      if (W.sect.successorId === n.id) W.sect.successorId = null;
    } else {
      if (n.rank === 4) n.rank = 3;
    }
    W.sect.posts[post] = null;
    n.sat = Math.max(0, (n.sat || 60) - 18); HC.experience(n, 'punished_fair', 0.6);
    W.log('dismiss', n.h.name.given + ' พ้นจากตำแหน่ง' + SECT.POSTS[post].nameTh + (why ? ' — ' + why : ''), [n.id]);
  };

  SECT.electSuccessor = (W, opts) => {
    opts = opts || {};
    const S = W.sect;
    const master = S.masterId ? W.byId[S.masterId] : null;
    const deputy = S.deputyId ? W.byId[S.deputyId] : null;

    // 1. Determine Voters
    // Sect Master (weight 4.0), Deputy (2.5), Elders with office (1.5), Elders without office (1.0)
    let voters = [];
    if (master && !master.dead && !master.exiled && !master.away) {
      voters.push({ npc: master, weight: 4.0, roleTh: 'เจ้าสำนัก' });
    }
    if (deputy && !deputy.dead && !deputy.exiled && !deputy.away) {
      voters.push({ npc: deputy, weight: 2.5, roleTh: 'รองเจ้าสำนัก' });
    }
    W.npcs.forEach(n => {
      if (n.dead || n.exiled || n.away || n.id === S.masterId || n.id === S.deputyId) return;
      if (n.rank >= 4) {
        const isOfficeHolder = Boolean(n.post && n.post !== 'disciples');
        voters.push({
          npc: n,
          weight: isOfficeHolder ? 1.5 : 1.0,
          roleTh: isOfficeHolder ? ('ผู้อาวุโส (' + SECT.POSTS[n.post].nameTh + ')') : 'ผู้อาวุโส'
        });
      }
    });

    // Fallback if no master and no elders: surviving disciples vote
    if (!voters.length) {
      W.npcs.forEach(n => {
        if (!n.dead && !n.exiled && !n.away && n.rank >= 1) {
          voters.push({ npc: n, weight: 1.0, roleTh: 'ศิษย์สำนัก' });
        }
      });
    }

    if (!voters.length) {
      return { ok: false, reason: 'ไม่มีผู้มีสิทธิ์โหวตในสำนัก' };
    }

    // 2. Gather Candidates
    let cands = W.npcs.filter(n => SECT.eligible(W, 'disciples', n));
    if (!cands.length) {
      cands = W.npcs.filter(n => !n.dead && !n.exiled && !n.away && n.id !== S.masterId && n.id !== S.deputyId && n.rank >= 1 && n.rank <= 4);
    }
    if (!cands.length) {
      return { ok: false, reason: 'ไม่มีศิษย์ที่ผ่านเกณฑ์ได้รับการเสนอชื่อ' };
    }

    // 3. Tally Weighted Votes
    const tallies = cands.map(cand => {
      let weightedScore = 0;
      let voteDetails = [];
      voters.forEach(v => {
        const voterNpc = v.npc;
        let score = SECT.appointScore(W, 'disciples', cand, voterNpc);
        if (cand.mentor === voterNpc.id || (voterNpc.h?.life?.family?.disciples && voterNpc.h.life.family.disciples.includes(cand.id))) {
          score += 15;
        }
        const rel = voterNpc.h?.mind?.relations && voterNpc.h.mind.relations[cand.id];
        if (rel) {
          score += (rel.a * 0.3 + rel.t * 0.2);
        }
        weightedScore += score * v.weight;
        voteDetails.push({ voterId: voterNpc.id, voterName: voterNpc.h.name.given, roleTh: v.roleTh, weight: v.weight, score });
      });
      return {
        candidate: cand,
        weightedScore,
        avgScore: weightedScore / voters.reduce((acc, x) => acc + x.weight, 0),
        voteDetails
      };
    });

    tallies.sort((a, b) => b.weightedScore - a.weightedScore);
    const winnerData = tallies[0];
    const winner = winnerData.candidate;

    // 4. Appoint winner
    SECT.appoint(W, 'disciples', winner, 'ผ่านการคัดเลือกและโหวตโดยเจ้าสำนักและสภาผู้อาวุโส (คะแนนถ่วงน้ำหนัก ' + Math.round(winnerData.weightedScore) + ')');

    W.sect.successorElection = {
      day: W.day,
      winnerId: winner.id,
      winnerName: winner.h.name.given,
      tallies: tallies.slice(0, 3).map(t => ({ id: t.candidate.id, name: t.candidate.h.name.given, score: Math.round(t.weightedScore) }))
    };

    W.log('politics', 'สภาสำนักและเจ้าสำนักจัดประชุมคัดเลือกศิษย์สืบทอด: มีมติเลือก ' + winner.h.name.given + ' เป็นศิษย์สืบทอดคนใหม่', [winner.id].concat(voters.map(v => v.npc.id)));

    return { ok: true, winner, tallies };
  };
  // คนที่อยากได้ตำแหน่งแต่ไม่ได้ จะน้อยใจ (ขึ้นกับความทะเยอทะยานและความสามารถ) → ปมความขัดแย้งทางการเมือง
  SECT.resentOthers = (W, post, winner) => {
    W.npcs.forEach(n => {
      if (n.dead || n.id === winner.id || n.rank < 3 || n.post) return;
      const want = (HC.eff(n, 'personality.ambition') + HC.eff(n, 'values.powerStatus')) / 2;
      const rel = SECT.relevance(post, n), wrel = SECT.relevance(post, winner);
      if (want > 55 && rel > wrel - 6) {
        n.sat = Math.max(0, (n.sat || 60) - (want - 50) * 0.18);
        const r = SECT.rel(n, winner.id); r.v = Math.min(100, r.v + 6); r.a -= 3;
        if (rel > wrel + 4) W.log('politics', n.h.name.given + ' ไม่พอใจที่ ' + winner.h.name.given + ' ได้ตำแหน่ง' + SECT.POSTS[post].nameTh + ' ทั้งที่ตนเก่งกว่า', [n.id, winner.id]);
      }
    });
  };
  SECT.rel = (a, bid) => a.h.mind.relations[bid] || (a.h.mind.relations[bid] = { a: 0, t: 40, r: 30, l: 0, v: 0, n: 0, last: 0, bond: '' });

  SECT.reassignBed = (W, n) => { n.bed = null; };

  SECT.setRank = (W, n, rank, why) => {
    const old = n.rank; if (old === rank) return;
    n.rank = rank; n.sat = Math.min(100, (n.sat || 60) + (rank > old ? 10 : -15));
    W.log(rank > old ? 'promote' : 'demote', n.h.name.given + (rank > old ? ' เลื่อนเป็น' : ' ถูกลดเป็น') + SECT.RANKS[rank].nameTh + (why ? ' — ' + why : ''), [n.id]);
    HC.experience(n, rank > old ? 'promoted' : 'punished_fair', 0.8);
    if (rank > old) W.fame(2 + rank);
    n.bed = null;
  };

  /* ---------- ความพึงพอใจต่อสำนัก ---------- */
  SECT.satTarget = (W, n) => {
    const pol = W.sect.policy, e = p => HC.eff(n, p);
    let s = 55;
    s += (pol.generosity - 50) * (e('values.wealthResource') / 100 - 0.2) * 0.35;
    s -= Math.max(0, pol.strictness - 50) * (e('values.freedom') / 100) * 0.55;
    s += Math.max(0, pol.strictness - 50) * (e('personality.discipline') - 50) / 100 * 0.25;
    s += (pol.meritocracy - 50) * (e('personality.ambition') - 50) / 100 * 0.3;
    s -= Math.max(0, pol.secrecy - 50) * (e('personality.curiosity') - 50) / 100 * 0.3;
    s += (e('values.sectDuty') - 50) * 0.15 + (e('personality.loyalty') - 50) * 0.18;
    s += (n.h.state.mood) * 0.12;
    s += (W.sect.stipendOk ? 3 : -10);
    if (n.rank >= 3) s += 3;
    s -= Math.max(0, (n.h.state.stress - 50)) * 0.2;
    s -= (n.grief || 0);
    return clamp(s, 5, 95);
  };

  /* ---------- เบี้ยหวัดรายเดือน ---------- */
  SECT.paySalaries = W => {
    const gen = (0.45 + W.sect.policy.generosity / 100 * 1.1) * 0.4;
    let total = 0; const list = [];
    W.npcs.forEach(n => { if (n.dead || n.exiled) return; const amt = Math.round(SECT.RANKS[n.rank].stipend * gen * (n.post ? 1.2 : 1)); list.push([n, amt]); total += amt; });
    const ok = W.sect.stones >= total;
    const k = ok ? 1 : Math.max(0, W.sect.stones) / Math.max(1, total);
    list.forEach(([n, amt]) => { const pay = Math.round(amt * k); n.inv.stones += pay; });
    const paid = Math.round(total * k);
    W.sect.stones -= paid; W.sect.ledger.push({ t: W.t, amt: -paid, why: 'เบี้ยหวัดรายเดือน' }); if (W._tally) W._tally('-เบี้ยหวัดรายเดือน', paid);
    W.sect.stipendOk = ok;
    if (!ok) W.log('finance', 'คลังไม่พอจ่ายเบี้ยหวัดเต็ม จ่ายได้ ' + Math.round(k * 100) + '%', []);
    W.sect.lastPayroll = paid;
    return paid;
  };

  /* ---------- สภาประจำวัน: เจ้าสำนักตัดสินใจตามตัวตน ---------- */
  SECT.daily = W => {
    SECT.decayFacilityDemand(W);
    const S = W.sect, m = W.byId[S.masterId];
    if (!m || m.dead) { SECT.succession(W, 'เจ้าสำนักว่าง'); return; }
    // Ensure applicant queue is always processed if registrar or deputy is available even during master seclusion
    if (S.sealedUntil && W.t < S.sealedUntil) {
      SECT.processApplicants(W, m);
      SECT.runByDeputy(W);
      return;
    }
    // 1) ตำแหน่งว่าง
    SECT.POST_IDS.forEach(post => {
      const h = SECT.holder(W, post);
      if (h && (h.dead || h.exiled)) { S.posts[post] = null; }
    });
    const vacant = SECT.POST_IDS.filter(p => SECT.officeState(W, p).enabled && !SECT.holder(W, p));
    if (vacant.length && W.rng.chance(0.5)) {
      const post = (vacant.includes('registry') && W.npcs.length >= 6 && W.rng.chance(0.6)) ? 'registry' : W.rng.pick(vacant);
      const cands = W.npcs.filter(n => SECT.eligible(W, post, n));
      if (cands.length) {
        cands.sort((a, b) => SECT.appointScore(W, post, b, m) - SECT.appointScore(W, post, a, m));
        const win = cands[0], sc = SECT.appointScore(W, post, win, m);
        if (sc > (W.npcs.length < 14 ? 13 : 28)) {
          const fav = SECT.relationScore(m, win);
          SECT.appoint(W, post, win, fav > 30 && S.policy.meritocracy < 45 ? 'เจ้าสำนักไว้ใจเป็นพิเศษ' : 'ความสามารถสูงสุดในสำนัก');
        }
      }
    }
    // 2) รองเจ้าสำนัก
    if (!S.deputyId || !W.byId[S.deputyId] || W.byId[S.deputyId].dead || W.byId[S.deputyId].exiled) {
      S.deputyId = null;
      const cands = W.npcs.filter(n => !n.dead && !n.away && !n.exiled && n.rank >= 3 && n.id !== m.id && n.cult && (CULT.effectiveTechStage ? CULT.effectiveTechStage(n) : n.cult.stage) >= 3);
      if (cands.length && W.rng.chance(0.5)) {
        cands.sort((a, b) => (SECT.relationScore(m, b) * (1 - S.policy.meritocracy / 100) + (CULT.equivalentStage(b) * 8 + SECT.relevance('mission', b) * .3) * (S.policy.meritocracy / 100 + .3)) - (SECT.relationScore(m, a) * (1 - S.policy.meritocracy / 100) + (CULT.equivalentStage(a) * 8 + SECT.relevance('mission', a) * .3) * (S.policy.meritocracy / 100 + .3)));
        const d = cands[0]; if (d.post) { S.posts[d.post] = null; d.post = null; }
        d.rank = 5; S.deputyId = d.id; d.sat = Math.min(100, (d.sat || 60) + 15); HC.experience(d, 'promoted', 1.2);
        W.log('appoint', d.h.name.given + ' ได้เป็นรองเจ้าสำนัก', [d.id]);
      }
    }
    // 3) เลื่อนขั้นศิษย์ (เจ้าสำนักเลือกตามนโยบาย)
    if (W.day % 3 === 0) SECT.reviewPromotions(W);
    SECT.processApplicants(W, m);
    // 4) การตัดสินใจเชิงนโยบายของเจ้าสำนัก
    SECT.masterDecision(W, m);
    // 5) หัวหน้าหอสั่งงานของตน
    SECT.hallHeads(W);
  };

  /* ---------- พิจารณาผู้สมัคร: ประเมินจากความสามารถปัจจุบันที่สังเกตได้ (CA) เท่านั้น ไม่รั่วไหล PA ---------- */
  SECT.examineApplicant = (W, who, n) => {
    const ca = SECT.observableCapability(W, n);
    const e = p => who ? HC.eff(who, p) : 50;
    const eye = (e('intellect.readPeople') * 0.45 + e('intellect.judgement') * 0.35 + (who && who.h && who.h.skills ? (who.h.skills.administration || 0) * 0.2 : 0));
    const noiseStd = Math.max(1.5, (100 - eye) / 9 + 1.5);
    const noise = (W && W.rng && W.rng.gauss) ? W.rng.gauss(0, noiseStd) : 0;
    let bias = 0;
    const cls = (n && n.h && n.h.origin && n.h.origin.cls) || '';
    bias += (e('personality.empathy') - 50) / 12 * (cls === 'ยาจก' || /ยาก|ทาส|กำพร้า/.test(cls) ? 1 : 0.25);
    bias -= (e('personality.pride') - 50) / 14 * (ca.caScore < 44 ? 1 : 0);
    if (ca.demeanorScore >= 58 && e('personality.discipline') >= 55) bias += 2.2;
    const deterministicScore = Math.round((ca.caScore + bias) * 100) / 100;
    const score = ca.caScore + noise + bias;
    return {
      score,
      totalScore: deterministicScore,
      caScore: ca.caScore,
      ca,
      eye: Math.round(eye),
      roleFit: ca.roleFit,
      bestRoleTh: ca.bestRoleTh,
      summaryTh: ca.summaryTh
    };
  };

  SECT.appraise = (W, who, n) => {
    return SECT.examineApplicant(W, who, n).score;
  };

  SECT.sanitizeQueue = W => {
    if (!W || !W.sect) return [];
    if (!Array.isArray(W.sect.queue)) W.sect.queue = [];
    const seen = new Set();
    const cleaned = [];
    for (const a of W.sect.queue) {
      if (!a || typeof a !== 'object' || !a.id || !a.h || a.dead || a.exiled) continue;
      if (W.byId && W.byId[a.id]) continue; // already registered member
      if (seen.has(a.id)) continue;
      seen.add(a.id);
      if (!Number.isFinite(a.joinDay)) a.joinDay = W.day || 1;
      cleaned.push(a);
    }
    if (cleaned.length > SECT.MAX_QUEUE) cleaned.length = SECT.MAX_QUEUE;
    W.sect.queue = cleaned;
    return cleaned;
  };

  SECT.processApplicants = (W, m) => {
    if (!W || !W.sect) return;
    const S = W.sect;
    const stats = S.recruitmentStats || (S.recruitmentStats = { generated: 0, driveGenerated: 0, normalGenerated: 0, admitted: 0, rejected: 0, deferred: 0, expired: 0, tiers: {}, tierCounts: {} }); stats.tiers = stats.tiers || {}; stats.tierCounts = stats.tiers;
    const q = SECT.sanitizeQueue(W);
    if (!q.length) return;

    // Expire applicants who have waited > 14 days first
    for (let i = q.length - 1; i >= 0; i--) {
      if (W.day - (q[i].joinDay || 0) > 14) {
        const expNpc = q[i];
        q.splice(i, 1);
        stats.expired = (stats.expired || 0) + 1;
        W.log('recruit', expNpc.h.name.given + ' รอการพิจารณาเกินกำหนดและเดินทางกลับไป', []);
      }
    }
    if (!q.length) return;

    // Determine available reviewing officer: registry elder -> master -> deputy
    const reg = SECT.holder(W, 'registry');
    const master = m || W.byId[S.masterId];
    const dep = W.byId[S.deputyId];
    const who = SECT.isOfficerAvailable(W, reg) ? reg : SECT.isOfficerAvailable(W, master) ? master : SECT.isOfficerAvailable(W, dep) ? dep : null;
    if (!who) return;

    let pop = SECT.memberOccupancy(W);
    const cap = SECT.housingCapacity(W);
    if (pop >= cap) return; // Keep queued applicants waiting when beds are full

    const food = (ECO.count(W, 'meal') + ECO.count(W, 'grain') * 3) / Math.max(1, pop + 1);
    const pol = S.policy || { meritocracy: 50, openness: 50, strictness: 50 };
    let handled = 0;

    for (let i = 0; i < q.length && handled < SECT.MAX_QUEUE && pop < cap;) {
      const a = q[i];
      handled++;
      const thr = 48 + (pol.meritocracy - 50) * 0.22 - (pol.openness - 50) * 0.28 - (pop < 12 ? 6 : pop < 24 ? 3 : 0) + (food < 4 ? 14 : 0) + (pol.strictness - 50) * 0.08;
      const score = SECT.appraise(W, who, a);
      const ca = SECT.observableCapability(W, a);
      const ok = W.rng.next() < 1 / (1 + Math.exp(-(score - thr) / 6)) && pop < cap;
      const waited = W.day - (a.joinDay || W.day);

      if (!ok && waited < 6 && pop < cap && W.rng.chance(0.42)) {
        stats.deferred = (stats.deferred || 0) + 1;
        i++;
        continue; // ขอดูตัวอีกสักพัก
      }
      q.splice(i, 1);
      if (ok && pop < cap) {
        g.SIM.register(W, a);
        pop = SECT.memberOccupancy(W);
        a.joinDay = W.day;
        a.sat = 72;
        a.rank = 0;
        a.merit = 0;
        a.x = MAP.EXIT.x + .5 + W.rng.next();
        a.y = MAP.EXIT.y + .5;
        a.px = a.x;
        a.py = a.y;
        a.travel = { to: 'home' };
        a.path = null;
        stats.admitted = (stats.admitted || 0) + 1;
        const roleLabel = who === master ? 'เจ้าสำนัก ' : who === dep ? 'รองเจ้าสำนัก ' : SECT.POSTS.registry.nameTh + ' ';
        W.log('recruit', a.h.name.given + ' ผ่านการพิจารณาของ' + roleLabel + who.h.name.given + ' เข้าเป็นผู้ฝึกหัด (' + a.h.origin.cls + ' จาก' + a.h.origin.region + ' · ' + ca.bestRoleTh + ')', [a.id, who.id]);
        who.merit = (who.merit || 0) + 1.5;
      } else {
        stats.rejected = (stats.rejected || 0) + 1;
        W.log('recruit', who.h.name.given + ' ไม่รับ ' + a.h.name.given + ' เข้าสำนัก' + (pop >= cap ? ' (ที่พักเต็ม)' : ' (พื้นฐานยังไม่พร้อม)'), [who.id]);
        W.fame(-0.05);
      }
    }
  };

  SECT.runByDeputy = W => { const d = W.byId[W.sect.deputyId]; if (d && !d.dead) SECT.hallHeads(W); };

  SECT.reviewPromotions = W => {
    const S = W.sect, m = W.byId[S.masterId], mer = S.policy.meritocracy / 100;
    const cnt = r => W.npcs.filter(n => !n.dead && !n.exiled && n.rank === r).length;
    const innerCap = W.map && W.map.byId && W.map.byId.dorm_inner ? Math.max(18, W.map.byId.dorm_inner.stations.length) : 18;
    const coreCap = W.map && W.map.byId && W.map.byId.dorm_core ? Math.max(8, W.map.byId.dorm_core.stations.length) : 8;
    const cap = { inner: innerCap, core: coreCap };
    const cands = W.npcs.filter(n => !n.dead && !n.away && !n.exiled && n.rank <= 2).map(n => {
      const stage = n.cult ? (CULT.effectiveTechStage ? CULT.effectiveTechStage(n) : n.cult.stage) : 0;
      const need = n.rank === 0 ? 1 : n.rank === 1 ? 2 : 3;
      const days = W.day - (n.joinDay || 0);
      const can = n.rank === 0 ? days >= 20 && (stage >= 1 || days >= 60) : stage >= need && days >= 40 + n.rank * 60 && n.merit >= (n.rank === 1 ? 60 : 160);
      const favor = m ? SECT.relationScore(m, n) : 0;
      const score = can ? (stage * 10 + n.merit * 0.1) * (0.4 + mer * 0.6) + favor * (1 - mer) * 0.5 : -999;
      return { n, can, score };
    }).filter(x => x.can).sort((a, b) => b.score - a.score);
    for (const x of cands.slice(0, 2)) {
      const n = x.n;
      if (n.rank === 1 && cnt(2) >= cap.inner) continue;
      if (n.rank === 2 && cnt(3) >= cap.core) continue;
      SECT.setRank(W, n, n.rank + 1, n.rank === 0 ? 'ผ่านการทดลอง' : 'ผลงานและตบะถึงเกณฑ์');
    }
  };

  /* ---------- การตัดสินใจเชิงนโยบายของเจ้าสำนัก ---------- */
  SECT.masterDecision = (W, m) => {
    const S = W.sect, e = p => HC.eff(m, p), pol = S.policy;
    S.cd = S.cd || {};
    const opts = [];
    const cd = k => (S.cd[k] || 0) > W.day;
    const pop = SECT.memberOccupancy(W);
    const bedCap = SECT.housingCapacity(W);
    // งานเลี้ยง
    if (!cd('banquet')) opts.push({ k: 'banquet', u: (e('interests.socializing') + e('values.familyClan') + e('personality.empathy')) / 300 + (50 - W.avgMood) / 150 + (S.stones > 1500 ? .1 : -.3), run: () => SECT.banquet(W, m) });
    // ประลองยุทธ์
    if (!cd('tournament')) opts.push({ k: 'tournament', u: (e('values.martialPeak') + e('interests.combat') + e('values.powerStatus')) / 300 + pol.focus.martial * .3 - .1, run: () => SECT.tournament(W, m) });
    // ปิดด่าน
    if (!cd('seclusion') && m.cult && CULT.ready(m)) opts.push({ k: 'seclusion', u: .55 + (e('values.martialPeak') - 50) / 200, run: () => SECT.seclusion(W, m) });
    // ขยายอาคาร
    if (!cd('upgrade')) opts.push({ k: 'upgrade', u: (e('interests.building') + e('personality.ambition') + e('values.powerStatus')) / 400 + (pop >= bedCap * 0.8 ? .42 : 0) + (S.stones > 2500 ? .2 : -.25), run: () => SECT.upgradeBuilding(W, m) });
    // วิจัยตำรับ
    if (!cd('research')) opts.push({ k: 'research', u: (e('values.knowledgeCraft') + e('interests.scholarship') + e('personality.curiosity')) / 300 + pol.focus.scholar * .3 - .15, run: () => SECT.startResearch(W, m) });
    // เปิดรับศิษย์
    const qLen = Array.isArray(S.queue) ? S.queue.length : 0;
    if (!cd('drive') && pop < bedCap && qLen < SECT.MAX_QUEUE) opts.push({ k: 'drive', u: (pol.openness - 40) / 120 + (pop < 28 ? .32 : pop < bedCap * 0.82 ? .18 : -.5) + (pol.expansion - 50) / 200, run: () => SECT.recruitDrive(W, m) });
    // รับศิษย์ส่วนตัว
    if (!cd('discipleOf')) opts.push({ k: 'discipleOf', u: (e('social.teaching') + e('personality.empathy') + e('values.honorLegacy')) / 300 - (m.h.life.family.disciples.length > 1 ? .4 : 0), run: () => SECT.takePersonalDisciple(W, m) });
    // ตรวจทุจริต
    if (!cd('audit')) opts.push({ k: 'audit', u: (e('personality.caution') + e('personality.integrity') + (100 - e('personality.trustfulness'))) / 300 - .2 + (S.suspicion || 0) / 100, run: () => SECT.audit(W, m) });
    // การทูตและคาราวานพันธมิตร (v2.0.6 Pillar A)
    if (!cd('diplomacy') && g.CONTENT && W.world && Array.isArray(W.world.sects) && W.world.sects.length && S.stones >= 300) {
      const allyCaravanSect = W.world.sects.find(x => (x.treaty === 'ALLIANCE' || x.treaty === 'ALLIANCE_PACT' || x.treaty === 'TRADE_PACT' || x.treaty === 'TRADE_CARAVAN_ACCORD') && W.day - (x.lastCaravanDay ?? -99) >= 15);
      const treatyCand = !allyCaravanSect ? W.world.sects.find(x => (!x.treaty || x.treaty === 'NONE') && (x.attitude || 0) >= 18) : null;
      if (allyCaravanSect || treatyCand) {
        opts.push({
          k: 'diplomacy',
          u: (e('social.charisma') + e('values.wealthResource') + e('personality.ambition')) / 320 + (pol.focus.commerce || 0) * 0.25,
          run: () => {
            if (allyCaravanSect && g.CONTENT.exchangeWithAlly) {
              const result = g.CONTENT.exchangeWithAlly(W, allyCaravanSect.id);
              if (result.ok) allyCaravanSect.lastCaravanDay = W.day;
            } else if (treatyCand && g.CONTENT.signTreaty) {
              g.CONTENT.signTreaty(W, treatyCand.id, (treatyCand.attitude || 0) >= 40 ? 'ALLIANCE_PACT' : 'TRADE_CARAVAN_ACCORD');
            }
          }
        });
      }
    }
    if (!opts.length) return;
    opts.forEach(o => { if (g.COG) o.u += g.COG.officeBias(W, m, o.k); o.u += W.rng.float(-.08, .08); });
    opts.sort((a, b) => b.u - a.u);
    const thought = clamp((HC.eff(m, 'personality.rationality') + HC.eff(m, 'intellect.judgement')) / 200, 0, 1);
    const pick = thought > .8 ? opts[0] : W.rng.weighted(opts.slice(0, 3), o => Math.exp((o.u - opts[0].u) / (.08 + (1 - thought) * .22)));
    if (pick.u > 0.36 && W.rng.chance(0.35)) {
      S.cd[pick.k] = W.day + ({ banquet: 60, tournament: 90, seclusion: 30, upgrade: 45, research: 40, drive: 50, discipleOf: 120, audit: 50 }[pick.k] || 30);
      if (g.COG) g.COG.officeDecision(W, m, pick.k, ['พิจารณาจากนโยบาย สถานการณ์ และนิสัยของเจ้าสำนัก']);
      pick.run();
    }
  };

  SECT.banquet = (W, m) => {
    const cost = Math.round(W.npcs.filter(n => !n.dead).length * 6);
    if (!ECO.pay(W, cost, 'งานเลี้ยงสำนัก')) return;
    W.sect.festival = { until: W.t + 6 * 60, kind: 'banquet', at: 'plaza' };
    W.log('decision', m.h.name.given + ' ประกาศจัดงานเลี้ยงที่ลานกลาง (ใช้ ' + cost + ' ศิลา) เพื่อสร้างขวัญกำลังใจ', [m.id]);
    W.npcs.forEach(n => { if (!n.dead) { n.sat = Math.min(100, (n.sat || 60) + 3); } });
  };
  /* ---------- Grand Sect Martial Assembly & Peak Trial Arena (v2.0.5 Pillar C) ---------- */
  SECT.ASSEMBLY_BRACKETS = {
    JUNIOR: { id: 'JUNIOR', nameTh: 'รุ่นเยาว์·หลอมปราณ (T1–T2)', minStage: 1, maxStage: 2, cpReward: 50, runnerUpCp: 22, stonePrize: 60, minGearTier: 3, maxGearTier: 3, fameReward: 2 },
    CORE: { id: 'CORE', nameTh: 'รุ่นแกนหลัก·แก่นทองคำ (T3–T4)', minStage: 3, maxStage: 4, cpReward: 100, runnerUpCp: 45, stonePrize: 120, minGearTier: 3, maxGearTier: 5, fameReward: 4 },
    ELDER_PEAK: { id: 'ELDER_PEAK', nameTh: 'รุ่นผู้อาวุโส·ยอดเขายุทธ์ (T5–T7)', minStage: 5, maxStage: 7, cpReward: 180, runnerUpCp: 85, stonePrize: 220, minGearTier: 5, maxGearTier: 6, fameReward: 6 }
  };
  SECT.ASSEMBLY_BRACKET_IDS = ['JUNIOR', 'CORE', 'ELDER_PEAK'];

  SECT.signatureVictoryOf = n => {
    if (!n) return { weaponType: 'FIST', weaponNameTh: 'หมัดฝ่ามือ', techId: null, techNameTh: 'เพลงหมัดพื้นฐาน', moveNameTh: 'หมัดปะทะ', subpath: 'NONE', subpathNameTh: 'ปุถุชน' };
    const wType = (g.MARTIAL && g.MARTIAL.equippedType) ? g.MARTIAL.equippedType(n) : 'FIST';
    const wNameTh = (JD.MARTIAL && JD.MARTIAL.types && JD.MARTIAL.types[wType]) || wType;
    const c = n.cult;
    const subInfo = (c && c.sub && c.sub !== 'NONE') ? CULT.subInfo(c.path, c.sub) : null;
    const subNameTh = subInfo ? subInfo.nameTh : (c ? c.sub : 'ปุถุชน');
    let bestMove = null;
    if (g.SK && g.SK.list) {
      const moves = g.SK.list(n).filter(m => m && (m.M > 0 || m.arch === 'channel'));
      if (moves.length) {
        moves.sort((a, b) => ((b.tier || 1) * 10 + (b.M || 1)) - ((a.tier || 1) * 10 + (a.M || 1)));
        bestMove = moves[0];
      }
    }
    const techObj = bestMove ? (CULT.tech(bestMove.tech || bestMove.id) || bestMove) : (c && c.mantra ? CULT.tech(c.mantra) : null);
    return {
      weaponType: wType,
      weaponNameTh: wNameTh,
      techId: techObj ? techObj.id : null,
      techNameTh: techObj ? techObj.nameTh : 'กระบวนท่าสำนัก',
      moveNameTh: bestMove ? bestMove.nameTh : (techObj ? techObj.nameTh : 'กระบวนท่าพื้นฐาน'),
      subpath: c ? c.sub : 'NONE',
      subpathNameTh: subNameTh
    };
  };

  SECT.tailoredAssemblyReward = (W, n, minTier, maxTier) => {
    if (!n || !n.cult) return { item: null, recipe: null };
    const effSt = CULT.effectiveTechStage ? CULT.effectiveTechStage(n) : n.cult.stage;
    const targetMaxTier = clamp(Math.max(minTier, Math.min(maxTier, effSt + 1)), 3, 6);
    const targetMinTier = clamp(minTier, 3, targetMaxTier);
    const allGear = (JD.ITEMS && JD.ITEMS.items ? JD.ITEMS.items : []).filter(it =>
      it && ['WEAPON', 'ARMOR', 'ACCESSORY'].includes(it.slot) && (it.tier || 1) >= targetMinTier && (it.tier || 1) <= targetMaxTier
    );
    let bestItem = null, bestScore = -Infinity;
    for (const it of allGear) {
      const suit = (g.MARTIAL && g.MARTIAL.gearSuitability) ? g.MARTIAL.gearSuitability(n, it, 0) : { score: (it.tier || 3) * 20 };
      const sc = Number.isFinite(suit.score) ? suit.score : ((it.tier || 3) * 10);
      if (sc > bestScore) { bestScore = sc; bestItem = it; }
    }
    if (!bestItem && allGear.length) bestItem = allGear[0];
    let minted = null, matchedRecipe = null;
    if (bestItem) {
      const allRecipes = (JD.ITEMS && JD.ITEMS.recipes) ? JD.ITEMS.recipes : [];
      matchedRecipe = allRecipes.find(r => (r.outItemId === bestItem.id || r.itemId === bestItem.id)) ||
        allRecipes.find(r => r.tier >= targetMinTier && r.tier <= targetMaxTier && ['FORGING', 'ARRAY', 'TALISMAN'].includes(r.craft)) || null;
      minted = ECO.mintGear(matchedRecipe || bestItem, 1.08);
      n.inv = n.inv || { stones: 0, pills: {}, mats: {}, gear: [] };
      n.inv.gear = n.inv.gear || [];
      const curEq = n.equip && n.equip[minted.slot];
      const curScore = (curEq && g.MARTIAL && g.MARTIAL.gearSuitability) ? g.MARTIAL.gearSuitability(n, curEq, 0).score : -Infinity;
      const newScore = (g.MARTIAL && g.MARTIAL.gearSuitability) ? g.MARTIAL.gearSuitability(n, minted, 0).score : 100;
      if ((minted.minStage || 1) <= effSt && (!curEq || newScore > curScore)) {
        if (curEq) n.inv.gear.push(curEq);
        n.equip = n.equip || {};
        n.equip[minted.slot] = minted;
        if (g.MARTIAL && g.MARTIAL.invalidateMartialCaches) g.MARTIAL.invalidateMartialCaches(n);
      } else {
        n.inv.gear.push(minted);
      }
      if (matchedRecipe) {
        n.recipes = n.recipes || [];
        if (!n.recipes.includes(matchedRecipe.id)) n.recipes.push(matchedRecipe.id);
        n.inv.recipes = n.inv.recipes || [];
        if (!n.inv.recipes.includes(matchedRecipe.id)) n.inv.recipes.push(matchedRecipe.id);
        if (W && W.sect) W.sect.recipeTier = Math.max(W.sect.recipeTier || 2, matchedRecipe.tier || 3);
      }
    }
    return { item: minted, recipe: matchedRecipe };
  };

  SECT.simulateAssemblyBout = (W, a, b, opts) => {
    opts = opts || {};
    const tacA = (g.COMBAT && g.COMBAT.resolveWeaponTactics) ? g.COMBAT.resolveWeaponTactics(a, b, { dist: 2.2 }) : { dmgMult: 1, relation: 'NEUTRAL', noteTh: '' };
    const tacB = (g.COMBAT && g.COMBAT.resolveWeaponTactics) ? g.COMBAT.resolveWeaponTactics(b, a, { dist: 2.2 }) : { dmgMult: 1, relation: 'NEUTRAL', noteTh: '' };
    const resA = (g.MARTIAL && g.MARTIAL.evaluateResonanceSet) ? g.MARTIAL.evaluateResonanceSet(a) : { active: false, pieces: 0 };
    const resB = (g.MARTIAL && g.MARTIAL.evaluateResonanceSet) ? g.MARTIAL.evaluateResonanceSet(b) : { active: false, pieces: 0 };
    const formA = opts.useFormation && g.COMBAT && g.COMBAT.evaluateFormationSynergy ? g.COMBAT.evaluateFormationSynergy(opts.formationPartyA || a.conferenceParty || [a]) : { synergies: [], powerMultiplier: 1 };
    const formB = opts.useFormation && g.COMBAT && g.COMBAT.evaluateFormationSynergy ? g.COMBAT.evaluateFormationSynergy(opts.formationPartyB || b.conferenceParty || [b]) : { synergies: [], powerMultiplier: 1 };
    const powA = a.power != null ? a.power : CULT.power(a);
    const powB = b.power != null ? b.power : CULT.power(b);
    const scoreA = powA * (tacA.dmgMult || 1) * (1 + (resA.active ? resA.pieces * 0.04 : 0)) * (formA.powerMultiplier || 1) * (0.88 + (W.rng ? W.rng.next() * 0.24 : 0.12));
    const scoreB = powB * (tacB.dmgMult || 1) * (1 + (resB.active ? resB.pieces * 0.04 : 0)) * (formB.powerMultiplier || 1) * (0.88 + (W.rng ? W.rng.next() * 0.24 : 0.12));
    const win = scoreA >= scoreB ? a : b;
    const lose = win === a ? b : a;
    const winTac = win === a ? tacA : tacB;
    const sig = SECT.signatureVictoryOf(win);
    return {
      winner: win,
      loser: lose,
      tacticalRelation: winTac.relation || 'NEUTRAL',
      tacticalNoteTh: winTac.noteTh || '',
      resonanceA: resA.active ? { setId: resA.setId, pieces: resA.pieces } : null,
      resonanceB: resB.active ? { setId: resB.setId, pieces: resB.pieces } : null,
      formationA: formA.synergies || [],
      formationB: formB.synergies || [],
      signature: sig
    };
  };

  SECT.resolveRivalEnvoyChallenge = (W, champ, rivalSect, opts) => {
    opts = opts || {};
    if (!W) return null;
    if (!champ && Array.isArray(W.npcs)) {
      const avail = W.npcs.filter(n => n && !n.dead && !n.away && !n.exiled && n.cult && !(n.jail > W.t) && !n.sealed);
      avail.sort((a, b) => CULT.power(b) - CULT.power(a));
      champ = avail[0] || W.npcs.find(n => n && !n.dead) || null;
    }
    if (!champ) return null;
    const sects = (W.world && Array.isArray(W.world.sects)) ? W.world.sects : [];
    const rival = (typeof rivalSect === 'string' ? sects.find(x => x.id === rivalSect || x.factionId === rivalSect || x.code === rivalSect) : rivalSect) || sects.find(x => x.treaty === 'RIVAL_FEUD' || x.treaty === 'EMBARGO') || sects.slice().sort((a, b) => (a.attitude || 0) - (b.attitude || 0))[0];
    if (!rival) return null;
    if (opts.respectCooldown && rival.lastEnvoyDay != null && (W.day || 0) - rival.lastEnvoyDay < (opts.cooldownDays || 15)) {
      return { ok: false, reason: 'cooldown', rivalSectId: rival.id, cooldownUntilDay: rival.lastEnvoyDay + (opts.cooldownDays || 15) };
    }
    rival.lastEnvoyDay = W.day || 0;
    const wTypes = ['SWORD', 'BLADE', 'SPEAR', 'FIST', 'BOW', 'STAFF', 'FOCUS'];
    const envoyWeapon = opts.envoyWeapon || wTypes[Math.floor((W.day || 0) + (rival.power || 1)) % wTypes.length];
    const champPow = CULT.power(champ);
    const envoyPower = opts.envoyPower != null ? opts.envoyPower : Math.max(40, Math.round(champPow * clamp(0.78 + (rival.power || 2) * 0.06, 0.72, 1.12)));
    const envoyUnit = {
      id: 'ENVOY_' + rival.id + '_' + (W.day || 0),
      foe: true,
      nameTh: 'ทูตท้าประลอง' + (rival.shortTh || rival.nameTh),
      power: envoyPower,
      tier: Math.max(2, Math.min(7, (CULT.effectiveTechStage ? CULT.effectiveTechStage(champ) : (champ.cult?.stage || 2)))),
      equip: { WEAPON: { slot: 'WEAPON', gearType: envoyWeapon, nameTh: envoyWeapon } }
    };
    const tac = (g.COMBAT && g.COMBAT.resolveWeaponTactics) ? g.COMBAT.resolveWeaponTactics(champ, envoyUnit, { dist: 2.2 }) : { dmgMult: 1, relation: 'NEUTRAL', noteTh: '' };
    const resSet = (g.MARTIAL && g.MARTIAL.evaluateResonanceSet) ? g.MARTIAL.evaluateResonanceSet(champ) : { active: false, pieces: 0 };
    const effChamp = champPow * (tac.dmgMult || 1) * (1 + (resSet.active ? resSet.pieces * 0.05 : 0)) * (0.9 + (W.rng ? W.rng.next() * 0.22 : 0.1));
    const effEnvoy = envoyPower * (0.88 + (W.rng ? W.rng.next() * 0.2 : 0.1));
    const won = opts.forceWin != null ? !!opts.forceWin : (effChamp >= effEnvoy);
    const cpGain = won ? 45 : 15;
    const stonePrize = won ? 60 : 0;
    const decisiveRivalry = rival.treaty === 'RIVAL_FEUD' && (rival.attitude || 0) <= -60;
    let vassalTreaty = null;
    champ.cp = (champ.cp || 0) + cpGain;
    champ.cpEarned = (champ.cpEarned || 0) + cpGain;
    champ.merit = (champ.merit || 0) + (won ? 20 : 6);
    if (won) {
      W.fame(4);
      ECO.earn(W, stonePrize, 'ชนะทูตท้าประลองจาก' + rival.nameTh);
      rival.attitude = clamp((rival.attitude || 0) + 5, -100, 100);
      HC.experience(champ, 'victory', 0.7);
      if (decisiveRivalry && g.CONTENT && g.CONTENT.forceVassalTreaty) vassalTreaty = g.CONTENT.forceVassalTreaty(W, rival, { majorDispute: true, winnerId: champ.id, cause: 'RIVAL_ENVOY_CHALLENGE' });
    } else {
      W.fame(-1);
      rival.attitude = clamp((rival.attitude || 0) - 4, -100, 100);
      HC.experience(champ, 'defeat', 0.35);
    }
    if (W.world && W.world.politics) {
      const pol = W.world.politics;
      pol.stats = pol.stats || {};
      pol.stats.envoyChallenges = (pol.stats.envoyChallenges || 0) + 1;
      pol.events = pol.events || [];
      pol.events.push({
        day: W.day || 0,
        kind: 'ENVOY_CHALLENGE',
        sectId: rival.id,
        treaty: rival.treaty || 'NONE',
        outcome: won ? 'VICTORY' : 'DEFEAT',
        summaryTh: HC.fullName(champ) + (won ? ' เอาชนะ' : ' พ่ายต่อ') + envoyUnit.nameTh + ' จาก' + rival.nameTh + (won ? (' (+' + cpGain + ' CP, +' + stonePrize + ' ศิลา)') : '')
      });
    }
    if (!opts.quiet && W.log) {
      W.log('challenge', HC.fullName(champ) + (won ? ' ปราบ' : ' พ่ายต่อ') + envoyUnit.nameTh + ' (' + rival.nameTh + ')', [champ.id]);
    }
    return {
      ok: true,
      rivalSectId: rival.id,
      rivalSectNameTh: rival.nameTh,
      envoyNameTh: envoyUnit.nameTh,
      envoyWeapon,
      envoyPower,
      defenderId: champ.id,
      defenderName: HC.fullName(champ),
      won,
      tacticalRelation: tac.relation || 'NEUTRAL',
      cpAwarded: cpGain,
      stonePrize,
      vassalTreaty,
      summaryTh: HC.fullName(champ) + (won ? ' ปราบ' : ' ประมือกับ') + envoyUnit.nameTh + ' (' + rival.nameTh + ')'
    };
  };

  SECT.assembly = (W, m, opts) => {
    opts = opts || {};
    const S = W.sect;
    S.assemblyHistory = S.assemblyHistory || [];
    const host = m || W.byId[S.masterId] || W.npcs.find(n => !n.dead);
    if (opts.announceOnly) {
      return SECT.tournament(W, host, opts);
    }
    const candidates = W.npcs.filter(n => !n.dead && !n.exiled && n.cult && (opts.includeAway || !n.away));
    const bracketResults = [];
    let totalFameGained = 0;
    let grandChamp = null, grandChampPower = -1;

    const alliedSects = (W.world && Array.isArray(W.world.sects)) ? W.world.sects.filter(s =>
      ['ALLIANCE', 'ALLIANCE_PACT', 'MARTIAL_EXCHANGE'].includes(s.treaty) || (s.attitude || 0) >= 40
    ) : [];

    for (const bId of SECT.ASSEMBLY_BRACKET_IDS) {
      const spec = SECT.ASSEMBLY_BRACKETS[bId];
      let divEntrants = candidates.filter(n => {
        const st = n.cult ? Math.min(7, CULT.effectiveTechStage ? CULT.effectiveTechStage(n) : n.cult.stage) : 1;
        return st >= spec.minStage && st <= spec.maxStage;
      });
      // Invite guest prodigies from allied sects
      const guestEntrants = [];
      if (!opts.skipGuests && alliedSects.length) {
        alliedSects.slice(0, 2).forEach((s, sIdx) => {
          const guestStage = clamp(spec.minStage + (sIdx % (spec.maxStage - spec.minStage + 1)), spec.minStage, spec.maxStage);
          const wTypes = ['SWORD', 'BLADE', 'SPEAR', 'FIST', 'BOW', 'STAFF', 'FOCUS'];
          const gWpn = wTypes[Math.floor((W.day || 0) + (s.power || 1) + sIdx) % wTypes.length];
          const gPow = Math.round(180 * Math.pow(1.35, guestStage - 1) * (0.85 + (s.power || 2) * 0.05));
          const guest = {
            id: 'GUEST_' + s.id + '_' + spec.id + '_' + (W.day || 0),
            isGuest: true,
            guestSectId: s.id,
            guestSectNameTh: s.shortTh || s.nameTh,
            name: 'ยอดฝีมือ' + (s.shortTh || s.nameTh),
            h: {
              name: { given: 'ยอดฝีมือ' + (s.shortTh || s.nameTh), family: '' },
              state: { hp: 1000, satiety: 100, rest: 100, energy: 100 },
              skills: { [gWpn]: guestStage * 12 },
              personality: { bravery: 70 },
              values: { martialPeak: 80 }
            },
            inv: { stones: 0 },
            rank: guestStage >= 5 ? 4 : guestStage >= 3 ? 2 : 1,
            stage: guestStage,
            power: gPow,
            cult: { path: s.majorPath || 'XIAN', stage: guestStage, sub: 'NONE', techs: [] },
            equip: { WEAPON: { slot: 'WEAPON', gearType: gWpn, nameTh: gWpn, tier: guestStage } }
          };
          guestEntrants.push(guest);
        });
      }
      divEntrants = divEntrants.concat(guestEntrants);
      if (!divEntrants.length) continue;
      // Sort by combat power + tactical readiness for seeding
      divEntrants = divEntrants.slice().sort((a, b) => ((b.power != null ? b.power : CULT.power(b)) - (a.power != null ? a.power : CULT.power(a))));
      let curRound = divEntrants.slice();
      const bouts = [];
      let runnerUp = curRound.length > 1 ? curRound[1] : null;
      while (curRound.length > 1) {
        const nextRound = [];
        for (let i = 0; i < curRound.length; i += 2) {
          if (i + 1 >= curRound.length) {
            nextRound.push(curRound[i]);
            continue;
          }
          const bout = SECT.simulateAssemblyBout(W, curRound[i], curRound[i + 1]);
          bouts.push({
            aId: curRound[i].id,
            bId: curRound[i + 1].id,
            winnerId: bout.winner.id,
            loserId: bout.loser.id,
            tacticalRelation: bout.tacticalRelation,
            signatureTechName: bout.signature.techNameTh,
            weaponType: bout.signature.weaponType
          });
          runnerUp = bout.loser;
          nextRound.push(bout.winner);
        }
        curRound = nextRound;
      }
      const champ = curRound[0];
      const sig = SECT.signatureVictoryOf(champ);
      // Award Contribution Points (CP), stones, merit, and tailored T3-T6 equipment/recipe
      if (!champ.isGuest) {
        champ.cp = (champ.cp || 0) + spec.cpReward;
        champ.cpEarned = (champ.cpEarned || 0) + spec.cpReward;
        champ.merit = (champ.merit || 0) + 25 + spec.fameReward * 3;
        champ.inv = champ.inv || { stones: 0, pills: {}, mats: {}, gear: [] };
        const stonePay = Math.min(spec.stonePrize, Math.max(20, Math.floor((S.stones || 0) * 0.15)));
        if (stonePay > 0 && S.stones >= stonePay) {
          ECO.pay(W, stonePay, 'รางวัลชุมนุมยุทธ์ ' + spec.nameTh);
        }
        champ.inv.stones = (champ.inv.stones || 0) + spec.stonePrize;
        HC.experience(champ, 'victory', 0.85);
        if (g.AI && g.AI.mem) g.AI.mem(W, champ, 'คว้าแชมป์ชุมนุมยุทธ์ ' + spec.nameTh + ' ด้วย' + sig.weaponNameTh + '「' + sig.techNameTh + '」', 0.9);
        totalFameGained += spec.fameReward;
      } else {
        totalFameGained += Math.max(1, Math.floor(spec.fameReward * 0.5));
      }
      if (runnerUp && runnerUp.id !== champ.id && !runnerUp.isGuest) {
        runnerUp.cp = (runnerUp.cp || 0) + spec.runnerUpCp;
        runnerUp.cpEarned = (runnerUp.cpEarned || 0) + spec.runnerUpCp;
        runnerUp.merit = (runnerUp.merit || 0) + 12;
      }
      const reward = champ.isGuest ? { item: null, recipe: null } : SECT.tailoredAssemblyReward(W, champ, spec.minGearTier, spec.maxGearTier);
      const cPow = champ.power != null ? champ.power : CULT.power(champ);
      if (cPow > grandChampPower) {
        grandChampPower = cPow;
        grandChamp = champ;
      }
      bracketResults.push({
        bracketId: spec.id,
        nameTh: spec.nameTh,
        minStage: spec.minStage,
        maxStage: spec.maxStage,
        entrantCount: divEntrants.length,
        boutCount: bouts.length,
        bouts,
        championId: champ.id,
        championName: HC.fullName(champ),
        runnerUpId: runnerUp ? runnerUp.id : null,
        runnerUpName: runnerUp ? HC.fullName(runnerUp) : null,
        subpath: sig.subpath,
        subpathNameTh: sig.subpathNameTh,
        weaponType: sig.weaponType,
        weaponNameTh: sig.weaponNameTh,
        signatureTechId: sig.techId,
        signatureTechName: sig.techNameTh,
        signatureMoveName: sig.moveNameTh,
        cpAwarded: spec.cpReward,
        runnerUpCp: spec.runnerUpCp,
        stonePrize: spec.stonePrize,
        rewardItemId: reward.item ? reward.item.id : null,
        rewardItemNameTh: reward.item ? reward.item.nameTh : null,
        rewardItemTier: reward.item ? reward.item.tier : null,
        rewardRecipeId: reward.recipe ? reward.recipe.id : null,
        rewardRecipeNameTh: reward.recipe ? reward.recipe.nameTh : null
      });
    }

    if (!bracketResults.length) {
      return { ok: false, reason: 'no-eligible-entrants', brackets: [] };
    }

    if (opts.primaryWinnerId && W.byId[opts.primaryWinnerId]) {
      grandChamp = W.byId[opts.primaryWinnerId];
    }
    const grandSig = SECT.signatureVictoryOf(grandChamp);
    W.fame(totalFameGained);
    const cal = g.SIM && g.SIM.calendar ? g.SIM.calendar(W.t) : { year: Math.floor((W.day || 0) / 360) + 1, season: W.season || 0 };
    const record = {
      id: 'ASM_' + (W.day || 0) + '_' + (S.assemblyHistory.length + 1),
      day: W.day || 0,
      year: cal.year,
      season: cal.season,
      hostId: host ? host.id : null,
      championId: grandChamp.id,
      championName: HC.fullName(grandChamp),
      championSubpath: grandSig.subpath,
      championSubpathNameTh: grandSig.subpathNameTh,
      championWeapon: grandSig.weaponType,
      championWeaponNameTh: grandSig.weaponNameTh,
      signatureTechId: grandSig.techId,
      signatureTechName: grandSig.techNameTh,
      fameGained: totalFameGained,
      brackets: bracketResults,
      summaryTh: 'ชุมนุมยุทธ์ใหญ่ปีที่ ' + cal.year + ': ' + bracketResults.map(b => b.nameTh + ' แชมป์คือ ' + b.championName + ' (' + b.weaponNameTh + '·' + b.signatureTechName + ', +' + b.cpAwarded + ' CP' + (b.rewardItemNameTh ? ', รับ「' + b.rewardItemNameTh + '」' : '') + ')').join(' | ')
    };
    if (!opts.skipEnvoy && W.world && Array.isArray(W.world.sects) && W.world.sects.length) {
      record.envoyChallenge = SECT.resolveRivalEnvoyChallenge(W, grandChamp, opts.rivalSect, opts);
    }
    S.assemblyHistory.unshift(record);
    if (S.assemblyHistory.length > 24) S.assemblyHistory.length = 24;
    W.log('tournament', '🏆 ' + record.summaryTh, bracketResults.map(b => b.championId));
    return { ok: true, assembly: record, brackets: bracketResults, champion: grandChamp };
  };

  SECT.tournament = (W, m, opts) => {
    opts = opts || {};
    const host = m || W.byId[W.sect.masterId];
    W.sect.assemblyHistory = W.sect.assemblyHistory || [];
    W.sect.tournament = {
      start: W.t + 24 * 60,
      state: 'announce',
      isGrandAssembly: true,
      brackets: SECT.ASSEMBLY_BRACKET_IDS.slice(),
      rounds: 0,
      entrants: [],
      winnerId: null,
      prize: Math.round(80 + (W.sect.policy ? W.sect.policy.generosity : 50))
    };
    if (host) {
      W.log('decision', host.h.name.given + ' ประกาศจัดชุมนุมประลองยุทธ์สำนัก 3 รุ่น (T1–T2, T3–T4, T5–T7) ในอีก 1 วัน รางวัลรวมศิลา แต้มคุณูปการ (CP) และศาสตราประจำสาย', [host.id]);
    }
    return W.sect.tournament;
  };
  SECT.seclusion = (W, m) => {
    const d = 12 + W.rng.int(0, 12);
    W.sect.sealedUntil = W.t + d * 1440; m.sealed = true; m.sealEnd = W.sect.sealedUntil;
    W.log('decision', m.h.name.given + ' ปิดด่านเพื่อทะลวงขั้น ' + d + ' วัน รองเจ้าสำนักและผู้อาวุโสดูแลกิจการ', [m.id]);
  };
  const ACT_TO_BLD = {
    sleep: 'dorm_outer',
    cultivate: 'meditation_hall',
    meditate: 'meditation_hall',
    brew: 'alchemy',
    brewBasic: 'alchemy',
    personalBrew: 'alchemy',
    forge: 'forge',
    farm: 'farm',
    mine: 'mine',
    eat: 'canteen',
    cook: 'canteen',
    read: 'scripture',
    study: 'scripture',
    guidedStudy: 'scripture',
    heal: 'infirmary',
    treat: 'infirmary',
    practice: 'training_ground',
    spar: 'training_ground',
    train: 'training_ground',
    shop: 'market',
    browse: 'market'
  };

  SECT.ensureFacilityDemand = W => {
    const S = W.sect;
    if (!S) return null;
    if (!S.facilityDemand) S.facilityDemand = {};
    if (W.map && W.map.buildings) {
      W.map.buildings.forEach(b => {
        if (!S.facilityDemand[b.id]) {
          S.facilityDemand[b.id] = {
            failedAttempts: 0,
            unmetDemands: 0,
            congestedHours: 0,
            consecutiveCongestionDays: 0,
            lastCongestionHour: 0,
            occupancyHistory: [],
            lastEvaluatedDay: 0,
            lastUpgradedDay: 0
          };
        }
      });
    }
    return S.facilityDemand;
  };

  SECT.decayFacilityDemand = W => {
    const S = W.sect;
    if (!S || !S.facilityDemand) return;
    for (const bid in S.facilityDemand) {
      const fd = S.facilityDemand[bid];
      const lastH = fd.lastCongestionHour || 0;
      const daysSince = lastH > 0 ? (W.t - lastH) / 1440 : 999;
      if (daysSince >= 2) {
        fd.failedAttempts = 0;
        fd.unmetDemands = 0;
        fd.congestedHours = 0;
      } else if (daysSince >= 1) {
        fd.failedAttempts = Math.max(0, Math.floor((fd.failedAttempts || 0) * 0.5));
        fd.unmetDemands = Math.max(0, Math.floor((fd.unmetDemands || 0) * 0.5));
        fd.congestedHours = Math.max(0, Math.floor((fd.congestedHours || 0) * 0.5));
      }
    }
  };

  SECT.recordFacilityDemand = (W, bldOrAct, reason, npc) => {
    SECT.ensureFacilityDemand(W);
    let bid = ACT_TO_BLD[bldOrAct] || bldOrAct;
    if (npc && bldOrAct === 'sleep') {
      bid = npc.rank >= 3 ? 'dorm_core' : npc.rank >= 2 ? 'dorm_inner' : 'dorm_outer';
    }
    const b = W.map && W.map.byId && W.map.byId[bid];
    if (!b) return;
    const fd = W.sect.facilityDemand[bid];
    if (!fd) return;
    fd.failedAttempts = (fd.failedAttempts || 0) + 1;
    fd.unmetDemands = (fd.unmetDemands || 0) + 1;
    fd.lastCongestionHour = W.t;
  };

  SECT.upgradeBuilding = (W, m) => {
    SECT.ensureFacilityDemand(W);
    const S = W.sect, pol = S.policy, pop = SECT.memberOccupancy(W);
    const totalBedCap = SECT.housingCapacity(W);
    const cashReserve = Math.max(500, pop * 25) + 800;
    const wants = ['dorm_outer', 'dorm_inner', 'dorm_core', 'meditation_hall', 'alchemy', 'forge', 'herb_garden', 'farm', 'mine', 'canteen', 'infirmary', 'training_ground', 'scripture', 'tea_garden', 'shrine', 'market'];

    const underConstruction = wants.some(id => W.map.byId[id] && W.map.byId[id].building);
    if (underConstruction) return;

    const outerCount = W.npcs.filter(n => !n.dead && !n.exiled && n.rank <= 1).length;
    const innerCount = W.npcs.filter(n => !n.dead && !n.exiled && n.rank === 2).length;
    const coreCount = W.npcs.filter(n => !n.dead && !n.exiled && n.rank >= 3).length;

    let best = null, bs = -1, bestBlockedByTreasury = null;

    wants.forEach(id => {
      const b = W.map.byId[id];
      const maxL = SECT.maxBuildingLevel(b);
      if (!b || b.level >= maxL || b.building) return;

      const fd = S.facilityDemand[id] || {};
      if (W.day - (fd.lastUpgradedDay || 0) < 20) return;

      const cost = SECT.upgradeCost(b);
      let s = W.rng.next() * 0.15;
      const reasons = [];

      const lastH = fd.lastCongestionHour || 0;
      const daysSince = lastH > 0 ? (W.t - lastH) / 1440 : 999;
      const effFailed = daysSince >= 2 ? 0 : daysSince >= 1 ? Math.floor((fd.failedAttempts || 0) * 0.5) : (fd.failedAttempts || 0);
      const effUnmet = daysSince >= 2 ? 0 : daysSince >= 1 ? Math.floor((fd.unmetDemands || 0) * 0.5) : (fd.unmetDemands || 0);
      const effCongested = daysSince >= 2 ? 0 : daysSince >= 1 ? Math.floor((fd.congestedHours || 0) * 0.5) : (fd.congestedHours || 0);

      if (effFailed >= 2) {
        s += Math.min(1.6, effFailed * 0.3);
        reasons.push('หาสถานีไม่ได้ ' + effFailed + ' ครั้ง');
      }
      if (effUnmet >= 2) {
        s += Math.min(1.2, effUnmet * 0.25);
        reasons.push('ความต้องการไม่ได้รับการตอบสนอง ' + effUnmet + ' ครั้ง');
      }
      if (effCongested >= 3) {
        s += Math.min(1.4, effCongested * 0.15);
        reasons.push('แออัดต่อเนื่อง ' + effCongested + ' ชม.');
      }

      let housingDemand = false;
      if (id === 'dorm_outer') {
        const dormBeds = b.stations.length;
        if (outerCount >= dormBeds * 0.85 || pop >= totalBedCap * 0.85) {
          housingDemand = true;
          s += 1.35 + Math.max(0, pop - totalBedCap * 0.8) * 0.08;
          reasons.push('เรือนศิษย์นอกรองรับสมาชิกใกล้เต็ม (' + pop + '/' + totalBedCap + ')');
        }
      } else if (id === 'dorm_inner') {
        const dormBeds = b.stations.length;
        if (innerCount >= dormBeds * 0.82 || (pop >= totalBedCap * 0.88 && W.map.byId.dorm_outer.level >= 2)) {
          housingDemand = true;
          s += 1.2 + Math.max(0, innerCount - dormBeds * 0.75) * 0.1;
          reasons.push('เรือนศิษย์ในต้องการเตียงเพิ่ม');
        }
      } else if (id === 'dorm_core') {
        const dormBeds = b.stations.length;
        if (coreCount >= dormBeds * 0.80 || (pop >= totalBedCap * 0.90 && W.map.byId.dorm_inner.level >= 2)) {
          housingDemand = true;
          s += 1.15 + Math.max(0, coreCount - dormBeds * 0.7) * 0.1;
          reasons.push('เรือนศิษย์แกนกลางต้องการเตียงเพิ่ม');
        }
      } else if (id === 'farm') {
        const food = ECO.count(W, 'grain') + ECO.count(W, 'meal') / 3;
        if (food < pop * 3) {
          s += 1.1 + (pop * 3 - food) * 0.05;
          reasons.push('เสบียงอาหารมีไม่พอ');
        }
      } else if (id === 'canteen') {
        if (pop > b.stations.length * 2.4) {
          s += 0.95;
          reasons.push('โรงครัวคับคั่งตามจำนวนศิษย์');
        }
      } else if (id === 'meditation_hall') {
        s += (pol.focus.martial || 0) * 0.5;
      } else if (id === 'alchemy') {
        s += (pol.focus.craft || 0) * 0.4 + HC.eff(m, 'interests.alchemy') / 180;
      } else if (id === 'forge') {
        s += (pol.focus.craft || 0) * 0.4 + HC.eff(m, 'interests.forging') / 180;
      } else if (id === 'mine') {
        s += (pol.focus.commerce || 0) * 0.5;
      } else if (id === 'training_ground') {
        s += (pol.focus.martial || 0) * 0.45;
      }

      s *= (0.7 + (pol.expansion || 50) / 100 * 0.6);

      const hasRealDemand = effFailed >= 2 || effCongested >= 3 || housingDemand || (id === 'farm' && (ECO.count(W, 'grain') + ECO.count(W, 'meal') / 3) < pop * 3) || (id === 'canteen' && pop > b.stations.length * 2.6);
      if (!hasRealDemand) return;

      if (s > bs) {
        const rText = reasons.length ? reasons.join('、') : 'ความต้องการใช้งานเพิ่มขึ้น';
        if (W.sect.stones < cost + cashReserve) {
          bestBlockedByTreasury = { id, b, cost, reason: rText, needed: cost + cashReserve };
        } else {
          bs = s;
          best = { id, b, cost, reason: rText };
        }
      }
    });

    if (!best) {
      if (bestBlockedByTreasury && W.rng.chance(0.4)) {
        W.log('decision', m.h.name.given + ' ชะลอการขยาย' + bestBlockedByTreasury.b.nameTh + ' แม้พบความต้องการสูง (' + bestBlockedByTreasury.reason + ') เนื่องจากต้องสำรองศิลาคงคลังขั้นต่ำ ' + cashReserve + ' ศิลา (ปัจจุบันมี ' + Math.round(W.sect.stones) + ' ศิลา ต้องการ ' + bestBlockedByTreasury.needed + ' ศิลา)', [m.id, bestBlockedByTreasury.id]);
      }
      return;
    }

    if (!ECO.pay(W, best.cost, 'ขยาย' + best.b.nameTh)) return;
    const builder = SECT.holder(W, 'steward') || m, buildSkill = g.MARTIAL ? g.MARTIAL.skillRead(builder, 'construction') : 0, management = g.MARTIAL ? g.MARTIAL.skillRead(builder, 'administration') : 0;
    const governance = SECT.governanceSummary(W);
    best.b.building = { until: W.t + Math.round(8 * 1440 / ((1 + buildSkill * .004 + management * .0015) * (1 + governance.constructionSpeedBonus))), to: best.b.level + 1 };
    if (g.MARTIAL) g.MARTIAL.skillPractice(builder, 'construction', 1.5, 1.1);
    const fd = S.facilityDemand[best.id];
    if (fd) {
      fd.lastUpgradedDay = W.day;
      fd.failedAttempts = 0;
      fd.unmetDemands = 0;
      fd.congestedHours = 0;
      fd.lastCongestionHour = 0;
    }
    W.log('decision', m.h.name.given + ' อนุมัติขยาย' + best.b.nameTh + ' เป็นระดับ ' + (best.b.level + 1) + '/' + SECT.maxBuildingLevel(best.b) + ' (ใช้ ' + best.cost + ' ศิลา) หลังพบความแออัดต่อเนื่อง (' + best.reason + ')', [m.id, best.id]);
  };

  SECT.startResearch = (W, m) => {
    const S = W.sect; if (S.research) return;
    if (S.recipeTier >= 6) return;
    const head = SECT.holder(W, 'scripture');
    const cost = 400 * S.recipeTier;
    if (!ECO.pay(W, cost, 'วิจัยตำรับระดับ ' + (S.recipeTier + 1))) return;
    S.research = { tier: S.recipeTier + 1, progress: 0, need: 900 * S.recipeTier, lead: head ? head.id : m.id };
    W.log('decision', m.h.name.given + ' สั่งวิจัยตำรับระดับ ' + (S.recipeTier + 1) + ' (หอคัมภีร์รับผิดชอบ)', [m.id]);
  };

  SECT.recruitDrive = (W, m) => {
    const S = W.sect;
    if (W.threat && W.threat.roadBlocked > 0) return false;
    const pop = SECT.memberOccupancy(W), cap = SECT.housingCapacity(W);
    const qLen = Array.isArray(S.queue) ? S.queue.length : 0;
    if (pop >= cap && qLen >= SECT.MAX_QUEUE) return false;
    const foodDays = (ECO.count(W, 'meal') + ECO.count(W, 'grain') * 3) / Math.max(3, pop * 3);
    if (foodDays < 2.5) return false;
    S.driveUntil = W.day + 20;
    W.log('decision', m.h.name.given + ' ประกาศเปิดรับศิษย์ใหม่ 20 วัน (ที่พัก ' + pop + '/' + cap + ')', [m.id]);
    if (g.EXPED && g.EXPED.recruitApplicants && S.lastRecruitGenDay !== W.day) {
      S.lastRecruitGenDay = W.day;
      g.EXPED.recruitApplicants(W, 'drive');
    }
    return true;
  };

  SECT.takePersonalDisciple = (W, m) => {
    const c = W.npcs.filter(n => !n.dead && n.rank >= 1 && n.rank <= 3 && !n.mentor && n.id !== m.id);
    if (!c.length) return;
    c.sort((a, b) => (HC.derived(b).cultivationTalent + SECT.relationScore(m, b)) - (HC.derived(a).cultivationTalent + SECT.relationScore(m, a)));
    const d = c[0]; d.mentor = m.id; m.h.life.family.disciples.push(d.id); d.h.life.family.master = m.id;
    const r = SECT.rel(d, m.id); r.r = Math.min(100, r.r + 25); r.a += 15; const r2 = SECT.rel(m, d.id); r2.a += 15; r2.r += 10;
    d.sat = Math.min(100, (d.sat || 60) + 12);
    W.log('decision', m.h.name.given + ' รับ ' + d.h.name.given + ' เป็นศิษย์ส่วนตัว', [m.id, d.id]);
  };
  SECT.audit = (W, m) => {
    const disc = SECT.holder(W, 'discipline'); const tre = SECT.holder(W, 'treasury');
    W.log('decision', m.h.name.given + ' สั่งตรวจบัญชีคลังโดยละเอียด', [m.id]);
    if (tre && tre.embezzled > 0) {
      const eye = disc ? HC.eff(disc, 'intellect.perceptiveness') : 40;
      if (W.rng.next() < clamp(0.35 + eye / 150 + W.sect.policy.strictness / 300, 0.2, 0.9)) SECT.exposeEmbezzle(W, tre, m);
    }
  };
  SECT.exposeEmbezzle = (W, tre, by) => {
    const amt = tre.embezzled; tre.embezzled = 0;
    W.log('scandal', 'ตรวจพบ ' + tre.h.name.given + ' ยักยอกคลังรวม ' + Math.round(amt) + ' ศิลา!', [tre.id]);
    SECT.punish(W, tre, 3, 'ยักยอกทรัพย์สำนัก', by);
    ECO.earn(W, Math.round(amt * 0.6), 'ยึดคืนจากผู้ยักยอก');
    W.sect.suspicion = Math.max(0, (W.sect.suspicion || 0) - 30);
  };

  /* ---------- ลงโทษ ---------- */
  SECT.punish = (W, n, sev, why, by) => {
    const pol = W.sect.policy, k = 0.6 + pol.strictness / 100 * 0.8;
    sev = Math.max(1, Math.min(4, Math.round(sev * k)));
    const mer = W.sect.policy.meritocracy;
    const fair = !!why;
    let txt = '';
    if (sev === 1) { txt = 'ว่ากล่าวตักเตือน'; HC.feel(n, { mood: -6 }); n.merit = Math.max(0, n.merit - 8); }
    else if (sev === 2) { txt = 'กักบริเวณ/ทำงานชดใช้ 3 วัน'; n.punished = W.t + 3 * 1440; n.merit = Math.max(0, n.merit - 25); HC.feel(n, { mood: -14 }); }
    else if (sev === 3) {
      txt = 'ถอดตำแหน่ง/ลดขั้นและจำคุก 7 วัน'; n.punished = W.t + 7 * 1440; n.merit = Math.max(0, n.merit - 60);
      if (n.post) SECT.dismiss(W, n.post, why); if (n.rank >= 3) SECT.setRank(W, n, Math.max(1, n.rank - 1), why);
    } else { txt = 'ขับออกจากสำนัก'; SECT.expel(W, n, why); }
    n.jail = sev >= 3 && sev < 4 ? W.t + 7 * 1440 : n.jail;
    W.log('punish', n.h.name.given + ' ถูกลงโทษ: ' + txt + ' (' + why + ')', [n.id].concat(by ? [by.id] : []));
    HC.experience(n, sev >= 3 && !fair ? 'punished_unfair' : 'punished_fair', sev * 0.5);
    n.sat = Math.max(0, (n.sat || 60) - sev * 7 + HC.eff(n, 'personality.integrity') * 0.03);
    if (by && by.id !== n.id) { const r = SECT.rel(n, by.id); r.a -= sev * 4; r.v += sev * 3; }
    W.npcs.forEach(o => { if (!o.dead && o.id !== n.id) { const near = SECT.relationScore(o, n); if (near > 30) o.sat = Math.max(0, (o.sat || 60) - sev * 0.8); if (HC.eff(o, 'personality.integrity') > 65 && fair) o.sat = Math.min(100, (o.sat || 60) + 0.6); } });
  };
  SECT.expel = (W, n, why) => {
    if (n.post) { W.sect.posts[n.post] = null; n.post = null; }
    n.exiled = true; n.rank = 0; n.leave = { t: W.t, why: 'ถูกขับ' };
    W.log('expel', n.h.name.given + ' ถูกขับออกจากสำนัก (' + why + ')', [n.id]);
  };

  /* ---------- คำสั่งสำรองคลังและจัดการของขาดแคลน (v1.10.6 + Phase 3) ---------- */
  
  /* ---------- Support Doctrine & Specialist Facilities (v2.0.9) ---------- */
  SECT.ensureSupportDoctrine = W => {
    if (!W || !W.sect) return null;
    if (!W.sect.supportDoctrine) {
      W.sect.supportDoctrine = {
        triagePriority: 'BALANCED', // 'BALANCED', 'ELDER_FIRST', 'SEVEREST_FIRST', 'VANGUARD_FIRST'
        minHpThreshold: 65,
        autoBuffBeforeBattle: true,
        reserveQiPercent: 20,
        preferredBuffs: ['vitalRegen', 'aegisWard', 'fervorMight', 'swiftWind', 'clarityLotus']
      };
    }
    return W.sect.supportDoctrine;
  };

  SECT.setSupportDoctrine = (W, opts) => {
    const doc = SECT.ensureSupportDoctrine(W);
    if (!doc || !opts) return doc;
    if (opts.triagePriority) {
      const valid = ['BALANCED', 'ELDER_FIRST', 'SEVEREST_FIRST', 'VANGUARD_FIRST'];
      if (valid.includes(opts.triagePriority)) doc.triagePriority = opts.triagePriority;
    }
    if (opts.minHpThreshold != null) doc.minHpThreshold = clamp(Number(opts.minHpThreshold), 20, 95);
    if (opts.autoBuffBeforeBattle != null) doc.autoBuffBeforeBattle = !!opts.autoBuffBeforeBattle;
    if (opts.reserveQiPercent != null) doc.reserveQiPercent = clamp(Number(opts.reserveQiPercent), 0, 80);
    if (Array.isArray(opts.preferredBuffs)) doc.preferredBuffs = opts.preferredBuffs.slice();
    if (W.log) {
      W.log('policy', 'ปรับปรุงแนวทางซัพพอร์ตและลำดับการรักษาสำนัก: ' + doc.triagePriority + ' (เกณฑ์ HP ' + doc.minHpThreshold + '%)', []);
    }
    return doc;
  };

  SECT.ensureSpecialistFacilities = W => {
    if (!W || !W.sect) return null;
    if (!W.sect.specialistFacilities) {
      W.sect.specialistFacilities = {
        mech_workshop: { level: 1, maxLevel: 3, nameTh: 'โรงประดิษฐ์กลจักรและหุ่นเชิด', costBase: 800, descTh: 'เร่งการฟื้นฟู Construct Readiness ของหุ่นเชิด และสร้างหุ่นพิทักษ์สำนัก' },
        beast_menagerie: { level: 1, maxLevel: 3, nameTh: 'โรงเพาะเลี้ยงสัตว์วิญญาณ', costBase: 800, descTh: 'เพิ่มอัตราความสำเร็จในการผสมพันธุ์สัตว์วิญญาณ และดูแลอาหาร/ความเหนื่อยล้าอสูรสำนัก' },
        harmonic_pavilion: { level: 1, maxLevel: 3, nameTh: 'หอคีตเวทย์และค่ายกลหนุนนำ', costBase: 800, descTh: 'เพิ่มประสิทธิภาพการรักษาและระยะเวลาบัฟของสายซัพพอร์ต +15% ต่อระดับ' }
      };
    }
    return W.sect.specialistFacilities;
  };

  SECT.upgradeSpecialistFacility = (W, id, opts) => {
    opts = opts || {};
    const facs = SECT.ensureSpecialistFacilities(W);
    if (!facs || !facs[id]) return { ok: false, reason: 'ไม่พบสิ่งปลูกสร้างเฉพาะทาง: ' + id };
    const fac = facs[id];
    if (fac.level >= fac.maxLevel) return { ok: false, reason: fac.nameTh + ' ระดับสูงสุดแล้ว' };
    const cost = Math.round(fac.costBase * fac.level * fac.level);
    if (!opts.free && W.sect.stones < cost) {
      return { ok: false, reason: 'ศิลาวิญญาณไม่เพียงพอ (ต้องการ ' + cost + ' ศิลา)' };
    }
    if (!opts.free) {
      ECO.pay(W, cost, 'ยกระดับ' + fac.nameTh);
    }
    fac.level++;
    if (W.log) {
      W.log('sect', '🏛️ ยกระดับ' + fac.nameTh + ' สู่ระดับ ' + fac.level + '/' + fac.maxLevel + ' สำเร็จ!', []);
    }
    return { ok: true, facility: fac, cost };
  };

  SECT.ensureDirectives = W => {
    const S = W.sect;
    if (!S) return;
    if (!S.reserveDirectives) {
      S.reserveDirectives = {
        minGrainDays: 14,
        minMealReserve: 20,
        expeditionMealCap: 18,
        expeditionMinSafetyMeal: 15,
        medicine: {
          'P:BASIC_HP': 4,
          'P:BASIC_WOUND': 3,
          'P:BASIC_DETOX': 2,
          'P:BASIC_CALM': 2
        },
        gearReserve: { WEAPON: 2, ARMOR: 2, ACCESSORY: 1 }
      };
    }
    if (!Array.isArray(S.shortageDirectives)) S.shortageDirectives = [];
    if (!Array.isArray(S.welfareHistory)) S.welfareHistory = [];
  };

  SECT.updateReserveDirectives = W => {
    SECT.ensureDirectives(W);
    const S = W.sect, pop = Math.max(1, SECT.memberOccupancy(W));
    const tr = SECT.holder(W, 'treasury') || W.byId[S.masterId];
    const m = W.byId[S.masterId];
    const caution = tr ? (HC.eff(tr, 'personality.caution') * 0.6 + (m ? HC.eff(m, 'personality.caution') * 0.4 : 50)) : 50;
    const gen = S.policy ? S.policy.generosity : 50;

    const grainDays = Math.round(clamp(12 + (caution - 50) / 10 + (50 - gen) / 15, 8, 24));
    const mealReserve = Math.round(clamp(pop * (0.8 + (caution - 50) / 100), 10, 60));
    const safetyMeal = Math.max(6, Math.round(mealReserve * 0.65));

    S.reserveDirectives.minGrainDays = grainDays;
    S.reserveDirectives.minMealReserve = mealReserve;
    S.reserveDirectives.expeditionMinSafetyMeal = safetyMeal;
    S.reserveDirectives.expeditionMealCap = Math.max(6, Math.min(24, Math.round(6 + (gen - 50) / 10)));
    S.reserveDirectives.medicine = {
      'P:BASIC_HP': Math.max(3, Math.round(pop * (0.15 + (caution - 50) / 300))),
      'P:BASIC_WOUND': Math.max(2, Math.round(pop * (0.12 + (caution - 50) / 350))),
      'P:BASIC_DETOX': Math.max(2, Math.round(pop * 0.08)),
      'P:BASIC_CALM': Math.max(2, Math.round(pop * 0.08))
    };
    S.reserveDirectives.gearReserve = {
      WEAPON: Math.max(1, Math.round(pop * 0.08)),
      ARMOR: Math.max(1, Math.round(pop * 0.08)),
      ACCESSORY: 1
    };
  };

  SECT.updateShortageDirectives = (W, hallWants) => {
    SECT.ensureDirectives(W);
    const S = W.sect, rd = S.reserveDirectives, pop = Math.max(1, SECT.memberOccupancy(W));
    const directives = [];

    // 1. Provisions / Kitchen
    const curGrain = ECO.count(W, 'grain');
    const targetGrain = pop * (rd.minGrainDays || 14);
    const grainDays = (curGrain * 3 + ECO.count(W, 'meal')) / (pop * 3);
    if (curGrain < targetGrain) {
      directives.push({
        id: 'grain',
        nameTh: 'ข้าวสาร',
        kind: 'provision',
        needed: targetGrain,
        current: curGrain,
        deficit: targetGrain - curGrain,
        priority: grainDays < 7 ? 'critical' : 'high',
        source: 'canteen',
        reason: 'สำรองอาหารความมั่นคง (ปัจจุบันพอใช้ ' + grainDays.toFixed(1) + ' วัน)',
        day: W.day
      });
    }

    const curMeal = ECO.count(W, 'meal');
    const targetMeal = rd.minMealReserve || 20;
    if (curMeal < targetMeal) {
      directives.push({
        id: 'meal',
        nameTh: 'อาหารปรุงเสร็จ',
        kind: 'provision',
        needed: targetMeal,
        current: curMeal,
        deficit: targetMeal - curMeal,
        priority: curMeal < (rd.expeditionMinSafetyMeal || 15) ? 'critical' : 'high',
        source: 'canteen',
        reason: 'สำรองอาหารสำหรับชีวิตประจำวันและการออกเดินทาง',
        day: W.day
      });
    }

    // 2. Essential Medicine Safety Reserves
    const medReserves = rd.medicine || {};
    Object.keys(medReserves).forEach(k => {
      const target = medReserves[k];
      const cur = ECO.count(W, k);
      if (cur < target) {
        directives.push({
          id: k,
          nameTh: ECO.name(k),
          kind: 'medicine',
          needed: target,
          current: cur,
          deficit: target - cur,
          priority: cur === 0 ? 'critical' : 'high',
          source: 'alchemy',
          reason: 'โอสถพื้นฐานต่ำกว่าเกณฑ์สำรองฉุกเฉิน',
          day: W.day
        });
      }
    });

    // 3. Hall Production Inputs
    Object.keys(hallWants || {}).forEach(matId => {
      const needed = hallWants[matId];
      const cur = ECO.count(W, matId);
      if (cur < needed) {
        directives.push({
          id: matId,
          nameTh: ECO.name(matId),
          kind: 'material',
          needed,
          current: cur,
          deficit: needed - cur,
          priority: cur === 0 ? 'high' : 'medium',
          source: 'hall',
          reason: 'ขาดแคลนสำหรับตำรับการผลิตประจำหอ',
          day: W.day
        });
      }
    });

    // 4. Bottlenecks / Breakthrough Needs
    const needSummary = ECO.needSummary(W);
    const btNeed = needSummary.btNeed || {};
    Object.keys(btNeed).forEach(k => {
      const count = btNeed[k];
      if (count > 0) {
        const pillRecipe = (JD.ITEMS.recipes || []).find(r => r.outType === 'PILL' && r.effect && r.effect.btFor && (r.effect.btFor.path + ':' + r.effect.btFor.stage === k));
        if (pillRecipe) {
          const pillKey = pillRecipe.outItemId || ('P:' + pillRecipe.id);
          const have = ECO.count(W, pillKey);
          if (have < count) {
            directives.push({
              id: pillKey,
              nameTh: pillRecipe.outNameTh || ECO.name(pillKey),
              kind: 'medicine',
              needed: count,
              current: have,
              deficit: count - have,
              priority: 'high',
              source: 'alchemy',
              reason: 'ผู้บำเพ็ญติดคอขวดวิถี ' + k + ' (' + count + ' คน)',
              day: W.day
            });
          }
        }
      }
    });

    const priWeight = { critical: 3, high: 2, medium: 1 };
    directives.sort((a, b) => (priWeight[b.priority] || 0) - (priWeight[a.priority] || 0) || b.deficit - a.deficit);
    S.shortageDirectives = directives;
  };

  /* ---------- Phase 3: Dynamic Stock Awareness & Autonomous Stock Allocation ---------- */
  SECT.notifyStockChanged = (W, itemId) => {
    if (!W || !W.sect) return;
    W._stockIntelCache = null;
    if (!Array.isArray(W.npcs) || !W.npcs.length) return;
    SECT.ensureDirectives(W);
    SECT.updateReserveDirectives(W);
    const hallWants = {};
    if (W.sect.orders) {
      ['alchemy', 'forge'].forEach(h => {
        const ord = W.sect.orders[h];
        const r = ord && ord.rid && ECO.recipeById ? ECO.recipeById[ord.rid] : null;
        if (r && Array.isArray(r.inputs)) {
          r.inputs.forEach(inp => {
            hallWants[inp.matId] = Math.max(hallWants[inp.matId] || 0, inp.count * 2);
          });
        }
      });
    }
    SECT.updateShortageDirectives(W, hallWants);
    W.sect.buyList = [];
    (W.sect.shortageDirectives || []).slice(0, 8).forEach(d => {
      if (d.deficit > 0 && d.id) {
        W.sect.buyList.push({ id: d.id, n: Math.min(12, Math.ceil(d.deficit)) });
      }
    });
    if (ECO.inventoryIntelligence) ECO.inventoryIntelligence(W, true);
  };

  const BASIC_PILL_SET = new Set((JD.CP && JD.CP.BASIC ? JD.CP.BASIC : []).map(r => 'P:' + r.id));

  SECT.canAccessItem = (W, n, itemSpec) => {
    if (!W || !n || n.dead || n.exiled || n.away) return false;
    if (!itemSpec) return false;
    const tier = itemSpec.tier || 1;
    const maxAllowedTier = Math.max(tier <= 2 ? 2 : 1, SECT.canLearnTier(W, n) + 1);
    if (tier > maxAllowedTier && n.rank < 4 && !n.post && !n.mentor) return false;
    const minStage = itemSpec.minStage || 0;
    const stage = n.cult ? (CULT.effectiveTechStage ? CULT.effectiveTechStage(n) : (n.cult.stage || 0)) : 0;
    if (minStage > stage) return false;
    const paths = Array.isArray(itemSpec.compatiblePath) ? itemSpec.compatiblePath : (itemSpec.compatiblePath ? [itemSpec.compatiblePath] : ['ANY']);
    if (!paths.includes('ANY')) {
      if (!n.cult || !paths.includes(n.cult.path)) return false;
    }
    return true;
  };

  SECT.evaluateStockDistribution = W => {
    if (!W || !W.sect) return { reserve: [], sale: [], gift: [] };
    SECT.ensureDirectives(W);
    SECT.updateReserveDirectives(W);
    const S = W.sect;
    const rd = S.reserveDirectives;
    const reserve = [], sale = [], gift = [];

    // 1. Evaluate Stock (provisions, materials, pills)
    Object.keys(S.stock || {}).forEach(id => {
      const count = ECO.count(W, id);
      if (count <= 0) return;
      const resFloor = (g.EXT && g.EXT.reserveForSect) ? g.EXT.reserveForSect(W, id) : (ECO.reserveFloor ? ECO.reserveFloor(W, id) : 2);
      const reservedQty = Math.min(count, resFloor);
      if (reservedQty > 0) {
        reserve.push({ kind: ECO.isPill(id) ? 'PILL' : (id === 'grain' || id === 'meal') ? 'PROVISION' : 'MATERIAL', id, nameTh: ECO.name(id), qty: reservedQty, reserveFloor: resFloor, reason: 'สำรองตามเกณฑ์ความมั่นคงสำนัก' });
      }
      const excess = count - reservedQty;
      if (excess <= 0) return;

      if (ECO.isPill(id)) {
        if (BASIC_PILL_SET.has(id)) {
          reserve.push({ kind: 'PILL', id, nameTh: ECO.name(id), qty: excess, reserveFloor: resFloor, reason: 'โอสถสวัสดิการพื้นฐาน (ไม่แจกเป็นของขวัญรายวัน)' });
          return;
        }
        const info = ECO.pillInfo(id) || {};
        // Check if any member has a real non-basic need (bottleneck, severe injury/toxin/heartDemon, or cultivation progress)
        const needy = W.npcs.filter(n => {
          if (!SECT.canAccessItem(W, n, { tier: info.tier || 2, compatiblePath: info.compatiblePath || 'ANY', minStage: info.minStage || 0 })) return false;
          const eff = info.effect || {};
          if (eff.btFor && n.cult && n.cult.path === eff.btFor.path && n.cult.stage === eff.btFor.stage && CULT.ready(n)) return true;
          if (eff.clearToxic && n.cult && (n.cult.toxic || 0) >= 30) return true;
          if (eff.clearHeartDemon && (n.h.state.heartDemon || 0) >= 35) return true;
          if (eff.healInjury && Array.isArray(n.inj) && n.inj.length > 0) return true;
          if (eff.cultivationBoost && n.cult && n.rank >= 1) return true;
          return false;
        });
        if (needy.length > 0) {
          const giftQty = Math.min(excess, needy.length);
          gift.push({ kind: 'PILL', id, nameTh: ECO.name(id), qty: giftQty, tier: info.tier || 2, reason: 'มีศิษย์ที่เหมาะสมต้องใช้ทะลวงขั้น/บำรุงตบะ' });
          if (excess > giftQty) {
            sale.push({ kind: 'PILL', id, nameTh: ECO.name(id), qty: excess - giftQty, tier: info.tier || 2, reason: 'ส่วนเกินเหนือเกณฑ์สำรองและความต้องการภายใน' });
          }
        } else {
          sale.push({ kind: 'PILL', id, nameTh: ECO.name(id), qty: excess, tier: info.tier || 2, reason: 'ส่วนเกินเหนือเกณฑ์สำรองพร้อมจำหน่าย' });
        }
      } else if (id !== 'grain' && id !== 'meal') {
        const m = ECO.matById[id];
        sale.push({ kind: 'MATERIAL', id, nameTh: ECO.name(id), qty: excess, tier: m ? m.tier : 1, reason: 'วัตถุดิบเกินเกณฑ์สำรองหอผลิต' });
      }
    });

    // 2. Evaluate Equipment in W.sect.gear
    const gearBySlot = { WEAPON: [], ARMOR: [], ACCESSORY: [] };
    (S.gear || []).forEach(eq => {
      if (eq && gearBySlot[eq.slot]) gearBySlot[eq.slot].push(eq);
    });
    Object.keys(gearBySlot).forEach(slot => {
      const list = gearBySlot[slot].slice().sort((a, b) => (b.combatMult || b.defMult || 0) - (a.combatMult || a.defMult || 0));
      const slotRes = (rd.gearReserve && rd.gearReserve[slot]) || 1;
      list.forEach((eq, idx) => {
        // High-priority unequipped members can receive gear even when total gear is near reserve, or excess above reserve
        const hasUpgradeCandidate = W.npcs.some(n => {
          if (!SECT.canAccessItem(W, n, eq)) return false;
          const cur = n.equip && n.equip[slot];
          const curVal = cur ? (cur.combatMult || cur.defMult || cur.tier || 0) : -1;
          const newVal = eq.combatMult || eq.defMult || eq.tier || 0;
          return newVal > curVal + 0.01;
        });
        if (hasUpgradeCandidate && (idx < list.length - Math.max(0, slotRes - 1) || list.length >= 1)) {
          gift.push({ kind: 'EQUIPMENT', id: eq.id, uid: eq.uid, slot, nameTh: eq.nameTh, qty: 1, tier: eq.tier || 1, item: eq, reason: 'มอบอุปกรณ์เสริมกำลังรบให้ศิษย์ที่เหมาะสม' });
        } else {
          reserve.push({ kind: 'EQUIPMENT', id: eq.id, uid: eq.uid, slot, nameTh: eq.nameTh, qty: 1, tier: eq.tier || 1, reason: 'สำรองยุทโธปกรณ์ประจำคลังแสง' });
        }
      });
    });

    // 3. Evaluate Specialization Crystals in W.sect.crystals
    Object.keys(S.crystals || {}).forEach(subKey => {
      const qty = S.crystals[subKey] || 0;
      if (qty <= 0) return;
      const subId = subKey.startsWith("S:") ? subKey.slice(2) : subKey;
      const subObj = CULT.subList.find(x => x.sub.id === subId);
      if (!subObj) return;
      const candidates = W.npcs.filter(n => !n.dead && !n.exiled && !n.away && n.rank >= 1 && n.cult && n.cult.path === subObj.path && n.cult.sub === 'NONE');
      if (candidates.length > 0) {
        gift.push({ kind: 'CRYSTAL', id: subId, nameTh: 'ผลึกสายย่อย「' + subObj.sub.nameTh + '」', qty: Math.min(qty, candidates.length), path: subObj.path, reason: 'มอบผลึกสืบทอดสายย่อยให้ศิษย์ที่ยังไร้สายเฉพาะทาง' });
      } else {
        reserve.push({ kind: 'CRYSTAL', id: subId, nameTh: 'ผลึกสายย่อย「' + subObj.sub.nameTh + '」', qty, reason: 'สำรองรอศิษย์วิถี ' + subObj.path });
      }
    });

    return { reserve, sale, gift };
  };

  function recipientScoreForItem(W, evaluator, n, itemSpec, roleBoosts) {
    const pol = W.sect.policy || { meritocracy: 50, generosity: 50 };
    const evalIntegrity = evaluator ? HC.eff(evaluator, 'personality.integrity') : 50;
    const merK = clamp(((pol.meritocracy || 50) * 0.65 + evalIntegrity * 0.35) / 100, 0.10, 0.92);
    const rel = evaluator ? SECT.relationScore(evaluator, n) : 0;
    const flat = (evaluator && g.COG && g.COG.flatteryBonus) ? g.COG.flatteryBonus(evaluator, n) : 0;
    const eye = evaluator ? (HC.eff(evaluator, 'intellect.judgement') * 0.55 + HC.eff(evaluator, 'intellect.readPeople') * 0.45) : 55;
    const noise = (W.rng && W.rng.gauss) ? W.rng.gauss(0, Math.max(1.2, (100 - eye) / 14)) : 0;
    const stage = n.cult ? (CULT.effectiveTechStage ? CULT.effectiveTechStage(n) : (n.cult.stage || 0)) : 0;
    const roleBonus = (n.post && roleBoosts[n.post]) ? roleBoosts[n.post] : 0;
    const rankBonus = n.rank * 4;
    const meritScore = Math.min(30, (n.merit || 0) * 0.12);
    let elemBonus = 0;
    if (g.ELEM && itemSpec && (itemSpec.element || itemSpec.elementProfile)) {
      const ctx = itemSpec.slot ? "equipment" : itemSpec.subPaths ? "pathChoice" : "cultivation";
      const comp = g.ELEM.resolveCompatibility(n, itemSpec, ctx);
      elemBonus = ((comp.multiplier || 1) - 1) * 32;
    }
    return (stage * 7 + rankBonus + meritScore + roleBonus + elemBonus) * merK + ((rel + flat * 1.4) * 0.55) * (1 - merK) + noise;
  }

  SECT.distributeSectStock = (W, opts) => {
    opts = opts || {};
    if (!W || !W.sect) return { gifted: 0, items: [] };
    SECT.ensureDirectives(W);
    const S = W.sect;
    const tre = SECT.holder(W, 'treasury');
    const master = W.byId[S.masterId];
    const dep = W.byId[S.deputyId];
    const evaluator = SECT.isOfficerAvailable(W, tre) ? tre : SECT.isOfficerAvailable(W, master) ? master : SECT.isOfficerAvailable(W, dep) ? dep : null;
    if (!evaluator) return { gifted: 0, items: [] };

    const giftedItems = [];
    const maxGifts = opts.maxGifts != null ? opts.maxGifts : 4;

    // 1. Equipment distribution from W.sect.gear (respecting suitability, weapon preferences, and member-shop window)
    if (Array.isArray(S.gear) && S.gear.length > 0) {
      const alive = W.npcs.filter(n => !n.dead && !n.exiled && !n.away && n.cult);
      const roleBoosts = { guard: 16, commander: 18, martial: 14, mission: 12, wildwarden: 14, discipline: 10 };
      S.gear.sort((a, b) => (b.combatMult || b.defMult || 0) - (a.combatMult || a.defMult || 0));

      for (let i = S.gear.length - 1; i >= 0 && giftedItems.length < maxGifts; i--) {
        const eq = S.gear[i];
        if (!eq || !eq.slot || eq.retired || eq.broken || (eq.procedural && eq.dur != null && eq.dur <= 0)) continue;
        // Donated items stay in W.sect.gear during the member-shop purchase window unless forced or filling an empty T1 slot
        const inShopWindow = !opts.forceDistribute && eq.donatedBy != null && (W.day - (eq.listedAtDay != null ? eq.listedAtDay : W.day)) < 6;
        const cands = alive.filter(n => {
          if (!SECT.canAccessItem(W, n, eq)) return false;
          if (eq.donatedBy === n.id && !opts.forceDistribute) return false;
          const cur = n.equip && n.equip[eq.slot];
          if (inShopWindow && (cur || (eq.tier || 1) > 1)) return false;
          if (g.MARTIAL && g.MARTIAL.classifyGearForNpc) {
            return g.MARTIAL.classifyGearForNpc(W, n, eq, 0).category === 'useful-now';
          }
          const curVal = cur ? (cur.combatMult || cur.defMult || (cur.tier || 0) * 0.03) : -1;
          const newVal = eq.combatMult || eq.defMult || (eq.tier || 1) * 0.03;
          return newVal > curVal + 0.005;
        });
        if (!cands.length) continue;
        cands.sort((a, b) => {
          const aEmpty = !(a.equip && a.equip[eq.slot]) ? 12 : 0;
          const bEmpty = !(b.equip && b.equip[eq.slot]) ? 12 : 0;
          const aDelta = (g.MARTIAL && g.MARTIAL.classifyGearForNpc) ? (g.MARTIAL.classifyGearForNpc(W, a, eq, 0).deltaScore || 0) * 0.15 : 0;
          const bDelta = (g.MARTIAL && g.MARTIAL.classifyGearForNpc) ? (g.MARTIAL.classifyGearForNpc(W, b, eq, 0).deltaScore || 0) * 0.15 : 0;
          return (recipientScoreForItem(W, evaluator, b, eq, roleBoosts) + bEmpty + bDelta) - (recipientScoreForItem(W, evaluator, a, eq, roleBoosts) + aEmpty + aDelta);
        });
        const win = cands[0];
        S.gear.splice(i, 1);
        win.equip = win.equip || { WEAPON: null, ARMOR: null, ACCESSORY: null };
        const prev = win.equip[eq.slot];
        if (prev) {
          win.inv = win.inv || {};
          win.inv.gear = win.inv.gear || [];
          win.inv.gear.push(prev);
        }
        win.equip[eq.slot] = eq;
        HC.bump(win);
        if (g.STATS && g.STATS.dirty) g.STATS.dirty(win);
        const reason = prev ? 'อัปเกรดแทน「' + prev.nameTh + '」ตามความเหมาะสมและผลงาน' : 'จัดสรรยุทโธปกรณ์ให้ศิษย์ที่ยังขาดแคลน';
        const giftRow = { day: W.day, kind: 'EQUIPMENT', itemId: eq.id, itemUid: eq.uid, nameTh: eq.nameTh, qty: 1, actorId: evaluator.id, recipientId: win.id, reason };
        S.giftHistory = S.giftHistory || [];
        S.giftHistory.push(giftRow);
        if (S.giftHistory.length > 60) S.giftHistory.splice(0, S.giftHistory.length - 60);
        giftedItems.push(giftRow);
        W.log('finance', '[มอบของรางวัล] ' + evaluator.h.name.given + ' มอบอุปกรณ์「' + eq.nameTh + '」ให้ ' + win.h.name.given + ' (' + reason + ')', [evaluator.id, win.id], { txKind: 'gift', itemId: eq.id, itemUid: eq.uid, qty: 1, actorId: evaluator.id, recipientId: win.id, reason });
      }
    }

    if (opts.onlyGear) {
      if (giftedItems.length) SECT.notifyStockChanged(W);
      return { gifted: giftedItems.length, items: giftedItems };
    }

    // 2. Non-basic Pill distribution from W.sect.stock (never distributes BASIC_PILLS)
    Object.keys(S.stock || {}).forEach(pillKey => {
      if (giftedItems.length >= maxGifts) return;
      if (!ECO.isPill(pillKey) || BASIC_PILL_SET.has(pillKey)) return;
      const count = ECO.count(W, pillKey);
      const resFloor = (g.EXT && g.EXT.reserveForSect) ? g.EXT.reserveForSect(W, pillKey) : 1;
      const info = ECO.pillInfo(pillKey);
      if (!info || count <= 0) return;
      const eff = info.effect || {};

      // Find eligible recipients with a clear non-daily reason
      const cands = W.npcs.filter(n => {
        if (!SECT.canAccessItem(W, n, { tier: info.tier || 2, compatiblePath: info.compatiblePath || 'ANY', minStage: info.minStage || 0 })) return false;
        if (n.inv && n.inv.pills && (n.inv.pills[pillKey] || 0) >= 2) return false;
        if (eff.btFor && n.cult && n.cult.path === eff.btFor.path && n.cult.stage === eff.btFor.stage && CULT.ready(n)) return true;
        if (count <= resFloor) return false; // Only dip into reserve for exact bottleneck matches
        if (eff.clearToxic && n.cult && (n.cult.toxic || 0) >= 35) return true;
        if (eff.clearHeartDemon && (n.h.state.heartDemon || 0) >= 40) return true;
        if (eff.healInjury && Array.isArray(n.inj) && n.inj.length > 0) return true;
        if ((eff.cultivationBoost || eff.foundationBonus) && n.cult && n.rank >= 1) return true;
        return false;
      });
      if (!cands.length) return;
      cands.sort((a, b) => recipientScoreForItem(W, evaluator, b, info, {}) - recipientScoreForItem(W, evaluator, a, info, {}));
      const win = cands[0];
      if (!ECO.take(W, pillKey, 1)) return;
      ECO.addPersonalPill(win, pillKey, 1, 1);
      const reason = (eff.btFor && win.cult && CULT.ready(win))
        ? 'หนุนทะลวงคอขวดวิถี ' + win.cult.path + ' ขั้น ' + win.cult.stage
        : 'จัดสรรโอสถชั้นสูงตามความเหมาะสมและผลงาน';
      const giftRow = { day: W.day, kind: 'PILL', itemId: pillKey, nameTh: ECO.name(pillKey), qty: 1, actorId: evaluator.id, recipientId: win.id, reason };
      S.giftHistory = S.giftHistory || [];
      S.giftHistory = S.giftHistory || [];
      S.giftHistory.push(giftRow);
      if (S.giftHistory.length > 60) S.giftHistory.splice(0, S.giftHistory.length - 60);
      giftedItems.push(giftRow);
      W.log('finance', '[มอบของรางวัล] ' + evaluator.h.name.given + ' จัดสรรโอสถ「' + ECO.name(pillKey) + '」ให้ ' + win.h.name.given + ' (' + reason + ')', [evaluator.id, win.id], { txKind: 'gift', itemId: pillKey, qty: 1, actorId: evaluator.id, recipientId: win.id, reason });
    });

    // 3. Specialization Crystal distribution from W.sect.crystals
    Object.keys(S.crystals || {}).forEach(subKey => {
      if (giftedItems.length >= maxGifts) return;
      const qty = S.crystals[subKey] || 0;
      if (qty <= 0) return;
      const subId = subKey.startsWith("S:") ? subKey.slice(2) : subKey;
      const normKey = "S:" + subId;
      const subObj = CULT.subList.find(x => x.sub.id === subId);
      if (!subObj) return;
      const cands = W.npcs.filter(n => !n.dead && !n.exiled && !n.away && n.rank >= 1 && n.cult && n.cult.path === subObj.path && n.cult.sub === 'NONE' && !(n.inv && n.inv.crystals && (n.inv.crystals[normKey] > 0 || n.inv.crystals[subId] > 0)));
      if (!cands.length) return;
      cands.sort((a, b) => recipientScoreForItem(W, evaluator, b, Object.assign({ tier: 3 }, subObj.sub), {}) - recipientScoreForItem(W, evaluator, a, Object.assign({ tier: 3 }, subObj.sub), {}));
      const win = cands[0];
      S.crystals[subKey]--;
      if (S.crystals[subKey] <= 0) delete S.crystals[subKey];
      win.inv.crystals = win.inv.crystals || {};
      win.inv.crystals[normKey] = (win.inv.crystals[normKey] || 0) + 1;
      const reason = 'มอบผลึกสืบทอดสายย่อย「' + subObj.sub.nameTh + '」ให้ศิษย์วิถี ' + subObj.path;
      const giftRow = { day: W.day, kind: 'CRYSTAL', itemId: subId, nameTh: 'ผลึกสายย่อย「' + subObj.sub.nameTh + '」', qty: 1, actorId: evaluator.id, recipientId: win.id, reason };
      S.giftHistory = S.giftHistory || [];
      S.giftHistory.push(giftRow);
      if (S.giftHistory.length > 60) S.giftHistory.splice(0, S.giftHistory.length - 60);
      giftedItems.push(giftRow);
      W.log('finance', '[มอบของรางวัล] ' + evaluator.h.name.given + ' มอบผลึกสายย่อย「' + subObj.sub.nameTh + '」ให้ ' + win.h.name.given + ' (' + reason + ')', [evaluator.id, win.id], { txKind: 'gift', itemId: 'CRYSTAL:' + subId, qty: 1, actorId: evaluator.id, recipientId: win.id, reason });
    });

    if (giftedItems.length) SECT.notifyStockChanged(W);
    return { gifted: giftedItems.length, items: giftedItems };
  };

  /* ---------- หัวหน้าหอ: สั่งงานในหอของตน ---------- */
  SECT.hallHeads = W => {
    SECT.ensureDirectives(W);
    SECT.updateReserveDirectives(W);
    const S = W.sect; S.orders = S.orders || {};
    const hallWants = {};
    ['alchemy', 'forge'].forEach(h => {
      const appointed = SECT.holder(W, h);
      const head = g.COG && !g.COG.available(appointed, W) ? null : appointed;
      const o = ECO.pickOrder(W, h, head);
      S.orders[h] = o.recipe ? { rid: o.recipe.id, why: o.why, by: head?.id || null } : null;
      if (head && !head.dead && !head.away && !head.sealed && g.COG) g.COG.officeDecision(W, head, 'วางแผนผลิต ' + (o.recipe ? o.recipe.nameTh : 'รอวัตถุดิบ'), [o.why || 'ยังไม่มีตำรับที่พร้อมผลิต']);
      Object.keys(o.want || {}).forEach(k => {
        hallWants[k] = Math.max(hallWants[k] || 0, o.want[k]);
      });
    });
    SECT.updateShortageDirectives(W, hallWants);
    if (g.COG) g.COG.reviewOffices(W);
    // หอคลัง: สั่งซื้อวัตถุดิบ/เสบียงตามที่ขาด (ผ่านคาราวาน)
    const tre = SECT.holder(W, 'treasury');
    S.buyList = [];
    (S.shortageDirectives || []).slice(0, 8).forEach(d => {
      if (d.deficit > 0 && d.id) {
        S.buyList.push({ id: d.id, n: Math.min(12, Math.ceil(d.deficit)) });
      }
    });
    // ทุจริต
    if (tre && W.day % 10 === 0) {
      const gr = (HC.eff(tre, 'values.wealthResource') + (100 - HC.eff(tre, 'personality.integrity')) + HC.derived(tre).materialism) / 3 - 40;
      if (gr > 12 && W.rng.chance(clamp(gr / 90, 0.05, 0.6)) && W.sect.stones > 400) {
        const amt = Math.round(W.sect.stones * W.rng.float(0.004, 0.015) + 10);
        W.sect.stones -= amt; tre.inv.stones += amt; tre.embezzled = (tre.embezzled || 0) + amt;
        W.sect.ledger.push({ t: W.t, amt: -amt, why: 'บัญชีไม่ตรง(ยักยอก)' });
        W.sect.suspicion = (W.sect.suspicion || 0) + 4;
      }
      const disc = SECT.holder(W, 'discipline');
      if (disc && tre.embezzled > 0 && W.rng.chance(0.1 * (HC.eff(disc, 'intellect.perceptiveness') / 60) * (0.5 + W.sect.policy.strictness / 100))) SECT.exposeEmbezzle(W, tre, disc);
    }
  };

  /* ---------- สืบทอดตำแหน่งเจ้าสำนัก ---------- */
  SECT.succession = (W, why) => {
    const S = W.sect, old = W.byId[S.masterId];

    // 1. If an appointed successor disciple exists and is valid, they ascend immediately!
    let succ = SECT.holder(W, 'disciples') || (S.successorId ? W.byId[S.successorId] : null);
    if (succ && !succ.dead && !succ.exiled && !succ.away) {
      if (succ.post) { S.posts[succ.post] = null; succ.post = null; }
      if (S.successorId === succ.id) S.successorId = null;
      if (S.deputyId === succ.id) S.deputyId = null;
      succ.rank = 6;
      S.masterId = succ.id;
      succ.sat = 95;
      if (old && !old.dead && old.rank === 6) { old.rank = 4; }
      W.log('succession', 'ศิษย์สืบทอด ' + succ.h.name.given + ' ขึ้นสืบทอดตำแหน่งเจ้าสำนักคนใหม่ตามพินัยกรรมสำนัก' + (why ? ' (' + why + ')' : ''), [succ.id]);
      W.fame(6);
      S.policyShift = W.day;
      return succ;
    }

    // 2. No successor disciple: gather candidates from rank >= 3.
    // If none (e.g. early game or heavy casualties), cascade down to rank >= 1, then rank >= 0!
    let cands = W.npcs.filter(n => !n.dead && !n.away && !n.exiled && n.rank >= 3 && n.id !== S.masterId);
    if (!cands.length) {
      cands = W.npcs.filter(n => !n.dead && !n.away && !n.exiled && n.rank >= 1 && n.id !== S.masterId);
    }
    if (!cands.length) {
      cands = W.npcs.filter(n => !n.dead && !n.exiled && n.id !== S.masterId);
    }
    if (!cands.length) {
      W.log('crisis', 'สำนักไร้ผู้สืบทอดและไม่มีสมาชิกคนใดหลงเหลืออยู่!', []);
      return null;
    }

    // 3. Elders and members vote
    const voters = W.npcs.filter(n => !n.dead && !n.exiled && n.id !== S.masterId && (n.rank >= 4 || n.rank >= 1));
    const score = c => {
      const stage = CULT.equivalentStage(c);
      let tot = 0;
      voters.forEach(v => {
        if (v.id === c.id) { tot += 25; return; }
        const rel = SECT.relationScore(v, c);
        const vm = HC.eff(v, 'personality.rationality') / 100;
        const vWeight = (v.id === S.deputyId) ? 2.5 : (v.rank >= 4 ? (v.post ? 1.5 : 1.0) : 0.8);
        tot += vWeight * (rel * 0.5 + (stage * 6 + CULT.power(c) / 400 + SECT.relevance('mission', c) * 0.1) * (0.4 + vm * 0.6) + (c.id === S.deputyId ? 12 : 0) + HC.eff(c, 'social.leadership') * 0.2);
      });
      return tot / Math.max(1, voters.length);
    };
    cands.sort((a, b) => score(b) - score(a));
    const nm = cands[0];
    if (nm.post) { S.posts[nm.post] = null; nm.post = null; }
    if (S.successorId === nm.id) S.successorId = null;
    if (S.deputyId === nm.id) S.deputyId = null;
    nm.rank = 6; S.masterId = nm.id; nm.sat = 90;
    if (old && !old.dead && old.rank === 6) { old.rank = 4; }
    W.log('succession', 'สภาสำนักมีมติเลือก ' + nm.h.name.given + ' ขึ้นเป็นเจ้าสำนักคนใหม่' + (why ? ' (' + why + ')' : ''), [nm.id]);
    W.fame(5);
    cands.slice(1, 4).forEach(c => {
      const amb = HC.eff(c, 'personality.ambition');
      if (amb > 60) {
        c.sat = Math.max(0, (c.sat || 60) - (amb - 50) * 0.4);
        const r = SECT.rel(c, nm.id); r.v += 12; r.a -= 6;
      }
    });
    S.policyShift = W.day;
    return nm;
  };

  /* ---------- รายเดือน ---------- */
  SECT.monthly = W => {
    const S = W.sect;
    const tp = SECT.targetPolicy(W);
    ['openness', 'strictness', 'meritocracy', 'expansion', 'generosity', 'secrecy', 'risk'].forEach(k => { S.policy[k] += (tp[k] - S.policy[k]) * 0.2; });
    Object.keys(tp.focus).forEach(k => { S.policy.focus[k] += (tp.focus[k] - S.policy.focus[k]) * 0.2; });
    if (S.recentRaid) { S.policy.strictness = Math.min(100, S.policy.strictness + 2); S.recentRaid = 0; }
    SECT.paySalaries(W);
    const tribute = Math.round(150 + 26 * Math.sqrt(Math.max(0, S.fame)));
    S.fame *= 0.97;
    ECO.earn(W, tribute, 'ค่าคุ้มครองและของกำนัลจากชุมชนรอบเขา');
    ECO.monthlyMarket(W);
    {
      const governance = SECT.governanceSummary(W);
      const treasurer = SECT.holder(W, 'treasury') || W.byId[S.masterId];
      const legacyAdmin = SECT.isOfficerAvailable(W, treasurer) && g.MARTIAL ? clamp(g.MARTIAL.skillRead(treasurer, 'administration'), 0, 100) : 0;
      const popN = W.npcs.filter(n => !n.dead).length, upkeep = Math.round((1 - legacyAdmin * .001) * (1 - governance.upkeepReduction) * (popN * 7 + W.map.buildings.reduce((s2, b) => s2 + b.level * 15, 0) * clamp((popN + 8) / 45, 0.3, 1)));
      ECO.pay(W, Math.min(upkeep, Math.max(0, S.stones)), 'ค่าบำรุงรักษาสำนัก');
      const gr = ECO.count(W, 'grain'), lim = popN * 25; if (gr > lim) { const rot = Math.floor((gr - lim) * 0.15 * (1 - governance.logisticsEfficiency)); if (rot > 0) ECO.take(W, 'grain', rot); }
      const ml = ECO.count(W, 'meal'), ml2 = popN * 8; if (ml > ml2) { const rot = Math.floor((ml - ml2) * 0.25 * (1 - governance.logisticsEfficiency)); if (rot > 0) ECO.take(W, 'meal', rot); }
    }
    W.npcs.forEach(n => { if (n.dead) return; const tgt = SECT.satTarget(W, n); n.sat = (n.sat == null ? tgt : n.sat + (tgt - n.sat) * 0.35); n.grief = Math.max(0, (n.grief || 0) - 2); });
    W.avgSat = W.npcs.filter(n => !n.dead).reduce((s, n) => s + n.sat, 0) / Math.max(1, W.npcs.filter(n => !n.dead).length);
    const m = W.byId[S.masterId];
    if (m && !m.dead) SECT.checkChallenge(W, m);
    SECT.checkDesertion(W);
  };

  SECT.checkChallenge = (W, m) => {
    const mp = CULT.power(m);
    const c = W.npcs.filter(n => !n.dead && !n.away && n.id !== m.id && n.rank >= 4 && n.cult).filter(n => {
      const amb = (HC.eff(n, 'personality.ambition') + HC.eff(n, 'values.powerStatus')) / 2;
      const rel = SECT.relationScore(n, m);
      return amb > 66 && (n.sat || 60) < 48 && rel < 10 && CULT.power(n) > mp * 0.95 && HC.eff(n, 'personality.loyalty') < 62;
    });
    if (!c.length || !W.rng.chance(0.25)) return;
    const ch = W.rng.pick(c);
    W.log('challenge', ch.h.name.given + ' ท้าชิงตำแหน่งเจ้าสำนักจาก ' + m.h.name.given + ' !', [ch.id, m.id]);
    W.duelQueue = W.duelQueue || [];
    W.duelQueue.push({ a: ch.id, b: m.id, kind: 'leadership', serious: false });
  };
  SECT.checkDesertion = W => {
    W.npcs.forEach(n => {
      if (n.dead || n.away || n.exiled || n.rank >= 5 || n.left) return;
      const low = (n.sat || 60) < 22, stay = (W.day - (n.joinDay || 0)) > 60;
      if (low && stay && W.rng.chance(0.22 + (HC.eff(n, 'values.freedom') - 50) / 300 - (HC.eff(n, 'personality.loyalty') - 50) / 250)) {
        n.leave = { t: W.t, why: 'หนีออกจากสำนัก' }; n.exiled = true; n.deserting = true;
        W.log('desert', n.h.name.given + ' ผิดหวังกับสำนักและหนีออกไป', [n.id]);
      }
    });
  };

  SECT.canLearnTier = (W, n) => {
    const sec = W.sect.policy.secrecy / 100;
    const base = { 0: 1, 1: 2, 2: 3, 3: 5, 4: 6, 5: 7, 6: 7 }[n.rank];
    return Math.max(1, Math.round(base - sec * (n.rank < 4 ? 1.6 : 0.5) + (n.mentor ? 1 : 0)));
  };

  /* ----- บริจาควัตถุดิบส่วนตัวเข้าคลังสำนัก (รับแต้มคุณูปการอย่างถูกต้องครั้งเดียว และป้องกันไอเทมเสกปั๊มแต้ม) ----- */
  SECT.donateMat = (W, npc, matId, qty) => {
    if (!W || !npc || npc.dead || !matId) return { ok: false, reward: 0, reason: 'invalid' };
    if (qty === undefined) qty = 1;
    if (!Number.isSafeInteger(qty) || qty <= 0 || !ECO.matById[matId]) return { ok: false, reward: 0, reason: 'invalid_qty' };
    npc.inv = npc.inv || {};
    npc.inv.mats = npc.inv.mats || {};
    const owned = npc.inv.mats[matId] || 0;
    if (owned < qty) return { ok: false, reward: 0, reason: 'insufficient_mats', owned };

    npc.inv.mats[matId] -= qty;
    if (npc.inv.mats[matId] <= 0) delete npc.inv.mats[matId];

    const spawned = Math.min(qty, (npc.inv.spawnedMats && npc.inv.spawnedMats[matId]) || 0);
    if (spawned > 0) {
      npc.inv.spawnedMats[matId] -= spawned;
      if (npc.inv.spawnedMats[matId] <= 0) delete npc.inv.spawnedMats[matId];
      if (!Object.keys(npc.inv.spawnedMats).length) delete npc.inv.spawnedMats;
    }

    ECO.add(W, matId, qty);
    if (W.sect && Array.isArray(W.sect.shortageDirectives)) {
      const cur = ECO.count(W, matId);
      for (let i = W.sect.shortageDirectives.length - 1; i >= 0; i--) {
        const sd = W.sect.shortageDirectives[i];
        if (sd && sd.id === matId) {
          sd.current = cur;
          sd.deficit = Math.max(0, sd.needed - cur);
          if (sd.deficit <= 0) W.sect.shortageDirectives.splice(i, 1);
        }
      }
    }

    const eligibleQty = Math.max(0, qty - spawned);
    const reward = eligibleQty > 0 ? ((g.CPE && g.CPE.reward) ? g.CPE.reward(W, matId, eligibleQty) : (ECO.base(matId) * 0.22 * eligibleQty)) : 0;
    const minted = (reward > 0 && g.CPE && g.CPE.mint) ? g.CPE.mint(W, npc, reward, 'บริจาควัตถุดิบ「' + ECO.name(matId) + '」', true) : 0;
    if (minted > 0 && g.CPE && g.CPE.S) {
      g.CPE.S(W).donated = (g.CPE.S(W).donated || 0) + minted;
    }
    if (eligibleQty > 0) npc.merit = (npc.merit || 0) + Math.max(1, Math.round(eligibleQty * 0.5));
    if ((minted >= 15 || spawned > 0) && W.log) {
      W.log('finance', npc.h.name.given + ' บริจาค ' + ECO.name(matId) + ' ×' + qty + ' เข้าคลัง ได้ ' + Math.round(minted) + ' คป.' + (spawned > 0 ? ' (ไอเทมเสกได้ 0 คป.)' : ''), [npc.id]);
    }
    return { ok: true, reward: minted, qty, matId, playerSpawned: spawned > 0 };
  };

  /* ============================================================================
   * PHASE 2: CHARACTER EDITOR, ITEM SPAWNER & INVENTORY / BAG MANAGEMENT
   * ============================================================================ */
  const EDITOR = {};

  EDITOR.EDITABLE_GROUPS = {
    personality: { min: 0, max: 100, keys: ['ambition', 'courage', 'discipline', 'empathy', 'aggression', 'loyalty', 'curiosity', 'caution', 'pride', 'integrity', 'composure', 'rationality', 'creativity', 'trustfulness'] },
    values: { min: 0, max: 100, keys: ['martialPeak', 'wealthResource', 'honorLegacy', 'familyClan', 'freedom', 'knowledgeCraft', 'sectDuty', 'powerStatus'] },
    interests: { min: 0, max: 100, keys: ['combat', 'meditation', 'alchemy', 'forging', 'arrays', 'medicine', 'scholarship', 'herbs', 'beasts', 'labor', 'trade', 'leading', 'teaching', 'socializing', 'exploring', 'arts', 'cuisine', 'gambling', 'collecting', 'intrigue', 'solitude', 'worship', 'building', 'romance'] },
    aptitudes: { min: 0, max: 100, keys: ['cultivation', 'comprehension', 'combat', 'crafting', 'command', 'socialCommerce'] },
    physiology: { min: 1, max: 100, keys: ['strength', 'speed', 'agility', 'dexterity', 'balance', 'endurance', 'toughness', 'vitality', 'flexibility', 'reflex', 'recoveryRate', 'immunity', 'spiritualFoundation', 'meridianCapacity', 'meridianIntegrity', 'senseAcuity'] },
    intellect: { min: 1, max: 100, keys: ['reasoning', 'comprehension', 'memory', 'workingMemory', 'learningSpeed', 'thinkingSpeed', 'focus', 'spatial', 'numeracy', 'verbal', 'planning', 'judgement', 'inventiveness', 'intuition', 'perceptiveness', 'readPeople', 'wisdom', 'willpower'] },
    social: { min: 0, max: 100, keys: ['charisma', 'leadership', 'persuasion', 'deception', 'intimidation', 'teaching', 'hospitality'] },
    affinities: { min: 0, max: 100, keys: ['FIRE', 'WATER_ICE', 'LIGHTNING', 'WIND', 'EARTH_METAL', 'WOOD_LIFE', 'YIN_SHADOW', 'LIGHT_YANG', 'SWORD', 'BLADE', 'SPEAR', 'FIST_PALM', 'MOVEMENT', 'BODY_REFINING', 'SOUL_DIVINE', 'ALCHEMY', 'FORGING', 'ARRAY', 'TALISMAN', 'BEAST_TAMING', 'MEDICINE', 'POISON', 'SCRIPTURE'] },
    skills: { min: 0, max: 100, keys: ['SWORD', 'BLADE', 'SPEAR', 'FIST_PALM', 'BOW', 'STAFF', 'FOCUS', 'MOVEMENT', 'BODY_REFINING', 'SOUL_DIVINE', 'ALCHEMY', 'FORGING', 'ARRAY', 'TALISMAN', 'BEAST_TAMING', 'MEDICINE', 'POISON', 'SCRIPTURE', 'herbalism', 'mining', 'cooking', 'trading', 'administration', 'diplomacy', 'stealth', 'survival', 'arts', 'construction', 'ritual'] }
  };

  EDITOR.memberEditState = (W, nOrId) => {
    const n = typeof nOrId === 'string' ? (W && W.byId && W.byId[nOrId]) : nOrId;
    if (!W || !n || !W.byId || !W.byId[n.id]) {
      return { ok: false, canEditStats: false, canEditCult: false, canEditEquip: false, canEditBag: false, reason: 'ไม่พบตัวละครในสำนัก', warnings: [] };
    }
    if (n.dead) {
      return { ok: false, canEditStats: false, canEditCult: false, canEditEquip: false, canEditBag: false, reason: 'ตัวละครเสียชีวิตแล้ว ไม่สามารถแก้ไขได้', warnings: [] };
    }
    if (n.exiled) {
      return { ok: false, canEditStats: false, canEditCult: false, canEditEquip: false, canEditBag: false, reason: 'ตัวละครออกจากสำนักแล้ว ไม่สามารถแก้ไขได้', warnings: [] };
    }
    const warnings = [];
    if (n.away) warnings.push('ตัวละครกำลังปฏิบัติภารกิจนอกสำนัก');
    if (n.travel) warnings.push('ตัวละครกำลังเดินทางในสำนัก');
    const inFight = !!(n.act && (n.act === 'fight' || n.act.id === 'fight'));
    if (inFight) warnings.push('ตัวละครกำลังต่อสู้');
    if (n.sealed || n.sealedBt) warnings.push('ตัวละครกำลังปิดด่าน');
    if (n.id === W.sect.masterId) warnings.push('ตัวละครนี้เป็นเจ้าสำนัก (การเปลี่ยนนิสัยจะมีผลต่อนโยบายสำนัก)');
    else if (n.post) warnings.push('ตัวละครดำรงตำแหน่ง' + (SECT.POSTS[n.post] ? SECT.POSTS[n.post].nameTh : n.post));
    return {
      ok: true,
      canEditStats: true,
      canEditCult: !inFight,
      canEditEquip: !inFight,
      canEditBag: true,
      reason: '',
      warnings
    };
  };

  function validateCharacterPatch(W, n, patch) {
    const errors = [];
    if (!patch || typeof patch !== 'object') {
      return { ok: false, errors: ['ข้อมูลแก้ไขไม่ถูกต้อง'] };
    }
    // Reject direct arbitrary overrides of derived combat/HP/Qi ceilings
    const forbidden = ['hpMax', 'qiMax', 'combatPower', 'atk', 'def', 'derived', 'power'];
    for (const k of forbidden) {
      if (patch[k] !== undefined || (patch.state && patch.state[k] !== undefined) || (patch.cult && patch.cult[k] !== undefined)) {
        errors.push('ไม่อนุญาตให้แก้ไขค่าคำนวณปลายทาง (' + k + ') โดยตรง กรุณาแก้ค่าพื้นฐานหรือขั้นตบะแทน');
      }
    }
    Object.keys(EDITOR.EDITABLE_GROUPS).forEach(grp => {
      if (!patch[grp]) return;
      if (typeof patch[grp] !== 'object') { errors.push('หมวด ' + grp + ' ไม่ถูกต้อง'); return; }
      const spec = EDITOR.EDITABLE_GROUPS[grp];
      Object.keys(patch[grp]).forEach(k => {
        const val = patch[grp][k];
        if (typeof val !== 'number' || !Number.isFinite(val)) {
          errors.push('ค่า ' + grp + '.' + k + ' ต้องเป็นตัวเลขที่ถูกต้อง');
        } else if (val < spec.min || val > spec.max) {
          errors.push('ค่า ' + grp + '.' + k + ' ต้องอยู่ในช่วง ' + spec.min + ' ถึง ' + spec.max);
        }
      });
    });
    const inFight = !!(n && n.act && (n.act === 'fight' || n.act.id === 'fight'));
    if (patch.cult && typeof patch.cult === 'object') {
      if (inFight) errors.push('ตัวละครกำลังต่อสู้ ไม่สามารถเปลี่ยนวิถีหรือขั้นตบะระหว่างการต่อสู้ได้');
      const c = patch.cult;
      if (c.path !== undefined && c.path !== null && c.path !== 'MORTAL' && c.path !== 'NONE' && !CULT.PATHS[c.path]) {
        errors.push('ไม่พบวิถีหลัก: ' + c.path);
      }
      const targetPath = (c.path && c.path !== 'MORTAL' && c.path !== 'NONE') ? c.path : (c.path === 'MORTAL' || c.path === 'NONE' ? null : (n.cult ? n.cult.path : null));
      if (targetPath && c.stage !== undefined) {
        const maxStage = CULT.PATHS[targetPath].maxStage;
        if (typeof c.stage !== 'number' || !Number.isFinite(c.stage) || c.stage < 0 || c.stage > maxStage) {
          errors.push('ระดับตบะของวิถี ' + targetPath + ' ต้องอยู่ในช่วง 0 ถึง ' + maxStage);
        }
      }
      if (targetPath && c.sub !== undefined && c.sub !== 'NONE') {
        const resolvedSub = (CULT.resolveSubId ? CULT.resolveSubId(c.sub) : c.sub) || c.sub;
        const validSubs = CULT.PATHS[targetPath].subPaths.map(s => s.id);
        if (!validSubs.includes(resolvedSub)) {
          errors.push('สายย่อย ' + c.sub + ' ไม่ตรงกับวิถีหลัก ' + targetPath);
        }
      }
      if (c.xp !== undefined && (typeof c.xp !== 'number' || !Number.isFinite(c.xp) || c.xp < 0)) {
        errors.push('ค่าประสบการณ์ตบะ (xp) ต้องเป็นตัวเลขตั้งแต่ 0 ขึ้นไป');
      }
    }
    if (patch.economy && typeof patch.economy === 'object') {
      ['stones', 'cp', 'merit', 'sat', 'rank'].forEach(k => {
        if (patch.economy[k] !== undefined) {
          const v = patch.economy[k];
          if (typeof v !== 'number' || !Number.isFinite(v) || v < 0) {
            errors.push('ค่า ' + k + ' ต้องเป็นตัวเลขที่ไม่ติดลบ');
          }
        }
      });
    }
    if (patch.root && typeof patch.root === "object" && g.ELEM) {
      const rSpec = {
        rootCount: patch.root.rootCount != null ? Number(patch.root.rootCount) : (Array.isArray(patch.root.elements) ? patch.root.elements.length : 1),
        rootCapacityTrait: patch.root.rootCapacityTrait || null,
        elements: Array.isArray(patch.root.elements) ? patch.root.elements : [],
        grades: Array.isArray(patch.root.grades) ? patch.root.grades : []
      };
      const rVal = g.ELEM.validateRootSpec(rSpec);
      if (!rVal.ok) rVal.errors.forEach(e => errors.push(e));
    }
    if (patch.elemental && typeof patch.elemental === "object" && g.ELEM) {
      if (patch.elemental.mastery && typeof patch.elemental.mastery === "object") {
        for (const [el, v] of Object.entries(patch.elemental.mastery)) {
          if (!g.ELEM.isValidOrdinaryElement(el)) errors.push("ธาตุสามัญไม่ถูกต้องใน mastery: " + el);
          else if (typeof v !== "number" || !Number.isFinite(v) || v < 0 || v > 100) errors.push("ความเข้าใจธาตุ " + el + " ต้องอยู่ในช่วง 0 ถึง 100");
        }
      }
      if (patch.elemental.specialMastery && typeof patch.elemental.specialMastery === "object") {
        for (const [el, v] of Object.entries(patch.elemental.specialMastery)) {
          if (!g.ELEM.isValidSpecialElement(el)) errors.push("ธาตุพิเศษไม่ถูกต้องใน specialMastery: " + el);
          else if (typeof v !== "number" || !Number.isFinite(v) || v < 0 || v > 100) errors.push("ความเข้าใจธาตุพิเศษ " + el + " ต้องอยู่ในช่วง 0 ถึง 100");
        }
      }
    }
    return { ok: errors.length === 0, errors };
  }

  function applyPatchToNpc(W, n, patch, isPreview) {
    const reconciled = { unequippedGear: [], removedTechs: [], notes: [] };
    if (patch.identity && typeof patch.identity === 'object') {
      if (typeof patch.identity.surname === 'string' && patch.identity.surname.trim()) n.h.name.surname = patch.identity.surname.trim();
      if (typeof patch.identity.given === 'string' && patch.identity.given.trim() && patch.identity.given.trim() !== n.h.name.given) { n.h.name.formerNames = Array.from(new Set((n.h.name.formerNames || []).concat([n.h.name.given]))); n.h.name.given = patch.identity.given.trim(); }
      if (typeof patch.identity.title === 'string') n.h.name.title = patch.identity.title.trim();
    }
    Object.keys(EDITOR.EDITABLE_GROUPS).forEach(grp => {
      if (!patch[grp] || !n.h[grp]) return;
      const spec = EDITOR.EDITABLE_GROUPS[grp];
      Object.keys(patch[grp]).forEach(k => {
        if (n.h[grp][k] !== undefined || grp === "skills" || grp === "affinities") {
          n.h[grp][k] = clamp(Number(patch[grp][k]), spec.min, spec.max);
          if (grp === "affinities" && g.ELEM && g.ELEM.invalidateNpcCache) { g.ELEM.invalidateNpcCache(n); }
        }
      });
    });

    if (patch.root && typeof patch.root === "object" && g.ELEM) {
      const rRes = g.ELEM.setRootProfile(n, {
        rootCount: patch.root.rootCount != null ? Number(patch.root.rootCount) : patch.root.elements.length,
        rootCapacityTrait: patch.root.rootCapacityTrait || null,
        elements: patch.root.elements,
        grades: patch.root.grades,
        mastery: patch.root.mastery || null
      });
      if (rRes.ok) {
        reconciled.notes.push("ตั้งค่ารากวิญญาณ " + n.h.root.rootCount + " ราก (" + n.h.root.rarityTitleTh + ")");
      }
    }

    if (patch.elemental && typeof patch.elemental === "object" && g.ELEM) {
      const sys = g.ELEM.ensureNpc(n);
      if (patch.elemental.mastery && typeof patch.elemental.mastery === "object") {
        for (const [el, v] of Object.entries(patch.elemental.mastery)) {
          if (g.ELEM.isValidOrdinaryElement(el) && Number.isFinite(Number(v))) {
            sys.mastery[el] = clamp(+Number(v).toFixed(2), 0, 100);
          }
        }
      }
      if (patch.elemental.specialMastery && typeof patch.elemental.specialMastery === "object") {
        for (const [el, v] of Object.entries(patch.elemental.specialMastery)) {
          if (g.ELEM.isValidSpecialElement(el) && Number.isFinite(Number(v))) {
            sys.specialMastery[el] = clamp(+Number(v).toFixed(2), 0, 100);
          }
        }
      }
      if (patch.elemental.specialAccess && typeof patch.elemental.specialAccess === "object") {
        for (const el of g.ELEM.SPECIAL_ELEMENTS) {
          if (patch.elemental.specialAccess[el] !== undefined) {
            const wantUnlock = typeof patch.elemental.specialAccess[el] === "object"
              ? !!patch.elemental.specialAccess[el].unlocked
              : !!patch.elemental.specialAccess[el];
            sys.specialAccess = sys.specialAccess || {};
            sys.specialAccess[el] = sys.specialAccess[el] || { unlocked: false, affinity: 50, sources: [] };
            const srcs = new Set(sys.specialAccess[el].sources || []);
            if (wantUnlock) srcs.add("PLAYER_EDIT_UNLOCK");
            else srcs.delete("PLAYER_EDIT_UNLOCK");
            sys.specialAccess[el].sources = Array.from(srcs);
          }
        }
      }
      g.ELEM.syncSpecialAccess(n);
      n._cultRateBase = null;
    }

    if (patch.cult && typeof patch.cult === 'object') {
      const pc = patch.cult;
      const wantsMortal = pc.path === 'MORTAL' || pc.path === 'NONE' || pc.stage === 0;
      if (wantsMortal) {
        n.cult = null;
        n.h.state.qi = 0;
        reconciled.notes.push('ปรับสถานะเป็นปุถุชน (ไร้ตบะ)');
      } else {
        const targetPath = pc.path || (n.cult ? n.cult.path : 'XIAN');
        const pathDef = CULT.PATHS[targetPath];
        if (pathDef) {
          if (!n.cult) {
            const mant = CULT.bestMantra(targetPath, 1, n);
            n.cult = { path: targetPath, sub: 'NONE', stage: 1, prog: 0, mantra: mant ? mant.id : null, techs: [], learning: null, toxic: 0, lifeBonus: 0, since: W ? W.day : 1, attempts: 0, secl: null, rate: 0, pillT: 0 };
          }
          const prevPath = n.cult.path;
          n.cult.path = targetPath;
          const maxStage = pathDef.maxStage;
          let targetStage = pc.stage !== undefined ? Math.floor(pc.stage) : n.cult.stage;
          if (targetStage > maxStage) {
            targetStage = maxStage;
            reconciled.notes.push('ปรับลดขั้นตบะตามเพดานสูงสุดของวิถี ' + pathDef.shortTh + ' (ขั้น ' + maxStage + ')');
          }
          n.cult.stage = clamp(targetStage, 1, maxStage);

          const validSubs = pathDef.subPaths.map(s => s.id);
          if (pc.sub !== undefined) {
            const resolvedSub = (CULT.resolveSubId ? CULT.resolveSubId(pc.sub) : pc.sub) || pc.sub;
            n.cult.sub = validSubs.includes(resolvedSub) ? resolvedSub : 'NONE';
          } else if (prevPath !== targetPath && !validSubs.includes(n.cult.sub)) {
            n.cult.sub = 'NONE';
            reconciled.notes.push('รีเซ็ตสายย่อยเนื่องจากเปลี่ยนวิถีหลัก');
          }
          if (CULT.ensurePets) CULT.ensurePets(n);
          if (CULT.ensureMechState) CULT.ensureMechState(n);
          if (CULT.ensureKarmaState) CULT.ensureKarmaState(n);

          // Reconcile mantra
          const effStMantra = CULT.effectiveTechStage ? CULT.effectiveTechStage(n) : n.cult.stage;
          const curMantra = n.cult.mantra ? CULT.tech(n.cult.mantra) : null;
          if (!curMantra || (!curMantra.legendary && curMantra.path !== targetPath) || (curMantra.reqTier || curMantra.tier) > Math.max(effStMantra, targetPath === 'GOD' ? 2 : 1)) {
            const bestM = CULT.bestMantra(targetPath, effStMantra, n);
            n.cult.mantra = bestM ? bestM.id : null;
          }

          // Reconcile techniques incompatible with new path/sub
          if (Array.isArray(n.cult.techs)) {
            const kept = [];
            n.cult.techs.forEach(tid => {
              const t = CULT.tech(tid);
              const compat = (t && g.MARTIAL && g.MARTIAL.isTechCompatible) ? g.MARTIAL.isTechCompatible(n, t) : !!(t && (t.path === 'ANY' || t.path === targetPath || t.legendary) && (!t.sub || (CULT.isSubCompatible ? CULT.isSubCompatible(t, n.cult.sub, false) : t.sub === n.cult.sub)));
              if (!compat) {
                reconciled.removedTechs.push(tid);
              } else {
                kept.push(tid);
              }
            });
            n.cult.techs = kept;
          }

          if (g.MARTIAL && g.MARTIAL.reconcileInnate) g.MARTIAL.reconcileInnate(n, W);
          if (g.ELEM) g.ELEM.syncSpecialAccess(n);
      if (g.MARTIAL && g.MARTIAL.reconcilePassives) g.MARTIAL.reconcilePassives(n);
          if (g.MARTIAL && g.MARTIAL.invalidateMartialCaches) g.MARTIAL.invalidateMartialCaches(n);

          // Reconcile specialization track
          if (n.cult.sub === 'NONE' || !CULT.trackDef || !CULT.trackDef(n.cult.sub)) {
            n.cult.track = null;
          } else {
            const ord = clamp(pc.trackOrdinal || (n.cult.track && n.cult.track.subPath === n.cult.sub ? n.cult.track.ordinal : n.cult.stage), 1, 9);
            n.cult.track = CULT.initTrack(n.cult.sub, ord, W ? W.day : 1);
          }

          if (pc.xp !== undefined) {
            const th = CULT.threshold(n);
            n.cult.prog = clamp(pc.xp, 0, Number.isFinite(th) ? th * 1.25 : 999999);
          }
          if (pc.clearBottleneck && n.bt) {
            n.bt = null;
            n.sealedBt = false;
          }
          if (pc.clearDeviation) {
            n.cult.toxic = 0;
            n.h.state.heartDemon = 0;
          }
        }
      }

      // Check equipped items for compatibility with updated cultivation state
      if (n.equip && typeof n.equip === 'object') {
        ['WEAPON', 'ARMOR', 'ACCESSORY'].forEach(slot => {
          const eq = n.equip[slot];
          if (!eq) return;
          const paths = Array.isArray(eq.compatiblePath) ? eq.compatiblePath : (eq.compatiblePath ? [eq.compatiblePath] : ['ANY']);
          const pathOk = paths.includes('ANY') || (n.cult && paths.includes(n.cult.path));
          const effSt = n.cult ? (CULT.effectiveTechStage ? CULT.effectiveTechStage(n) : n.cult.stage) : 0;
          const stageOk = (eq.minStage || 0) <= effSt;
          if (!pathOk || !stageOk) {
            n.equip[slot] = null;
            reconciled.unequippedGear.push(eq.nameTh || eq.id);
            if (!isPreview && W && W.sect && Array.isArray(W.sect.gear)) {
              W.sect.gear.push(eq);
            }
          }
        });
      }
    }

    if (patch.economy && typeof patch.economy === 'object') {
      const ec = patch.economy;
      if (ec.stones !== undefined) n.inv.stones = Math.max(0, Math.round(ec.stones));
      if (ec.cp !== undefined) n.cp = Math.max(0, Math.round(ec.cp));
      if (ec.merit !== undefined) n.merit = Math.max(0, Math.round(ec.merit));
      if (ec.sat !== undefined) n.sat = clamp(Math.round(ec.sat), 0, 100);
      if (ec.rank !== undefined) {
        const targetRank = (W && W.sect && n.id === W.sect.masterId) ? 6 : clamp(Math.floor(ec.rank), 0, 5);
        n.rank = targetRank;
      }
    }

    CULT.refreshLifespan(n);
    HC.bump(n);
    if (g.STATS && g.STATS.dirty) g.STATS.dirty(n);

    const newHpMax = CULT.hpMax(n);
    const newQiMax = CULT.qiMax(n);

    if (patch.state && typeof patch.state === 'object') {
      const st = patch.state;
      if (st.energy !== undefined) n.h.state.energy = clamp(st.energy, 0, 100);
      if (st.hunger !== undefined) n.h.state.hunger = clamp(st.hunger, 0, 100);
      if (st.fatigue !== undefined) n.h.state.fatigue = clamp(st.fatigue, 0, 100);
      if (st.stress !== undefined) n.h.state.stress = clamp(st.stress, 0, 100);
      if (st.mood !== undefined) n.h.state.mood = clamp(st.mood, -50, 50);
      if (st.heartDemon !== undefined) n.h.state.heartDemon = clamp(st.heartDemon, 0, 100);
      if (st.clearInjuries) n.inj = [];
      if (st.clearToxic && n.cult) n.cult.toxic = 0;
      if (st.hpPct !== undefined) n.h.state.hp = Math.max(1, Math.round(newHpMax * clamp(st.hpPct, 1, 100) / 100));
      if (st.qiPct !== undefined) n.h.state.qi = Math.round(newQiMax * clamp(st.qiPct, 0, 100) / 100);
    }

    n.h.state.hp = clamp(Math.round(n.h.state.hp || newHpMax), 1, newHpMax);
    n.h.state.qi = clamp(Math.round(n.h.state.qi || 0), 0, newQiMax);

    if (g.ELEM) g.ELEM.ensureNpc(n);
    return {
      hpMax: newHpMax,
      qiMax: newQiMax,
      combatPower: Math.round(CULT.power(n)),
      cultRate: +(CULT.rate(n) || 0).toFixed(2),
      btChance: n.cult ? Math.round(CULT.breakthroughChance(n) * 100) : 0,
      lifespanMax: n.lifespanMax,
      stageName: CULT.stageName(n),
      worldRank: CULT.worldRank(n),
      rootCount: n.h.root ? n.h.root.rootCount : 1,
      aggregateGrade: n.h.root ? n.h.root.grade : "MORTAL",
      rarityTitleTh: n.h.root ? n.h.root.rarityTitleTh : "",
      reconciled
    };
  }

  EDITOR.previewCharacterEdit = (W, npcId, patch) => {
    const state = EDITOR.memberEditState(W, npcId);
    if (!state.ok) return { ok: false, reason: state.reason, errors: [state.reason] };
    const n = W.byId[npcId];
    const val = validateCharacterPatch(W, n, patch);
    if (!val.ok) return { ok: false, reason: val.errors[0], errors: val.errors };

    const clone = JSON.parse(JSON.stringify(n));
    if (g.ELEM) g.ELEM.ensureNpc(n);
    const before = {
      hpMax: CULT.hpMax(n),
      qiMax: CULT.qiMax(n),
      combatPower: Math.round(CULT.power(n)),
      cultRate: +(CULT.rate(n) || 0).toFixed(2),
      btChance: n.cult ? Math.round(CULT.breakthroughChance(n) * 100) : 0,
      lifespanMax: n.lifespanMax,
      stageName: CULT.stageName(n),
      worldRank: CULT.worldRank(n),
      rootCount: n.h.root ? n.h.root.rootCount : 1,
      aggregateGrade: n.h.root ? n.h.root.grade : "MORTAL",
      rarityTitleTh: n.h.root ? n.h.root.rarityTitleTh : ""
    };
    const after = applyPatchToNpc(W, clone, patch, true);
    return { ok: true, before, after, warnings: state.warnings, reconciled: after.reconciled };
  };

  EDITOR.applyCharacterEdit = (W, npcId, patch) => {
    const state = EDITOR.memberEditState(W, npcId);
    if (!state.ok) return { ok: false, reason: state.reason, errors: [state.reason] };
    const n = W.byId[npcId];
    const val = validateCharacterPatch(W, n, patch);
    if (!val.ok) return { ok: false, reason: val.errors[0], errors: val.errors };

    // Save undo snapshot of character + sect gear
    W._editUndoStack = W._editUndoStack || [];
    W._editUndoStack.push({
      atDay: W.day,
      atTime: W.t,
      npcId: n.id,
      npcSnapshot: JSON.parse(JSON.stringify(n)),
      sectGearSnapshot: JSON.parse(JSON.stringify(W.sect.gear || []))
    });
    if (W._editUndoStack.length > 15) W._editUndoStack.shift();

    const before = {
      hpMax: CULT.hpMax(n),
      qiMax: CULT.qiMax(n),
      combatPower: Math.round(CULT.power(n)),
      lifespanMax: n.lifespanMax,
      stageName: CULT.stageName(n)
    };
    const after = applyPatchToNpc(W, n, patch, false);
    if (W.sect && n.id === W.sect.masterId) {
      W.sect.policy = SECT.targetPolicy(W);
    }
    SECT.notifyStockChanged(W);
    W.log('event', '[แก้ไขโดยผู้เล่น] ปรับค่าสถานะของ ' + n.h.name.given + ' (' + after.stageName + ' · พลังรบ ' + after.combatPower + ')', [n.id], { txKind: 'player-edit', actorId: n.id });
    return { ok: true, npcId: n.id, before, after, reconciled: after.reconciled, warnings: state.warnings };
  };

  EDITOR.undoLastEdit = W => {
    if (!W || !Array.isArray(W._editUndoStack) || !W._editUndoStack.length) {
      return { ok: false, reason: 'ไม่มีประวัติการแก้ไขตัวละครให้ย้อนคืน' };
    }
    const snap = W._editUndoStack.pop();
    const idx = W.npcs.findIndex(x => x && x.id === snap.npcId);
    if (idx < 0) return { ok: false, reason: 'ไม่พบตัวละครในสำนัก' };
    const target = W.npcs[idx];
    const restored = snap.npcSnapshot;
    Object.keys(target).forEach(k => { delete target[k]; });
    Object.assign(target, restored);
    HC.touch(target);
    W.byId[target.id] = target;
    if (Array.isArray(snap.sectGearSnapshot)) {
      W.sect.gear = snap.sectGearSnapshot;
    }
    if (g.STATS && g.STATS.dirty) g.STATS.dirty(restored);
    SECT.notifyStockChanged(W);
    W.log('event', '[แก้ไขโดยผู้เล่น] ย้อนคืนค่าสถานะของ ' + restored.h.name.given + ' กลับสู่ก่อนแก้ไข (เวลาโลกจำลองยังคงเดินหน้าตามปกติ)', [restored.id], { txKind: 'player-edit-undo', actorId: restored.id });
    return { ok: true, npcId: restored.id, nameTh: restored.h.name.given };
  };

  /* ---------- Item Catalog & Spawner (Full Registry Coverage + Metadata Search + Pagination) ---------- */
  function enrichCatalogEntry(entry) {
    const elNorm = (g.ELEM && g.ELEM.normalizeTag) ? g.ELEM.normalizeTag(entry.element) : { ok: true, element: entry.element || "NEUTRAL" };
    const el = elNorm.ok ? elNorm.element : "NEUTRAL";
    const elMeta = (g.ELEM && g.ELEM.META && g.ELEM.META[el]) || { nameTh: "ไร้ธาตุเฉพาะ", shortTh: "ไร้ธาตุ", icon: "⚪" };
    entry.element = el;
    entry.elementNameTh = elMeta.nameTh;
    entry.elementShortTh = elMeta.shortTh;
    entry.elementIcon = elMeta.icon;
    entry.legendary = !!(entry.legendary || entry.grade === "Legendary" || entry.rarity === "Legendary" || /^LEG_/.test(entry.id || ""));
    entry.grade = entry.grade || (entry.legendary ? "Legendary" : (entry.tier >= 6 ? "Rare" : entry.tier >= 4 ? "Uncommon" : "Common"));
    entry.rarity = entry.rarity || entry.grade;
    entry.effectIds = Array.isArray(entry.effectIds) ? entry.effectIds : [];
    const blobParts = [
      entry.key, entry.id, entry.outItemId || "", entry.recipeId || "", entry.nameTh, entry.kind, entry.cat || "",
      entry.grade, entry.rarity, entry.element, entry.elementNameTh, entry.elementShortTh,
      entry.compatiblePath || "", entry.sub || "", entry.slot || "", entry.gearType || "",
      entry.sourceRegistry || "", entry.descTh || "",
      entry.effectIds.join(" "),
      entry.legendary ? "legendary ตำนาน ศาสตราในตำนาน คัมภีร์ในตำนาน วิชาระดับตำนาน" : ""
    ];
    entry._searchBlob = blobParts.join(" ").toLowerCase();
    return entry;
  }

  EDITOR.catalog = (W, filters) => {
    filters = filters || {};
    const out = [];

    // 1. Provisions & Stones
    out.push(enrichCatalogEntry({ key: "PROVISION:grain", kind: "PROVISION", id: "grain", nameTh: "ข้าวสาร", tier: 1, element: "WOOD_LIFE", sourceRegistry: "CORE.PROVISION", stackable: true, canSect: true, canNpc: false, descTh: "เสบียงหลักสำหรับหุงอาหารในโรงครัว" }));
    out.push(enrichCatalogEntry({ key: "PROVISION:meal", kind: "PROVISION", id: "meal", nameTh: "อาหารปรุงเสร็จ", tier: 1, element: "WOOD_LIFE", sourceRegistry: "CORE.PROVISION", stackable: true, canSect: true, canNpc: false, descTh: "อาหารพร้อมรับประทานและเสบียงเดินทาง" }));
    out.push(enrichCatalogEntry({ key: "PROVISION:stones", kind: "PROVISION", id: "stones", nameTh: "ศิลาวิญญาณ", tier: 1, element: "NEUTRAL", sourceRegistry: "CORE.PROVISION", stackable: true, canSect: true, canNpc: true, descTh: "เงินตราหลักของสำนักและยุทธภพ" }));

    // 2. Materials (includes base, expansion, martial, ecology, fishing materials)
    const seenMatIds = new Set();
    (JD.ITEMS.materials || []).forEach(m => {
      if (!m || !m.id || seenMatIds.has(m.id)) return;
      seenMatIds.add(m.id);
      out.push(enrichCatalogEntry({
        key: "MATERIAL:" + m.id, kind: "MATERIAL", id: m.id, nameTh: m.nameTh, tier: m.tier || 1,
        cat: m.cat, element: m.element || "NEUTRAL", elementProfile: m.elementProfile || null,
        sourceRegistry: "JD.ITEMS.materials", stackable: true, canSect: true, canNpc: true,
        descTh: "วัตถุดิบระดับ " + (m.tier || 1) + " (" + (m.cat || "ทั่วไป") + ")"
      }));
    });

    // 3. Basic & Crafted Pills
    (JD.CP && JD.CP.BASIC ? JD.CP.BASIC : []).forEach(b => {
      out.push(enrichCatalogEntry({
        key: "PILL:P:" + b.id, kind: "PILL", id: "P:" + b.id, nameTh: b.nameTh, tier: b.tier || 1,
        element: b.element || "WOOD_LIFE", elementProfile: b.elementProfile || null,
        sourceRegistry: "JD.CP.BASIC", stackable: true, canSect: true, canNpc: true,
        descTh: "โอสถสวัสดิการพื้นฐาน"
      }));
    });
    (JD.ITEMS.recipes || []).filter(r => r.outType === "PILL").forEach(r => {
      const pid = r.outItemId || ("P:" + r.id);
      const effIds = r.effect ? Object.keys(r.effect) : [];
      out.push(enrichCatalogEntry({
        key: "CRAFTED_PILL:" + pid, kind: "CRAFTED_PILL", id: pid, recipeId: r.id, nameTh: r.outNameTh || r.nameTh,
        tier: r.tier || 1, compatiblePath: r.compatiblePath || "ANY", minStage: r.minStage || 0,
        element: r.element || "WOOD_LIFE", elementProfile: r.elementProfile || null, effectIds: effIds,
        sourceRegistry: "JD.ITEMS.recipes(PILL)", stackable: true, canSect: true, canNpc: true,
        descTh: "โอสถหลอมจากตำรับระดับ " + (r.tier || 1)
      }));
    });

    // 4A. Legendary Weapons (all 11 from VC.LEGENDARY_WEAPONS)
    if (g.VC && Array.isArray(g.VC.LEGENDARY_WEAPONS)) {
      g.VC.LEGENDARY_WEAPONS.forEach(w => {
        if (!w || !w.id) return;
        const fxIds = Array.isArray(w.fx) ? w.fx.map(x => x.id).filter(Boolean) : [];
        const fxDesc = Array.isArray(w.fx) ? w.fx.map(x => x.nameTh + ": " + x.descTh).join(" · ") : "";
        out.push(enrichCatalogEntry({
          key: "EQUIPMENT:" + w.id, kind: "EQUIPMENT", id: w.id, nameTh: w.nameTh,
          tier: w.tier || 7, grade: "Legendary", rarity: "Legendary", legendary: true,
          slot: "WEAPON", gearType: w.weaponType || "SWORD", compatiblePath: w.compatiblePath || "ANY",
          minStage: w.minStage || 4, element: w.element || "NEUTRAL", elementProfile: w.elementProfile || null,
          effectIds: fxIds, sourceRegistry: "VC.LEGENDARY_WEAPONS",
          stackable: false, hasQuality: false, canSect: true, canNpc: true,
          descTh: "ศาสตราในตำนาน (" + (w.weaponType || "WEAPON") + ") · " + (fxDesc || w.loreTh || "เอกลักษณ์หนึ่งเดียวในยุทธภพ")
        }));
      });
    }

    // 4B. Equipment Recipes & Standalone Equipment
    const seenEqIds = new Set((g.VC && Array.isArray(g.VC.LEGENDARY_WEAPONS)) ? g.VC.LEGENDARY_WEAPONS.map(w => w.id) : []);
    (JD.ITEMS.recipes || []).filter(r => r.outType === "EQUIPMENT").forEach(r => {
      const canonicalId = r.outItemId || r.id;
      if (!r || !r.id || seenEqIds.has(canonicalId) || seenEqIds.has(r.id)) return;
      seenEqIds.add(canonicalId);
      seenEqIds.add(r.id);
      const minted = ECO.mintGear ? ECO.mintGear(r, 1) : null;
      const slot = (minted && minted.slot) || (r.effect && r.effect.slot) || "WEAPON";
      const gearType = (minted && (minted.weaponType || minted.armorType || minted.gearType)) || (r.effect && (r.effect.weaponType || r.effect.armorType)) || "";
      const fxIds = (minted && Array.isArray(minted.fx)) ? minted.fx.map(x => x.id).filter(Boolean) : [];
      out.push(enrichCatalogEntry({
        key: "EQUIPMENT:" + canonicalId, kind: "EQUIPMENT", id: canonicalId, recipeId: r.id, outItemId: r.outItemId || null, nameTh: r.outNameTh || r.nameTh,
        tier: r.tier || 1, grade: r.grade || (r.tier >= 6 ? "Rare" : r.tier >= 4 ? "Uncommon" : "Common"),
        slot, gearType, compatiblePath: r.compatiblePath || "ANY", minStage: r.minStage || 0,
        element: (minted && minted.element) || r.element || "NEUTRAL",
        elementProfile: (minted && minted.elementProfile) || r.elementProfile || null,
        effectIds: fxIds, sourceRegistry: "JD.ITEMS.recipes(EQUIPMENT)",
        stackable: false, hasQuality: true, canSect: true, canNpc: true,
        descTh: "ยุทโธปกรณ์ช่อง " + slot + (gearType ? " (" + gearType + ")" : "") + " ระดับ " + (r.tier || 1)
      }));
    });
    (JD.ITEMS.items || []).filter(it => (it.out === "EQUIPMENT" || it.slot) && !seenEqIds.has(it.id)).forEach(it => {
      seenEqIds.add(it.id);
      const minted = ECO.mintGear ? ECO.mintGear(it, 1) : null;
      const slot = (minted && minted.slot) || it.slot || "WEAPON";
      const gearType = (minted && (minted.weaponType || minted.armorType || minted.gearType)) || it.gearType || "";
      const fxIds = (minted && Array.isArray(minted.fx)) ? minted.fx.map(x => x.id).filter(Boolean) : [];
      out.push(enrichCatalogEntry({
        key: "EQUIPMENT:" + it.id, kind: "EQUIPMENT", id: it.id, recipeId: it.recipeId || null, outItemId: it.id, nameTh: it.nameTh,
        tier: it.tier || 1, grade: it.grade || (it.tier >= 6 ? "Rare" : it.tier >= 4 ? "Uncommon" : "Common"),
        slot, gearType, compatiblePath: it.compatiblePath || "ANY", minStage: it.minStage || 0,
        element: (minted && minted.element) || it.element || "NEUTRAL",
        elementProfile: (minted && minted.elementProfile) || it.elementProfile || null,
        effectIds: fxIds, sourceRegistry: "JD.ITEMS.items(EQUIPMENT)",
        stackable: false, hasQuality: true, canSect: true, canNpc: true,
        descTh: "ยุทโธปกรณ์ช่อง " + slot + (gearType ? " (" + gearType + ")" : "") + " ระดับ " + (it.tier || 1)
      }));
    });

    // 5. Technique Manuals (including all 12 legendary techniques & 10 legendary mantras = 22 legendary manuals)
    const seenManualIds = new Set();
    [...(JD.TECH.techniques || []), ...(JD.TECH.mantras || [])].forEach(t => {
      if (!t || !t.id || t.innateOnly || seenManualIds.has(t.id)) return;
      seenManualIds.add(t.id);
      const isLeg = !!(t.legendary || t.grade === "Legendary" || /^LEG_/.test(t.id));
      const isMantra = /_MANTRA$|^QI_MANTRA$/.test(t.cat || "");
      const fxIds = [];
      if (t.fxKind) fxIds.push(t.fxKind);
      if (Array.isArray(t.fx)) t.fx.forEach(x => { if (x && x.id) fxIds.push(x.id); });
      if (t.passive && t.passive.id) fxIds.push(t.passive.id);
      out.push(enrichCatalogEntry({
        key: "TECH_MANUAL:" + t.id, kind: "TECH_MANUAL", id: t.id, nameTh: t.nameTh,
        tier: t.tier || 1, grade: isLeg ? "Legendary" : (t.grade || "Common"),
        rarity: isLeg ? "Legendary" : (t.grade || "Common"), legendary: isLeg, isMantra,
        compatiblePath: t.path || "ANY", sub: t.sub || null, weaponTypes: t.weaponTypes || null,
        element: t.element || "NEUTRAL", elementProfile: t.elementProfile || null,
        effectIds: fxIds, sourceRegistry: isMantra ? "JD.TECH.mantras" : "JD.TECH.techniques",
        stackable: false, canSect: true, canNpc: true,
        descTh: (isLeg ? "★ คัมภีร์ในตำนาน · " : "คัมภีร์วิชา") + "วิถี " + (t.path || "ANY") + (t.sub ? " (" + t.sub + ")" : "") + " ระดับ " + (t.tier || 1) + " (" + (isLeg ? "Legendary" : (t.grade || "Common")) + ")"
      }));
    });

    // 6A. Technique Crystals (all valid, non-innate techniques with canonical T:<techniqueId>)
    const seenTechCrystalIds = new Set();
    [...(JD.TECH.techniques || []), ...(JD.TECH.mantras || [])].forEach(t => {
      if (!t || !t.id || t.innateOnly || (g.MARTIAL && g.MARTIAL.isInnateTech && g.MARTIAL.isInnateTech(t)) || seenTechCrystalIds.has(t.id)) return;
      seenTechCrystalIds.add(t.id);
      const isLeg = !!(t.legendary || t.grade === "Legendary" || /^LEG_/.test(t.id));
      const isMantra = /_MANTRA$|^QI_MANTRA$/.test(t.cat || "");
      const fxIds = [];
      if (t.fxKind) fxIds.push(t.fxKind);
      if (Array.isArray(t.fx)) t.fx.forEach(x => { if (x && x.id) fxIds.push(x.id); });
      if (t.passive && t.passive.id) fxIds.push(t.passive.id);
      out.push(enrichCatalogEntry({
        key: "CRYSTAL:T:" + t.id, kind: "CRYSTAL", id: "T:" + t.id, crystalFamily: "TECH",
        nameTh: "ผลึกวิชา「" + t.nameTh + "」",
        tier: t.tier || 1, grade: isLeg ? "Legendary" : (t.grade || "Common"),
        rarity: isLeg ? "Legendary" : (t.grade || "Common"), legendary: isLeg, isMantra,
        compatiblePath: t.path || "ANY", sub: t.sub || null, weaponTypes: t.weaponTypes || null,
        element: t.element || "NEUTRAL", elementProfile: t.elementProfile || null,
        effectIds: fxIds, sourceRegistry: isMantra ? "JD.TECH.mantras(CRYSTAL)" : "JD.TECH.techniques(CRYSTAL)",
        stackable: true, canSect: true, canNpc: true,
        descTh: "ผลึกสืบทอดวิชา (" + (t.path || "ANY") + (t.sub ? " · " + t.sub : "") + ") ระดับ " + (t.tier || 1) + " (" + (isLeg ? "Legendary" : (t.grade || "Common")) + ") ใช้แล้วหมดไป"
      }));
    });

    // 6B. Specialization Crystals (S:<subId>) & Sub Manuals
    CULT.subList.forEach(({ path, sub }) => {
      out.push(enrichCatalogEntry({
        key: "CRYSTAL:S:" + sub.id, kind: "CRYSTAL", id: "S:" + sub.id, crystalFamily: "SUBPATH",
        nameTh: "ผลึกสายย่อย「" + sub.nameTh + "」",
        tier: 3, grade: "Rare", rarity: "Rare", compatiblePath: path, sub: sub.id,
        element: sub.element || "NEUTRAL", elementProfile: sub.elementProfile || null,
        sourceRegistry: "CULT.subList(CRYSTAL)", stackable: true, canSect: true, canNpc: true,
        descTh: "ผลึกสืบทอดสายย่อย (" + path + ") ใช้แล้วหมดไป"
      }));
      out.push(enrichCatalogEntry({
        key: "SUB_MANUAL:" + sub.id, kind: "SUB_MANUAL", id: sub.id, nameTh: "คัมภีร์สายย่อย「" + sub.nameTh + "」",
        tier: 4, grade: "Exceptional", rarity: "Exceptional", compatiblePath: path, sub: sub.id,
        element: sub.element || "NEUTRAL", elementProfile: sub.elementProfile || null,
        sourceRegistry: "CULT.subList(SUB_MANUAL)", stackable: false, canSect: true, canNpc: true,
        descTh: "คัมภีร์สายย่อยถาวรประจำหอคัมภีร์ (" + path + ")"
      }));
    });

    // 7. Recipe Scrolls
    (JD.ITEMS.recipes || []).filter(r => r.discoverable).forEach(r => {
      out.push(enrichCatalogEntry({
        key: "RECIPE_SCROLL:" + r.id, kind: "RECIPE_SCROLL", id: r.id, nameTh: "ม้วนตำรับ「" + r.nameTh + "」",
        tier: r.tier || 1, compatiblePath: r.compatiblePath || "ANY",
        element: r.element || "NEUTRAL", elementProfile: r.elementProfile || null,
        sourceRegistry: "JD.ITEMS.recipes(SCROLL)", stackable: false, canSect: true, canNpc: true,
        descTh: "ม้วนตำรับหายากระดับ " + (r.tier || 1)
      }));
    });

    // 8. Rare Beast Organs
    if (g.CONTENT && Array.isArray(g.CONTENT.rareOrgans)) {
      g.CONTENT.rareOrgans.forEach(o => {
        out.push(enrichCatalogEntry({
          key: "ORGAN:" + o.id, kind: "ORGAN", id: o.id, nameTh: o.nameTh,
          tier: o.tier || 2, element: o.element || "NEUTRAL", elementProfile: o.elementProfile || null,
          effectIds: o.effect ? Object.keys(o.effect) : [],
          sourceRegistry: "CONTENT.rareOrgans", stackable: true, canSect: true, canNpc: true,
          descTh: o.descTh || ("อวัยวะอสูรหายากระดับ " + (o.tier || 2))
        }));
      });
    }

    const q = (filters.search || "").trim().toLowerCase();
    const kindFilter = filters.kind && filters.kind !== "ALL" ? filters.kind : null;
    const tierFilter = Number.isFinite(Number(filters.tier)) && Number(filters.tier) > 0 ? Number(filters.tier) : null;
    const elemFilter = filters.element && filters.element !== "ALL" ? filters.element : null;
    const rarityFilter = filters.rarity && filters.rarity !== "ALL" ? String(filters.rarity).toLowerCase() : null;
    const destFilter = filters.dest || null;

    return out.filter(item => {
      if (kindFilter && item.kind !== kindFilter) return false;
      if (tierFilter && item.tier !== tierFilter) return false;
      if (elemFilter && item.element !== elemFilter) return false;
      if (rarityFilter) {
        if (rarityFilter === "legendary" && !item.legendary) return false;
        else if (rarityFilter !== "legendary" && String(item.grade || "").toLowerCase() !== rarityFilter && String(item.rarity || "").toLowerCase() !== rarityFilter) return false;
      }
      if (destFilter === "sect" && !item.canSect) return false;
      if (destFilter === "npc" && !item.canNpc) return false;
      if (q) {
        const tokens = q.split(/\s+/).filter(Boolean);
        for (const tk of tokens) {
          if (!item._searchBlob.includes(tk)) return false;
        }
      }
      return true;
    });
  };

  EDITOR.catalogPaginated = (W, filters) => {
    filters = filters || {};
    const all = EDITOR.catalog(W, filters);
    const pageSize = clamp(Math.floor(Number(filters.pageSize) || 40), 10, 200);
    const totalPages = Math.max(1, Math.ceil(all.length / pageSize));
    const page = clamp(Math.floor(Number(filters.page) || 1), 1, totalPages);
    const start = (page - 1) * pageSize;
    return {
      items: all.slice(start, start + pageSize),
      total: all.length,
      page,
      pageSize,
      totalPages
    };
  };

  EDITOR.directCatalogAction = (W, opts) => {
    opts = opts || {};
    const action = opts.action || "spawn";
    if (action === "spawn") return EDITOR.spawnItem(W, opts);
    const st = EDITOR.memberEditState(W, opts.npcId);
    if (!st.ok) return { ok: false, reason: st.reason };
    const n = W.byId[opts.npcId];
    if (action === "equip" && opts.kind === "EQUIPMENT") {
      const sp = EDITOR.spawnItem(W, Object.assign({}, opts, { dest: "npc", qty: 1, autoEquip: false }));
      if (!sp.ok || !sp.uids || !sp.uids.length) return sp;
      return EDITOR.equipPersonalGear(W, n.id, sp.uids[0]);
    }
    if ((action === "teach" || action === "set_mantra") && opts.kind === "TECH_MANUAL") {
      const rawTechId = String(opts.id).startsWith("T:") ? opts.id.slice(2) : opts.id;
      const t = CULT.tech(rawTechId);
      if (!t || t.innateOnly) return { ok: false, reason: "ไม่พบคัมภีร์วิชา: " + opts.id };
      if (!n.cult) return { ok: false, reason: "ตัวละครยังเป็นปุถุชน ต้องเปิดวิถีบำเพ็ญก่อน" };
      const isMantra = /_MANTRA$|^QI_MANTRA$/.test(t.cat || "");
      if (isMantra || action === "set_mantra") {
        n.cult.unlockedMantras = Array.isArray(n.cult.unlockedMantras) ? n.cult.unlockedMantras : [];
        if (!n.cult.unlockedMantras.includes(t.id)) n.cult.unlockedMantras.push(t.id);
        n.cult.mantra = t.id;
        if (Array.isArray(t.moveDefs) && t.moveDefs.length && !n.cult.techs.includes(t.id)) n.cult.techs.push(t.id);
      } else {
        if (!n.cult.techs.includes(t.id)) n.cult.techs.push(t.id);
      }
      if (g.ELEM) g.ELEM.syncSpecialAccess(n);
      if (g.MARTIAL && g.MARTIAL.reconcilePassives) g.MARTIAL.reconcilePassives(n);
      HC.bump(n);
      W.log("learn", "[แก้ไขโดยผู้เล่น] ถ่ายทอดวิชา「" + t.nameTh + "」ให้ " + n.h.name.given + " โดยตรง", [n.id]);
      return { ok: true, kind: opts.kind, id: t.id, nameTh: t.nameTh, action };
    }
    return EDITOR.spawnItem(W, opts);
  };

  EDITOR.spawnItem = (W, opts) => {
    opts = opts || {};
    if (!W || !W.sect) return { ok: false, reason: 'ไม่พบข้อมูลสำนัก' };
    const kind = opts.kind;
    const id = opts.id;
    const dest = opts.dest || 'sect'; // 'sect' | 'npc'
    const qty = Math.floor(Number(opts.qty == null ? 1 : opts.qty));
    const quality = clamp(Number(opts.quality == null ? 1 : opts.quality), 0.7, 1.5);

    if (!Number.isSafeInteger(qty) || qty <= 0 || qty > 50000) {
      return { ok: false, reason: 'จำนวนไอเทมต้องเป็นจำนวนเต็มบวก (1 - 50,000)' };
    }

    let npc = null;
    if (dest === 'npc') {
      const st = EDITOR.memberEditState(W, opts.npcId);
      if (!st.ok) return { ok: false, reason: st.reason };
      npc = W.byId[opts.npcId];
    } else if (dest !== 'sect') {
      return { ok: false, reason: 'ปลายทางไม่ถูกต้อง' };
    }

    let itemNameTh = '';
    const mintedUids = [];

    if (kind === 'PROVISION') {
      if (id === 'stones') {
        itemNameTh = 'ศิลาวิญญาณ';
        if (dest === 'sect') {
          W.sect.stones = (W.sect.stones || 0) + qty;
        } else {
          npc.inv.stones = (npc.inv.stones || 0) + qty;
        }
      } else if (id === 'grain' || id === 'meal') {
        if (dest !== 'sect') return { ok: false, reason: 'เสบียงส่วนกลางเสกเข้าคลังสำนักเท่านั้น' };
        itemNameTh = ECO.name(id);
        ECO.add(W, id, qty);
      } else {
        return { ok: false, reason: 'ไม่พบประเภทเสบียง: ' + id };
      }
    } else if (kind === 'MATERIAL') {
      const m = ECO.matById[id];
      if (!m) return { ok: false, reason: 'ไม่พบวัตถุดิบ: ' + id };
      itemNameTh = m.nameTh;
      if (dest === 'sect') {
        ECO.add(W, id, qty);
        W.sect.spawnedMats = W.sect.spawnedMats || {};
        W.sect.spawnedMats[id] = (W.sect.spawnedMats[id] || 0) + qty;
      } else {
        npc.inv.mats = npc.inv.mats || {};
        npc.inv.mats[id] = (npc.inv.mats[id] || 0) + qty;
        npc.inv.spawnedMats = npc.inv.spawnedMats || {};
        npc.inv.spawnedMats[id] = (npc.inv.spawnedMats[id] || 0) + qty;
      }
    } else if (kind === 'PILL' || kind === 'CRAFTED_PILL') {
      let pillId = id;
      let info = ECO.pillInfo(pillId);
      if (!info && !String(id).startsWith('P:')) {
        pillId = 'P:' + id;
        info = ECO.pillInfo(pillId);
      }
      if (!info && String(id).startsWith('P:')) {
        pillId = String(id).slice(2);
        info = ECO.pillInfo(pillId);
      }
      if (!info && ECO.recipeById && ECO.recipeById[id]) {
        const r = ECO.recipeById[id];
        pillId = r.outItemId || ('P:' + r.id);
        info = ECO.pillInfo(pillId) || ECO.pillInfo('P:' + r.id);
      }
      if (!info && ECO.recipeByOutItemId && ECO.recipeByOutItemId[id]) {
        const r = ECO.recipeByOutItemId[id];
        pillId = r.outItemId || ('P:' + r.id);
        info = ECO.pillInfo(pillId) || ECO.pillInfo('P:' + r.id);
      }
      if (!info && ECO.itemById && ECO.itemById[id]) {
        const it = ECO.itemById[id];
        pillId = it.id;
        info = ECO.pillInfo(pillId);
      }
      if (!info) return { ok: false, reason: 'ไม่พบโอสถ: ' + id };
      if (String(pillId).startsWith('P:') && ECO.recipeById && ECO.recipeById[pillId.slice(2)] && ECO.recipeById[pillId.slice(2)].outItemId) {
        pillId = ECO.recipeById[pillId.slice(2)].outItemId;
      }
      itemNameTh = info.nameTh || info.name || ECO.name(pillId);
      if (dest === 'sect') {
        ECO.add(W, pillId, qty, quality);
        W.sect.spawnedPills = W.sect.spawnedPills || {};
        W.sect.spawnedPills[pillId] = (W.sect.spawnedPills[pillId] || 0) + qty;
      } else {
        ECO.addPersonalPill(npc, pillId, quality, qty);
        npc.inv.spawnedPills = npc.inv.spawnedPills || {};
        npc.inv.spawnedPills[pillId] = (npc.inv.spawnedPills[pillId] || 0) + qty;
      }
    } else if (kind === "EQUIPMENT") {
      const legDef = g.VC && g.VC.LEGENDARY_WEAPON_BY_ID && g.VC.LEGENDARY_WEAPON_BY_ID[id];
      const itDef = !legDef && ECO.itemById && ECO.itemById[id];
      const r = ECO.recipeById[id] || (itDef && itDef.recipeId && ECO.recipeById[itDef.recipeId]) || (ECO.recipeByOutItemId && ECO.recipeByOutItemId[id]) || itDef;
      if (!legDef && (!r || (r.outType && r.outType !== "EQUIPMENT" && r.out !== "EQUIPMENT"))) return { ok: false, reason: "ไม่พบแม่แบบอุปกรณ์: " + id };
      const cap = legDef ? 1 : Math.min(qty, 25);
      itemNameTh = legDef ? legDef.nameTh : (r.outNameTh || r.nameTh);
      for (let i = 0; i < cap; i++) {
        let gear = null;
        if (legDef) {
          gear = g.VC.mintLegendaryWeapon(W, id, "spawn");
        } else if (((itDef && itDef.proceduralTemplate) || (r && r.proceduralOut)) && ECO.rollProceduralGear) {
          gear = ECO.rollProceduralGear(W, { slot: (itDef || r).slot, gearType: (itDef || r).gearType, baseQ: quality, playerSpawned: true, source: 'editor_spawn' });
        } else {
          gear = ECO.mintGear(W, r, quality, true);
        }
        gear.playerSpawned = true; W.sect.spawnSeq = (W.sect.spawnSeq || 0) + 1; gear.uid = "eq_sp_" + W.sect.spawnSeq;
        gear.listedAtDay = W.day; gear.listedTick = W.t;
        mintedUids.push(gear.uid);
        if (dest === 'sect') {
          W.sect.gear = W.sect.gear || [];
          W.sect.gear.push(gear);
        } else {
          if (opts.autoEquip && (!npc.equip || !npc.equip[gear.slot]) && SECT.canAccessItem(W, npc, gear)) {
            npc.equip = npc.equip || { WEAPON: null, ARMOR: null, ACCESSORY: null };
            npc.equip[gear.slot] = gear;
            HC.bump(npc);
          } else {
            npc.inv.gear = npc.inv.gear || [];
            npc.inv.gear.push(gear);
          }
        }
      }
    } else if (kind === 'TECH_MANUAL') {
      const rawTechId = String(id).startsWith('T:') ? id.slice(2) : id;
      if (g.MARTIAL && g.MARTIAL.isInnateTech && g.MARTIAL.isInnateTech(rawTechId)) return { ok: false, reason: 'วิชาเฉพาะสายย่อยติดตัวไม่สามารถเสกเป็นคัมภีร์ได้ (จะตื่นรู้เองเมื่อเดินสายย่อยนั้น)' };
      const t = CULT.tech(rawTechId);
      if (!t || t.innateOnly) return { ok: false, reason: 'ไม่พบคัมภีร์วิชา: ' + id };
      itemNameTh = 'คัมภีร์「' + t.nameTh + '」';
      if (dest === 'sect') {
        W.sect.library = W.sect.library || [];
        if (!W.sect.library.includes(t.id)) W.sect.library.push(t.id);
      } else {
        npc.inv.techs = npc.inv.techs || [];
        if (!npc.inv.techs.includes(t.id)) npc.inv.techs.push(t.id);
        npc.inv.spawnedTechs = npc.inv.spawnedTechs || [];
        if (!npc.inv.spawnedTechs.includes(t.id)) npc.inv.spawnedTechs.push(t.id);
      }
    } else if (kind === 'CRYSTAL') {
      const strId = String(id);
      let cKey = strId;
      if (strId.startsWith('T:')) {
        const rawT = strId.slice(2);
        if (g.MARTIAL && g.MARTIAL.isInnateTech && g.MARTIAL.isInnateTech(rawT)) return { ok: false, reason: 'วิชาเฉพาะสายย่อยติดตัวไม่สามารถเสกเป็นผลึกได้' };
        const t = CULT.tech(rawT);
        if (!t || t.innateOnly) return { ok: false, reason: 'ไม่พบผลึกวิชา: ' + id };
        itemNameTh = 'ผลึกวิชา「' + t.nameTh + '」';
      } else {
        const rawSub = strId.startsWith('S:') ? strId.slice(2) : strId;
        const subObj = CULT.subList.find(x => x.sub.id === rawSub);
        if (subObj) {
          cKey = 'S:' + rawSub;
          itemNameTh = 'ผลึกสายย่อย「' + subObj.sub.nameTh + '」';
        } else if (CULT.tech(rawSub)) {
          const t = CULT.tech(rawSub);
          if (t.innateOnly || (g.MARTIAL && g.MARTIAL.isInnateTech && g.MARTIAL.isInnateTech(rawSub))) return { ok: false, reason: 'วิชาเฉพาะสายย่อยติดตัวไม่สามารถเสกเป็นผลึกได้' };
          cKey = 'T:' + rawSub;
          itemNameTh = 'ผลึกวิชา「' + t.nameTh + '」';
        } else {
          return { ok: false, reason: 'ไม่พบผลึกสายย่อยหรือวิชา: ' + id };
        }
      }
      if (dest === 'sect') {
        W.sect.crystals = W.sect.crystals || {};
        W.sect.crystals[cKey] = (W.sect.crystals[cKey] || 0) + qty;
        W.sect.spawnedCrystals = W.sect.spawnedCrystals || {};
        W.sect.spawnedCrystals[cKey] = (W.sect.spawnedCrystals[cKey] || 0) + qty;
      } else {
        npc.inv.crystals = npc.inv.crystals || {};
        npc.inv.crystals[cKey] = (npc.inv.crystals[cKey] || 0) + qty;
        npc.inv.spawnedCrystals = npc.inv.spawnedCrystals || {};
        npc.inv.spawnedCrystals[cKey] = (npc.inv.spawnedCrystals[cKey] || 0) + qty;
      }
    } else if (kind === 'SUB_MANUAL') {
      const subObj = CULT.subList.find(x => x.sub.id === id);
      if (!subObj) return { ok: false, reason: 'ไม่พบคัมภีร์สายย่อย: ' + id };
      itemNameTh = 'คัมภีร์สายย่อย「' + subObj.sub.nameTh + '」';
      if (dest === 'sect') {
        W.sect.subLibrary = W.sect.subLibrary || [];
        if (!W.sect.subLibrary.includes(id)) W.sect.subLibrary.push(id);
      } else {
        npc.inv.subManuals = npc.inv.subManuals || [];
        if (!npc.inv.subManuals.includes(id)) npc.inv.subManuals.push(id);
        npc.inv.spawnedSubManuals = npc.inv.spawnedSubManuals || [];
        if (!npc.inv.spawnedSubManuals.includes(id)) npc.inv.spawnedSubManuals.push(id);
      }
    } else if (kind === 'RECIPE_SCROLL') {
      const r = ECO.recipeById[id] || (ECO.itemById && ECO.itemById[id] && ECO.recipeById[ECO.itemById[id].recipeId]) || (ECO.recipeByOutItemId && ECO.recipeByOutItemId[id]);
      if (!r) return { ok: false, reason: 'ไม่พบม้วนตำรับ: ' + id };
      itemNameTh = 'ม้วนตำรับ「' + r.nameTh + '」';
      if (dest === 'sect') {
        W.sect.knownRecipes = W.sect.knownRecipes || [];
        if (!W.sect.knownRecipes.includes(r.id)) W.sect.knownRecipes.push(r.id);
      } else {
        npc.inv.recipes = npc.inv.recipes || [];
        if (!npc.inv.recipes.includes(r.id)) npc.inv.recipes.push(r.id);
        npc.inv.spawnedRecipes = npc.inv.spawnedRecipes || [];
        if (!npc.inv.spawnedRecipes.includes(r.id)) npc.inv.spawnedRecipes.push(r.id);
      }
    } else if (kind === 'ORGAN') {
      if (!g.CONTENT || !g.CONTENT.organById || !g.CONTENT.organById[id]) {
        return { ok: false, reason: 'ไม่พบอวัยวะอสูร: ' + id };
      }
      const o = g.CONTENT.organById[id];
      itemNameTh = o.nameTh;
      if (dest === 'sect') {
        g.CONTENT.addOrgan(W, id, qty);
        W.sect.spawnedOrgans = W.sect.spawnedOrgans || {};
        W.sect.spawnedOrgans[id] = (W.sect.spawnedOrgans[id] || 0) + qty;
      } else {
        npc.inv.organs = npc.inv.organs || {};
        npc.inv.organs[id] = (npc.inv.organs[id] || 0) + qty;
        npc.inv.spawnedOrgans = npc.inv.spawnedOrgans || {};
        npc.inv.spawnedOrgans[id] = (npc.inv.spawnedOrgans[id] || 0) + qty;
      }
    } else {
      return { ok: false, reason: 'ไม่รองรับประเภทไอเทม: ' + kind };
    }

    SECT.notifyStockChanged(W, id);
    const targetLabel = dest === 'sect' ? 'คลังสำนัก' : ('ถุงส่วนตัวของ ' + npc.h.name.given);
    W.log('finance', '[เสกโดยผู้เล่น] เพิ่ม ' + itemNameTh + ' ×' + (mintedUids.length || qty) + ' เข้าสู่' + targetLabel, npc ? [npc.id] : [], { txKind: 'player-spawn', itemId: id, qty: mintedUids.length || qty, recipientId: npc ? npc.id : null });
    return { ok: true, kind, id, nameTh: itemNameTh, qty: mintedUids.length || qty, dest, npcId: npc ? npc.id : null, uids: mintedUids };
  };

  /* ---------- Personal Bag Actions (Equip / Unequip / Use / Donate) ---------- */
  EDITOR.equipPersonalGear = (W, npcId, gearUidOrId) => {
    const st = EDITOR.memberEditState(W, npcId);
    if (!st.ok) return { ok: false, reason: st.reason };
    if (!st.canEditEquip) return { ok: false, reason: 'ตัวละครกำลังต่อสู้ ไม่สามารถเปลี่ยนอุปกรณ์สวมใส่ได้' };
    const n = W.byId[npcId];
    const list = (n.inv && Array.isArray(n.inv.gear)) ? n.inv.gear : [];
    const idx = list.findIndex(g2 => g2 && (g2.uid === gearUidOrId || g2.id === gearUidOrId));
    if (idx < 0) return { ok: false, reason: 'ไม่พบอุปกรณ์ในถุงส่วนตัว' };
    const eq = list[idx];
    const paths = Array.isArray(eq.compatiblePath) ? eq.compatiblePath : (eq.compatiblePath ? [eq.compatiblePath] : ['ANY']);
    if (!paths.includes('ANY') && (!n.cult || !paths.includes(n.cult.path))) {
      return { ok: false, reason: 'วิถีไม่ตรงกับอุปกรณ์ (' + paths.join('/') + ')' };
    }
    const effStage = n.cult ? (CULT.effectiveTechStage ? CULT.effectiveTechStage(n) : n.cult.stage) : 0;
    if ((eq.minStage || 0) > effStage) {
      return { ok: false, reason: 'ต้องมีตบะเทียบเท่าอย่างน้อยขั้น ' + eq.minStage };
    }
    list.splice(idx, 1);
    n.equip = n.equip || { WEAPON: null, ARMOR: null, ACCESSORY: null };
    if (n.equip[eq.slot]) list.push(n.equip[eq.slot]);
    if (!list.length) delete n.inv.gear;
    const oldHp = n.h && n.h.state ? n.h.state.hp : null;
    const oldQi = n.h && n.h.state ? n.h.state.qi : null;
    n.equip[eq.slot] = eq;
    HC.bump(n);
    if (g.STATS && g.STATS.dirty) g.STATS.dirty(n);
    if (g.MARTIAL && g.MARTIAL.reconcilePassives) g.MARTIAL.reconcilePassives(n);
    if (g.MARTIAL && g.MARTIAL.syncResourceCaps) g.MARTIAL.syncResourceCaps(n, oldHp, oldQi);
    return { ok: true, equipped: eq };
  };

  EDITOR.unequipGear = (W, npcId, slot, toSect) => {
    const st = EDITOR.memberEditState(W, npcId);
    if (!st.ok) return { ok: false, reason: st.reason };
    if (!st.canEditEquip) return { ok: false, reason: 'ตัวละครกำลังต่อสู้ ไม่สามารถถอดอุปกรณ์สวมใส่ได้' };
    const n = W.byId[npcId];
    if (!n.equip || !n.equip[slot]) return { ok: false, reason: 'ไม่มีอุปกรณ์สวมใส่ในช่องนี้' };
    const eq = n.equip[slot];
    const oldHp = n.h && n.h.state ? n.h.state.hp : null;
    const oldQi = n.h && n.h.state ? n.h.state.qi : null;
    n.equip[slot] = null;
    if (toSect) {
      W.sect.gear = W.sect.gear || [];
      W.sect.gear.push(eq);
      SECT.notifyStockChanged(W, eq.id);
    } else {
      n.inv.gear = n.inv.gear || [];
      n.inv.gear.push(eq);
    }
    HC.bump(n);
    if (g.STATS && g.STATS.dirty) g.STATS.dirty(n);
    if (g.MARTIAL && g.MARTIAL.reconcilePassives) g.MARTIAL.reconcilePassives(n);
    if (g.MARTIAL && g.MARTIAL.syncResourceCaps) g.MARTIAL.syncResourceCaps(n, oldHp, oldQi);
    return { ok: true, unequipped: eq };
  };

  EDITOR.donatePersonalGear = (W, npcId, gearUidOrId) => {
    const st = EDITOR.memberEditState(W, npcId);
    if (!st.ok) return { ok: false, reason: st.reason };
    const n = W.byId[npcId];
    const list = (n.inv && Array.isArray(n.inv.gear)) ? n.inv.gear : [];
    const idx = list.findIndex(g2 => g2 && (g2.uid === gearUidOrId || g2.id === gearUidOrId));
    if (idx < 0) return { ok: false, reason: 'ไม่พบอุปกรณ์ในถุงส่วนตัว' };
    const eq = list[idx];
    if (eq.retired || (eq.procedural && eq.dur != null && eq.dur <= 0 && (eq.maxDur || 100) <= 20)) {
      if (ECO && ECO.retireGear) ECO.retireGear(W, n, eq);
      return { ok: false, reason: 'อุปกรณ์ชำรุดถาวร (ปลดระวางแยกชิ้นส่วนแล้ว)' };
    }
    list.splice(idx, 1);
    if (!list.length) delete n.inv.gear;
    if (!eq.uid && ECO && ECO.nextGearUid) eq.uid = ECO.nextGearUid(W, eq.id);
    eq.listedAtDay = W.day;
    eq.listedTick = W.t;
    eq.donatedBy = n.id;
    W.sect.gear = W.sect.gear || [];
    W.sect.gear.push(eq);
    SECT.notifyStockChanged(W, eq.id);
    const spawned = !!eq.playerSpawned;
    const blocked = spawned || !!eq.donatedRewarded || !!eq.boughtFromSectShop;
    const shopPrice = (g.CPE && g.CPE.gearPrice) ? g.CPE.gearPrice(W, eq) : Math.max(8, Math.round((eq.tier || 1) * 14));
    const maxD = eq.maxDur == null ? 100 : eq.maxDur, curD = eq.dur == null ? maxD : eq.dur;
    const condK = clamp(curD / 100, 0.25, 1) * clamp(0.7 + 0.3 * (maxD / 100), 0.5, 1);
    const rawReward = Math.max(3, Math.round((eq.tier || 1) * 12 * (eq.q || 1) * condK));
    const reward = blocked ? 0 : Math.max(2, Math.min(rawReward, Math.floor(shopPrice * 0.62)));
    eq.donatedRewarded = true;
    if (reward > 0 && g.CPE && g.CPE.mint) {
      g.CPE.mint(W, n, reward, 'บริจาคอุปกรณ์「' + eq.nameTh + '」', false);
      g.CPE.S(W).donated = (g.CPE.S(W).donated || 0) + reward;
    } else if (blocked && g.CPE && g.CPE.S) {
      g.CPE.S(W).arbitrageBlocked = (g.CPE.S(W).arbitrageBlocked || 0) + 1;
    }
    W.log('finance', n.h.name.given + ' ส่งมอบอุปกรณ์「' + eq.nameTh + '」เข้าคลังแสงสำนัก ได้ ' + reward + ' คป.' + (spawned ? ' (ไอเทมเสก)' : (blocked ? ' (เคยรับรางวัล/ซื้อจากร้านแล้ว)' : '')), [n.id], { txKind: 'donation', itemId: eq.id, itemUid: eq.uid, qty: 1, actorId: n.id });
    return { ok: true, item: eq, reward, playerSpawned: spawned, arbitrageBlocked: blocked };
  };

  EDITOR.usePersonalItem = (W, npcId, kind, itemId) => {
    const st = EDITOR.memberEditState(W, npcId);
    if (!st.ok) return { ok: false, reason: st.reason };
    const n = W.byId[npcId];
    if (kind === 'PILL' || kind === 'CRAFTED_PILL') {
      const pid = String(itemId).startsWith('P:') ? itemId : ('P:' + itemId);
      if (g.CPE && g.CPE.consumePersonalPill) {
        const used = g.CPE.consumePersonalPill(W, n, pid);
        return used ? { ok: true, kind, id: pid } : { ok: false, reason: 'ไม่มีโอสถนี้ในถุงหรือยังไม่สามารถใช้ได้' };
      }
      return { ok: false, reason: 'ไม่พบระบบใช้โอสถ' };
    }
    if (kind === 'CRYSTAL') {
      const cKey = String(itemId).startsWith('S:') || String(itemId).startsWith('T:') ? itemId : ('S:' + itemId);
      if (g.MARTIAL && g.MARTIAL.useCrystal) {
        return g.MARTIAL.useCrystal(W, n, cKey);
      }
    }
    if (kind === 'TECH_MANUAL') {
      if (g.MARTIAL && g.MARTIAL.isInnateTech && g.MARTIAL.isInnateTech(itemId)) return { ok: false, reason: 'วิชาเฉพาะสายย่อยติดตัวไม่สามารถเรียนผ่านคัมภีร์ได้' };
      if (!n.inv || !Array.isArray(n.inv.techs) || !n.inv.techs.includes(itemId)) return { ok: false, reason: 'ไม่มีคัมภีร์ในถุงส่วนตัว' };
      const t = CULT.tech(itemId);
      if (!t || t.innateOnly || !n.cult) return { ok: false, reason: 'ต้องเป็นผู้บำเพ็ญจึงจะเรียนคัมภีร์ได้' };
      const eGate = (g.MARTIAL && g.MARTIAL.eligible) ? g.MARTIAL.eligible(n, 'T:' + itemId, { allowMantra: true, allowForbidden: true }) : null;
      if (eGate && !eGate.ok) return { ok: false, reason: eGate.reason || 'ยังไม่ผ่านเกณฑ์ศึกษาคัมภีร์' };
      const effStage = CULT.effectiveTechStage ? CULT.effectiveTechStage(n) : n.cult.stage;
      if ((t.reqTier || t.tier || 1) > effStage) return { ok: false, reason: 'ขั้นบำเพ็ญไม่ถึงเกณฑ์ (ต้องการขั้น ' + (t.reqTier || t.tier) + ')' };
      const oldHp = n.h && n.h.state ? n.h.state.hp : null;
      const oldQi = n.h && n.h.state ? n.h.state.qi : null;
      if (/_MANTRA$/.test(t.cat || '')) {
        n.cult.unlockedMantras = Array.isArray(n.cult.unlockedMantras) ? n.cult.unlockedMantras : [];
        if (!n.cult.unlockedMantras.includes(itemId)) n.cult.unlockedMantras.push(itemId);
        n.cult.mantra = itemId;
        if (Array.isArray(t.moveDefs) && t.moveDefs.length && !n.cult.techs.includes(itemId)) n.cult.techs.push(itemId);
      } else {
        if (!n.cult.techs.includes(itemId)) n.cult.techs.push(itemId);
      }
      if (g.ELEM && g.ELEM.syncSpecialAccess) g.ELEM.syncSpecialAccess(n);
      if (g.MARTIAL && g.MARTIAL.reconcilePassives) g.MARTIAL.reconcilePassives(n);
      if (g.MARTIAL && g.MARTIAL.syncResourceCaps) g.MARTIAL.syncResourceCaps(n, oldHp, oldQi);
      n.inv.techs = n.inv.techs.filter(x => x !== itemId);
      if (Array.isArray(n.inv.spawnedTechs)) {
        n.inv.spawnedTechs = n.inv.spawnedTechs.filter(x => x !== itemId);
        if (!n.inv.spawnedTechs.length) delete n.inv.spawnedTechs;
      }
      HC.bump(n);
      W.log('learn', n.h.name.given + ' ศึกษาคัมภีร์ส่วนตัว「' + t.nameTh + '」จนสำเร็จ!', [n.id]);
      return { ok: true, kind, id: itemId };
    }
    if (kind === 'RECIPE_SCROLL') {
      if (g.CONTENT && g.CONTENT.authorizeRecipe) {
        return g.CONTENT.authorizeRecipe(W, n, itemId);
      }
    }
    if (kind === 'ORGAN') {
      if (g.CONTENT && g.CONTENT.refineOrgan) {
        return g.CONTENT.refineOrgan(W, n, itemId, { free: true });
      }
    }
    return { ok: false, reason: 'ไม่สามารถใช้งานไอเทมประเภทนี้โดยตรง' };
  };

  /* ---------- Phase 3 (v2.0.7): Edit Hub Diplomacy, Sanctum, and Refinement Controls ---------- */
  EDITOR.diplomacyState = (W, sectId) => {
    if (!W || !W.world) return { sects: [], selectedSect: null, activeEvent: null };
    const sects = W.world.sects || [];
    let sel = sectId ? sects.find(s => s.id === sectId || s.factionId === sectId || s.code === sectId) : null;
    if (!sel && sects.length) sel = sects[0];
    const pol = W.world.politics || { activeEvent: null, stats: {}, events: [] };
    return {
      sects,
      selectedSect: sel,
      activeEvent: pol.activeEvent,
      stats: pol.stats,
      events: pol.events || []
    };
  };

  EDITOR.applyDiplomacyAction = (W, opts) => {
    opts = opts || {};
    if (!W || !W.world) return { ok: false, reason: 'ไม่พบข้อมูลโลก' };
    const sects = W.world.sects || [];
    const s = (opts.sectId && sects.find(x => x.id === opts.sectId || x.factionId === opts.sectId || x.code === opts.sectId)) || sects[0];
    if (!s) return { ok: false, reason: 'ไม่พบสำนักเป้าหมาย' };
    const action = opts.action;
    if (action === 'set_attitude') {
      const att = clamp(Math.round(Number(opts.attitude) || 0), -100, 100);
      s.attitude = att;
      W.log('mission', '[แก้ไขโดยผู้เล่น] ปรับค่าความสัมพันธ์กับ ' + s.nameTh + ' เป็น ' + att, []);
      return { ok: true, action, sectId: s.id, attitude: att };
    }
    if (action === 'sign_treaty') {
      const tType = opts.treaty || 'TRADE_CARAVAN_ACCORD';
      const res = g.CONTENT && g.CONTENT.signTreaty ? g.CONTENT.signTreaty(W, s, tType, { force: true, ignoreCooldown: true, free: true }) : { ok: false };
      W.log('mission', '[แก้ไขโดยผู้เล่น] ลงนามสนธิสัญญา「' + (g.CONTENT?.TREATY_TH?.[tType] || tType) + '」กับ ' + s.nameTh + ' โดยตรง', []);
      return res;
    }
    if (action === 'clear_treaty') {
      s.treaty = 'NONE';
      if (W.world && W.world.politics && W.world.politics.treaties) {
        delete W.world.politics.treaties[s.id];
      }
      W.log('mission', '[แก้ไขโดยผู้เล่น] ยกเลิกสนธิสัญญากับ ' + s.nameTh, []);
      return { ok: true, action, sectId: s.id, treaty: 'NONE' };
    }
    if (action === 'reset_cooldowns') {
      s.lastCaravanDay = null;
      s.exchangeCooldownUntil = null;
      s.treatyCooldownUntil = null;
      s.lastEnvoyDay = null;
      W.log('mission', '[แก้ไขโดยผู้เล่น] ล้างคูลดาวน์ทางการทูตทั้งหมดของ ' + s.nameTh, []);
      return { ok: true, action, sectId: s.id };
    }
    if (action === 'ally_exchange') {
      const res = g.CONTENT && g.CONTENT.exchangeWithAlly ? g.CONTENT.exchangeWithAlly(W, s, { force: true, ignoreCooldown: true, free: !!opts.free }) : { ok: false };
      return res;
    }
    if (action === 'trigger_envoy') {
      const defender = opts.defenderId ? W.byId[opts.defenderId] : null;
      const res = SECT.resolveRivalEnvoyChallenge(W, defender, s, { forceWin: opts.forceWin });
      return res;
    }
    if (action === 'spawn_political_event') {
      const ev = g.CONTENT && g.CONTENT.spawnPoliticalEvent ? g.CONTENT.spawnPoliticalEvent(W, opts.eventKind, s) : null;
      return { ok: !!ev, event: ev };
    }
    if (action === 'resolve_political_event') {
      const lead = opts.actorId ? W.byId[opts.actorId] : null;
      const res = g.CONTENT && g.CONTENT.resolvePoliticalEvent ? g.CONTENT.resolvePoliticalEvent(W, opts.choice, lead) : { ok: false };
      return res;
    }
    return { ok: false, reason: 'ไม่รองรับคำสั่ง: ' + action };
  };

  EDITOR.sanctumState = (W, sanctumId) => {
    if (!W || !W.explore) return { sanctums: [], selectedSanctum: null, catalysts: {}, bonusDrops: 0, bonusByTier: {} };
    const sState = g.EXPLORE && g.EXPLORE.ensureSanctums ? g.EXPLORE.ensureSanctums(W) : (W.explore.sanctums || {});
    const sList = Object.values((g.EXPLORE && g.EXPLORE.SANCTUMS) || {});
    let sel = sanctumId ? sList.find(s => s.id === sanctumId) : null;
    if (!sel && sList.length) sel = sList[0];
    const cats = g.ECO && g.ECO.ensureCatalysts ? g.ECO.ensureCatalysts(W) : (W.sect.catalysts || {});
    return {
      sanctums: sList,
      selectedSanctum: sel,
      clearedFloors: sState.clearedFloors || {},
      catalysts: cats,
      bonusDrops: sState.bonusDrops || 0,
      bonusByTier: sState.bonusByTier || {},
      history: sState.history || []
    };
  };

  EDITOR.applySanctumAction = (W, opts) => {
    opts = opts || {};
    if (!W || !W.explore) return { ok: false, reason: 'ไม่พบระบบวิหาร' };
    const sState = g.EXPLORE && g.EXPLORE.ensureSanctums ? g.EXPLORE.ensureSanctums(W) : (W.explore.sanctums || {});
    const action = opts.action;
    if (action === 'set_cleared') {
      const sId = opts.sanctumId || 'SANCTUM_SWORD_ABYSS';
      const fl = clamp(Math.floor(Number(opts.floor) || 0), 0, 3);
      sState.clearedFloors[sId] = fl;
      W.log('explore', '[แก้ไขโดยผู้เล่น] กำหนดชั้นสูงสุดที่ผ่านของ ' + sId + ' เป็น ' + fl + '/3', []);
      return { ok: true, action, sanctumId: sId, floor: fl };
    }
    if (action === 'instant_run') {
      const sc = (g.EXPLORE && g.EXPLORE.SANCTUMS && g.EXPLORE.SANCTUMS[opts.sanctumId]) || Object.values(g.EXPLORE.SANCTUMS)[0];
      const party = (Array.isArray(opts.partyIds) && opts.partyIds.length)
        ? opts.partyIds.map(id => W.byId[id]).filter(Boolean)
        : W.npcs.filter(n => n && !n.dead && n.cult).slice(0, 3);
      if (!party.length) return { ok: false, reason: 'ไม่มีผู้ฝึกตนในสำนัก' };
      const ex = {
        id: ++W.world.seq,
        kind: 'sanctum',
        region: sc.id,
        sanctumId: sc.id,
        placeTh: sc.nameTh,
        party: party.map(p => p.id),
        days: 1.5,
        done: false,
        target: opts.targetFloor || 3,
        journal: [],
        forceClear: opts.forceClear != null ? !!opts.forceClear : true,
        forceFailFloor: opts.forceFailFloor || null,
        forceBonusTier: opts.forceBonusTier || null,
        bonusRollOverride: opts.bonusRollOverride != null ? opts.bonusRollOverride : null,
        bonusTierRollOverride: opts.bonusTierRollOverride != null ? opts.bonusTierRollOverride : null
      };
      const res = g.EXPLORE.resolveSanctum(W, ex, party);
      W.log('explore', '[แก้ไขโดยผู้เล่น] จำลองการลงวิหาร「' + sc.nameTh + '」สำเร็จ ผ่าน ' + res.floorsCleared + '/3 ชั้น' + (res.bonusReward ? (' ได้รางวัลโบนัส「' + res.bonusReward.nameTh + '」') : ''), party.map(p => p.id));
      return { ok: true, action, result: res };
    }
    if (action === 'refine_gear') {
      const res = g.ECO && g.ECO.refineGearWithCatalyst
        ? g.ECO.refineGearWithCatalyst(W, opts.gearUid, opts.catalystId, opts.npcId ? W.byId[opts.npcId] : null, { free: !!opts.free, allowAnyTier: !!opts.allowAnyTier })
        : { ok: false, reason: 'no-refine-fn' };
      return res;
    }
    if (action === 'spawn_catalysts') {
      const qty = clamp(Math.floor(Number(opts.qty) || 5), 1, 100);
      Object.keys(g.ECO.REFINEMENT_CATALYSTS || {}).forEach(cId => {
        g.ECO.addCatalyst(W, cId, qty);
      });
      W.log('craft', '[แก้ไขโดยผู้เล่น] เติมผลึกขัดเกลาทุกชนิดเข้าคลังสำนัก ชนิดละ ' + qty + ' ก้อน', []);
      return { ok: true, action, qty };
    }
    return { ok: false, reason: 'ไม่รองรับคำสั่ง: ' + action };
  };

  /* ---------- Phase 4 (v2.0.8): Spirit Beast Pets, Mech/Karma State & Timed Buffs Editor ---------- */
  EDITOR.petState = (W, npcId) => {
    const n = (W && W.byId && npcId) ? W.byId[npcId] : null;
    if (!n) return { ok: false, reason: 'ไม่พบตัวละคร' };
    if (CULT.ensurePets) CULT.ensurePets(n);
    const maxPets = CULT.maxActivePets ? CULT.maxActivePets(n) : 1;
    const pets = Array.isArray(n.pets) ? n.pets : [];
    const activePets = CULT.activePets ? CULT.activePets(n) : pets.filter(p => p && p.active);
    const mechState = CULT.ensureMechState ? CULT.ensureMechState(n) : (n.mechState || null);
    const karmaState = CULT.ensureKarmaState ? CULT.ensureKarmaState(n) : (n.karmaState || null);
    const activeBuffs = (g.STATS && g.STATS.getActiveBuffs) ? g.STATS.getActiveBuffs(n, W ? W.t : undefined) : [];
    const menagerie = (CULT.ensureMenagerie) ? CULT.ensureMenagerie(W) : ((W && W.sect && W.sect.beasts) || []);
    const breedingRecords = (W && W.sect && W.sect.breedingRecords) || [];
    const supportDoctrine = (g.SECT && g.SECT.ensureSupportDoctrine) ? g.SECT.ensureSupportDoctrine(W) : null;
    const specialistFacilities = (g.SECT && g.SECT.ensureSpecialistFacilities) ? g.SECT.ensureSpecialistFacilities(W) : null;
    return {
      ok: true,
      npcId: n.id,
      maxPets,
      pets,
      activePets,
      mechState,
      karmaState,
      activeBuffs,
      menagerie,
      gateBeasts: (W && W.sect && Array.isArray(W.sect.gateBeasts)) ? W.sect.gateBeasts : [],
      breedingRecords,
      supportDoctrine,
      specialistFacilities,
      speciesCatalog: (CULT.allBeastSpecies ? CULT.allBeastSpecies() : ((JD && JD.BEASTS && JD.BEASTS.beasts) || [])),
      buffCatalog: (g.STATS && g.STATS.BUFF_CATALOG) ? g.STATS.BUFF_CATALOG : {}
    };
  };

  EDITOR.applyPetAction = (W, a1, a2) => {
    const opts = (typeof a1 === 'string' ? Object.assign({ npcId: a1 }, a2 || {}) : (a1 || {}));
    if (opts.petId && !opts.petUid) opts.petUid = opts.petId;
    if (!W || !W.byId) return { ok: false, reason: 'ไม่พบข้อมูลโลก' };
    const n = W.byId[opts.npcId || (W.sect && W.sect.masterId)];
    if (!n) return { ok: false, reason: 'ไม่พบตัวละครเป้าหมาย' };
    const action = opts.action;

    if (action === 'assign_gate_beast' || action === 'release_gate_beast') {
      if (!g.EXPED || !g.EXPED.assignGateBeast) return { ok: false, reason: 'ระบบกองอสูรพิทักษ์ยังไม่พร้อม' };
      return g.EXPED.assignGateBeast(W, opts.beastUid || opts.petUid, action === 'assign_gate_beast' && opts.assigned !== false);
    }

    if (action === 'spawn_pet') {
      const beasts = (CULT.allBeastSpecies ? CULT.allBeastSpecies() : ((JD && JD.BEASTS && JD.BEASTS.beasts) || []));
      const bDef = beasts.find(b => b.id === opts.speciesId) || beasts[0] || { id: 'B01', nameTh: 'อสูรวิญญาณ', tier: 2, element: 'WOOD_LIFE' };
      const customBeast = Object.assign({}, bDef, {
        tier: clamp(Math.floor(Number(opts.tier || bDef.tier || 1)), 1, 7),
        nameTh: opts.nameTh ? String(opts.nameTh).trim() : bDef.nameTh
      });
      const res = CULT.bindPet ? CULT.bindPet(W, n, customBeast, {
        loyalty: opts.loyalty != null ? Number(opts.loyalty) : 85,
        satisfaction: opts.satisfaction != null ? Number(opts.satisfaction) : 90,
        bondXp: opts.bondXp != null ? Number(opts.bondXp) : 0,
        growthStage: opts.growthStage != null ? Number(opts.growthStage) : 1,
        sovereignAwakened: !!opts.sovereignAwakened,
        replaceWeakest: opts.replaceWeakest !== false
      }) : { ok: false, reason: 'no-bindPet' };
      if (res.ok && g.STATS && g.STATS.dirty) g.STATS.dirty(n);
      return res;
    }

    if (action === 'update_pet') {
      if (CULT.ensurePets) CULT.ensurePets(n);
      const pet = (n.pets || []).find(p => p && (p.uid === opts.petUid || p.id === opts.petUid)) || (n.pets || [])[0];
      if (!pet) return { ok: false, reason: 'ไม่พบสัตว์อสูรในพันธสัญญา' };
      if (opts.nameTh !== undefined && String(opts.nameTh).trim()) pet.nameTh = String(opts.nameTh).trim();
      if (opts.tier !== undefined) pet.tier = clamp(Math.floor(Number(opts.tier)), 1, 7);
      if (opts.loyalty !== undefined || opts.bond !== undefined) {
        const bVal = clamp(Math.round(Number(opts.loyalty !== undefined ? opts.loyalty : opts.bond)), 0, 100);
        pet.bond = bVal;
        pet.loyalty = bVal;
      }
      if (opts.satisfaction !== undefined || opts.hunger !== undefined) {
        const hVal = clamp(Math.round(Number(opts.satisfaction !== undefined ? opts.satisfaction : opts.hunger)), 0, 100);
        pet.hunger = hVal;
        pet.satisfaction = hVal;
      }
      if (opts.bondXp !== undefined || opts.exp !== undefined) {
        const xVal = Math.max(0, Math.round(Number(opts.bondXp !== undefined ? opts.bondXp : opts.exp)));
        pet.bondXp = xVal;
        pet.exp = xVal;
      }
      if (opts.level !== undefined) {
        pet.level = clamp(Math.floor(Number(opts.level)), 1, 9);
        pet.growthStage = pet.sovereignAwakened ? 4 : Math.min(3, Math.max(1, Math.ceil(pet.level / 3)));
      }
      if (opts.growthStage !== undefined) {
        pet.growthStage = clamp(Math.floor(Number(opts.growthStage)), 1, 4);
        pet.level = Math.max(pet.level || 1, (pet.growthStage - 1) * 3 + 1);
      }
      if (opts.sovereignAwakened !== undefined) {
        pet.sovereignAwakened = !!opts.sovereignAwakened;
        if (pet.sovereignAwakened) {
          pet.bloodlineTrait = 'SOVEREIGN_AWAKENED';
          pet.growthStage = 4;
        }
      }
      if (opts.active !== undefined) pet.active = !!opts.active;
      if (CULT.ensurePets) CULT.ensurePets(n);
      if (g.STATS && g.STATS.dirty) g.STATS.dirty(n);
      HC.bump(n);
      return { ok: true, action, pet };
    }

    if (action === 'awaken_sovereign') {
      if (CULT.ensurePets) CULT.ensurePets(n);
      const pet = (n.pets || []).find(p => p && (p.uid === opts.petUid || p.id === opts.petUid)) || (n.pets || [])[0];
      if (!pet) return { ok: false, reason: 'ไม่พบสัตว์อสูรในพันธสัญญา' };
      pet.bondXp = Math.max(pet.bondXp || 0, 500);
      pet.loyalty = Math.max(pet.loyalty || 0, 95);
      pet.satisfaction = Math.max(pet.satisfaction || 0, 95);
      pet.tier = Math.max(pet.tier || 1, 5);
      pet.growthStage = 4;
      pet.sovereignAwakened = true;
      if (CULT.evolvePet) CULT.evolvePet(W, n, pet.uid);
      if (CULT.ensurePets) CULT.ensurePets(n);
      if (g.STATS && g.STATS.dirty) g.STATS.dirty(n);
      HC.bump(n);
      return { ok: true, action, pet };
    }

    if (action === 'feed_pet') {
      if (!CULT.feedPet) return { ok: false, reason: 'ไม่พบระบบให้อาหารสัตว์อสูร' };
      const res = CULT.feedPet(W, n, opts.petUid, { free: true });
      if (g.STATS && g.STATS.dirty) g.STATS.dirty(n);
      return res;
    }

    if (action === 'release_pet') {
      if (!Array.isArray(n.pets) || !n.pets.length) return { ok: false, reason: 'ไม่มีสัตว์อสูรให้ปลดปล่อย' };
      const idx = opts.petUid ? n.pets.findIndex(p => p && (p.uid === opts.petUid || p.id === opts.petUid)) : 0;
      if (idx < 0) return { ok: false, reason: 'ไม่พบสัตว์อสูรที่ระบุ' };
      const removed = n.pets.splice(idx, 1)[0];
      if (CULT.ensurePets) CULT.ensurePets(n);
      if (g.STATS && g.STATS.dirty) g.STATS.dirty(n);
      HC.bump(n);
      return { ok: true, action, removed };
    }

    if (action === 'set_mech_state') {
      const ms = CULT.ensureMechState ? CULT.ensureMechState(n) : (n.mechState = n.mechState || {});
      if (opts.constructReadiness !== undefined || opts.integrity !== undefined) {
        const rVal = clamp(Math.round(Number(opts.constructReadiness !== undefined ? opts.constructReadiness : opts.integrity)), 0, 100);
        ms.integrity = rVal;
        ms.constructReadiness = rVal;
      }
      if (opts.overclockReady !== undefined) {
        ms.overclockReady = !!opts.overclockReady;
        if (ms.overclockReady && (ms.charge || 0) < 50) ms.charge = 100;
      }
      if (opts.decoyAvailable !== undefined || opts.vesselDecoyReady !== undefined) {
        const dVal = !!(opts.decoyAvailable !== undefined ? opts.decoyAvailable : opts.vesselDecoyReady);
        ms.decoyAvailable = dVal;
        ms.vesselDecoyReady = dVal;
      }
      if (opts.mode !== undefined) ms.mode = String(opts.mode);
      if (opts.puppetTier !== undefined) ms.puppetTier = clamp(Math.floor(Number(opts.puppetTier)), 1, 8);
      if (g.STATS && g.STATS.dirty) g.STATS.dirty(n);
      HC.bump(n);
      return { ok: true, action, mechState: ms };
    }

    if (action === 'set_karma_state') {
      const ks = CULT.ensureKarmaState ? CULT.ensureKarmaState(n) : (n.karmaState = n.karmaState || {});
      if (opts.karmicDebt !== undefined || opts.debtPool !== undefined) {
        const dVal = clamp(Math.round(Number(opts.karmicDebt !== undefined ? opts.karmicDebt : opts.debtPool)), 0, ks.maxDebt || 5000);
        ks.debtPool = dVal;
        ks.karmicDebt = dVal;
      }
      if (opts.activeRealmStance !== undefined || opts.stance !== undefined) {
        const sVal = String(opts.activeRealmStance !== undefined ? opts.activeRealmStance : opts.stance);
        ks.stance = sVal;
        ks.activeRealmStance = sVal;
      }
      if (opts.meritStacks !== undefined) ks.meritStacks = clamp(Math.round(Number(opts.meritStacks)), 0, 99);
      if (opts.echoReady !== undefined) ks.echoReady = !!opts.echoReady;
      if (g.STATS && g.STATS.dirty) g.STATS.dirty(n);
      HC.bump(n);
      return { ok: true, action, karmaState: ks };
    }

    if (action === 'cast_heal_buff') {
      const target = opts.targetId && W.byId[opts.targetId] ? W.byId[opts.targetId] : n;
      if (CULT.castHealOrBuff) {
        return CULT.castHealOrBuff(W, n, target, {
          buffKey: opts.buffKey || 'vitalRegen',
          duration: opts.duration != null ? Number(opts.duration) : 180,
          healPct: opts.healPct != null ? Number(opts.healPct) : 0.28,
          force: true
        });
      }
      return { ok: false, reason: 'no-castHealOrBuff' };
    }

    if (action === 'clear_buffs') {
      if (g.STATS && g.STATS.clearBuff) {
        g.STATS.clearBuff(n, opts.buffKey || null);
      } else {
        n.buffs = [];
        n.sx = [];
      }
      HC.bump(n);
      return { ok: true, action };
    }

    if (action === 'breed_pets') {
      const parentA = opts.parentA || (n.pets && n.pets[0]);
      const parentB = opts.parentB || (n.pets && n.pets[1]) || (W.sect && W.sect.beasts && W.sect.beasts[0]);
      if (CULT.breedBeasts) {
        return CULT.breedBeasts(W, parentA, parentB, opts);
      }
      return { ok: false, reason: 'no-breedBeasts' };
    }

    if (action === 'set_support_doctrine') {
      if (SECT.setSupportDoctrine) {
        const doc = SECT.setSupportDoctrine(W, opts);
        return { ok: true, action, supportDoctrine: doc };
      }
      return { ok: false, reason: 'no-setSupportDoctrine' };
    }

    if (action === 'upgrade_specialist_facility') {
      if (SECT.upgradeSpecialistFacility) {
        return SECT.upgradeSpecialistFacility(W, opts.facilityId, opts);
      }
      return { ok: false, reason: 'no-upgradeSpecialistFacility' };
    }

    return { ok: false, reason: 'ไม่รองรับคำสั่ง: ' + action };
  };

  SECT.EDITOR = EDITOR;

  /* ---------- Ancestral Shrine Legacy Tablets & Fallen Elder Blessings (v2.0.6 Pillar C) ---------- */
  SECT.ensureLegacyTablets = W => {
    if (!W || !W.sect) return [];
    if (!Array.isArray(W.sect.legacyTablets)) W.sect.legacyTablets = [];
    return W.sect.legacyTablets;
  };

  SECT.inscribeLegacyTablet = (W, n, why, opts) => {
    opts = opts || {};
    if (!W || !W.sect || !n) return null;
    const tablets = SECT.ensureLegacyTablets(W);
    if (tablets.some(t => t.npcId === n.id)) return tablets.find(t => t.npcId === n.id);
    const effSt = n.cult ? (CULT.effectiveTechStage ? CULT.effectiveTechStage(n) : n.cult.stage) : (n.stage || 0);
    const eqSt = n.cult ? (CULT.equivalentStage ? CULT.equivalentStage(n) : effSt) : effSt;
    const qualifies = opts.force || (n.rank || 0) >= 4 || effSt >= 4 || eqSt >= 4 || n.id === W.sect.masterId || n.id === W.sect.deputyId;
    if (!qualifies) return null;
    const sig = SECT.signatureVictoryOf ? SECT.signatureVictoryOf(n) : { subpath: n.cult?.sub || 'NONE', subpathNameTh: '', techId: null, techNameTh: 'เคล็ดวิชาบรรพชน', weaponType: 'SWORD' };
    const nameTh = (n.h && n.h.name) ? (n.h.name.family + n.h.name.given) : (n.name || 'ผู้อาวุโสบรรพชน');
    const tablet = {
      id: 'TAB_' + (n.id || ('ELDER_' + (tablets.length + 1))),
      npcId: n.id,
      nameTh,
      titleTh: SECT.title ? SECT.title(n) : 'ผู้อาวุโส',
      rank: n.rank || 4,
      path: n.cult ? n.cult.path : (n.path || 'XIAN'),
      sub: n.cult ? n.cult.sub : (n.sub || 'NONE'),
      subpathNameTh: sig.subpathNameTh || (n.cult ? n.cult.sub : 'NONE'),
      stage: n.cult ? n.cult.stage : (n.stage || 4),
      effectiveStage: Math.max(4, effSt),
      signatureTechId: sig.techId,
      signatureTechNameTh: sig.techNameTh,
      inscribedDay: W.day || 0,
      causeTh: why || 'ละสังขารตามอายุขัย',
      breakthroughBonus: +(0.04 + Math.min(0.08, Math.max(4, effSt) * 0.01)).toFixed(3),
      comprehensionBonus: +(0.08 + Math.min(0.14, Math.max(4, effSt) * 0.018)).toFixed(3),
      injuryProtection: true,
      prayersCount: 0
    };
    tablets.unshift(tablet);
    if (tablets.length > 36) tablets.length = 36;
    if (!opts.quiet && W.log) {
      W.log('sect', '🕯️ จารึกป้ายวิญญาณบรรพชนของ「' + nameTh + '」(' + tablet.subpathNameTh + ') ประดิษฐานในศาลบรรพชน', [n.id]);
    }
    return tablet;
  };

  SECT.prayAtAncestralShrine = (W, n, tabletId) => {
    if (!W || !W.sect || !n || n.dead) return null;
    const tablets = SECT.ensureLegacyTablets(W);
    if (!tablets.length) return null;
    let tab = tabletId ? tablets.find(t => t.id === tabletId || t.npcId === tabletId) : null;
    if (!tab && n.cult) {
      tab = tablets.find(t => t.sub && t.sub !== 'NONE' && t.sub === n.cult.sub) ||
            tablets.find(t => t.path === n.cult.path) ||
            tablets[0];
    }
    if (!tab) tab = tablets[0];
    tab.prayersCount = (tab.prayersCount || 0) + 1;
    const pathMatch = !!(n.cult && tab.path === n.cult.path);
    const subMatch = !!(n.cult && tab.sub && tab.sub !== 'NONE' && tab.sub === n.cult.sub);
    const mult = subMatch ? 1.35 : pathMatch ? 1.0 : 0.65;
    const btBonus = +(tab.breakthroughBonus * mult).toFixed(3);
    const studySpeedMult = +(1 + tab.comprehensionBonus * mult).toFixed(3);
    let blessing = null;
    const canGrantBlessing = !Number.isFinite(n.ancestralPrayerCooldownUntil) || (W.t || 0) >= n.ancestralPrayerCooldownUntil;
    if (canGrantBlessing) {
      blessing = n.ancestralBlessing = {
        tabletId: tab.id,
        elderId: tab.npcId,
        elderNameTh: tab.nameTh,
        path: tab.path,
        sub: tab.sub,
        pathMatch,
        subMatch,
        breakthroughBonus: btBonus,
        studySpeedMult,
        injuryShield: !!(pathMatch || subMatch),
        grantedDay: W.day || 0,
        untilDay: (W.day || 0) + 14,
        until: (W.t || 0) + 14 * 1440
      };
      n.ancestralPrayerCooldownUntil = (W.t || 0) + 30 * 1440;
    }
    n.h.state.heartDemon = Math.max(0, (n.h.state.heartDemon || 0) - (subMatch ? 12 : pathMatch ? 8 : 4));
    n.h.state.stress = Math.max(0, (n.h.state.stress || 0) - 8);
    HC.bump(n);
    return blessing;
  };

  /* ======================= v2.0.10: All-Jianghu Martial Conference ======================= */
  SECT.WORLD_MARTIAL_CONFERENCE = {
    INTERVAL_DAYS: 1080,
    BRACKETS: [
      { id: 'JUNIOR', nameTh: 'รุ่นเยาว์', min: 1, max: 3, cp: 70 },
      { id: 'CORE', nameTh: 'รุ่นแกนหลัก', min: 4, max: 6, cp: 130 },
      { id: 'ELDER_PEAK', nameTh: 'รุ่นยอดฝีมือ', min: 7, max: 9, cp: 220 }
    ]
  };
  const WMC = SECT.WORLD_MARTIAL_CONFERENCE;
  WMC.ensure = W => {
    if (!W || !W.sect) return null;
    if (!W.sect.worldMartialConference || typeof W.sect.worldMartialConference !== 'object') W.sect.worldMartialConference = { lastDay: 0, nextDay: WMC.INTERVAL_DAYS, total: 0, history: [] };
    const st = W.sect.worldMartialConference;
    if (!Number.isFinite(st.lastDay) || st.lastDay < 0) st.lastDay = 0;
    if (!Array.isArray(st.history)) st.history = [];
    if (!Number.isFinite(st.nextDay) || st.nextDay <= 0) st.nextDay = WMC.INTERVAL_DAYS;
    if (!Number.isFinite(st.total) || st.total < 0) st.total = 0;
    return st;
  };
  const wmcStageFor = (path, target) => {
    const def = CULT.PATHS && CULT.PATHS[path];
    const max = def ? def.maxStage : 9;
    let best = 1, delta = Infinity;
    for (let stage = 1; stage <= max; stage++) {
      const eq = CULT.equivalentStage({ cult: { path, stage } });
      if (Math.abs(eq - target) < delta) { best = stage; delta = Math.abs(eq - target); }
    }
    return best;
  };
  WMC.makeGuest = (W, sect, bracket) => {
    const path = (CULT.PATHS && CULT.PATHS[sect.majorPath]) ? sect.majorPath : 'XIAN';
    const eqTarget = (bracket.min + bracket.max) / 2;
    const stage = wmcStageFor(path, eqTarget);
    const eqStage = CULT.equivalentStage({ cult: { path, stage } });
    const types = ['SWORD','BLADE','SPEAR','FIST','BOW','STAFF','FOCUS'];
    const weapon = types[Math.floor((W.day || 0) + (sect.power || 1) * 17 + bracket.min) % types.length];
    const setPieces = g.EXPLORE && g.EXPLORE.pagodaSetPieces ? g.EXPLORE.pagodaSetPieces(path, W.day) : [];
    const equip = { WEAPON: { slot: 'WEAPON', gearType: weapon, tier: Math.max(4, Math.min(7, stage)), nameTh: weapon } };
    for (const piece of setPieces) equip[piece.slot] = piece;
    const name = 'ยอดฝีมือ' + (sect.shortTh || sect.nameTh || 'สำนักยุทธภพ');
    const pow = Math.round(175 * Math.pow(1.37, eqStage - 1) * (0.84 + Math.max(0, sect.power || 1) * 0.08));
    return {
      id: 'WMC_' + (W.day || 0) + '_' + sect.id + '_' + bracket.id,
      isGuest: true, guestSectId: sect.id, guestSectNameTh: sect.shortTh || sect.nameTh,
      name, nameTh: name, h: { name: { given: name, family: '' }, state: { hp: 1000, satiety: 100, rest: 100, energy: 100 }, skills: { [weapon]: stage * 12 }, personality: { courage: 70, bravery: 70, caution: 30 }, values: { martialPeak: 80 }, root: { primaryElement: 'EARTH_METAL', elements: ['EARTH_METAL'], weights: { EARTH_METAL: 1 } } },
      cult: { path, stage, sub: 'NONE', techs: [] }, pets: [], inv: { stones: 0 }, rank: stage >= 6 ? 4 : stage >= 3 ? 2 : 1,
      power: pow, equip, conferenceEquivalentStage: eqStage
    };
  };
  WMC.makeFormationParty = (W, fighter, sect, bracket) => {
    const strategies = [
      ['BODY', 'BEAST_SOVEREIGN'],
      ['XIAN', 'HEART_SOUL'],
      ['MECH_PUPPET', 'SAGE_SUPPORT'],
      ['KARMA_SAMSARA', 'SAGE_SUPPORT']
    ];
    const key = String(sect && sect.id || 'PLAYER') + '|' + String(fighter && fighter.id || '') + '|' + String(bracket && bracket.id || '');
    let hash = 0; for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) | 0;
    const supportPaths = strategies[Math.abs(hash) % strategies.length];
    const basePath = fighter && fighter.cult && fighter.cult.path;
    const paths = Array.from(new Set([basePath].concat(supportPaths).filter(path => CULT.PATHS && CULT.PATHS[path]))).slice(0, 3);
    const party = [fighter];
    for (const path of paths) {
      if (path === basePath) continue;
      const proxySect = Object.assign({}, sect || {}, { id: (sect && sect.id || 'PLAYER') + '_FORMATION_' + path, majorPath: path });
      const helper = WMC.makeGuest(W, proxySect, bracket);
      helper.name = helper.nameTh = 'ผู้ร่วมค่ายกล' + (CULT.PATHS[path].nameTh || path);
      party.push(helper);
    }
    return party;
  };
  WMC.run = (W, opts) => {
    opts = opts || {};
    if (!W || !W.sect || !W.world) return { ok: false, reason: 'no-world', brackets: [] };
    const state = WMC.ensure(W), candidates = (W.npcs || []).filter(n => n && !n.dead && !n.exiled && !n.away && n.cult);
    if (!candidates.length) return { ok: false, reason: 'no-eligible-local-entrants', brackets: [] };
    const guests = Array.isArray(W.world.sects) ? W.world.sects : [];
    const results = [], bracketChampions = [];
    let localFame = 0, entrantTotal = 0;
    for (const spec of WMC.BRACKETS) {
      const local = candidates.filter(n => {
        const eq = CULT.equivalentStage ? CULT.equivalentStage(n) : n.cult.stage || 1;
        return eq >= spec.min && eq <= spec.max;
      });
      const entrants = local.slice();
      for (const sect of guests) entrants.push(WMC.makeGuest(W, sect, spec));
      if (!entrants.length) continue;
      entrantTotal += entrants.length;
      entrants.sort((a,b) => (b.power != null ? b.power : CULT.power(b)) - (a.power != null ? a.power : CULT.power(a)));
      let round = entrants, runnerUp = null;
      const bouts = [];
      while (round.length > 1) {
        const next = [];
        for (let i = 0; i < round.length; i += 2) {
          if (i + 1 >= round.length) { next.push(round[i]); continue; }
          const a = round[i], b = round[i + 1];
          const bout = SECT.simulateAssemblyBout(W, a, b, { useFormation: true, formationPartyA: WMC.makeFormationParty(W, a, a.isGuest ? guests.find(s => s.id === a.guestSectId) : { id: 'PLAYER' }, spec), formationPartyB: WMC.makeFormationParty(W, b, b.isGuest ? guests.find(s => s.id === b.guestSectId) : { id: 'PLAYER' }, spec) });
          runnerUp = bout.loser; next.push(bout.winner);
          bouts.push({ aId: a.id, bId: b.id, winnerId: bout.winner.id, loserId: bout.loser.id, tacticalRelation: bout.tacticalRelation, resonanceA: bout.resonanceA, resonanceB: bout.resonanceB, formationA: bout.formationA, formationB: bout.formationB });
        }
        round = next;
      }
      const champ = round[0], champPower = champ.power != null ? champ.power : CULT.power(champ);
      const sig = SECT.signatureVictoryOf(champ);
      if (!champ.isGuest) {
        const cp = spec.cp;
        if (g.CPE && g.CPE.mint) g.CPE.mint(W, champ, cp, 'แชมป์ชุมนุมยุทธภพระดับ' + spec.nameTh, true);
        else { champ.cp = (champ.cp || 0) + cp; champ.cpEarned = (champ.cpEarned || 0) + cp; }
        champ.merit = (champ.merit || 0) + 28;
        HC.experience(champ, 'victory', 0.6);
        localFame += spec.id === 'ELDER_PEAK' ? 8 : spec.id === 'CORE' ? 5 : 3;
      } else {
        const sect = guests.find(s => s.id === champ.guestSectId);
        if (sect) sect.continentalPrestige = (sect.continentalPrestige || 0) + 4;
      }
      if (runnerUp && !runnerUp.isGuest) { runnerUp.cp = (runnerUp.cp || 0) + Math.floor(spec.cp * 0.30); runnerUp.cpEarned = (runnerUp.cpEarned || 0) + Math.floor(spec.cp * 0.30); runnerUp.merit = (runnerUp.merit || 0) + 10; }
      const result = { bracketId: spec.id, nameTh: spec.nameTh, minEquivalentStage: spec.min, maxEquivalentStage: spec.max, entrantCount: entrants.length, boutCount: bouts.length, bouts, championId: champ.id, championName: HC.fullName(champ), championSectId: champ.isGuest ? champ.guestSectId : 'PLAYER', championSectNameTh: champ.isGuest ? champ.guestSectNameTh : W.sect.name, championPower: champPower, runnerUpId: runnerUp ? runnerUp.id : null, weaponType: sig.weaponType, signatureTechName: sig.techNameTh };
      results.push(result); bracketChampions.push({ champ, power: champPower, result });
    }
    if (!results.length) return { ok: false, reason: 'no-brackets', brackets: [] };
    bracketChampions.sort((a,b) => b.power - a.power);
    const overall = bracketChampions[0], winner = overall.champ;
    let award = null;
    if (!winner.isGuest) {
      W.fame(24 + localFame);
      W.sect.continentalPrestige = (W.sect.continentalPrestige || 0) + 20;
      W.sect.imperialDecrees = (W.sect.imperialDecrees || 0) + 1;
      if (ECO && ECO.earn) ECO.earn(W, 360, 'รางวัลชนะเลิศชุมนุมยุทธภพ');
      award = { sectId: 'PLAYER', continentalPrestige: 20, imperialDecrees: 1, spiritStones: 360 };
    } else {
      const sect = guests.find(s => s.id === winner.guestSectId);
      if (sect) {
        sect.continentalPrestige = (sect.continentalPrestige || 0) + 20;
        sect.imperialDecrees = (sect.imperialDecrees || 0) + 1;
        award = { sectId: sect.id, continentalPrestige: 20, imperialDecrees: 1, spiritStones: 0 };
      }
      W.fame(Math.max(2, localFame));
    }
    const record = {
      id: 'WMC_' + (W.day || 0) + '_' + (state.total + 1), day: W.day || 0,
      year: Math.floor((W.day || 0) / 360) + 1, invitedSectIds: guests.map(s => s.id), entrantCount: entrantTotal,
      championId: winner.id, championName: HC.fullName(winner), championSectId: winner.isGuest ? winner.guestSectId : 'PLAYER',
      championSectNameTh: winner.isGuest ? winner.guestSectNameTh : W.sect.name, brackets: results, award,
      summaryTh: 'ชุมนุมยุทธภพปีที่ ' + (Math.floor((W.day || 0) / 360) + 1) + ' · ' + results.map(r => r.nameTh + ' แชมป์ ' + r.championName).join(' / ')
    };
    state.lastDay = W.day || 0; state.total++;
    state.nextDay = Math.max(state.nextDay, state.lastDay + WMC.INTERVAL_DAYS);
    state.history.unshift(record); if (state.history.length > 12) state.history.length = 12;
    W.log('tournament', '🏆 ' + record.summaryTh + (award && award.imperialDecrees ? ' · ได้รับราชโองการพระราชทาน' : ''), results.map(r => r.championId).filter(id => W.byId[id]));
    return { ok: true, conference: record, brackets: results, champion: winner };
  };
  WMC.tick = W => {
    const state = WMC.ensure(W);
    if (!state || (W.day || 0) < WMC.INTERVAL_DAYS || (W.day || 0) % WMC.INTERVAL_DAYS !== 0 || state.lastDay === W.day) return null;
    const result = WMC.run(W);
    if (result.ok) { state.lastDay = W.day; state.nextDay = W.day + WMC.INTERVAL_DAYS; }
    return result;
  };
  SECT.runWorldMartialConference = WMC.run;

  /* ======================= v2.0.11: Heavenly Tribulation & Ascension ======================= */
  SECT.ensureCelestialTribulation = W => {
    if (!W || !W.sect) return null;
    if (!W.sect.celestialTribulation || typeof W.sect.celestialTribulation !== 'object') {
      W.sect.celestialTribulation = { active: null, history: [], sequence: 0 };
    }
    const state = W.sect.celestialTribulation;
    if (state.active != null && (!state.active || typeof state.active !== 'object' || Array.isArray(state.active))) state.active = null;
    if (!Array.isArray(state.history)) state.history = [];
    if (state.history.length > 50) state.history.length = 50;
    if (!Number.isFinite(state.sequence) || state.sequence < 0) state.sequence = 0;
    if (!Number.isSafeInteger(W.sect.ascendedLegacyCount) || W.sect.ascendedLegacyCount < 0) W.sect.ascendedLegacyCount = 0;
    if (!Array.isArray(W.sect.ascendedLegacyHistory)) W.sect.ascendedLegacyHistory = [];
    if (W.sect.ascendedLegacyHistory.length > 50) W.sect.ascendedLegacyHistory.length = 50;
    return state;
  };
  SECT.ascensionCultivationMultiplier = W => {
    const count = W && W.sect && Number.isFinite(W.sect.ascendedLegacyCount) ? Math.max(0, W.sect.ascendedLegacyCount) : 0;
    return +(1 + Math.min(5, count) * 0.01).toFixed(3);
  };
  const TRIBULATION_STONE_COST = 500;
  const TRIBULATION_RETRY_DAYS = 90;
  const TRIBULATION_HELPER_CAP = 3;
  const TRIBULATION_RECOVERY_PILLS = ['P:REC190_PILL_004', 'P:REC190_PILL_003', 'P:REC140_ALC_JADE_MARROW_2'];
  const resolveTribulationNpc = (W, value) => typeof value === 'string' ? (W && W.byId && W.byId[value]) : value;
  const tribulationAvailable = (W, n) => !!(W && n && W.npcs && W.npcs.includes(n) && n.cult && !n.dead && !n.exiled && !n.away && !n.travel && !n.expId && !n.sealed && !(n.jail > W.t));
  const tribulationRole = n => {
    if (!n || !n.cult) return 'support';
    if (n.cult.path === 'SAGE_SUPPORT' || n.post === 'healer' || ['GOLDEN_NEEDLE_SAINT', 'DIVINE_NECTAR_APOTHECARY', 'MEDICINE_BODHI_GOD', 'LOTUS_MERCY_PURIFIER'].includes(n.cult.sub)) return 'healer';
    if (n.cult.path === 'BODY' || n.cult.path === 'BEAST_SOVEREIGN') return 'guardian';
    if (n.cult.path === 'MECH_PUPPET' || n.cult.path === 'CRAFT_CREATION' || ['ASTRAL_ARRAY', 'QIMEN_TALISMAN_PATRON', 'FATE_ORACLE', 'CALLIGRAPHY_PAINTING_SAGE', 'RUNE_ARRAY_ENGRAVER'].includes(n.cult.sub) || ((n.h && n.h.skills && n.h.skills.ARRAY) || 0) >= 35 || ((n.h && n.h.skills && n.h.skills.TALISMAN) || 0) >= 40) return 'array';
    return 'support';
  };
  const chooseTribulationHelpers = (W, candidate) => {
    const available = (W.npcs || []).filter(n => n !== candidate && tribulationAvailable(W, n));
    const score = n => (g.CULT && g.CULT.power ? g.CULT.power(n) : 0) + (n.rank || 0) * 10;
    available.sort((a, b) => score(b) - score(a) || String(a.id).localeCompare(String(b.id)));
    const chosen = [];
    for (const role of ['healer', 'guardian', 'array']) {
      const match = available.find(n => !chosen.includes(n) && tribulationRole(n) === role);
      if (match) chosen.push(match);
      if (chosen.length >= TRIBULATION_HELPER_CAP) break;
    }
    for (const n of available) {
      if (chosen.length >= TRIBULATION_HELPER_CAP) break;
      if (!chosen.includes(n)) chosen.push(n);
    }
    return chosen;
  };
  const availableTribulationMedicine = W => {
    if (!W || !g.ECO || !g.ECO.count) return null;
    const prio = TRIBULATION_RECOVERY_PILLS.find(id => g.ECO.count(W, id) >= 1);
    if (prio) return prio;
    const stockKeys = Object.keys((W.sect && W.sect.stock) || {});
    for (const k of stockKeys) {
      if ((W.sect.stock[k] || 0) < 1 || !g.ECO.isPill || !g.ECO.isPill(k)) continue;
      const info = g.ECO.pillInfo && g.ECO.pillInfo(k);
      if (info && (info.tier || 1) >= 2 && info.effect && ((info.effect.healHealth || 0) >= 25 || info.effect.healInjury || info.effect.breakthroughBonus)) return k;
    }
    return null;
  };
  const tribulationChance = (W, candidate, helpers, medicineId) => {
    const base = g.CULT && g.CULT.breakthroughChance ? g.CULT.breakthroughChance(candidate, { now: W.t }) : 0.5;
    const party = [candidate].concat(helpers);
    const paths = new Set(party.filter(n => n.cult).map(n => n.cult.path));
    const roles = new Set(helpers.map(tribulationRole));
    const formation = g.COMBAT && g.COMBAT.evaluateFormationSynergy ? g.COMBAT.evaluateFormationSynergy(party) : { powerMultiplier: 1 };
    const helperBonus = Math.min(0.12, helpers.length * 0.04);
    const roleBonus = (roles.has('guardian') ? 0.04 : 0) + (roles.has('healer') ? 0.04 : 0) + (roles.has('array') ? 0.025 : 0);
    const diversityBonus = Math.min(0.08, Math.max(0, paths.size - 1) * 0.02);
    const formationBonus = Math.min(0.05, Math.max(0, ((formation && formation.powerMultiplier) || 1) - 1) * 0.25);
    return +clamp(0.36 + base * 0.30 + helperBonus + roleBonus + diversityBonus + formationBonus + (medicineId ? 0.06 : 0), 0.45, 0.90).toFixed(3);
  };
  const releaseTribulationParticipants = (W, attempt) => {
    const ids = [attempt && attempt.candidateId].concat(attempt && Array.isArray(attempt.supportIds) ? attempt.supportIds : []).filter(Boolean);
    for (const id of ids) {
      const n = W && W.byId && W.byId[id];
      if (!n || n.celestialTribulationId !== attempt.id) continue;
      n.away = false;
      n.celestialTribulationId = null;
      n.travel = null;
      n.path = null;
      n.run = false;
      if (n.act) n.act = { id: 'idle', stage: 'do', left: 0, total: 0, ctx: {}, why: [] };
    }
  };
  const pushTribulationHistory = (state, record) => {
    state.history.unshift(record);
    if (state.history.length > 50) state.history.length = 50;
  };
  SECT.CELESTIAL_TRIBULATION = {
    STONE_COST: TRIBULATION_STONE_COST,
    PREPARATION_DAYS: 3,
    RETRY_COOLDOWN_DAYS: TRIBULATION_RETRY_DAYS,
    ensure: SECT.ensureCelestialTribulation,
    helpersFor: (W, npc) => chooseTribulationHelpers(W, resolveTribulationNpc(W, npc)),
    canBegin: (W, npc) => SECT.canBeginCelestialTribulation(W, npc),
    begin: (W, npc, opts) => SECT.beginCelestialTribulation(W, npc, opts),
    tick: W => {
      const state = SECT.ensureCelestialTribulation(W);
      const attempt = state && state.active;
      if (!attempt || !Number.isFinite(attempt.resolveDay) || (W.day || 0) < attempt.resolveDay) return null;
      const candidate = W.byId && W.byId[attempt.candidateId];
      const helpers = (attempt.supportIds || []).map(id => W.byId && W.byId[id]).filter(n => n && !n.dead && n.celestialTribulationId === attempt.id);
      if (!candidate || candidate.dead || !W.npcs.includes(candidate)) {
        releaseTribulationParticipants(W, attempt);
        attempt.status = 'interrupted';
        attempt.finishedDay = W.day || 0;
        pushTribulationHistory(state, { id: attempt.id, candidateId: attempt.candidateId, candidateNameTh: attempt.candidateNameTh, path: attempt.path, day: attempt.finishedDay, status: attempt.status, ascended: false, reason: 'candidate-unavailable' });
        state.active = null;
        if (W.log) W.log('sect', 'ด่านเคราะห์สวรรค์ถูกยุติลง เพราะผู้เข้าทดสอบไม่อาจดำเนินพิธีต่อได้', [attempt.candidateId]);
        return { ok: false, reason: 'candidate-unavailable', attempt };
      }
      const result = { ok: true, ascended: false, chance: attempt.chance, attemptId: attempt.id };
      const success = (W.rng && typeof W.rng.next === 'function' ? W.rng.next() : Math.random()) < attempt.chance;
      releaseTribulationParticipants(W, attempt);
      if (success) {
        const tablet = SECT.inscribeLegacyTablet(W, candidate, 'ผ่านด่านเคราะห์สวรรค์และจุติสู่แดนบน', { force: true });
        if (tablet) { tablet.ascended = true; tablet.ascensionDay = W.day || 0; }
        state.active = null;
        W.sect.ascendedLegacyCount = Math.max(0, W.sect.ascendedLegacyCount || 0) + 1;
        const record = { id: attempt.id, candidateId: candidate.id, candidateNameTh: attempt.candidateNameTh, path: attempt.path, sub: candidate.cult.sub || 'NONE', day: W.day || 0, status: 'ascended', ascended: true, chance: attempt.chance, supportIds: (attempt.supportIds || []).slice(), medicineId: attempt.medicineId || null, tabletId: tablet && tablet.id || null };
        pushTribulationHistory(state, record);
        W.sect.ascendedLegacyHistory.unshift(record);
        if (W.sect.ascendedLegacyHistory.length > 50) W.sect.ascendedLegacyHistory.length = 50;
        if (candidate.id === W.sect.masterId) SECT.succession(W, 'เจ้าสำนักจุติสู่แดนบน');
        candidate.cult.ascended = true;
        if (g.SIM && g.SIM.retire) g.SIM.retire(W, candidate);
        if (W.log) W.log('sect', '⚡ ' + attempt.candidateNameTh + ' ฝ่าด่านเคราะห์สวรรค์และจุติสู่แดนบน ทิ้งเจตจำนงไว้ ณ ศาลบรรพชน · พรสืบทอด +' + Math.round((SECT.ascensionCultivationMultiplier(W) - 1) * 100) + '%', [candidate.id]);
        result.ascended = true;
        result.record = record;
        return result;
      }
      const hpMax = g.CULT && g.CULT.hpMax ? g.CULT.hpMax(candidate) : (candidate.h.state.hp || 100);
      candidate.h.state.hp = Math.max(1, Math.min(candidate.h.state.hp || 1, Math.round(hpMax * 0.45)));
      candidate.h.state.qi = Math.max(0, Math.round((candidate.h.state.qi || 0) * 0.5));
      candidate.h.state.stress = clamp((candidate.h.state.stress || 0) + 20, 0, 100);
      candidate.h.state.heartDemon = clamp((candidate.h.state.heartDemon || 0) + 12, 0, 100);
      candidate.inj = Array.isArray(candidate.inj) ? candidate.inj : [];
      candidate.inj.push({ part: 'เส้นลมปราณ', why: 'สะท้อนจากด่านเคราะห์สวรรค์', sev: 2, until: W.t + 3 * 1440 });
      candidate.ascensionCooldownUntilDay = (W.day || 0) + TRIBULATION_RETRY_DAYS;
      for (const helper of helpers) helper.h.state.stress = clamp((helper.h.state.stress || 0) + 5, 0, 100);
      candidate.cult.ascensionAttempts = (candidate.cult.ascensionAttempts || 0) + 1;
      const record = { id: attempt.id, candidateId: candidate.id, candidateNameTh: attempt.candidateNameTh, path: attempt.path, day: W.day || 0, status: 'failed', ascended: false, chance: attempt.chance, supportIds: (attempt.supportIds || []).slice(), medicineId: attempt.medicineId || null };
      attempt.status = 'failed'; attempt.finishedDay = W.day || 0;
      pushTribulationHistory(state, record);
      state.active = null;
      if (W.log) W.log('sect', '⚡ ' + attempt.candidateNameTh + ' ยังไม่ผ่านด่านเคราะห์สวรรค์; ได้รับบาดเจ็บที่เส้นลมปราณและต้องพักฟื้นก่อนท้าทายอีกครั้ง', [candidate.id]);
      result.record = record;
      return result;
    }
  };
  SECT.canBeginCelestialTribulation = (W, npc) => {
    const state = SECT.ensureCelestialTribulation(W), candidate = resolveTribulationNpc(W, npc);
    if (!state || !candidate || !tribulationAvailable(W, candidate)) return { ok: false, reason: 'candidate-unavailable', reasonTh: 'ผู้ฝึกตนไม่พร้อมเข้าร่วมพิธี' };
    if (state.active) return { ok: false, reason: 'tribulation-active', reasonTh: 'มีด่านเคราะห์ที่กำลังเตรียมพิธีอยู่แล้ว' };
    const max = g.CULT && g.CULT.maxStage ? g.CULT.maxStage(candidate) : 0;
    const eq = g.CULT && g.CULT.equivalentStage ? g.CULT.equivalentStage(candidate) : 0;
    if (!max || candidate.cult.stage < max || eq < 9) return { ok: false, reason: 'not-at-peak', reasonTh: 'ต้องบรรลุขั้นสูงสุดของวิถีและมีระดับเทียบเคียงขั้น 9 ก่อน' };
    if ((candidate.ascensionCooldownUntilDay || 0) > (W.day || 0)) return { ok: false, reason: 'cooldown', reasonTh: 'เส้นลมปราณยังต้องพักฟื้นอีก ' + (candidate.ascensionCooldownUntilDay - (W.day || 0)) + ' วัน' };
    const helpers = chooseTribulationHelpers(W, candidate);
    if (helpers.length < 2) return { ok: false, reason: 'insufficient-support', reasonTh: 'ต้องมีศิษย์ที่พร้อมช่วยพิธีอย่างน้อย 2 คน' };
    if ((W.sect.stones || 0) < TRIBULATION_STONE_COST) return { ok: false, reason: 'insufficient-stones', reasonTh: 'ต้องใช้ศิลาวิญญาณสำนัก ' + TRIBULATION_STONE_COST + ' ศิลา' };
    return { ok: true, candidate, helpers, medicineId: availableTribulationMedicine(W), cost: TRIBULATION_STONE_COST };
  };
  SECT.beginCelestialTribulation = (W, npc, opts) => {
    opts = opts || {};
    const check = SECT.canBeginCelestialTribulation(W, npc);
    if (!check.ok) return check;
    const candidate = check.candidate, helpers = check.helpers.slice();
    const medicineId = opts.useMedicine === false ? null : check.medicineId;
    if (!ECO.pay(W, TRIBULATION_STONE_COST, 'เตรียมค่ายกลด่านเคราะห์สวรรค์')) return { ok: false, reason: 'insufficient-stones', reasonTh: 'ศิลาวิญญาณสำนักไม่เพียงพอ' };
    if (medicineId && !ECO.take(W, medicineId, 1)) {
      ECO.earn(W, TRIBULATION_STONE_COST, 'คืนศิลาวิญญาณจากพิธีที่ไม่ได้เริ่ม');
      return { ok: false, reason: 'medicine-unavailable', reasonTh: 'โอสถฟื้นฟูที่เตรียมไว้ไม่อยู่ในคลังแล้ว' };
    }
    const state = SECT.ensureCelestialTribulation(W);
    const id = 'TRIB_' + (W.day || 0) + '_' + (++state.sequence);
    const chance = tribulationChance(W, candidate, helpers, medicineId);
    const attempt = {
      id, candidateId: candidate.id, candidateNameTh: HC.fullName(candidate), path: candidate.cult.path,
      supportIds: helpers.map(n => n.id), supportRoles: Object.fromEntries(helpers.map(n => [n.id, tribulationRole(n)])),
      medicineId, startedDay: W.day || 0, resolveDay: (W.day || 0) + 3, chance, cost: TRIBULATION_STONE_COST, status: 'preparing'
    };
    for (const n of [candidate].concat(helpers)) {
      if (g.AI && g.AI.cancelAct) g.AI.cancelAct(W, n);
      n.celestialTribulationId = id;
      n.away = true;
      n.travel = null;
      n.path = null;
      n.run = false;
      n.act = { id: 'idle', stage: 'do', left: 0, total: 0, ctx: {}, why: [] };
    }
    state.active = attempt;
    if (W.log) W.log('sect', '🏮 สำนักเริ่มเตรียมค่ายกลคุ้มภัยด่านเคราะห์สวรรค์ให้ ' + attempt.candidateNameTh + ' · กำหนดพิธีในอีก 3 วัน · โอกาสสำเร็จ ' + Math.round(chance * 100) + '%', [candidate.id].concat(attempt.supportIds));
    return { ok: true, attempt };
  };
  const sectDailyV210 = SECT.daily;
  SECT.daily = W => { const result = sectDailyV210 ? sectDailyV210(W) : undefined; WMC.tick(W); SECT.CELESTIAL_TRIBULATION.tick(W); return result; };

  g.SECT = SECT;
  if (typeof module === 'object' && module.exports) module.exports = SECT;
})(typeof globalThis !== 'undefined' ? globalThis : this);
