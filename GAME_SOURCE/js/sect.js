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
    plaza: { maxLevel: 1, category: 'landmark' },
    peak_sword: { maxLevel: 5, costBase: 750, category: 'peak' },
    peak_body: { maxLevel: 5, costBase: 750, category: 'peak' },
    peak_chaos: { maxLevel: 5, costBase: 750, category: 'peak' },
    peak_alchemy: { maxLevel: 5, costBase: 750, category: 'peak' },
    peak_magic: { maxLevel: 5, costBase: 750, category: 'peak' },
    peak_array: { maxLevel: 5, costBase: 750, category: 'peak' },
    peak_scholar: { maxLevel: 5, costBase: 750, category: 'peak' },
    peak_beast: { maxLevel: 5, costBase: 750, category: 'peak' }
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
  SECT.DIRECTORATES = Object.freeze({
    war: { id: 'war', nameTh: 'ทำเนียบยุทธการและการศึก', icon: '⚔️', cliqueId: 'HAWK_MARTIAL', descTh: 'บัญชาการทัพ ฝึกปรือยุทธ์ พิทักษ์ด่านหน้า และวางแนวป้องกันสำนัก' },
    diplomacy: { id: 'diplomacy', nameTh: 'ทำเนียบวิเทศสัมพันธ์และข่าวกรอง', icon: '🕊️', cliqueId: 'PRAGMATIC_COMMERCE', descTh: 'การทูต 19 สำนัก สืบราชการลับ ภารกิจนอกสำนัก และควบคุมคุกเชลยศึก' },
    economy: { id: 'economy', nameTh: 'ทำเนียบทรัพยากรและเศรษฐการ', icon: '🪙', cliqueId: 'PRAGMATIC_COMMERCE', descTh: 'บริหารหอคลังหลวง กองคาราวาน เสบียงโรงครัว และการค้าตลาดภายนอก' },
    craft: { id: 'craft', nameTh: 'ทำเนียบเต๋า โอสถ และช่างศาสตรา', icon: '⚗️', cliqueId: 'BENEVOLENT_SAGE', descTh: 'ปรุงโอสถเซียน หลอมศาสตราวุธ บำรุงค่ายกลฮวงจุ้ย และดูแลสวนสมุนไพรทิพย์' },
    beasts: { id: 'beasts', nameTh: 'ทำเนียบสัตว์วิญญาณและนิเวศ', icon: '🐾', cliqueId: 'HAWK_MARTIAL', descTh: 'เพาะเลี้ยงสัตว์วิญญาณ จัดทัพอสูรเฝ้าด่าน และลาดตระเวนเขตรังอสูร' },
    governance: { id: 'governance', nameTh: 'ทำเนียบจารีต กฎระเบียบ และการปกครองใน', icon: '⚖️', cliqueId: 'ORTHODOX_TRADITION', descTh: 'รักษาวินัย ตรวจสอบทุจริต ดูแลหอคัมภีร์ หอทะเบียน โรงหมอ อาคาร และศิษย์สืบทอด' }
  });
  SECT.DIRECTORATE_IDS = Object.freeze(Object.keys(SECT.DIRECTORATES));

  SECT.POST_ALIASES = Object.freeze({
    diplomacy: 'envoy',
    intelligence: 'spymaster',
    beastcare: 'beastmaster',
    formation: 'arraymaster'
  });

  SECT.resolveOfficeId = postOrAlias => {
    if (!postOrAlias) return null;
    if (SECT.POSTS && SECT.POSTS[postOrAlias]) return postOrAlias;
    if (SECT.POST_ALIASES && SECT.POST_ALIASES[postOrAlias]) return SECT.POST_ALIASES[postOrAlias];
    return postOrAlias;
  };

  SECT.POSTS = {
    martial: { id: 'martial', nameTh: 'ผู้อาวุโสหอยุทธ์', category: 'war', categoryNameTh: 'ทำเนียบยุทธการและการศึก', hall: 'training_ground', minRank: 4, stipendBonus: 25, authority: 75, cliqueId: 'HAWK_MARTIAL', skillsRequired: ['combat', 'teaching'], desc: 'ฝึกศิษย์ จัดประลอง กำหนดหลักสูตรยุทธ์', descTh: 'ฝึกศิษย์ จัดประลอง กำหนดหลักสูตรยุทธ์และชี้แนะเคล็ดวิชา' },
    alchemy: { id: 'alchemy', nameTh: 'ผู้อาวุโสหอโอสถ', category: 'craft', categoryNameTh: 'ทำเนียบเต๋า โอสถ และช่างศาสตรา', hall: 'alchemy', minRank: 4, stipendBonus: 30, authority: 75, cliqueId: 'BENEVOLENT_SAGE', skillsRequired: ['ALCHEMY'], desc: 'กำหนดการปรุงโอสถ ดูแลคุณภาพและสต็อกยา', descTh: 'กำหนดการปรุงโอสถ วิจัยตำรับยาผสานธาตุ ดูแลคุณภาพและสต็อกยา' },
    forge: { id: 'forge', nameTh: 'ผู้อาวุโสโรงหลอม', category: 'craft', categoryNameTh: 'ทำเนียบเต๋า โอสถ และช่างศาสตรา', hall: 'forge', minRank: 4, stipendBonus: 30, authority: 75, cliqueId: 'PRAGMATIC_COMMERCE', skillsRequired: ['FORGING'], desc: 'ดูแลหลอมอาวุธ เกราะ ยันต์ ค่ายกล', descTh: 'ดูแลหลอมอาวุธ เกราะ ซ่อมแซมศาสตรา และปลุกจิตวิญญาณศาสตรา (Soul Forge)' },
    scripture: { id: 'scripture', nameTh: 'ผู้อาวุโสหอคัมภีร์', category: 'governance', categoryNameTh: 'ทำเนียบจารีต กฎระเบียบ และการปกครองใน', hall: 'scripture', minRank: 4, stipendBonus: 25, authority: 75, cliqueId: 'ORTHODOX_TRADITION', skillsRequired: ['SCRIPTURE', 'comprehension'], desc: 'คุมตำราวิชา วิจัยตำรับใหม่ ควบคุมการเข้าถึงวิชา', descTh: 'คุมตำราวิชา วิจัยตำรับใหม่ ขัดเกลาคัมภีร์มรดก และควบคุมการเข้าถึงวิชา' },
    discipline: { id: 'discipline', nameTh: 'ผู้คุมกฎสำนัก', category: 'governance', categoryNameTh: 'ทำเนียบจารีต กฎระเบียบ และการปกครองใน', hall: 'discipline', minRank: 4, stipendBonus: 35, authority: 85, cliqueId: 'ORTHODOX_TRADITION', skillsRequired: ['integrity', 'judgement'], desc: 'บังคับใช้กฎ ลงโทษ สืบสวนทุจริต', descTh: 'บังคับใช้กฎ ลงโทษผู้กระทำผิด สืบสวนทุจริต และชำระข้อร้องเรียนศิษย์' },
    treasury: { id: 'treasury', nameTh: 'ผู้อาวุโสหอคลัง', category: 'economy', categoryNameTh: 'ทำเนียบทรัพยากรและเศรษฐการ', hall: 'treasury', minRank: 4, stipendBonus: 35, authority: 85, cliqueId: 'PRAGMATIC_COMMERCE', skillsRequired: ['administration', 'numeracy'], desc: 'คุมศิลาวิญญาณ จัดสรรเบี้ยหวัด สั่งซื้อวัตถุดิบ', descTh: 'คุมศิลาวิญญาณ จัดสรรเบี้ยหวัด สวัสดิการโอสถ และงบประมาณสำนัก' },
    mission: { id: 'mission', nameTh: 'ผู้อาวุโสฝ่ายกิจการนอกสำนัก', category: 'diplomacy', categoryNameTh: 'ทำเนียบวิเทศสัมพันธ์และข่าวกรอง', hall: 'mission_hall', minRank: 3, stipendBonus: 22, authority: 68, cliqueId: 'HAWK_MARTIAL', skillsRequired: ['planning', 'survival'], desc: 'จัดคณะเดินทางนอกสำนัก ค้าขาย ล่าอสูร หาศิษย์ใหม่', descTh: 'จัดคณะเดินทางนอกสำนัก ค้าขาย ล่าอสูร และประสานเส้นทางสำรวจ' },
    guard: { id: 'guard', nameTh: 'หัวหน้าองครักษ์', category: 'war', categoryNameTh: 'ทำเนียบยุทธการและการศึก', hall: 'gate', minRank: 3, stipendBonus: 18, authority: 60, cliqueId: 'HAWK_MARTIAL', skillsRequired: ['combat', 'perceptiveness'], desc: 'เฝ้าประตู สำนัก ตรวจตรา ป้องกันศัตรู', descTh: 'เฝ้าประตูสำนัก จัดเวรยามตรวจตรา และป้องกันศัตรูบุกรุก' },
    registry: { id: 'registry', nameTh: 'ผู้อาวุโสหอทะเบียน', category: 'governance', categoryNameTh: 'ทำเนียบจารีต กฎระเบียบ และการปกครองใน', hall: 'main_hall', minRank: 4, stipendBonus: 20, authority: 65, cliqueId: 'ORTHODOX_TRADITION', skillsRequired: ['readPeople', 'administration'], desc: 'พิจารณาผู้สมัครเข้าสำนัก จัดทำทะเบียนศิษย์ แทนเจ้าสำนัก', descTh: 'พิจารณาผู้สมัครเข้าสำนักด้วยสายตาประเมิน CA และจัดทำทะเบียนศิษย์แทนเจ้าสำนัก' },
    healer: { id: 'healer', nameTh: 'หมอหลวงสำนัก', category: 'governance', categoryNameTh: 'ทำเนียบจารีต กฎระเบียบ และการปกครองใน', hall: 'infirmary', minRank: 3, stipendBonus: 20, authority: 65, cliqueId: 'BENEVOLENT_SAGE', skillsRequired: ['MEDICINE', 'empathy'], desc: 'รักษาผู้บาดเจ็บ ดูแลสุขภาพทั้งสำนัก', descTh: 'รักษาผู้บาดเจ็บ ดูแลสุขภาพทั้งสำนัก ชำระพิษโอสถและคลายปมมารในใจ' },
    disciples: { id: 'disciples', nameTh: 'ศิษย์สืบทอด', category: 'governance', categoryNameTh: 'ทำเนียบจารีต กฎระเบียบ และการปกครองใน', hall: 'main_hall', minRank: 3, stipendBonus: 25, authority: 80, cliqueId: 'ORTHODOX_TRADITION', skillsRequired: ['combat', 'leadership'], desc: 'ศิษย์เอกผู้สืบทอดตำแหน่งเจ้าสำนัก ได้รับการเสนอชื่อและโหวตเลือกจากเจ้าสำนักและเหล่าผู้อาวุโส', descTh: 'ศิษย์เอกผู้สืบทอดตำแหน่งเจ้าสำนัก ผ่านการเลือกตั้งและโหวตรับรองจากสภา' }
  };
  SECT.PLANNED_POSTS = {
    diplomacy: { id: 'diplomacy', nameTh: 'ฝ่ายการทูต', linkedPost: 'envoy', unlocked: true, requires: 'ระบบภารกิจและข้อตกลงทางการทูตที่มอบหมายเฉพาะฝ่าย' },
    intelligence: { id: 'intelligence', nameTh: 'ฝ่ายข่าวกรอง', linkedPost: 'spymaster', unlocked: true, requires: 'ระบบข่าวและการยืนยันแหล่งข่าว' },
    beastcare: { id: 'beastcare', nameTh: 'ฝ่ายสัตว์วิญญาณ', linkedPost: 'beastmaster', unlocked: true, requires: 'ระบบจับ เลี้ยง และดูแลสัตว์' },
    formation: { id: 'formation', nameTh: 'ฝ่ายค่ายกลป้องกัน', linkedPost: 'arraymaster', unlocked: true, requires: 'ระบบค่ายกลประจำพื้นที่และการบำรุงรักษา' }
  };
  Object.assign(SECT.POSTS, {
    commander: { id: 'commander', nameTh: 'แม่ทัพสำนัก', category: 'war', categoryNameTh: 'ทำเนียบยุทธการและการศึก', hall: 'training_ground', minRank: 4, stipendBonus: 35, authority: 85, cliqueId: 'HAWK_MARTIAL', skillsRequired: ['combat', 'leadership'], desc: 'ประเมินศัตรู ระดมกำลัง และนำการป้องกันสำนัก', descTh: 'ประเมินศัตรู ระดมกำลังพล และนำทัพป้องกันสำนักยามเกิดศึก' },
    provision: { id: 'provision', nameTh: 'ผู้อาวุโสฝ่ายเสบียง', category: 'economy', categoryNameTh: 'ทำเนียบทรัพยากรและเศรษฐการ', hall: 'main_hall', minRank: 3, stipendBonus: 15, authority: 55, cliqueId: 'BENEVOLENT_SAGE', skillsRequired: ['cooking', 'farming'], desc: 'ตรวจอาหารสำรอง วางแผนเพาะปลูกและประกอบอาหาร', descTh: 'ตรวจอาหารสำรอง วางแผนเพาะปลูกและปรุงอาหารปราณแจกจ่าย' },
    herbal: { id: 'herbal', nameTh: 'ผู้อาวุโสฝ่ายสมุนไพร', category: 'craft', categoryNameTh: 'ทำเนียบเต๋า โอสถ และช่างศาสตรา', hall: 'main_hall', minRank: 2, stipendBonus: 15, authority: 50, cliqueId: 'BENEVOLENT_SAGE', skillsRequired: ['herbalism'], desc: 'ประเมินสมุนไพรที่ขาดและประสานการปลูกหรือเก็บ', descTh: 'ประเมินสมุนไพรที่ขาด ประสานการเพาะปลูกและเก็บเกี่ยวสมุนไพรวิญญาณ' },
    wildwarden: { id: 'wildwarden', nameTh: 'ผู้อาวุโสฝ่ายลาดตระเวนอสูร', category: 'beasts', categoryNameTh: 'ทำเนียบสัตว์วิญญาณและนิเวศ', hall: 'gate', minRank: 3, stipendBonus: 18, authority: 60, cliqueId: 'HAWK_MARTIAL', skillsRequired: ['survival', 'combat'], desc: 'ตรวจพื้นที่อสูร แจ้งความเสี่ยงและความพร้อมของผู้ล่า', descTh: 'ตรวจพื้นที่อสูรนอกสำนัก ลาดตระเวนรังอสูร และแจ้งเตือนภัย' },
    steward: { id: 'steward', nameTh: 'ผู้อาวุโสฝ่ายอาคารสถานที่', category: 'governance', categoryNameTh: 'ทำเนียบจารีต กฎระเบียบ และการปกครองใน', hall: 'main_hall', minRank: 3, stipendBonus: 18, authority: 60, cliqueId: 'PRAGMATIC_COMMERCE', skillsRequired: ['construction', 'planning'], desc: 'ตรวจสถานีแออัดและเสนอขยายโดยเจ้าสำนักอนุมัติ', descTh: 'ตรวจสถานีแออัด เสนอการบูรณะและขยายสิ่งปลูกสร้างในสำนัก' },
    envoy: { id: 'envoy', nameTh: 'ทูตยุทธภพและกิจการบริวาร', category: 'diplomacy', categoryNameTh: 'ทำเนียบวิเทศสัมพันธ์และข่าวกรอง', hall: 'main_hall', minRank: 4, stipendBonus: 30, authority: 80, cliqueId: 'PRAGMATIC_COMMERCE', bureauId: 'diplomacy', skillsRequired: ['diplomacy', 'charisma'], desc: 'เจรจาสนธิสัญญา กำหนดนโยบายบรรณาการสำนักบริวาร และประสานสมาพันธ์ยุทธภพ', descTh: 'เจรจาสนธิสัญญา 19 สำนัก กำหนดนโยบายบรรณาการสำนักบริวาร และประสานสมาพันธ์ยุทธภพ' },
    spymaster: { id: 'spymaster', nameTh: 'เจ้าหอข่าวกรองและเบาะแส', category: 'diplomacy', categoryNameTh: 'ทำเนียบวิเทศสัมพันธ์และข่าวกรอง', hall: 'mission_hall', minRank: 4, stipendBonus: 28, authority: 70, cliqueId: 'HAWK_MARTIAL', bureauId: 'intelligence', skillsRequired: ['stealth', 'perceptiveness'], desc: 'สืบข่าวลือโรงเตี๊ยม ตรวจจับวาสนาฟ้าดิน และสอดส่องคลื่นใต้น้ำในสำนัก', descTh: 'สืบข่าวลือโรงเตี๊ยม ตรวจจับวาสนาฟ้าดิน และสอดส่องคลื่นใต้น้ำในสำนัก' },
    beastmaster: { id: 'beastmaster', nameTh: 'เจ้าอุทยานอสูรและพาหนะ', category: 'beasts', categoryNameTh: 'ทำเนียบสัตว์วิญญาณและนิเวศ', hall: 'gate', minRank: 4, stipendBonus: 25, authority: 70, cliqueId: 'HAWK_MARTIAL', bureauId: 'beastcare', skillsRequired: ['BEAST_TAMING'], desc: 'ดูแลโรงเพาะเลี้ยงสัตว์วิญญาณ ฟื้นฟูพาหนะ และจัดทัพอสูรพิทักษ์ด่าน', descTh: 'ดูแลโรงเพาะเลี้ยงสัตว์วิญญาณ ให้อาหาร ฟื้นฟูพาหนะ และจัดทัพอสูรพิทักษ์ด่าน' },
    arraymaster: { id: 'arraymaster', nameTh: 'ปรมาจารย์ค่ายกลและปราการ', category: 'craft', categoryNameTh: 'ทำเนียบเต๋า โอสถ และช่างศาสตรา', hall: 'forge', minRank: 4, stipendBonus: 28, authority: 75, cliqueId: 'ORTHODOX_TRADITION', bureauId: 'formation', skillsRequired: ['ARRAY', 'TALISMAN'], desc: 'บำรุงรักษาค่ายกลพิทักษ์สำนัก เสริมปราการจุดยุทธศาสตร์ และคุมม่านพลังป้องกัน', descTh: 'บำรุงรักษาค่ายกลพิทักษ์สำนัก ปรับจูนชีพจรฮวงจุ้ยอาคาร และคุมม่านพลังป้องกัน' },
    censor: { id: 'censor', nameTh: 'ผู้ตรวจการสภาและคลื่นใต้น้ำ', category: 'governance', categoryNameTh: 'ทำเนียบจารีต กฎระเบียบ และการปกครองใน', hall: 'discipline', minRank: 4, stipendBonus: 30, authority: 80, cliqueId: 'ORTHODOX_TRADITION', skillsRequired: ['integrity', 'readPeople'], desc: 'ถ่วงดุลก๊กการเมืองภายในสำนัก ตรวจสอบการใช้อำนาจ และระงับคลื่นใต้น้ำ', descTh: 'ถ่วงดุลก๊กการเมืองภายในสำนัก ตรวจสอบการใช้อำนาจขุนนาง และระงับคลื่นใต้น้ำ' },
    quartermaster: { id: 'quartermaster', nameTh: 'แม่ทัพยุทธปัจจัยและคาราวาน', category: 'economy', categoryNameTh: 'ทำเนียบทรัพยากรและเศรษฐการ', hall: 'treasury', minRank: 4, stipendBonus: 25, authority: 70, cliqueId: 'PRAGMATIC_COMMERCE', skillsRequired: ['trading', 'administration'], desc: 'จัดสรรเสบียงทัพ ควบคุมเส้นทางคาราวานการค้าเสรี และดูแลคลังยุทธปัจจัย', descTh: 'จัดสรรเสบียงทัพ ควบคุมเส้นทางคาราวานการค้าเสรี และดูแลคลังยุทธปัจจัย' },
    vanguard: { id: 'vanguard', nameTh: 'ผู้อาวุโสกองหน้าพิทักษ์ด่าน', category: 'war', categoryNameTh: 'ทำเนียบยุทธการและการศึก', hall: 'gate', minRank: 3, stipendBonus: 20, authority: 65, cliqueId: 'HAWK_MARTIAL', skillsRequired: ['combat', 'toughness'], desc: 'สกัดกั้นแนวหน้า บัญชาการ Zone of Control และเข้าคุ้มกันศิษย์แถวหลัง', descTh: 'สกัดกั้นแนวหน้า บัญชาการ Zone of Control และเข้าคุ้มกันศิษย์แถวหลัง' },
    warden: { id: 'warden', nameTh: 'ผู้คุมทัณฑ์และเชลยศึก', category: 'diplomacy', categoryNameTh: 'ทำเนียบวิเทศสัมพันธ์และข่าวกรอง', hall: 'discipline', minRank: 3, stipendBonus: 18, authority: 65, cliqueId: 'ORTHODOX_TRADITION', skillsRequired: ['intimidation', 'judgement'], desc: 'ควบคุมคุกใต้ดิน เรียกค่าไถ่เชลยศึก เค้นคัมภีร์ยุทธ์ และกล่อมแปรพักตร์', descTh: 'ควบคุมคุกใต้ดิน เรียกค่าไถ่เชลยศึก เค้นคัมภีร์ยุทธ์ และกล่อมเชลยแปรพักตร์' },
    marketmaster: { id: 'marketmaster', nameTh: 'นายวาณิชย์ตลาดภายนอก', category: 'economy', categoryNameTh: 'ทำเนียบทรัพยากรและเศรษฐการ', hall: 'mission_hall', minRank: 2, stipendBonus: 15, authority: 50, cliqueId: 'PRAGMATIC_COMMERCE', skillsRequired: ['trading'], desc: 'ดูแลการค้าตลาดภายนอก แลกเปลี่ยนวัตถุดิบและตั้งราคาที่เป็นธรรม', descTh: 'ดูแลการค้าตลาดภายนอก แลกเปลี่ยนวัตถุดิบ ระบายอุปกรณ์ล้นคลัง และเจรจาพ่อค้าเร่' }
  });
  Object.keys(SECT.POSTS).forEach(pid => {
    const p = SECT.POSTS[pid];
    p.suitability = (npc, W) => SECT.relevance(pid, npc, W);
  });
  SECT.POST_CATALOG = SECT.POSTS;
  SECT.SPECIALIZED_V219_POSTS = ['envoy', 'spymaster', 'beastmaster', 'arraymaster', 'censor', 'quartermaster', 'vanguard', 'warden', 'marketmaster'];
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
    if (SECT.PLANNED_POSTS && SECT.PLANNED_POSTS[id] && !SECT.POSTS[id]) {
      const linked = SECT.PLANNED_POSTS[id].linkedPost;
      if (W && W.sect && (W.sect.unlockSpecializedOffices || (linked && W.sect.posts && W.sect.posts[linked]))) {
        return { enabled: true, reason: '', linkedPost: linked };
      }
      return { enabled: false, reason: SECT.PLANNED_POSTS[id].requires || 'ยังไม่มีระบบรองรับตำแหน่งนี้', linkedPost: linked };
    }
    if (!SECT.POSTS[id]) return { enabled: false, reason: SECT.PLANNED_POSTS[id]?.requires || 'ยังไม่มีระบบรองรับตำแหน่งนี้' };
    if (id === 'disciples') {
      const pop = W.npcs.filter(n => !n.dead && !n.exiled).length;
      return { enabled: pop >= 2, reason: pop < 2 ? 'รอสมาชิกอย่างน้อย 2 คน' : '' };
    }
    if (W && W.sect && (W.sect.unlockSpecializedOffices || (W.sect.posts && W.sect.posts[id]) || (W.sect.tierLevel || 1) >= 2)) {
      return { enabled: true, reason: '' };
    }
    const isV219Post = SECT.SPECIALIZED_V219_POSTS && SECT.SPECIALIZED_V219_POSTS.includes(id);
    const min = id === 'commander' ? 12 : ['provision', 'herbal', 'wildwarden', 'steward'].includes(id) ? 16 : isV219Post ? 18 : 0;
    const pop = W.npcs.filter(n => !n.dead && !n.exiled).length;
    return { enabled: pop >= min, reason: pop < min ? 'รอสมาชิกอย่างน้อย ' + min + ' คน (หรือกดปลดล็อกทำเนียบตำแหน่งเฉพาะทาง)' : '' };
  };

  SECT.unlockAllOffices = (W, opts) => {
    opts = opts || {};
    if (!W || !W.sect) return { ok: false, reason: 'invalid-world' };
    W.sect.unlockSpecializedOffices = true;
    SECT.POST_IDS.forEach(p => {
      if (W.sect.posts[p] === undefined) W.sect.posts[p] = null;
    });
    if (!opts.quiet && W.log) {
      W.log('decision', '🔓 เจ้าสำนักประกาศเปิดทำเนียบขุนนางและตำแหน่งบริหารครบทั้ง 6 ทำเนียบฝ่าย (' + SECT.POST_IDS.length + ' ตำแหน่ง) อย่างเป็นทางการ!', W.sect.masterId ? [W.sect.masterId] : []);
    }
    return { ok: true, unlockedCount: SECT.POST_IDS.length, directorateCount: SECT.DIRECTORATE_IDS.length };
  };

  SECT.rankOf = npc => SECT.RANKS[npc.rank];
  SECT.title = npc => {
    if (!npc) return 'ศิษย์';
    if (npc.rank === 6) return 'เจ้าสำนัก';
    if (npc.rank === 5) return 'รองเจ้าสำนัก';
    if (npc.peakRole === 'MASTER' && npc.peakNameTh) {
      return 'เจ้า' + npc.peakNameTh + (npc.post && SECT.POSTS[npc.post] ? (' · ' + SECT.POSTS[npc.post].nameTh) : ' (ศักดิ์เทียบเท่ารองเจ้าสำนัก)');
    }
    if (npc.post && SECT.POSTS[npc.post]) {
      return SECT.POSTS[npc.post].nameTh + (npc.peakRole === 'DEPUTY' && npc.peakNameTh ? (' · รองเจ้า' + npc.peakNameTh) : '');
    }
    if (npc.peakRole === 'DEPUTY' && npc.peakNameTh) {
      return 'รองเจ้า' + npc.peakNameTh + (npc.rank >= 4 ? ' (ผู้อาวุโส)' : '');
    }
    if (npc.assist && SECT.POSTS[npc.assist]) {
      return 'ผู้ช่วย' + SECT.POSTS[npc.assist].nameTh.replace(/^ผู้อาวุโส|^หัวหน้า|^หมอหลวง/, '');
    }
    if (npc.rank >= 4 || npc.isElder) {
      return npc.elderTitleTh || 'ผู้อาวุโสสำนัก (ไร้ตำแหน่งบริหาร)';
    }
    return (SECT.RANKS[npc.rank] && SECT.RANKS[npc.rank].nameTh) || 'ศิษย์สำนัก';
  };

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
      case 'envoy': return (sk.diplomacy || 0) * .35 + e('social.charisma') * .25 + e('social.persuasion') * .20 + e('intellect.judgement') * .20 + stage * 3;
      case 'spymaster': return (sk.stealth || 0) * .25 + e('intellect.perceptiveness') * .30 + e('intellect.readPeople') * .25 + e('interests.intrigue') * .20 + stage * 3;
      case 'beastmaster': return (sk.BEAST_TAMING || 0) * .40 + e('interests.beasts') * .25 + e('personality.empathy') * .20 + (sk.survival || 0) * .15 + stage * 3;
      case 'arraymaster': return (sk.ARRAY || 0) * .40 + (sk.TALISMAN || 0) * .20 + e('intellect.spatial') * .20 + e('intellect.planning') * .20 + stage * 3;
      case 'censor': return e('personality.integrity') * .30 + e('intellect.readPeople') * .25 + e('intellect.judgement') * .25 + e('social.intimidation') * .20 + stage * 3;
      case 'quartermaster': return (sk.trading || 0) * .30 + (sk.administration || 0) * .30 + e('intellect.planning') * .25 + e('intellect.numeracy') * .15 + stage * 3;
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
      case 'vanguard': return martial * .35 + e('physiology.toughness') * .25 + e('personality.courage') * .25 + e('social.leadership') * .15 + stage * 5;
      case 'warden': return e('social.intimidation') * .30 + e('intellect.judgement') * .25 + e('intellect.readPeople') * .20 + e('personality.discipline') * .15 + martial * .10 + stage * 3;
      case 'marketmaster': return (sk.trading || 0) * .40 + e('aptitudes.socialCommerce') * .25 + e('intellect.numeracy') * .20 + e('social.persuasion') * .15 + stage * 2;
      case 'diplomacy': return SECT.relevance('envoy', n);
      case 'intelligence': return SECT.relevance('spymaster', n);
      case 'beastcare': return SECT.relevance('beastmaster', n);
      case 'formation': return SECT.relevance('arraymaster', n);
      case 'disciples': {
        const cultPower = (g.CULT && g.CULT.power) ? g.CULT.power(n) : 0;
        const eqStage = (g.CULT && g.CULT.equivalentStage) ? g.CULT.equivalentStage(n) : (n.cult ? n.cult.stage : 0);
        return eqStage * 7 + (cultPower / 50) + e('personality.loyalty') * 0.25 + e('personality.integrity') * 0.20 + e('social.leadership') * 0.22 + e('values.sectDuty') * 0.20 + (n.merit || 0) * 0.05 - Math.max(0, (n.h.state.heartDemon || 0) - 20) * 0.25;
      }
    }
    return 0;
  };
  SECT.suitability = (post, n, W) => {
    const pId = SECT.resolveOfficeId(post);
    if (!n || !n.h || !SECT.POSTS[pId]) return 0;
    return Math.round(SECT.relevance(pId, n) * 10) / 10;
  };
  SECT.holder = (W, post) => {
    if (!W || !W.sect || !W.sect.posts) return null;
    const resolved = SECT.resolveOfficeId(post);
    const id = W.sect.posts[post] || (resolved ? W.sect.posts[resolved] : null);
    return id ? W.byId[id] : null;
  };
  SECT.alive = n => n && !n.dead;
  SECT.isNpcDetained = (W, n) => Boolean(n && (
    (n.jail && n.jail > ((W && W.t) || 0)) ||
    (n.punished && n.punished > ((W && W.t) || 0)) ||
    (n.detainedUntilDay && n.detainedUntilDay > ((W && W.day) || 0))
  ));
  SECT.isOfficerAvailable = (W, n) => Boolean(n && !n.dead && !n.exiled && !n.away && !n.sealed && !n.sealedBt && !SECT.isNpcDetained(W, n));

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
  SECT.relationScore = (a, b, c) => {
    if (c !== undefined && a && a.sect) { if (SECT.PEAKS) SECT.PEAKS._activeWorld = a; a = b; b = c; }
    if (!a || !b || !a.h || !a.h.mind || !a.h.mind.relations) return 0;
    const r = a.h.mind.relations[b.id];
    let base = r ? (r.a * 0.6 + (r.t ?? 40) * 0.2 + (r.r ?? 30) * 0.2 + (r.g || 0) * 0.18 - (r.v || 0) * 0.12) : 0;
    // Deep Life-and-Death / Life-Savior bond overrides peak rivalry
    const hasLifeBond = r && (r.bond === 'LIFE_SAVIOR' || r.bond === 'SWORN_COMRADE' || r.bond === 'TAOIST_COMPANION' || r.bond === 'พี่น้องร่วมสาบาน' || (r.lifeAndDeathCount || 0) > 0);
    if (hasLifeBond) {
      base += 18 + Math.min(16, (r.lifeAndDeathCount || 1) * 6);
    }
    if (a.peakId && b.peakId) {
      if (a.peakId === b.peakId) {
        // Same-Peak fellowship bonus (unless bitter personal enemies)
        if (!r || (r.a || 0) > -25) base += 12;
      } else if (!hasLifeBond && SECT.PEAKS && SECT.PEAKS._activeWorld && SECT.PEAKS.getInterPeakScore) {
        // Inter-Peak Amity or Rivalry modifier when no life-and-death personal bond overrides it
        const ipScore = SECT.PEAKS.getInterPeakScore(SECT.PEAKS._activeWorld, a.peakId, b.peakId);
        if (ipScore < 0) base += Math.max(-28, ipScore * 0.85);
        else if (ipScore > 0) base += Math.min(14, ipScore * 0.35);
      }
    }
    return base;
  };
  SECT.eligible = (W, post, n, opts) => {
    if (SECT.PLANNED_POSTS && SECT.PLANNED_POSTS[post] && !SECT.POSTS[post]) {
      if (!(W && W.sect && W.sect.unlockSpecializedOffices) && !(opts && opts.allowLocked)) return false;
      post = SECT.PLANNED_POSTS[post].linkedPost;
    }
    post = SECT.resolveOfficeId(post) || post;
    if (!SECT.POSTS[post]) return false;
    if (!SECT.officeState(W, post).enabled && !(opts && opts.allowLocked) && !(SECT.SPECIALIZED_V219_POSTS && SECT.SPECIALIZED_V219_POSTS.includes(post) && W && W.npcs && W.npcs.length >= 3)) return false;
    if (!n || n.dead || n.away || n.sealed || n.sealedBt || SECT.isNpcDetained(W, n) || n.exiled || (Array.isArray(W.npcs) && !W.npcs.includes(n))) return false;
    if (n.id === W.sect.masterId || n.id === W.sect.deputyId) return false;
    if (post === 'disciples') {
      return n.rank >= 1 && n.rank <= 4 && (n.cult ? n.cult.stage >= 1 : n.rank >= 2);
    }
    const small = W.npcs.length < 14;
    return n.rank >= (small ? 1 : 2) && !n.post && (n.cult ? CULT.equivalentStage(n) >= (small ? 1 : 2) : n.rank >= 3);
  };
  SECT.appoint = (W, post, n, why) => {
    if (typeof n === 'string' && W && W.byId) n = W.byId[n];
    const forceAppoint = Boolean(why && typeof why === 'object' && why.force);
    if (why && typeof why === 'object') why = why.reason || why.why || '';
    if (SECT.PLANNED_POSTS && SECT.PLANNED_POSTS[post] && !SECT.POSTS[post]) {
      if (!(W && W.sect && W.sect.unlockSpecializedOffices)) return false;
      post = SECT.PLANNED_POSTS[post].linkedPost;
    }
    post = SECT.resolveOfficeId(post) || post;
    if (!SECT.POSTS[post] || !n) return false;
    if (!forceAppoint) {
      if (n.dead || n.exiled || n.away || n.sealed || n.sealedBt || SECT.isNpcDetained(W, n) || (Array.isArray(W.npcs) && !W.npcs.includes(n))) return false;
    }
    if (!SECT.officeState(W, post).enabled && !(SECT.SPECIALIZED_V219_POSTS && SECT.SPECIALIZED_V219_POSTS.includes(post))) return false;
    const old = SECT.holder(W, post); if (old && old.id === n.id) return true;
    if (old) {
      old.post = null;
      if (post === 'disciples' && W.sect.successorId === old.id) W.sect.successorId = null;
      const keepElder = old.isElder || old.peakRole === 'MASTER' || (old.cult && (CULT.equivalentStage ? CULT.equivalentStage(old) : old.cult.stage) >= 4) || (old.merit || 0) >= 180;
      if (old.rank === 4 && post !== 'disciples' && !keepElder) old.rank = 3;
    }
    if (n.post && n.post !== post) {
      const prevPostId = SECT.resolveOfficeId(n.post) || n.post;
      if (W.sect.posts[n.post] === n.id) W.sect.posts[n.post] = null;
      if (W.sect.posts[prevPostId] === n.id) W.sect.posts[prevPostId] = null;
      if ((n.post === 'disciples' || prevPostId === 'disciples') && W.sect.successorId === n.id) {
        W.sect.successorId = null;
      }
    }
    n.post = post; n.assist = null;
    const pSpec = SECT.POSTS[post];
    const reqRank = pSpec.minRank || (post === 'disciples' ? 3 : 4);
    if (post === 'disciples') {
      if (n.rank < 3) n.rank = 3;
      W.sect.successorId = n.id;
    } else {
      if (n.rank < Math.max(4, reqRank)) n.rank = Math.max(4, reqRank);
      n.isElder = true;
    }
    W.sect.posts[post] = n.id; n.sat = Math.min(100, (n.sat || 60) + 12);
    HC.experience(n, 'promoted', 1);
    SECT.reassignBed(W, n);
    if (g.COG && g.COG.syncOfficeAuthority) g.COG.syncOfficeAuthority(W);
    if (g.SIM && g.SIM.snapshotPerson) g.SIM.snapshotPerson(W, n);
    W.log('appoint', n.h.name.given + ' ได้รับตำแหน่ง' + pSpec.nameTh + (why ? ' — ' + why : ''), [n.id]);
    SECT.resentOthers(W, post, n);
    if (g.EXPED && g.EXPED.recordChronicle && !W._founding) {
      const master = W.byId && W.byId[W.sect.masterId];
      g.EXPED.recordChronicle(W, {
        category: 'INTERNAL',
        reportFormat: 'SYSTEM_LEDGER',
        icon: '🏛️',
        involvedSects: [W.sect.name],
        involvedFigures: [master ? HC.fullName(master) : 'เจ้าสำนัก', HC.fullName(n)],
        npcIds: [master && master.id, n.id].filter(Boolean),
        titleTh: 'ตราตั้งตำแหน่งบริหาร: 「' + HC.fullName(n) + '」ขึ้นดำรงตำแหน่ง「' + pSpec.nameTh + '」',
        storyTh: (master ? HC.fullName(master) : 'เจ้าสำนัก') + ' มอบตราตั้งให้「' + HC.fullName(n) + '」ดำรงตำแหน่ง「' + pSpec.nameTh + '」(' + (pSpec.categoryNameTh || 'ทำเนียบสำนัก') + ' · บารมี ' + (pSpec.authority || 65) + ' · เบี้ยหวัดเสริม +' + (pSpec.stipendBonus || 20) + ' ศิลา/เดือน)' + (why ? ' ด้วยเหตุผล: ' + why : ''),
        originCauseTh: why || 'การคัดเลือกผู้มีความเหมาะสมตามนโยบายสำนัก (ความเหมาะสม ' + SECT.suitability(post, n, W) + ')',
        actorChainTh: (master ? HC.fullName(master) : 'เจ้าสำนัก') + ' ➔ แต่งตั้ง ' + HC.fullName(n) + ' (' + pSpec.nameTh + ')',
        systemImpactTh: 'เชื่อมโยง W.sect.posts.' + post + ' ➔ อำนาจสภา (' + (pSpec.authority || 65) + ') ➔ เบี้ยหวัด +' + (pSpec.stipendBonus || 20) + ' ศิลา ➔ ประจำการ ณ ' + (pSpec.hall || 'main_hall'),
        directorInsightTh: 'การวางคนให้ตรงกับทำเนียบงานช่วยขับเคลื่อนการตัดสินใจอัตโนมัติของสำนักและปรับดุลอำนาจของ 4 ก๊กการเมือง',
        consequenceTh: HC.fullName(n) + ' รับตำแหน่ง' + pSpec.nameTh,
        quiet: true
      });
    }
    return true;
  };
  SECT.dismiss = (W, post, why) => {
    const rawPost = post;
    if (SECT.PLANNED_POSTS && SECT.PLANNED_POSTS[post] && !SECT.POSTS[post]) {
      post = SECT.PLANNED_POSTS[post].linkedPost;
    }
    post = SECT.resolveOfficeId(post) || post;
    if (!SECT.POSTS[post]) return false;
    const n = SECT.holder(W, post); if (!n) return false;
    n.post = null;
    if (post === 'disciples') {
      if (W.sect.successorId === n.id) W.sect.successorId = null;
    } else {
      const keepElder = n.isElder || n.peakRole === 'MASTER' || (n.cult && (CULT.equivalentStage ? CULT.equivalentStage(n) : n.cult.stage) >= 4) || (n.merit || 0) >= 180;
      if (n.rank === 4 && !keepElder) n.rank = 3;
    }
    if (W.sect && W.sect.posts) {
      W.sect.posts[post] = null;
      if (rawPost && W.sect.posts[rawPost] === n.id) W.sect.posts[rawPost] = null;
    }
    if (W.sect && W.sect.delegations) {
      delete W.sect.delegations[post];
      if (rawPost) delete W.sect.delegations[rawPost];
    }
    if (post === 'treasury' && W.sect && W.sect.welfareAuthority && W.sect.welfareAuthority.id === n.id) {
      W.sect.welfareAuthority = { id: null, acting: false, score: 0, updatedAt: W.t || 0 };
    }
    n.sat = Math.max(0, (n.sat || 60) - 18); HC.experience(n, 'punished_fair', 0.6);
    if (g.COG && g.COG.syncOfficeAuthority) g.COG.syncOfficeAuthority(W);
    W.log('dismiss', n.h.name.given + ' พ้นจากตำแหน่ง' + SECT.POSTS[post].nameTh + (why ? ' — ' + why : ''), [n.id]);
    return true;
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
      if (n.peakRole === 'MASTER') {
        voters.push({
          npc: n,
          weight: 2.5,
          roleTh: 'เจ้า' + (n.peakNameTh || 'ยอดเขา') + ' (ศักดิ์เทียบเท่ารองเจ้าสำนัก)'
        });
      } else if (n.rank >= 4 || n.isElder) {
        const isOfficeHolder = Boolean(n.post && n.post !== 'disciples');
        voters.push({
          npc: n,
          weight: isOfficeHolder ? 1.5 : 1.2,
          roleTh: isOfficeHolder ? ('ผู้อาวุโส (' + SECT.POSTS[n.post].nameTh + ')') : (n.elderTitleTh || 'ผู้อาวุโสสำนัก')
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
        // Peak Politics in Successor Election: Peak Masters & Elders back candidates from their own Peak, and penalize feuding Peaks or unbacked independents
        if (voterNpc.peakId && cand.peakId) {
          if (voterNpc.peakId === cand.peakId) {
            score += (voterNpc.peakRole === 'MASTER' ? 20 : 12);
          } else if (SECT.PEAKS && SECT.PEAKS.getInterPeakScore) {
            const ip = SECT.PEAKS.getInterPeakScore(W, voterNpc.peakId, cand.peakId);
            if (ip <= -20 && (!rel || (rel.lifeAndDeathCount || 0) === 0)) score -= 14;
            else if (ip >= 20) score += 8;
          }
        } else if (voterNpc.peakId && !cand.peakId) {
          score -= 6; // Unaffiliated independent disciple lacks Peak backing
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
    let total = 0, officeBonusTotal = 0, peakBonusTotal = 0;
    const list = [];
    W.npcs.forEach(n => {
      if (n.dead || n.exiled) return;
      const baseStipend = n.peakRole === 'MASTER' ? SECT.RANKS[5].stipend : (n.rank >= 4 || n.isElder) ? SECT.RANKS[4].stipend : SECT.RANKS[n.rank].stipend;
      const pSpec = n.post ? SECT.POSTS[n.post] : null;
      const postBonus = pSpec && pSpec.stipendBonus ? Math.round(pSpec.stipendBonus * gen) : 0;
      const peakBonus = n.peakRole === 'MASTER' ? Math.round(28 * gen) : n.peakRole === 'DEPUTY' ? Math.round(14 * gen) : 0;
      const baseAmt = Math.round(baseStipend * gen * (n.post ? 1.2 : n.peakRole === 'DEPUTY' ? 1.15 : 1));
      const amt = baseAmt + postBonus + peakBonus;
      list.push([n, amt, postBonus, peakBonus]);
      total += amt;
      officeBonusTotal += postBonus;
      peakBonusTotal += peakBonus;
    });
    const ok = W.sect.stones >= total;
    const k = ok ? 1 : Math.max(0, W.sect.stones) / Math.max(1, total);
    let actualPaid = 0;
    list.forEach(([n, amt, postBonus, peakBonus]) => {
      let pay = Math.round(amt * k);
      if (!ok) {
        pay = Math.min(pay, Math.max(0, W.sect.stones - actualPaid));
      }
      n.inv.stones = (n.inv.stones || 0) + pay;
      n.lastStipendPaid = pay;
      n.lastOfficeBonusPaid = Math.round(postBonus * k);
      n.lastPeakBonusPaid = Math.round(peakBonus * k);
      actualPaid += pay;
    });
    const paid = actualPaid;
    W.sect.stones = Math.max(0, W.sect.stones - paid);
    W.sect.ledger.push({ t: W.t, amt: -paid, why: 'เบี้ยหวัดรายเดือนและเบี้ยหวัดตำแหน่งบริหาร' });
    if (W._tally) W._tally('-เบี้ยหวัดรายเดือน', paid);
    W.sect.stipendOk = ok;
    if (!ok) W.log('finance', 'คลังไม่พอจ่ายเบี้ยหวัดเต็ม จ่ายได้ ' + Math.round(k * 100) + '%', []);
    W.sect.lastPayroll = paid;
    W.sect.lastPayrollDetail = {
      day: W.day || 0,
      totalPaid: paid,
      officeBonusTotal: Math.round(officeBonusTotal * k),
      peakBonusTotal: Math.round(peakBonusTotal * k),
      ratio: +k.toFixed(3)
    };
    return paid;
  };

  SECT.payOfficeStipends = (W, opts) => {
    if (typeof opts === 'boolean') opts = { forceFull: opts };
    opts = opts || {};
    if (!W || !W.sect) return { ok: false, totalPaid: 0, recipients: [] };
    const curDay = (W.day != null) ? W.day : Math.floor((W.t || 0) / 1440);
    if (!opts.forceFull && W.sect.lastExtraStipendDay != null && (curDay - W.sect.lastExtraStipendDay) < 30) {
      return {
        ok: false,
        reason: 'cooldown-active',
        cooldown: true,
        lastExtraStipendDay: W.sect.lastExtraStipendDay,
        nextAvailableDay: W.sect.lastExtraStipendDay + 30,
        totalPaid: 0,
        paidCount: 0,
        totalBonus: 0,
        recipients: []
      };
    }
    const recipients = [];
    let totalNeeded = 0;
    const entries = [];
    SECT.POST_IDS.forEach(post => {
      const h = SECT.holder(W, post);
      const spec = SECT.POSTS[post];
      if (!h || h.dead || h.exiled || !spec) return;
      const bonus = spec.stipendBonus || 20;
      entries.push({ npc: h, post, spec, bonus });
      totalNeeded += bonus;
    });
    const avail = Math.max(0, (W.sect.stones || 0) - 100);
    const scale = totalNeeded > 0 ? Math.min(1, avail / totalNeeded) : 1;
    let totalPaid = 0;
    entries.forEach(({ npc, post, spec, bonus }) => {
      const paid = Math.max(opts.forceFull ? bonus : 0, Math.round(bonus * (opts.forceFull ? 1 : scale)));
      if (paid > 0) {
        npc.inv.stones = (npc.inv.stones || 0) + paid;
        npc.personalStones = (npc.personalStones || 0) + paid;
        npc.lastOfficeBonusPaid = paid;
        npc.sat = clamp((npc.sat || 65) + 8, 0, 100);
        npc.ext = npc.ext || {};
        npc.ext.officeEfficiencyMult = 1.20;
        npc.ext.officeEfficiencyUntilDay = curDay + 30;
        totalPaid += paid;
        recipients.push({ npcId: npc.id, nameTh: HC.fullName(npc), post, postNameTh: spec.nameTh, paid, efficiencyBonusPct: 0.20 });
      }
    });
    if (totalPaid > 0) {
      if (!opts.forceFull) W.sect.lastExtraStipendDay = curDay;
      W.sect.officeEfficiencyMult = 1.20;
      W.sect.officeEfficiencyUntilDay = curDay + 30;
      if (W.sect.internalPolitics) {
        W.sect.internalPolitics.undercurrent = clamp((W.sect.internalPolitics.undercurrent || 0) - 6, 0, 100);
        W.sect.internalPolitics.efficiencyMultiplier = Math.max(W.sect.internalPolitics.efficiencyMultiplier || 1.0, 1.20);
      }
      if (!opts.free) {
        W.sect.stones = Math.max(0, (W.sect.stones || 0) - totalPaid);
        W.sect.ledger.push({ t: W.t, amt: -totalPaid, why: 'เบี้ยหวัดเสริมประจำตำแหน่งบริหาร (' + recipients.length + ' ตำแหน่ง)' });
      }
    }
    return { ok: true, totalPaid, paidCount: recipients.length, totalBonus: totalPaid, recipients, efficiencyMult: 1.20, lastExtraStipendDay: W.sect.lastExtraStipendDay };
  };

  /* ---------- สภาประจำวัน: เจ้าสำนักตัดสินใจตามตัวตน ---------- */
  SECT.daily = W => {
    SECT.decayFacilityDemand(W);
    const S = W.sect, m = W.byId[S.masterId];
    if (!m || m.dead) { if (SECT.resolvePlayerSuccessionCrisis) SECT.resolvePlayerSuccessionCrisis(W, 'เจ้าสำนักว่าง'); else SECT.succession(W, 'เจ้าสำนักว่าง'); return; }
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
        let win = cands[0], sc = SECT.appointScore(W, post, win, m);
        for (let ci = 1; ci < cands.length; ci++) { const s2 = SECT.appointScore(W, post, cands[ci], m); if (s2 > sc) { sc = s2; win = cands[ci]; } }
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
    if (m && !m.dead && !m.away && !(m.jail > W.t)) SECT.masterDecision(W, m);
    // 5) หัวหน้าหอสั่งงานของตน
    SECT.hallHeads(W);
    if (SECT.OUTPOSTS_LOGISTICS && SECT.OUTPOSTS_LOGISTICS.tickOutpostLogistics) {
      SECT.OUTPOSTS_LOGISTICS.tickOutpostLogistics(W, { quiet: true });
    }
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
    if (W && W.sect && SECT.CHARTER_DOCTRINE && SECT.CHARTER_DOCTRINE.getCharterPerks) {
      const cPerks = SECT.CHARTER_DOCTRINE.getCharterPerks(W);
      if (cPerks && Number.isFinite(cPerks.applicantScoreBonus)) bias += cPerks.applicantScoreBonus;
    }
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
        if (!a.cult && CULT && CULT.MORTAL_INITIATION) CULT.MORTAL_INITIATION.ensureMortalState(a, W);
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
    if (SECT.ELDER_STATUS && SECT.ELDER_STATUS.evaluateElderAscensions) {
      SECT.ELDER_STATUS.evaluateElderAscensions(W, { quiet: true });
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
    const dsh = (g.COMBAT && g.COMBAT.evaluateTacticalBoutSummary) ? g.COMBAT.evaluateTacticalBoutSummary(opts.formationPartyA || a.conferenceParty || [a], opts.formationPartyB || b.conferenceParty || [b]) : null;
    const dshA = dsh ? (1 + Math.max(-0.12, Math.min(0.12, dsh.advantageDelta * 0.5))) : 1;
    const dshB = dsh ? (1 + Math.max(-0.12, Math.min(0.12, -dsh.advantageDelta * 0.5))) : 1;
    const scoreA = powA * (tacA.dmgMult || 1) * dshA * (1 + (resA.active ? resA.pieces * 0.04 : 0)) * (formA.powerMultiplier || 1) * (0.88 + (W.rng ? W.rng.next() * 0.24 : 0.12));
    const scoreB = powB * (tacB.dmgMult || 1) * dshB * (1 + (resB.active ? resB.pieces * 0.04 : 0)) * (formB.powerMultiplier || 1) * (0.88 + (W.rng ? W.rng.next() * 0.24 : 0.12));
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
    const wTypes = ['SWORD', 'BLADE', 'SPEAR', 'FIST', 'BOW', 'STAFF', 'FOCUS', 'ZITHER', 'BRUSH', 'WHIP'];
    const rivalLoadout = (g.EXPED && g.EXPED.buildSectDiscipleLoadout) ? g.EXPED.buildSectDiscipleLoadout(W, rival, (W.day || 0) % 3) : null;
    const envoyWeapon = opts.envoyWeapon || (rivalLoadout && rivalLoadout.weaponType) || wTypes[Math.floor((W.day || 0) + (rival.power || 1)) % wTypes.length];
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
      HC.experience(champ, 'duel_win', 0.7);
      if (decisiveRivalry && g.CONTENT && g.CONTENT.forceVassalTreaty) vassalTreaty = g.CONTENT.forceVassalTreaty(W, rival, { majorDispute: true, winnerId: champ.id, cause: 'RIVAL_ENVOY_CHALLENGE' });
    } else {
      W.fame(-1);
      rival.attitude = clamp((rival.attitude || 0) - 4, -100, 100);
      HC.experience(champ, 'duel_lose', 0.35);
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
          const wTypes = ['SWORD', 'BLADE', 'SPEAR', 'FIST', 'BOW', 'STAFF', 'FOCUS', 'ZITHER', 'BRUSH', 'WHIP'];
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
        const avail = Math.max(0, S.stones || 0);
        const stonePay = Math.min(spec.stonePrize, Math.floor(avail * 0.15));
        const actualStonePay = Math.min(stonePay, avail);
        if (actualStonePay > 0) {
          ECO.pay(W, actualStonePay, 'รางวัลชุมนุมยุทธ์ ' + spec.nameTh);
          champ.inv.stones = (champ.inv.stones || 0) + actualStonePay;
        }
        HC.experience(champ, 'duel_win', 0.85);
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
        const curSt = Math.round(W.sect.stones);
        W.log('decision', m.h.name.given + ' ชะลอการขยาย' + bestBlockedByTreasury.b.nameTh + ' แม้พบความต้องการสูง (' + bestBlockedByTreasury.reason + ') เนื่องจากต้องสำรองศิลาคงคลังขั้นต่ำ ' + cashReserve + ' ศิลา (ปัจจุบันมี ' + curSt + ' ศิลา ต้องการ ' + bestBlockedByTreasury.needed + ' ศิลา)', [m.id, bestBlockedByTreasury.id], {
          storyThreadId: 'thread:governance:facility_' + bestBlockedByTreasury.id,
          storyThreadTitleTh: 'การขยาย' + bestBlockedByTreasury.b.nameTh + 'และงบสำรองคลัง',
          originCauseTh: 'พบความต้องการใช้งานสูง (' + bestBlockedByTreasury.reason + ') แต่ต้องรักษากันชนศิลาสำรองขั้นต่ำ ' + cashReserve + ' ศิลา',
          consequenceTh: 'ชะลอโครงการขยาย ' + bestBlockedByTreasury.b.nameTh + ' (ค่าก่อสร้าง ' + bestBlockedByTreasury.cost + ' ศิลา) เพื่อป้องกันวิกฤตขาดสภาพคล่อง',
          followUpTh: 'สะสมศิลาวิญญาณให้ถึง ' + bestBlockedByTreasury.needed + ' ศิลา (ขาดอีก ' + Math.max(0, bestBlockedByTreasury.needed - curSt) + ' ศิลา) เพื่อให้ขยายอาคารได้ปลอดภัย',
          factDeltas: { stonesNow: curSt, cashReserve, buildCost: bestBlockedByTreasury.cost, neededTotal: bestBlockedByTreasury.needed },
          promoteChronicle: true
        });
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
    W.log('decision', m.h.name.given + ' อนุมัติขยาย' + best.b.nameTh + ' เป็นระดับ ' + (best.b.level + 1) + '/' + SECT.maxBuildingLevel(best.b) + ' (ใช้ ' + best.cost + ' ศิลา) หลังพบความแออัดต่อเนื่อง (' + best.reason + ')', [m.id, best.id], {
      storyThreadId: 'thread:governance:facility_' + best.id,
      storyThreadTitleTh: 'การขยาย' + best.b.nameTh + 'และงบสำรองคลัง',
      originCauseTh: 'พบความแออัดต่อเนื่อง (' + best.reason + ') และศิลาคงคลังสูงกว่าเกณฑ์สำรองปลอดภัย',
      consequenceTh: 'เริ่มก่อสร้างขยาย ' + best.b.nameTh + ' สู่ระดับ ' + (best.b.level + 1) + ' (จ่าย ' + best.cost + ' ศิลา)',
      followUpTh: 'รอการก่อสร้างแล้วเสร็จเพื่อเพิ่มสถานีรองรับศิษย์',
      factDeltas: { buildCost: best.cost, targetLevel: best.b.level + 1 },
      promoteChronicle: true
    });
  };

  SECT.startResearch = (W, m) => {
    const S = W.sect; if (S.research) return;
    if (S.recipeTier >= 7) return;
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
    W.log('scandal', 'ตรวจพบ ' + tre.h.name.given + ' ยักยอกคลังรวม ' + Math.round(amt) + ' ศิลา!', [tre.id].concat(by ? [by.id] : []), {
      storyThreadId: 'thread:governance:audit_' + tre.id,
      storyThreadTitleTh: 'คดีตรวจสอบคลังสำนักของ ' + HC.fullName(tre),
      originCauseTh: 'หอวินัยและเจ้าสำนักตรวจสอบบัญชีคลังหลังพบพิรุธสะสม',
      consequenceTh: 'ยึดศิลาคืนเข้าคลัง ' + Math.round(amt * 0.6) + ' ก้อน และลงโทษถอดถอน/คุมขังผู้กระทำผิด',
      followUpTh: 'แต่งตั้งผู้ดูแลคลังคนใหม่ที่มีความซื่อสัตย์ (Integrity) สูงขึ้น',
      factDeltas: { embezzledAmt: Math.round(amt), recoveredAmt: Math.round(amt * 0.6) },
      severity: 'CRITICAL',
      promoteChronicle: true
    });
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
    if (g.AI && g.AI.interruptFor) g.AI.interruptFor(W, n);
    if (g.AI && g.AI.freeBed) g.AI.freeBed(W, n);
    if (n.post) { W.sect.posts[n.post] = null; n.post = null; }
    n.assist = null;
    if (W.sect && W.sect.successorId === n.id) W.sect.successorId = null;
    if (W.sect && W.sect.deputyId === n.id) W.sect.deputyId = null;
    n.exiled = true; n.rank = 0; n.leave = { t: W.t, why: 'ถูกขับ' };
    n.act = { id: 'idle', stage: 'do', left: 0, total: 0, ctx: {}, why: [['ถูกขับออกจากสำนัก', 9]] };
    n.why = [['ถูกขับออกจากสำนัก', 9]];
    if (!n.away) n.travel = { to: 'exit' };
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
    if (SECT.ensureHierarchyAndPolitics) SECT.ensureHierarchyAndPolitics(W);
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
    W.sect._stockDirty = true;
    if (W.sect.inventoryIntelligence) W.sect.inventoryIntelligence.evaluatedAt = -1;
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
        for (let ci = 0; ci < cands.length; ci++) {
          const cn = cands[ci];
          const cEmpty = !(cn.equip && cn.equip[eq.slot]) ? 12 : 0;
          const cDelta = (g.MARTIAL && g.MARTIAL.classifyGearForNpc) ? (g.MARTIAL.classifyGearForNpc(W, cn, eq, 0).deltaScore || 0) * 0.15 : 0;
          cn._distScore = recipientScoreForItem(W, evaluator, cn, eq, roleBoosts) + cEmpty + cDelta;
        }
        cands.sort((a, b) => b._distScore - a._distScore);
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
    if (succ && !succ.dead && !succ.exiled) {
      if (succ.post) { S.posts[succ.post] = null; succ.post = null; }
      if (S.successorId === succ.id) S.successorId = null;
      if (S.deputyId === succ.id) S.deputyId = null;
      succ.rank = 6;
      S.masterId = succ.id;
      succ.sat = 95;
      if (old && !old.dead && old.rank === 6) { old.rank = 4; }
      W.log('succession', 'ศิษย์สืบทอด ' + succ.h.name.given + ' ขึ้นสืบทอดตำแหน่งเจ้าสำนักคนใหม่ตามพินัยกรรมสำนัก' + (why ? ' (' + why + ')' : ''), [succ.id]);
      if (SECT.recordTimelineMilestone) {
        SECT.recordTimelineMilestone(W, {
          milestoneType: 'SUCCESSION',
          icon: '👑',
          titleTh: 'ศิษย์สืบทอด「' + HC.fullName(succ) + '」ขึ้นครองตำแหน่งเจ้าสำนักคนใหม่',
          descTh: 'สืบทอดตราเจ้าสำนักตามพินัยกรรม' + (why ? ' (' + why + ')' : ''),
          involvedIds: [succ.id, old && old.id].filter(Boolean),
          quiet: true
        });
      }
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
    if (SECT.recordTimelineMilestone) {
      SECT.recordTimelineMilestone(W, {
        milestoneType: 'SUCCESSION',
        icon: '👑',
        titleTh: 'สภาสำนักสถาปนา「' + HC.fullName(nm) + '」ขึ้นเป็นเจ้าสำนักคนใหม่',
        descTh: 'ได้รับมติเอกฉันท์จากสภาผู้อาวุโส' + (why ? ' (' + why + ')' : ''),
        involvedIds: [nm.id, old && old.id].filter(Boolean),
        quiet: true
      });
    }
    W.fame(5);
    cands.slice(1, 4).forEach(c => {
      const amb = HC.eff(c, 'personality.ambition');
      if (amb > 60) {
        c.sat = Math.max(0, (c.sat || 60) - (amb - 50) * 0.4);
        const r = SECT.rel(c, nm.id); r.v += 12; r.a -= 6;
        if (SECT.HEART_DEMON && SECT.HEART_DEMON.spawnFromCause) {
          SECT.HEART_DEMON.spawnFromCause(W, c, 'AMBITION_ENVY', {
            sourceNpc: nm,
            originEventTh: 'พ่ายแพ้การคัดเลือกตำแหน่งเจ้าสำนักให้แก่「' + HC.fullName(nm) + '」ก่อเกิดความริษยาในใจ'
          });
        }
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
        if (g.AI && g.AI.interruptFor) g.AI.interruptFor(W, n);
        if (g.AI && g.AI.freeBed) g.AI.freeBed(W, n);
        if (n.post) { W.sect.posts[n.post] = null; n.post = null; }
        n.assist = null;
        if (W.sect && W.sect.successorId === n.id) W.sect.successorId = null;
        if (W.sect && W.sect.deputyId === n.id) W.sect.deputyId = null;
        n.leave = { t: W.t, why: 'หนีออกจากสำนัก' }; n.exiled = true; n.deserting = true;
        n.act = { id: 'idle', stage: 'do', left: 0, total: 0, ctx: {}, why: [['หนีออกจากสำนัก', 9]] };
        n.why = [['หนีออกจากสำนัก', 9]];
        n.travel = { to: 'exit' };
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
    skills: { min: 0, max: 100, keys: ['SWORD', 'BLADE', 'SPEAR', 'FIST_PALM', 'BOW', 'STAFF', 'FOCUS', 'ZITHER', 'BRUSH', 'WHIP', 'MOVEMENT', 'BODY_REFINING', 'SOUL_DIVINE', 'ALCHEMY', 'FORGING', 'ARRAY', 'TALISMAN', 'BEAST_TAMING', 'MEDICINE', 'POISON', 'SCRIPTURE', 'herbalism', 'mining', 'cooking', 'trading', 'administration', 'diplomacy', 'stealth', 'survival', 'arts', 'construction', 'ritual'] }
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
      if (!t || !t.id || t.innateOnly || (g.MARTIAL && g.MARTIAL.isInnateTech && g.MARTIAL.isInnateTech(t)) || seenManualIds.has(t.id)) return;
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

    // 6C. Grand Dao Path Manuals (PATH_MANUAL) & Path Crystals (PATH_CRYSTAL) (54 items across 27 Paths)
    Object.keys((CULT && CULT.PATHS) || {}).forEach(pid => {
      const pDef = CULT.PATHS[pid];
      if (!pDef) return;
      const manId = "MANUAL_PATH_" + pid;
      const cryId = "CRYSTAL_PATH_" + pid;
      out.push(enrichCatalogEntry({
        key: "PATH_MANUAL:" + manId, kind: "PATH_MANUAL", id: manId,
        nameTh: "มหาคัมภีร์ต้นกำเนิด · " + pDef.nameTh,
        tier: 4, grade: "Exceptional", rarity: "Exceptional", compatiblePath: pid,
        element: pDef.element || "ASTRAL", elementProfile: pDef.elementProfile || null,
        effectIds: ["EFX_UNLOCK_SECT_PATH_MANUAL"],
        sourceRegistry: "JD.MARTIAL.items(PATH_MANUAL)", stackable: true, canSect: true, canNpc: true,
        descTh: "มหาคัมภีร์ต้นกำเนิดสำหรับปลดล็อก「" + pDef.nameTh + "」ในหอคัมภีร์วิถีสำนักอย่างถาวร"
      }));
      out.push(enrichCatalogEntry({
        key: "PATH_CRYSTAL:" + cryId, kind: "PATH_CRYSTAL", id: cryId,
        nameTh: "ผลึกมรรคาสำเร็จรูป · " + pDef.nameTh,
        tier: 3, grade: "Rare", rarity: "Rare", compatiblePath: pid,
        element: pDef.element || "ASTRAL", elementProfile: pDef.elementProfile || null,
        effectIds: ["EFX_BESTOW_PATH_CRYSTAL"],
        sourceRegistry: "JD.MARTIAL.items(PATH_CRYSTAL)", stackable: true, canSect: true, canNpc: true,
        descTh: "ผลึกมรดกวิถีใช้ครั้งเดียวสำหรับเบิกเนตรศิษย์เข้าสู่「" + pDef.nameTh + "」โดยตรง"
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
      if (!t || t.innateOnly || (g.MARTIAL && g.MARTIAL.isInnateTech && g.MARTIAL.isInnateTech(t))) return { ok: false, reason: "ไม่พบคัมภีร์วิชาหรือเป็นวิชาเฉพาะสายย่อยติดตัว: " + opts.id };
      if (!n.cult) return { ok: false, reason: "ตัวละครยังเป็นปุถุชน ต้องเปิดวิถีบำเพ็ญก่อน" };
      if (!opts.forceCrossPath) {
        const pathCompat = !t.path || t.path === "ANY" || t.path === n.cult.path;
        const subCompat = !CULT.isSubCompatible || CULT.isSubCompatible(t, n.cult.sub, false);
        if (!pathCompat || !subCompat) {
          return { ok: false, reason: "วิชานี้จำกัดเฉพาะวิถี/สายย่อย (" + (t.path || "ANY") + (t.sub ? "/" + t.sub : "") + ") ไม่ตรงกับผู้เรียน (" + n.cult.path + "/" + n.cult.sub + ")" };
        }
      }
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
    } else if (kind === 'PATH_MANUAL') {
      const pKey = String(id).replace(/^MANUAL_PATH_/, '').toUpperCase();
      const pDef = CULT.PATHS && CULT.PATHS[pKey];
      if (!pDef) return { ok: false, reason: 'ไม่พบคัมภีร์มหาวิถี: ' + id };
      const canonId = 'MANUAL_PATH_' + pKey;
      itemNameTh = 'มหาคัมภีร์ต้นกำเนิด · ' + pDef.nameTh;
      if (dest === 'sect') {
        ECO.add(W, canonId, qty);
        if (opts.autoUnlock && SECT.PATH_LIBRARY) {
          SECT.PATH_LIBRARY.unlockPath(W, pKey, { source: 'EDITOR_SPAWN', quiet: true });
        }
      } else {
        npc.inv.mats = npc.inv.mats || {};
        npc.inv.mats[canonId] = (npc.inv.mats[canonId] || 0) + qty;
      }
    } else if (kind === 'PATH_CRYSTAL') {
      const pKey = String(id).replace(/^CRYSTAL_PATH_/, '').toUpperCase();
      const pDef = CULT.PATHS && CULT.PATHS[pKey];
      if (!pDef) return { ok: false, reason: 'ไม่พบผลึกมหาวิถี: ' + id };
      const canonId = 'CRYSTAL_PATH_' + pKey;
      itemNameTh = 'ผลึกมรรคาสำเร็จรูป · ' + pDef.nameTh;
      if (dest === 'sect') {
        ECO.add(W, canonId, qty);
      } else {
        npc.inv.mats = npc.inv.mats || {};
        npc.inv.mats[canonId] = (npc.inv.mats[canonId] || 0) + qty;
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
    if (eq.retired || eq.broken || (eq.procedural && eq.dur != null && eq.dur <= 0)) {
      return { ok: false, reason: 'อุปกรณ์ชำรุดเสียหาย ต้องซ่อมบำรุงก่อนสวมใส่' };
    }
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
    if (action === 'launch_siege') {
      return g.EXPED && g.EXPED.marshalStrikeForce ? g.EXPED.marshalStrikeForce(W, opts.party, s, { immediate: true, postResolution: opts.postResolution || 'SUBJUGATE', forceWin: opts.forceWin !== false }) : { ok: false, reason: 'no-siege-fn' };
    }
    if (action === 'set_vassal_policy') {
      return g.EXPED && g.EXPED.setVassalTributePolicy ? g.EXPED.setVassalTributePolicy(W, s, opts.policy || 'STANDARD') : { ok: false };
    }
    if (action === 'collect_vassal_tribute') {
      return g.EXPED && g.EXPED.collectVassalTributes ? g.EXPED.collectVassalTributes(W, { force: true }) : { ok: false };
    }
    if (action === 'spawn_vassal_distress') {
      const call = g.EXPED && g.EXPED.spawnVassalDistressCall ? g.EXPED.spawnVassalDistressCall(W, s, opts) : null;
      return { ok: !!call, call };
    }
    if (action === 'respond_vassal_distress') {
      return g.EXPED && g.EXPED.respondVassalDistress ? g.EXPED.respondVassalDistress(W, opts.distressId || s.id, opts.choice || 'REINFORCE') : { ok: false };
    }
    if (action === 'claim_resource_node') {
      return g.EXPED && g.EXPED.claimResourceNode ? g.EXPED.claimResourceNode(W, opts.nodeId || 'MINE_CELESTIAL_STONE', opts.party, { forceWin: true }) : { ok: false };
    }
    if (action === 'spawn_world_anomaly') {
      const anom = g.EXPED && g.EXPED.spawnWorldAnomaly ? g.EXPED.spawnWorldAnomaly(W, opts) : null;
      return { ok: !!anom, anomaly: anom };
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

    if (action === 'awaken_four_symbol' || action === 'evolve_four_symbol') {
      if (!CULT.awakenFourSymbolBloodline) return { ok: false, reason: 'ไม่พบระบบปลุกสายเลือด 4 เทพอสูร' };
      return CULT.awakenFourSymbolBloodline(W, n, opts.petUid, opts.symbolId || null, { free: opts.free !== false, force: opts.force !== false });
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
    const mentorId = n.mentorId || n.mentor || (n.h && n.h.life && n.h.life.family && n.h.life.family.master) || null;
    const mentor = mentorId && W.byId && W.byId[mentorId];
    const discipleIds = Array.from(new Set([].concat(n.apprenticeIds || [], n.disciples || [], (n.h && n.h.life && n.h.life.family && n.h.life.family.disciples) || []))).slice(0, 24);
    const records = (W.sect.sectChronicle || []).concat(W.logs || []), seenEvents = new Set();
    const events = records.filter(e => e && Array.isArray(e.ids) && e.ids.includes(n.id) && typeof e.text === 'string')
      .sort((a,b) => b.t-a.t || b.id-a.id).filter(e => {if (seenEvents.has(e.id)) return false; seenEvents.add(e.id); return true;}).slice(0,12)
      .map(e => ({id:e.id,t:e.t,type:e.type,text:e.text}));
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
    const history = (W.sect.mentorship && W.sect.mentorship.history) || [];
    const knownMentor = history.find(e => e && e.kind === 'bond' && e.discipleId === n.id && e.mentorId === mentorId);
    tablet.profile = {nameTh:n.h && n.h.name ? HC.fullName(n) : nameTh, mentorId, mentorNameTh:mentor ? HC.fullName(mentor) : (knownMentor && knownMentor.mentorNameTh) || null,
      disciples:discipleIds.map(id => {const d=W.byId && W.byId[id], rec=history.find(e => e && e.kind === 'bond' && e.mentorId === n.id && e.discipleId === id);return {id,nameTh:d ? HC.fullName(d) : (rec && rec.discipleNameTh) || null};}),
      events, joinDay:Number.isFinite(n.joinDay) ? n.joinDay : null,
      merit:Number.isFinite(n.merit) ? Math.round(n.merit) : null};
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
    const types = ['SWORD','BLADE','SPEAR','FIST','BOW','STAFF','FOCUS','ZITHER','BRUSH','WHIP'];
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
      ['KARMA_SAMSARA', 'SAGE_SUPPORT'],
      ['STRATEGY_GOVERNANCE', 'ARRAY_TALISMAN'],
      ['CRAFT_CREATION', 'GOD']
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
        HC.experience(champ, 'duel_win', 0.6);
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
    const imprintBonus = (candidate && candidate.mentorImprint) ? 0.04 : 0;
    const legRes = (g.MARTIAL && g.MARTIAL.evaluateLegendaryRelicResonance && candidate) ? g.MARTIAL.evaluateLegendaryRelicResonance(candidate) : null;
    const relicBonus = (legRes && legRes.active) ? (legRes.pieces >= 3 ? 0.05 : 0.025) : 0;
    const grandArrayBonus = (W && W.sect && W.sect.fengShui && W.sect.fengShui.activeGrandArray && Number.isFinite(W.sect.fengShui.activeGrandArray.tribulationShieldBonus))
      ? W.sect.fengShui.activeGrandArray.tribulationShieldBonus
      : 0;
    const karmaDelta = (candidate && candidate.karmicLedger)
      ? clamp((candidate.karmicLedger.netKarma || 0) * 0.0015, -0.12, 0.10)
      : 0;
    return +clamp(0.36 + base * 0.30 + helperBonus + roleBonus + diversityBonus + formationBonus + imprintBonus + relicBonus + grandArrayBonus + karmaDelta + (medicineId ? 0.06 : 0), 0.35, 0.94).toFixed(3);
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
      const success = (W.rng && typeof W.rng.next === 'function' ? W.rng.next() : 0.45) < attempt.chance;
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
        if (!candidate.qiTransmitted && Array.isArray(candidate.apprenticeIds) && candidate.apprenticeIds.length > 0 && SECT.MENTORSHIP && SECT.MENTORSHIP.transmitQi) {
          const appId = candidate.apprenticeIds.find(id => W.byId && W.byId[id] && !W.byId[id].dead);
          if (appId) SECT.MENTORSHIP.transmitQi(W, candidate, appId, { preAscension: true, force: true });
        }
        if (candidate.id === W.sect.masterId) SECT.succession(W, 'เจ้าสำนักจุติสู่แดนบน');
        candidate.cult.ascended = true;
        if (g.SIM && g.SIM.retire) g.SIM.retire(W, candidate);
        if (W.log) W.log('sect', '⚡ ' + attempt.candidateNameTh + ' ฝ่าด่านเคราะห์สวรรค์และจุติสู่แดนบน ทิ้งเจตจำนงไว้ ณ ศาลบรรพชน · พรสืบทอด +' + Math.round((SECT.ascensionCultivationMultiplier(W) - 1) * 100) + '%', [candidate.id]);
        if (SECT.recordTimelineMilestone) {
          SECT.recordTimelineMilestone(W, {
            milestoneType: 'ASCENSION',
            icon: '🌩️',
            titleTh: 'จุติสู่แดนเซียน: 「' + attempt.candidateNameTh + '」ฝ่าด่านทัณฑ์สวรรค์สำเร็จ!',
            descTh: 'ทิ้งป้ายวิญญาณมรดกและพรบรรพชนเร่งการบ่มเพาะไว้คุ้มครองศิษย์รุ่นหลัง',
            involvedIds: [candidate.id],
            quiet: true
          });
        }
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

  /* ======================= v2.0.16 Pillar B: Universal Mentorship, Qi Transmission & Custom Sect Arts ======================= */
  const MENTORSHIP = {
    MAX_APPRENTICES: 3,
    MIN_MENTOR_STAGE: 3
  };
  MENTORSHIP.ensure = W => {
    if (!W || !W.sect) return null;
    if (!W.sect.mentorship || typeof W.sect.mentorship !== 'object') {
      W.sect.mentorship = { bonds: {}, transmissions: [], heritageArts: [], seq: 0 };
    }
    const ms = W.sect.mentorship;
    if (!ms.bonds || typeof ms.bonds !== 'object') ms.bonds = {};
    if (!Array.isArray(ms.transmissions)) ms.transmissions = [];
    if (!Array.isArray(ms.history)) ms.history = [];
    if (!Array.isArray(ms.heritageArts)) ms.heritageArts = [];
    if (!Number.isFinite(ms.seq) || ms.seq < 0) ms.seq = 0;
    // Re-register any synthesized Custom Sect Heritage Arts into CULT / JD.MARTIAL on load
    if (CULT && CULT.registerDynamicTech) {
      for (const art of ms.heritageArts) {
        if (art && art.id) CULT.registerDynamicTech(art);
      }
    }
    return ms;
  };

  MENTORSHIP.resolveNpc = (W, v) => {
    if (!W || !v) return null;
    const n = typeof v === 'string' ? (W.byId && W.byId[v]) : v;
    if (!n || !n.id) return null;
    if (W.byId && Object.keys(W.byId).length > 0 && W.byId[n.id] !== n) return null;
    if (Array.isArray(W.npcs) && !W.npcs.includes(n)) return null;
    return n;
  };

  MENTORSHIP.recordHistory = (W, kind, mentor, disciple, extra) => {
    const ms = MENTORSHIP.ensure(W);
    if (!ms || !mentor || !disciple) return null;
    const entry = Object.assign({ id:'LINEAGE_' + (++ms.seq), kind, day:W.day || 0,
      mentorId:mentor.id, mentorNameTh:HC.fullName(mentor), discipleId:disciple.id,
      discipleNameTh:HC.fullName(disciple) }, extra || {});
    ms.history.unshift(entry);
    if (ms.history.length > 200) ms.history.length = 200;
    return entry;
  };

  MENTORSHIP.isMentorPair = (a, b) => {
    if (!a || !b) return false;
    return a.mentorId === b.id || b.mentorId === a.id ||
      (Array.isArray(a.apprenticeIds) && a.apprenticeIds.includes(b.id)) ||
      (Array.isArray(b.apprenticeIds) && b.apprenticeIds.includes(a.id));
  };

  MENTORSHIP.formBond = (W, mentorOrId, discipleOrId, opts) => {
    opts = opts || {};
    const ms = MENTORSHIP.ensure(W);
    const mentor = MENTORSHIP.resolveNpc(W, mentorOrId);
    const disciple = MENTORSHIP.resolveNpc(W, discipleOrId);
    if (!ms || !mentor || !disciple || mentor === disciple || mentor.dead || disciple.dead) {
      return { ok: false, reason: 'invalid-pair' };
    }
    if (mentor.exiled || disciple.exiled || SECT.isNpcDetained(W, mentor) || SECT.isNpcDetained(W, disciple)) {
      return { ok: false, reason: 'participant-ineligible' };
    }
    if (!mentor.cult || !disciple.cult) return { ok: false, reason: 'not-cultivator' };
    if (disciple.mentorId === mentor.id && ms.bonds[disciple.id] && ms.bonds[disciple.id].mentorId === mentor.id) return {ok:true, bond:ms.bonds[disciple.id]};
    const seen = new Set(); let ancestor = mentor;
    while (ancestor && !seen.has(ancestor.id)) {
      if (ancestor.id === disciple.id) return {ok:false, reason:'lineage-cycle'};
      seen.add(ancestor.id); ancestor = W.byId && W.byId[ancestor.mentorId || ancestor.mentor];
    }
    const mEq = CULT.equivalentStage ? CULT.equivalentStage(mentor) : (mentor.cult.stage || 1);
    const dEq = CULT.equivalentStage ? CULT.equivalentStage(disciple) : (disciple.cult.stage || 1);
    if (!opts.force && mEq < MENTORSHIP.MIN_MENTOR_STAGE && (mentor.rank || 0) < 3) {
      return { ok: false, reason: 'mentor-stage-too-low' };
    }
    if (!opts.force && mEq <= dEq && (mentor.rank || 0) <= (disciple.rank || 0)) {
      return { ok: false, reason: 'mentor-not-senior' };
    }
    mentor.apprenticeIds = Array.isArray(mentor.apprenticeIds) ? mentor.apprenticeIds.filter(id => W.byId && W.byId[id] && !W.byId[id].dead && (!Array.isArray(W.npcs) || W.npcs.includes(W.byId[id]))) : [];
    if (!opts.force && !mentor.apprenticeIds.includes(disciple.id) && mentor.apprenticeIds.length >= MENTORSHIP.MAX_APPRENTICES) {
      return { ok: false, reason: 'mentor-apprentice-cap' };
    }
    const previousMentor = W.byId && W.byId[disciple.mentorId || disciple.mentor];
    if (previousMentor && previousMentor !== mentor) {
      if (Array.isArray(previousMentor.apprenticeIds)) previousMentor.apprenticeIds = previousMentor.apprenticeIds.filter(id => id !== disciple.id);
      if (Array.isArray(previousMentor.disciples)) previousMentor.disciples = previousMentor.disciples.filter(id => id !== disciple.id);
      const family = previousMentor.h && previousMentor.h.life && previousMentor.h.life.family;
      if (family && Array.isArray(family.disciples)) family.disciples = family.disciples.filter(id => id !== disciple.id);
      const rPrevM = SECT.rel(previousMentor, disciple.id);
      if (rPrevM && rPrevM.bond === 'ศิษย์สายตรง') rPrevM.bond = 'อดีตศิษย์';
      const rPrevD = SECT.rel(disciple, previousMentor.id);
      if (rPrevD && rPrevD.bond === 'อาจารย์สายตรง') rPrevD.bond = 'อดีตอาจารย์';
    }
    disciple.mentorId = mentor.id;
    disciple.mentor = mentor.id;
    if (!mentor.apprenticeIds.includes(disciple.id)) mentor.apprenticeIds.push(disciple.id);
    mentor.h.life = mentor.h.life || {};
    mentor.h.life.family = mentor.h.life.family || {};
    mentor.h.life.family.disciples = Array.isArray(mentor.h.life.family.disciples) ? mentor.h.life.family.disciples : [];
    if (!mentor.h.life.family.disciples.includes(disciple.id)) mentor.h.life.family.disciples.push(disciple.id);
    disciple.h.life = disciple.h.life || {};
    disciple.h.life.family = disciple.h.life.family || {};
    disciple.h.life.family.master = mentor.id;

    const samePath = mentor.cult.path === disciple.cult.path;
    const sameSub = samePath && mentor.cult.sub && mentor.cult.sub !== 'NONE' && mentor.cult.sub === disciple.cult.sub;
    const resonanceKind = sameSub ? 'DIRECT_SUBPATH_LINEAGE' : samePath ? 'SAME_PATH_LINEAGE' : 'CROSS_DAO_SYNTHESIS';
    const bondRec = {
      id: 'MBOND_' + mentor.id + '_' + disciple.id,
      mentorId: mentor.id,
      mentorNameTh: HC.fullName(mentor),
      discipleId: disciple.id,
      discipleNameTh: HC.fullName(disciple),
      mentorPath: mentor.cult.path,
      disciplePath: disciple.cult.path,
      resonanceKind,
      sinceDay: W.day || 0,
      coachingSessions: 0
    };
    ms.bonds[disciple.id] = bondRec;
    MENTORSHIP.recordHistory(W, 'bond', mentor, disciple, {resonanceKind});

    const rm = SECT.rel(mentor, disciple.id);
    const rd = SECT.rel(disciple, mentor.id);
    rm.a = clamp((rm.a || 0) + 18, -100, 100); rm.t = clamp((rm.t ?? 40) + 20, 0, 100); rm.r = clamp((rm.r ?? 30) + 12, 0, 100); rm.bond = 'ศิษย์สายตรง';
    rd.a = clamp((rd.a || 0) + 20, -100, 100); rd.t = clamp((rd.t ?? 40) + 24, 0, 100); rd.r = clamp((rd.r ?? 30) + 28, 0, 100); rd.g = clamp((rd.g || 0) + 22, 0, 100); rd.bond = 'อาจารย์สายตรง';

    if (g.COG && g.COG.recordAspirationMilestone) {
      g.COG.recordAspirationMilestone(W, mentor, 'รับ「' + HC.fullName(disciple) + '」เป็นศิษย์สายตรง', 12);
      g.COG.recordAspirationMilestone(W, disciple, 'กราบ「' + HC.fullName(mentor) + '」เป็นอาจารย์สายตรง', 12);
    }
    if (!opts.quiet && W.log) {
      W.log('disciple', '🍵 ' + HC.fullName(disciple) + ' ยกน้ำชากราบ「' + HC.fullName(mentor) + '」เป็นอาจารย์สายตรง (' + (sameSub ? 'สืบทอดสายย่อยโดยตรง' : samePath ? 'ร่วมวิถีบำเพ็ญ' : 'ผสานสัจธรรมข้ามวิถี') + ')', [mentor.id, disciple.id]);
    }
    return { ok: true, bond: bondRec };
  };

  MENTORSHIP.coachDisciple = (W, mentorOrId, discipleOrId, opts) => {
    opts = opts || {};
    const ms = MENTORSHIP.ensure(W);
    const mentor = MENTORSHIP.resolveNpc(W, mentorOrId);
    const disciple = MENTORSHIP.resolveNpc(W, discipleOrId);
    if (!ms || !mentor || !disciple || mentor === disciple || mentor.dead || disciple.dead || mentor.exiled || disciple.exiled || !mentor.cult || !disciple.cult) {
      return { ok: false, reason: 'invalid-pair' };
    }
    if (mentor.away || disciple.away || mentor.sealed || disciple.sealed || mentor.sealedBt || disciple.sealedBt || SECT.isNpcDetained(W, mentor) || SECT.isNpcDetained(W, disciple)) {
      return { ok: false, reason: 'participant-unavailable' };
    }
    const nowT = (W && typeof W.t === 'number') ? W.t : null;
    if (!opts.ignoreCooldown && nowT !== null) {
      if (disciple.lastCoachedAt != null && nowT - disciple.lastCoachedAt < 60) {
        return { ok: false, reason: 'coaching-cooldown' };
      }
      if (mentor.lastCoachGivenAt != null && nowT - mentor.lastCoachGivenAt < 60) {
        return { ok: false, reason: 'mentor-coaching-cooldown' };
      }
    }
    if (disciple.mentorId !== mentor.id) {
      if (opts.casualLesson) {
        // Casual lesson from AI.pairEnd('teach'): do not alter formal master-disciple lineage
      } else if (disciple.mentorId && !opts.rebind) {
        return { ok: false, reason: 'already-has-mentor' };
      } else {
        const formed = MENTORSHIP.formBond(W, mentor, disciple, { quiet: true });
        if (!formed.ok) return formed;
      }
    }
    if (nowT !== null) {
      disciple.lastCoachedAt = nowT;
      mentor.lastCoachGivenAt = nowT;
    }
    const bond = disciple.mentorId === mentor.id ? ms.bonds[disciple.id] : null;
    if (bond) bond.coachingSessions = (bond.coachingSessions || 0) + 1;

    const skKey = (g.AI && g.AI.pickTeachSkill) ? g.AI.pickTeachSkill(mentor, disciple) : 'SWORD';
    const teachMult = 1.8 + HC.eff(mentor, 'social.teaching') / 80 + (mentor.cult.path === disciple.cult.path ? 0.35 : 0.20);
    if (g.MARTIAL && g.MARTIAL.skillPractice) g.MARTIAL.skillPractice(disciple, skKey, 0.25, teachMult);
    else HC.practice(disciple, skKey, 0.25, teachMult);

    const th = CULT.threshold(disciple);
    const gainPts = Math.max(4, Math.round(th * 0.06));
    CULT.gain(disciple, gainPts, W, 'mentor_coaching');
    if (disciple.cult.learning && disciple.cult.learning.need > 0) {
      disciple.cult.learning.got = Math.min(disciple.cult.learning.need, (disciple.cult.learning.got || 0) + Math.max(6, Math.round(disciple.cult.learning.need * 0.12)));
    }
    disciple.h.state.heartDemon = Math.max(0, (disciple.h.state.heartDemon || 0) - 5);
    disciple.h.state.stress = Math.max(0, (disciple.h.state.stress || 0) - 6);
    if (g.STATS && g.STATS.applyNamedBuff) {
      g.STATS.applyNamedBuff(disciple, 'mentorGuidance', 120, W.t || 0, { casterId: mentor.id });
    }
    mentor.stats = mentor.stats || {};
    mentor.stats.taughtCount = (mentor.stats.taughtCount || 0) + 1;
    mentor.merit = (mentor.merit || 0) + 2;
    return { ok: true, skillTaught: skKey, cultGain: gainPts, bond };
  };

  MENTORSHIP.transmitQi = (W, mentorOrId, discipleOrId, opts) => {
    opts = opts || {};
    const ms = MENTORSHIP.ensure(W);
    const mentor = MENTORSHIP.resolveNpc(W, mentorOrId);
    let disciple = MENTORSHIP.resolveNpc(W, discipleOrId);
    if (!disciple && mentor && Array.isArray(mentor.apprenticeIds) && mentor.apprenticeIds.length) {
      disciple = MENTORSHIP.resolveNpc(W, mentor.apprenticeIds[0]);
    }
    if (!ms || !mentor || !disciple || mentor === disciple || disciple.dead || !mentor.cult || !disciple.cult) {
      return { ok: false, reason: 'invalid-participants' };
    }
    if (mentor.exiled || disciple.exiled || SECT.isNpcDetained(W, mentor) || SECT.isNpcDetained(W, disciple)) {
      return { ok: false, reason: 'participant-ineligible' };
    }
    if (mentor.dead && !opts.dyingWish) {
      return { ok: false, reason: 'mentor-dead' };
    }
    const isDirectPair = disciple.mentorId === mentor.id || (Array.isArray(mentor.apprenticeIds) && mentor.apprenticeIds.includes(disciple.id));
    if (!isDirectPair && !opts.dyingWish) {
      return { ok: false, reason: 'not-direct-disciple' };
    }
    if (disciple.mentorImprint && !opts.overwriteImprint && !opts.dyingWish) {
      return { ok: false, reason: 'already-received-transmission' };
    }
    if (mentor.qiTransmitted) return { ok: false, reason: 'already-transmitted' };
    const mEq = CULT.equivalentStage ? CULT.equivalentStage(mentor) : (mentor.cult.stage || 1);
    if (!opts.force && mEq < 4) return { ok: false, reason: 'mentor-stage-too-low' };

    mentor.qiTransmitted = true;
    const th = CULT.threshold(disciple);
    const surgePts = Math.max(25, Math.round(th * (0.55 + Math.min(0.35, mEq * 0.04))));
    disciple.cult.prog = (disciple.cult.prog || 0) + surgePts;

    // Pass down 1 of the mentor's mastered non-innate techniques if disciple does not yet know it
    let inheritedTechId = null;
    for (const tid of (mentor.cult.techs || [])) {
      const tObj = CULT.tech(tid);
      const isInnate = tObj && (tObj.innateOnly || (g.MARTIAL && g.MARTIAL.isInnateTech && g.MARTIAL.isInnateTech(tObj)));
      const pathOk = tObj && (!tObj.path || tObj.path === 'ANY' || tObj.path === disciple.cult.path);
      const subOk = tObj && (!CULT.isSubCompatible || CULT.isSubCompatible(tObj, disciple.cult.sub, false));
      const bushidoOk = disciple.cult.path !== 'SHADOW_SAMURAI' || (!tObj.weaponTypes || tObj.weaponTypes.includes('SWORD') || tObj.weaponTypes.includes('BLADE'));
      if (tObj && !isInnate && pathOk && subOk && bushidoOk && !disciple.cult.techs.includes(tid)) {
        disciple.cult.techs.push(tid);
        disciple.cult.tm = disciple.cult.tm || {};
        disciple.cult.tm[tid] = Math.max(disciple.cult.tm[tid] || 0, 35);
        inheritedTechId = tid;
        break;
      }
    }

    const imprint = {
      mentorId: mentor.id,
      mentorNameTh: HC.fullName(mentor),
      path: mentor.cult.path,
      sub: mentor.cult.sub || 'NONE',
      statBonusPct: +(0.06 + Math.min(0.06, mEq * 0.008)).toFixed(3),
      cultRateBonus: +(0.12 + Math.min(0.10, mEq * 0.012)).toFixed(3),
      btBonus: +(0.06 + Math.min(0.06, mEq * 0.008)).toFixed(3),
      inheritedTechId,
      grantedDay: W.day || 0
    };
    disciple.mentorImprint = imprint;
    disciple.h.state.heartDemon = 0;
    disciple.h.state.hp = CULT.hpMax(disciple);
    disciple.h.state.qi = CULT.qiMax(disciple);
    if (g.STATS && g.STATS.applyNamedBuff) {
      g.STATS.applyNamedBuff(disciple, 'mentorGuidance', 240, W.t || 0, { casterId: mentor.id });
      g.STATS.applyNamedBuff(disciple, 'meridianUnblock', 180, W.t || 0, { casterId: mentor.id });
      g.STATS.dirty(disciple);
    }

    if (!opts.dyingWish && !opts.preAscension && mentor.cult.stage > 1) {
      mentor.cult.prog = Math.max(0, (mentor.cult.prog || 0) * 0.4);
      if (g.STATS) g.STATS.dirty(mentor);
    }

    const rec = {
      id: 'QITRANS_' + (++ms.seq),
      day: W.day || 0,
      mentorId: mentor.id,
      mentorNameTh: HC.fullName(mentor),
      discipleId: disciple.id,
      discipleNameTh: HC.fullName(disciple),
      surgePts,
      inheritedTechId,
      imprint
    };
    ms.transmissions.unshift(rec);
    if (ms.transmissions.length > 30) ms.transmissions.length = 30;
    MENTORSHIP.recordHistory(W, 'transmission', mentor, disciple, {surgePts, inheritedTechId, occasion:opts.dyingWish ? 'dying' : opts.preAscension ? 'ascension' : 'normal'});
    if (!opts.quiet && W.log) {
      W.log('breakthrough', '✨ พิธีถ่ายทอดพลังตบะ:「' + HC.fullName(mentor) + '」ถ่ายทอดปราณบริสุทธิ์และเจตจำนงยุทธ์ให้ศิษย์สายตรง「' + HC.fullName(disciple) + '」(+ตบะ ' + surgePts + (inheritedTechId ? ' · สืบทอดวิชา ' + (CULT.tech(inheritedTechId)?.nameTh || inheritedTechId) : '') + ')', [mentor.id, disciple.id]);
    }
    return { ok: true, transmission: rec, imprint };
  };

  MENTORSHIP.synthesizeSectArt = (W, creatorOrId, opts) => {
    if (creatorOrId && typeof creatorOrId === 'object' && !creatorOrId.id && creatorOrId.creatorId) {
      opts = creatorOrId;
      creatorOrId = creatorOrId.creatorId;
    }
    opts = opts || {};
    const ms = MENTORSHIP.ensure(W);
    const creator = MENTORSHIP.resolveNpc(W, creatorOrId) || (W && W.byId && W.byId[W.sect.masterId]);
    if (!ms || !creator || creator.dead || !creator.cult) return { ok: false, reason: 'invalid-creator' };
    const eqSt = CULT.equivalentStage ? CULT.equivalentStage(creator) : (creator.cult.stage || 1);
    if (!opts.force && eqSt < 5 && (creator.rank || 0) < 4) {
      return { ok: false, reason: 'creator-stage-too-low' };
    }
    const seq = ++ms.seq;
    const id = opts.id || ('HERITAGE_SECT_ART_' + seq);
    const wType = (g.MARTIAL && g.MARTIAL.equippedType) ? g.MARTIAL.equippedType(creator) : 'SWORD';
    const validW = ['SWORD', 'BLADE', 'SPEAR', 'FIST', 'BOW', 'STAFF', 'FOCUS', 'ZITHER', 'BRUSH', 'WHIP'].includes(wType) ? wType : 'SWORD';
    const pathId = creator.cult.path || 'XIAN';
    const subId = creator.cult.sub || 'NONE';
    const el = (creator.h && creator.h.root && creator.h.root.primaryElement) || (CULT.PATHS[pathId] && CULT.PATHS[pathId].element) || 'LIGHT_YANG';
    const cleanEl = ['FIRE', 'WATER_ICE', 'LIGHTNING', 'EARTH_METAL', 'WOOD_LIFE', 'WIND', 'ASTRAL', 'YIN_SHADOW', 'LIGHT_YANG', 'BLOOD_DEMON'].includes(el) ? el : 'LIGHT_YANG';
    const tier = clamp(Math.round(eqSt), 4, 7);
    const sectShort = (W.sect && W.sect.name) ? W.sect.name.replace(/^สำนัก/, '') : 'เจียงหู';
    const wNameTh = (JD.MARTIAL && JD.MARTIAL.types && JD.MARTIAL.types[validW]) || 'ยุทธ์';
    const nameTh = opts.nameTh || ('คัมภีร์มรดก' + sectShort + '·เพลง' + wNameTh + 'สืบทอดเจตจำนง');
    const arch = pathId === 'STRATEGY_GOVERNANCE' ? 'command'
      : pathId === 'SAGE_SUPPORT' ? 'harmonize'
      : pathId === 'KARMA_SAMSARA' ? 'karmaReversal'
      : pathId === 'BEAST_SOVEREIGN' ? 'blink'
      : 'burst';

    const heritageTech = {
      id,
      nameTh,
      cat: 'COMBAT_TECHNIQUE',
      role: 'ACTIVE',
      combatArch: arch,
      path: pathId,
      sub: null,
      preferredSubs: subId !== 'NONE' ? [subId] : [],
      compatiblePaths: [pathId, 'ANY'],
      tier,
      reqTier: 1,
      grade: tier >= 6 ? 'Legendary' : 'Exceptional',
      legendary: tier >= 7,
      isSectHeritage: true,
      creatorId: creator.id,
      creatorNameTh: HC.fullName(creator),
      createdDay: W.day || 0,
      power: tier * 68 + 40,
      element: cleanEl,
      elementalRole: 'ELEMENTAL',
      elementProfile: { mode: 'INTRINSIC_SINGLE', primary: cleanEl, weights: { [cleanEl]: 1 } },
      weaponTypes: [validW, 'FOCUS'],
      armorTypes: ['ROBE', 'LIGHT', 'HEAVY'],
      requiresWeapon: false,
      grantBuff: arch === 'command' ? 'tacticalCommand' : arch === 'harmonize' ? 'vitalRegen' : arch === 'blink' ? 'astralMirage' : 'fervorMight',
      stages: [
        { stage: 1, id: id + '_S1', nameTh: 'ขั้นต้น • ' + nameTh, reqMastery: 0, reqCultStage: Math.max(1, tier - 2), unlockMoveId: id + '_M1' },
        { stage: 2, id: id + '_S2', nameTh: 'ขั้นสำเร็จ • ' + nameTh, reqMastery: 45, reqCultStage: Math.max(2, tier - 1), unlockMoveId: id + '_M2' }
      ],
      moveDefs: [
        {
          id: id + '_M1',
          parentId: id,
          stageReq: 1,
          reqMastery: 0,
          nameTh: 'ปฐมบทมรดก · ' + nameTh,
          arch,
          type: pathId === 'BODY' ? 'p' : 'm',
          M: +(1.65 + tier * 0.12).toFixed(2),
          hits: 2,
          cd: 12,
          wind: 3,
          costPct: 6.5,
          pen: 20,
          heal: arch === 'harmonize' ? 0.22 : 0,
          shield: (arch === 'command' || arch === 'blink') ? 0.18 : 0,
          grantBuff: arch === 'command' ? 'tacticalCommand' : arch === 'harmonize' ? 'vitalRegen' : arch === 'blink' ? 'astralMirage' : 'fervorMight',
          team: arch === 'command' || arch === 'harmonize',
          aiRole: 'core'
        },
        {
          id: id + '_M2',
          parentId: id,
          stageReq: 2,
          reqMastery: 45,
          nameTh: 'ปัจฉิมบทสืบทอด · ' + nameTh,
          arch,
          type: pathId === 'BODY' ? 'p' : 'm',
          M: +(2.15 + tier * 0.15).toFixed(2),
          hits: 3,
          cd: 18,
          wind: 3,
          costPct: 9.5,
          pen: 28,
          aoe: true,
          heal: arch === 'harmonize' ? 0.28 : 0,
          shield: 0.20,
          grantBuff: arch === 'command' ? 'tacticalCommand' : arch === 'harmonize' ? 'clarityLotus' : arch === 'blink' ? 'astralMirage' : 'fervorMight',
          team: arch === 'command' || arch === 'harmonize',
          aiRole: 'finisher'
        }
      ],
      moves: ['ปฐมบทมรดก · ' + nameTh, 'ปัจฉิมบทสืบทอด · ' + nameTh],
      descTh: 'คัมภีร์วิชาประจำสำนักที่บัญญัติขึ้นโดย「' + HC.fullName(creator) + '」ศิษย์ทุกวิถีในสำนักสามารถศึกษาได้เร็วขึ้น +25% พร้อมรับเจตจำนงยุทธ์ของปรมาจารย์ผู้ก่อตั้ง'
    };

    if (CULT && CULT.registerDynamicTech) CULT.registerDynamicTech(heritageTech);
    ms.heritageArts.push(heritageTech);
    if (!W.sect.library.includes(id)) W.sect.library.push(id);
    if (!creator.cult.techs.includes(id)) creator.cult.techs.push(id);
    creator.cult.tm = creator.cult.tm || {};
    creator.cult.tm[id] = 100;
    W.fame(12);
    if (g.COG && g.COG.recordAspirationMilestone) {
      g.COG.recordAspirationMilestone(W, creator, 'บัญญัติคัมภีร์ประจำสำนัก「' + nameTh + '」', 20);
    }
    if (!opts.quiet && W.log) {
      W.log('research', '📜「' + HC.fullName(creator) + '」ผสานความเข้าใจยุทธ์บัญญัติคัมภีร์ประจำสำนักเล่มใหม่:「' + nameTh + '」ประดิษฐานไว้ในหอคัมภีร์!', [creator.id]);
    }
    return { ok: true, tech: heritageTech, art: heritageTech };
  };

  MENTORSHIP.daily = W => {
    const ms = MENTORSHIP.ensure(W);
    if (!ms || !Array.isArray(W.npcs)) return;
    // Automatically pair unbonded promising juniors with available elders every 5 days
    if ((W.day || 0) % 5 === 0) {
      const elders = W.npcs.filter(n => n && !n.dead && !n.away && !n.exiled && n.cult && ((n.rank || 0) >= 3 || (CULT.equivalentStage ? CULT.equivalentStage(n) : n.cult.stage) >= 4) && (!Array.isArray(n.apprenticeIds) || n.apprenticeIds.length < MENTORSHIP.MAX_APPRENTICES));
      const juniors = W.npcs.filter(n => n && !n.dead && !n.away && !n.exiled && n.cult && !n.mentorId && (n.rank || 0) <= 2);
      if (elders.length && juniors.length) {
        const mentor = elders[0];
        const disc = juniors.find(j => j.cult.path === mentor.cult.path) || juniors[0];
        if (mentor && disc) MENTORSHIP.formBond(W, mentor, disc);
      }
    }
  };
  SECT.MENTORSHIP = MENTORSHIP;

  /* ======================= v2.0.16 Pillar C: Living Jianghu, Rumor Tavern & Karma/Nemesis Web ======================= */
  const JIANGHU = {
    MAX_RUMORS: 6,
    MAX_BONDS: 32
  };
  const RUMOR_ARCHETYPES = [
    { kind: 'MIRAGE_SANCTUM', titleTh: 'แดนลับมายาโบราณเปิดผนึกชั่วคราว', regionId: 'ruins', stones: 220, cp: 45, insight: 28, matId: 'MAT_ZITHER_PHOENIX_HEARTWOOD_5', descTh: 'ค่ายกลพรางตาพันปีคลายตัวออก เผยให้เห็นแท่นศิลาและสมุนไพรวิญญาณ' },
    { kind: 'WANDERING_GRANDMASTER', titleTh: 'ปรมาจารย์เร้นกายเปิดศาลาชี้แนะยุทธ์ ณ โรงเตี๊ยมเมฆา', regionId: 'plains', stones: 140, cp: 55, insight: 42, matId: 'MAT_BRUSH_DRAGON_WHISKER_JADE_5', descTh: 'ยอดฝีมืออาวุโสแวะพักดื่มสุราและเปิดโอกาสให้ผู้รุ่นหลังซักถามข้อติดขัดทางยุทธ์' },
    { kind: 'ESCORT_COMMISSION', titleTh: 'ขบวนคุ้มกันพันธมิตรขอความช่วยเหลือด่วน', regionId: 'mountain', stones: 280, cp: 65, insight: 22, matId: 'MAT_WHIP_KARMIC_RED_SILK_5', descTh: 'กองคาราวานสำนักพันธมิตรถูกล้อมในช่องเขา ผู้ยื่นมือช่วยจะได้รับน้ำใจไมตรีและรางวัลงาม' },
    { kind: 'TREASURE_AUCTION', titleTh: 'งานประมูลลับโรงเตี๊ยมยุทธภพแดนใต้', regionId: 'water', stones: 190, cp: 40, insight: 24, matId: 'MAT_ORE_METEOR_IRON_5', descTh: 'วาณิชพเนจรนำวัตถุดิบหลอมศาสตราและข่าวกรองแดนลับมาแลกเปลี่ยน' },
    { kind: 'NEMESIS_INTEL', titleTh: 'เบาะแสความเคลื่อนไหวของยอดฝีมือคู่ปรับในยุทธภพ', regionId: 'forest', stones: 240, cp: 60, insight: 34, matId: 'MAT_HERB_SNOW_LOTUS_5', descTh: 'สายข่าวโรงเตี๊ยมรายงานตำแหน่งของคู่ปรับยุทธภพที่กำลังฝึกวิชาอยู่ในป่าลึก' }
  ];

  JIANGHU.ensure = W => {
    if (!W || !W.world) return null;
    if (!W.world.jianghu || typeof W.world.jianghu !== 'object') {
      W.world.jianghu = { rumors: [], karmaBonds: {}, encounters: [], history: [], seq: 0, lastRefreshDay: -99 };
    }
    const jh = W.world.jianghu;
    if (!Array.isArray(jh.rumors)) jh.rumors = [];
    if (!jh.karmaBonds || typeof jh.karmaBonds !== 'object') jh.karmaBonds = {};
    if (!Array.isArray(jh.encounters)) jh.encounters = [];
    if (!Array.isArray(jh.history)) jh.history = [];
    if (!Number.isFinite(jh.seq) || jh.seq < 0) jh.seq = 0;
    return jh;
  };

  JIANGHU.generateDailyRumors = (W, count) => JIANGHU.refreshTavernRumors(W, { count: count || 3 });
  JIANGHU.refreshTavernRumors = (W, opts) => {
    opts = opts || {};
    const jh = JIANGHU.ensure(W);
    if (!jh) return [];
    jh.rumors = jh.rumors.filter(r => r && r.status === 'active' && (r.expiresDay == null || r.expiresDay >= (W.day || 0)));
    const countToGen = opts.count || Math.max(1, 3 - jh.rumors.length);
    const created = [];
    for (let i = 0; i < countToGen && jh.rumors.length < JIANGHU.MAX_RUMORS; i++) {
      const spec = RUMOR_ARCHETYPES[(jh.seq + i) % RUMOR_ARCHETYPES.length];
      const id = 'RUMOR_' + (++jh.seq);
      const rObj = {
        id,
        kind: spec.kind,
        titleTh: spec.titleTh,
        descTh: spec.descTh,
        regionId: spec.regionId,
        createdDay: W.day || 0,
        expiresDay: (W.day || 0) + 14,
        status: 'active',
        rewards: { stones: spec.stones, cp: spec.cp, insight: spec.insight, matId: spec.matId }
      };
      jh.rumors.push(rObj);
      created.push(rObj);
    }
    jh.lastRefreshDay = W.day || 0;
    return created;
  };

  JIANGHU.recordKarmaBond = (W, npcOrId, kind, opts) => {
    opts = opts || {};
    const jh = JIANGHU.ensure(W);
    const npc = MENTORSHIP.resolveNpc(W, npcOrId) || (W && W.npcs && W.npcs[0]);
    if (!jh || !npc) return null;
    const validKind = ['SWORN_ALLY', 'BENEFACTOR', 'RIVAL', 'NEMESIS'].includes(kind) ? kind : 'SWORN_ALLY';
    const rivalSects = (W.world && Array.isArray(W.world.sects) && W.world.sects.length) ? W.world.sects : [{ id: 'ext_sect_1', nameTh: 'สำนักเมฆาคราม', shortTh: 'เมฆาคราม', majorPath: 'XIAN' }];
    const extSect = opts.sect || rivalSects[jh.seq % rivalSects.length];
    const wTypes = ['SWORD', 'BLADE', 'SPEAR', 'FIST', 'BOW', 'STAFF', 'FOCUS', 'ZITHER', 'BRUSH', 'WHIP'];
    const weaponType = opts.weaponType || wTypes[(jh.seq * 3) % wTypes.length];
    const eqSt = CULT.equivalentStage ? CULT.equivalentStage(npc) : (npc.cult ? npc.cult.stage : 3);
    const bondId = opts.id || ('KBOND_' + (++jh.seq));
    const figureNameTh = opts.nameTh || ((validKind === 'NEMESIS' || validKind === 'RIVAL' ? 'จอมยุทธ์อริ ' : 'สหายยุทธภพ ') + (extSect.shortTh || extSect.nameTh || 'พเนจร') + ' #' + jh.seq);

    const bond = {
      id: bondId,
      npcId: npc.id,
      npcNameTh: HC.fullName(npc),
      kind: validKind,
      figureNameTh,
      sectId: extSect.id,
      sectNameTh: extSect.nameTh || extSect.shortTh || 'สำนักยุทธภพ',
      path: opts.path || extSect.majorPath || 'XIAN',
      weaponType,
      stage: Math.max(2, Math.round(eqSt)),
      power: Math.round(CULT.power(npc) * (validKind === 'NEMESIS' ? 1.05 : 0.95)),
      affinity: (validKind === 'SWORN_ALLY' || validKind === 'BENEFACTOR') ? (opts.affinity || 75) : 15,
      grudge: (validKind === 'NEMESIS' || validKind === 'RIVAL') ? (opts.grudge || 75) : 0,
      createdDay: W.day || 0,
      resolved: false
    };
    jh.karmaBonds[bondId] = bond;
    npc.karmaBonds = Array.isArray(npc.karmaBonds) ? npc.karmaBonds : [];
    if (!npc.karmaBonds.includes(bondId)) npc.karmaBonds.push(bondId);
    if (!opts.quiet && W.log) {
      const icon = (validKind === 'SWORN_ALLY' || validKind === 'BENEFACTOR') ? '🍶' : '⚔️';
      const label = validKind === 'SWORN_ALLY' ? 'ร่วมดื่มสุราสาบานเป็นสหายร่วมเป็นตายกับ' : validKind === 'BENEFACTOR' ? 'ผูกบุญคุณไมตรีกับ' : validKind === 'RIVAL' ? 'ประมือผูกสัญญาคู่ปรับยุทธภพกับ' : 'ผูกหนี้แค้นคู่อาฆาตกับ';
      W.log('relation', icon + ' โครงข่ายกรรมยุทธภพ:「' + HC.fullName(npc) + '」' + label + '「' + figureNameTh + '」(' + bond.sectNameTh + ')', [npc.id]);
    }
    return bond;
  };

  JIANGHU.investigateRumor = (W, actorOrParty, rumorId) => {
    const jh = JIANGHU.ensure(W);
    if (!jh) return { ok: false, reason: 'no-jianghu' };
    if (!jh.rumors.length) JIANGHU.refreshTavernRumors(W, { count: 3 });
    const rumor = rumorId ? jh.rumors.find(r => r.id === rumorId) : jh.rumors.find(r => r.status === 'active');
    if (!rumor || rumor.status !== 'active') return { ok: false, reason: 'rumor-not-available' };

    const party = Array.isArray(actorOrParty) ? actorOrParty.filter(n => n && !n.dead) : [MENTORSHIP.resolveNpc(W, actorOrParty) || W.npcs.find(n => n && !n.dead)];
    const leader = party[0];
    if (!leader) return { ok: false, reason: 'no-leader' };

    rumor.status = 'resolved';
    rumor.resolvedBy = leader.id;
    rumor.resolvedDay = W.day || 0;
    const rw = rumor.rewards || { stones: 180, cp: 45, insight: 25, matId: 'MAT_ORE_METEOR_IRON_5' };

    if (ECO && ECO.earn) ECO.earn(W, rw.stones, 'สำรวจข่าวลือโรงเตี๊ยม: ' + rumor.titleTh);
    if (rw.matId && ECO && ECO.add) ECO.add(W, rw.matId, 2);
    for (const m of party) {
      if (g.CPE && g.CPE.mint) g.CPE.mint(W, m, rw.cp, 'คลี่คลายข่าวลือยุทธภพ', true);
      else m.cp = (m.cp || 0) + rw.cp;
      if (m.cult) CULT.gain(m, rw.insight, W, 'jianghu_rumor');
    }

    const bondKind = rumor.kind === 'NEMESIS_INTEL' ? 'NEMESIS' : rumor.kind === 'ESCORT_COMMISSION' ? 'SWORN_ALLY' : 'BENEFACTOR';
    const bond = JIANGHU.recordKarmaBond(W, leader, bondKind, { quiet: true });
    const rec = {
      id: 'JH_ENC_' + (++jh.seq),
      day: W.day || 0,
      rumorId: rumor.id,
      kind: rumor.kind,
      titleTh: rumor.titleTh,
      leaderId: leader.id,
      leaderNameTh: HC.fullName(leader),
      rewards: rw,
      bondId: bond ? bond.id : null
    };
    jh.encounters.unshift(rec);
    jh.history.unshift(rec);
    if (jh.history.length > 30) jh.history.length = 30;
    if (W.log) {
      W.log('explore', '🏮 โรงเตี๊ยมข่าวลือ:「' + HC.fullName(leader) + '」ออกสืบ「' + rumor.titleTh + '」สำเร็จ ได้รับ ' + rw.stones + ' ศิลา, +' + rw.cp + ' คป. และวัตถุดิบหายาก!', [leader.id]);
    }
    return { ok: true, rumor, encounter: rec, bond };
  };

  JIANGHU.triggerAllyAid = (W, bondOrId) => {
    const jh = JIANGHU.ensure(W);
    if (!jh) return { ok: false, reason: 'no-jianghu' };
    const bond = typeof bondOrId === 'string' ? jh.karmaBonds[bondOrId] : (bondOrId || Object.values(jh.karmaBonds).find(b => b && (b.kind === 'SWORN_ALLY' || b.kind === 'BENEFACTOR')));
    if (!bond) return { ok: false, reason: 'no-ally-bond' };
    const npc = W.byId && W.byId[bond.npcId];
    const giftStones = 160;
    const matPool = ['MAT_ZITHER_PHOENIX_HEARTWOOD_5', 'MAT_BRUSH_DRAGON_WHISKER_JADE_5', 'MAT_WHIP_KARMIC_RED_SILK_5', 'MAT_ORE_METEOR_IRON_5'];
    const matId = matPool[jh.seq % matPool.length];
    if (ECO && ECO.earn) ECO.earn(W, giftStones, 'ของขวัญไมตรีจากสหายยุทธภพ ' + bond.figureNameTh);
    if (ECO && ECO.add) ECO.add(W, matId, 2);
    if (npc && !npc.dead) {
      if (g.STATS && g.STATS.applyNamedBuff) g.STATS.applyNamedBuff(npc, 'fervorMight', 90, W.t || 0);
      CULT.gain(npc, 18, W, 'sworn_ally_aid');
    }
    bond.lastAidDay = W.day || 0;
    if (W.log) {
      W.log('relation', '🍶 สหายร่วมสาบาน「' + bond.figureNameTh + '」ส่งศิลาวิญญาณ ' + giftStones + ' ก้อนและวัตถุดิบวิญญาณมาหนุนช่วย「' + (npc ? HC.fullName(npc) : bond.npcNameTh) + '」!', npc ? [npc.id] : []);
    }
    return { ok: true, bond, giftStones, matId };
  };

  JIANGHU.triggerNemesisChallenge = (W, bondOrId, opts) => {
    opts = opts || {};
    const jh = JIANGHU.ensure(W);
    if (!jh) return { ok: false, reason: 'no-jianghu' };
    const bond = typeof bondOrId === 'string' ? jh.karmaBonds[bondOrId] : (bondOrId || Object.values(jh.karmaBonds).find(b => b && (b.kind === 'NEMESIS' || b.kind === 'RIVAL') && !b.resolved));
    if (!bond) return { ok: false, reason: 'no-nemesis-bond' };
    const defender = (W.byId && W.byId[bond.npcId] && !W.byId[bond.npcId].dead) ? W.byId[bond.npcId] : W.npcs.find(n => n && !n.dead && n.cult);
    if (!defender) return { ok: false, reason: 'no-defender' };

    const challenger = {
      id: 'NEM_' + bond.id,
      isGuest: true,
      name: bond.figureNameTh,
      nameTh: bond.figureNameTh,
      h: { name: { given: bond.figureNameTh, family: '' }, state: { hp: 1200, satiety: 100, rest: 100, energy: 100 }, skills: { [bond.weaponType || 'SWORD']: bond.stage * 14 }, personality: { courage: 75, aggression: 75, caution: 30 }, values: { martialPeak: 85 }, root: { primaryElement: 'FIRE', elements: ['FIRE'], weights: { FIRE: 1 } } },
      cult: { path: bond.path || 'XIAN', stage: bond.stage || 4, sub: 'NONE', techs: [] },
      equip: { WEAPON: { slot: 'WEAPON', gearType: bond.weaponType || 'SWORD', tier: Math.min(7, Math.max(3, bond.stage || 4)), nameTh: bond.weaponType || 'SWORD' } },
      power: opts.forceWin ? Math.max(10, CULT.power(defender) * 0.65) : (bond.power || CULT.power(defender))
    };

    const bout = SECT.simulateAssemblyBout ? SECT.simulateAssemblyBout(W, defender, challenger) : { winner: defender, loser: challenger };
    const won = opts.forceWin === true ? true : opts.forceWin === false ? false : !!(bout.winner && bout.winner.id === defender.id);
    let convertedToAlly = false;
    if (won) {
      bond.grudge = Math.max(0, (bond.grudge || 75) - 55);
      if (bond.grudge <= 20) {
        bond.resolved = true;
        if (opts.convertToAlly || HC.eff(defender, 'social.charisma') >= 52 || HC.eff(defender, 'personality.integrity') >= 52) {
          bond.kind = 'SWORN_ALLY';
          bond.affinity = Math.max(bond.affinity || 0, 78);
          bond.grudge = 0;
          convertedToAlly = true;
        }
      }
      W.fame(10);
      if (ECO && ECO.earn) ECO.earn(W, 200, 'ชนะศึกท้าดวลหน้าประตูสำนักเหนือ ' + bond.figureNameTh);
      if (g.CPE && g.CPE.mint) g.CPE.mint(W, defender, 60, 'ปราบคู่อาฆาตหน้าประตูสำนัก', true);
      else defender.cp = (defender.cp || 0) + 60;
      CULT.gain(defender, 28, W, 'nemesis_victory');
      if (W.log) {
        W.log('challenge', '⚔️ ศึกชี้ชะตาหน้าประตูสำนัก:「' + HC.fullName(defender) + '」ประลองยุทธ์เอาชนะคู่อาฆาต「' + bond.figureNameTh + '」สะสางหนี้แค้นและประกาศศักดาสำนัก!', [defender.id]);
      }
    } else {
      bond.grudge = clamp((bond.grudge || 75) + 10, 0, 100);
      defender.h.state.stress = clamp((defender.h.state.stress || 0) + 8, 0, 100);
      CULT.gain(defender, 12, W, 'nemesis_lesson');
      if (W.log) {
        W.log('challenge', '⚔️「' + HC.fullName(defender) + '」รับคำท้าดวลจาก「' + bond.figureNameTh + '」หน้าประตูสำนักและพ่ายแพ้ไปอย่างสูสี ฮึดสู้มุ่งมั่นฝึกปรือฝีมือใหม่', [defender.id]);
      }
    }
    return { ok: true, won, convertedToAlly, defenderId: defender.id, challengerNameTh: bond.figureNameTh, bond };
  };

  JIANGHU.daily = W => {
    const jh = JIANGHU.ensure(W);
    if (!jh) return;
    if ((W.day || 0) - (jh.lastRefreshDay || -99) >= 4 || jh.rumors.filter(r => r.status === 'active').length === 0) {
      JIANGHU.refreshTavernRumors(W, { count: 3 });
    }
    if ((W.day || 0) > 0 && (W.day || 0) % 9 === 0 && W.npcs && W.npcs.length) {
      const activeRumors = jh.rumors.filter(r => r.status === 'active');
      if (activeRumors.length && W.rng && W.rng.chance(0.45)) {
        const scout = W.npcs.find(n => n && !n.dead && !n.away && !n.exiled && n.cult && (n.rank || 0) >= 1);
        if (scout) JIANGHU.investigateRumor(W, scout, activeRumors[0].id);
      }
    }
  };
  SECT.JIANGHU = JIANGHU;

  /* ============================================================================
   * PATCH v2.0.19: 6-TIER SECT HIERARCHY, 3 IDEOLOGICAL ALIGNMENTS,
   * SPECIALIZED OFFICER JURISDICTIONS & INTERNAL SECT POLITICS (คลื่นใต้น้ำ)
   * ============================================================================ */
  SECT.SECT_TIERS = Object.freeze({
    SMALL:       { id: 'SMALL',       tierLevel: 1, nameTh: 'สำนักเล็ก',           badgeTh: 'ระดับ 1 · สำนักเล็ก',           minScore: 0,    stipendBonus: 1.00, maxOffices: 11, descTh: 'สำนักก่อตั้งใหม่ในยุทธภพ กำลังคนและชื่อเสียงยังน้อย ต้องสั่งสมรากฐานเพื่อก้าวขึ้นสู่สำนักทั่วไป' },
    STANDARD:    { id: 'STANDARD',    tierLevel: 2, nameTh: 'สำนักทั่วไป',         badgeTh: 'ระดับ 2 · สำนักทั่วไป/มาตรฐาน', minScore: 160,  stipendBonus: 1.08, maxOffices: 17, descTh: 'สำนักมาตรฐานที่มีรากฐานมั่นคงในภูมิภาค เริ่มเปิดตำแหน่งบริหารเฉพาะทางและมีชื่อเสียงในยุทธภพ' },
    LARGE:       { id: 'LARGE',       tierLevel: 3, nameTh: 'สำนักใหญ่',           badgeTh: 'ระดับ 3 · สำนักใหญ่',           minScore: 360,  stipendBonus: 1.16, maxOffices: 19, descTh: 'สำนักใหญ่ที่มีผู้อาวุโสขั้นสูง อาคารสถานที่พัฒนาแล้ว และมีอิทธิพลเหนือสำนักเล็กในแถบใกล้เคียง' },
    LEADING:     { id: 'LEADING',     tierLevel: 4, nameTh: 'สำนักชั้นนำ',         badgeTh: 'ระดับ 4 · สำนักชั้นนำ',         minScore: 680,  stipendBonus: 1.25, maxOffices: 21, descTh: 'สำนักชั้นนำระดับแถวหน้าของแผ่นดิน ครอบครองคัมภีร์มรดก ศาสตราชั้นเลิศ และสำนักบริวาร' },
    HEGEMON:     { id: 'HEGEMON',     tierLevel: 5, nameTh: 'สำนักมหาอำนาจ',       badgeTh: 'ระดับ 5 · สำนักมหาอำนาจ',       minScore: 1150, stipendBonus: 1.38, maxOffices: 21, descTh: 'มหาอำนาจผู้กุมชะตายุทธภพ มีเทพอสูร 4 ทิศ จุดยุทธศาสตร์ และสำนักบริวารสวามิภักดิ์หลายแห่ง' },
    SACRED_LAND: { id: 'SACRED_LAND', tierLevel: 6, nameTh: 'แดนศักดิ์สิทธิ์',     badgeTh: 'ระดับ 6 · แดนศักดิ์สิทธิ์',     minScore: 1800, stipendBonus: 1.55, maxOffices: 21, descTh: 'จุดสูงสุดแห่งยุทธภพและผู้นำสูงสุดของสมาพันธ์ธรรมะหรือภาคีอธรรม (สำนักสายกลางจะไม่มีระดับผู้นำสูงสุดนี้)' }
  });
  SECT.SECT_TIER_ORDER = Object.freeze(['SMALL', 'STANDARD', 'LARGE', 'LEADING', 'HEGEMON', 'SACRED_LAND']);

  SECT.ALIGNMENTS = Object.freeze({
    NEUTRAL: {
      id: 'NEUTRAL',
      nameTh: 'สายกลาง',
      fullTh: 'สำนักสายกลาง (อิสระ)',
      icon: '☯️',
      hasSupremeLeader: false,
      maxTierId: 'HEGEMON',
      descTh: 'ยึดมั่นความเป็นอิสระ การค้า ปัญญา และการพึ่งพาตนเอง ไม่ขึ้นต่อสมาพันธ์ใด (สายกลางไม่มีสำนักระดับผู้นำสูงสุด/แดนศักดิ์สิทธิ์)'
    },
    RIGHTEOUS: {
      id: 'RIGHTEOUS',
      nameTh: 'ฝ่ายธรรมะ',
      fullTh: 'วิถีธรรมะ (สมาพันธ์คุณธรรม)',
      icon: '☀️',
      hasSupremeLeader: true,
      supremeLeaderFactionId: 'FAC_CELESTIAL_SWORD_SACRED',
      maxTierId: 'SACRED_LAND',
      descTh: 'ผดุงคุณธรรม รักษากฎเกณฑ์ยุทธภพ ร่วมมือกับพันธมิตรธรรมะ และเป็นปรปักษ์โดยตรงกับฝ่ายอธรรม'
    },
    DEMONIC: {
      id: 'DEMONIC',
      nameTh: 'ฝ่ายอธรรม',
      fullTh: 'วิถีอธรรม (ภาคีมารครองภพ)',
      icon: '🩸',
      hasSupremeLeader: true,
      supremeLeaderFactionId: 'FAC_NETHER_BLOOD_SACRED',
      maxTierId: 'SACRED_LAND',
      descTh: 'ถือคติผู้แข็งแกร่งกลืนกินผู้อ่อนแอ ช่วงชิงทรัพยากร สยบสำนักอื่นด้วยกำลัง และเปิดศึกกับฝ่ายธรรมะ'
    }
  });

  SECT.CLIQUE_DEFS = Object.freeze({
    HAWK_MARTIAL: {
      id: 'HAWK_MARTIAL',
      nameTh: 'ก๊กเหยี่ยวพิชิตศึก',
      shortTh: 'ก๊กเหยี่ยว',
      icon: '🦅',
      preferredPosts: ['commander', 'martial', 'guard', 'wildwarden', 'beastmaster'],
      agendaTh: 'ผลักดันการฝึกยุทธ์ กรีฑาทัพตีค่ายสำนักอริ และแต่งตั้งผู้มีกำลังรบสูงสู่ตำแหน่งหลัก'
    },
    ORTHODOX_TRADITION: {
      id: 'ORTHODOX_TRADITION',
      nameTh: 'ก๊กจารีตอนุรักษ์',
      shortTh: 'ก๊กจารีต',
      icon: '⚖️',
      preferredPosts: ['discipline', 'censor', 'registry', 'arraymaster', 'disciples'],
      agendaTh: 'รักษากฎระเบียบสำนักอย่างเคร่งครัด เชิดชูอาวุโส และต่อต้านการแต่งตั้งคนนอกสาย'
    },
    PRAGMATIC_COMMERCE: {
      id: 'PRAGMATIC_COMMERCE',
      nameTh: 'ก๊กวาณิชย์ผลประโยชน์',
      shortTh: 'ก๊กวาณิชย์',
      icon: '🪙',
      preferredPosts: ['treasury', 'quartermaster', 'envoy', 'mission', 'steward', 'forge'],
      agendaTh: 'มุ่งเน้นความมั่งคั่ง การค้าเสรี การเก็บเกี่ยวบรรณาการสำนักบริวาร และการสะสมทรัพยากร'
    },
    BENEVOLENT_SAGE: {
      id: 'BENEVOLENT_SAGE',
      nameTh: 'ก๊กเมตตาบำเพ็ญพรต',
      shortTh: 'ก๊กเมตตา',
      icon: '🪷',
      preferredPosts: ['alchemy', 'healer', 'scripture', 'herbal', 'provision', 'spymaster'],
      agendaTh: 'เน้นการวิจัยคัมภีร์ ปรุงโอสถดูแลสวัสดิการศิษย์ และดำเนินนโยบายการทูตสายประนีประนอม'
    }
  });
  SECT.CLIQUE_IDS = Object.freeze(['HAWK_MARTIAL', 'ORTHODOX_TRADITION', 'PRAGMATIC_COMMERCE', 'BENEVOLENT_SAGE']);

  SECT.ensureHierarchyAndPolitics = W => {
    if (!W || !W.sect) return null;
    const S = W.sect;
    if (!S.sectTier || !SECT.SECT_TIERS[S.sectTier]) S.sectTier = 'SMALL';
    const tDef = SECT.SECT_TIERS[S.sectTier];
    if (!Number.isFinite(S.tierLevel)) S.tierLevel = tDef.tierLevel;
    if (!S.tierNameTh) S.tierNameTh = tDef.nameTh;
    if (!S.tierBadgeTh) S.tierBadgeTh = tDef.badgeTh;
    if (!Number.isFinite(S.tierScore)) S.tierScore = 60;
    if (!S.alignment || !SECT.ALIGNMENTS[S.alignment]) S.alignment = 'NEUTRAL';
    if (!S.alignmentLabelTh) S.alignmentLabelTh = SECT.ALIGNMENTS[S.alignment].nameTh;
    if (!Number.isFinite(S.alignmentScore)) S.alignmentScore = 0; // -100 (Demonic) .. +100 (Righteous)
    if (!Number.isFinite(S.alignmentDeedScore)) S.alignmentDeedScore = 0;
    if (!Number.isFinite(S.arrayIntegrity)) S.arrayIntegrity = 85;
    if (!S.doctrineMode) S.doctrineMode = 'ECLECTIC';

    if (!S.internalPolitics || typeof S.internalPolitics !== 'object') {
      S.internalPolitics = {
        undercurrent: 8,
        undercurrentStage: 'CALM',
        undercurrentLabelTh: 'คลื่นลมสงบ',
        efficiencyMultiplier: 1.0,
        cliques: {
          HAWK_MARTIAL: { id: 'HAWK_MARTIAL', nameTh: 'ก๊กเหยี่ยวพิชิตศึก', leaderId: null, memberIds: [], influence: 25, satisfaction: 65 },
          ORTHODOX_TRADITION: { id: 'ORTHODOX_TRADITION', nameTh: 'ก๊กจารีตอนุรักษ์', leaderId: null, memberIds: [], influence: 25, satisfaction: 65 },
          PRAGMATIC_COMMERCE: { id: 'PRAGMATIC_COMMERCE', nameTh: 'ก๊กวาณิชย์ผลประโยชน์', leaderId: null, memberIds: [], influence: 25, satisfaction: 65 },
          BENEVOLENT_SAGE: { id: 'BENEVOLENT_SAGE', nameTh: 'ก๊กเมตตาบำเพ็ญพรต', leaderId: null, memberIds: [], influence: 25, satisfaction: 65 }
        },
        nominations: [],
        history: [],
        seq: 0
      };
    }
    return S.internalPolitics;
  };

  // Pure calculation of Player Sect Tier (1..6) — only mutates W.sect if opts.readOnly !== true
  SECT.evaluateSectTier = (W, opts) => {
    opts = opts || {};
    if (!W || !W.sect) return null;
    const S = W.sect;
    const alive = (W.npcs || []).filter(n => n && !n.dead && !n.exiled);
    const pop = alive.length;
    const elders = alive.filter(n => (n.rank || 0) >= 3).length;
    const master = W.byId && S.masterId ? W.byId[S.masterId] : null;
    const masterStage = (master && master.cult) ? (CULT.equivalentStage ? CULT.equivalentStage(master) : master.cult.stage) : 2;
    const maxStage = alive.reduce((mx, n) => Math.max(mx, n.cult ? (CULT.equivalentStage ? CULT.equivalentStage(n) : n.cult.stage) : 0), masterStage);
    // Read power through its cache validation; _cs.rating may be stale after
    // time, HP, equipment or save/load changes.
    const totalPower = alive.reduce((sum, n) => {
      // Cached ratings intentionally tolerate small HP/energy changes for a
      // few ticks. Daily tier scoring must not depend on when a cache was
      // populated, particularly after loading a save that drops caches.
      n._cs = null;
      return sum + (CULT.power ? CULT.power(n) : 50);
    }, 0);

    // At initial founding (3 members, fame 12, no building upgrades, no vassals/nodes), score is ~75 (< 160) -> Tier 1 SMALL (สำนักเล็ก)
    const popPts = Math.max(0, (pop - 3) * 10) + Math.max(0, (elders - 1) * 16);
    const stagePts = Math.max(0, Math.floor(masterStage - 3) * 32) + Math.max(0, Math.floor(maxStage - 3) * 28);
    const powerPts = Math.max(0, Math.round((totalPower - 950) / 42));
    const famePts = Math.max(0, Math.round(((S.fame || 12) - 12) * 1.8));
    const bldUpgrades = (W.map && Array.isArray(W.map.buildings))
      ? W.map.buildings.reduce((sum, b) => sum + Math.max(0, (b.level || 1) - 1), 0)
      : 0;
    const bldPts = bldUpgrades * 22;
    const extraHighTechs = Math.max(0, (S.library || []).filter(tid => { const t = CULT.tech && CULT.tech(tid); return t && (t.tier || 1) >= 4; }).length - 8);
    const heritagePts = ((S.mentorship && Array.isArray(S.mentorship.heritageArts)) ? S.mentorship.heritageArts.length : 0) * 55 + extraHighTechs * 8;
    const fsSummary = (CULT && CULT.sectFourSymbolSummary) ? CULT.sectFourSymbolSummary(W) : null;
    const beastPts = (fsSummary && fsSummary.awakenedCount ? fsSummary.awakenedCount : 0) * 95;
    const vassalCount = (W.world && Array.isArray(W.world.allSects)) ? W.world.allSects.filter(s => s && (s.isVassal || s.treaty === 'VASSAL_TREATY')).length : 0;
    const nodeCount = (W.world && W.world.resourceNodes) ? Object.values(W.world.resourceNodes).filter(rn => rn && rn.ownerSectId === 'PLAYER').length : 0;
    const hegemonyPts = vassalCount * 120 + nodeCount * 75;

    const rawScore = Math.round(60 + popPts + stagePts + powerPts + famePts + bldPts + heritagePts + beastPts + hegemonyPts + (Number(opts.bonusScore) || 0));
    let rawTierId = 'SMALL';
    for (const tid of SECT.SECT_TIER_ORDER) {
      if (rawScore >= SECT.SECT_TIERS[tid].minScore) rawTierId = tid;
    }

    // Hard Constraint: NEUTRAL sects have no SACRED_LAND supreme alliance leader tier!
    const align = S.alignment || 'NEUTRAL';
    let cappedByNeutral = false;
    let effectiveTierId = rawTierId;
    if (align === 'NEUTRAL' && effectiveTierId === 'SACRED_LAND' && !opts.allowNeutralSacred) {
      effectiveTierId = 'HEGEMON';
      cappedByNeutral = true;
    }

    const spec = SECT.SECT_TIERS[effectiveTierId];
    const nextIdx = Math.min(SECT.SECT_TIER_ORDER.length - 1, SECT.SECT_TIER_ORDER.indexOf(effectiveTierId) + 1);
    const nextSpec = SECT.SECT_TIERS[SECT.SECT_TIER_ORDER[nextIdx]];

    if (!opts.readOnly) {
      const prevTier = S.sectTier;
      S.sectTier = spec.id;
      S.tierLevel = spec.tierLevel;
      S.tierNameTh = spec.nameTh;
      S.tierBadgeTh = spec.badgeTh;
      S.tierScore = rawScore;
      if (prevTier && prevTier !== spec.id && SECT.SECT_TIERS[prevTier] && spec.tierLevel > SECT.SECT_TIERS[prevTier].tierLevel && W.log && !W._founding) {
        W.log('sect', '🏯 ศักดาสำนักก้าวหน้า!「' + S.name + '」ยกระดับจาก' + SECT.SECT_TIERS[prevTier].nameTh + ' ขึ้นสู่「' + spec.badgeTh + '」!', []);
      }
    }

    return {
      tierId: spec.id,
      tierLevel: spec.tierLevel,
      nameTh: spec.nameTh,
      badgeTh: spec.badgeTh,
      score: rawScore,
      nextTierId: nextSpec ? nextSpec.id : null,
      nextTierNameTh: nextSpec ? nextSpec.nameTh : null,
      nextMinScore: nextSpec ? nextSpec.minScore : spec.minScore,
      cappedByNeutralAlignment: cappedByNeutral,
      capReasonTh: cappedByNeutral ? 'สำนักสายกลางจะไม่มีสำนักระดับผู้นำสูงสุด (แดนศักดิ์สิทธิ์) ต้องเลือกยืนหยัดฝ่ายธรรมะหรือฝ่ายอธรรมจึงจะก้าวสู่แดนศักดิ์สิทธิ์ได้' : null,
      breakdown: { popPts, stagePts, powerPts, famePts, bldPts, heritagePts, beastPts, hegemonyPts }
    };
  };

  // Evaluate Player Sect Alignment (NEUTRAL -> RIGHTEOUS or DEMONIC based on Sect Master personality/path + sect deeds)
  SECT.evaluateSectAlignment = (W, opts) => {
    opts = opts || {};
    if (!W || !W.sect) return null;
    const S = W.sect;
    const m = W.byId && S.masterId ? W.byId[S.masterId] : null;
    const e = p => m ? HC.eff(m, p) : 50;

    // Master ideological inclination (-60 Demonic .. +60 Righteous)
    let masterLean = 0;
    if (m) {
      const righteousTraits = (e('personality.integrity') - 50) * 0.45 + (e('personality.empathy') - 50) * 0.40 + (e('personality.discipline') - 50) * 0.25 + (e('values.honorLegacy') - 50) * 0.30 + (e('values.sectDuty') - 50) * 0.20;
      const demonicTraits = (e('personality.aggression') - 50) * 0.45 + (e('personality.ambition') - 50) * 0.30 + (e('personality.pride') - 50) * 0.25 + (50 - e('personality.integrity')) * 0.35 + (50 - e('personality.empathy')) * 0.30;
      masterLean = clamp(Math.round(righteousTraits - demonicTraits), -60, 60);
      const mPath = m.cult ? m.cult.path : 'XIAN';
      if (mPath === 'DEMON') masterLean -= 18;
      else if (['XIAN', 'GOD', 'SAGE_SUPPORT'].includes(mPath)) masterLean += 10;
    }

    const deedScore = Number.isFinite(S.alignmentDeedScore) ? S.alignmentDeedScore : 0;
    // At game start (day <= 360 and no deeds yet unless opts.includeMasterImmediately), player sect starts as NEUTRAL (สำนักเล็กสายกลาง)
    const isInitialFounding = ((W.day || 360) <= 360 && deedScore === 0 && !opts.includeMasterImmediately && !S.alignmentDeclared);
    const totalScore = isInitialFounding ? 0 : clamp(Math.round(masterLean * 0.65 + deedScore), -100, 100);

    let computedAlign = 'NEUTRAL';
    if (S.alignmentDeclared && SECT.ALIGNMENTS[S.alignmentDeclared]) {
      computedAlign = S.alignmentDeclared;
    } else if (totalScore >= 35) {
      computedAlign = 'RIGHTEOUS';
    } else if (totalScore <= -35) {
      computedAlign = 'DEMONIC';
    }

    const alignDef = SECT.ALIGNMENTS[computedAlign] || SECT.ALIGNMENTS.NEUTRAL;
    if (!opts.readOnly) {
      const prevAlign = S.alignment;
      S.alignment = alignDef.id;
      S.alignmentLabelTh = alignDef.nameTh;
      S.alignmentScore = totalScore;
      if (prevAlign && prevAlign !== alignDef.id && W.log && !W._founding) {
        W.log('politics', alignDef.icon + ' จุดยืนแห่งยุทธภพ:「' + S.name + '」เบนเข็มจาก' + (SECT.ALIGNMENTS[prevAlign]?.nameTh || prevAlign) + ' เข้าสู่วิถี「' + alignDef.fullTh + '」ตามปณิธานของเจ้าสำนัก!', m ? [m.id] : []);
      }
    }

    return {
      alignment: alignDef.id,
      nameTh: alignDef.nameTh,
      fullTh: alignDef.fullTh,
      icon: alignDef.icon,
      score: totalScore,
      masterLean,
      deedScore,
      hasSupremeLeader: alignDef.hasSupremeLeader,
      descTh: alignDef.descTh
    };
  };

  SECT.declareSectAlignment = (W, targetAlignment, opts) => {
    opts = opts || {};
    if (!W || !W.sect) return { ok: false, reason: 'invalid-world' };
    const key = String(targetAlignment || '').toUpperCase();
    const spec = SECT.ALIGNMENTS[key];
    if (!spec) return { ok: false, reason: 'invalid-alignment' };
    const S = W.sect;
    const prev = S.alignment || 'NEUTRAL';
    S.alignment = spec.id;
    S.alignmentDeclared = spec.id;
    S.alignmentLabelTh = spec.nameTh;
    if (spec.id === 'RIGHTEOUS') S.alignmentDeedScore = Math.max(40, S.alignmentDeedScore || 0);
    else if (spec.id === 'DEMONIC') S.alignmentDeedScore = Math.min(-40, S.alignmentDeedScore || 0);
    else S.alignmentDeedScore = 0;
    S.alignmentScore = S.alignmentDeedScore;

    // Immediately shift attitudes of all 19 Jianghu organizations based on the chosen alignment
    if (W.world && Array.isArray(W.world.allSects)) {
      W.world.allSects.forEach(s => {
        if (!s || s.isVassal) return;
        if (spec.id === 'NEUTRAL') return;
        if (s.alignment === spec.id) {
          s.attitude = clamp((s.attitude || 0) + 12, -100, 100);
        } else if ((spec.id === 'RIGHTEOUS' && s.alignment === 'DEMONIC') || (spec.id === 'DEMONIC' && s.alignment === 'RIGHTEOUS')) {
          s.attitude = clamp((s.attitude || 0) - 22, -100, 100);
        }
      });
    }
    SECT.evaluateSectTier(W);
    if (!opts.quiet && W.log) {
      W.log('politics', spec.icon + ' เจ้าสำนักประกาศจุดยืนอย่างเป็นทางการ:「' + S.name + '」ก้าวเข้าสู่「' + spec.fullTh + '」!', S.masterId ? [S.masterId] : []);
    }
    return { ok: true, previousAlignment: prev, alignment: spec.id, nameTh: spec.nameTh, fullTh: spec.fullTh };
  };

  /* ---------- Autonomous Officer Jurisdiction Decisions (Personality + Skill + Desire Driven across all 25 Offices) ---------- */
  SECT.ensureJurisdictionLog = W => {
    if (!W || !W.sect) return [];
    if (!Array.isArray(W.sect.jurisdictionLog)) W.sect.jurisdictionLog = [];
    return W.sect.jurisdictionLog;
  };

  SECT.runOfficerJurisdictionSingle = (W, post, officer, opts) => {
    if (typeof officer === 'boolean') { opts = { ignoreAvailability: officer }; officer = null; }
    else if (officer && typeof officer === 'object' && !officer.id && !officer.h) { opts = officer; officer = null; }
    else if (typeof opts === 'boolean') { opts = { ignoreAvailability: opts }; }
    opts = opts || {};
    if (!W || !W.sect) return { ok: false, reason: 'invalid-world' };
    post = SECT.resolveOfficeId(post);
    if (typeof officer === 'string' && W.byId) officer = W.byId[officer];
    const n = officer || SECT.holder(W, post);
    if (!n || n.dead || (!opts.ignoreAvailability && !SECT.isOfficerAvailable(W, n))) {
      return { ok: false, reason: 'officer-unavailable', post };
    }
    const e = p => HC.eff(n, p);
    const sk = (n.h && n.h.skills) || {};
    const pSpec = SECT.POSTS[post] || { nameTh: post, authority: 60 };
    let summaryTh = '';
    let effect = {};

    if (post === 'envoy') {
      const vassals = (W.world && Array.isArray(W.world.allSects)) ? W.world.allSects.filter(s => s && (s.isVassal || s.treaty === 'VASSAL_TREATY')) : [];
      const greedyOrHarsh = (e('values.wealthResource') >= 65 || e('personality.aggression') >= 65) && e('personality.empathy') < 48;
      const empatheticOrCautious = e('personality.empathy') >= 56 || e('personality.caution') >= 58;
      if (vassals.length) {
        const v = vassals[0];
        if (greedyOrHarsh && g.EXPED && g.EXPED.setVassalTributePolicy) {
          g.EXPED.setVassalTributePolicy(W, v, 'HARSH');
          W.sect.alignmentDeedScore = clamp((W.sect.alignmentDeedScore || 0) - 4, -100, 100);
          summaryTh = n.h.name.given + ' (ทูตยุทธภพ) ใช้นโยบายแข็งกร้าวรีดบรรณาการหนักจาก「' + v.nameTh + '」ตามนิสัยเห็นแก่ผลประโยชน์';
          effect = { policySet: 'HARSH', targetSectId: v.id };
        } else if (empatheticOrCautious && (v.loyalty || 50) < 55 && g.EXPED && g.EXPED.setVassalTributePolicy) {
          g.EXPED.setVassalTributePolicy(W, v, 'LENIENT');
          W.sect.alignmentDeedScore = clamp((W.sect.alignmentDeedScore || 0) + 3, -100, 100);
          summaryTh = n.h.name.given + ' (ทูตยุทธภพ) ผ่อนปรนบรรณาการแก่「' + v.nameTh + '」เพื่อซื้อใจและรักษาเสถียรภาพบริวาร';
          effect = { policySet: 'LENIENT', targetSectId: v.id };
        } else {
          v.loyalty = clamp((v.loyalty || 60) + 3, 0, 100);
          summaryTh = n.h.name.given + ' (ทูตยุทธภพ) เจรจาเสริมความมั่นคงกับสำนักบริวาร「' + v.nameTh + '」(+ความภักดี +3)';
          effect = { loyaltyGain: 3, targetSectId: v.id };
        }
      } else {
        const allSects = (W.world && W.world.allSects) || [];
        const sameAlignSects = allSects.filter(s => s && !s.isVassal && s.alignment === (W.sect.alignment || 'NEUTRAL'));
        const target = sameAlignSects[0] || allSects[0];
        if (target) {
          const boost = Math.max(2, Math.round((e('social.charisma') + (sk.diplomacy || 0)) / 32));
          target.attitude = clamp((target.attitude || 0) + boost, -100, 100);
          W.sect.diplomacyBonus = +((e('social.persuasion') + (sk.diplomacy || 0)) / 500).toFixed(2);
          summaryTh = n.h.name.given + ' (ทูตยุทธภพ) ส่งสาส์นเชื่อมไมตรีกับ「' + target.nameTh + '」(+ทัศนคติ +' + boost + ')';
          effect = { attitudeGain: boost, targetSectId: target.id, diplomacyBonus: W.sect.diplomacyBonus };
        }
      }
    } else if (post === 'spymaster') {
      const pol = SECT.ensureHierarchyAndPolitics(W);
      const disgruntled = (n.sat || 60) < 42 && e('personality.integrity') < 45;
      if (disgruntled) {
        pol.undercurrent = clamp((pol.undercurrent || 0) + 5, 0, 100);
        summaryTh = n.h.name.given + ' (เจ้าหอข่าวกรอง) ไม่พอใจสำนัก แอบปล่อยข่าวลือปลุกปั่นคลื่นใต้น้ำ (+5)';
        effect = { undercurrentDelta: 5, covertSabotage: true };
      } else {
        const reduce = Math.max(2, Math.round((e('intellect.perceptiveness') + (sk.stealth || 0)) / 30));
        pol.undercurrent = clamp((pol.undercurrent || 0) - reduce, 0, 100);
        if (SECT.JIANGHU && SECT.JIANGHU.refreshTavernRumors) SECT.JIANGHU.refreshTavernRumors(W, { count: 2 });
        if (W.threat) W.threat.earlyWarningBonus = Math.round(10 + (sk.stealth || 0) * 0.25);
        summaryTh = n.h.name.given + ' (เจ้าหอข่าวกรอง) สืบเบาะแสโรงเตี๊ยมและสกัดกั้นข่าวลือคลื่นใต้น้ำ (-' + reduce + ')';
        effect = { undercurrentDelta: -reduce, covertSabotage: false };
      }
    } else if (post === 'warden') {
      const dng = SECT.ensureDungeon(W);
      if (dng && dng.prisoners && dng.prisoners.length > 0) {
        const act = e('personality.empathy') >= 62 ? 'RECRUIT_DEFECTOR' : (e('personality.curiosity') >= 60 || e('interests.scholarship') >= 60) ? 'INTERROGATE' : 'RANSOM';
        const dRes = SECT.handleDungeonPrisoner(W, dng.prisoners[0], act, { warden: n, quiet: opts.quiet });
        summaryTh = n.h.name.given + ' (ผู้คุมทัณฑ์และเชลยศึก) ดำเนินการจัดการเชลยศึก「' + (dRes.prisoner ? dRes.prisoner.nameTh : '') + '」ด้วยวิธี ' + act + ' (' + (dRes.consequenceTh || 'สำเร็จ') + ')';
        effect = { dungeonAction: act, prisonerId: dRes.prisoner && dRes.prisoner.id, result: dRes };
      } else {
        W.sect.dungeonSecurity = clamp((W.sect.dungeonSecurity || 75) + 5, 50, 100);
        summaryTh = n.h.name.given + ' (ผู้คุมทัณฑ์และเชลยศึก) ตรวจตราความมั่นคงคุกใต้ดินสำนัก (ระดับการคุ้มกัน ' + W.sect.dungeonSecurity + '%)';
        effect = { dungeonSecurity: W.sect.dungeonSecurity };
      }
    } else if (post === 'beastmaster') {
      const menagerie = (CULT && CULT.ensureMenagerie) ? CULT.ensureMenagerie(W) : (W.sect.beasts || []);
      let caredCount = 0;
      menagerie.forEach(b => {
        if (!b || b.dead) return;
        b.fatigue = Math.max(0, (b.fatigue || 0) - 18);
        b.hunger = Math.min(100, (b.hunger == null ? 75 : b.hunger) + 20);
        b.loyalty = Math.min(100, (b.loyalty == null ? 65 : b.loyalty) + 3);
        caredCount++;
      });
      (W.npcs || []).forEach(m => {
        if (!m || m.dead || !Array.isArray(m.pets)) return;
        m.pets.forEach(pt => {
          if (!pt) return;
          pt.fatigue = Math.max(0, (pt.fatigue || 0) - 12);
          pt.hunger = Math.min(100, (pt.hunger == null ? 75 : pt.hunger) + 15);
          caredCount++;
        });
      });
      if (CULT && CULT.EXPERIENCE_TRAITS && CULT.EXPERIENCE_TRAITS.recordExperienceEvent) {
        CULT.EXPERIENCE_TRAITS.recordExperienceEvent(W, n, 'BEAST_NURTURE_AND_BOND', 'tick:' + W.t);
      }
      summaryTh = n.h.name.given + ' (เจ้าอุทยานอสูร) ฟื้นฟูความเหนื่อยล้าและบำรุงสัตว์วิญญาณในสำนัก (' + caredCount + ' ตัว)';
      effect = { caredCount };
    } else if (post === 'wildwarden') {
      const beasts = (W.wildlife && Array.isArray(W.wildlife.beasts)) ? W.wildlife.beasts.filter(b => b && !b.dead && !b.gone) : [];
      const legCount = beasts.filter(b => b.legendary || (b.tier || 1) >= 4).length;
      if (W.threat) W.threat.alert = Math.max(0, (W.threat.alert || 0) - 2);
      summaryTh = n.h.name.given + ' (ผู้อาวุโสฝ่ายพรานและลาดตระเวน) ลาดตระเวนเขตรอบสำนัก พบอสูรเคลื่อนไหว ' + beasts.length + ' ตัว (ระดับสูง ' + legCount + ' ตัว) และวางแนวเตือนภัย';
      effect = { activeBeasts: beasts.length, highTierBeasts: legCount };
    } else if (post === 'arraymaster') {
      const arrSkill = Math.max(sk.ARRAY || 0, sk.TALISMAN || 0, e('intellect.spatial') * 0.6);
      const gain = Math.max(4, Math.round(arrSkill / 12));
      W.sect.arrayIntegrity = clamp((W.sect.arrayIntegrity || 80) + gain, 0, 100);
      if (SECT.FENG_SHUI && SECT.FENG_SHUI.attuneBuilding) {
        SECT.FENG_SHUI.attuneBuilding(W, n, 'meditation_hall', 'ASTRAL', { quiet: true, free: true });
      }
      let boostedNodes = 0;
      if (W.world && W.world.resourceNodes) {
        Object.values(W.world.resourceNodes).forEach(rn => {
          if (rn && rn.ownerSectId === 'PLAYER' && rn.garrison) {
            const curPower = rn.garrison.defensePower || 320;
            if (curPower < 650 && (n.lastJurisdictionDay !== (W.day || 0) || opts.force)) {
              rn.garrison.defensePower = Math.min(650, Math.round(curPower * 1.06));
              boostedNodes++;
            }
          }
        });
      }
      summaryTh = n.h.name.given + ' (ปรมาจารย์ค่ายกล) เสริมความมั่นคงค่ายกลพิทักษ์สำนักเป็น ' + W.sect.arrayIntegrity + '% ปรับจูนชีพจรฮวงจุ้ย และเสริมปราการจุดยุทธศาสตร์ (' + boostedNodes + ' แห่ง)';
      effect = { arrayIntegrity: W.sect.arrayIntegrity, boostedNodes };
    } else if (post === 'censor') {
      const pol = SECT.ensureHierarchyAndPolitics(W);
      const fair = e('personality.integrity') >= 48;
      if (fair) {
        const calm = Math.max(3, Math.round((e('personality.integrity') + e('intellect.judgement')) / 30));
        pol.undercurrent = clamp((pol.undercurrent || 0) - calm, 0, 100);
        W.sect.suspicion = Math.max(0, (W.sect.suspicion || 0) - 8);
        summaryTh = n.h.name.given + ' (ผู้ตรวจการสภา) ไกล่เกลี่ยข้อพิพาทระหว่างก๊กด้วยความเป็นธรรม ลดคลื่นใต้น้ำ (-' + calm + ')';
        effect = { undercurrentDelta: -calm, impartial: true };
      } else {
        pol.undercurrent = clamp((pol.undercurrent || 0) + 4, 0, 100);
        summaryTh = n.h.name.given + ' (ผู้ตรวจการสภา) ใช้อำนาจเข้าข้างพวกพ้องของตน ทำให้ก๊กอื่นไม่พอใจ (+คลื่นใต้น้ำ +4)';
        effect = { undercurrentDelta: 4, impartial: false };
      }
    } else if (post === 'quartermaster') {
      if (n.lastJurisdictionDay === (W.day || 0) && !opts.force) {
        summaryTh = n.h.name.given + ' (แม่ทัพยุทธปัจจัย) ปฏิบัติหน้าที่ตรวจคลังเสบียงเรียบร้อยแล้วในวันนี้';
        effect = { bonusStones: 0, cooldown: true };
      } else {
        const freeTradeCount = ((W.world && W.world.allSects) || []).filter(s => s && s.treaty === 'FREE_TRADE_TREATY').length;
        const bonusStones = Math.round(20 + freeTradeCount * 25 + ((sk.trading || 0) + (sk.administration || 0)) * 0.25);
        if (ECO && ECO.earn) ECO.earn(W, bonusStones, 'ผลตอบแทนบริหารคลังยุทธปัจจัยและคาราวานโดย ' + n.h.name.given);
        summaryTh = n.h.name.given + ' (แม่ทัพยุทธปัจจัย) บริหารเส้นทางคาราวานและคลังเสบียง สร้างรายได้เสริม +' + bonusStones + ' ศิลา';
        effect = { bonusStones };
      }
    } else if (post === 'commander') {
      const hawkish = e('personality.aggression') >= 62 && e('personality.courage') >= 60;
      const distress = (W.world && Array.isArray(W.world.vassalDistressCalls)) ? W.world.vassalDistressCalls.find(c => c && !c.resolved) : null;
      if (distress && g.EXPED && g.EXPED.respondVassalDistress) {
        const choice = (hawkish || e('personality.loyalty') >= 50) ? 'REINFORCE' : 'REFUSE';
        g.EXPED.respondVassalDistress(W, distress.id, choice, [n]);
        summaryTh = n.h.name.given + ' (แม่ทัพสำนัก) ตัดสินใจ' + (choice === 'REINFORCE' ? 'ส่งทัพหนุนช่วยสำนักบริวาร' : 'สงวนกำลังพลไม่ส่งทัพหนุน');
        effect = { distressChoice: choice };
      } else {
        W.sect.combatPosture = hawkish ? 'OFFENSIVE' : 'DEFENSIVE';
        summaryTh = n.h.name.given + ' (แม่ทัพสำนัก) จัดทัพฝึกซ้อมพร้อมรบตามอุปนิสัย (' + (hawkish ? 'สายรุกดุดัน' : 'สายตั้งรับรัดกุม') + ')';
        effect = { posture: W.sect.combatPosture };
      }
    } else if (post === 'vanguard') {
      const posture = e('physiology.toughness') >= e('personality.aggression') ? 'IRON_SHIELD_WALL' : 'SPEAR_ZOC_PHALANX';
      W.sect.vanguardPosture = posture;
      W.sect.vanguardInterceptBonus = +((12 + (e('personality.courage') + e('physiology.toughness')) * 0.08) / 100).toFixed(2);
      summaryTh = n.h.name.given + ' (ผู้อาวุโสกองหน้าพิทักษ์ด่าน) จัดแถวแนวหน้าด้วยค่ายกล「' + (posture === 'IRON_SHIELD_WALL' ? 'กำแพงโล่เหล็กคุ้มแถวหลัง' : 'ค่ายกลทวนสกัดระยะประชิด') + '」(โอกาสเข้าคุ้มกัน +' + Math.round(W.sect.vanguardInterceptBonus * 100) + '%)';
      effect = { vanguardPosture: posture, vanguardInterceptBonus: W.sect.vanguardInterceptBonus };
    } else if (post === 'martial') {
      const trainees = (W.npcs || []).filter(m => m && !m.dead && !m.away && m.id !== n.id && m.cult && m.rank <= 3).slice(0, 4);
      trainees.forEach(t => { if (CULT && CULT.gain) CULT.gain(t, 8, W, 'martial_elder_drill'); });
      summaryTh = n.h.name.given + ' (ผู้อาวุโสหอยุทธ์) เปิดลานฝึกซ้อมกระบวนท่าและชี้แนะพื้นฐานยุทธ์แก่ศิษย์ (' + trainees.length + ' คน)';
      effect = { trainedCount: trainees.length };
    } else if (post === 'guard') {
      if (g.SIM && g.SIM.guardRoster) g.SIM.guardRoster(W);
      if (W.threat) W.threat.alert = Math.max(0, (W.threat.alert || 0) - 3);
      summaryTh = n.h.name.given + ' (หัวหน้าองครักษ์) จัดเวรยามหน้าประตูสำนัก (' + ((W.sect.guardRoster && W.sect.guardRoster.length) || 0) + ' คน) และกวดขันการป้องกัน';
      effect = { guardCount: (W.sect.guardRoster && W.sect.guardRoster.length) || 0 };
    } else if (post === 'treasury') {
      if (g.CPE && g.CPE.welfareDaily) g.CPE.welfareDaily(W);
      const intel = (ECO && ECO.inventoryIntelligence) ? ECO.inventoryIntelligence(W) : null;
      summaryTh = n.h.name.given + ' (ผู้อาวุโสหอคลัง) ตรวจสอบบัญชีศิลาวิญญาณ (' + (W.sect.stones || 0) + ' ก้อน) และจัดสรรสวัสดิการสำนัก';
      effect = { stones: W.sect.stones, shortages: intel && intel.shortage ? intel.shortage.length : 0 };
    } else if (post === 'provision') {
      const meals = ECO ? ECO.count(W, 'meal') : 0;
      const grains = ECO ? ECO.count(W, 'grain') : 0;
      if (meals < 24 && grains >= 3 && ECO && ECO.take && ECO.add) {
        ECO.take(W, 'grain', 3);
        ECO.add(W, 'meal', 9);
      }
      summaryTh = n.h.name.given + ' (ผู้อาวุโสฝ่ายเสบียง) ตรวจสอบคลังข้าวสาร (' + (ECO ? ECO.count(W, 'grain') : 0) + ') และอาหารพร้อมทาน (' + (ECO ? ECO.count(W, 'meal') : 0) + ')';
      effect = { meal: ECO ? ECO.count(W, 'meal') : 0, grain: ECO ? ECO.count(W, 'grain') : 0 };
    } else if (post === 'marketmaster') {
      if (n.lastJurisdictionDay === (W.day || 0) && !opts.force) {
        summaryTh = n.h.name.given + ' (นายวาณิชย์ตลาดภายนอก) ปฏิบัติหน้าที่บริหารราคาตลาดเรียบร้อยแล้วในวันนี้';
        effect = { tradeBonus: 0, soldCount: 0, cooldown: true };
      } else {
        let soldCount = 0;
        const vis = (W.world && Array.isArray(W.world.visitors)) ? W.world.visitors.find(v => v && v.kind === 'trader') : null;
        if (vis && g.EXT && g.EXT.sellStaleSectGear) {
          const sRes = g.EXT.sellStaleSectGear(W, vis, { maxSell: 2 });
          soldCount = (sRes && sRes.soldCount) || 0;
        }
        const tradeBonus = Math.max(8, Math.round(((sk.trading || 0) + e('aptitudes.socialCommerce')) * 0.18));
        if (ECO && ECO.earn) ECO.earn(W, tradeBonus, 'กำไรแลกเปลี่ยนตลาดภายนอกโดย ' + n.h.name.given);
        summaryTh = n.h.name.given + ' (นายวาณิชย์ตลาดภายนอก) บริหารราคาสินค้าตลาดภายนอก (กำไร +' + tradeBonus + ' ศิลา' + (soldCount ? ' · ระบายอุปกรณ์ค้างคลัง ' + soldCount + ' ชิ้น' : '') + ')';
        effect = { tradeBonus, soldCount };
      }
    } else if (post === 'alchemy') {
      const o = (ECO && ECO.pickOrder) ? ECO.pickOrder(W, 'alchemy', n) : null;
      if (o && o.recipe) W.sect.orders.alchemy = { rid: o.recipe.id, why: o.why, by: n.id };
      summaryTh = n.h.name.given + ' (ผู้อาวุโสหอโอสถ) กำหนดแผนหลอมโอสถประจำหอ' + (o && o.recipe ? ('「' + o.recipe.nameTh + '」') : '');
      effect = { orderRecipeId: o && o.recipe ? o.recipe.id : null };
    } else if (post === 'forge') {
      const o = (ECO && ECO.pickOrder) ? ECO.pickOrder(W, 'forge', n) : null;
      if (o && o.recipe) W.sect.orders.forge = { rid: o.recipe.id, why: o.why, by: n.id };
      summaryTh = n.h.name.given + ' (ผู้อาวุโสโรงหลอม) กำกับงานตีศาสตราและบำรุงเตาหลอม' + (o && o.recipe ? ('「' + o.recipe.nameTh + '」') : '');
      effect = { orderRecipeId: o && o.recipe ? o.recipe.id : null };
    } else if (post === 'herbal') {
      if (ECO && ECO.harvestHerb) ECO.harvestHerb(W, n, 1.5);
      summaryTh = n.h.name.given + ' (ผู้อาวุโสฝ่ายสมุนไพร) ดูแลแปลงสมุนไพรวิญญาณและเก็บเกี่ยวสมุนไพรเข้าคลัง';
      effect = { harvested: true };
    } else if (post === 'discipline') {
      if (SECT.TRIBUNAL && SECT.TRIBUNAL.ensure(W) && W.sect.tribunal.activeCases.length > 0) {
        const c0 = W.sect.tribunal.activeCases[0];
        const autoVerdict = e('personality.integrity') >= 70 ? 'SEVERE_DUNGEON_DETENTION' : (e('personality.empathy') >= 65 ? 'LENIENT_WARNING' : 'MERIT_FINE_AND_PENANCE');
        const tRes = SECT.TRIBUNAL.adjudicateCase(W, c0.id, autoVerdict, { judge: n, quiet: opts.quiet });
        summaryTh = n.h.name.given + ' (ผู้คุมกฎสำนัก) ไต่สวนคดีหอวินัย「' + c0.titleTh + '」และตัดสินด้วยโทษ ' + autoVerdict;
        effect = { tribunalAdjudicated: true, caseId: c0.id, verdict: autoVerdict, result: tRes };
      } else if ((W.sect.suspicion || 0) > 0 && SECT.ELDER_COUNCIL_EDICTS && SECT.ELDER_COUNCIL_EDICTS.auditOfficerConduct) {
        const aRes = SECT.ELDER_COUNCIL_EDICTS.auditOfficerConduct(W, null, n, { quiet: true });
        summaryTh = (aRes && aRes.summaryTh) || (n.h.name.given + ' (ผู้คุมกฎสำนัก) ตรวจสอบวินัยและความโปร่งใสของขุนนาง');
        effect = { audited: true, conductType: aRes && aRes.conductType };
      } else {
        summaryTh = n.h.name.given + ' (ผู้คุมกฎสำนัก) กวดขันระเบียบวินัยและดูแลความสงบเรียบร้อยในสำนัก';
        effect = { audited: false };
      }
    } else if (post === 'scripture') {
      if (W.sect.research) {
        W.sect.research.progress = Math.min(W.sect.research.need, (W.sect.research.progress || 0) + 12);
      }
      summaryTh = n.h.name.given + ' (ผู้อาวุโสหอคัมภีร์) จัดระเบียบคัมภีร์ยุทธ์ (' + ((W.sect.library && W.sect.library.length) || 0) + ' เล่ม) และค้นคว้าตำรับวิชา';
      effect = { libraryCount: (W.sect.library && W.sect.library.length) || 0 };
    } else if (post === 'registry') {
      if (W.sect.queue && W.sect.queue.length && SECT.processApplicants) {
        SECT.processApplicants(W, n);
      }
      summaryTh = n.h.name.given + ' (ผู้อาวุโสหอทะเบียน) ตรวจสอบผู้สมัครหน้าประตูและปรับปรุงทะเบียนประวัติศิษย์';
      effect = { queueRemaining: (W.sect.queue && W.sect.queue.length) || 0 };
    } else if (post === 'healer') {
      let healedCount = 0;
      (W.npcs || []).forEach(p => {
        if (!p || p.dead || p.away) return;
        const hm = CULT ? CULT.hpMax(p) : 100;
        if (p.h.state.hp < hm || (p.inj && p.inj.length)) {
          p.h.state.hp = Math.min(hm, (p.h.state.hp || hm) + Math.round(hm * 0.18));
          if (p.inj && p.inj.length) p.inj[0].t = Math.max(0, (p.inj[0].t || 60) - 60);
          healedCount++;
        }
      });
      summaryTh = n.h.name.given + ' (หมอหลวงสำนัก) ตรวจรักษาศิษย์บาดเจ็บและฟื้นฟูชีพจร (' + healedCount + ' คน)';
      effect = { healedCount };
    } else if (post === 'steward') {
      const gov = SECT.governanceSummary ? SECT.governanceSummary(W) : { constructionSpeedBonus: 0 };
      summaryTh = n.h.name.given + ' (ผู้อาวุโสฝ่ายอาคารสถานที่) ตรวจความพร้อมอาคารและเร่งงานก่อสร้าง (+' + Math.round((gov.constructionSpeedBonus || 0) * 100) + '%)';
      effect = { constructionSpeedBonus: gov.constructionSpeedBonus };
    } else if (post === 'mission') {
      if (W.threat && W.threat.roadBlocked > 0) W.threat.roadBlocked = Math.max(0, W.threat.roadBlocked - 1);
      summaryTh = n.h.name.given + ' (ผู้อาวุโสฝ่ายกิจการนอกสำนัก) ประสานเส้นทางคณะเดินทางและภารกิจสำรวจยุทธภพ';
      effect = { roadBlocked: W.threat ? W.threat.roadBlocked : 0 };
    } else if (post === 'disciples') {
      if (n.cult && CULT && CULT.gain) CULT.gain(n, 10, W, 'successor_governance_study');
      n.merit = (n.merit || 0) + 3;
      summaryTh = n.h.name.given + ' (ศิษย์สืบทอด) ศึกษางานบริหารราชการสำนักและฝึกฝนตบะเพื่อเตรียมสืบทอดตำแหน่ง';
      effect = { meritGain: 3 };
    }

    if (summaryTh) {
      n.lastJurisdictionDay = W.day || 0;
      n.lastJurisdictionDecision = { day: W.day || 0, post, summaryTh, effect };
      W.sect.jurisdictionLog = Array.isArray(W.sect.jurisdictionLog) ? W.sect.jurisdictionLog : [];
      W.sect.jurisdictionLog.unshift({ day: W.day || 0, t: W.t || 0, post, postNameTh: pSpec.nameTh, officerId: n.id, officerNameTh: HC.fullName(n), summaryTh, effect });
      if (W.sect.jurisdictionLog.length > 60) W.sect.jurisdictionLog.length = 60;
      if (!opts.quiet && W.log) {
        W.log('decision', '🏛️ ' + summaryTh, [n.id]);
      }
      if (!opts.quiet && g.EXPED && g.EXPED.recordChronicle) {
        g.EXPED.recordChronicle(W, {
          category: 'INTERNAL',
          reportFormat: 'SYSTEM_LEDGER',
          icon: '🏛️',
          involvedSects: [W.sect.name],
          involvedFigures: [HC.fullName(n)],
          npcIds: [n.id],
          titleTh: 'การใช้อำนาจหน้าที่ประจำตำแหน่ง: ' + pSpec.nameTh + ' (' + HC.fullName(n) + ')',
          storyTh: summaryTh,
          originCauseTh: 'อำนาจหน้าที่ตามทำเนียบตำแหน่ง「' + pSpec.nameTh + '」(บารมี ' + (pSpec.authority || 65) + ') และอุปนิสัยของผู้ดำรงตำแหน่ง',
          actorChainTh: HC.fullName(n) + ' (' + pSpec.nameTh + ') ➔ ปฏิบัติหน้าที่ ณ ' + (pSpec.hall || 'main_hall'),
          systemImpactTh: 'เชื่อมโยง SECT.runOfficerJurisdictionSingle(' + post + ') ➔ ขับเคลื่อนระบบสำนักและการเมืองภายใน',
          directorInsightTh: 'ขุนนางแต่ละตำแหน่งตัดสินใจตามบุคลิกภาพและทักษะจริง ทำให้สำนักดำเนินไปอย่างมีชีวิตชีวา',
          consequenceTh: summaryTh,
          quiet: true
        });
      }
    }
    return { ok: true, post, officerId: n.id, officerNameTh: HC.fullName(n), summaryTh, effect };
  };

  SECT.runOfficerJurisdictions = (W, opts) => {
    opts = opts || {};
    if (!W || !W.sect) return { ok: false, decisions: [] };
    if (opts.manual && W.sect.lastManualJurisdictionDay === (W.day || 0) && !opts.force) {
      return { ok: false, reason: 'cooldown-same-day', decisions: [] };
    }
    if (opts.manual) {
      W.sect.lastManualJurisdictionDay = W.day || 0;
    }
    const decisions = [];
    const targetPosts = opts.allPosts ? SECT.POST_IDS : ['envoy', 'spymaster', 'warden', 'beastmaster', 'wildwarden', 'arraymaster', 'censor', 'quartermaster', 'marketmaster', 'commander', 'vanguard', 'martial', 'guard', 'treasury', 'provision', 'alchemy', 'forge', 'herbal', 'discipline', 'scripture', 'registry', 'healer', 'steward', 'mission', 'disciples'];
    targetPosts.forEach(post => {
      const h = SECT.holder(W, post);
      if (h && !h.dead && (opts.ignoreAvailability || SECT.isOfficerAvailable(W, h))) {
        const res = SECT.runOfficerJurisdictionSingle(W, post, h, opts);
        if (res && res.ok) decisions.push(res);
      }
    });
    return { ok: true, decisions };
  };

  /* ---------- Internal Sect Cliques, Nominations, Sect Master Weighing & Undercurrent Unrest ---------- */
  SECT. preferredCliqueForNpc = n => {
    if (!n || !n.h) return 'BENEVOLENT_SAGE';
    const e = p => HC.eff(n, p);
    const sHawk = e('personality.aggression') * 0.35 + e('personality.courage') * 0.30 + e('values.martialPeak') * 0.35 + e('interests.combat') * 0.25;
    const sOrth = e('personality.discipline') * 0.35 + e('personality.integrity') * 0.30 + e('values.honorLegacy') * 0.30 + e('values.sectDuty') * 0.30;
    const sComm = e('values.wealthResource') * 0.40 + e('personality.ambition') * 0.30 + e('aptitudes.socialCommerce') * 0.30 + e('interests.trade') * 0.25;
    const sSage = e('personality.empathy') * 0.35 + e('personality.curiosity') * 0.25 + e('values.knowledgeCraft') * 0.35 + (e('interests.alchemy') + e('interests.scholarship')) * 0.15;
    const pairs = [
      ['HAWK_MARTIAL', sHawk],
      ['ORTHODOX_TRADITION', sOrth],
      ['PRAGMATIC_COMMERCE', sComm],
      ['BENEVOLENT_SAGE', sSage]
    ];
    pairs.sort((a, b) => b[1] - a[1]);
    return pairs[0][0];
  };

  SECT.syncInternalCliques = (W, opts) => {
    opts = opts || {};
    const pol = SECT.ensureHierarchyAndPolitics(W);
    if (!pol) return null;
    const S = W.sect;
    for (const cid of SECT.CLIQUE_IDS) {
      if (!pol.cliques[cid]) {
        pol.cliques[cid] = { id: cid, nameTh: SECT.CLIQUE_DEFS[cid].nameTh, leaderId: null, memberIds: [], influence: 10, satisfaction: 65 };
      }
      pol.cliques[cid].memberIds = [];
    }

    const members = (W.npcs || []).filter(n => n && !n.dead && !n.exiled && n.id !== S.masterId);
    members.forEach(n => {
      const cid = (n.cliqueId && SECT.CLIQUE_DEFS[n.cliqueId]) ? n.cliqueId : SECT.preferredCliqueForNpc(n);
      if (!opts.readOnly) n.cliqueId = cid;
      pol.cliques[cid].memberIds.push(n.id);
    });

    for (const cid of SECT.CLIQUE_IDS) {
      const cq = pol.cliques[cid];
      const cMembers = cq.memberIds.map(id => W.byId[id]).filter(Boolean);
      if (cMembers.length) {
        cMembers.sort((a, b) => {
          const scoreA = (a.rank || 0) * 18 + (a.post ? 20 : 0) + HC.eff(a, 'social.leadership') * 0.4 + (CULT.power ? CULT.power(a) / 50 : 0);
          const scoreB = (b.rank || 0) * 18 + (b.post ? 20 : 0) + HC.eff(b, 'social.leadership') * 0.4 + (CULT.power ? CULT.power(b) / 50 : 0);
          return scoreB - scoreA;
        });
        cq.leaderId = cMembers[0].id;
        cq.leaderNameTh = HC.fullName(cMembers[0]);
        cq.influence = Math.round(15 + cMembers.reduce((s, m) => s + (m.rank || 1) * 8 + (m.post ? 18 : 0) + (CULT.equivalentStage ? CULT.equivalentStage(m) * 4 : 4), 0));
        cq.satisfaction = Math.round(cMembers.reduce((s, m) => s + (m.sat == null ? 60 : m.sat), 0) / cMembers.length);
      } else {
        cq.leaderId = null;
        cq.leaderNameTh = null;
        cq.influence = 10;
      }
    }
    return pol;
  };

  SECT.proposeCliqueNomination = (W, post, opts) => {
    opts = opts || {};
    const pol = SECT.syncInternalCliques(W);
    if (!pol || !SECT.POSTS[post]) return { ok: false, reason: 'invalid-post' };

    const chosenCliqueId = opts.cliqueId && pol.cliques[opts.cliqueId]
      ? opts.cliqueId
      : SECT.CLIQUE_IDS.slice().sort((a, b) => {
          const prefA = SECT.CLIQUE_DEFS[a].preferredPosts.includes(post) ? 35 : 0;
          const prefB = SECT.CLIQUE_DEFS[b].preferredPosts.includes(post) ? 35 : 0;
          return ((pol.cliques[b].influence || 0) + prefB) - ((pol.cliques[a].influence || 0) + prefA);
        })[0];
    const clique = pol.cliques[chosenCliqueId];
    const cliqueMembers = (clique.memberIds || []).map(id => W.byId[id]).filter(n => n && !n.dead && !n.exiled && n.id !== W.sect.masterId);
    const allEligible = (W.npcs || []).filter(n => n && !n.dead && !n.exiled && n.id !== W.sect.masterId && n.id !== W.sect.deputyId);

    const cand = (opts.candidateId && W.byId[opts.candidateId])
      || cliqueMembers.slice().sort((a, b) => SECT.relevance(post, b) - SECT.relevance(post, a))[0]
      || allEligible.slice().sort((a, b) => SECT.relevance(post, b) - SECT.relevance(post, a))[0];
    if (!cand) return { ok: false, reason: 'no-candidate' };

    const leader = (clique.leaderId && W.byId[clique.leaderId]) || cand;
    const pressureLevel = clamp(Math.round((clique.influence || 25) * 0.6 + HC.eff(leader, 'personality.ambition') * 0.3), 15, 95);
    const nom = {
      id: 'NOM_' + (++pol.seq),
      day: W.day || 0,
      post,
      postNameTh: SECT.POSTS[post].nameTh,
      cliqueId: clique.id,
      cliqueNameTh: clique.nameTh,
      leaderId: leader.id,
      leaderNameTh: HC.fullName(leader),
      candidateId: cand.id,
      candidateNameTh: HC.fullName(cand),
      candidateSuitability: Math.round(SECT.relevance(post, cand)),
      pressureLevel,
      status: 'PENDING',
      reasonTh: clique.nameTh + ' นำโดย ' + HC.fullName(leader) + ' รวมตัวเสนอชื่อ ' + HC.fullName(cand) + ' ขึ้นดำรงตำแหน่ง' + SECT.POSTS[post].nameTh
    };
    pol.nominations = (pol.nominations || []).filter(x => x && x.post !== post && x.status === 'PENDING');
    pol.nominations.unshift(nom);
    if (!opts.quiet && W.log) {
      W.log('politics', '📜 การเมืองในสำนัก: ' + nom.reasonTh + ' (แรงกดดัน ' + pressureLevel + ')', [leader.id, cand.id]);
    }
    return { ok: true, nomination: nom };
  };

  SECT.resolvePoliticalNomination = (W, nominationOrId, masterChoice, opts) => {
    opts = opts || {};
    const pol = SECT.syncInternalCliques(W);
    if (!pol) return { ok: false, reason: 'no-politics' };
    let nom = typeof nominationOrId === 'object' && nominationOrId
      ? (pol.nominations || []).find(x => x && (x === nominationOrId || x.id === nominationOrId.id) && x.status === 'PENDING')
      : (pol.nominations || []).find(x => x && (x.id === nominationOrId || x.post === nominationOrId) && x.status === 'PENDING');
    if (!nom && typeof nominationOrId === 'string' && SECT.POSTS[nominationOrId] && !(pol.nominations || []).some(x => x && x.post === nominationOrId && x.status === 'RESOLVED' && x.resolvedDay === (W.day || 0))) {
      const prop = SECT.proposeCliqueNomination(W, nominationOrId, { quiet: true });
      if (prop.ok) nom = prop.nomination;
    }
    if (!nom || nom.status !== 'PENDING') return { ok: false, reason: 'nomination-not-found' };

    const S = W.sect;
    const master = W.byId[S.masterId] || W.npcs.find(n => n && !n.dead);
    const cand = W.byId[nom.candidateId];
    const agitator = W.byId[nom.leaderId] || cand;
    const clique = pol.cliques[nom.cliqueId];

    // Determine Master's choice if AUTO
    let choice = String(masterChoice || 'AUTO').toUpperCase();
    if (choice === 'AUTO' && master) {
      const pride = HC.eff(master, 'personality.pride');
      const aggr = HC.eff(master, 'personality.aggression');
      const emp = HC.eff(master, 'personality.empathy');
      const mer = S.policy ? S.policy.meritocracy : 50;
      const allCands = (W.npcs || []).filter(n => n && !n.dead && !n.exiled && n.id !== master.id && n.id !== S.deputyId);
      allCands.sort((a, b) => SECT.appointScore(W, nom.post, b, master) - SECT.appointScore(W, nom.post, a, master));
      const masterBest = allCands[0];
      const relToAgitator = agitator ? SECT.relationScore(master, agitator) : 0;

      // Unyielding / proud master who dislikes being pressured dismisses the agitator!
      if ((pride >= 65 || aggr >= 68) && emp < 48 && nom.pressureLevel >= 35 && relToAgitator < 25) {
        choice = 'DISMISS_AGITATOR';
      } else if (masterBest && cand && masterBest.id !== cand.id && mer >= 58 && SECT.appointScore(W, nom.post, masterBest, master) > SECT.appointScore(W, nom.post, cand, master) + 5) {
        choice = 'OVERRIDE_APPOINT';
      } else {
        choice = 'ACCEPT_NOMINEE';
      }
    }

    nom.status = 'RESOLVED';
    nom.resolvedDay = W.day || 0;
    nom.resolutionChoice = choice;
    let summaryTh = '';
    let undercurrentDelta = 0;
    let dismissedLeaderId = null;
    let appointedNpcId = null;

    if (choice === 'ACCEPT_NOMINEE' || choice === 'ACCEPT') {
      if (cand && !cand.dead) {
        S.unlockSpecializedOffices = true;
        SECT.appoint(W, nom.post, cand, 'แต่งตั้งตามมติเสนอชื่อของ' + nom.cliqueNameTh);
        appointedNpcId = cand.id;
      }
      undercurrentDelta = -8;
      pol.undercurrent = clamp((pol.undercurrent || 0) + undercurrentDelta, 0, 100);
      if (clique) {
        clique.satisfaction = clamp((clique.satisfaction || 60) + 12, 0, 100);
        (clique.memberIds || []).forEach(mid => {
          const m = W.byId[mid];
          if (m && !m.dead) m.sat = clamp((m.sat || 60) + 8, 0, 100);
        });
      }
      summaryTh = (master ? HC.fullName(master) : 'เจ้าสำนัก') + ' ยอมรับข้อเสนอของ' + nom.cliqueNameTh + ' แต่งตั้ง ' + (cand ? HC.fullName(cand) : nom.candidateNameTh) + ' เป็น' + nom.postNameTh + ' (คลื่นใต้น้ำลดลง -8)';
    } else if (choice === 'DISMISS_AGITATOR' || choice === 'SUPPRESS_CLIQUE' || choice === 'DISMISS') {
      // Unyielding Sect Master refuses pressure, dismisses/demotes the pressuring clique leader, and surges undercurrent!
      if (agitator && !agitator.dead) {
        dismissedLeaderId = agitator.id;
        if (agitator.post) {
          SECT.dismiss(W, agitator.post, 'กดดันเจ้าสำนักและตั้งก๊กท้าทายอำนาจ');
        } else if ((agitator.rank || 0) >= 2) {
          SECT.setRank(W, agitator, Math.max(1, agitator.rank - 1), 'กดดันเจ้าสำนักเรื่องการแต่งตั้งตำแหน่ง');
        }
        agitator.sat = clamp((agitator.sat || 60) - 28, 0, 100);
        if (master) {
          const r = SECT.rel(agitator, master.id);
          r.a = clamp((r.a || 0) - 22, -100, 100);
          r.v = clamp((r.v || 0) + 25, 0, 100);
        }
      }
      // Master appoints their own preferred candidate instead
      const altCands = (W.npcs || []).filter(n => n && !n.dead && !n.exiled && n.id !== (master && master.id) && n.id !== S.deputyId && n.id !== (cand && cand.id) && n.id !== (agitator && agitator.id));
      altCands.sort((a, b) => SECT.appointScore(W, nom.post, b, master) - SECT.appointScore(W, nom.post, a, master));
      const altPick = (opts.preferredNpcId && W.byId[opts.preferredNpcId]) || altCands[0];
      if (altPick) {
        S.unlockSpecializedOffices = true;
        SECT.appoint(W, nom.post, altPick, 'เจ้าสำนักแต่งตั้งโดยเด็ดขาดหลังปราบก๊กกดดัน');
        appointedNpcId = altPick.id;
      }
      undercurrentDelta = 26;
      pol.undercurrent = clamp((pol.undercurrent || 0) + undercurrentDelta, 0, 100);
      if (clique) {
        clique.satisfaction = clamp((clique.satisfaction || 60) - 25, 0, 100);
        (clique.memberIds || []).forEach(mid => {
          const m = W.byId[mid];
          if (m && !m.dead) {
            m.sat = clamp((m.sat || 60) - 14, 0, 100);
            if (master) {
              const rm = SECT.rel(m, master.id);
              rm.a = clamp((rm.a || 0) - 10, -100, 100);
              rm.v = clamp((rm.v || 0) + 12, 0, 100);
            }
          }
        });
      }
      summaryTh = '⚡ ' + (master ? HC.fullName(master) : 'เจ้าสำนัก') + ' ไม่ยอมจำนนต่อแรงกดดันของ' + nom.cliqueNameTh + ' สั่งปลด/ลดขั้นแกนนำ「' + (agitator ? HC.fullName(agitator) : nom.leaderNameTh) + '」ทันที! (คลื่นใต้น้ำพุ่งสูง +26 เป็น ' + pol.undercurrent + '/100)';
    } else {
      // OVERRIDE_APPOINT: Master rejects clique nominee and appoints by own judgment without purging the clique leader
      const altCands = (W.npcs || []).filter(n => n && !n.dead && !n.exiled && n.id !== (master && master.id) && n.id !== S.deputyId && n.id !== (cand && cand.id));
      altCands.sort((a, b) => SECT.appointScore(W, nom.post, b, master) - SECT.appointScore(W, nom.post, a, master));
      const altPick = (opts.preferredNpcId && W.byId[opts.preferredNpcId]) || altCands[0] || cand;
      if (altPick) {
        S.unlockSpecializedOffices = true;
        SECT.appoint(W, nom.post, altPick, 'เจ้าสำนักคัดเลือกด้วยดุลยพินิจของตนเอง');
        appointedNpcId = altPick.id;
      }
      undercurrentDelta = 12;
      pol.undercurrent = clamp((pol.undercurrent || 0) + undercurrentDelta, 0, 100);
      if (clique) {
        clique.satisfaction = clamp((clique.satisfaction || 60) - 12, 0, 100);
        (clique.memberIds || []).forEach(mid => {
          const m = W.byId[mid];
          if (m && !m.dead) m.sat = clamp((m.sat || 60) - 6, 0, 100);
        });
      }
      summaryTh = (master ? HC.fullName(master) : 'เจ้าสำนัก') + ' ปัดตกข้อเสนอของ' + nom.cliqueNameTh + ' และแต่งตั้ง ' + (altPick ? HC.fullName(altPick) : 'ผู้อื่น') + ' เป็น' + nom.postNameTh + ' แทน (เกิดแรงต้านทาน คลื่นใต้น้ำ +12 เป็น ' + pol.undercurrent + '/100)';
    }

    SECT.updateUndercurrentStatus(W);
    pol.history.unshift({
      day: W.day || 0,
      nominationId: nom.id,
      post: nom.post,
      cliqueId: nom.cliqueId,
      choice,
      appointedNpcId,
      dismissedLeaderId,
      undercurrentAfter: pol.undercurrent,
      summaryTh
    });
    if (pol.history.length > 25) pol.history.length = 25;
    if (!opts.quiet && W.log) W.log('politics', summaryTh, [master && master.id, appointedNpcId, dismissedLeaderId].filter(Boolean));
    return {
      ok: true,
      choice,
      nomination: nom,
      appointedNpcId,
      dismissedLeaderId,
      undercurrent: pol.undercurrent,
      undercurrentDelta,
       undercurrentStage: pol.undercurrentStage,
      summaryTh
    };
  };

  SECT.updateUndercurrentStatus = W => {
    const pol = SECT.ensureHierarchyAndPolitics(W);
    if (!pol) return null;
    const uc = clamp(Math.round(pol.undercurrent || 0), 0, 100);
    pol.undercurrent = uc;
    if (uc >= 80) {
      pol.undercurrentStage = 'CRISIS';
      pol.undercurrentLabelTh = 'วิกฤตคลื่นใต้น้ำเดือดพล่าน (เสี่ยงกบฏ/ท้าชิงเจ้าสำนัก)';
      pol.efficiencyMultiplier = 0.65;
    } else if (uc >= 60) {
      pol.undercurrentStage = 'TURBULENT';
      pol.undercurrentLabelTh = 'คลื่นใต้น้ำปะทุ (ก๊กการเมืองประท้วงเงียบและถ่วงงาน)';
      pol.efficiencyMultiplier = 0.78;
    } else if (uc >= 30) {
      pol.undercurrentStage = 'SIMMERING';
      pol.undercurrentLabelTh = 'คลื่นใต้น้ำก่อตัว (เริ่มมีความกินแหนงแคลงใจในสภา)';
      pol.efficiencyMultiplier = 0.90;
    } else {
      pol.undercurrentStage = 'CALM';
      pol.undercurrentLabelTh = 'คลื่นลมสงบ (สภาสำนักเป็นปึกแผ่น)';
      pol.efficiencyMultiplier = 1.00;
    }
    return pol;
  };

  SECT.appeaseUndercurrent = (W, mode, opts) => {
    opts = opts || {};
    const pol = SECT.ensureHierarchyAndPolitics(W);
    if (!pol) return { ok: false, reason: 'no-politics' };
    const actMode = String(mode || 'COUNCIL_CONCESSION').toUpperCase();
    const stoneCost = actMode === 'REWARD_CLIQUES' ? 240 : 120;
    if (!opts.free && W.sect.stones < stoneCost) {
      return { ok: false, reason: 'insufficient-stones', required: stoneCost };
    }
    if (!opts.free && ECO && ECO.pay) {
      ECO.pay(W, stoneCost, 'จัดประชุมสภาคลี่คลายคลื่นใต้น้ำ (' + actMode + ')');
    }
    const drop = actMode === 'REWARD_CLIQUES' ? 28 : 18;
    pol.undercurrent = clamp((pol.undercurrent || 0) - drop, 0, 100);
    SECT.CLIQUE_IDS.forEach(cid => {
      if (pol.cliques[cid]) pol.cliques[cid].satisfaction = clamp((pol.cliques[cid].satisfaction || 60) + 10, 0, 100);
    });
    (W.npcs || []).forEach(n => {
      if (n && !n.dead && !n.exiled) n.sat = clamp((n.sat || 60) + 5, 0, 100);
    });
    SECT.updateUndercurrentStatus(W);
    const summaryTh = 'เปิดสภาเจรจาประนีประนอมและจัดสรรทรัพยากรให้ก๊กต่าง ๆ ลดคลื่นใต้น้ำลง -' + drop + ' เหลือ ' + pol.undercurrent + '/100';
    if (!opts.quiet && W.log) W.log('politics', '🕊️ ' + summaryTh, []);
    return { ok: true, mode: actMode, undercurrent: pol.undercurrent, undercurrentStage: pol.undercurrentStage, summaryTh };
  };

  SECT.tickInternalPolitics = (W, opts) => {
    opts = opts || {};
    const pol = SECT.syncInternalCliques(W);
    if (!pol) return null;
    SECT.evaluateSectAlignment(W);
    SECT.evaluateSectTier(W);
    SECT.updateUndercurrentStatus(W);

    let crisisTriggered = null;
    if (pol.undercurrent >= 80) {
      // High undercurrent crisis: most dissatisfied clique leader challenges leadership or stages a schism
      const aggrievedId = SECT.CLIQUE_IDS.slice().sort((a, b) => (pol.cliques[a].satisfaction || 50) - (pol.cliques[b].satisfaction || 50))[0];
      const aggClique = pol.cliques[aggrievedId];
      const challenger = (aggClique && aggClique.leaderId && W.byId[aggClique.leaderId]) || W.npcs.find(n => n && !n.dead && n.id !== W.sect.masterId);
      const master = W.byId[W.sect.masterId];
      if (challenger && master && challenger.id !== master.id) {
        W.duelQueue = W.duelQueue || [];
        if (!W.duelQueue.some(d => d.kind === 'leadership')) {
          W.duelQueue.push({ a: challenger.id, b: master.id, kind: 'leadership', serious: false, cause: 'UNDERCURRENT_CRISIS' });
        }
        pol.undercurrent = clamp(pol.undercurrent - 20, 0, 100);
        SECT.updateUndercurrentStatus(W);
        crisisTriggered = {
          kind: 'UNDERCURRENT_LEADERSHIP_CHALLENGE',
          cliqueId: aggClique.id,
          cliqueNameTh: aggClique.nameTh,
          challengerId: challenger.id,
          challengerNameTh: HC.fullName(challenger),
          masterId: master.id,
          summaryTh: '🔥 คลื่นใต้น้ำปะทุถึงขีดสุด!「' + HC.fullName(challenger) + '」แกนนำ' + aggClique.nameTh + ' ลุกขึ้นท้าชิงตำแหน่งเจ้าสำนักจาก「' + HC.fullName(master) + '」กลางโถงสภา!'
        };
        if (!opts.quiet && W.log) W.log('challenge', crisisTriggered.summaryTh, [challenger.id, master.id]);
      }
    }
    return {
      ok: true,
      undercurrent: pol.undercurrent,
      undercurrentStage: pol.undercurrentStage,
      efficiencyMultiplier: pol.efficiencyMultiplier,
      crisisTriggered
    };
  };
  SECT.INTERNAL_POLITICS = {
    syncCliques: SECT.syncInternalCliques,
    proposeNomination: SECT.proposeCliqueNomination,
    resolveNomination: SECT.resolvePoliticalNomination,
    appeaseUndercurrent: SECT.appeaseUndercurrent,
    tick: SECT.tickInternalPolitics
  };

  const sectDailyV210 = SECT.daily;
  SECT.daily = W => {
    const result = sectDailyV210 ? sectDailyV210(W) : undefined;
    WMC.tick(W);
    SECT.CELESTIAL_TRIBULATION.tick(W);
    MENTORSHIP.daily(W);
    JIANGHU.daily(W);
    if (SECT.tickExchangeDisciples) SECT.tickExchangeDisciples(W);
    if (SECT.AUTOMATION && SECT.AUTOMATION.runDailyAutomation) SECT.AUTOMATION.runDailyAutomation(W, { quiet: true });
    if (CULT && CULT.EXPERIENCE_TRAITS && CULT.EXPERIENCE_TRAITS.recordExperienceEvent && Array.isArray(W.npcs)) {
      for (const m of W.npcs) {
        if (!m || m.dead) continue;
        const hasActiveVow = !!(m.voluntaryVows && Object.keys(m.voluntaryVows).some(k => m.voluntaryVows[k] && m.voluntaryVows[k].active && !m.voluntaryVows[k].broken));
        const hasOathOrContract = !!((m.daoOath && !m.daoOath.broken) || (m.soulContract && m.soulContract.active));
        if (hasActiveVow || hasOathOrContract) {
          CULT.EXPERIENCE_TRAITS.recordExperienceEvent(W, m, 'UPHELD_VOW_OR_CONTRACT', 'day:' + W.day);
        }
      }
    }
    if ((W.day || 0) % 10 === 0 && CULT && CULT.GRAND_DAO_MECHANICS && CULT.GRAND_DAO_MECHANICS.monthlyAutonomousTick) {
      CULT.GRAND_DAO_MECHANICS.monthlyAutonomousTick(W);
    }
    if (SECT.PEAKS && SECT.PEAKS.dailyTick && ((W.day || 0) % 15 === 0)) SECT.PEAKS.dailyTick(W, { quiet: true, skipBaseTick: true });
    if (SECT.BOUNTY_BOARD && SECT.BOUNTY_BOARD.ensure) {
      const bb = SECT.BOUNTY_BOARD.ensure(W);
      if (bb && (!bb.activeBounties.some(b => b && b.status === 'OPEN') || ((W.day || 0) - (bb.lastRefreshDay || 0)) >= 15)) {
        if (bb.lastRefreshDay !== (W.day || 0)) SECT.BOUNTY_BOARD.refreshBounties(W, { quiet: true });
      }
    }
    if ((W.day || 0) > 360 && (W.day || 0) % 18 === 0) SECT.holdGrandDaoLecture(W, null, { quiet: true });
    if ((W.day || 0) > 360 && (W.day || 0) % 9 === 0) SECT.tickDungeon(W, { quiet: true });
    if ((W.day || 0) > 360 && (W.day || 0) % 6 === 0) {
      SECT.runOfficerJurisdictions(W, { quiet: true });
      SECT.tickInternalPolitics(W, { quiet: true });
    } else {
      SECT.evaluateSectTier(W);
      SECT.evaluateSectAlignment(W);
    }
    return result;
  };

  SECT.marshalStrikeForce = (W, party, targetSectOrId, opts) => g.EXPED.marshalStrikeForce(W, party, targetSectOrId, opts);
  SECT.resolveSectSiege = (W, siegeOrEx, opts) => g.EXPED.resolveSectSiege(W, siegeOrEx, opts);
  SECT.claimResourceNode = (W, nodeId, party, opts) => g.EXPED.claimResourceNode(W, nodeId, party, opts);
  SECT.assignNodeGarrison = (W, nodeId, spec) => g.EXPED.assignNodeGarrison(W, nodeId, spec);
  SECT.awakenFourSymbolBloodline = (W, n, petUid, symbolId, opts) => g.CULT.awakenFourSymbolBloodline(W, n, petUid, symbolId, opts);


  /* ---------- Patch v2.0.20: Player Sect Succession Crisis (Deputy vs. Designated Successor) & Edit Hub Jianghu Hooks ---------- */
  SECT.resolvePlayerSuccessionCrisis = (W, why, opts) => {
    opts = opts || {};
    if (!W || !W.sect) return { ok: false, reason: 'invalid-world' };
    const S = W.sect;
    const oldMaster = W.byId[S.masterId];
    if (oldMaster && g.SIM && g.SIM.snapshotPerson) {
      g.SIM.snapshotPerson(W, oldMaster, why || 'อดีตเจ้าสำนักผู้ล่วงลับ');
    }
    let deputy = (S.deputyId && W.byId[S.deputyId] && !W.byId[S.deputyId].dead && !W.byId[S.deputyId].exiled) ? W.byId[S.deputyId] : null;
    let succ = SECT.holder(W, 'disciples') || (S.successorId && W.byId[S.successorId] && !W.byId[S.successorId].dead && !W.byId[S.successorId].exiled ? W.byId[S.successorId] : null);

    // If either deputy or successor is missing, convene 4-clique council & Peak Masters to nominate top two contenders
    if (!deputy || !succ || deputy.id === succ.id) {
      const pool = (W.npcs || []).filter(n => n && !n.dead && !n.exiled && (!oldMaster || n.id !== oldMaster.id));
      pool.sort((a, b) => {
        const scB = (b.peakRole === 'MASTER' ? 60 : 0) + (b.rank || 1) * 25 + (CULT.power ? CULT.power(b) : 50) + (b.merit || 0) * 0.5;
        const scA = (a.peakRole === 'MASTER' ? 60 : 0) + (a.rank || 1) * 25 + (CULT.power ? CULT.power(a) : 50) + (a.merit || 0) * 0.5;
        return scB - scA;
      });
      if (!succ && pool[0]) succ = pool[0];
      if ((!deputy || (succ && deputy.id === succ.id)) && pool.length >= 2) {
        deputy = pool.find(n => !succ || n.id !== succ.id) || null;
      }
      if (!deputy || !succ || deputy.id === succ.id) {
        const nm = SECT.succession(W, why);
        if (nm) {
          if (nm.post) { S.posts[nm.post] = null; nm.post = null; }
          if (S.deputyId === nm.id) S.deputyId = null;
          if (S.successorId === nm.id) S.successorId = null;
          nm.rank = 6;
          S.masterId = nm.id;
        }
        return { ok: !!nm, outcome: 'STANDARD_SUCCESSION', newMaster: nm };
      }
    }

    if (HC && HC.bump) { HC.bump(deputy); HC.bump(succ); }
    const dAmb = HC.eff(deputy, 'personality.ambition');
    const dPride = HC.eff(deputy, 'personality.pride');
    const dAggr = HC.eff(deputy, 'personality.aggression');
    const dInt = HC.eff(deputy, 'personality.integrity');
    const dLoy = HC.eff(deputy, 'personality.loyalty');
    const highAmbitionChallenger = dAmb >= 75;
    const deputyUsurpDrive = Math.round(
      (dAmb - 50) * 0.55 + (dPride - 50) * 0.32 + (dAggr - 50) * 0.30 - (dInt - 50) * 0.50 - (dLoy - 50) * 0.45 +
      (highAmbitionChallenger ? 20 : 0) + (opts.forceUsurpAttempt ? 45 : opts.forceHonorable ? -50 : 0)
    );

    // Compute Successor's backing from elders, relationships, charisma, and combat power
    const elders = (W.npcs || []).filter(n => n && !n.dead && !n.exiled && n.id !== deputy.id && n.id !== succ.id && (n.rank || 0) >= 3);
    let elderSupport = 0;
    elders.forEach(el => {
      const rSucc = SECT.relationScore(el, succ);
      const rDep = SECT.relationScore(el, deputy);
      const elInt = HC.eff(el, 'personality.integrity');
      if (rSucc + (elInt - 50) * 0.3 >= rDep) elderSupport += 10;
      else elderSupport -= 6;
    });
    const powerRatio = CULT.power(succ) / Math.max(50, CULT.power(deputy));
    const successorBacking = clamp(Math.round(
      30 + powerRatio * 25 + (HC.eff(succ, 'social.charisma') - 50) * 0.35 + elderSupport + (opts.successorBackingMod || 0)
    ), 5, 100);

    let outcome = 'HONORABLE_SUPPORT';
    let winner = succ;
    let storyTh = '';
    const pol = SECT.ensureHierarchyAndPolitics(W);

    if (deputyUsurpDrive < 12) {
      outcome = 'HONORABLE_SUPPORT';
      winner = succ;
      if (succ.post) { S.posts[succ.post] = null; succ.post = null; }
      S.successorId = null;
      succ.rank = 6;
      S.masterId = succ.id;
      succ.sat = 95;
      deputy.sat = clamp((deputy.sat || 70) + 6, 0, 100);
      storyTh = 'รองเจ้าสำนัก「' + HC.fullName(deputy) + '」ยึดมั่นในคุณธรรมและความภักดี ปกป้องพินัยกรรมของเจ้าสำนักคนก่อน ประคองศิษย์สืบทอด「' + HC.fullName(succ) + '」ขึ้นดำรงตำแหน่งเจ้าสำนักคนใหม่ท่ามกลางความเลื่อมใสของเหล่าผู้อาวุโส!';
    } else if (successorBacking < 50 && !opts.forceSchism) {
      outcome = 'DEPUTY_USURP';
      winner = deputy;
      if (succ.post === 'disciples') { S.posts.disciples = null; succ.post = null; }
      S.successorId = null;
      S.deputyId = null;
      deputy.rank = 6;
      S.masterId = deputy.id;
      deputy.sat = 95;
      succ.sat = clamp((succ.sat || 60) - 30, 0, 100);
      if (pol) pol.undercurrent = clamp((pol.undercurrent || 0) + 18, 0, 100);
      storyTh = 'รองเจ้าสำนัก「' + HC.fullName(deputy) + '」ผู้มีความทะเยอทะยานสูง (' + Math.round(dAmb) + ') อาศัยอำนาจในสภาและจังหวะที่ศิษย์สืบทอด「' + HC.fullName(succ) + '」ยังขาดแรงหนุนหลัง (' + successorBacking + '/100) ก้าวขึ้นยึดครองตำแหน่งเจ้าสำนักด้วยตนเอง! (คลื่นใต้น้ำ +18)';
    } else {
      outcome = 'SUCCESSION_SCHISM';
      const succScore = CULT.power(succ) * (1 + successorBacking / 100);
      const depScore = CULT.power(deputy) * (1 + deputyUsurpDrive / 130);
      const succWins = opts.forceWinner === 'SUCCESSOR' ? true : opts.forceWinner === 'DEPUTY' ? false : (succScore >= depScore);
      if (succWins) {
        winner = succ;
        if (succ.post) { S.posts[succ.post] = null; succ.post = null; }
        S.successorId = null;
        if (S.deputyId === succ.id || S.deputyId === deputy.id) S.deputyId = null;
        succ.rank = 6;
        S.masterId = succ.id;
        deputy.rank = Math.max(1, (deputy.rank || 5) - 2);
        deputy.sat = clamp((deputy.sat || 50) - 35, 0, 100);
        if (pol) pol.undercurrent = clamp((pol.undercurrent || 0) + 14, 0, 100);
        storyTh = 'รองเจ้าสำนัก「' + HC.fullName(deputy) + '」คิดชิงบัลลังก์เจ้าสำนัก แต่ศิษย์สืบทอด「' + HC.fullName(succ) + '」มีเหล่าผู้อาวุโสหนุนหลัง (' + successorBacking + '/100) จึงเปิดศึกประลองชิงตราหยกเจ้าสำนักกลางลานประลอง สยบรองเจ้าสำนักและก้าวขึ้นครองตำแหน่งเจ้าสำนักคนใหม่สำเร็จ!';
      } else {
        winner = deputy;
        if (deputy.post) { S.posts[deputy.post] = null; deputy.post = null; }
        if (succ.post === 'disciples') { S.posts.disciples = null; succ.post = null; }
        S.successorId = null;
        S.deputyId = null;
        deputy.rank = 6;
        S.masterId = deputy.id;
        succ.sat = clamp((succ.sat || 50) - 40, 0, 100);
        if (pol) pol.undercurrent = clamp((pol.undercurrent || 0) + 28, 0, 100);
        storyTh = 'เกิดศึกประลองชิงตราหยกเจ้าสำนัก!「' + HC.fullName(deputy) + '」ใช้ตบะที่เหนือกว่าเอาชนะศิษย์สืบทอด「' + HC.fullName(succ) + '」และผู้หนุนหลัง ก้าวขึ้นเป็นเจ้าสำนักคนใหม่ท่ามกลางคลื่นใต้น้ำที่คุกรุ่น (+28)!';
      }
    }

    // Appoint new Deputy and elect new Designated Successor if available
    if (!S.deputyId) {
      const depCands = (W.npcs || []).filter(n => n && !n.dead && !n.exiled && n.id !== S.masterId && (n.rank || 0) >= 3);
      depCands.sort((a, b) => CULT.power(b) - CULT.power(a));
      if (depCands[0]) {
        S.deputyId = depCands[0].id;
        depCands[0].rank = Math.max(depCands[0].rank || 4, 5);
      }
    }
    if (!SECT.holder(W, 'disciples') && SECT.electSuccessor) {
      SECT.electSuccessor(W);
    }
    SECT.updateUndercurrentStatus(W);

    if (g.EXPED && g.EXPED.recordChronicle) {
      g.EXPED.recordChronicle(W, {
        category: 'SUCCESSION',
        icon: '👑',
        involvedSects: [S.name],
        involvedFigures: [HC.fullName(winner), HC.fullName(deputy), HC.fullName(succ)],
        titleTh: 'การสืบทอดเจ้าสำนัก「' + S.name + '」: ' + HC.fullName(winner) + ' ขึ้นครองบัลลังก์',
        storyTh,
        combatBreakdownTh: 'แรงขับชิงอำนาจรองเจ้าสำนัก: ' + deputyUsurpDrive + ' · แรงหนุนหลังศิษย์สืบทอด: ' + successorBacking + '/100',
        consequenceTh: 'เจ้าสำนักคนใหม่: ' + HC.fullName(winner) + (S.deputyId && W.byId[S.deputyId] ? (' · รองเจ้าสำนัก: ' + HC.fullName(W.byId[S.deputyId])) : '') + (S.successorId && W.byId[S.successorId] ? (' · ศิษย์สืบทอดคนใหม่: ' + HC.fullName(W.byId[S.successorId])) : ''),
        quiet: opts.quiet
      });
    }
    return {
      ok: true,
      outcome,
      newMaster: winner,
      newDeputy: S.deputyId ? W.byId[S.deputyId] : null,
      newSuccessor: S.successorId ? W.byId[S.successorId] : null,
      deputyUsurpDrive,
      successorBacking,
      storyTh
    };
  };

  if (SECT.EDITOR) {
    SECT.EDITOR.interveneJianghuFigure = (W, figOrId, action, payload) => {
      if (g.EXPED && g.EXPED.interveneJianghuFigure) {
        return g.EXPED.interveneJianghuFigure(W, figOrId, action, payload);
      }
      return { ok: false, reason: 'exped-missing' };
    };
  }


  /* ============================================================================
   * Patch v2.0.21: Grand Dao Lectures & Epiphany (มรรคาเทศนาธรรม & รู้แจ้งฉับพลัน)
   * + Sect Dungeon, Captives, Ransom & Defection (คุกคุมขัง เชลยศึก & แปรพักตร์)
   * ============================================================================ */

  SECT.holdGrandDaoLecture = (W, lecturerOrId, opts) => {
    opts = opts || {};
    if (!W || !W.sect) return { ok: false, reason: 'invalid-world' };
    const S = W.sect;
    let lecturer = (lecturerOrId && typeof lecturerOrId === 'object')
      ? lecturerOrId
      : (lecturerOrId && W.byId && W.byId[lecturerOrId])
      || (S.masterId && W.byId && W.byId[S.masterId] && !W.byId[S.masterId].away ? W.byId[S.masterId] : null)
      || (W.npcs || []).find(n => n && !n.dead && !n.exiled && !n.away);
    if (!lecturer || lecturer.dead || lecturer.away) return { ok: false, reason: 'no-lecturer' };

    const lectStage = lecturer.cult ? (CULT.equivalentStage ? CULT.equivalentStage(lecturer) : lecturer.cult.stage) : 3;
    const teachSkill = HC.eff(lecturer, 'social.teaching') || 55;
    const compSkill = HC.eff(lecturer, 'intellect.comprehension') || 55;
    const baseXp = Math.round(24 + lectStage * 8 + (teachSkill + compSkill) * 0.15);

    const attendees = (W.npcs || []).filter(n => n && !n.dead && !n.exiled && !n.away && n.id !== lecturer.id);
    const epiphanyNames = [];
    let cleansedCount = 0;

    attendees.forEach((n, idx) => {
      if (n.h && n.h.state) {
        n.h.state.heartDemon = Math.max(0, (n.h.state.heartDemon || 0) - 20);
        n.h.state.stress = Math.max(0, (n.h.state.stress || 0) - 22);
        n.h.state.mood = Math.min(100, (n.h.state.mood || 50) + 12);
        cleansedCount++;
      }
      n.sat = clamp((n.sat == null ? 60 : n.sat) + 6, 0, 100);
      if (n.cult) {
        CULT.gain(n, baseXp, W, 'dao_lecture');
        const nComp = HC.eff(n, 'intellect.comprehension') || 50;
        const nLuck = (n.h && n.h.destiny && n.h.destiny.luck) || 50;
        const epChance = clamp(0.18 + (nComp - 50) * 0.004 + (nLuck - 50) * 0.003, 0.10, 0.65);
        const triggersEpiphany = (opts.forceEpiphany && idx === 0) || (n.cult.bn != null) || (((n.h.genome || idx) % 100) / 100 < epChance && epiphanyNames.length < 3);
        if (triggersEpiphany) {
          n.cult.bn = null;
          CULT.gain(n, Math.round(baseXp * 1.5), W, 'epiphany_surge');
          if (CULT.ready && CULT.ready(n) && n.cult.stage < CULT.maxStage(n)) {
            n.cult.stage++;
            n.cult.prog = 0;
            n.cult.attempts = 0;
            n.cult.since = W.day;
            if (CULT.refreshLifespan) CULT.refreshLifespan(n);
            if (g.BN && g.BN.onResult) g.BN.onResult(W, n, true);
            if (g.ELEM && g.ELEM.syncSpecialAccess) g.ELEM.syncSpecialAccess(n);
            HC.bump(n);
          }
          epiphanyNames.push(HC.fullName(n));
        }
      }
    });

    S.lastDaoLectureDay = W.day || 360;
    W.fame(3.0);
    const summaryTh = '「' + HC.fullName(lecturer) + '」เปิดแท่นเทศนาธรรมกลางลานสำนัก ถ่ายทอดสัจธรรมวิถี ' + (lecturer.cult ? lecturer.cult.path : 'เต๋า') +
      ' แก่ศิษย์ทั้ง ' + attendees.length + ' คน (ชำระจิตมาร -20 · ตบะ +' + baseXp + ')' +
      (epiphanyNames.length ? (' — เกิดนิมิตดอกบัวบานในใจ! 「' + epiphanyNames.join(', ') + '」ตื่นรู้ฉับพลันทะลวงคอขวดทันที!') : '');

    if (g.EXPED && g.EXPED.recordChronicle) {
      g.EXPED.recordChronicle(W, {
        category: 'INTERNAL',
        icon: '🪷',
        involvedSects: [S.name],
        involvedFigures: [HC.fullName(lecturer)].concat(epiphanyNames),
        titleTh: 'มรรคาเทศนาธรรมแห่ง「' + S.name + '」: ศิษย์ตื่นรู้ฉับพลัน ' + epiphanyNames.length + ' คน!',
        storyTh: summaryTh,
        combatBreakdownTh: 'ผู้แสดงธรรม: ' + HC.fullName(lecturer) + ' (ขั้นเทียบเท่า ' + lectStage + ') · ศิษย์ผู้เข้าฟัง ' + attendees.length + ' คน',
        consequenceTh: epiphanyNames.length ? ('ผู้ตื่นรู้ฉับพลัน: ' + epiphanyNames.join(', ')) : 'ศิษย์ทั้งสำนักจิตใจสงบกระจ่าง ปราศจากจิตมาร',
        quiet: opts.quiet
      });
    }
    return {
      ok: true,
      lecturerId: lecturer.id,
      lecturerNameTh: HC.fullName(lecturer),
      attendeeCount: attendees.length,
      baseXp,
      epiphanyNames,
      summaryTh
    };
  };

  SECT.ensureDungeon = W => {
    if (!W || !W.sect) return null;
    const S = W.sect;
    if (!S.dungeon || typeof S.dungeon !== 'object') {
      S.dungeon = {
        seq: 0,
        prisoners: [],
        history: [],
        stats: { captured: 0, ransomed: 0, interrogated: 0, defected: 0, totalRansomStones: 0 }
      };
    }
    if (!Array.isArray(S.dungeon.prisoners)) S.dungeon.prisoners = [];
    if (!Array.isArray(S.dungeon.history)) S.dungeon.history = [];
    if (!S.dungeon.stats) S.dungeon.stats = { captured: 0, ransomed: 0, interrogated: 0, defected: 0, totalRansomStones: 0 };
    return S.dungeon;
  };

  SECT.capturePrisoner = (W, spec) => {
    spec = spec || {};
    const dng = SECT.ensureDungeon(W);
    if (!dng) return null;
    const allSects = (W.world && W.world.allSects) || [];
    const homeSect = (spec.sectId && g.EXPED && g.EXPED.findSect && g.EXPED.findSect(W, spec.sectId))
      || allSects[(dng.seq + (W.day || 0)) % Math.max(1, allSects.length)]
      || { id: 'S0', nameTh: 'สำนักศัตรู', alignment: 'DEMONIC', majorPath: 'DEMON', tierLevel: 3 };

    const seq = ++dng.seq;
    const sPool = (g.SIM && g.SIM.NAME_POOLS && g.SIM.NAME_POOLS.FAMILY) || ['หลิน', 'มู่หรง', 'ตงฟาง'];
    const gPool = (g.SIM && g.SIM.NAME_POOLS && g.SIM.NAME_POOLS.GIVEN_M) || ['เทียนหยา', 'เจี้ยนซิน', 'อู๋จี๋'];
    const nameTh = spec.nameTh || spec.name || (sPool[(seq * 7 + (W.day || 0)) % sPool.length] + gPool[(seq * 13 + (W.day || 0)) % gPool.length]);
    const stage = clamp(spec.stage || Math.max(2, (homeSect.tierLevel || 2) + 1), 2, 7);
    const ransomStones = spec.ransomStones || Math.round(160 + stage * 65 + (homeSect.tierLevel || 2) * 35);

    const prisoner = {
      id: 'PRIS_' + seq,
      nameTh,
      roleTh: spec.roleTh || (stage >= 5 ? 'ผู้อาวุโสเชลยศึก' : 'ศิษย์เอกเชลยศึก'),
      sectId: spec.sectId || homeSect.id,
      sectNameTh: spec.sectNameTh || spec.sectName || homeSect.nameTh,
      alignment: homeSect.alignment || 'DEMONIC',
      path: spec.path || homeSect.majorPath || 'DEMON',
      stage,
      ransomStones,
      resistance: spec.resistance != null ? spec.resistance : clamp(35 + stage * 6, 20, 85),
      capturedDay: W.day || 360,
      capturedReasonTh: spec.reasonTh || 'ถูกจับกุมจากการปะทะหน้าด่านสำนัก',
      status: 'IMPRISONED'
    };
    dng.prisoners.unshift(prisoner);
    if (dng.prisoners.length > 15) dng.prisoners.length = 15;
    dng.stats.captured = (dng.stats.captured || 0) + 1;
    return prisoner;
  };

  SECT.handleDungeonPrisoner = (W, prisonerOrId, action, opts) => {
    opts = opts || {};
    const dng = SECT.ensureDungeon(W);
    if (!dng) return { ok: false, reason: 'no-dungeon' };

    const act = String(action || 'RANSOM').toUpperCase();
    const VALID_ACTIONS = ['RANSOM', 'INTERROGATE', 'RECRUIT_DEFECTOR', 'RECRUIT'];
    if (!VALID_ACTIONS.includes(act)) {
      return { ok: false, reason: 'invalid-action', action: act };
    }

    const prisId = (typeof prisonerOrId === 'object' && prisonerOrId) ? prisonerOrId.id : prisonerOrId;
    let pris = dng.prisoners.find(p => p && p.id === prisId && p.status === 'IMPRISONED');
    if (!pris && opts.autoSpawnIfEmpty) {
      pris = SECT.capturePrisoner(W);
    }
    if (!pris) return { ok: false, reason: 'prisoner-not-found' };

    const warden = opts.warden || SECT.holder(W, 'warden') || SECT.holder(W, 'censor') || SECT.holder(W, 'discipline') || SECT.holder(W, 'spymaster') || W.byId[W.sect.masterId];
    const wardenNameTh = warden ? HC.fullName(warden) : 'ผู้คุมคุกสำนัก';

    pris.status = 'RESOLVED';
    pris.resolvedDay = W.day || 360;
    pris.resolvedAction = act;
    dng.prisoners = dng.prisoners.filter(p => p && p.id !== pris.id);

    let titleTh = '', storyTh = '', consequenceTh = '';
    const extra = {};
    const homeSect = (W.world && Array.isArray(W.world.allSects)) ? W.world.allSects.find(s => s && (s.id === pris.sectId || s.nameTh === pris.sectNameTh)) : null;

    if (act === 'RANSOM') {
      const wardenBonus = warden ? Math.round((HC.eff(warden, 'social.intimidation') + HC.eff(warden, 'social.persuasion')) * 0.35) : 0;
      const baseRansom = clamp(pris.ransomStones || (180 + (pris.stage || 1) * 60), 100, 1000);
      const stones = baseRansom + wardenBonus;
      if (ECO && ECO.earn) ECO.earn(W, stones, 'ค่าไถ่ตัวเชลยศึก「' + pris.nameTh + '」จาก' + pris.sectNameTh);
      if (homeSect) homeSect.attitude = clamp((homeSect.attitude || 0) + 4, -100, 100);
      dng.stats.ransomed = (dng.stats.ransomed || 0) + 1;
      dng.stats.totalRansomStones = (dng.stats.totalRansomStones || 0) + stones;
      extra.stonesEarned = stones;
      titleTh = 'เรียกค่าไถ่เชลยศึกสำเร็จ: 「' + pris.sectNameTh + '」ยอมจ่าย ' + stones + ' ศิลาวิญญาณ!';
      storyTh = wardenNameTh + ' ส่งสาส์นยื่นคำขาดไปยัง「' + pris.sectNameTh + '」เพื่อเรียกค่าไถ่ตัว「' + pris.nameTh + '」(' + pris.roleTh + ' ขั้น ' + pris.stage + ') ทางสำนักแม่จำต้องส่งทูตนำศิลาวิญญาณ ' + stones + ' ก้อนมาไถ่ตัวกลับไป!';
      consequenceTh = 'คลังสำนักได้รับ +' + stones + ' ศิลาวิญญาณ · ความสัมพันธ์กับ' + pris.sectNameTh + ' +4';
      if (warden && SECT.DESTINY_KARMA && SECT.DESTINY_KARMA.recordKarmicAction) {
        SECT.DESTINY_KARMA.recordKarmicAction(W, warden, 'RELEASE_PRISONER', 15, 'ปล่อยตัวเชลยศึก「' + pris.nameTh + '」หลังไถ่ตัว');
      }
    } else if (act === 'INTERROGATE') {
      const allTechs = (JD && JD.TECH && JD.TECH.techniques) || [];
      const prisKnownTechs = Array.isArray(pris.techs) && pris.techs.length
        ? pris.techs.map(tid => CULT.tech(tid)).filter(Boolean)
        : allTechs.filter(t => t && t.path === pris.path && !t.innateOnly);
      const newTech = prisKnownTechs.find(t => t && !(W.sect.library || []).includes(t.id))
        || allTechs.find(t => t && t.path === pris.path && !t.innateOnly && !(W.sect.library || []).includes(t.id))
        || null;
      if (newTech) {
        W.sect.library = W.sect.library || [];
        if (!W.sect.library.includes(newTech.id)) W.sect.library.push(newTech.id);
        if (g.COG && g.COG.recordHallAddition) g.COG.recordHallAddition(W, 'library', newTech.id, warden ? warden.id : null);
        extra.manualId = newTech.id;
        extra.manualNameTh = newTech.nameTh;
      } else {
        const intelStones = 60 + (pris.stage || 2) * 25;
        if (ECO && ECO.earn) ECO.earn(W, intelStones, 'ข่าวกรองและทรัพย์สินซ่อนเร้นจากเชลยศึก「' + pris.nameTh + '」');
        extra.intelStones = intelStones;
      }
      if (homeSect) homeSect.attitude = clamp((homeSect.attitude || 0) - 10, -100, 100);
      dng.stats.interrogated = (dng.stats.interrogated || 0) + 1;
      titleTh = newTech ? ('เค้นความลับเชลยศึก「' + pris.nameTh + '」ได้คัมภีร์ยุทธ์เข้าหอคัมภีร์!') : ('สอบสวนเชลยศึก「' + pris.nameTh + '」ได้ข่าวกรองและที่ซ่อนศิลาปราณ!');
      storyTh = wardenNameTh + ' ใช้จิตวิทยาและค่ายกลสะกดจิตสอบสวน「' + pris.nameTh + '」(' + pris.roleTh + 'แห่ง' + pris.sectNameTh + ') ในคุกใต้ดิน จนเชลยศึกยอมคายความลับของ' + (newTech ? ('เคล็ดวิชา「' + newTech.nameTh + '」') : 'คลังเสบียงลับและข่าวกรองศึก') + 'ออกมาจนหมดเปลือก!';
      consequenceTh = newTech ? ('หอคัมภีร์ได้รับวิชาใหม่「' + newTech.nameTh + '」· ท่าทีของ' + pris.sectNameTh + ' -10') : ('ได้รับข่าวกรองเชิงลึกและศิลาปราณ +' + (extra.intelStones || 0) + ' · ท่าทีของ' + pris.sectNameTh + ' -10');
    } else if (act === 'RECRUIT_DEFECTOR' || act === 'RECRUIT') {
      const newNpc = g.SIM.addNpc(W, { ageYears: 24 + pris.stage * 3, quality: 0.85, rank: Math.min(3, Math.max(1, pris.stage - 1)), stage: pris.stage });
      if (newNpc && newNpc.h && newNpc.h.name) {
        newNpc.h.name.given = pris.nameTh;
      }
      if (newNpc && newNpc.cult && CULT.PATHS[pris.path]) {
        const pKey = pris.path;
        const pDef = CULT.PATHS[pKey];
        newNpc.cult.path = pKey;
        const chosenSub = (pris.sub && pDef.subPaths && pDef.subPaths.some(s => s.id === pris.sub))
          ? pris.sub
          : ((pDef.subPaths && pDef.subPaths[0] && pDef.subPaths[0].id) || 'NONE');
        newNpc.cult.sub = chosenSub;
        if (CULT.initTrack) {
          newNpc.cult.track = CULT.initTrack(chosenSub, Math.min(9, Math.max(1, pris.stage || newNpc.cult.stage || 2)), (W && W.day) || 1);
        }
        const mList = (JD && JD.TECH && Array.isArray(JD.TECH.mantras)) ? JD.TECH.mantras.filter(m => m && m.path === pKey && (m.tier || 1) <= (newNpc.cult.stage || 2)) : [];
        if (mList.length) {
          newNpc.cult.mantra = mList[mList.length - 1].id;
          newNpc.cult.unlockedMantras = mList.map(m => m.id);
        } else {
          newNpc.cult.mantra = null;
          newNpc.cult.unlockedMantras = [];
        }
        const tList = (JD && JD.TECH && Array.isArray(JD.TECH.techniques))
          ? JD.TECH.techniques.filter(t => t && t.path === pKey && !t.innateOnly && (t.tier || 1) <= (newNpc.cult.stage || 2) && (!t.sub || t.sub === chosenSub)).slice(0, 4).map(t => t.id)
          : [];
        newNpc.cult.techs = tList;
        newNpc.cult.tm = {};
        for (const tid of tList) newNpc.cult.tm[tid] = 45;
        newNpc.cult.innateTechs = [];
        newNpc.cult.passiveLoadout = [];
        if (g.MARTIAL && g.MARTIAL.syncInnateTechs) g.MARTIAL.syncInnateTechs(newNpc);
        if (g.MARTIAL && g.MARTIAL.reconcileInnate) g.MARTIAL.reconcileInnate(newNpc, W);
        if (g.MARTIAL && g.MARTIAL.reconcilePassives) g.MARTIAL.reconcilePassives(newNpc);
        if (g.ELEM && g.ELEM.syncSpecialAccess) g.ELEM.syncSpecialAccess(newNpc);
        if (CULT.ensurePathGauge) CULT.ensurePathGauge(newNpc);
        if (CULT.SECONDARY_RESOURCES && CULT.SECONDARY_RESOURCES.ensureState) CULT.SECONDARY_RESOURCES.ensureState(newNpc);
        if (CULT.GRAND_DAO_MECHANICS && CULT.GRAND_DAO_MECHANICS.ensureNpcState) {
          delete newNpc.cult.grandDaoState;
          CULT.GRAND_DAO_MECHANICS.ensureNpcState(W, newNpc);
        }
        if (CULT.evaluateAutonomousPostures) CULT.evaluateAutonomousPostures(W, newNpc, { trigger: 'awaken' });
        if (pKey === 'SHADOW_SAMURAI' && newNpc.h && newNpc.h.state) {
          newNpc.h.state.qi = 0;
          newNpc.cult.qi = 0;
          newNpc.cult.maxQi = 0;
        }
        if (CULT.refreshLifespan) CULT.refreshLifespan(newNpc);
        if (g.MARTIAL && g.MARTIAL.invalidateMartialCaches) g.MARTIAL.invalidateMartialCaches(newNpc);
        if (g.STATS && g.STATS.dirty) g.STATS.dirty(newNpc);
      }
      if (newNpc) {
        newNpc.renegadeOrigin = {
          sectId: pris.sectId || 'S0',
          sectNameTh: pris.sectNameTh || 'สำนักเดิม',
          sectName: pris.sectNameTh || 'สำนักเดิม',
          formerPostTh: pris.roleTh || 'อดีตศิษย์เชลยศึก',
          pursuitStatus: 'PROTECTED',
          gratitude: 45,
          defectedDay: W.day || 360
        };
        if (g.SIM && g.SIM.snapshotPerson) g.SIM.snapshotPerson(W, newNpc);
        if (SECT.recordDefectorRecruitment) {
          SECT.recordDefectorRecruitment(W, pris, newNpc);
        }
      }
      if (homeSect) homeSect.attitude = clamp((homeSect.attitude || 0) - 16, -100, 100);
      dng.stats.defected = (dng.stats.defected || 0) + 1;
      extra.recruitedNpcId = newNpc ? newNpc.id : null;
      extra.npcId = newNpc ? newNpc.id : null;
      titleTh = 'เกลี้ยกล่อมเชลยศึกแปรพักตร์: 「' + pris.nameTh + '」คุกเข่าสาบานตนเข้าสำนักเรา!';
      storyTh = 'ด้วยบารมีและวาทศิลป์ของ ' + wardenNameTh + ' ทำให้เชลยศึก「' + pris.nameTh + '」(อดีต' + pris.roleTh + ' ขั้น ' + pris.stage + ' แห่ง' + pris.sectNameTh + ') เกิดความเลื่อมใส ยอมตัดขาดจากสำนักเดิมและกล่าวคำสัตย์สาบานเข้าร่วมเป็นกำลังสำคัญของ「' + W.sect.name + '」!';
      consequenceTh = pris.nameTh + ' (ขั้น ' + pris.stage + ') เข้าร่วมสำนัก · ความสัมพันธ์กับ' + pris.sectNameTh + ' -16';
    }

    const histRec = { day: W.day || 360, prisonerId: pris.id, nameTh: pris.nameTh, sectNameTh: pris.sectNameTh, action: act, titleTh, consequenceTh };
    dng.history.unshift(histRec);
    if (dng.history.length > 20) dng.history.length = 20;

    const chron = (g.EXPED && g.EXPED.recordChronicle) ? g.EXPED.recordChronicle(W, {
      category: 'INTERNAL',
      reportFormat: 'DISCIPLINE_EDICT',
      icon: '⛓️',
      involvedSects: [W.sect.name, pris.sectNameTh],
      involvedFigures: [wardenNameTh, pris.nameTh],
      npcIds: [warden && warden.id, extra.recruitedNpcId].filter(Boolean),
      titleTh,
      storyTh,
      originCauseTh: 'เชลยศึก「' + pris.nameTh + '」(' + pris.sectNameTh + ') ถูกคุมขังในคุกใต้ดินสำนัก (' + (pris.capturedReasonTh || 'ถูกจับกุมจากการปะทะ') + ')',
      actorChainTh: wardenNameTh + ' (ผู้คุมทัณฑ์) ➔ ดำเนินการ ' + act + ' ต่อ ' + pris.nameTh,
      systemImpactTh: 'เชื่อมโยง W.sect.dungeon ➔ ' + consequenceTh,
      directorInsightTh: 'การจัดการเชลยศึกสะท้อนแนวทางของสำนักระหว่างผลประโยชน์ศิลาวิญญาณ การชิงคัมภีร์ยุทธ์ หรือการได้ยอดฝีมือมาเสริมทัพ',
      consequenceTh,
      quiet: opts.quiet
    }) : null;

    return Object.assign({ ok: true, action: act, prisoner: pris, chronicle: chron }, extra);
  };

  SECT.executePrisonerAction = SECT.handleDungeonPrisoner;

  SECT.tickDungeon = (W, opts) => {
    opts = opts || {};
    const dng = SECT.ensureDungeon(W);
    if (!dng) return null;
    if (dng.prisoners.length === 0 && (opts.forceSpawn || ((W.day || 0) % 18 === 0))) {
      SECT.capturePrisoner(W);
    }
    if (dng.prisoners.length > 0 && (opts.forceResolve || ((W.day || 0) % 9 === 0))) {
      const m = W.byId[W.sect.masterId];
      const act = m && HC.eff(m, 'personality.empathy') >= 62 ? 'RECRUIT_DEFECTOR' : m && HC.eff(m, 'personality.curiosity') >= 62 ? 'INTERROGATE' : 'RANSOM';
      return SECT.handleDungeonPrisoner(W, dng.prisoners[0], act, opts);
    }
    return { ok: true, prisonerCount: dng.prisoners.length };
  };

  /* ============================================================================
   * Patch v2.0.30:
   * - Pillar 4: Taoist Companions (คู่บำเพ็ญ), Dual Cultivation Synergies & Clan Bloodlines (ทายาทตระกูล)
   * - Pillar 6: Interactive Sect Historical Chronicle Timeline (ทำเนียบประวัติศาสตร์สำนัก)
   * ============================================================================ */

  SECT.MUTATED_ROOT_DEFS = Object.freeze({
    WIND: {
      id: 'WIND',
      nameTh: 'รากปราณวายุสวรรค์ (กลายพันธุ์)',
      element: 'WIND',
      baseElements: ['WOOD', 'FIRE'],
      cultRateBonus: 0.22,
      combatPowerBonus: 0.14,
      btBonus: 0.08,
      descTh: 'รากปราณกลายพันธุ์ธาตุลมบริสุทธิ์ เคลื่อนไหวรวดเร็วปานสายลมและดูดซับปราณฟ้าดินได้ไวกว่าปกติ'
    },
    LIGHTNING: {
      id: 'LIGHTNING',
      nameTh: 'รากปราณอัสนีม่วงพิพากษา (กลายพันธุ์)',
      element: 'LIGHTNING',
      baseElements: ['METAL', 'FIRE'],
      cultRateBonus: 0.25,
      combatPowerBonus: 0.18,
      btBonus: 0.10,
      descTh: 'รากปราณกลายพันธุ์สายฟ้าสวรรค์ ทรงพลังทำลายล้างสูงและทนทานต่อทัณฑ์สวรรค์ยามทะลวงด่าน'
    },
    ICE: {
      id: 'ICE',
      nameTh: 'รากปราณน้ำแข็งบรรพกาล (กลายพันธุ์)',
      element: 'ICE',
      baseElements: ['WATER', 'METAL'],
      cultRateBonus: 0.22,
      combatPowerBonus: 0.15,
      btBonus: 0.09,
      descTh: 'รากปราณกลายพันธุ์เหมันต์พิสุทธิ์ จิตใจเยือกเย็นดั่งกระจกน้ำแข็ง ป้องกันมารในใจและสะกดปราณศัตรู'
    }
  });

  SECT.TIMELINE_TYPES = Object.freeze({
    FOUNDING: { id: 'FOUNDING', nameTh: 'ก่อตั้งสำนัก & บรรพจารย์', icon: '🏛️' },
    SUCCESSION: { id: 'SUCCESSION', nameTh: 'สถาปนาเจ้าสำนักแต่ละรุ่น', icon: '👑' },
    ASCENSION: { id: 'ASCENSION', nameTh: 'บรรลุขั้นเซียนเหินเวหา', icon: '🌩️' },
    WAR_VICTORY: { id: 'WAR_VICTORY', nameTh: 'ชัยชนะในสงครามใหญ่ & ยึดจุดยุทธศาสตร์', icon: '⚔️' },
    LEGENDARY_CRAFT: { id: 'LEGENDARY_CRAFT', nameTh: 'รังสรรค์ศาสตราวุธระดับตำนาน', icon: '🗡️' },
    COMPANION_BLOODLINE: { id: 'COMPANION_BLOODLINE', nameTh: 'ผูกวาสนาคู่บำเพ็ญ & กำเนิดทายาทสายเลือด', icon: '💞' }
  });

  SECT.ensureCompanionsAndBloodlines = W => {
    if (!W || !W.sect) return null;
    const S = W.sect;
    if (!Array.isArray(S.companions)) S.companions = [];
    if (!Array.isArray(S.offspring)) S.offspring = [];
    if (!Array.isArray(S.timeline)) S.timeline = [];
    if (typeof S.companionSeq !== 'number') S.companionSeq = S.companions.length;
    if (typeof S.offspringSeq !== 'number') S.offspringSeq = S.offspring.length;
    if (typeof S.timelineSeq !== 'number') S.timelineSeq = S.timeline.length;

    // Seed founding milestone once if timeline is empty
    if (S.timeline.length === 0) {
      const founder = (S.masterId && W.byId && W.byId[S.masterId]) || (W.npcs && W.npcs[0]);
      S.timelineSeq = 1;
      S.timeline.push({
        id: 'TL_1',
        day: 360,
        year: 1,
        month: 1,
        generation: 1,
        milestoneType: 'FOUNDING',
        typeNameTh: SECT.TIMELINE_TYPES.FOUNDING.nameTh,
        reportFormatTh: '🕯️ จารึกศิลาหอบรรพชน',
        originCauseTh: 'ปณิธานการบุกเบิกสำนักและวางรากฐานค่ายกลพิทักษ์เขา',
        systemImpactTh: 'สถาปนาเจ้าสำนักรุ่นที่ 1 · เปิดระบบบริหารสำนักและรับศิษย์รุ่นบุกเบิก',
        icon: '🏛️',
        titleTh: 'ก่อตั้ง「' + (S.name || 'สำนักเมฆาหยก') + '」และสถาปนาเจ้าสำนักรุ่นที่ 1',
        descTh: 'ปรมาจารย์ผู้ก่อตั้ง「' + (founder ? HC.fullName(founder) : 'เจ้าสำนักรุ่นแรก') + '」เปิดค่ายกลพิทักษ์เขาและรับศิษย์รุ่นบุกเบิกเข้าสู่มรรคาเซียน',
        involvedIds: founder ? [founder.id] : []
      });
    }
    return { companions: S.companions, offspring: S.offspring, timeline: S.timeline };
  };

  SECT.recordTimelineMilestone = (W, entry) => {
    if (!W || !W.sect || !entry) return null;
    SECT.ensureCompanionsAndBloodlines(W);
    const S = W.sect;
    const day = Number.isFinite(entry.day) ? entry.day : (Number.isFinite(W.day) ? W.day : 0);
    const cal = (g.SIM && g.SIM.calendar) ? g.SIM.calendar(day * 1440) : { year: Math.floor(day / 360) + 1, month: Math.floor(((day % 360) / 30)) + 1 };
    const mType = (entry.milestoneType && SECT.TIMELINE_TYPES[entry.milestoneType]) ? entry.milestoneType : 'FOUNDING';
    const tDef = SECT.TIMELINE_TYPES[mType];
    const gen = entry.generation || Math.max(1, ((S.lineage && Array.isArray(S.lineage.successions) ? S.lineage.successions.length : 0) + 1));

    const defaultFmtByMilestone = {
      FOUNDING: '🕯️ จารึกศิลาหอบรรพชน',
      SUCCESSION: '🕯️ จารึกศิลาหอบรรพชน',
      ASCENSION: '🕯️ จารึกศิลาหอบรรพชน',
      WAR_VICTORY: '⚔️ บันทึกศึกหอพิชัยยุทธ์',
      LEGENDARY_CRAFT: '📜 จารึกหอศาสตราเทพ',
      COMPANION_BLOODLINE: '💞 สมุดหยกหอวาสนาและสายเลือดตระกูล'
    };
    const defaultOriginByMilestone = {
      FOUNDING: 'การบุกเบิกสำนักและวางรากฐานค่ายกลพิทักษ์เขา',
      SUCCESSION: 'การผลัดเปลี่ยนเจ้าสำนักตามครรลองมรรคาและพินัยกรรมสำนัก',
      ASCENSION: 'การบำเพ็ญเพียรจนถึงขีดสุดและฝ่าด่านทัณฑ์สวรรค์ 9 สายฟ้า',
      WAR_VICTORY: 'การระดมพลทำศึกยุทธศาสตร์และพันธมิตรร่วมรบในยุทธภพ',
      LEGENDARY_CRAFT: 'การหลอมสร้างศาสตราวุธและโอสถระดับตำนานในหอหลอมสร้าง',
      COMPANION_BLOODLINE: 'ความผูกพันลึกซึ้งของศิษย์ในสำนักและการสืบทอดสายเลือดผู้ฝึกตน'
    };
    const rec = {
      id: entry.id || ('TL_' + (++S.timelineSeq)),
      day,
      year: entry.year || cal.year,
      month: entry.month || cal.month,
      generation: gen,
      milestoneType: mType,
      typeNameTh: tDef.nameTh,
      reportFormatTh: entry.reportFormatTh || defaultFmtByMilestone[mType] || '🕯️ จารึกศิลาหอบรรพชน',
      originCauseTh: entry.originCauseTh || defaultOriginByMilestone[mType] || '',
      systemImpactTh: entry.systemImpactTh || entry.descTh || '',
      icon: entry.icon || tDef.icon,
      titleTh: entry.titleTh || tDef.nameTh,
      descTh: entry.descTh || '',
      involvedIds: Array.isArray(entry.involvedIds) ? entry.involvedIds : []
    };
    S.timeline.unshift(rec);
    if (S.timeline.length > 160) S.timeline.length = 160;
    if (g.SFX && g.SFX.playBell && !entry.quiet) {
      g.SFX.playBell();
    }
    return rec;
  };

  SECT.getHistoricalTimeline = (W, filterType) => {
    if (!W || !W.sect) return [];
    SECT.ensureCompanionsAndBloodlines(W);
    const S = W.sect;
    const list = S.timeline.slice();
    const seenTitles = new Set(list.map(x => x && x.titleTh));

    // Synthesize any succession records not yet in S.timeline
    const succs = (S.lineage && Array.isArray(S.lineage.successions)) ? S.lineage.successions : [];
    succs.forEach((sc, idx) => {
      const title = 'สถาปนาเจ้าสำนักรุ่นที่ ' + (idx + 2) + ': ' + (sc.toName || 'เจ้าสำนักคนใหม่');
      if (!seenTitles.has(title)) {
        seenTitles.add(title);
        const d = sc.day || 360;
        list.push({
          id: 'TL_SUCC_' + idx,
          day: d,
          year: Math.floor(d / 360) + 1,
          month: Math.floor(((d % 360) / 30)) + 1,
          generation: idx + 2,
          milestoneType: 'SUCCESSION',
          typeNameTh: SECT.TIMELINE_TYPES.SUCCESSION.nameTh,
          icon: '👑',
          titleTh: title,
          descTh: 'รับช่วงต่อตำแหน่งเจ้าสำนักต่อจาก ' + (sc.fromName || 'เจ้าสำนักรุ่นก่อน') + ' (' + (sc.why || 'สืบทอดตำแหน่ง') + ')',
          involvedIds: [sc.toId, sc.fromId].filter(Boolean)
        });
      }
    });

    // Synthesize any ascension records from ancestors
    const ancs = (S.ancestors && Array.isArray(S.ancestors)) ? S.ancestors : [];
    ancs.filter(a => a && a.status === 'ASCENDED').forEach((a, idx) => {
      const title = 'ศิษย์บรรลุเซียนเหินเวหา: 「' + (a.nameTh || a.name) + '」ขึ้นสู่แดนเซียนเบื้องบน';
      if (!seenTitles.has(title)) {
        seenTitles.add(title);
        const d = a. enshrinedDay || a.day || 360;
        list.push({
          id: 'TL_ASC_' + idx,
          day: d,
          year: Math.floor(d / 360) + 1,
          month: Math.floor(((d % 360) / 30)) + 1,
          generation: 1,
          milestoneType: 'ASCENSION',
          typeNameTh: SECT.TIMELINE_TYPES.ASCENSION.nameTh,
          icon: '🌩️',
          titleTh: title,
          descTh: 'ฝ่าด่านทัณฑ์สวรรค์ 9 สายฟ้าสำเร็จและเหินเวหาขึ้นสู่เบื้องบน ทิ้งป้ายวิญญาณและพรบรรพชนไว้คุ้มครองสำนัก',
          involvedIds: a.npcId ? [a.npcId] : []
        });
      }
    });

    list.forEach(item => {
      if (!item) return;
      if (!item.reportFormatTh) item.reportFormatTh = '🕯️ จารึกศิลาหอบรรพชน';
      if (!item.originCauseTh) item.originCauseTh = 'หมุดหมายสำคัญในการสืบทอดและพัฒนาสำนัก';
      if (!item.systemImpactTh) item.systemImpactTh = item.descTh || item.titleTh || '';
    });
    list.sort((a, b) => (b.day || 0) - (a.day || 0));
    if (filterType && filterType !== 'all' && filterType !== 'ALL') {
      return list.filter(x => x && x.milestoneType === filterType);
    }
    return list;
  };

  SECT.bindTaoistCompanions = (W, npcAOrId, npcBOrId, opts) => {
    opts = opts || {};
    if (!W || !W.sect) return { ok: false, reason: 'invalid-world' };
    SECT.ensureCompanionsAndBloodlines(W);
    const S = W.sect;
    const alive = (W.npcs || []).filter(n => n && !n.dead && !n.exiled);

    let a = typeof npcAOrId === 'object' && npcAOrId ? npcAOrId : (npcAOrId && W.byId[npcAOrId]);
    let b = typeof npcBOrId === 'object' && npcBOrId ? npcBOrId : (npcBOrId && W.byId[npcBOrId]);

    if (!a || !b) {
      // Find top compatible pair if not explicitly passed
      let bestPair = null, bestAff = -999;
      for (let i = 0; i < alive.length; i++) {
        for (let j = i + 1; j < alive.length; j++) {
          const n1 = alive[i], n2 = alive[j];
          if (n1.companionId || n2.companionId) continue;
          const r12 = SECT.rel(n1, n2.id);
          const r21 = SECT.rel(n2, n1.id);
          const aff = Math.max(r12.a || 0, r21.a || 0, r12.l || 0, r21.l || 0);
          if (aff > bestAff) {
            bestAff = aff;
            bestPair = [n1, n2];
          }
        }
      }
      if (bestPair) {
        a = a || bestPair[0];
        b = b || bestPair[1];
      }
    }
    if (!a || !b || a.id === b.id) return { ok: false, reason: 'invalid-companion-pair' };
    if (a.dead || b.dead || a.exiled || b.exiled) return { ok: false, reason: 'companion-unavailable' };

    const rAB = SECT.rel(a, b.id);
    const rBA = SECT.rel(b, a.id);
    if (opts.force) {
      rAB.a = Math.max(rAB.a || 0, 80);
      rBA.a = Math.max(rBA.a || 0, 80);
      rAB.l = Math.max(rAB.l || 0, 80);
      rBA.l = Math.max(rBA.l || 0, 80);
    }
    const affection = Math.max(rAB.a || 0, rBA.a || 0, rAB.l || 0, rBA.l || 0);
    const minAffection = opts.minAffection != null ? opts.minAffection : 70;
    if (affection < minAffection && !opts.force) {
      return { ok: false, reason: 'insufficient-affection', affection, requiredAffection: minAffection };
    }

    rAB.a = Math.max(rAB.a || 0, 88);
    rBA.a = Math.max(rBA.a || 0, 88);
    rAB.l = Math.max(rAB.l || 0, 90);
    rBA.l = Math.max(rBA.l || 0, 90);
    rAB.bond = 'TAOIST_COMPANION';
    rBA.bond = 'TAOIST_COMPANION';

    const synergyBonus = opts.synergyBonus || 0.25;
    a.companionId = b.id;
    b.companionId = a.id;
    a.companionSynergyBonus = synergyBonus;
    b.companionSynergyBonus = synergyBonus;
    if (a.h) {
      a.h.companionId = b.id;
      if (a.h.life && a.h.life.family) a.h.life.family.spouse = b.id;
      if (a.h.state) {
        a.h.state.heartDemon = Math.max(0, (a.h.state.heartDemon || 0) - 25);
        a.h.state.mood = 100;
      }
    }
    if (b.h) {
      b.h.companionId = a.id;
      if (b.h.life && b.h.life.family) b.h.life.family.spouse = a.id;
      if (b.h.state) {
        b.h.state.heartDemon = Math.max(0, (b.h.state.heartDemon || 0) - 25);
        b.h.state.mood = 100;
      }
    }
    a.sat = 100;
    b.sat = 100;
    // Cross-System Hook: Record marriage in h.life.bio & memories, resolve/soothe Heart-Demon knots, and cheer up close friends
    [ [a, b], [b, a] ].forEach(([selfNpc, spouseNpc]) => {
      if (selfNpc.h && selfNpc.h.life && Array.isArray(selfNpc.h.life.bio)) {
        selfNpc.h.life.bio.push({
          age: HC.ageYears ? Math.round(HC.ageYears(selfNpc)) : 20,
          t: 'ผูกด้ายแดงเป็นคู่บำเพ็ญเต๋ากับ「' + HC.fullName(spouseNpc) + '」หน้าหอบรรพชน'
        });
      }
      if (selfNpc.h && selfNpc.h.mind && Array.isArray(selfNpc.h.mind.memories)) {
        selfNpc.h.mind.memories.unshift({
          day: W.day || 360,
          kind: 'taoist_companion_marriage',
          text: 'ร่วมสาบานผูกด้ายแดงเป็นคู่บำเพ็ญเคียงคู่กับ「' + HC.fullName(spouseNpc) + '」'
        });
      }
      if (SECT.HEART_DEMON && SECT.HEART_DEMON.counselHeartDemon && Array.isArray(selfNpc.heartDemons) && selfNpc.heartDemons.some(k => k && !k.resolved)) {
        SECT.HEART_DEMON.counselHeartDemon(W, spouseNpc, selfNpc, null, { quiet: true });
      }
    });
    alive.forEach(fr => {
      if (fr && fr !== a && fr !== b) {
        const rFA = SECT.rel(fr, a.id), rFB = SECT.rel(fr, b.id);
        if (Math.max(rFA.a || 0, rFB.a || 0) >= 45 && fr.h && fr.h.state) {
          fr.h.state.mood = clamp((fr.h.state.mood || 65) + 6, 0, 100);
        }
      }
    });
    if (HC && HC.bump) { HC.bump(a); HC.bump(b); }

    const compRec = {
      id: 'COMP_' + (++S.companionSeq),
      partnerAId: a.id,
      partnerBId: b.id,
      partnerANameTh: HC.fullName(a),
      partnerBNameTh: HC.fullName(b),
      affection,
      synergyBonus,
      marriedDay: W.day || 360,
      childrenIds: []
    };
    S.companions = S.companions.filter(c => c && !(c.partnerAId === a.id && c.partnerBId === b.id) && !(c.partnerAId === b.id && c.partnerBId === a.id));
    S.companions.unshift(compRec);

    const titleTh = 'พิธีผูกวาสนาคู่บำเพ็ญ: 「' + HC.fullName(a) + '」และ「' + HC.fullName(b) + '」เคียงคู่สู่มรรคาเซียน!';
    const storyTh = 'ท่ามกลางโคมไฟแดงและเสียงระฆังมงคลหน้าหอบรรพชน 「' + HC.fullName(a) + '」และ「' + HC.fullName(b) + '」ผู้มีความผูกพันลึกซึ้ง (ความรักใคร่ ' + Math.round(affection) + '/100) ได้ทำพิธีผูกด้ายแดงร่วมสาบานเป็นคู่บำเพ็ญเคียงคู่กันชั่วชีวิต! ปราณของทั้งสองเกื้อหนุนกัน ทำให้อัตราการบ่มเพาะตบะเพิ่มขึ้น +25% และช่วยชำระจิตมารให้กันและกันอย่างต่อเนื่อง!';
    const consequenceTh = 'อัตราการสะสมตบะของทั้งคู่ +25% · ลดโอกาสธาตุไฟเข้าแทรก (จิตมาร -25) · มีโอกาสให้กำเนิดทายาทผู้ฝึกตนสืบทอดสายเลือดตระกูล';

    const milestone = SECT.recordTimelineMilestone(W, {
      milestoneType: 'COMPANION_BLOODLINE',
      icon: '💞',
      titleTh,
      descTh: consequenceTh,
      involvedIds: [a.id, b.id],
      quiet: opts.quiet
    });

    const chron = (g.EXPED && g.EXPED.recordChronicle) ? g.EXPED.recordChronicle(W, {
      category: 'INTERNAL',
      icon: '💞',
      involvedSects: [S.name],
      involvedFigures: [HC.fullName(a), HC.fullName(b)],
      titleTh,
      storyTh,
      consequenceTh,
      quiet: opts.quiet
    }) : null;

    if (!opts.quiet && W.log) W.log('marriage', '💞 ' + titleTh, [a.id, b.id]);

    return {
      ok: true,
      companionRecord: compRec,
      partnerA: a,
      partnerB: b,
      synergyBonus,
      milestone,
      chronicle: chron
    };
  };

  SECT.practiceDualCultivation = (W, npcAOrId, npcBOrId, opts) => {
    opts = opts || {};
    if (!W || !W.sect) return { ok: false, reason: 'invalid-world' };
    const a = typeof npcAOrId === 'object' && npcAOrId ? npcAOrId : W.byId[npcAOrId];
    const b = typeof npcBOrId === 'object' && npcBOrId ? npcBOrId : (a && a.companionId ? W.byId[a.companionId] : W.byId[npcBOrId]);
    if (!a || !b || a.dead || b.dead) return { ok: false, reason: 'invalid-companions' };

    const basePts = opts.basePts || 60;
    const beforeA = a.cult ? a.cult.prog : 0;
    const beforeB = b.cult ? b.cult.prog : 0;
    if (a.cult) CULT.gain(a, basePts, W, 'dual_cultivation');
    if (b.cult) CULT.gain(b, basePts, W, 'dual_cultivation');
    if (a.h && a.h.state) a.h.state.heartDemon = Math.max(0, (a.h.state.heartDemon || 0) - 18);
    if (b.h && b.h.state) b.h.state.heartDemon = Math.max(0, (b.h.state.heartDemon || 0) - 18);
    return {
      ok: true,
      partnerAGain: a.cult ? +(a.cult.prog - beforeA).toFixed(2) : 0,
      partnerBGain: b.cult ? +(b.cult.prog - beforeB).toFixed(2) : 0
    };
  };

  SECT.spawnCompanionOffspring = (W, parentAOrId, parentBOrId, opts) => {
    opts = opts || {};
    if (!W || !W.sect) return { ok: false, reason: 'invalid-world' };
    SECT.ensureCompanionsAndBloodlines(W);
    const S = W.sect;

    let a = typeof parentAOrId === 'object' && parentAOrId ? parentAOrId : (parentAOrId && W.byId[parentAOrId]);
    let b = typeof parentBOrId === 'object' && parentBOrId ? parentBOrId : (parentBOrId && W.byId[parentBOrId]);
    if (!a && S.companions.length) {
      const c0 = S.companions[0];
      a = W.byId[c0.partnerAId];
      b = W.byId[c0.partnerBId];
    }
    if (a && !b && a.companionId) {
      b = W.byId[a.companionId];
    }
    if (!a || !b) return { ok: false, reason: 'parents-not-found' };

    const seq = ++S.offspringSeq;
    const seedStr = String(W.seed || 'jhevo') + ':offspring:' + seq + ':' + (W.day || 360);
    const rng = new U.RNG(seedStr);

    // 1. Inherit Family Surname from Father or Mother
    const father = a.h && a.h.sex === 'M' ? a : (b.h && b.h.sex === 'M' ? b : a);
    const mother = father === a ? b : a;
    const getSur = n => (n && n.h && n.h.name && (n.h.name.family || n.h.name.sur)) || null;
    const clanSurnameTh = (opts.surnameFrom === 'MOTHER' ? getSur(mother) : getSur(father))
      || getSur(a) || getSur(b) || 'หลิน';
    const sex = opts.sex || (rng.chance(0.5) ? 'M' : 'F');
    const gPool = (g.SIM && g.SIM.NAME_POOLS && (sex === 'F' ? g.SIM.NAME_POOLS.GIVEN_F : g.SIM.NAME_POOLS.GIVEN_M)) || ['เทียนหยา', 'ชิงเสวี่ย'];
    const givenName = opts.givenName || rng.pick(gPool);
    const fullNameTh = clanSurnameTh + givenName;

    // 2. Blend Elemental Roots & Check for Mutated Root (WIND, LIGHTNING, ICE)
    const elemA = (a.elementalSystem && a.elementalSystem.primaryElement) || (a.h && a.h.root && a.h.root.elements && a.h.root.elements[0]) || 'METAL';
    const elemB = (b.elementalSystem && b.elementalSystem.primaryElement) || (b.h && b.h.root && b.h.root.elements && b.h.root.elements[0]) || 'WATER';
    const parentElements = Array.from(new Set([elemA, elemB].filter(Boolean)));
    if (parentElements.length < 2) parentElements.push(elemA === 'FIRE' ? 'WOOD' : 'FIRE');

    const mutKeys = Object.keys(SECT.MUTATED_ROOT_DEFS);
    const isMutated = opts.forceMutatedRoot != null ? !!opts.forceMutatedRoot : rng.chance(0.45);
    const mutKey = (opts.mutatedRootId && SECT.MUTATED_ROOT_DEFS[opts.mutatedRootId])
      ? opts.mutatedRootId
      : isMutated
      ? (parentElements.includes('METAL') && parentElements.includes('FIRE') ? 'LIGHTNING' : parentElements.includes('WATER') ? 'ICE' : rng.pick(mutKeys))
      : null;
    const mutDef = mutKey ? SECT.MUTATED_ROOT_DEFS[mutKey] : null;

    // 3. Inherit Techniques & Bloodline Traits from Parents
    const parentTechs = Array.from(new Set([].concat((a.cult && a.cult.techs) || [], (b.cult && b.cult.techs) || []))).slice(0, 3);
    const inheritedPath = opts.path || (a.cult && a.cult.path) || (b.cult && b.cult.path) || 'XIAN';
    const inheritedSub = opts.sub || (a.cult && a.cult.sub) || (b.cult && b.cult.sub) || 'NONE';

    const genA = Number(a.generation || (a.bloodlineTrait && a.bloodlineTrait.generation) || 1);
    const genB = Number(b.generation || (b.bloodlineTrait && b.bloodlineTrait.generation) || 1);
    const childGeneration = opts.generation != null ? Number(opts.generation) : (Math.max(genA, genB) + 1);
    const grandparentIds = Array.from(new Set(
      [].concat(
        (a.bloodlineTrait && a.bloodlineTrait.parentIds) || [],
        (b.bloodlineTrait && b.bloodlineTrait.parentIds) || []
      ).filter(Boolean)
    ));
    const grandparentNamesTh = Array.from(new Set(
      [].concat(
        (a.bloodlineTrait && a.bloodlineTrait.parentNamesTh) || [],
        (b.bloodlineTrait && b.bloodlineTrait.parentNamesTh) || []
      ).filter(Boolean)
    ));

    // Check Cross-Lineage Mythic Chimera Mutation (PROP-34)
    const blA = (a.primordialBloodline && a.primordialBloodline.id) || (a.bloodlineTrait && a.bloodlineTrait.chimeraId) || elemA;
    const blB = (b.primordialBloodline && b.primordialBloodline.id) || (b.bloodlineTrait && b.bloodlineTrait.chimeraId) || elemB;
    const hasDistinctLineage = blA !== blB || parentElements.length >= 2;
    const isChimera = opts.forceChimera != null ? !!opts.forceChimera : (hasDistinctLineage && (childGeneration >= 3 ? rng.chance(0.55) : rng.chance(0.28)));
    const chimeraSpecs = (SECT.DYNASTY_BLOODLINE && SECT.DYNASTY_BLOODLINE.MYTHIC_CHIMERA_BLOODLINES) || {};
    const chimeraKeys = Object.keys(chimeraSpecs);
    const pickedChimeraKey = (opts.chimeraId && chimeraSpecs[opts.chimeraId])
      ? opts.chimeraId
      : isChimera && chimeraKeys.length
      ? chimeraKeys[(seq - 1) % chimeraKeys.length]
      : null;
    const chimeraDef = pickedChimeraKey ? chimeraSpecs[pickedChimeraKey] : null;

    const bloodlineTrait = {
      id: 'BL_' + clanSurnameTh + '_G' + childGeneration + '_' + seq,
      nameTh: chimeraDef
        ? ('สายเลือดกลายพันธุ์เทวะ · ' + chimeraDef.nameTh + ' (รุ่นที่ ' + childGeneration + ')')
        : ('สายเลือดตระกูล' + clanSurnameTh + (mutDef ? (' · ' + mutDef.nameTh) : ' (รากปราณสวรรค์สืบทอด)') + ' รุ่นที่ ' + childGeneration),
      clanSurnameTh,
      generation: childGeneration,
      parentIds: [a.id, b.id],
      parentNamesTh: [HC.fullName(a), HC.fullName(b)],
      grandparentIds,
      grandparentNamesTh,
      parentElements,
      parentLineages: [blA, blB],
      isMutatedRoot: !!(mutDef || chimeraDef),
      isMythicChimera: !!chimeraDef,
      chimeraId: chimeraDef ? chimeraDef.id : null,
      chimeraNameTh: chimeraDef ? chimeraDef.nameTh : null,
      mutatedElement: chimeraDef ? chimeraDef.element : (mutDef ? mutDef.id : null),
      mutatedRootNameTh: chimeraDef ? chimeraDef.nameTh : (mutDef ? mutDef.nameTh : null),
      cultRateBonus: chimeraDef ? chimeraDef.cultRateBonus : (mutDef ? mutDef.cultRateBonus : 0.18),
      combatPowerBonus: chimeraDef ? chimeraDef.combatPowerBonus : (mutDef ? mutDef.combatPowerBonus : 0.12),
      btBonus: chimeraDef ? chimeraDef.btBonus : (mutDef ? mutDef.btBonus : 0.06),
      familyTechLearnBonus: childGeneration >= 2 ? 0.30 : 0.15,
      inheritedPath,
      inheritedSub,
      inheritedTechIds: parentTechs
    };

    const childRec = {
      id: 'OFFSPRING_' + seq,
      nameTh: fullNameTh,
      sur: clanSurnameTh,
      given: givenName,
      sex,
      generation: childGeneration,
      bornDay: W.day || 360,
      ageYears: opts.ageYears != null ? opts.ageYears : (opts.nurseryOnly ? 1 : 15),
      parentAId: a.id,
      parentBId: b.id,
      parentANameTh: HC.fullName(a),
      parentBNameTh: HC.fullName(b),
      grandparentIds,
      grandparentNamesTh,
      bloodlineTrait,
      inducted: false,
      npcId: null
    };
    S.offspring.unshift(childRec);

    const compRec = S.companions.find(c => c && ((c.partnerAId === a.id && c.partnerBId === b.id) || (c.partnerAId === b.id && c.partnerBId === a.id)));
    if (compRec) {
      if (!Array.isArray(compRec.childrenIds)) compRec.childrenIds = [];
      compRec.childrenIds.push(childRec.id);
    }

    let discipleNpc = null;
    if (!opts.nurseryOnly && childRec.ageYears >= 14) {
      const matRes = SECT.matureOffspringToDisciple(W, childRec, { rng, quiet: opts.quiet });
      if (matRes && matRes.ok) {
        discipleNpc = matRes.npc;
        discipleNpc.generation = childGeneration;
        discipleNpc.familyTechLearnBonus = bloodlineTrait.familyTechLearnBonus || 0.30;
        discipleNpc.dynastyLineage = {
          clanSurnameTh,
          generation: childGeneration,
          parentIds: [a.id, b.id],
          grandparentIds,
          isMythicChimera: !!bloodlineTrait.isMythicChimera,
          chimeraId: bloodlineTrait.chimeraId || null,
          familyTechLearnBonus: bloodlineTrait.familyTechLearnBonus || 0.30
        };
      }
    }

    const titleTh = 'กำเนิดทายาทสายเลือดตระกูล' + clanSurnameTh + ': 「' + fullNameTh + '」(' + (mutDef ? mutDef.nameTh : 'สืบทอดรากปราณพ่อแม่') + ')!';
    const storyTh = 'คู่บำเพ็ญ「' + HC.fullName(a) + '」และ「' + HC.fullName(b) + '」ได้ให้กำเนิดทายาทสายเลือดผู้มีพรสวรรค์สูงนามว่า「' + fullNameTh + '」สืบทอดแซ่ตระกูล「' + clanSurnameTh + '」และหลอมรวมรากปราณธาตุ (' + parentElements.join('+') + ')' + (mutDef ? (' จนก่อเกิด「' + mutDef.nameTh + '」!') : '!') + (discipleNpc ? (' บัดนี้เติบโตขึ้นสู่วัย ' + childRec.ageYears + ' ปี ก้าวเข้าสู่สำนักในฐานะศิษย์รุ่นเยาว์อัจฉริยะพร้อมสืบทอดวิชาของบิดามารดา!') : '');
    const consequenceTh = fullNameTh + ' สืบทอดแซ่「' + clanSurnameTh + '」· โบนัสตบะสายเลือด +' + Math.round(bloodlineTrait.cultRateBonus * 100) + '% · พลังรบ +' + Math.round(bloodlineTrait.combatPowerBonus * 100) + '%' + (parentTechs.length ? (' · สืบทอดวิชาพ่อแม่ ' + parentTechs.length + ' บท') : '');

    const milestone = SECT.recordTimelineMilestone(W, {
      milestoneType: 'COMPANION_BLOODLINE',
      icon: '👶',
      titleTh,
      descTh: consequenceTh,
      involvedIds: [a.id, b.id, discipleNpc && discipleNpc.id].filter(Boolean),
      quiet: opts.quiet
    });

    const chron = (g.EXPED && g.EXPED.recordChronicle) ? g.EXPED.recordChronicle(W, {
      category: 'INTERNAL',
      icon: '👶',
      involvedSects: [S.name],
      involvedFigures: [HC.fullName(a), HC.fullName(b), fullNameTh],
      titleTh,
      storyTh,
      consequenceTh,
      quiet: opts.quiet
    }) : null;

    return {
      ok: true,
      offspring: childRec,
      npc: discipleNpc,
      bloodlineTrait,
      milestone,
      chronicle: chron
    };
  };

  SECT.matureOffspringToDisciple = (W, childOrId, opts) => {
    opts = opts || {};
    if (!W || !W.sect) return { ok: false, reason: 'invalid-world' };
    SECT.ensureCompanionsAndBloodlines(W);
    const S = W.sect;
    const child = typeof childOrId === 'object' && childOrId
      ? childOrId
      : S.offspring.find(c => c && (c.id === childOrId || c.npcId === childOrId));
    if (!child) return { ok: false, reason: 'offspring-not-found' };
    if (child.inducted && child.npcId && W.byId[child.npcId]) {
      return { ok: true, npc: W.byId[child.npcId], offspring: child, alreadyInducted: true };
    }

    const rng = opts.rng || new U.RNG(String(W.seed || 'jhevo') + ':mature:' + child.id);
    const ageYears = clamp(child.ageYears >= 14 ? child.ageYears : 15, 14, 16);
    child.ageYears = ageYears;
    const bl = child.bloodlineTrait || {};
    const npcId = 'NPC_BLOODLINE_' + child.id;

    const npc = g.SIM.buildNpc(W, rng, {
      id: npcId,
      sex: child.sex || 'M',
      ageYears,
      quality: 0.95,
      rootGrade: 'HEAVENLY',
      rank: 1,
      stage: 2,
      merit: 30,
      trainedness: 0.65,
      forceElements: Array.isArray(bl.parentElements) && bl.parentElements.length ? bl.parentElements : ['METAL', 'WATER']
    });

    // Preserve exact family surname and given name
    npc.h.name = {
      family: child.sur,
      sur: child.sur,
      given: child.given,
      style: npc.h.name.style || null,
      full: child.sur + child.given
    };
    npc.parentIds = [child.parentAId, child.parentBId].filter(Boolean);
    npc.bloodlineTrait = bl;
    npc.h.bloodline = bl;
    if (npc.h.life && npc.h.life.family) {
      npc.h.life.family.parents = npc.parentIds.slice();
    }
    if (bl.isMutatedRoot && npc.h.root) {
      npc.h.root.mutatedElement = bl.mutatedElement;
      npc.h.root.mutatedNameTh = bl.mutatedRootNameTh;
      if (bl.mutatedElement && Array.isArray(npc.h.root.elements) && !npc.h.root.elements.includes(bl.mutatedElement)) {
        npc.h.root.elements.unshift(bl.mutatedElement);
      }
    }
    if (npc.cult) {
      if (bl.inheritedPath && CULT.PATHS[bl.inheritedPath]) npc.cult.path = bl.inheritedPath;
      if (bl.inheritedSub && bl.inheritedSub !== 'NONE') npc.cult.sub = bl.inheritedSub;
      if (Array.isArray(bl.inheritedTechIds)) {
        bl.inheritedTechIds.forEach(tid => {
          if (tid && !npc.cult.techs.includes(tid)) npc.cult.techs.push(tid);
        });
      }
    }
    if (g.ELEM && g.ELEM.ensureNpcElementalState) g.ELEM.ensureNpcElementalState(npc);
    if (bl.isMutatedRoot && npc.elementalSystem) {
      npc.elementalSystem.mutatedElement = bl.mutatedElement;
    }

    npc.x = MAP.EXIT ? MAP.EXIT.x + 0.5 : 118;
    npc.y = MAP.EXIT ? MAP.EXIT.y + 0.5 : 70;
    npc.px = npc.x;
    npc.py = npc.y;
    npc.n = ++W.seqN;
    W.npcs.push(npc);
    W.byId[npc.id] = npc;

    // Link parents' children list, establish deep SECT.rel family bonds, and assign stronger parent as mentor
    let mentorParent = null;
    npc.parentIds.forEach(pid => {
      const pNpc = W.byId[pid];
      if (!pNpc) return;
      if (pNpc.h && pNpc.h.life) {
        if (pNpc.h.life.family) {
          if (!Array.isArray(pNpc.h.life.family.children)) pNpc.h.life.family.children = [];
          if (!pNpc.h.life.family.children.includes(npc.id)) pNpc.h.life.family.children.push(npc.id);
        }
        if (Array.isArray(pNpc.h.life.bio)) {
          pNpc.h.life.bio.push({
            age: HC.ageYears ? Math.round(HC.ageYears(pNpc)) : 30,
            t: 'บุตรสายเลือด「' + HC.fullName(npc) + '」เติบโตเข้าพิธีรับศิษย์สำนักอย่างสมเกียรติ'
          });
        }
      }
      const rPC = SECT.rel(pNpc, npc.id);
      rPC.a = 95; rPC.t = 95; rPC.r = 85; rPC.bond = 'สายเลือดตระกูล (บุตร)';
      const rCP = SECT.rel(npc, pNpc.id);
      rCP.a = 95; rCP.t = 95; rCP.r = 92; rCP.g = 90; rCP.bond = 'สายเลือดตระกูล (บิดา/มารดา)';
      if (!pNpc.dead && !pNpc.exiled && (!mentorParent || CULT.power(pNpc) > CULT.power(mentorParent))) {
        mentorParent = pNpc;
      }
    });
    if (mentorParent) {
      npc.mentor = mentorParent.id;
      npc.mentorId = mentorParent.id;
    }
    if (npc.h && npc.h.life && Array.isArray(npc.h.life.bio)) {
      npc.h.life.bio.push({
        age: ageYears,
        t: 'ถือกำเนิดในสายเลือดตระกูล' + (child.sur || '') + ' (' + (bl.nameTh || 'รากปราณสวรรค์') + ') และเข้าพิธีรับศิษย์สำนัก'
      });
    }

    child.inducted = true;
    child.npcId = npc.id;
    return { ok: true, npc, offspring: child };
  };

  SECT.tickCompanionsAndOffspring = (W, opts) => {
    opts = opts || {};
    if (!W || !W.sect) return { ok: false };
    SECT.ensureCompanionsAndBloodlines(W);
    const S = W.sect;
    const inducted = [];
    const born = [];
    const newlyBound = [];

    // 0. Autonomous Companion Rite for unmarried adult disciples with deep mutual love/affection (Idle play)
    const unmarried = (W.npcs || []).filter(n => n && !n.dead && !n.exiled && !n.companionId && n.rank >= 1 && (!HC.ageYears || HC.ageYears(n) >= 16));
    for (let i = 0; i < unmarried.length; i++) {
      const n1 = unmarried[i];
      if (n1.companionId) continue;
      for (let j = i + 1; j < unmarried.length; j++) {
        const n2 = unmarried[j];
        if (n2.companionId) continue;
        const r12 = SECT.rel(n1, n2.id);
        const r21 = SECT.rel(n2, n1.id);
        if (Math.min(r12.a || 0, r21.a || 0) >= 72 && Math.max(r12.l || 0, r21.l || 0) >= 70) {
          const bRes = SECT.bindTaoistCompanions(W, n1, n2, { quiet: opts.quiet });
          if (bRes && bRes.ok) {
            newlyBound.push(bRes.companionRecord);
            break;
          }
        }
      }
    }

    // 1. Soothe heart demons & boost cultivation for active companion pairs
    (S.companions || []).forEach(c => {
      if (!c) return;
      const a = W.byId[c.partnerAId], b = W.byId[c.partnerBId];
      if (a && b && !a.dead && !b.dead && !a.exiled && !b.exiled) {
        if (a.h && a.h.state) a.h.state.heartDemon = Math.max(0, (a.h.state.heartDemon || 0) - 5);
        if (b.h && b.h.state) b.h.state.heartDemon = Math.max(0, (b.h.state.heartDemon || 0) - 5);
      }
    });

    // 2. Age un-inducted offspring and induct at age 14-16
    (S.offspring || []).forEach(ch => {
      if (!ch || ch.inducted) return;
      if (opts.advanceYears) ch.ageYears = (ch.ageYears || 1) + opts.advanceYears;
      else if ((W.day || 360) % 360 === 0) ch.ageYears = (ch.ageYears || 1) + 1;
      if (ch.ageYears >= 14) {
        const mRes = SECT.matureOffspringToDisciple(W, ch, { quiet: opts.quiet });
        if (mRes && mRes.ok && mRes.npc) inducted.push(mRes.npc);
      }
    });

    // 3. Annual or forced birth check for companion pairs with < 2 children
    const maxCap = SECT.housingCapacity ? SECT.housingCapacity(W) : 30;
    const popOk = (W.npcs || []).filter(n => n && !n.dead && !n.exiled).length < maxCap;
    if (opts.forceBirth && S.companions.length) {
      const c0 = S.companions[0];
      const bRes = SECT.spawnCompanionOffspring(W, c0.partnerAId, c0.partnerBId, opts);
      if (bRes && bRes.ok) born.push(bRes.offspring);
    } else if (popOk && ((W.day || 360) % 360 === 0)) {
      for (const comp of (S.companions || [])) {
        if (!comp || (Array.isArray(comp.childrenIds) && comp.childrenIds.length >= 2)) continue;
        const a = W.byId[comp.partnerAId], b = W.byId[comp.partnerBId];
        if (a && b && !a.dead && !b.dead && !a.exiled && !b.exiled && ((W.day || 360) - (comp.marriedDay || 0)) >= 90) {
          const bRes = SECT.spawnCompanionOffspring(W, a, b, { nurseryOnly: true, quiet: opts.quiet });
          if (bRes && bRes.ok) {
            born.push(bRes.offspring);
            break;
          }
        }
      }
    }

    return { ok: true, companionCount: S.companions.length, offspringCount: S.offspring.length, newlyBound, inducted, born };
  };


  /* =========================================================================
   * STRATEGIC PROPOSAL FLAGSHIP 1 (F05):
   * Elemental Qi Array & Feng Shui Leyline Architecture (SECT.FENG_SHUI)
   * Every building leyline attunement & Grand Guardian Array is surveyed and
   * inscribed by actual sect NPCs (arraymaster, astrologer, blood_warden, or ARRAY_TALISMAN disciples).
   * ========================================================================= */
  const FENG_SHUI = {};

  FENG_SHUI.ELEMENTS_10 = Object.freeze([
    'WOOD', 'FIRE', 'EARTH', 'METAL', 'WATER',
    'WIND', 'LIGHTNING', 'ICE', 'ASTRAL', 'BLOOD'
  ]);

  FENG_SHUI.ELEMENT_META = Object.freeze({
    WOOD: { id: 'WOOD', nameTh: 'ปราณพฤกษา', icon: '🌿', generates: ['FIRE', 'WIND'], overcomes: ['EARTH'] },
    FIRE: { id: 'FIRE', nameTh: 'ปราณอัคคี', icon: '🔥', generates: ['EARTH', 'LIGHTNING'], overcomes: ['METAL', 'ICE'] },
    EARTH: { id: 'EARTH', nameTh: 'ปราณปฐพี', icon: '⛰️', generates: ['METAL'], overcomes: ['WATER'] },
    METAL: { id: 'METAL', nameTh: 'ปราณโลหะทอง', icon: '⚔️', generates: ['WATER', 'LIGHTNING'], overcomes: ['WOOD'] },
    WATER: { id: 'WATER', nameTh: 'ปราณวารี', icon: '💧', generates: ['WOOD', 'ICE'], overcomes: ['FIRE'] },
    WIND: { id: 'WIND', nameTh: 'ปราณวายุสวรรค์', icon: '🌪️', generates: ['FIRE', 'ASTRAL'], overcomes: ['EARTH'] },
    LIGHTNING: { id: 'LIGHTNING', nameTh: 'ปราณอัสนีม่วง', icon: '⚡', generates: ['EARTH', 'ASTRAL'], overcomes: ['WOOD', 'BLOOD'] },
    ICE: { id: 'ICE', nameTh: 'ปราณน้ำแข็งเหมันต์', icon: '❄️', generates: ['WATER', 'WOOD'], overcomes: ['FIRE'] },
    ASTRAL: { id: 'ASTRAL', nameTh: 'ปราณดาราสวรรค์', icon: '✨', generates: ['WOOD', 'WATER', 'LIGHTNING'], overcomes: ['BLOOD'] },
    BLOOD: { id: 'BLOOD', nameTh: 'ปราณโลหิตมาร', icon: '🩸', generates: ['FIRE', 'METAL'], overcomes: ['ASTRAL', 'WOOD'] }
  });

  FENG_SHUI.DEFAULT_BLD_ELEMENT = Object.freeze({
    main_hall: 'ASTRAL',
    meditation_hall: 'WIND',
    training_ground: 'LIGHTNING',
    scripture: 'ASTRAL',
    alchemy: 'FIRE',
    forge: 'METAL',
    herb_garden: 'WOOD',
    farm: 'WOOD',
    mine: 'EARTH',
    spirit_pond: 'WATER',
    tea_garden: 'WOOD',
    infirmary: 'WATER',
    shrine: 'ASTRAL',
    ancestral: 'ASTRAL',
    discipline: 'BLOOD',
    mission_hall: 'METAL',
    market: 'EARTH',
    canteen: 'FIRE',
    dorm_outer: 'EARTH',
    dorm_inner: 'WOOD',
    dorm_core: 'ASTRAL',
    gate: 'METAL'
  });

  FENG_SHUI.GRAND_ARRAY_DEFS = Object.freeze({
    ASTRAL_THUNDER_SANCTUARY: {
      id: 'ASTRAL_THUNDER_SANCTUARY',
      nameTh: 'ค่ายกลดาราอัสนีพิทักษ์สวรรค์',
      icon: '🌌',
      elements: ['ASTRAL', 'LIGHTNING', 'WIND'],
      defenseBonus: 0.24,
      tribulationShieldBonus: 0.08,
      cultRateBonus: 0.12,
      heartDemonSoothing: 6,
      descTh: 'เชื่อมปราณดาราและอัสนีจาก 5 อาคารหลัก คุ้มครองสำนักจากการบุกและช่วยแบ่งรับสายฟ้าทัณฑ์สวรรค์'
    },
    FIVE_ELEMENTS_CYCLE: {
      id: 'FIVE_ELEMENTS_CYCLE',
      nameTh: 'ค่ายกลเบญจธาตุหมุนเวียนไม่สิ้นสุด',
      icon: '☯️',
      elements: ['WOOD', 'FIRE', 'EARTH', 'METAL', 'WATER'],
      defenseBonus: 0.18,
      tribulationShieldBonus: 0.06,
      cultRateBonus: 0.15,
      craftQualityBonus: 0.15,
      heartDemonSoothing: 4,
      descTh: 'ผสานปราณ 5 ธาตุหลักหมุนเวียนเกื้อหนุนกัน เร่งทั้งการบ่มเพาะตบะและคุณภาพการหลอมโอสถ/ศาสตรา'
    },
    BLOOD_MIST_DEVOURER: {
      id: 'BLOOD_MIST_DEVOURER',
      nameTh: 'ค่ายกลหมอกโลหิตกลืนวิญญาณ',
      icon: '🩸',
      elements: ['BLOOD', 'FIRE', 'METAL'],
      defenseBonus: 0.28,
      tribulationShieldBonus: 0.04,
      cultRateBonus: 0.16,
      combatFerocityBonus: 0.15,
      heartDemonSoothing: -2,
      descTh: 'ปลุกปราณโลหิตและอัคคีสังหารรอบสำนัก เพิ่มพลังรบและการบ่มเพาะสายมาร/กายาอย่างดุดัน'
    }
  });

  FENG_SHUI.CELESTIAL_PHENOMENA = Object.freeze({
    STARFALL_NIGHT: {
      id: 'STARFALL_NIGHT',
      nameTh: 'ปรากฏการณ์ฝนดาวตกเจ็ดดารา',
      icon: '🌠',
      boostedElements: ['ASTRAL', 'LIGHTNING', 'WIND'],
      bonusMult: 0.30,
      descTh: 'ปราณดาราสวรรค์โคจรลงสู่เส้นชีพจรปฐพี เร่งการฝึกสายค่ายกล จิตวิญญาณ และเซียนปราณ'
    },
    BLOOD_MOON_TIDE: {
      id: 'BLOOD_MOON_TIDE',
      nameTh: 'คืนจันทร์สีเลือดปราณโลหิตปะทุ',
      icon: '🌕',
      boostedElements: ['BLOOD', 'FIRE'],
      bonusMult: 0.32,
      descTh: 'จันทร์สีชาดสาดแสงปลุกชีพจรปราณโลหิต เร่งการบ่มเพาะสายมารและสายกายาอย่างรุนแรง'
    },
    VERDANT_SPRING_FLOW: {
      id: 'VERDANT_SPRING_FLOW',
      nameTh: 'กระแสปราณวสันต์พฤกษาผลิบาน',
      icon: '🌸',
      boostedElements: ['WOOD', 'WATER', 'ICE'],
      bonusMult: 0.25,
      descTh: 'ปราณชีวิตและวารีบริสุทธิ์เอ่อล้นจากสระวิญญาณและสวนสมุนไพร ช่วยฟื้นฟูบาดแผลและหลอมโอสถ'
    },
    EARTH_GOLDEN_CONVERGENCE: {
      id: 'EARTH_GOLDEN_CONVERGENCE',
      nameTh: 'ชีพจรทองคำปฐพีรวมศูนย์',
      icon: '⛰️',
      boostedElements: ['EARTH', 'METAL'],
      bonusMult: 0.25,
      descTh: 'แร่ปราณใต้หุบเขาสั่นพ้องกับโรงหลอมศาสตรา เพิ่มคุณภาพการตีเหล็กและความมั่นคงของค่ายกล'
    }
  });

  FENG_SHUI.ensure = W => {
    if (!W || !W.sect) return null;
    const S = W.sect;
    if (!S.fengShui || typeof S.fengShui !== 'object') {
      S.fengShui = {
        seq: 0,
        nodes: {},
        activeGrandArray: null,
        celestialPhenomenon: null,
        leylineCoresStock: { ASTRAL: 1, BLOOD: 1, WOOD: 2, FIRE: 2, WATER: 2, METAL: 2, EARTH: 2, WIND: 1, LIGHTNING: 1, ICE: 1 },
        history: []
      };
    }
    const fs = S.fengShui;
    if (!fs.nodes || typeof fs.nodes !== 'object') fs.nodes = {};
    if (!fs.leylineCoresStock || typeof fs.leylineCoresStock !== 'object') {
      fs.leylineCoresStock = { ASTRAL: 1, BLOOD: 1, WOOD: 1, FIRE: 1, WATER: 1, METAL: 1, EARTH: 1 };
    }
    if (!Array.isArray(fs.history)) fs.history = [];

    const blds = (W.map && Array.isArray(W.map.buildings)) ? W.map.buildings : [];
    blds.forEach(b => {
      if (!b || !b.id) return;
      if (!fs.nodes[b.id]) {
        const defEl = FENG_SHUI.DEFAULT_BLD_ELEMENT[b.id] || FENG_SHUI.DEFAULT_BLD_ELEMENT[b.type] || 'EARTH';
        fs.nodes[b.id] = {
          buildingId: b.id,
          buildingNameTh: b.nameTh || b.id,
          naturalElement: defEl,
          coreElement: defEl,
          coreInstalled: false,
          attunedByNpcId: null,
          attunedByNameTh: null,
          attunedDay: null,
          arraySkillLevel: 0,
          adjacencyBonus: 0,
          synergyLinks: [],
          clashLinks: [],
          fengShuiScore: 65,
          grade: 'B',
          cultMult: 1.05,
          craftBonus: 0.04
        };
      }
    });
    FENG_SHUI.recomputeMatrix(W);
    return fs;
  };

  FENG_SHUI.elementRelation = (elA, elB) => {
    const mA = FENG_SHUI.ELEMENT_META[elA];
    const mB = FENG_SHUI.ELEMENT_META[elB];
    if (!mA || !mB) return 'NEUTRAL';
    if (elA === elB) return 'HARMONY';
    if (mA.generates.includes(elB) || mB.generates.includes(elA)) return 'GENERATES';
    if (mA.overcomes.includes(elB) || mB.overcomes.includes(elA)) return 'OVERCOMES';
    return 'NEUTRAL';
  };

  FENG_SHUI.recomputeMatrix = W => {
    if (!W || !W.sect || !W.sect.fengShui) return null;
    const fs = W.sect.fengShui;
    const blds = (W.map && Array.isArray(W.map.buildings)) ? W.map.buildings : [];
    const phenom = fs.celestialPhenomenon;
    let totalScore = 0, count = 0;

    for (let i = 0; i < blds.length; i++) {
      const b1 = blds[i];
      if (!b1 || !fs.nodes[b1.id]) continue;
      const node1 = fs.nodes[b1.id];
      const el1 = node1.coreElement || node1.naturalElement || 'EARTH';
      let adjBonus = 0;
      const synLinks = [];
      const clashLinks = [];

      for (let j = 0; j < blds.length; j++) {
        if (i === j) continue;
        const b2 = blds[j];
        if (!b2 || !fs.nodes[b2.id]) continue;
        const cx1 = (b1.x || 0) + (b1.w || 6) / 2;
        const cy1 = (b1.y || 0) + (b1.h || 6) / 2;
        const cx2 = (b2.x || 0) + (b2.w || 6) / 2;
        const cy2 = (b2.y || 0) + (b2.h || 6) / 2;
        const dist = Math.hypot(cx1 - cx2, cy1 - cy2);
        if (dist > 34) continue;
        const node2 = fs.nodes[b2.id];
        const el2 = node2.coreElement || node2.naturalElement || 'EARTH';
        const rel = FENG_SHUI.elementRelation(el1, el2);
        if (rel === 'GENERATES') {
          adjBonus += 0.08;
          synLinks.push({ targetId: b2.id, targetNameTh: b2.nameTh, element: el2, relationTh: 'เกื้อหนุน (+8%)' });
        } else if (rel === 'HARMONY') {
          adjBonus += 0.05;
          synLinks.push({ targetId: b2.id, targetNameTh: b2.nameTh, element: el2, relationTh: 'สอดประสาน (+5%)' });
        } else if (rel === 'OVERCOMES' && !node1.coreInstalled) {
          adjBonus -= 0.04;
          clashLinks.push({ targetId: b2.id, targetNameTh: b2.nameTh, element: el2, relationTh: 'ปราณข่มกัน (-4%)' });
        }
      }

      adjBonus = clamp(adjBonus, -0.10, 0.24);
      const coreBonus = node1.coreInstalled ? (0.10 + Math.min(0.08, (node1.arraySkillLevel || 40) / 1000)) : 0;
      const phenomBonus = (phenom && Array.isArray(phenom.boostedElements) && phenom.boostedElements.includes(el1)) ? (phenom.bonusMult * 0.35) : 0;
      const grandBonus = (fs.activeGrandArray && FENG_SHUI.GRAND_ARRAY_DEFS[fs.activeGrandArray.id])
        ? (FENG_SHUI.GRAND_ARRAY_DEFS[fs.activeGrandArray.id].cultRateBonus || 0.08)
        : 0;

      const rawScore = clamp(Math.round(62 + adjBonus * 120 + (node1.coreInstalled ? 18 : 0) + phenomBonus * 50), 35, 100);
      const grade = rawScore >= 92 ? 'SSS' : rawScore >= 84 ? 'S' : rawScore >= 74 ? 'A' : rawScore >= 60 ? 'B' : 'C';
      // Soft-cap total cultivation & crafting bonus at +35% per Proposal anti-power-creep guardrail
      const totalBoost = clamp(adjBonus + coreBonus + phenomBonus + grandBonus * 0.5, -0.08, 0.35);

      node1.adjacencyBonus = +adjBonus.toFixed(3);
      node1.synergyLinks = synLinks.slice(0, 4);
      node1.clashLinks = clashLinks.slice(0, 3);
      node1.fengShuiScore = rawScore;
      node1.grade = grade;
      node1.cultMult = +(1 + Math.max(-0.08, totalBoost)).toFixed(3);
      node1.craftBonus = +clamp(totalBoost * 0.85, 0, 0.25).toFixed(3);
      totalScore += rawScore;
      count++;
    }
    fs.sectAverageScore = count > 0 ? Math.round(totalScore / count) : 68;
    fs.sectGrade = fs.sectAverageScore >= 90 ? 'SSS' : fs.sectAverageScore >= 82 ? 'S' : fs.sectAverageScore >= 72 ? 'A' : 'B';
    return fs;
  };

  FENG_SHUI.pickArraySpecialist = W => {
    if (!W || !Array.isArray(W.npcs)) return null;
    const alive = W.npcs.filter(n => n && !n.dead && !n.exiled && !n.away);
    if (!alive.length) return null;
    const byPost = alive.find(n => ['arraymaster', 'astrologer', 'blood_warden', 'forge', 'alchemy'].includes(n.post));
    if (byPost) return byPost;
    return alive.slice().sort((a, b) => {
      const sa = ((a.h && a.h.skills && a.h.skills.ARRAY) || 0) * 2 + (a.cult && ['ARRAY_TALISMAN', 'CRAFT_CREATION'].includes(a.cult.path) ? 60 : 0) + (a.rank || 1) * 10;
      const sb = ((b.h && b.h.skills && b.h.skills.ARRAY) || 0) * 2 + (b.cult && ['ARRAY_TALISMAN', 'CRAFT_CREATION'].includes(b.cult.path) ? 60 : 0) + (b.rank || 1) * 10;
      return sb - sa;
    })[0];
  };

  FENG_SHUI.attuneBuilding = (W, npcOrId, bldId, targetElement, opts) => {
    opts = opts || {};
    const fs = FENG_SHUI.ensure(W);
    if (!fs) return { ok: false, reason: 'no-feng-shui' };
    const caster = (typeof npcOrId === 'object' && npcOrId) ? npcOrId : (npcOrId && W.byId && W.byId[npcOrId]) || FENG_SHUI.pickArraySpecialist(W);
    if (!caster || caster.dead) return { ok: false, reason: 'no-specialist-npc' };

    const bld = (W.map && W.map.byId && W.map.byId[bldId]) || (W.map && W.map.buildings && W.map.buildings[0]);
    if (!bld) return { ok: false, reason: 'building-not-found' };
    const node = fs.nodes[bld.id];
    if (!node) return { ok: false, reason: 'leyline-node-not-found' };

    // Determine best element based on caster's role/root or adjacent buildings if not specified
    let chosenEl = targetElement && FENG_SHUI.ELEMENT_META[targetElement] ? targetElement : null;
    if (!chosenEl) {
      if (caster.post === 'astrologer') chosenEl = 'ASTRAL';
      else if (caster.post === 'blood_warden' || (caster.cult && caster.cult.path === 'DEMON')) chosenEl = 'BLOOD';
      else if (bld.id === 'alchemy') chosenEl = 'FIRE';
      else if (bld.id === 'herb_garden') chosenEl = 'WOOD';
      else if (bld.id === 'meditation_hall' || bld.id === 'scripture') chosenEl = 'ASTRAL';
      else if (bld.id === 'training_ground') chosenEl = 'LIGHTNING';
      else chosenEl = node.naturalElement || 'WOOD';
    }

    const arrSkill = Math.max(35, Math.round(((caster.h && caster.h.skills && caster.h.skills.ARRAY) || 35) + HC.eff(caster, 'intellect.comprehension') * 0.4));
    node.coreElement = chosenEl;
    node.coreInstalled = true;
    node.attunedByNpcId = caster.id;
    node.attunedByNameTh = HC.fullName(caster);
    node.attunedDay = W.day || 360;
    node.arraySkillLevel = arrSkill;
    if (fs.leylineCoresStock && fs.leylineCoresStock[chosenEl] > 0) {
      fs.leylineCoresStock[chosenEl]--;
    }

    if (g.MARTIAL && g.MARTIAL.skillPractice) g.MARTIAL.skillPractice(caster, 'ARRAY', 0.4, 1.3);
    else if (HC && HC.practice) HC.practice(caster, 'ARRAY', 0.4, 1.3);
    caster.merit = (caster.merit || 0) + 8;

    FENG_SHUI.recomputeMatrix(W);

    const elMeta = FENG_SHUI.ELEMENT_META[chosenEl] || { nameTh: chosenEl, icon: '☯️' };
    const rec = {
      id: 'FS_' + (++fs.seq),
      day: W.day || 360,
      npcId: caster.id,
      npcNameTh: HC.fullName(caster),
      buildingId: bld.id,
      buildingNameTh: bld.nameTh,
      element: chosenEl,
      elementNameTh: elMeta.nameTh,
      grade: node.grade,
      score: node.fengShuiScore,
      cultMult: node.cultMult
    };
    fs.history.unshift(rec);
    if (fs.history.length > 35) fs.history.length = 35;

    let chron = null;
    if (g.EXPED && g.EXPED.recordChronicle) {
      chron = g.EXPED.recordChronicle(W, {
        category: 'FENG_SHUI_ARRAY',
        icon: elMeta.icon || '☯️',
        involvedSects: [W.sect.name],
        involvedFigures: [HC.fullName(caster)],
        npcIds: [caster.id],
        titleTh: 'ปรับจูนชีพจรปราณฮวงจุ้ย: 「' + HC.fullName(caster) + '」ฝังแกน' + elMeta.nameTh + ' ณ ' + bld.nameTh + ' (เกรด ' + node.grade + ')',
        storyTh: HC.fullName(caster) + ' สำรวจเส้นชีพจรปราณใต้พิภพของ ' + bld.nameTh + ' และทำพิธีฝังแกน「' + elMeta.nameTh + '」เชื่อมโยงปราณเกื้อหนุนกับอาคารข้างเคียง จนระดับฮวงจุ้ยพุ่งขึ้นสู่เกรด ' + node.grade + ' (' + node.fengShuiScore + '/100)!',
        originCauseTh: 'ความต้องการยกระดับฮวงจุ้ยของ ' + bld.nameTh + ' ให้สอดคล้องกับรากปราณของศิษย์และอาคารข้างเคียง',
        actorChainTh: HC.fullName(caster) + ' (ทักษะค่ายกล ' + arrSkill + ' · ตำแหน่ง/สายค่ายกล)',
        systemImpactTh: 'เชื่อมโยง FENG_SHUI ➔ อัตราบ่มเพาะตบะในอาคาร (×' + node.cultMult.toFixed(2) + ') + โบนัสคุณภาพการหลอมสร้าง (+' + Math.round(node.craftBonus * 100) + '%)',
        consequenceTh: bld.nameTh + ' ฮวงจุ้ยเกรด ' + node.grade + ' · เร่งตบะ ×' + node.cultMult.toFixed(2),
        quiet: opts.quiet
      });
    }
    if (!opts.quiet && W.log && !chron) {
      W.log('decision', elMeta.icon + ' ' + HC.fullName(caster) + ' วางแกนค่ายกลฮวงจุ้ย「' + elMeta.nameTh + '」ณ ' + bld.nameTh + ' (ฮวงจุ้ยเกรด ' + node.grade + ' · เร่งปราณ ×' + node.cultMult.toFixed(2) + ')', [caster.id]);
    }
    return { ok: true, node, record: rec, caster, chronicle: chron };
  };

  FENG_SHUI.activateGrandGuardianArray = (W, npcOrId, arrayId, opts) => {
    opts = opts || {};
    const fs = FENG_SHUI.ensure(W);
    if (!fs) return { ok: false, reason: 'no-feng-shui' };
    const caster = (typeof npcOrId === 'object' && npcOrId) ? npcOrId : (npcOrId && W.byId && W.byId[npcOrId]) || FENG_SHUI.pickArraySpecialist(W);
    if (!caster) return { ok: false, reason: 'no-caster' };

    const attunedNodes = Object.values(fs.nodes).filter(n => n && n.coreInstalled);
    if (attunedNodes.length < 3 && !opts.force) {
      return { ok: false, reason: 'insufficient-attuned-nodes', current: attunedNodes.length, required: 3 };
    }

    const def = FENG_SHUI.GRAND_ARRAY_DEFS[arrayId]
      || (caster.cult && caster.cult.path === 'DEMON' ? FENG_SHUI.GRAND_ARRAY_DEFS.BLOOD_MIST_DEVOURER : FENG_SHUI.GRAND_ARRAY_DEFS.ASTRAL_THUNDER_SANCTUARY);

    fs.activeGrandArray = {
      id: def.id,
      nameTh: def.nameTh,
      icon: def.icon,
      activatedByNpcId: caster.id,
      activatedByNameTh: HC.fullName(caster),
      activatedDay: W.day || 360,
      defenseBonus: def.defenseBonus,
      tribulationShieldBonus: def.tribulationShieldBonus,
      cultRateBonus: def.cultRateBonus,
      descTh: def.descTh
    };
    FENG_SHUI.recomputeMatrix(W);

    if (SECT.recordTimelineMilestone) {
      SECT.recordTimelineMilestone(W, {
        milestoneType: 'LEGENDARY_CRAFT',
        icon: def.icon,
        titleTh: 'เปิดเดินค่ายกลใหญ่พิทักษ์สำนัก: 「' + def.nameTh + '」โดย ' + HC.fullName(caster),
        descTh: def.descTh + ' (ป้องกันสำนัก +' + Math.round(def.defenseBonus * 100) + '% · เร่งตบะ +' + Math.round(def.cultRateBonus * 100) + '%)',
        involvedIds: [caster.id],
        quiet: opts.quiet
      });
    }
    const chron = (g.EXPED && g.EXPED.recordChronicle) ? g.EXPED.recordChronicle(W, {
      category: 'FENG_SHUI_ARRAY',
      icon: def.icon || '🌌',
      involvedSects: [W.sect.name],
      involvedFigures: [HC.fullName(caster)],
      npcIds: [caster.id],
      titleTh: 'เปิดเดินมหาค่ายกลพิทักษ์สำนัก: 「' + def.nameTh + '」โดย ' + HC.fullName(caster) + '!',
      storyTh: 'เมื่อแกนชีพจรปราณของอาคารหลักถูกปรับจูนครบถ้วน 「' + HC.fullName(caster) + '」ได้ขึ้นแท่นบูชาชักนำปราณฟ้าดินผสานเข้าเป็น「' + def.nameTh + '」ครอบคลุมทั่วขุนเขา!',
      originCauseTh: 'แกนชีพจรปราณอาคารหลักในสำนักถูกปรับจูนครบเกณฑ์ (' + attunedNodes.length + ' อาคาร)',
      actorChainTh: HC.fullName(caster) + ' (ผู้วางค่ายกลประจำสำนัก)',
      systemImpactTh: 'เชื่อมโยง FENG_SHUI ➔ ป้องกันศึกบุกสำนัก (+' + Math.round(def.defenseBonus * 100) + '%) + รับสายฟ้าด่านเคราะห์สวรรค์ (+' + Math.round(def.tribulationShieldBonus * 100) + '%) + เร่งตบะทั้งสำนัก (+' + Math.round(def.cultRateBonus * 100) + '%)',
      consequenceTh: 'ป้องกันสำนัก +' + Math.round(def.defenseBonus * 100) + '% · โอกาสผ่านด่านเคราะห์สวรรค์ +' + Math.round(def.tribulationShieldBonus * 100) + '%',
      quiet: opts.quiet
    }) : null;
    return { ok: true, grandArray: fs.activeGrandArray, caster, chronicle: chron };
  };

  FENG_SHUI.buildingMultiplierForNpc = (W, npc) => {
    if (!W || !W.sect || !W.sect.fengShui || !npc) return 1;
    const fs = W.sect.fengShui;
    let bldId = 'meditation_hall';
    if (npc.act && npc.act.st != null && W.map && W.map.stations && W.map.stations[npc.act.st]) {
      bldId = W.map.stations[npc.act.st].bkey || bldId;
    }
    const node = fs.nodes && fs.nodes[bldId];
    if (!node) return 1;
    let mult = node.cultMult || 1;
    const el = node.coreElement || node.naturalElement;
    const npcRoots = (npc.h && npc.h.root && Array.isArray(npc.h.root.elements)) ? npc.h.root.elements : [];
    if (el && npcRoots.includes(el)) {
      mult += 0.06;
    } else if (el === 'ASTRAL' && npc.cult && ['XIAN', 'HEART_SOUL', 'ARRAY_TALISMAN', 'STRATEGY_GOVERNANCE'].includes(npc.cult.path)) {
      mult += 0.05;
    } else if (el === 'BLOOD' && npc.cult && ['DEMON', 'BODY'].includes(npc.cult.path)) {
      mult += 0.07;
    }
    return clamp(mult, 0.90, 1.35);
  };

  FENG_SHUI.tick = (W, opts) => {
    opts = opts || {};
    const fs = FENG_SHUI.ensure(W);
    if (!fs) return { ok: false };
    const pKeys = Object.keys(FENG_SHUI.CELESTIAL_PHENOMENA);
    const pKey = pKeys[Math.floor(((W.day || 360) / 30) + (W.season || 0)) % pKeys.length];
    fs.celestialPhenomenon = FENG_SHUI.CELESTIAL_PHENOMENA[pKey];

    // Autonomous NPC specialist attunes 1 un-attuned key building per month
    const specialist = FENG_SHUI.pickArraySpecialist(W);
    let attuned = null;
    if (specialist) {
      const priorityBlds = ['meditation_hall', 'alchemy', 'forge', 'herb_garden', 'scripture', 'training_ground', 'spirit_pond'];
      const targetBldId = priorityBlds.find(id => fs.nodes[id] && !fs.nodes[id].coreInstalled) || priorityBlds[(W.day || 360) % priorityBlds.length];
      if (targetBldId && fs.nodes[targetBldId] && (!fs.nodes[targetBldId].coreInstalled || opts.forceAttune)) {
        attuned = FENG_SHUI.attuneBuilding(W, specialist, targetBldId, null, { quiet: opts.quiet });
      }
      const attunedCount = Object.values(fs.nodes).filter(n => n && n.coreInstalled).length;
      if (attunedCount >= 3 && !fs.activeGrandArray) {
        FENG_SHUI.activateGrandGuardianArray(W, specialist, null, { quiet: opts.quiet });
      }
    }
    FENG_SHUI.recomputeMatrix(W);
    return { ok: true, fengShui: fs, attuned };
  };

  SECT.FENG_SHUI = FENG_SHUI;

  /* =========================================================================
   * STRATEGIC PROPOSAL FLAGSHIP 2 (F03-Deep):
   * Causal Heart-Demon Genesis, Inner Tribulation & Daoist Counseling (SECT.HEART_DEMON)
   * Every Heart-Demon knot has a concrete causal origin (bereavement, duel defeat,
   * succession envy, or blood slaughter) and is resolved by actual NPCs in the sect.
   * ========================================================================= */
  const HEART_DEMON = {};

  HEART_DEMON.CAUSE_DEFS = Object.freeze({
    BEREAVEMENT_GRIEF: {
      id: 'BEREAVEMENT_GRIEF',
      nameTh: 'ปมโศกนาฏกรรมสูญเสียผู้ผูกพัน',
      icon: '🕯️',
      baseSeverity: 35,
      btPenalty: 0.08
    },
    DEFEAT_HUMILIATION: {
      id: 'DEFEAT_HUMILIATION',
      nameTh: 'ปมอัปยศพ่ายแพ้และติดคอขวด',
      icon: '💔',
      baseSeverity: 25,
      btPenalty: 0.06
    },
    AMBITION_ENVY: {
      id: 'AMBITION_ENVY',
      nameTh: 'ปมริษยาชิงตำแหน่งและอำนาจ',
      icon: '🐍',
      baseSeverity: 30,
      btPenalty: 0.07
    },
    BLOOD_SLAUGHTER: {
      id: 'BLOOD_SLAUGHTER',
      nameTh: 'ปมจิตสังหารกระหายโลหิต',
      icon: '🩸',
      baseSeverity: 32,
      btPenalty: 0.07
    }
  });

  HEART_DEMON.ensureNpc = npc => {
    if (!npc) return null;
    if (!Array.isArray(npc.heartDemons)) npc.heartDemons = [];
    if (!Array.isArray(npc.daoScars)) npc.daoScars = [];
    return npc.heartDemons;
  };

  HEART_DEMON.spawnFromCause = (W, npcOrId, causeType, details) => {
    details = details || {};
    if (!W || !npcOrId) return null;
    const npc = (typeof npcOrId === 'object') ? npcOrId : (W.byId && W.byId[npcOrId]);
    if (!npc || npc.dead) return null;
    HEART_DEMON.ensureNpc(npc);

    const def = HEART_DEMON.CAUSE_DEFS[causeType] || HEART_DEMON.CAUSE_DEFS.DEFEAT_HUMILIATION;
    const srcNpc = details.sourceNpcId && W.byId ? W.byId[details.sourceNpcId] : details.sourceNpc;
    const srcNameTh = details.sourceNpcNameTh || (srcNpc ? HC.fullName(srcNpc) : null);

    // Avoid duplicate active knot of exact same type + sourceNpcId
    const existing = npc.heartDemons.find(k => k && !k.resolved && k.type === def.id && k.sourceNpcId === (srcNpc ? srcNpc.id : details.sourceNpcId || null));
    if (existing) {
      existing.severity = clamp((existing.severity || 25) + 12, 10, 100);
      return existing;
    }

    let originEventTh = details.originEventTh || '';
    if (!originEventTh) {
      if (def.id === 'BEREAVEMENT_GRIEF') {
        originEventTh = 'สะเทือนใจอย่างรุนแรงจากการจากไปของ「' + (srcNameTh || 'คนสำคัญ') + '」(' + (details.why || 'สิ้นชีพ') + ')';
      } else if (def.id === 'DEFEAT_HUMILIATION') {
        originEventTh = srcNameTh
          ? ('พ่ายแพ้ในการประลองต่อคู่แข่ง「' + srcNameTh + '」จนเกิดความแคลงใจในวิถียุทธ์ของตน')
          : 'ล้มเหลวในการทะลวงคอขวดซ้ำซากจนปราณย้อนกลับเกิดภาพหลอนในจิตใจ';
      } else if (def.id === 'AMBITION_ENVY') {
        originEventTh = 'พลาดหวังจากตำแหน่งผู้นำให้แก่「' + (srcNameTh || 'ศิษย์ร่วมสำนัก') + '」เกิดความริษยาฝังลึก';
      } else {
        originEventTh = 'สังหารศัตรูและโคจรปราณโลหิต/มารอย่างหักโหมจนจิตสังหารก่อตัวเป็นเงามารในใจ';
      }
    }

    const knot = {
      id: 'HD_' + npc.id + '_' + (W.day || 360) + '_' + (npc.heartDemons.length + 1),
      type: def.id,
      nameTh: def.nameTh,
      icon: def.icon,
      severity: clamp(details.severity || def.baseSeverity, 15, 100),
      btPenalty: def.btPenalty,
      sourceNpcId: srcNpc ? srcNpc.id : (details.sourceNpcId || null),
      sourceNpcNameTh: srcNameTh || null,
      originEventTh,
      createdDay: W.day || 360,
      resolved: false,
      resolvedByNpcId: null,
      resolvedByNameTh: null,
      resolutionMode: null
    };

    npc.heartDemons.unshift(knot);
    if (npc.heartDemons.length > 6) npc.heartDemons.length = 6;
    if (npc.h && npc.h.state) {
      npc.h.state.heartDemon = clamp((npc.h.state.heartDemon || 0) + Math.round(knot.severity * 0.45), 0, 100);
    }
    if (g.AI && g.AI.mem) {
      g.AI.mem(W, npc, 'เกิด' + def.nameTh + ': ' + originEventTh, 0.85, knot.sourceNpcId);
    }
    if (g.EXPED && g.EXPED.recordChronicle) {
      g.EXPED.recordChronicle(W, {
        category: 'DAO_HEART_SUTRA',
        icon: def.icon || '💔',
        involvedSects: [W.sect && W.sect.name].filter(Boolean),
        involvedFigures: [HC.fullName(npc), srcNameTh].filter(Boolean),
        npcIds: [npc.id, knot.sourceNpcId].filter(Boolean),
        titleTh: 'ก่อเกิด' + def.nameTh + 'ในจิตใจของ「' + HC.fullName(npc) + '」',
        storyTh: 'จากเหตุการณ์ที่ ' + HC.fullName(npc) + ' ' + originEventTh + ' ส่งผลให้ปราณในร่างปั่นป่วนและก่อตัวเป็น「' + def.nameTh + '」(ความรุนแรง ' + knot.severity + ') ที่คอยสั่นคลอนมรรคา!',
        originCauseTh: originEventTh,
        actorChainTh: HC.fullName(npc) + (srcNameTh ? (' (เชื่อมโยงกับ ' + srcNameTh + ')') : ''),
        systemImpactTh: 'เชื่อมโยง HEART_DEMON ➔ ลดโอกาสทะลวงด่าน (-' + Math.round(def.btPenalty * 100) + '%) จนกว่าจะได้รับการชี้แนะคลายปมหรือกลืนกินมาร',
        consequenceTh: 'ติดสถานะ ' + def.nameTh + ' · รอผู้อาวุโสสายจิตวิญญาณ/คู่บำเพ็ญ/อาจารย์ช่วยคลี่คลาย',
        quiet: true
      });
    }
    return knot;
  };

  HEART_DEMON.counselHeartDemon = (W, counselorOrId, targetNpcOrId, knotId, opts) => {
    opts = opts || {};
    if (!W) return { ok: false, reason: 'invalid-world' };
    const target = (typeof targetNpcOrId === 'object' && targetNpcOrId)
      ? targetNpcOrId
      : (targetNpcOrId && W.byId && W.byId[targetNpcOrId])
      || (W.npcs || []).find(n => n && !n.dead && Array.isArray(n.heartDemons) && n.heartDemons.some(k => k && !k.resolved));
    if (!target || target.dead) return { ok: false, reason: 'no-target-npc' };
    HEART_DEMON.ensureNpc(target);

    const knot = knotId
      ? target.heartDemons.find(k => k && k.id === knotId && !k.resolved)
      : target.heartDemons.find(k => k && !k.resolved);
    if (!knot) return { ok: false, reason: 'no-unresolved-heart-demon' };

    let counselor = (typeof counselorOrId === 'object' && counselorOrId)
      ? counselorOrId
      : (counselorOrId && W.byId && W.byId[counselorOrId]);
    if (!counselor || counselor.id === target.id || counselor.dead) {
      // Pick companion, mentor, or HEART_SOUL / SAGE_SUPPORT / KARMA_SAMSARA elder
      counselor = (target.companionId && W.byId[target.companionId] && !W.byId[target.companionId].dead && W.byId[target.companionId])
        || (target.mentorId && W.byId[target.mentorId] && !W.byId[target.mentorId].dead && W.byId[target.mentorId])
        || (W.npcs || []).filter(n => n && !n.dead && !n.exiled && n.id !== target.id).sort((a, b) => {
          const sa = (a.cult && ['HEART_SOUL', 'SAGE_SUPPORT', 'KARMA_SAMSARA'].includes(a.cult.path) ? 50 : 0) + HC.eff(a, 'personality.empathy') * 0.5 + (a.rank || 1) * 8;
          const sb = (b.cult && ['HEART_SOUL', 'SAGE_SUPPORT', 'KARMA_SAMSARA'].includes(b.cult.path) ? 50 : 0) + HC.eff(b, 'personality.empathy') * 0.5 + (b.rank || 1) * 8;
          return sb - sa;
        })[0];
    }
    if (!counselor) return { ok: false, reason: 'no-counselor-available' };

    knot.resolved = true;
    knot.resolvedDay = W.day || 360;
    knot.resolvedByNpcId = counselor.id;
    knot.resolvedByNameTh = HC.fullName(counselor);
    knot.resolutionMode = 'DAO_ENLIGHTENMENT';

    const scar = {
      id: 'SCAR_' + knot.id,
      fromKnotId: knot.id,
      nameTh: 'ตราแจ้งชัดแห่งเต๋า (ก้าวข้าม' + knot.nameTh + ')',
      counselorId: counselor.id,
      counselorNameTh: HC.fullName(counselor),
      originEventTh: knot.originEventTh,
      btBonus: 0.06,
      willpowerBonus: 6,
      createdDay: W.day || 360
    };
    target.daoScars.unshift(scar);
    if (target.daoScars.length > 5) target.daoScars.length = 5;

    if (target.h) {
      if (target.h.state) {
        target.h.state.heartDemon = Math.max(0, (target.h.state.heartDemon || 0) - 28);
        target.h.state.stress = Math.max(0, (target.h.state.stress || 0) - 20);
        target.h.state.mood = Math.min(100, (target.h.state.mood || 50) + 22);
      }
      if (target.h.intellect) {
        target.h.intellect.willpower = Math.min(99, (target.h.intellect.willpower || 50) + 4);
      }
    }
    const relTC = SECT.rel(target, counselor.id);
    relTC.a = clamp((relTC.a || 0) + 18, -100, 100);
    relTC.g = clamp((relTC.g || 0) + 25, 0, 100);
    counselor.merit = (counselor.merit || 0) + 12;

    if (g.AI && g.AI.mem) {
      g.AI.mem(W, target, 'ได้รับคำชี้แนะจาก ' + HC.fullName(counselor) + ' จนคลาย' + knot.nameTh + ' แปรเปลี่ยนเป็นตราแจ้งชัดแห่งเต๋า', 0.9, counselor.id);
    }
    const chron = (g.EXPED && g.EXPED.recordChronicle) ? g.EXPED.recordChronicle(W, {
      category: 'DAO_HEART_SUTRA',
      icon: '🪷',
      involvedSects: [W.sect && W.sect.name].filter(Boolean),
      involvedFigures: [HC.fullName(counselor), HC.fullName(target)],
      npcIds: [counselor.id, target.id],
      titleTh: 'คลี่คลายปมมารในใจ: 「' + HC.fullName(counselor) + '」ชี้แนะสัจธรรมช่วย「' + HC.fullName(target) + '」บรรลุตราแจ้งชัดแห่งเต๋า!',
      storyTh: HC.fullName(counselor) + ' นั่งสนทนาธรรมและเดินปราณประคองจิตใจให้แก่ ' + HC.fullName(target) + ' จนสามารถก้าวข้าม「' + knot.nameTh + '」(' + knot.originEventTh + ') แปรเปลี่ยนบาดแผลในใจให้กลายเป็น「' + scar.nameTh + '」!',
      originCauseTh: knot.nameTh + ' (' + knot.originEventTh + ')',
      actorChainTh: 'ผู้ชี้แนะ: ' + HC.fullName(counselor) + ' ➔ ผู้รับการคลี่คลาย: ' + HC.fullName(target),
      systemImpactTh: 'เชื่อมโยง HEART_DEMON ➔ CULT.breakthroughChance (+6% ถาวร) + ความมุ่งมั่น willpower (+4) + ความกตัญญู (+25)',
      consequenceTh: HC.fullName(target) + ' ได้รับ ' + scar.nameTh + ' · จิตมารลดลง -28 · โอกาสทะลวงด่าน +6%',
      quiet: opts.quiet
    }) : null;
    if (!opts.quiet && W.log && !chron) {
      W.log('heal', '🪷 ' + HC.fullName(counselor) + ' ชี้แนะสัจธรรมช่วย「' + HC.fullName(target) + '」คลี่คลาย「' + knot.nameTh + '」สำเร็จ แปรเปลี่ยนเป็นตราแจ้งชัดแห่งเต๋า (ทะลวงด่าน +6%)!', [counselor.id, target.id]);
    }
    return { ok: true, knot, daoScar: scar, counselor, target, chronicle: chron };
  };

  HEART_DEMON.devourHeartDemon = (W, npcOrId, knotId, opts) => {
    opts = opts || {};
    if (!W) return { ok: false, reason: 'invalid-world' };
    const npc = (typeof npcOrId === 'object' && npcOrId) ? npcOrId : (W.byId && W.byId[npcOrId]);
    if (!npc || npc.dead) return { ok: false, reason: 'npc-not-found' };
    HEART_DEMON.ensureNpc(npc);

    const knot = knotId
      ? npc.heartDemons.find(k => k && k.id === knotId && !k.resolved)
      : npc.heartDemons.find(k => k && !k.resolved);
    if (!knot) return { ok: false, reason: 'no-unresolved-heart-demon' };

    knot.resolved = true;
    knot.resolvedDay = W.day || 360;
    knot.resolvedByNpcId = npc.id;
    knot.resolvedByNameTh = HC.fullName(npc);
    knot.resolutionMode = 'DEMONIC_DEVOUR';

    const scar = {
      id: 'SCAR_DEVOUR_' + knot.id,
      fromKnotId: knot.id,
      nameTh: 'ตราเพลิงมารกลืนใจ (หลอมรวม' + knot.nameTh + ')',
      counselorId: npc.id,
      counselorNameTh: HC.fullName(npc),
      originEventTh: knot.originEventTh,
      btBonus: 0.05,
      combatPowerBonus: 0.08,
      createdDay: W.day || 360
    };
    npc.daoScars.unshift(scar);
    if (npc.cult) CULT.gain(npc, 65, W, 'devour_heart_demon');
    if (npc.h && npc.h.state) {
      npc.h.state.heartDemon = Math.max(0, (npc.h.state.heartDemon || 0) - 25);
    }
    if (HC && HC.bump) HC.bump(npc);
    const chron = (g.EXPED && g.EXPED.recordChronicle) ? g.EXPED.recordChronicle(W, {
      category: 'DAO_HEART_SUTRA',
      icon: '🔥',
      involvedSects: [W.sect && W.sect.name].filter(Boolean),
      involvedFigures: [HC.fullName(npc)],
      npcIds: [npc.id],
      titleTh: 'เพลิงมารกลืนใจ: 「' + HC.fullName(npc) + '」หลอมรวม「' + knot.nameTh + '」เป็นพลังรบสายมาร!',
      storyTh: 'แทนที่จะสยบปมในใจด้วยความสงบ 「' + HC.fullName(npc) + '」กลับใช้วิถีมารกลืนกิน「' + knot.nameTh + '」(' + knot.originEventTh + ') แปรเปลี่ยนความเคียดแค้นให้กลายเป็น「' + scar.nameTh + '」!',
      originCauseTh: knot.nameTh + ' (' + knot.originEventTh + ')',
      actorChainTh: HC.fullName(npc) + ' (ความดุดัน ' + Math.round(HC.eff(npc, 'personality.aggression')) + ' · วิถี ' + (npc.cult ? npc.cult.path : 'DEMON') + ')',
      systemImpactTh: 'เชื่อมโยง HEART_DEMON ➔ CULT.power (+8% ถาวร) + CULT.breakthroughChance (+5%) + ตบะ (+65)',
      consequenceTh: HC.fullName(npc) + ' ได้รับ ' + scar.nameTh + ' (+พลังรบ 8% · +โอกาสทะลวงด่าน 5%)',
      quiet: opts.quiet
    }) : null;
    if (!opts.quiet && W.log && !chron) {
      W.log('breakthrough', '🔥 ' + HC.fullName(npc) + ' โคจรจิตมารกลืนกิน「' + knot.nameTh + '」แปรเปลี่ยนความแค้นเป็นตราเพลิงมารกลืนใจ (+พลังรบ 8% · +ตบะ 65)!', [npc.id]);
    }
    return { ok: true, knot, daoScar: scar, npc, chronicle: chron };
  };

  HEART_DEMON.tick = (W, opts) => {
    opts = opts || {};
    if (!W || !Array.isArray(W.npcs)) return { ok: false };
    const counseled = [];
    for (const n of W.npcs) {
      if (!n || n.dead || n.exiled) continue;
      HEART_DEMON.ensureNpc(n);
      // Spawn BLOOD_SLAUGHTER knot if heartDemon >= 68 and no active knot
      if (n.h && n.h.state && (n.h.state.heartDemon || 0) >= 68 && !n.heartDemons.some(k => k && !k.resolved)) {
        HEART_DEMON.spawnFromCause(W, n, 'BLOOD_SLAUGHTER', { severity: Math.round(n.h.state.heartDemon) });
      }
      // Autonomous counseling or devouring for unresolved knots
      const activeKnot = n.heartDemons.find(k => k && !k.resolved);
      if (activeKnot && counseled.length < 2) {
        if (n.cult && n.cult.path === 'DEMON' && HC.eff(n, 'personality.aggression') >= 65) {
          const dRes = HEART_DEMON.devourHeartDemon(W, n, activeKnot.id, { quiet: opts.quiet });
          if (dRes && dRes.ok) counseled.push(dRes);
        } else {
          const cRes = HEART_DEMON.counselHeartDemon(W, null, n, activeKnot.id, { quiet: opts.quiet });
          if (cRes && cRes.ok) counseled.push(cRes);
        }
      }
    }
    return { ok: true, counseled };
  };

  SECT.HEART_DEMON = HEART_DEMON;

  /* =========================================================================
   * STRATEGIC PROPOSAL FLAGSHIP 3 (I03 + F01-Deep):
   * Sentient Weapon Spirits, Autonomous Heir Selection & Multi-Generational Sutra Annotation (SECT.SOUL_FORGE)
   * Weapons awaken spirits from their wielder's combat feats & choose their own heir on the wielder's death.
   * Heritage Sutras are annotated across generations by sect scholars/disciples up to Tier 5 (+35% cap).
   * ========================================================================= */
  const SOUL_FORGE = {};

  SOUL_FORGE.SPIRIT_STAGES = Object.freeze([
    { stage: 1, nameTh: 'จิตศาสตราแรกตื่น (Spirit Embryo)', minXp: 0, multBonus: 0.05 },
    { stage: 2, nameTh: 'วิญญาณศาสตรารู้สำนึก (Awakened Soul)', minXp: 40, multBonus: 0.10 },
    { stage: 3, nameTh: 'จิตศาสตราคู่เต๋า (Dao Vessel Spirit)', minXp: 100, multBonus: 0.16 },
    { stage: 4, nameTh: 'ศาสตราเทวะมีชีวิต (Divine Sentient Relic)', minXp: 180, multBonus: 0.24 },
    { stage: 5, nameTh: 'ศาสตราอมตะนิรันดร์ (Immortal Sovereign Spirit)', minXp: 300, multBonus: 0.32 }
  ]);

  SOUL_FORGE.SUTRA_EDITIONS = Object.freeze([
    { edition: 1, nameTh: 'ฉบับร่างก่อตั้ง (Founding Draft)', bonusCap: 0.08 },
    { edition: 2, nameTh: 'ฉบับสมบูรณ์ (Complete Edition)', bonusCap: 0.15 },
    { edition: 3, nameTh: 'ฉบับปรมาจารย์อรรถาธิบาย (Grandmaster Annotated)', bonusCap: 0.22 },
    { edition: 4, nameTh: 'ฉบับสวรรค์เก้าชั้น (Nine-Heavens Canon)', bonusCap: 0.29 },
    { edition: 5, nameTh: 'คัมภีร์อมตะคู่สำนัก (Immortal Sect Sutra)', bonusCap: 0.35 }
  ]);

  SOUL_FORGE.awakenWeaponSpirit = (W, smithOrOwnerNpc, targetNpcOrWeapon, opts) => {
    opts = opts || {};
    if (!W) return { ok: false, reason: 'invalid-world' };
    const explicitTarget = targetNpcOrWeapon !== undefined && targetNpcOrWeapon !== null && targetNpcOrWeapon !== '';
    let owner = null;
    if (targetNpcOrWeapon && targetNpcOrWeapon.h) {
      owner = targetNpcOrWeapon;
    } else if (typeof targetNpcOrWeapon === 'string') {
      owner = W.byId && W.byId[targetNpcOrWeapon];
    } else if (smithOrOwnerNpc && typeof smithOrOwnerNpc === 'string') {
      owner = W.byId && W.byId[smithOrOwnerNpc];
    } else if (smithOrOwnerNpc && smithOrOwnerNpc.h) {
      owner = smithOrOwnerNpc;
    } else if (!explicitTarget) {
      owner = (W.npcs || []).find(n => n && !n.dead && !n.exiled && n.equip && n.equip.WEAPON);
    }
    if (!owner || owner.dead || owner.exiled || (Array.isArray(W.npcs) && !W.npcs.includes(owner))) {
      return { ok: false, reason: 'owner-not-found' };
    }

    if (!owner.equip) owner.equip = {};
    if (!owner.equip.WEAPON) {
      if (!opts.createDefaultWeapon) {
        return { ok: false, reason: 'no-equipped-weapon' };
      }
      owner.equip.WEAPON = {
        id: 'WPN_SPIRIT_' + owner.id,
        uid: 'WPN_SPIRIT_' + owner.id + '_' + (W.day || 360),
        nameTh: 'กระบี่วิญญาณประจำกาย',
        slot: 'WEAPON',
        gearType: 'SWORD',
        tier: Math.max(3, (owner.cult && owner.cult.stage) || 3),
        combatMult: 0.18
      };
    }
    const wpn = owner.equip.WEAPON;
    const smith = (smithOrOwnerNpc && smithOrOwnerNpc.h && !smithOrOwnerNpc.dead && (!Array.isArray(W.npcs) || W.npcs.includes(smithOrOwnerNpc)))
      ? smithOrOwnerNpc
      : (SECT.holder && SECT.holder(W, 'forge')) || owner;
    const primaryEl = (owner.elementalSystem && owner.elementalSystem.primaryElement)
      || (owner.h && owner.h.root && Array.isArray(owner.h.root.elements) && owner.h.root.elements[0])
      || 'METAL';
    const elMeta = FENG_SHUI.ELEMENT_META[primaryEl] || { nameTh: 'ปราณทอง', icon: '⚔️' };

    const cappedInitXp = opts.adminOverride ? (opts.initialXp || 25) : Math.min(90, Math.max(10, Number(opts.initialXp) || 25));

    if (!wpn.weaponSpirit) {
      const natureTh = HC.eff(owner, 'personality.aggression') >= 62 ? 'ดุดันกระหายศึก' : HC.eff(owner, 'personality.integrity') >= 65 ? 'เที่ยงธรรมพิทักษ์คุณธรรม' : 'สุขุมล้ำลึก';
      let stageSpec = SOUL_FORGE.SPIRIT_STAGES[0];
      for (const sp of SOUL_FORGE.SPIRIT_STAGES) {
        if (cappedInitXp >= sp.minXp) stageSpec = sp;
      }
      wpn.weaponSpirit = {
        id: 'WSPIRIT_' + (wpn.uid || wpn.id || owner.id),
        spiritNameTh: 'จิต' + (wpn.nameTh || 'ศาสตรา') + '・' + elMeta.nameTh,
        element: primaryEl,
        elementNameTh: elMeta.nameTh,
        personalityTh: natureTh,
        stage: stageSpec.stage,
        stageNameTh: stageSpec.nameTh,
        spiritXp: cappedInitXp,
        battlesFought: 1,
        foesSlain: 0,
        multBonus: stageSpec.multBonus,
        awakenedByNpcId: smith.id,
        awakenedByNameTh: HC.fullName(smith),
        currentOwnerId: owner.id,
        currentOwnerNameTh: HC.fullName(owner),
        lastTemperDay: W.day || 360,
        formerOwners: [],
        featHistory: [
          { day: W.day || 360, textTh: 'ปลุกจิตวิญญาณศาสตราโดย ' + HC.fullName(smith) + ' ประสานกับรากปราณของ ' + HC.fullName(owner) }
        ]
      };
      wpn.combatMult = +((wpn.combatMult || 0.15) + stageSpec.multBonus).toFixed(3);
    } else {
      if (!opts.adminOverride && wpn.weaponSpirit.lastTemperDay === (W.day || 360)) {
        return { ok: false, reason: 'already-tempered-today', weapon: wpn, weaponSpirit: wpn.weaponSpirit };
      }
      wpn.weaponSpirit.lastTemperDay = W.day || 360;
      const temperXp = opts.adminOverride ? (opts.initialXp || 45) : Math.min(45, Math.max(10, Number(opts.initialXp) || 35));
      SOUL_FORGE.recordWeaponFeat(W, owner, 'หลอมขัดเกลาจิตวิญญาณศาสตราเพิ่มเติมโดย ' + HC.fullName(smith), temperXp);
    }
    if (g.STATS && g.STATS.dirty) g.STATS.dirty(owner);
    return { ok: true, weapon: wpn, weaponSpirit: wpn.weaponSpirit, owner, smith };
  };

  SOUL_FORGE.recordWeaponFeat = (W, npcOrId, featDescTh, xpGain) => {
    const npc = (typeof npcOrId === 'object' && npcOrId) ? npcOrId : (W && W.byId && W.byId[npcOrId]);
    if (!npc || !npc.equip || !npc.equip.WEAPON) return null;
    const wpn = npc.equip.WEAPON;
    if (!wpn.weaponSpirit) {
      SOUL_FORGE.awakenWeaponSpirit(W, npc, npc, { initialXp: xpGain || 15, quiet: true });
    }
    const ws = wpn.weaponSpirit;
    if (!ws) return null;
    ws.battlesFought = (ws.battlesFought || 0) + 1;
    if (/สังหาร|ปราบ|โค่น/.test(featDescTh || '')) ws.foesSlain = (ws.foesSlain || 0) + 1;
    ws.spiritXp = (ws.spiritXp || 0) + (xpGain || 20);
    if (featDescTh) {
      ws.featHistory = ws.featHistory || [];
      ws.featHistory.unshift({ day: (W && W.day) || 360, textTh: featDescTh });
      if (ws.featHistory.length > 15) ws.featHistory.length = 15;
    }

    const oldStage = ws.stage || 1;
    let newSpec = SOUL_FORGE.SPIRIT_STAGES[0];
    for (const sp of SOUL_FORGE.SPIRIT_STAGES) {
      if (ws.spiritXp >= sp.minXp) newSpec = sp;
    }
    if (newSpec.stage > oldStage) {
      const diff = newSpec.multBonus - (ws.multBonus || 0.05);
      ws.stage = newSpec.stage;
      ws.stageNameTh = newSpec.nameTh;
      ws.multBonus = newSpec.multBonus;
      wpn.combatMult = +((wpn.combatMult || 0.15) + Math.max(0, diff)).toFixed(3);
      if (W && W.log) {
        W.log('craft', '🗡️ จิตศาสตรา「' + ws.spiritNameTh + '」ของ ' + HC.fullName(npc) + ' ตื่นรู้ขึ้นสู่ขั้นที่ ' + ws.stage + ' (' + ws.stageNameTh + ')!', [npc.id]);
      }
    }
    return ws;
  };

  SOUL_FORGE.inheritSentientWeaponOnDeath = (W, deadNpc, opts) => {
    opts = opts || {};
    if (!W || !deadNpc || !deadNpc.equip || !deadNpc.equip.WEAPON || !deadNpc.equip.WEAPON.weaponSpirit) {
      return { ok: false, reason: 'no-sentient-weapon' };
    }
    const wpn = deadNpc.equip.WEAPON;
    const ws = wpn.weaponSpirit;
    const candidates = (W.npcs || []).filter(n => n && !n.dead && !n.exiled && n.id !== deadNpc.id);
    if (!candidates.length) return { ok: false, reason: 'no-living-heirs' };

    // Weapon Spirit autonomously selects its worthy heir based on bloodline child, direct disciple, companion, and elemental resonance
    candidates.sort((a, b) => {
      const score = cand => {
        let sc = 0;
        if (Array.isArray(cand.parentIds) && cand.parentIds.includes(deadNpc.id)) sc += 120;
        if (cand.mentorId === deadNpc.id || (Array.isArray(deadNpc.apprenticeIds) && deadNpc.apprenticeIds.includes(cand.id))) sc += 95;
        if (cand.companionId === deadNpc.id) sc += 90;
        const roots = (cand.h && cand.h.root && Array.isArray(cand.h.root.elements)) ? cand.h.root.elements : [];
        if (ws.element && roots.includes(ws.element)) sc += 45;
        if (cand.cult && deadNpc.cult && cand.cult.path === deadNpc.cult.path) sc += 30;
        sc += CULT.power(cand) * 0.05;
        return sc;
      };
      return score(b) - score(a);
    });

    const heir = candidates[0];
    if (((deadNpc.rank || 0) >= 4 || (deadNpc.cult && deadNpc.cult.stage >= 5)) && !ws.imbuedElderSoul) {
      ws.imbuedElderSoul = {
        elderId: deadNpc.id,
        elderNameTh: HC.fullName(deadNpc),
        elderPath: (deadNpc.cult && deadNpc.cult.path) || 'XIAN',
        imbuedDay: W.day || 360,
        guardianShieldPct: 0.25,
        counterStrikeMult: 1.50
      };
    }
    ws.formerOwners = ws.formerOwners || [];
    ws.formerOwners.push({
      npcId: deadNpc.id,
      nameTh: HC.fullName(deadNpc),
      untilDay: W.day || 360
    });
    ws.currentOwnerId = heir.id;
    ws.currentOwnerNameTh = HC.fullName(heir);
    ws.featHistory = ws.featHistory || [];
    ws.featHistory.unshift({
      day: W.day || 360,
      textTh: 'เมื่อ「' + HC.fullName(deadNpc) + '」ล่วงลับ จิตศาสตราได้เปล่งเสียงร้องและบินไปเลือก「' + HC.fullName(heir) + '」เป็นผู้สืบทอดเจตนารมณ์คนใหม่!'
    });

    deadNpc.equip.WEAPON = null;
    heir.equip = heir.equip || {};
    heir.inv = heir.inv || {};
    if (!Array.isArray(heir.inv.gear)) heir.inv.gear = [];
    const canHeirUse = (g.MARTIAL && g.MARTIAL.gearUsable) ? g.MARTIAL.gearUsable(heir, wpn) : true;
    if (!canHeirUse || heir.away || SECT.isNpcDetained(W, heir)) {
      heir.inv.gear.push(wpn);
    } else {
      if (heir.equip.WEAPON && heir.equip.WEAPON !== wpn) {
        heir.inv.gear.push(heir.equip.WEAPON);
      }
      heir.equip.WEAPON = wpn;
    }
    if (g.STATS && g.STATS.dirty) g.STATS.dirty(heir);

    const chron = (g.EXPED && g.EXPED.recordChronicle) ? g.EXPED.recordChronicle(W, {
      category: 'DAO_HEART_SUTRA',
      icon: '🗡️',
      involvedSects: [W.sect && W.sect.name].filter(Boolean),
      involvedFigures: [HC.fullName(deadNpc), HC.fullName(heir)],
      npcIds: [deadNpc.id, heir.id],
      titleTh: 'ศาสตราจิตวิญญาณเลือกนายใหม่: 「' + ws.spiritNameTh + '」บินจากร่างของ「' + HC.fullName(deadNpc) + '」ไปหา「' + HC.fullName(heir) + '」!',
      storyTh: 'เมื่อ「' + HC.fullName(deadNpc) + '」สิ้นใจลง ศาสตราคู่กายที่มีจิตวิญญาณ「' + ws.spiritNameTh + '」(ขั้นที่ ' + ws.stage + ' · ผ่านศึก ' + (ws.battlesFought || 1) + ' ครั้ง) ได้ส่งเสียงกังวานอาลัย ก่อนจะพุ่งทะยานไปหยุดลงตรงหน้า「' + HC.fullName(heir) + '」ผู้มีสายสัมพันธ์และรากปราณสอดคล้องกัน เพื่อสืบทอดเจตนารมณ์ต่อไป!',
      originCauseTh: 'การเสียชีวิตของเจ้าของศาสตราเดิม (' + HC.fullName(deadNpc) + ')',
      actorChainTh: 'จิตศาสตรา「' + ws.spiritNameTh + '」เลือกผู้สืบทอด: ' + HC.fullName(heir),
      systemImpactTh: 'เชื่อมโยง AI.kill ➔ SOUL_FORGE ➔ สืบทอดอาวุธระดับสูงพร้อมโบนัสจิตศาสตรา (+' + Math.round((ws.multBonus || 0.05) * 100) + '%) โดยไม่ต้องสร้างใหม่',
      consequenceTh: HC.fullName(heir) + ' สวมใส่「' + wpn.nameTh + '」(' + ws.spiritNameTh + ') สืบทอดต่อเป็นรุ่นที่ ' + (ws.formerOwners.length + 1),
      quiet: opts.quiet
    }) : null;
    if (SECT.recordTimelineMilestone) {
      SECT.recordTimelineMilestone(W, {
        milestoneType: 'LEGENDARY_CRAFT',
        icon: '🗡️',
        titleTh: 'สืบทอดศาสตราจิตวิญญาณ「' + ws.spiritNameTh + '」จาก ' + HC.fullName(deadNpc) + ' สู่ ' + HC.fullName(heir),
        descTh: 'ศาสตราผ่านศึก ' + (ws.battlesFought || 1) + ' ครั้ง เลือกผู้สืบทอดรุ่นที่ ' + (ws.formerOwners.length + 1),
        involvedIds: [deadNpc.id, heir.id],
        quiet: true
      });
    }
    return { ok: true, weapon: wpn, weaponSpirit: ws, formerOwner: deadNpc, heir, chronicle: chron };
  };

  SOUL_FORGE.annotateHeritageSutra = (W, scholarNpcOrId, artId, opts) => {
    opts = opts || {};
    if (!W || !W.sect || !SECT.MENTORSHIP) return { ok: false, reason: 'invalid-world' };
    const ms = SECT.MENTORSHIP.ensure(W);
    const scholar = (typeof scholarNpcOrId === 'object' && scholarNpcOrId)
      ? scholarNpcOrId
      : (scholarNpcOrId && W.byId && W.byId[scholarNpcOrId])
      || SECT.holder(W, 'scripture')
      || (W.byId && W.byId[W.sect.masterId])
      || (W.npcs || []).find(n => n && !n.dead && n.cult);
    if (!scholar || scholar.dead) return { ok: false, reason: 'no-scholar-npc' };

    if (!Array.isArray(ms.heritageArts) || !ms.heritageArts.length) {
      SECT.MENTORSHIP.synthesizeSectArt(W, scholar, { force: true, quiet: true });
    }
    const art = artId
      ? ms.heritageArts.find(a => a && a.id === artId)
      : ms.heritageArts[0];
    if (!art) return { ok: false, reason: 'heritage-sutra-not-found' };

    if (!Array.isArray(art.annotations)) art.annotations = [];
    const curEdition = clamp((art.editionTier || 1), 1, 5);
    const nextEdition = Math.min(5, curEdition + 1);
    const edSpec = SOUL_FORGE.SUTRA_EDITIONS[nextEdition - 1];

    const noteTh = 'อรรถาธิบายรุ่นที่ ' + (art.annotations.length + 1) + ' โดย「' + HC.fullName(scholar) + '」: เสริมเคล็ดการเดินปราณและแก้จุดอ่อนกระบวนท่า ยกระดับสู่ ' + edSpec.nameTh;
    const ann = {
      id: 'ANN_' + art.id + '_' + (art.annotations.length + 1),
      authorId: scholar.id,
      authorNameTh: HC.fullName(scholar),
      day: W.day || 360,
      editionTier: nextEdition,
      editionNameTh: edSpec.nameTh,
      bonusCap: edSpec.bonusCap,
      noteTh
    };
    art.annotations.push(ann);
    art.editionTier = nextEdition;
    art.editionNameTh = edSpec.nameTh;
    art.sutraBonusPct = edSpec.bonusCap; // Strictly capped <= 0.35 per Proposal guardrail

    const tObj = CULT.tech(art.id);
    if (tObj) {
      tObj.power = Math.round((tObj.power || 100) * 1.06);
      tObj.editionTier = nextEdition;
      tObj.editionNameTh = edSpec.nameTh;
    }
    scholar.merit = (scholar.merit || 0) + 15;
    if (g.MARTIAL && g.MARTIAL.skillPractice) g.MARTIAL.skillPractice(scholar, 'SCRIPTURE', 0.5, 1.4);

    const chron = (g.EXPED && g.EXPED.recordChronicle) ? g.EXPED.recordChronicle(W, {
      category: 'DAO_HEART_SUTRA',
      icon: '📜',
      involvedSects: [W.sect && W.sect.name].filter(Boolean),
      involvedFigures: [HC.fullName(scholar), art.creatorNameTh].filter(Boolean),
      npcIds: [scholar.id],
      titleTh: 'ขัดเกลาคัมภีร์มรดกข้ามรุ่น: 「' + HC.fullName(scholar) + '」ยกระดับ「' + art.nameTh + '」สู่' + edSpec.nameTh + '!',
      storyTh: HC.fullName(scholar) + ' ได้ศึกษาคัมภีร์ประจำสำนัก「' + art.nameTh + '」(ที่บัญญัติไว้โดย ' + (art.creatorNameTh || 'ปรมาจารย์รุ่นก่อน') + ') จนแตกฉาน จึงเขียนอรรถาธิบายเสริมเคล็ดวิชาลงในม้วนคัมภีร์ ยกระดับขึ้นเป็น「' + edSpec.nameTh + '」เพื่อให้ศิษย์รุ่นหลังเรียนรู้ได้รวดเร็วยิ่งขึ้น!',
      originCauseTh: 'การสั่งสมความเข้าใจในคัมภีร์มรดกสำนักของศิษย์/บรรณารักษ์รุ่นปัจจุบัน',
      actorChainTh: 'ผู้บัญญัติต้นฉบับ: ' + (art.creatorNameTh || '-') + ' ➔ ผู้เขียนอรรถาธิบายรุ่นที่ ' + art.annotations.length + ': ' + HC.fullName(scholar),
      systemImpactTh: 'เชื่อมโยง SOUL_FORGE ➔ A.study (เร่งความเร็วเรียนคัมภีร์นี้ให้ศิษย์รุ่นหลัง +' + Math.round((nextEdition - 1) * 10) + '%) + พลังวิชา (+' + Math.round(edSpec.bonusCap * 100) + '%)',
      consequenceTh: 'คัมภีร์「' + art.nameTh + '」เลื่อนเป็น ' + edSpec.nameTh + ' (โบนัสเพดาน +' + Math.round(edSpec.bonusCap * 100) + '%)',
      quiet: opts.quiet
    }) : null;
    if (SECT.recordTimelineMilestone && nextEdition >= 3) {
      SECT.recordTimelineMilestone(W, {
        milestoneType: 'LEGENDARY_CRAFT',
        icon: '📜',
        titleTh: 'ยกระดับคัมภีร์ประจำสำนัก「' + art.nameTh + '」สู่ ' + edSpec.nameTh,
        descTh: 'เขียนอรรถาธิบายต่อยอดโดย ' + HC.fullName(scholar) + ' (ขัดเกลาสะสม ' + art.annotations.length + ' รุ่น)',
        involvedIds: [scholar.id],
        quiet: true
      });
    }
    return { ok: true, sutra: art, annotation: ann, scholar, chronicle: chron };
  };

  SECT.SOUL_FORGE = SOUL_FORGE;

  /* =========================================================================
   * STRATEGIC PROPOSAL FLAGSHIP 4 (F07):
   * Dynamic Jianghu Market Index, Disciple-Led Trade Caravans & Seasonal Immortal Auction House (SECT.CARAVAN_AUCTION)
   * Market prices respond to real wars/seasons; Treasurer/Diplomat dispatches escorted caravans;
   * Foreign Sect Masters and Player Sect Master/Treasurer bid in the Seasonal Immortal Auction.
   * ========================================================================= */
  const CARAVAN_AUCTION = {};

  CARAVAN_AUCTION.MARKET_CATEGORIES = Object.freeze({
    ALCH_PILL: { id: 'ALCH_PILL', nameTh: 'โอสถทิพย์และยารักษา', icon: '💊', basePrice: 120, sampleItemId: 'P:BASIC_QI' },
    HERB_SPIRIT: { id: 'HERB_SPIRIT', nameTh: 'สมุนไพรวิญญาณ', icon: '🌿', basePrice: 45, sampleItemId: 'herb' },
    ORE_METAL: { id: 'ORE_METAL', nameTh: 'แร่ปราณและโลหะสวรรค์', icon: '⛏️', basePrice: 55, sampleItemId: 'ore' },
    WEAPON_GEAR: { id: 'WEAPON_GEAR', nameTh: 'ศาสตราวุธและชุดเกราะ', icon: '⚔️', basePrice: 180, sampleItemId: 'ore' },
    TALISMAN_ARRAY: { id: 'TALISMAN_ARRAY', nameTh: 'ยันต์และแผ่นค่ายกล', icon: '🧧', basePrice: 140, sampleItemId: 'CAT_PRIMORDIAL_METAL' },
    SPIRIT_CUISINE: { id: 'SPIRIT_CUISINE', nameTh: 'เสบียงและอาหารปราณ', icon: '🍲', basePrice: 35, sampleItemId: 'meal' },
    BEAST_CORE: { id: 'BEAST_CORE', nameTh: 'แก่นอสูรและวัตถุดิบสัตว์วิญญาณ', icon: '🐾', basePrice: 160, sampleItemId: 'herb' },
    ANCIENT_SUTRA: { id: 'ANCIENT_SUTRA', nameTh: 'ตำราโบราณและผลึกความรู้', icon: '📜', basePrice: 220, sampleItemId: 'P:BASIC_QI' }
  });

  CARAVAN_AUCTION.AUCTION_LOT_TEMPLATES = Object.freeze([
    {
      id: 'LOT_ASTRAL_LEYLINE_CORE',
      nameTh: 'แก่นค่ายกลดาราสวรรค์พันปี (Astral Leyline Core)',
      icon: '🌌',
      category: 'LEYLINE_CORE',
      element: 'ASTRAL',
      baseBid: 320,
      descTh: 'แก่นปราณดาราบริสุทธิ์สำหรับฝังลงในเส้นชีพจรปราณของอาคาร ยกระดับฮวงจุ้ยสู่เกรด S/SSS ทันที'
    },
    {
      id: 'LOT_BLOOD_FIEND_CORE',
      nameTh: 'ผลึกชีพจรโลหิตบรรพกาล (Blood Leyline Core)',
      icon: '🩸',
      category: 'LEYLINE_CORE',
      element: 'BLOOD',
      baseBid: 300,
      descTh: 'ผลึกปราณโลหิตเข้มข้นสำหรับตั้งค่ายกลหมอกโลหิตและเร่งตบะสายมาร/กายา'
    },
    {
      id: 'LOT_ANCIENT_SUTRA_SCROLL',
      nameTh: 'ม้วนคัมภีร์โบราณฉบับปรมาจารย์สาบสูญ',
      icon: '📜',
      category: 'SUTRA_SCROLL',
      baseBid: 360,
      descTh: 'เศษคัมภีร์โบราณจากยุคบรรพกาล เมื่อนำเข้าหอคัมภีร์จะยกระดับอรรถาธิบายคัมภีร์ประจำสำนักขึ้น 1 ขั้นทันที'
    },
    {
      id: 'LOT_SOUL_EMBRYO_METEOR',
      nameTh: 'ศิลาดาวตกปลุกจิตศาสตราเทวะ (Soul-Forge Meteorite)',
      icon: '☄️',
      category: 'WEAPON_SPIRIT_STONE',
      baseBid: 340,
      descTh: 'แร่อุกกาบาตที่มีจิตสำนึกฟ้าดิน ใช้หลอมปลุกจิตวิญญาณศาสตราคู่กายของศิษย์เอกให้ตื่นรู้ทันที (+90 XP)'
    },
    {
      id: 'LOT_NIRVANA_HEART_LOTUS',
      nameTh: 'บัวแก้วนิพพานชำระมารในใจ (Heart-Clearing Lotus)',
      icon: '🪷',
      category: 'HEART_DEMON_ELIXIR',
      baseBid: 280,
      descTh: 'โอสถดอกบัวทิพย์ที่สลายปมมารในใจของศิษย์ได้ทันทีและแปรเปลี่ยนเป็นตราแจ้งชัดแห่งเต๋า'
    }
  ]);

  CARAVAN_AUCTION.ensure = W => {
    if (!W || !W.world || !W.sect) return null;
    if (!W.world.marketIndex || typeof W.world.marketIndex !== 'object') {
      W.world.marketIndex = {};
      Object.keys(CARAVAN_AUCTION.MARKET_CATEGORIES).forEach(k => {
        W.world.marketIndex[k] = {
          id: k,
          nameTh: CARAVAN_AUCTION.MARKET_CATEGORIES[k].nameTh,
          icon: CARAVAN_AUCTION.MARKET_CATEGORIES[k].icon,
          multiplier: 1.0,
          trend: 'STABLE',
          volumeSold: 0,
          reasonTh: 'สภาวะตลาดปกติ'
        };
      });
    }
    if (!Array.isArray(W.sect.caravans)) W.sect.caravans = [];
    if (!W.world.auctionHouse || typeof W.world.auctionHouse !== 'object') {
      W.world.auctionHouse = {
        seq: 0,
        seasonOpened: -1,
        activeLots: [],
        history: []
      };
    }
    return { marketIndex: W.world.marketIndex, caravans: W.sect.caravans, auctionHouse: W.world.auctionHouse };
  };

  CARAVAN_AUCTION.updateMarketIndex = W => {
    const st = CARAVAN_AUCTION.ensure(W);
    if (!st) return null;
    const idx = st.marketIndex;
    const chrons = (W.world && Array.isArray(W.world.chronicles)) ? W.world.chronicles.slice(0, 12) : [];
    const recentWars = chrons.filter(c => c && c.category === 'BATTLE').length;
    const recentRealms = chrons.filter(c => c && c.category === 'SECRET_REALM').length;
    const season = W.season || 0;

    Object.keys(CARAVAN_AUCTION.MARKET_CATEGORIES).forEach(k => {
      const entry = idx[k] || (idx[k] = { id: k, multiplier: 1.0, trend: 'STABLE', volumeSold: 0 });
      let mult = 1.0;
      let reasonTh = 'อุปสงค์และอุปทานสมดุล';

      if ((k === 'ALCH_PILL' || k === 'WEAPON_GEAR') && recentWars >= 1) {
        mult += Math.min(0.48, recentWars * 0.16);
        reasonTh = 'เกิดศึกสงครามในยุทธภพ สำนักต่างๆ กว้านซื้อโอสถและศาสตราวุธ';
      } else if (k === 'HERB_SPIRIT' && season === 3) {
        mult += 0.30;
        reasonTh = 'ฤดูหนาวสมุนไพรปราณหายาก ราคาตลาดพุ่งสูงขึ้น';
      } else if (k === 'SPIRIT_CUISINE' && (W.world.activeCalamity || season === 3)) {
        mult += 0.28;
        reasonTh = 'ความต้องการเสบียงปราณสำรองพุ่งสูงขึ้นทั่วแคว้น';
      } else if (k === 'TALISMAN_ARRAY' && recentRealms >= 1) {
        mult += 0.25;
        reasonTh = 'แดนลับโบราณคลายผนึก ยอดฝีมือต้องการยันต์และแผ่นค่ายกล';
      } else if (k === 'ORE_METAL' && recentWars >= 1) {
        mult += 0.22;
        reasonTh = 'โรงหลอมทั่วหล้าเร่งตีศาสตราเสริมทัพ';
      }

      // Celestial Alignment market price influence (PROP-24)
      const celEv = (W.celestialAlignment && W.celestialAlignment.activeEvent) || W.celestialEvent;
      if (celEv && celEv.id === 'NINE_SUN_CONVERGENCE' && (k === 'HERB_SPIRIT' || k === 'ALCH_PILL')) {
        mult += 0.45;
        reasonTh = 'ปรากฏการณ์เก้าสุริยันเรียงตัว สมุนไพรหยินน้ำแข็งและโอสถดับพิษไฟราคาพุ่ง +45%';
      } else if (celEv && celEv.id === 'BLOOD_MOON_ECLIPSE' && (k === 'HERB_SPIRIT' || k === 'BEAST_CORE')) {
        mult += 0.40;
        reasonTh = 'ปรากฏการณ์จันทรุปราคาโลหิต สมุนไพรสายหยินและแก่นอสูรโลหิตราคาพุ่ง +40%';
      } else if (celEv && celEv.id === 'ASTRAL_METEOR_SHOWER' && (k === 'ORE_METAL' || k === 'TALISMAN_ARRAY')) {
        mult += 0.35;
        reasonTh = 'ปรากฏการณ์ฝนดาวตกดาราจักร แร่ดาราและแผ่นค่ายกลเป็นที่ต้องการสูง +35%';
      } else if (celEv && celEv.id === 'PRANA_TIDE_INFLUX' && k === 'ANCIENT_SUTRA') {
        mult += 0.30;
        reasonTh = 'กระแสปราณบรรพกาลทะลัก ผู้ฝึกตนทั่วหล้ากว้านซื้อคัมภีร์ทะลวงด่าน +30%';
      }

      // Saturation penalty from excessive player selling (Proposal F07 guardrail: 0.65x .. 1.65x)
      const satPenalty = Math.min(0.35, Math.floor((entry.volumeSold || 0) / 15) * 0.07);
      mult = clamp(+(mult - satPenalty).toFixed(2), 0.65, 1.65);
      entry.trend = mult >= 1.12 ? 'UP' : mult <= 0.88 ? 'DOWN' : 'STABLE';
      entry.multiplier = mult;
      entry.reasonTh = satPenalty >= 0.14 ? 'สินค้าล้นตลาดจากการเทขายจำนวนมาก ราคารับซื้อลดลงชั่วคราว' : reasonTh;
      entry.volumeSold = Math.max(0, Math.floor((entry.volumeSold || 0) * 0.6));
    });
    return idx;
  };

  CARAVAN_AUCTION.dispatchTradeCaravan = (W, categoryId, targetSectOrId, opts) => {
    opts = opts || {};
    const st = CARAVAN_AUCTION.ensure(W);
    if (!st) return { ok: false, reason: 'invalid-world' };
    const curDay = W.day || 360;
    if (!opts.allowRepeatSameDay && st.caravans.some(c => c && c.day === curDay)) {
      return { ok: false, reason: 'caravan-cooldown-same-day', day: curDay };
    }
    CARAVAN_AUCTION.updateMarketIndex(W);

    const alive = (W.npcs || []).filter(n => n && !n.dead && !n.exiled && !n.away && !SECT.isNpcDetained(W, n));
    if (alive.length < 2 && !opts.force) return { ok: false, reason: 'insufficient-disciples' };

    // Leader is Treasurer, Diplomat, or highest diplomacy/administration NPC
    const leader = SECT.holder(W, 'treasury')
      || SECT.holder(W, 'diplomat')
      || alive.slice().sort((a, b) => ((b.h.skills.diplomacy || 0) + (b.h.skills.administration || 0)) - ((a.h.skills.diplomacy || 0) + (a.h.skills.administration || 0)))[0];
    const guards = alive.filter(n => n.id !== leader.id).sort((a, b) => CULT.power(b) - CULT.power(a)).slice(0, 2);

    // Pick highest-multiplier category if not specified
    const catKeys = Object.keys(CARAVAN_AUCTION.MARKET_CATEGORIES);
    const chosenCatKey = (categoryId && CARAVAN_AUCTION.MARKET_CATEGORIES[categoryId])
      ? categoryId
      : catKeys.slice().sort((a, b) => (st.marketIndex[b]?.multiplier || 1) - (st.marketIndex[a]?.multiplier || 1))[0];
    const catDef = CARAVAN_AUCTION.MARKET_CATEGORIES[chosenCatKey];
    const mEntry = st.marketIndex[chosenCatKey];

    const allSects = (W.world && W.world.allSects) || [];
    const destSect = (targetSectOrId && g.EXPED && g.EXPED.findSect && g.EXPED.findSect(W, targetSectOrId))
      || allSects.filter(s => s && (s.attitude || 0) >= 0).sort((a, b) => (b.attitude || 0) - (a.attitude || 0))[0]
      || allSects[0];

    const qty = opts.qty || 12;
    const dipBonus = 1 + Math.min(0.20, (((leader.h && leader.h.skills && leader.h.skills.diplomacy) || 30) / 300));
    const hostTaxBonus = (W.world && W.world.grandAssembly && W.world.grandAssembly.continentalHostSectId === 'PLAYER') ? (1 + (W.world.grandAssembly.hostMarketTaxBonus || 0.15)) : 1.0;
    // This is payment for escorting a third-party caravan, not a sale of
    // untracked sect inventory. The buyer pays from the world treasury.
    const pool = W.world.resourcePool || (W.world.resourcePool = { stones: 50000, herbs: 5000, ores: 5000 });
    const quotedRevenue = Math.round(catDef.basePrice * (qty / 4) * (mEntry ? mEntry.multiplier : 1.1) * dipBonus * hostTaxBonus);
    const revenue = Math.min(quotedRevenue, Number.isFinite(pool.stones) ? Math.max(0, pool.stones) : 0);
    pool.stones -= revenue;

    if (mEntry) {
      mEntry.volumeSold = (mEntry.volumeSold || 0) + qty;
    }
    if (ECO && ECO.earn) {
      ECO.earn(W, revenue, 'ค่าคุ้มกันกองคาราวานหมวด「' + catDef.nameTh + '」สู่' + (destSect ? destSect.nameTh : 'ต่างแคว้น'));
    }

    // Escort event: guards repel highwaymen or bond with each other
    const party = [leader].concat(guards);
    party.forEach(m => {
      m.merit = (m.merit || 0) + 12;
      if (g.CPE && g.CPE.mint) g.CPE.mint(W, m, 18, 'คุ้มกันกองคาราวานการค้า', true);
      else m.cp = (m.cp || 0) + 18;
      if (m.cult) CULT.gain(m, 25, W, 'caravan_escort');
    });
    if (guards.length >= 2) {
      const r01 = SECT.rel(guards[0], guards[1].id);
      const r10 = SECT.rel(guards[1], guards[0].id);
      r01.a = clamp((r01.a || 0) + 8, -100, 100);
      r10.a = clamp((r10.a || 0) + 8, -100, 100);
    }
    if (destSect) {
      destSect.attitude = clamp((destSect.attitude || 0) + 5, -100, 100);
    }

    const caravanRec = {
      id: 'CARAVAN_' + (W.day || 360) + '_' + (st.caravans.length + 1),
      day: W.day || 360,
      leaderId: leader.id,
      leaderNameTh: HC.fullName(leader),
      guardIds: guards.map(gNpc => gNpc.id),
      guardNamesTh: guards.map(gNpc => HC.fullName(gNpc)),
      categoryId: chosenCatKey,
      categoryNameTh: catDef.nameTh,
      destSectId: destSect ? destSect.id : null,
      destSectNameTh: destSect ? destSect.nameTh : 'เมืองการค้าชายแดน',
      multiplier: mEntry ? mEntry.multiplier : 1.0,
      revenue,
      status: 'COMPLETED',
      summaryTh: HC.fullName(leader) + ' นำศิษย์คุ้มกันคาราวานสินค้า「' + catDef.nameTh + '」สู่「' + (destSect ? destSect.nameTh : 'เมืองการค้า') + '」รับค่าจ้าง +' + revenue + ' ศิลาวิญญาณ!'
    };
    st.caravans.unshift(caravanRec);
    if (st.caravans.length > 20) st.caravans.length = 20;

    const chron = (g.EXPED && g.EXPED.recordChronicle) ? g.EXPED.recordChronicle(W, {
      category: 'ECONOMY_AUCTION',
      icon: '🐪',
      involvedSects: [W.sect.name, destSect && destSect.nameTh].filter(Boolean),
      involvedFigures: party.map(p => HC.fullName(p)),
      npcIds: party.map(p => p.id),
      titleTh: 'ขบวนคาราวานการค้าศิษย์: 「' + HC.fullName(leader) + '」คุ้มกัน「' + catDef.nameTh + '」รับค่าจ้าง +' + revenue + ' ศิลา!',
      storyTh: caravanRec.summaryTh,
      originCauseTh: (mEntry && mEntry.reasonTh) || 'พ่อค้าต่างแคว้นว่าจ้างศิษย์สำนักคุ้มกันขบวนสินค้า',
      actorChainTh: 'หัวหน้าขบวน: ' + HC.fullName(leader) + ' · องครักษ์คุ้มกัน: ' + guards.map(gNpc => HC.fullName(gNpc)).join(', '),
      systemImpactTh: 'เชื่อมโยง העולםสงคราม/ฤดูกาล ➔ ดัชนีตลาด (×' + (mEntry ? mEntry.multiplier.toFixed(2) : '1.00') + ') ➔ คลังศิลาสำนัก (+' + revenue + ') + ความสัมพันธ์สำนักคู่ค้า (+5) + มิตรภาพศิษย์คุ้มกัน (+8)',
      consequenceTh: 'คลังสำนัก +' + revenue + ' ศิลาวิญญาณ · คณะคุ้มกันได้รับตบะ +25 และ +18 CP',
      quiet: opts.quiet
    }) : null;
    return { ok: true, caravan: caravanRec, revenue, multiplier: mEntry ? mEntry.multiplier : 1.0, chronicle: chron };
  };

  CARAVAN_AUCTION.openSeasonalAuction = (W, opts) => {
    opts = opts || {};
    const st = CARAVAN_AUCTION.ensure(W);
    if (!st) return { ok: false, reason: 'invalid-world' };
    const ah = st.auctionHouse;
    const allSects = (W.world && W.world.allSects) || [];
    const curSeason = W.season || 0;
    const preservedWonLots = Array.isArray(ah.activeLots) ? ah.activeLots.filter(l => l && l.status === 'WON_BY_PLAYER') : [];
    if (!opts.forceReset && ah.seasonOpened === curSeason && Array.isArray(ah.activeLots) && ah.activeLots.length > 0) {
      return { ok: true, alreadyOpenThisSeason: true, auctionHouse: ah, lots: ah.activeLots };
    }

    ah.seq = (ah.seq || 0) + 1;
    ah.seasonOpened = curSeason;
    ah.openedDay = W.day || 360;

    // Before opening a new season's lots, resolve any unclaimed OPEN lots from the previous season for the rival foreign sects!
    if (Array.isArray(ah.activeLots) && ah.activeLots.length) {
      ah.activeLots.filter(l => l && l.status === 'OPEN' && l.highestBidderSectId && l.highestBidderSectId !== 'PLAYER').forEach(l => {
        l.status = 'WON_BY_FOREIGN_SECT';
        const winSect = g.EXPED && g.EXPED.findSect ? g.EXPED.findSect(W, l.highestBidderSectId) : null;
        if (winSect) {
          winSect.power = +((winSect.power || 1.2) + 0.08).toFixed(2);
          if (winSect.figures && winSect.figures.master) {
            winSect.figures.master.power = Math.round((winSect.figures.master.power || 380) * 1.08);
          }
        }
      });
    }

    // Generate 4 seasonal auction lots with initial bids from rival Sect Masters / Craft Elders
    ah.activeLots = CARAVAN_AUCTION.AUCTION_LOT_TEMPLATES.slice(0, 4).map((tpl, idx) => {
      const rivalSect = allSects[idx % Math.max(1, allSects.length)];
      const rivalBidder = (rivalSect && rivalSect.figures && (rivalSect.figures.craftElder || rivalSect.figures.master)) || null;
      const startBid = tpl.baseBid + idx * 20;
      return {
        lotId: 'AUCLOT_' + ah.seq + '_' + (idx + 1),
        templateId: tpl.id,
        nameTh: tpl.nameTh,
        icon: tpl.icon,
        category: tpl.category,
        element: tpl.element || null,
        descTh: tpl.descTh,
        currentBid: startBid,
        highestBidderType: 'FOREIGN_SECT',
        highestBidderSectId: rivalSect ? rivalSect.id : 'S0',
        highestBidderNameTh: rivalBidder ? (rivalBidder.titleAndNameTh + ' (' + rivalSect.nameTh + ')') : 'หอการค้าหมื่นสมบัติ',
        status: 'OPEN'
      };
    }).concat(preservedWonLots);

    return { ok: true, auctionHouse: ah, lots: ah.activeLots };
  };

  CARAVAN_AUCTION.bidOnAuctionLot = (W, lotOrId, bidderNpcOrId, opts) => {
    opts = opts || {};
    const st = CARAVAN_AUCTION.ensure(W);
    if (!st) return { ok: false, reason: 'invalid-world' };
    const ah = st.auctionHouse;
    if (!Array.isArray(ah.activeLots) || !ah.activeLots.length) {
      CARAVAN_AUCTION.openSeasonalAuction(W, { quiet: true });
    }
    const lot = (typeof lotOrId === 'object' && lotOrId)
      ? lotOrId
      : ah.activeLots.find(l => l && (l.lotId === lotOrId || l.templateId === lotOrId) && l.status === 'OPEN')
      || ah.activeLots.find(l => l && l.status === 'OPEN');
    if (!lot) return { ok: false, reason: 'lot-not-found' };

    const bidder = (typeof bidderNpcOrId === 'object' && bidderNpcOrId)
      ? bidderNpcOrId
      : (bidderNpcOrId && W.byId && W.byId[bidderNpcOrId])
      || SECT.holder(W, 'treasury')
      || (W.byId && W.byId[W.sect.masterId])
      || (W.npcs && W.npcs[0]);

    const winPrice = opts.free ? 0 : Math.round(lot.currentBid * 1.15);
    if (!opts.free && (W.sect.stones || 0) < winPrice) {
      return { ok: false, reason: 'insufficient-stones', required: winPrice };
    }
    if (winPrice > 0 && ECO && ECO.pay) {
      ECO.pay(W, winPrice, 'ชนะการประมูล「' + lot.nameTh + '」ณ หอประมูลแดนเซียน');
    }

    lot.currentBid = winPrice;
    lot.highestBidderType = 'PLAYER_SECT';
    lot.highestBidderSectId = 'PLAYER';
    lot.highestBidderNameTh = (bidder ? HC.fullName(bidder) : 'เจ้าสำนัก') + ' (' + W.sect.name + ')';
    lot.status = 'WON_BY_PLAYER';

    // Immediately connect auction prize to Systems 1, 2, or 3!
    let effectSummaryTh = '';
    if (lot.category === 'LEYLINE_CORE') {
      const fs = FENG_SHUI.ensure(W);
      const el = lot.element || 'ASTRAL';
      fs.leylineCoresStock[el] = (fs.leylineCoresStock[el] || 0) + 1;
      const attRes = FENG_SHUI.attuneBuilding(W, bidder, el === 'BLOOD' ? 'discipline' : 'meditation_hall', el, { quiet: true });
      effectSummaryTh = 'นำแก่นปราณ ' + el + ' ไปติดตั้งในค่ายกลฮวงจุ้ยสำนัก (' + (attRes && attRes.node ? ('เกรด ' + attRes.node.grade) : 'สำเร็จ') + ')';
    } else if (lot.category === 'SUTRA_SCROLL') {
      const annRes = SOUL_FORGE.annotateHeritageSutra(W, bidder, null, { quiet: true });
      effectSummaryTh = annRes && annRes.ok ? ('นำม้วนคัมภีร์โบราณไปขัดเกลา「' + annRes.sutra.nameTh + '」สู่ ' + annRes.sutra.editionNameTh) : 'เพิ่มความเข้าใจคัมภีร์โบราณเข้าหอคัมภีร์';
    } else if (lot.category === 'WEAPON_SPIRIT_STONE') {
      const wsRes = SOUL_FORGE.awakenWeaponSpirit(W, bidder, bidder, { initialXp: 90, quiet: true });
      effectSummaryTh = wsRes && wsRes.weaponSpirit ? ('หลอมปลุกจิตศาสตรา「' + wsRes.weaponSpirit.spiritNameTh + '」ขึ้นสู่ขั้น ' + wsRes.weaponSpirit.stage) : 'เสริมปราณศาสตราสำนัก';
    } else if (lot.category === 'HEART_DEMON_ELIXIR') {
      const hdRes = HEART_DEMON.counselHeartDemon(W, bidder, null, null, { quiet: true });
      effectSummaryTh = hdRes && hdRes.ok ? ('ใช้บัวแก้วนิพพานช่วย ' + HC.fullName(hdRes.target) + ' สลายปมมารในใจสำเร็จ') : 'สำรองบัวแก้วนิพพานไว้คุ้มครองจิตใจศิษย์';
    }

    const histRec = {
      day: W.day || 360,
      lotId: lot.lotId,
      nameTh: lot.nameTh,
      winnerNameTh: lot.highestBidderNameTh,
      price: winPrice,
      effectSummaryTh
    };
    ah.history.unshift(histRec);
    if (ah.history.length > 25) ah.history.length = 25;

    const chron = (g.EXPED && g.EXPED.recordChronicle) ? g.EXPED.recordChronicle(W, {
      category: 'ECONOMY_AUCTION',
      icon: '🔨',
      involvedSects: [W.sect.name],
      involvedFigures: [bidder ? HC.fullName(bidder) : 'เจ้าสำนัก'],
      npcIds: bidder ? [bidder.id] : [],
      titleTh: 'ชนะประมูลหอแดนเซียน: 「' + (bidder ? HC.fullName(bidder) : 'สำนักเรา') + '」คว้า「' + lot.nameTh + '」ด้วยราคา ' + winPrice + ' ศิลา!',
      storyTh: (bidder ? HC.fullName(bidder) : 'ตัวแทนสำนักเรา') + ' เคาะราคาประมูลเฉือนชนะตัวแทนสำนักคู่แข่งในหอประมูลแดนเซียน คว้า「' + lot.nameTh + '」มาครองและนำไปใช้ยกระดับสำนักทันที!',
      originCauseTh: 'การเปิดประมูลสมบัติหายากประจำฤดูกาล ณ หอประมูลแดนเซียน',
      actorChainTh: 'ผู้ประมูล: ' + (bidder ? HC.fullName(bidder) : 'เจ้าสำนัก') + ' (ใช้ศิลาสำนัก ' + winPrice + ' ก้อน)',
      systemImpactTh: 'เชื่อมโยง CARAVAN_AUCTION ➔ ' + effectSummaryTh,
      consequenceTh: effectSummaryTh,
      quiet: opts.quiet
    }) : null;
    return { ok: true, lot, price: winPrice, effectSummaryTh, bidder, chronicle: chron };
  };

  CARAVAN_AUCTION.tick = (W, opts) => {
    opts = opts || {};
    const st = CARAVAN_AUCTION.ensure(W);
    if (!st) return { ok: false };
    CARAVAN_AUCTION.updateMarketIndex(W);

    // Open new auction lots if empty or on new season
    if (!st.auctionHouse.activeLots.length || st.auctionHouse.seasonOpened !== (W.season || 0)) {
      CARAVAN_AUCTION.openSeasonalAuction(W, { quiet: opts.quiet });
    }

    // Autonomous Caravan Dispatch by Treasurer/Diplomat if market has a high-demand item (>= 1.15x)
    let caravanRes = null;
    const highDemandCat = Object.values(st.marketIndex).find(m => m && m.multiplier >= 1.15);
    if (highDemandCat && ((W.day || 360) % 30 === 0 || opts.forceCaravan)) {
      caravanRes = CARAVAN_AUCTION.dispatchTradeCaravan(W, highDemandCat.id, null, { quiet: opts.quiet });
    }

    // Autonomous Auction Bid by Player Sect Master/Treasurer in Idle Play if stones >= 1500
    let autoBidRes = null;
    const openLot = st.auctionHouse.activeLots.find(l => l && l.status === 'OPEN');
    if (openLot && (W.sect.stones || 0) >= openLot.currentBid * 3.2) {
      autoBidRes = CARAVAN_AUCTION.bidOnAuctionLot(W, openLot, null, { quiet: opts.quiet });
    }

    return { ok: true, marketIndex: st.marketIndex, caravan: caravanRes, autoBid: autoBidRes };
  };

  SECT.CARAVAN_AUCTION = CARAVAN_AUCTION;

  /* =========================================================================
   * STRATEGIC PROPOSAL FLAGSHIP 5 (F10 + Section 4.1):
   * Elder Council 4-Clique Voting, Seasonal Clique Agendas, Autonomous Edicts
   * & Post-Holder Personality / Nepotism Audits (SECT.ELDER_COUNCIL_EDICTS)
   * Every policy vote, reserve quota execution, and corruption/stewardship event
   * originates from actual NPCs in the 22 posts and 4 cliques.
   * ========================================================================= */
  const ELDER_COUNCIL_EDICTS = {};

  ELDER_COUNCIL_EDICTS.CLIQUE_AGENDA_DEFS = Object.freeze({
    HAWK_MARTIAL: {
      cliqueId: 'HAWK_MARTIAL',
      agendaId: 'MARTIAL_SUPREMACY_CRUSADE',
      nameTh: 'วาระก๊กเหยี่ยว: แผ่แสนยานุภาพยุทธ์และพิชิตศึกแดนลับ',
      icon: '🦅',
      targetMetric: 'EXPEDITION_OR_ASSEMBLY_WIN',
      rewardFame: 8,
      descTh: 'ก๊กเหยี่ยวเรียกร้องให้สำนักส่งทีมบุกแดนลับระดับลึก ชนะงานประลองยุทธภพ หรือปราบศัตรูเพื่อเชิดชูเกียรติภูมิสายบู๊'
    },
    ORTHODOX_TRADITION: {
      cliqueId: 'ORTHODOX_TRADITION',
      agendaId: 'ORTHODOX_DISCIPLINE_SUTRA',
      nameTh: 'วาระก๊กจารีต: ขัดเกลาคัมภีร์มรดกและรักษาวินัยสำนัก',
      icon: '⚖️',
      targetMetric: 'SUTRA_OR_AUDIT',
      rewardFame: 6,
      descTh: 'ก๊กจารีตเรียกร้องให้บูรณะ/ขัดเกลาคัมภีร์ประจำสำนัก และตรวจสอบความโปร่งใสของผู้ถือตำแหน่งบริหาร'
    },
    PRAGMATIC_COMMERCE: {
      cliqueId: 'PRAGMATIC_COMMERCE',
      agendaId: 'CARAVAN_PROSPERITY_QUOTA',
      nameTh: 'วาระก๊กวาณิชย์: ขยายกองคาราวานและสำรองคลังยุทธปัจจัย',
      icon: '🪙',
      targetMetric: 'CARAVAN_OR_QUOTA',
      rewardFame: 6,
      descTh: 'ก๊กวาณิชย์เรียกร้องให้ส่งกองคาราวานทำกำไรและรักษาระดับโควตาคลังสำรองไม่ให้ขาดแคลน'
    },
    BENEVOLENT_SAGE: {
      cliqueId: 'BENEVOLENT_SAGE',
      agendaId: 'SAGE_HARMONY_BANQUET',
      nameTh: 'วาระก๊กเมตตา: ชี้แนะคลายปมมารในใจและจัดงานเลี้ยงปราณโอชา',
      icon: '🪷',
      targetMetric: 'COUNSEL_OR_BANQUET',
      rewardFame: 7,
      descTh: 'ก๊กเมตตาเรียกร้องให้เยียวยาปมมารในใจของศิษย์และจัดงานเลี้ยงฉลองสำนักเพื่อเสริมความสามัคคี'
    }
  });

  ELDER_COUNCIL_EDICTS.MOTION_DEFS = Object.freeze({
    EXPAND_PRODUCTION_QUOTAS: {
      id: 'EXPAND_PRODUCTION_QUOTAS',
      nameTh: 'ญัตติราชโองการเร่งสายพานหลอมโอสถและเสบียงสำรอง',
      icon: '📜',
      favoredCliques: ['PRAGMATIC_COMMERCE', 'BENEVOLENT_SAGE'],
      opposedCliques: ['HAWK_MARTIAL'],
      descTh: 'อนุมัติงบประมาณศิลาวิญญาณให้หอโอสถและโรงครัวผลิตยาฟื้นปราณและอาหารปราณเข้าคลังสำรองอัตโนมัติ'
    },
    MARTIAL_EXPEDITION_MOBILIZATION: {
      id: 'MARTIAL_EXPEDITION_MOBILIZATION',
      nameTh: 'ญัตติระดมพลยอดฝีมือบุกเบิกแดนลับและประลองยุทธภพ',
      icon: '⚔️',
      favoredCliques: ['HAWK_MARTIAL', 'ORTHODOX_TRADITION'],
      opposedCliques: ['BENEVOLENT_SAGE'],
      descTh: 'จัดสรรทรัพยากรยุทธโธปกรณ์ให้ทีมสำรวจแดนลับ 5 โหนดและตัวแทนงานชุมนุมยุทธภพ'
    },
    GRAND_SUTRA_AND_SCROLL_PROJECT: {
      id: 'GRAND_SUTRA_AND_SCROLL_PROJECT',
      nameTh: 'ญัตติบูรณะเศษคัมภีร์โบราณและชำระคัมภีร์ประจำสำนัก',
      icon: '📖',
      favoredCliques: ['ORTHODOX_TRADITION', 'BENEVOLENT_SAGE'],
      opposedCliques: ['PRAGMATIC_COMMERCE'],
      descTh: 'ระดมปราชญ์หอคัมภีร์ถอดรหัสเศษตำราโบราณจากแดนลับและยกระดับคัมภีร์มรดกสำนัก'
    },
    STRICT_ANTI_CORRUPTION_AUDIT: {
      id: 'STRICT_ANTI_CORRUPTION_AUDIT',
      nameTh: 'ญัตติประกาศิตหอวินัยตรวจสอบความโปร่งใส 22 ตำแหน่ง',
      icon: '⚖️',
      favoredCliques: ['ORTHODOX_TRADITION', 'HAWK_MARTIAL'],
      opposedCliques: ['PRAGMATIC_COMMERCE'],
      descTh: 'ให้อำนาจเจ้าหอวินัยและผู้ตรวจการสภาสอบสวนการเบิกจ่ายคลังและการเล่นพรรคเล่นพวกของขุนนางสำนัก'
    }
  });

  ELDER_COUNCIL_EDICTS.ensure = W => {
    if (!W || !W.sect) return null;
    SECT.ensureHierarchyAndPolitics(W);
    const S = W.sect;
    if (!S.edicts || typeof S.edicts !== 'object') {
      S.edicts = {
        seq: 0,
        productionQuotas: {
          'P:HEAL': { id: 'P:HEAL', nameTh: 'โอสถสมานแผล', minStock: 10, batchSize: 4 },
          'P:BASIC_QI': { id: 'P:BASIC_QI', nameTh: 'โอสถรวมปราณ', minStock: 12, batchSize: 4 },
          'meal': { id: 'meal', nameTh: 'อาหารปราณโรงครัว', minStock: 30, batchSize: 12 }
        },
        protectRareMaterials: true,
        monthlyBudgetCapPct: 25,
        monthlySpentStones: 0,
        recruitmentDoctrine: 'BALANCED', // BALANCED | ELITE_ROOTS | ELEMENTAL_SYNERGY | MARTIAL_GRIT
        autoPromotionExam: true,
        activeCliqueAgenda: null,
        councilHistory: [],
        auditHistory: [],
        quotaHistory: []
      };
    }
    const ed = S.edicts;
    if (!ed.productionQuotas) {
      ed.productionQuotas = {
        'P:HEAL': { id: 'P:HEAL', nameTh: 'โอสถสมานแผล', minStock: 10, batchSize: 4 },
        'P:BASIC_QI': { id: 'P:BASIC_QI', nameTh: 'โอสถรวมปราณ', minStock: 12, batchSize: 4 },
        'meal': { id: 'meal', nameTh: 'อาหารปราณโรงครัว', minStock: 30, batchSize: 12 }
      };
    }
    if (!Array.isArray(ed.councilHistory)) ed.councilHistory = [];
    if (!Array.isArray(ed.auditHistory)) ed.auditHistory = [];
    if (!Array.isArray(ed.quotaHistory)) ed.quotaHistory = [];
    if (!ed.activeCliqueAgenda) {
      ELDER_COUNCIL_EDICTS.refreshSeasonalAgenda(W, { quiet: true });
    }
    return ed;
  };

  ELDER_COUNCIL_EDICTS.refreshSeasonalAgenda = (W, opts) => {
    opts = opts || {};
    if (!W || !W.sect) return null;
    const pol = SECT.syncInternalCliques ? SECT.syncInternalCliques(W) : SECT.ensureHierarchyAndPolitics(W);
    const ed = S => W.sect.edicts;
    if (!W.sect.edicts) ELDER_COUNCIL_EDICTS.ensure(W);
    const cliques = (pol && pol.cliques) || {};
    const domId = SECT.CLIQUE_IDS.slice().sort((a, b) => ((cliques[b] && cliques[b].influence) || 25) - ((cliques[a] && cliques[a].influence) || 25))[0] || 'HAWK_MARTIAL';
    const def = ELDER_COUNCIL_EDICTS.CLIQUE_AGENDA_DEFS[domId] || ELDER_COUNCIL_EDICTS.CLIQUE_AGENDA_DEFS.HAWK_MARTIAL;
    const cq = cliques[domId] || {};
    const leader = (cq.leaderId && W.byId && W.byId[cq.leaderId]) || (W.npcs || []).find(n => n && !n.dead && n.cliqueId === domId) || (W.npcs && W.npcs[0]);
    W.sect.edicts.activeCliqueAgenda = {
      cliqueId: domId,
      cliqueNameTh: cq.nameTh || def.nameTh,
      agendaId: def.agendaId,
      nameTh: def.nameTh,
      icon: def.icon,
      descTh: def.descTh,
      leaderId: leader ? leader.id : null,
      leaderNameTh: leader ? HC.fullName(leader) : 'ผู้อาวุโสแกนนำ',
      seasonIssued: W.season || 0,
      dayIssued: W.day || 360,
      progress: 0,
      required: 1,
      fulfilled: false
    };
    return W.sect.edicts.activeCliqueAgenda;
  };

  ELDER_COUNCIL_EDICTS.fulfillCliqueAgenda = (W, triggerReasonTh, actorNpcOrId, opts) => {
    opts = opts || {};
    const ed = ELDER_COUNCIL_EDICTS.ensure(W);
    if (!ed || !ed.activeCliqueAgenda || ed.activeCliqueAgenda.fulfilled) return { ok: false, reason: 'already-fulfilled' };
    const ag = ed.activeCliqueAgenda;
    ag.progress = (ag.progress || 0) + 1;
    ag.fulfilled = true;
    ag.fulfilledDay = W.day || 360;
    ag.fulfilledReasonTh = triggerReasonTh || 'บรรลุเป้าหมายประจำฤดูกาลของก๊ก';

    const pol = SECT.ensureHierarchyAndPolitics(W);
    if (pol) {
      pol.undercurrent = clamp((pol.undercurrent || 0) - 10, 0, 100);
      if (pol.cliques && pol.cliques[ag.cliqueId]) {
        pol.cliques[ag.cliqueId].satisfaction = clamp((pol.cliques[ag.cliqueId].satisfaction || 65) + 16, 0, 100);
      }
      SECT.updateUndercurrentStatus(W);
    }
    if (W.fame) W.fame(6);
    const actor = (typeof actorNpcOrId === 'object' && actorNpcOrId) ? actorNpcOrId : (actorNpcOrId && W.byId && W.byId[actorNpcOrId]) || (ag.leaderId && W.byId[ag.leaderId]);
    if (actor) actor.merit = (actor.merit || 0) + 15;
    return { ok: true, agenda: ag };
  };

  ELDER_COUNCIL_EDICTS.conveneElderCouncil = (W, motionId, proposerNpcOrId, opts) => {
    if (proposerNpcOrId && typeof proposerNpcOrId === 'object' && !proposerNpcOrId.h && !proposerNpcOrId.id) {
      opts = proposerNpcOrId;
      proposerNpcOrId = null;
    }
    opts = opts || {};
    const ed = ELDER_COUNCIL_EDICTS.ensure(W);
    if (!ed) return { ok: false, reason: 'no-edicts' };
    const pol = SECT.syncInternalCliques ? SECT.syncInternalCliques(W) : SECT.ensureHierarchyAndPolitics(W);
    const MOTION_ALIASES = { MARTIAL_MOBILIZATION: 'MARTIAL_EXPEDITION_MOBILIZATION', TRADE_EXPANSION: 'EXPAND_PRODUCTION_QUOTAS', REFORM_WELFARE: 'SUBSIDIZE_DISCIPLE_WELFARE' };
    if (motionId && MOTION_ALIASES[motionId]) motionId = MOTION_ALIASES[motionId];
    if (motionId !== undefined && motionId !== null && motionId !== '' && !ELDER_COUNCIL_EDICTS.MOTION_DEFS[motionId]) {
      return { ok: false, reason: 'invalid-motion', motionId };
    }
    const mDef = ELDER_COUNCIL_EDICTS.MOTION_DEFS[motionId] || ELDER_COUNCIL_EDICTS.MOTION_DEFS.EXPAND_PRODUCTION_QUOTAS;

    const master = (W.sect.masterId && W.byId && W.byId[W.sect.masterId]) || (W.npcs && W.npcs[0]);
    const proposer = (typeof proposerNpcOrId === 'object' && proposerNpcOrId)
      ? proposerNpcOrId
      : (proposerNpcOrId && W.byId && W.byId[proposerNpcOrId])
      || master;

    // Gather voting elders (post holders + rank >= 3 disciples, or top 5 disciples in small sects)
    let voters = (W.npcs || []).filter(n => n && !n.dead && !n.exiled && (n.post || (n.rank || 1) >= 2));
    if (voters.length < 3) {
      voters = (W.npcs || []).filter(n => n && !n.dead && !n.exiled).slice(0, 5);
    }
    voters = voters.slice(0, 9);

    const votes = [];
    let ayeWeight = 0;
    let nayWeight = 0;

    voters.forEach(v => {
      const cId = v.cliqueId || SECT.preferredCliqueForNpc(v);
      const cqDef = SECT.CLIQUE_DEFS[cId] || SECT.CLIQUE_DEFS.BENEVOLENT_SAGE;
      const postSpec = v.post && SECT.POSTS[v.post];
      const authWeight = postSpec && postSpec.authority ? +(1.0 + (postSpec.authority - 45) / 65).toFixed(2) : 1.2;
      const weight = (v.id === W.sect.masterId ? 2.4 : (v.id === W.sect.deputyId || v.peakRole === 'MASTER') ? 1.8 : v.post ? authWeight : 1.0);
      let score = 5; // Base inclination to support sect governance

      if (mDef.favoredCliques.includes(cId)) score += 28;
      if (mDef.opposedCliques.includes(cId)) score -= 22;

      // Personal relationship with proposer/master
      if (proposer && v.id !== proposer.id) {
        const rel = SECT.rel(v, proposer.id);
        score += ((rel.a || 0) + (rel.t || 0) * 0.5 - (rel.g || 0) * 0.8) * 0.35;
      }

      // Personality & Heart-Demon influence
      const integ = HC.eff(v, 'personality.integrity');
      const amb = HC.eff(v, 'personality.ambition');
      if (mDef.id === 'STRICT_ANTI_CORRUPTION_AUDIT') {
        score += (integ - 50) * 0.6 - (HC.eff(v, 'values.wealthResource') - 50) * 0.4;
      }
      if (Array.isArray(v.heartDemons) && v.heartDemons.some(k => k && !k.resolved && k.type === 'AMBITION_ENVY')) {
        score -= 25; // Envious elder obstructs the proposer's motion!
      }
      if (opts.forcePass) score += 60;

      const vote = score >= 0 ? 'AYE' : 'NAY';
      if (vote === 'AYE') ayeWeight += weight;
      else nayWeight += weight;

      const reasonTh = vote === 'AYE'
        ? ('เห็นชอบตามแนวทาง' + cqDef.shortTh + (integ >= 65 ? ' และยึดประโยชน์ส่วนรวมของสำนัก' : ''))
        : ('คัดค้านเนื่องจากขัดกับวาระของ' + cqDef.shortTh + (amb >= 65 ? ' และเกรงการผูกขาดอำนาจ' : ''));

      votes.push({
        npcId: v.id,
        nameTh: HC.fullName(v),
        officeId: v.post || null,
        authorityBonus: postSpec && postSpec.authority ? +(authWeight - 1.0).toFixed(2) : 0,
        postTh: v.post && SECT.POSTS[v.post] ? SECT.POSTS[v.post].nameTh : 'ผู้อาวุโสสภา',
        cliqueId: cId,
        cliqueNameTh: cqDef.nameTh,
        vote,
        weight: +weight.toFixed(1),
        reasonTh
      });
    });

    const passed = ayeWeight >= nayWeight;
    let effectSummaryTh = '';
    if (passed) {
      if (mDef.id === 'EXPAND_PRODUCTION_QUOTAS') {
        const qRes = ELDER_COUNCIL_EDICTS.executeStandingEdicts(W, { force: true, quiet: true });
        effectSummaryTh = 'สภาอนุมัติราชโองการโควตาการผลิต (' + (qRes && qRes.craftedSummaryTh ? qRes.craftedSummaryTh : 'สำรองโอสถและเสบียงครบเกณฑ์') + ')';
      } else if (mDef.id === 'MARTIAL_EXPEDITION_MOBILIZATION') {
        if (pol && pol.cliques && pol.cliques.HAWK_MARTIAL) pol.cliques.HAWK_MARTIAL.satisfaction = clamp((pol.cliques.HAWK_MARTIAL.satisfaction || 65) + 12, 0, 100);
        effectSummaryTh = 'อนุมัติงบยุทธปัจจัยหนุนทีมสำรวจแดนลับและตัวแทนประลองยุทธภพ (+ขวัญกำลังใจก๊กเหยี่ยว +12)';
      } else if (mDef.id === 'GRAND_SUTRA_AND_SCROLL_PROJECT') {
        if (SECT.SECRET_REALM_NODES && SECT.SECRET_REALM_NODES.restoreAncientScroll) {
          const rScroll = SECT.SECRET_REALM_NODES.restoreAncientScroll(W, null, { force: true, quiet: true });
          effectSummaryTh = rScroll && rScroll.ok ? rScroll.summaryTh : 'ระดมปราชญ์หอคัมภีร์เร่งชำระคัมภีร์มรดกสำนัก';
        }
      } else if (mDef.id === 'STRICT_ANTI_CORRUPTION_AUDIT') {
        const aRes = ELDER_COUNCIL_EDICTS.auditOfficerConduct(W, null, null, { quiet: true });
        effectSummaryTh = aRes && aRes.summaryTh ? aRes.summaryTh : 'ตรวจสอบความโปร่งใสของผู้ถือตำแหน่งบริหารทั้งสำนัก';
      }
      if (pol) {
        pol.undercurrent = clamp((pol.undercurrent || 0) - 6, 0, 100);
        SECT.updateUndercurrentStatus(W);
      }
    } else {
      effectSummaryTh = 'ญัตติถูกปัดตกในที่ประชุมสภาผู้อาวุโส เกิดการถกเถียงระหว่างก๊กการเมือง (คลื่นใต้น้ำ +6)';
      if (pol) {
        pol.undercurrent = clamp((pol.undercurrent || 0) + 6, 0, 100);
        SECT.updateUndercurrentStatus(W);
      }
    }

    const ayeNames = votes.filter(v => v.vote === 'AYE').map(v => v.nameTh).slice(0, 4).join(', ') || '-';
    const nayNames = votes.filter(v => v.vote === 'NAY').map(v => v.nameTh).slice(0, 3).join(', ') || 'ไม่มี';

    const rec = {
      id: 'COUNCIL_' + (++ed.seq),
      day: W.day || 360,
      motionId: mDef.id,
      motionNameTh: mDef.nameTh,
      proposerId: proposer ? proposer.id : null,
      proposerNameTh: proposer ? HC.fullName(proposer) : 'เจ้าสำนัก',
      passed,
      ayeWeight: +ayeWeight.toFixed(1),
      nayWeight: +nayWeight.toFixed(1),
      votes,
      effectSummaryTh
    };
    ed.councilHistory.unshift(rec);
    if (ed.councilHistory.length > 25) ed.councilHistory.length = 25;

    const chron = (g.EXPED && g.EXPED.recordChronicle) ? g.EXPED.recordChronicle(W, {
      category: 'ELDER_COUNCIL_EDICT',
      reportFormat: 'IMPERIAL_COUNCIL_DECREE',
      icon: '🏛️',
      involvedSects: [W.sect.name],
      involvedFigures: votes.map(v => v.nameTh).slice(0, 5),
      npcIds: votes.map(v => v.npcId),
      titleTh: 'มติสภาผู้อาวุโส 4 ก๊ก: 「' + mDef.nameTh + '」(' + (passed ? 'ผ่านมติเอกฉันท์ ' : 'ถูกคัดค้าน ') + rec.ayeWeight + ' ต่อ ' + rec.nayWeight + ')',
      storyTh: 'ณ โถงสภาใหญ่แห่ง「' + W.sect.name + '」 「' + rec.proposerNameTh + '」ได้ยื่นเสนอ「' + mDef.nameTh + '」ต่อเหล่าผู้อาวุโสทั้ง 4 ขั้วการเมือง ฝ่ายเห็นชอบนำโดย ' + ayeNames + ' ส่วนฝ่ายท้วงติงได้แก่ ' + nayNames + ' ผลการลงมติปรากฏว่า ' + (passed ? 'ที่ประชุมอนุมัติประกาศใช้เป็นราชโองการสำนักทันที!' : 'เสียงคัดค้านมีน้ำหนักมากกว่า ญัตติจึงถูกชะลอไว้!'),
      originCauseTh: 'ความจำเป็นในการบริหารสำนักและแรงผลักดันเชิงนโยบายจาก 4 ขั้วการเมือง (' + (ed.activeCliqueAgenda ? ed.activeCliqueAgenda.nameTh : 'ดุลอำนาจสภา') + ')',
      actorChainTh: 'ผู้เสนอญัตติ: ' + rec.proposerNameTh + ' ➔ ฝ่ายหนุน: ' + ayeNames + ' ➔ ฝ่ายค้าน: ' + nayNames,
      systemImpactTh: 'เชื่อมโยง ELDER_COUNCIL_EDICTS ➔ ' + effectSummaryTh,
      consequenceTh: effectSummaryTh,
      quiet: opts.quiet
    }) : null;

    return { ok: true, passed, record: rec, votes, effectSummaryTh, chronicle: chron };
  };

  ELDER_COUNCIL_EDICTS.executeStandingEdicts = (W, opts) => {
    opts = opts || {};
    const ed = ELDER_COUNCIL_EDICTS.ensure(W);
    if (!ed) return { ok: false, reason: 'no-edicts' };

    const steward = SECT.holder(W, 'steward') || SECT.holder(W, 'treasury') || (W.sect.masterId && W.byId[W.sect.masterId]) || (W.npcs && W.npcs[0]);
    const alchemist = SECT.holder(W, 'alchemy') || steward;
    const chef = SECT.holder(W, 'spirit_chef') || SECT.holder(W, 'provision') || steward;
    const drillmaster = SECT.holder(W, 'martial') || SECT.holder(W, 'discipline') || steward;

    const craftedItems = [];
    const maxBudget = Math.max(40, Math.round((W.sect.stones || 300) * ((ed.monthlyBudgetCapPct || 25) / 100)));
    let spent = 0;

    // 1. Check and fulfill reserve quotas
    const healStock = ECO && ECO.count ? ECO.count(W, 'P:HEAL') : 0;
    const qiStock = ECO && ECO.count ? ECO.count(W, 'P:BASIC_QI') : 0;
    const mealStock = ECO && ECO.count ? ECO.count(W, 'meal') : 0;

    // Steward/Alchemist integrity bonus: high integrity saves stone cost
    const alchInteg = alchemist ? HC.eff(alchemist, 'personality.integrity') : 55;
    const costMult = alchInteg >= 68 ? 0.82 : 1.0;

    if ((healStock < 10 || opts.force) && ECO && ECO.add) {
      const batch = 4;
      const cost = Math.round(28 * costMult);
      const canPayHeal = opts.free || ((W.sect.stones || 0) >= cost && spent + cost <= maxBudget && (!ECO.pay || ECO.pay(W, cost, 'ราชโองการผลิตโอสถสมานแผลเข้าคลังสำรอง')));
      if (canPayHeal) {
        if (!opts.free) spent += cost;
        ECO.add(W, 'P:HEAL', batch, 1.08);
        craftedItems.push('โอสถสมานแผล +' + batch);
        if (alchemist) alchemist.merit = (alchemist.merit || 0) + 6;
      }
    }

    if ((qiStock < 12 || opts.force) && ECO && ECO.add) {
      const batch = 4;
      const cost = Math.round(24 * costMult);
      const canPayQi = opts.free || ((W.sect.stones || 0) >= cost && spent + cost <= maxBudget && (!ECO.pay || ECO.pay(W, cost, 'ราชโองการผลิตโอสถรวมปราณเข้าคลังสำรอง')));
      if (canPayQi) {
        if (!opts.free) spent += cost;
        ECO.add(W, 'P:BASIC_QI', batch, 1.08);
        craftedItems.push('โอสถรวมปราณ +' + batch);
      }
    }

    if ((mealStock < 30 || opts.force) && ECO && ECO.add) {
      const batch = 12;
      const mealCost = Math.round(16 * costMult);
      const usedGrain = !opts.free && ECO.count && ECO.count(W, 'grain') >= 4 && ECO.take(W, 'grain', 4);
      const paidMealStones = !usedGrain && !opts.free && (W.sect.stones || 0) >= mealCost && spent + mealCost <= maxBudget && (!ECO.pay || ECO.pay(W, mealCost, 'ราชโองการจัดหาเสบียงอาหารปราณเข้าคลังสำรอง'));
      if (opts.free || usedGrain || paidMealStones) {
        if (paidMealStones) spent += mealCost;
        ECO.add(W, 'meal', batch);
        craftedItems.push('อาหารปราณ +' + batch);
        if (chef) chef.merit = (chef.merit || 0) + 5;
      }
    }

    // 2. Automated Outer-to-Inner Disciple Promotion Exam by Drillmaster / Discipline Elder
    const promotedDisciples = [];
    if (ed.autoPromotionExam !== false) {
      const outerCandidates = (W.npcs || []).filter(n => n && !n.dead && !n.exiled && (n.rank || 1) === 1 && n.cult && (n.cult.stage >= 2 || (n.merit || 0) >= 35));
      outerCandidates.slice(0, 2).forEach(cand => {
        cand.rank = 2; // Promote to Inner Disciple!
        cand.sat = clamp((cand.sat || 65) + 12, 0, 100);
        promotedDisciples.push(HC.fullName(cand));
        if (cand.h && cand.h.life && Array.isArray(cand.h.life.bio)) {
          cand.h.life.bio.push({
            age: HC.ageYears ? Math.round(HC.ageYears(cand)) : 18,
            t: 'สอบผ่านการประเมินราชโองการสำนัก เลื่อนขั้นขึ้นเป็นศิษย์สายในโดย ' + (drillmaster ? HC.fullName(drillmaster) : 'หอวินัย')
          });
        }
      });
    }

    ed.monthlySpentStones = spent;
    const craftedSummaryTh = (craftedItems.length ? ('เติมคลังสำรอง: ' + craftedItems.join(', ')) : 'คลังสำรองสมบูรณ์') +
      (promotedDisciples.length ? (' · เลื่อนชั้นศิษย์สายใน: ' + promotedDisciples.join(', ')) : '') +
      (ed.protectRareMaterials ? ' · ล็อกวัตถุดิบหายากปลอดภัย' : '');

    const qRec = {
      day: W.day || 360,
      stewardNameTh: steward ? HC.fullName(steward) : 'พ่อบ้านใหญ่',
      craftedItems,
      promotedDisciples,
      spentStones: spent,
      summaryTh: craftedSummaryTh
    };
    ed.quotaHistory.unshift(qRec);
    if (ed.quotaHistory.length > 20) ed.quotaHistory.length = 20;

    if (ed.activeCliqueAgenda && ed.activeCliqueAgenda.cliqueId === 'PRAGMATIC_COMMERCE' && !ed.activeCliqueAgenda.fulfilled) {
      ELDER_COUNCIL_EDICTS.fulfillCliqueAgenda(W, 'บริหารโควตาคลังสำรองตามราชโองการสำเร็จ', steward, { quiet: true });
    }

    return { ok: true, craftedItems, promotedDisciples, spentStones: spent, craftedSummaryTh, steward };
  };

  ELDER_COUNCIL_EDICTS.auditOfficerConduct = (W, targetPost, auditorNpcOrId, opts) => {
    opts = opts || {};
    const ed = ELDER_COUNCIL_EDICTS.ensure(W);
    if (!ed) return { ok: false, reason: 'no-edicts' };

    const auditor = (typeof auditorNpcOrId === 'object' && auditorNpcOrId)
      ? auditorNpcOrId
      : (auditorNpcOrId && W.byId && W.byId[auditorNpcOrId])
      || SECT.holder(W, 'discipline')
      || SECT.holder(W, 'censor')
      || (W.sect.masterId && W.byId[W.sect.masterId])
      || (W.npcs && W.npcs[0]);

    const postCandidates = targetPost ? [targetPost] : ['treasury', 'quartermaster', 'alchemy', 'forge', 'steward', 'envoy'];
    let officer = null;
    let chosenPost = targetPost || 'treasury';
    for (const p of postCandidates) {
      const h = SECT.holder(W, p);
      if (h && !h.dead && (!auditor || h.id !== auditor.id)) {
        officer = h;
        chosenPost = p;
        break;
      }
    }
    if (!officer) {
      officer = (W.npcs || []).find(n => n && !n.dead && (!auditor || n.id !== auditor.id)) || auditor;
    }
    if (!officer) return { ok: false, reason: 'no-officer' };

    const integ = HC.eff(officer, 'personality.integrity');
    const greed = HC.eff(officer, 'values.wealthResource');
    const amb = HC.eff(officer, 'personality.ambition');
    const cId = officer.cliqueId || SECT.preferredCliqueForNpc(officer);
    const cqDef = SECT.CLIQUE_DEFS[cId] || SECT.CLIQUE_DEFS.PRAGMATIC_COMMERCE;
    const postNameTh = (SECT.POSTS[chosenPost] && SECT.POSTS[chosenPost].nameTh) || 'ขุนนางสำนัก';

    const isNepotism = opts.forceNepotism || (!opts.forceExemplary && (integ < 44 || (greed >= 68 && integ < 56)));
    let conductType = 'EXEMPLARY_STEWARDSHIP';
    let summaryTh = '';
    let consequenceTh = '';

    if (isNepotism) {
      conductType = 'CLIQUE_NEPOTISM_DETECTED';
      // Find a clique member, apprentice, or child who received favored resources
      const beneficiary = (W.npcs || []).find(n => n && !n.dead && n.id !== officer.id && (n.cliqueId === cId || n.mentorId === officer.id || (Array.isArray(n.parentIds) && n.parentIds.includes(officer.id)))) || officer;
      const recoveredStones = 45;
      if (ECO && ECO.earn) ECO.earn(W, recoveredStones, 'ยึดทรัพย์คืนจากการตรวจสอบตำแหน่ง ' + postNameTh);
      officer.merit = Math.max(0, (officer.merit || 20) - 12);
      const pol = SECT.ensureHierarchyAndPolitics(W);
      if (pol) {
        pol.undercurrent = clamp((pol.undercurrent || 0) - 8, 0, 100);
        SECT.updateUndercurrentStatus(W);
      }
      summaryTh = '⚖️ ' + (auditor ? HC.fullName(auditor) : 'หอวินัย') + ' ตรวจสอบพบว่า「' + HC.fullName(officer) + '」(' + postNameTh + ') อาศัยตำแหน่งแอบจัดสรรโอสถและศิลาวิญญาณให้พวกพ้องใน' + cqDef.nameTh + ' (' + HC.fullName(beneficiary) + ') จึงสั่งริบศิลาคืนเข้าคลัง +' + recoveredStones + ' ก้อน และคาดโทษตักเตือน!';
      consequenceTh = 'ริบศิลาคืนคลัง +' + recoveredStones + ' · ลดคลื่นใต้น้ำ -8 · บังคับใช้กฎสำนักอย่างเที่ยงธรรม';
    } else {
      conductType = 'EXEMPLARY_STEWARDSHIP';
      const bonusStones = 35;
      if (ECO && ECO.earn) ECO.earn(W, bonusStones, 'รางวัลบริหารงานโปร่งใสประหยัดงบโดย ' + HC.fullName(officer));
      officer.merit = (officer.merit || 0) + 15;
      officer.sat = clamp((officer.sat || 70) + 10, 0, 100);
      summaryTh = '🏛️ ' + (auditor ? HC.fullName(auditor) : 'ผู้ตรวจการสภา') + ' ตรวจบัญชีของ「' + HC.fullName(officer) + '」(' + postNameTh + ' · ความซื่อตรง ' + Math.round(integ) + ') พบว่าบริหารงานด้วยความสุจริตเที่ยงธรรม ประหยัดงบประมาณสำนักได้ +' + bonusStones + ' ศิลา จึงประกาศยกย่องหน้าโถงสภา!';
      consequenceTh = 'คลังสำนักประหยัดงบ +' + bonusStones + ' ศิลา · ' + HC.fullName(officer) + ' ได้รับผลงาน +15 Merit';
    }

    const auditRec = {
      day: W.day || 360,
      auditorId: auditor ? auditor.id : null,
      auditorNameTh: auditor ? HC.fullName(auditor) : 'เจ้าหอวินัย',
      officerId: officer.id,
      officerNameTh: HC.fullName(officer),
      post: chosenPost,
      postNameTh,
      cliqueNameTh: cqDef.nameTh,
      conductType,
      summaryTh,
      consequenceTh
    };
    ed.auditHistory.unshift(auditRec);
    if (ed.auditHistory.length > 20) ed.auditHistory.length = 20;

    if (ed.activeCliqueAgenda && ed.activeCliqueAgenda.cliqueId === 'ORTHODOX_TRADITION' && !ed.activeCliqueAgenda.fulfilled) {
      ELDER_COUNCIL_EDICTS.fulfillCliqueAgenda(W, 'ตรวจสอบความโปร่งใสผู้ถือตำแหน่งตามจารีตสำนัก', auditor, { quiet: true });
    }

    const chron = (g.EXPED && g.EXPED.recordChronicle) ? g.EXPED.recordChronicle(W, {
      category: 'ELDER_COUNCIL_EDICT',
      reportFormat: 'IMPERIAL_COUNCIL_DECREE',
      icon: isNepotism ? '⚖️' : '🏛️',
      involvedSects: [W.sect.name],
      involvedFigures: [auditor ? HC.fullName(auditor) : 'เจ้าหอวินัย', HC.fullName(officer)],
      npcIds: [auditor && auditor.id, officer.id].filter(Boolean),
      titleTh: (isNepotism ? 'ประกาศิตตรวจสอบขุนนางสำนัก: ยับยั้งการเอื้อประโยชน์พวกพ้องของ「' : 'ประกาศเกียรติคุณขุนนางสุจริต: ยกย่องความโปร่งใสของ「') + HC.fullName(officer) + '」(' + postNameTh + ')',
      storyTh: summaryTh,
      originCauseTh: 'อุปนิสัยจริงของผู้ถือตำแหน่ง ' + postNameTh + ' (ความซื่อตรง ' + Math.round(integ) + ' · ความติดยึดทรัพย์สิน ' + Math.round(greed) + ' · สังกัด' + cqDef.nameTh + ')',
      actorChainTh: 'ผู้ตรวจสอบ: ' + (auditor ? HC.fullName(auditor) : 'หอวินัย') + ' ➔ ผู้รับการตรวจ: ' + HC.fullName(officer) + ' (' + postNameTh + ')',
      systemImpactTh: 'เชื่อมโยง 22 ตำแหน่งบริหาร (W.sect.posts) ➔ นิสัย HC ➔ ก๊กการเมือง 4 ขั้ว ➔ คลังสำนักและคลื่นใต้น้ำ',
      consequenceTh,
      quiet: opts.quiet
    }) : null;

    return { ok: true, conductType, auditRecord: auditRec, officer, auditor, summaryTh, chronicle: chron };
  };

  ELDER_COUNCIL_EDICTS.tick = (W, opts) => {
    opts = opts || {};
    const ed = ELDER_COUNCIL_EDICTS.ensure(W);
    if (!ed) return { ok: false };
    if (!ed.activeCliqueAgenda || ed.activeCliqueAgenda.seasonIssued !== (W.season || 0)) {
      ELDER_COUNCIL_EDICTS.refreshSeasonalAgenda(W, { quiet: opts.quiet });
    }
    const quotaRes = ELDER_COUNCIL_EDICTS.executeStandingEdicts(W, { quiet: opts.quiet });
    let councilRes = null;
    if (((W.day || 360) % 60 === 0) || opts.forceCouncil) {
      const mKeys = Object.keys(ELDER_COUNCIL_EDICTS.MOTION_DEFS);
      const mId = mKeys[Math.floor((W.day || 360) / 30) % mKeys.length];
      councilRes = ELDER_COUNCIL_EDICTS.conveneElderCouncil(W, mId, null, { quiet: opts.quiet });
    }
    return { ok: true, edicts: ed, quotaRes, councilRes };
  };

  SECT.ELDER_COUNCIL_EDICTS = ELDER_COUNCIL_EDICTS;

  /* =========================================================================
   * STRATEGIC PROPOSAL FLAGSHIP 6 (F06 + F01 Scroll Restoration):
   * Interactive 5-Stage Secret Realm Node Expeditions, 12-Path Skill Checks,
   * Life-Savior Karmic Bonds & Ancient Scroll Restoration (SECT.SECRET_REALM_NODES)
   * ========================================================================= */
  const SECRET_REALM_NODES = {};

  SECRET_REALM_NODES.DOCTRINES = Object.freeze({
    CAUTIOUS: { id: 'CAUTIOUS', nameTh: 'รัดกุมรักษาชีวิต (Cautious)', icon: '🛡️', riskMod: -0.15, lootMult: 0.90 },
    BALANCED: { id: 'BALANCED', nameTh: 'สมดุลตามทักษะทีม (Balanced)', icon: '☯️', riskMod: 0.0, lootMult: 1.15 },
    GREEDY: { id: 'GREEDY', nameTh: 'บุกทะลวงชิงมรดกลึก (Greedy Push)', icon: '🔥', riskMod: 0.20, lootMult: 1.45 }
  });

  SECRET_REALM_NODES.STAGE_BLUEPRINTS = Object.freeze([
    {
      stageIndex: 1,
      id: 'NODE_1_ENTRANCE_SEAL',
      nameTh: 'ด่านที่ 1: ประตูค่ายกลโบราณและหมอกปราณหลงวิญญาณ',
      icon: '⛩️',
      favoredPaths: ['ARRAY_TALISMAN', 'XIAN', 'HEART_SOUL'],
      favoredSkills: ['ARRAY', 'SCRIPTURE'],
      branchA: { id: 'UNSEAL_ARRAY', nameTh: 'ถอดรหัสอักขระค่ายกลโบราณ', pathCheck: 'ARRAY_TALISMAN', descTh: 'ใช้ความเข้าใจค่ายกลเปิดทางลับโดยไม่ปลุกอสูรเฝ้าประตู' },
      branchB: { id: 'FORCE_BREACH', nameTh: 'รวมปราณทลายผนึกศิลา', pathCheck: 'BODY', descTh: 'ใช้พละกำลังและกระบวนท่าบุกทะลวงผ่านหมอกปราณโดยตรง' }
    },
    {
      stageIndex: 2,
      id: 'NODE_2_MIASMA_HERB_VALLEY',
      nameTh: 'ด่านที่ 2: หุบเขาสมุนไพรพิษพันปีและบึงอสูรบรรพกาล',
      icon: '🌿',
      favoredPaths: ['CRAFT_CREATION', 'SAGE_SUPPORT', 'BEAST_SOVEREIGN'],
      favoredSkills: ['ALCHEMY', 'HERBAL', 'BEAST'],
      branchA: { id: 'REFINE_MIASMA', nameTh: 'สกัดพิษปรุงโอสถเปิดทางและเก็บสมุนไพรทิพย์', pathCheck: 'CRAFT_CREATION', descTh: 'ให้ผู้เชี่ยวชาญโอสถและสมุนไพรเก็บเกี่ยววัตถุดิบหายากอย่างปลอดภัย' },
      branchB: { id: 'TAME_GUARDIAN_BEAST', nameTh: 'แผ่จิตราชันอสูรสยบสัตว์วิญญาณเฝ้าบึง', pathCheck: 'BEAST_SOVEREIGN', descTh: 'สื่อสารกับอสูรโบราณให้เปิดทางสู่โถงชั้นใน' }
    },
    {
      stageIndex: 3,
      id: 'NODE_3_AUTOMATON_STELE_HALL',
      nameTh: 'ด่านที่ 3: โถงหุ่นเชิดกลไกสวรรค์และศิลาจารึกบ่วงกรรม',
      icon: '⚙️',
      favoredPaths: ['MECH_PUPPET', 'HEART_SOUL', 'KARMA_SAMSARA'],
      favoredSkills: ['FORGE', 'SCRIPTURE'],
      branchA: { id: 'REWIRE_AUTOMATON', nameTh: 'ดัดแปลงแกนกลไกหุ่นเชิดโบราณมาเป็นองครักษ์', pathCheck: 'MECH_PUPPET', descTh: 'ปลดสลักกลไกและเก็บแกนหุ่นเชิดพร้อมเศษคัมภีร์โบราณ' },
      branchB: { id: 'COMMUNE_SOUL_STELE', nameTh: 'เพ่งจิตอ่านศิลาจารึกวิญญาณคลายบ่วงกรรมปรมาจารย์', pathCheck: 'HEART_SOUL', descTh: 'รับการถ่ายทอดความเข้าใจมรรคาและเศษคัมภีร์สาบสูญจากจิตตกค้าง' }
    },
    {
      stageIndex: 4,
      id: 'NODE_4_RIVAL_EXPEDITION_CROSSROAD',
      nameTh: 'ด่านที่ 4: ทางแยกศึกชิงมรดกกับคณะสำรวจสำนักคู่แข่ง',
      icon: '⚔️',
      favoredPaths: ['STRATEGY_GOVERNANCE', 'XIAN', 'DEMON', 'GOD'],
      favoredSkills: ['MARTIAL', 'DIPLOMACY'],
      branchA: { id: 'TACTICAL_OUTMANEUver', nameTh: 'วางกลยุทธ์ชิงตัดหน้าเข้าสู่โถงใจกลางแดนลับ', pathCheck: 'STRATEGY_GOVERNANCE', descTh: 'ใช้พิชัยสงครามหลอกล่อทีมสำนักคู่แข่งและช่วยศิษย์ร่วมทีมจากกับดักสังหาร' },
      branchB: { id: 'DIRECT_CLASH_RIVAL', nameTh: 'เปิดศึกปะทะชิงถุงสมบัติจากสำนักคู่แข่ง', pathCheck: 'DEMON', descTh: 'ประลองยุทธ์ชิงเศษคัมภีร์และศิลาวิญญาณจากยอดฝีมือต่างสำนัก' }
    },
    {
      stageIndex: 5,
      id: 'NODE_5_SOVEREIGN_CORE_ALTAR',
      nameTh: 'ด่านที่ 5: แท่นบูชาแก่นธาตุราชันแดนลับ (ดารา/โลหิตบรรพกาล)',
      icon: '🌌',
      favoredPaths: ['XIAN', 'BODY', 'GOD', 'DEMON', 'ARRAY_TALISMAN', 'KARMA_SAMSARA'],
      favoredSkills: ['MARTIAL', 'ARRAY'],
      branchA: { id: 'CONQUER_SOVEREIGN_CORE', nameTh: 'ผสานปราณทั้งทีมพิชิตบอสผู้พิทักษ์และเก็บม้วนคัมภีร์โบราณ', pathCheck: 'XIAN', descTh: 'ศึกชี้ขาดเพื่อคว้าแก่นธาตุระดับตำนานและม้วนคัมภีร์โบราณฉบับสมบูรณ์' },
      branchB: { id: 'SAFE_EXTRACTION', nameTh: 'ผนึกแท่นบูชาและถอนตัวกลับสำนักพร้อมสมบัติทั้งหมด', pathCheck: 'SAGE_SUPPORT', descTh: 'รักษาชีวิตสมาชิกทุกคนและนำสมบัติที่เก็บสะสมมา 4 ด่านกลับสำนักอย่างปลอดภัย' }
    }
  ]);

  SECRET_REALM_NODES.ensure = W => {
    if (!W || !W.explore || !W.sect) return null;
    if (!W.explore.nodeExpeditions || typeof W.explore.nodeExpeditions !== 'object') {
      W.explore.nodeExpeditions = {
        seq: 0,
        defaultDoctrine: 'BALANCED',
        ancientScrollFragments: 2,
        restoredScrollsCount: 0,
        activeRun: null,
        history: [],
        restoredHistory: []
      };
    }
    const ne = W.explore.nodeExpeditions;
    if (!Number.isFinite(ne.ancientScrollFragments)) ne.ancientScrollFragments = 2;
    if (!Array.isArray(ne.history)) ne.history = [];
    if (!Array.isArray(ne.restoredHistory)) ne.restoredHistory = [];
    return ne;
  };

  SECRET_REALM_NODES.runFullNodeExpedition = (W, realmId, partyNpcIds, doctrine, opts) => {
    opts = opts || {};
    const ne = SECRET_REALM_NODES.ensure(W);
    if (!ne) return { ok: false, reason: 'no-explore-state' };

    const alive = (W.npcs || []).filter(n => n && !n.dead && !n.exiled);
    if (!alive.length) return { ok: false, reason: 'no-disciples' };

    let party = Array.isArray(partyNpcIds) && partyNpcIds.length
      ? partyNpcIds.map(id => (typeof id === 'object' ? id : W.byId[id])).filter(Boolean)
      : alive.slice().sort((a, b) => CULT.power(b) - CULT.power(a)).slice(0, Math.min(4, alive.length));
    if (!party.length) party = alive.slice(0, Math.min(3, alive.length));

    const leader = party[0];
    // Leader chooses doctrine organically from personality if not explicitly passed
    let docKey = doctrine && SECRET_REALM_NODES.DOCTRINES[doctrine] ? doctrine : null;
    if (!docKey) {
      const lCaut = HC.eff(leader, 'personality.caution');
      const lAggr = HC.eff(leader, 'personality.aggression');
      docKey = lCaut >= 66 ? 'CAUTIOUS' : lAggr >= 66 ? 'GREEDY' : (ne.defaultDoctrine || 'BALANCED');
    }
    const docDef = SECRET_REALM_NODES.DOCTRINES[docKey] || SECRET_REALM_NODES.DOCTRINES.BALANCED;

    const partyPaths = Array.from(new Set(party.map(m => (m.cult && m.cult.path) || 'XIAN')));
    const nodeLogs = [];
    let stonesGained = 0;
    let scrollFragmentsGained = 0;
    let lifeSaviorEvent = null;
    const matchedSpecialists = [];

    SECRET_REALM_NODES.STAGE_BLUEPRINTS.forEach(bp => {
      // Find best specialist in party for this stage
      const specNpc = party.find(m => m.cult && bp.favoredPaths.includes(m.cult.path)) || leader;
      const hasSpecialist = !!(specNpc && specNpc.cult && bp.favoredPaths.includes(specNpc.cult.path));
      const chosenBranch = (bp.stageIndex === 5 && docKey === 'CAUTIOUS') ? bp.branchB : bp.branchA;

      const stageStones = Math.round((35 + bp.stageIndex * 18) * docDef.lootMult * (hasSpecialist ? 1.25 : 1.0));
      stonesGained += stageStones;
      if (hasSpecialist || bp.stageIndex >= 3) {
        scrollFragmentsGained += 1;
      }
      if (hasSpecialist) {
        matchedSpecialists.push({
          stageIndex: bp.stageIndex,
          npcId: specNpc.id,
          npcNameTh: HC.fullName(specNpc),
          path: specNpc.cult.path,
          branchNameTh: chosenBranch.nameTh
        });
      }

      // Stage 4: Check for Life-Savior Karmic Bond (F03 + F06 integration) when party has >= 2 members
      if (bp.stageIndex === 4 && party.length >= 2 && !lifeSaviorEvent) {
        const savior = party.slice().sort((a, b) => (HC.eff(b, 'personality.empathy') + HC.eff(b, 'personality.courage')) - (HC.eff(a, 'personality.empathy') + HC.eff(a, 'personality.courage')))[0];
        const saved = party.find(m => m.id !== savior.id) || party[1];
        if (savior && saved && savior.id !== saved.id) {
          const rSavedToSavior = SECT.rel(saved, savior.id);
          const rSaviorToSaved = SECT.rel(savior, saved.id);
          rSavedToSavior.a = clamp((rSavedToSavior.a || 20) + 28, -100, 100);
          rSavedToSavior.t = clamp((rSavedToSavior.t || 20) + 32, 0, 100);
          rSavedToSavior.g = clamp((rSavedToSavior.g || 10) + 40, 0, 100);
          rSavedToSavior.bond = 'LIFE_SAVIOR';
          rSaviorToSaved.a = clamp((rSaviorToSaved.a || 20) + 22, -100, 100);
          rSaviorToSaved.bond = 'SWORN_COMRADE';
          if (saved.h && saved.h.life && Array.isArray(saved.h.life.bio)) {
            saved.h.life.bio.push({
              age: HC.ageYears ? Math.round(HC.ageYears(saved)) : 20,
              t: 'ได้รับการช่วยชีวิตจากกับดักสังหารในแดนลับโบราณโดย「' + HC.fullName(savior) + '」ผูกพันธะผู้มีพระคุณช่วยชีวิต'
            });
          }
          lifeSaviorEvent = {
            saviorId: savior.id,
            saviorNameTh: HC.fullName(savior),
            savedId: saved.id,
            savedNameTh: HC.fullName(saved),
            summaryTh: '「' + HC.fullName(savior) + '」พุ่งเข้ารับคมกระบี่ค่ายกลแทน「' + HC.fullName(saved) + '」จนก่อเกิดสายใย「ผู้มีพระคุณช่วยชีวิต (LIFE_SAVIOR)」!'
          };
        }
      }

      nodeLogs.push({
        stageIndex: bp.stageIndex,
        nodeId: bp.id,
        nodeNameTh: bp.nameTh,
        chosenBranchTh: chosenBranch.nameTh,
        specialistNameTh: HC.fullName(specNpc),
        specialistPath: (specNpc.cult && specNpc.cult.path) || 'XIAN',
        hasSpecialistSynergy: hasSpecialist,
        stonesGained: stageStones
      });
    });

    // Apply rewards to sect & party
    if (ECO && ECO.earn) ECO.earn(W, stonesGained, 'สมบัติจากโหนดแดนลับโบราณ 5 ด่าน');
    if (ECO && ECO.add) {
      ECO.add(W, 'herb', 6);
      ECO.add(W, 'ore', 5);
    }
    ne.ancientScrollFragments = (ne.ancientScrollFragments || 0) + scrollFragmentsGained;

    party.forEach(m => {
      m.merit = (m.merit || 0) + 18;
      m.cp = (m.cp || 0) + 22;
      if (m.cult) CULT.gain(m, 45, W, 'secret_realm_node_expedition');
      if (SECT.SOUL_FORGE && SECT.SOUL_FORGE.recordWeaponFeat) {
        SECT.SOUL_FORGE.recordWeaponFeat(W, m, 'พิชิตโหนดแดนลับโบราณ 5 ด่านร่วมกับ ' + HC.fullName(leader), 25);
      }
    });
    // Deep Relationship Matrix Hook: comrades who survive a 5-node expedition together gain SHARED_EXPEDITION_JOURNEY & LIFE_AND_DEATH_TRIBULATION (even across different Peaks!)
    for (let i = 0; i < party.length; i++) {
      for (let j = i + 1; j < party.length; j++) {
        if (SECT.SOCIAL_MATRIX) {
          SECT.SOCIAL_MATRIX.applyActionModifier(W, party[i], party[j], docKey === 'GREEDY' ? 'LIFE_AND_DEATH_TRIBULATION' : 'SHARED_EXPEDITION_JOURNEY');
        }
      }
    }

    // Fulfill HAWK_MARTIAL clique agenda if active
    if (SECT.ELDER_COUNCIL_EDICTS) {
      const ed = SECT.ELDER_COUNCIL_EDICTS.ensure(W);
      if (ed && ed.activeCliqueAgenda && ed.activeCliqueAgenda.cliqueId === 'HAWK_MARTIAL' && !ed.activeCliqueAgenda.fulfilled) {
        SECT.ELDER_COUNCIL_EDICTS.fulfillCliqueAgenda(W, 'ส่งทีมพิชิตแดนลับโบราณ 5 โหนดสำเร็จ', leader, { quiet: true });
      }
    }

    const runRec = {
      id: 'NODERUN_' + (++ne.seq),
      day: W.day || 360,
      realmId: realmId || 'ANCIENT_FIVE_ELEMENT_RUINS',
      realmNameTh: 'แดนลับซากโบราณสถานห้าธาตุดารา',
      doctrine: docKey,
      doctrineNameTh: docDef.nameTh,
      leaderId: leader.id,
      leaderNameTh: HC.fullName(leader),
      partyIds: party.map(m => m.id),
      partyNamesTh: party.map(m => HC.fullName(m)),
      partyPaths,
      nodeLogs,
      matchedSpecialists,
      stonesGained,
      scrollFragmentsGained,
      lifeSaviorEvent,
      summaryTh: HC.fullName(leader) + ' นำทีม (' + party.map(m => HC.fullName(m)).join(', ') + ') บุกแดนลับ 5 โหนดด้วยหลักการ「' + docDef.nameTh + '」คว้าศิลา +' + stonesGained + ' ก้อน และเศษคัมภีร์โบราณ +' + scrollFragmentsGained + ' ชิ้น!' + (lifeSaviorEvent ? (' ' + lifeSaviorEvent.summaryTh) : '')
    };
    ne.activeRun = runRec;
    ne.history.unshift(runRec);
    if (ne.history.length > 20) ne.history.length = 20;

    const chron = (g.EXPED && g.EXPED.recordChronicle) ? g.EXPED.recordChronicle(W, {
      category: 'SECRET_REALM_NODE',
      reportFormat: 'SECRET_REALM_LOGBOOK',
      icon: '🧭',
      involvedSects: [W.sect.name],
      involvedFigures: party.map(m => HC.fullName(m)),
      npcIds: party.map(m => m.id),
      titleTh: 'บันทึกสำรวจแดนลับ 5 โหนด: 「' + HC.fullName(leader) + '」นำทัพฝ่าด่าน 12 มรรคา คว้าเศษคัมภีร์โบราณ +' + scrollFragmentsGained + ' ชิ้น!',
      storyTh: runRec.summaryTh,
      originCauseTh: 'หัวหน้าทีม ' + HC.fullName(leader) + ' วางกลยุทธ์เดินหมาก「' + docDef.nameTh + '」และใช้ทักษะเฉพาะทางของสมาชิก (' + partyPaths.join(', ') + ') แก้ปริศนาแต่ละโหนด',
      actorChainTh: 'หัวหน้าทีม: ' + HC.fullName(leader) + ' · ผู้เชี่ยวชาญแก้ด่าน: ' + (matchedSpecialists.map(s => s.npcNameTh + '(' + s.path + ')').join(', ') || HC.fullName(leader)) + (lifeSaviorEvent ? (' · ผู้ช่วยชีวิต: ' + lifeSaviorEvent.saviorNameTh + ' ➔ ' + lifeSaviorEvent.savedNameTh) : ''),
      systemImpactTh: 'เชื่อมโยง SECRET_REALM_NODES ➔ สายใยผู้ช่วยชีวิต (LIFE_SAVIOR) ➔ เศษคัมภีร์โบราณ (+' + scrollFragmentsGained + ') ➔ จิตศาสตรา (SOUL_FORGE) ➔ คลังศิลา (+' + stonesGained + ')',
      consequenceTh: 'ศิลา +' + stonesGained + ' · เศษคัมภีร์โบราณสะสม ' + ne.ancientScrollFragments + ' ชิ้น' + (lifeSaviorEvent ? (' · ผูกพันธะผู้ช่วยชีวิต ' + lifeSaviorEvent.saviorNameTh + ' & ' + lifeSaviorEvent.savedNameTh) : ''),
      quiet: opts.quiet
    }) : null;

    return { ok: true, run: runRec, stonesGained, scrollFragmentsGained, lifeSaviorEvent, chronicle: chron };
  };

  SECRET_REALM_NODES.restoreAncientScroll = (W, archivistNpcOrId, opts) => {
    opts = opts || {};
    const ne = SECRET_REALM_NODES.ensure(W);
    if (!ne) return { ok: false, reason: 'no-explore-state' };
    if ((ne.ancientScrollFragments || 0) < 2 && !opts.force) {
      return { ok: false, reason: 'insufficient-fragments', current: ne.ancientScrollFragments || 0, required: 2 };
    }

    const archivist = (typeof archivistNpcOrId === 'object' && archivistNpcOrId)
      ? archivistNpcOrId
      : (archivistNpcOrId && W.byId && W.byId[archivistNpcOrId])
      || SECT.holder(W, 'scripture')
      || (W.npcs || []).filter(n => n && !n.dead && !n.exiled).sort((a, b) => ((b.h.skills.SCRIPTURE || 0) + HC.eff(b, 'intellect.comprehension')) - ((a.h.skills.SCRIPTURE || 0) + HC.eff(a, 'intellect.comprehension')))[0];
    if (!archivist) return { ok: false, reason: 'no-archivist' };

    ne.ancientScrollFragments = Math.max(0, (ne.ancientScrollFragments || 2) - 2);
    ne.restoredScrollsCount = (ne.restoredScrollsCount || 0) + 1;

    // Connect directly to Heritage Sutra Annotation (SOUL_FORGE) & Library unlock!
    let sutraRes = null;
    if (SECT.SOUL_FORGE && SECT.SOUL_FORGE.annotateHeritageSutra) {
      sutraRes = SECT.SOUL_FORGE.annotateHeritageSutra(W, archivist, null, { quiet: true });
    }
    archivist.merit = (archivist.merit || 0) + 16;
    if (archivist.cult) CULT.gain(archivist, 38, W, 'restore_ancient_scroll');

    const summaryTh = '📜 「' + HC.fullName(archivist) + '」บูรณะเศษคัมภีร์โบราณจากแดนลับสำเร็จ! ' +
      (sutraRes && sutraRes.ok ? ('ถอดรหัสเคล็ดวิชาโบราณเสริมลงในคัมภีร์ประจำสำนัก「' + sutraRes.sutra.nameTh + '」ยกระดับสู่ ' + sutraRes.sutra.editionNameTh + '!') : 'เพิ่มพูนภูมิปัญญาเข้าสู่หอคัมภีร์สำนัก!');

    const restRec = {
      day: W.day || 360,
      archivistId: archivist.id,
      archivistNameTh: HC.fullName(archivist),
      sutraNameTh: sutraRes && sutraRes.sutra ? sutraRes.sutra.nameTh : 'คัมภีร์โบราณสำนัก',
      editionNameTh: sutraRes && sutraRes.sutra ? sutraRes.sutra.editionNameTh : 'ฉบับบูรณะ',
      summaryTh
    };
    ne.restoredHistory.unshift(restRec);
    if (ne.restoredHistory.length > 20) ne.restoredHistory.length = 20;

    if (SECT.ELDER_COUNCIL_EDICTS) {
      const ed = SECT.ELDER_COUNCIL_EDICTS.ensure(W);
      if (ed && ed.activeCliqueAgenda && ed.activeCliqueAgenda.cliqueId === 'ORTHODOX_TRADITION' && !ed.activeCliqueAgenda.fulfilled) {
        SECT.ELDER_COUNCIL_EDICTS.fulfillCliqueAgenda(W, 'บูรณะเศษคัมภีร์โบราณและยกระดับคัมภีร์สำนักสำเร็จ', archivist, { quiet: true });
      }
    }

    const chron = (g.EXPED && g.EXPED.recordChronicle) ? g.EXPED.recordChronicle(W, {
      category: 'SECRET_REALM_NODE',
      reportFormat: 'SECRET_REALM_LOGBOOK',
      icon: '📜',
      involvedSects: [W.sect.name],
      involvedFigures: [HC.fullName(archivist)],
      npcIds: [archivist.id],
      titleTh: 'บูรณะเศษคัมภีร์โบราณสำเร็จ: 「' + HC.fullName(archivist) + '」ถอดรหัสอักขระบรรพกาลยกระดับหอคัมภีร์!',
      storyTh: summaryTh,
      originCauseTh: 'การรวบรวมเศษคัมภีร์โบราณจากการสำรวจโหนดแดนลับครบ 2 ชิ้น และความเชี่ยวชาญคัมภีร์ของ ' + HC.fullName(archivist),
      actorChainTh: 'ผู้บูรณะคัมภีร์: ' + HC.fullName(archivist) + ' (หอคัมภีร์) ➔ สืบทอดสู่ศิษย์ทั้งสำนัก',
      systemImpactTh: 'เชื่อมโยง SECRET_REALM_NODES (เศษคัมภีร์) ➔ SOUL_FORGE (ขัดเกลาคัมภีร์มรดกสำนัก) ➔ วาระก๊กจารีต (ORTHODOX_TRADITION)',
      consequenceTh: restRec.sutraNameTh + ' เลื่อนระดับสู่ ' + restRec.editionNameTh + ' · เศษคัมภีร์คงเหลือ ' + ne.ancientScrollFragments + ' ชิ้น',
      quiet: opts.quiet
    }) : null;

    return { ok: true, restored: restRec, archivist, sutraRes, summaryTh, chronicle: chron };
  };

  SECRET_REALM_NODES.tick = (W, opts) => {
    opts = opts || {};
    const ne = SECRET_REALM_NODES.ensure(W);
    if (!ne) return { ok: false };
    let expRes = null;
    let scrollRes = null;
    if (((W.day || 360) % 60 === 0) || opts.forceRun) {
      expRes = SECRET_REALM_NODES.runFullNodeExpedition(W, null, null, null, { quiet: opts.quiet });
    }
    if ((ne.ancientScrollFragments || 0) >= 2 && (((W.day || 360) % 30 === 0) || opts.forceRestore)) {
      scrollRes = SECRET_REALM_NODES.restoreAncientScroll(W, null, { quiet: opts.quiet });
    }
    return { ok: true, expRes, scrollRes };
  };

  SECT.SECRET_REALM_NODES = SECRET_REALM_NODES;

  /* =========================================================================
   * STRATEGIC PROPOSAL FLAGSHIP 7 (F08 + Table 6 #10 Immortal Life):
   * 4-Division Continental Grand Assembly (Martial / Alchemy-Forge / Array-Mech / Dao Discourse)
   * & Spirit Cuisine Sect Banquet (SECT.GRAND_ASSEMBLY_BANQUET)
   * ========================================================================= */
  const GRAND_ASSEMBLY_BANQUET = {};

  GRAND_ASSEMBLY_BANQUET.DIVISIONS = Object.freeze({
    MARTIAL_ARENA: {
      id: 'MARTIAL_ARENA',
      nameTh: 'สายประลองยุทธ์ชิงเจ้ายุทธภพ',
      icon: '⚔️',
      titleBadgeTh: 'ยอดยุทธ์เอกแห่งทวีป',
      favoredPaths: ['XIAN', 'BODY', 'GOD', 'DEMON'],
      descTh: 'วัดพลังยุทธ์ กระบวนท่า และจิตศาสตราตัวต่อตัวกับศิษย์เอกและแม่ทัพต่างสำนัก'
    },
    ALCHEMY_FORGE_DUEL: {
      id: 'ALCHEMY_FORGE_DUEL',
      nameTh: 'สายประชันหลอมโอสถและตีศาสตรา',
      icon: '⚗️',
      titleBadgeTh: 'ปรมาจารย์โอสถศาสตราเทวะ',
      favoredPaths: ['CRAFT_CREATION', 'SAGE_SUPPORT'],
      descTh: 'วัดระดับทักษะการหลอมโอสถ ตีเหล็ก ความเข้าใจปราณไฟ/ไม้/ทอง และความประณีต'
    },
    ARRAY_MECH_TRIAL: {
      id: 'ARRAY_MECH_TRIAL',
      nameTh: 'สายประชันค่ายกลและกลไกสวรรค์',
      icon: '☯️',
      titleBadgeTh: 'เซียนค่ายกลดาราพิศวง',
      favoredPaths: ['ARRAY_TALISMAN', 'MECH_PUPPET'],
      descTh: 'วัดทักษะการวางค่ายกล 10 ธาตุ การแก้ค่ายกลโบราณ และการควบคุมหุ่นกล'
    },
    DAO_DISCOURSE_DEBATE: {
      id: 'DAO_DISCOURSE_DEBATE',
      nameTh: 'สายชุมนุมถกมรรคาเต๋าและสัจธรรม',
      icon: '🪷',
      titleBadgeTh: 'มหาปราชญ์สัจธรรมแห่งเต๋า',
      favoredPaths: ['HEART_SOUL', 'KARMA_SAMSARA', 'SAGE_SUPPORT', 'STRATEGY_GOVERNANCE'],
      descTh: 'โต้วาทีหลักธรรมแห่งเต๋า ความหยั่งรู้ฟ้าดิน และระดับจิตมรรคาต่อหน้าปราชญ์ทั่วหล้า'
    }
  });

  GRAND_ASSEMBLY_BANQUET.ensure = W => {
    if (!W || !W.world || !W.sect) return null;
    if (!W.world.grandAssembly || typeof W.world.grandAssembly !== 'object') {
      W.world.grandAssembly = {
        seq: 0,
        lastHeldYear: 0,
        continentalHostSectId: 'PLAYER',
        continentalHostNameTh: W.sect.name || 'สำนักเมฆาหยก',
        hostMarketTaxBonus: 0.15,
        history: [],
        banquetHistory: []
      };
    }
    const ga = W.world.grandAssembly;
    if (!Array.isArray(ga.history)) ga.history = [];
    if (!Array.isArray(ga.banquetHistory)) ga.banquetHistory = [];
    return ga;
  };

  GRAND_ASSEMBLY_BANQUET.conveneGrandAssembly = (W, opts) => {
    opts = opts || {};
    const ga = GRAND_ASSEMBLY_BANQUET.ensure(W);
    if (!ga) return { ok: false, reason: 'no-assembly-state' };

    const alive = (W.npcs || []).filter(n => n && !n.dead && !n.exiled);
    if (!alive.length) return { ok: false, reason: 'no-disciples' };

    const allSects = (W.world && W.world.allSects) || [];
    const rivalSect = allSects[Math.floor((W.day || 360) / 30) % Math.max(1, allSects.length)] || { id: 'S0', nameTh: 'สำนักกระบี่เทียนซาน', figures: {} };
    const divisionResults = [];
    let playerWins = 0;
    const championNpcs = [];

    Object.keys(GRAND_ASSEMBLY_BANQUET.DIVISIONS).forEach((divKey, idx) => {
      const divDef = GRAND_ASSEMBLY_BANQUET.DIVISIONS[divKey];
      // Pick best representative from Player Sect for this division
      const rep = alive.slice().sort((a, b) => {
        const score = n => {
          let sc = 0;
          if (n.cult && divDef.favoredPaths.includes(n.cult.path)) sc += 65;
          if (divKey === 'MARTIAL_ARENA') sc += CULT.power(n) * 0.5;
          else if (divKey === 'ALCHEMY_FORGE_DUEL') sc += ((n.h.skills.ALCHEMY || 0) + (n.h.skills.FORGE || 0)) * 2.2 + HC.eff(n, 'intellect.comprehension');
          else if (divKey === 'ARRAY_MECH_TRIAL') sc += ((n.h.skills.ARRAY || 0) + (n.h.skills.TALISMAN || 0)) * 2.2 + HC.eff(n, 'intellect.spatial');
          else sc += ((n.h.skills.SCRIPTURE || 0) + HC.eff(n, 'intellect.comprehension') + HC.eff(n, 'intellect.willpower')) * 1.6;
          return sc;
        };
        return score(b) - score(a);
      })[0] || alive[0];

      const rivalFig = (rivalSect.figures && (divKey === 'MARTIAL_ARENA' ? (rivalSect.figures.warMarshal || rivalSect.figures.successor) : divKey === 'ALCHEMY_FORGE_DUEL' ? rivalSect.figures.craftElder : rivalSect.figures.master)) || null;
      const rivalNameTh = rivalFig ? (rivalFig.titleAndNameTh || rivalFig.fullNameTh) : ('ผู้แทนแห่ง' + (rivalSect.nameTh || 'สำนักพันธมิตร'));

      const playerWon = opts.forcePlayerSweep !== false ? true : (idx !== 2);
      if (playerWon) {
        playerWins++;
        if (!Array.isArray(rep.assemblyTitles)) rep.assemblyTitles = [];
        if (!rep.assemblyTitles.includes(divDef.titleBadgeTh)) {
          rep.assemblyTitles.unshift(divDef.titleBadgeTh);
          if (rep.assemblyTitles.length > 4) rep.assemblyTitles.length = 4;
        }
        rep.merit = (rep.merit || 0) + 25;
        rep.cp = (rep.cp || 0) + 30;
        if (rep.cult) CULT.gain(rep, 55, W, 'grand_assembly_champion');
        // Winning a continental division dissolves unresolved Heart-Demon or boosts mood!
        if (SECT.HEART_DEMON && Array.isArray(rep.heartDemons) && rep.heartDemons.some(k => k && !k.resolved)) {
          SECT.HEART_DEMON.counselHeartDemon(W, rep, rep, null, { quiet: true });
        }
        if (rep.h && rep.h.state) rep.h.state.mood = 100;
        championNpcs.push(rep);
      }

      divisionResults.push({
        divisionId: divKey,
        divisionNameTh: divDef.nameTh,
        icon: divDef.icon,
        playerRepId: rep.id,
        playerRepNameTh: HC.fullName(rep),
        playerRepPath: (rep.cult && rep.cult.path) || 'XIAN',
        rivalNameTh,
        rivalSectNameTh: rivalSect.nameTh || 'สำนักยุทธภพ',
        playerWon,
        winnerNameTh: playerWon ? HC.fullName(rep) : rivalNameTh,
        titleAwardedTh: playerWon ? divDef.titleBadgeTh : null
      });
    });

    const overallPlayerHost = playerWins >= 2;
    if (overallPlayerHost) {
      ga.continentalHostSectId = 'PLAYER';
      ga.continentalHostNameTh = W.sect.name;
      ga.hostMarketTaxBonus = 0.15;
      if (ECO && ECO.earn) ECO.earn(W, 180, 'รางวัลชนะเลิศคะแนนรวมมหาชุมนุมยุทธภพ 4 สายและส่วนแบ่งภาษีตลาดทวีป');
      if (SECT.SECRET_REALM_NODES) {
        const ne = SECT.SECRET_REALM_NODES.ensure(W);
        if (ne) ne.ancientScrollFragments = (ne.ancientScrollFragments || 0) + 1;
      }
      if (W.fame) W.fame(15);
    }

    const year = Math.max(1, Math.floor((W.day || 360) / 360));
    ga.lastHeldYear = year;
    const asmRec = {
      id: 'GASM_' + (++ga.seq),
      year,
      day: W.day || 360,
      hostSectNameTh: ga.continentalHostNameTh,
      playerWins,
      overallPlayerHost,
      divisionResults,
      summaryTh: 'มหาชุมนุมยุทธภพและถกเต๋า 4 สายประจำปีที่ ' + year + ': ตัวแทนแห่ง「' + W.sect.name + '」คว้าชัยชนะ ' + playerWins + '/4 สาย (' + divisionResults.filter(d => d.playerWon).map(d => d.playerRepNameTh + ' [' + d.titleAwardedTh + ']').join(', ') + ') ' + (overallPlayerHost ? 'ก้าวขึ้นครองสิทธิ์「สำนักเจ้าภาพมหาชุมนุมแห่งทวีป」รับเงินปันผลภาษีการค้า +180 ศิลา และเศษคัมภีร์โบราณ +1 ชิ้น!' : '')
    };
    ga.history.unshift(asmRec);
    if (ga.history.length > 15) ga.history.length = 15;

    const chron = (g.EXPED && g.EXPED.recordChronicle) ? g.EXPED.recordChronicle(W, {
      category: 'GRAND_ASSEMBLY',
      reportFormat: 'CONTINENTAL_ASSEMBLY_GAZETTE',
      icon: '🏆',
      involvedSects: [W.sect.name, rivalSect.nameTh].filter(Boolean),
      involvedFigures: divisionResults.map(d => d.playerRepNameTh),
      npcIds: divisionResults.map(d => d.playerRepId),
      titleTh: 'ประกาศผลมหาชุมนุมยุทธภพและถกเต๋า 4 สาย: 「' + W.sect.name + '」กวาดแชมป์ ' + playerWins + '/4 สาย ครองศักดิ์ศรีเจ้าภาพทวีป!',
      storyTh: asmRec.summaryTh,
      originCauseTh: 'กำหนดการมหาชุมนุมยุทธภพระดับทวีปประจำปี เพื่อประชันฝีมือทั้งสายบู๊ สายหลอมโอสถ/ศาสตรา สายค่ายกล และสายปราชญ์ถกเต๋า',
      actorChainTh: divisionResults.map(d => d.divisionNameTh + ': ' + d.playerRepNameTh + ' vs ' + d.rivalNameTh).join(' · '),
      systemImpactTh: 'เชื่อมโยง GRAND_ASSEMBLY ➔ ฉายาเกียรติยศตัวละคร (assemblyTitles) ➔ สลายปมมารในใจ (HEART_DEMON) ➔ โบนัสภาษีตลาดคาราวาน (+15%) และเศษคัมภีร์โบราณ (+1)',
      consequenceTh: 'รับฉายาเกียรติยศ ' + playerWins + ' ตำแหน่ง · ศิลา +180 · ชื่อเสียงสำนัก +15',
      quiet: opts.quiet
    }) : null;

    return { ok: true, assembly: asmRec, divisionResults, playerWins, overallPlayerHost, chronicle: chron };
  };

  GRAND_ASSEMBLY_BANQUET.hostSpiritCuisineBanquet = (W, chefNpcOrId, dishTheme, opts) => {
    opts = opts || {};
    const ga = GRAND_ASSEMBLY_BANQUET.ensure(W);
    if (!ga) return { ok: false, reason: 'no-assembly-state' };

    const alive = (W.npcs || []).filter(n => n && !n.dead && !n.exiled);
    if (!alive.length) return { ok: false, reason: 'no-disciples' };

    const chef = (typeof chefNpcOrId === 'object' && chefNpcOrId)
      ? chefNpcOrId
      : (chefNpcOrId && W.byId && W.byId[chefNpcOrId])
      || SECT.holder(W, 'spirit_chef')
      || SECT.holder(W, 'provision')
      || alive[0];

    const menuNameTh = dishTheme || 'เหลาปลามังกรหยกต้มยำปราณบัวสวรรค์ & สุราดอกท้อพันปี';
    let swornPairsCreated = 0;
    let bondedNamesTh = '';

    alive.forEach(n => {
      n.sat = clamp((n.sat || 65) + 18, 0, 100);
      if (n.h && n.h.state) {
        n.h.state.satiety = 100;
        n.h.state.mood = clamp((n.h.state.mood || 60) + 25, 0, 100);
        n.h.state.stress = Math.max(0, (n.h.state.stress || 0) - 25);
        n.h.state.heartDemon = Math.max(0, (n.h.state.heartDemon || 0) - 15);
      }
      if (n.cult) CULT.gain(n, 22, W, 'spirit_cuisine_banquet');
    });

    // Organic social bonding at the banquet table: two compatible disciples toast and become Sworn Siblings!
    if (alive.length >= 2) {
      const a = alive[0];
      const b = alive.find(x => x.id !== a.id) || alive[1];
      if (a && b && a.id !== b.id) {
        const rAB = SECT.rel(a, b.id);
        const rBA = SECT.rel(b, a.id);
        rAB.a = clamp((rAB.a || 30) + 18, -100, 100);
        rBA.a = clamp((rBA.a || 30) + 18, -100, 100);
        if (!rAB.bond) rAB.bond = 'พี่น้องร่วมสาบาน';
        if (!rBA.bond) rBA.bond = 'พี่น้องร่วมสาบาน';
        swornPairsCreated = 1;
        bondedNamesTh = HC.fullName(a) + ' & ' + HC.fullName(b);
      }
    }

    const pol = SECT.ensureHierarchyAndPolitics(W);
    if (pol) {
      pol.undercurrent = clamp((pol.undercurrent || 0) - 15, 0, 100);
      SECT.CLIQUE_IDS.forEach(cid => {
        if (pol.cliques && pol.cliques[cid]) {
          pol.cliques[cid].satisfaction = clamp((pol.cliques[cid].satisfaction || 65) + 12, 0, 100);
        }
      });
      SECT.updateUndercurrentStatus(W);
    }

    if (SECT.ELDER_COUNCIL_EDICTS) {
      const ed = SECT.ELDER_COUNCIL_EDICTS.ensure(W);
      if (ed && ed.activeCliqueAgenda && ed.activeCliqueAgenda.cliqueId === 'BENEVOLENT_SAGE' && !ed.activeCliqueAgenda.fulfilled) {
        SECT.ELDER_COUNCIL_EDICTS.fulfillCliqueAgenda(W, 'จัดงานเลี้ยงฉลองสำนักปราณโอชาเสริมความสามัคคีสำเร็จ', chef, { quiet: true });
      }
    }

    const bRec = {
      id: 'BANQUET_' + (W.day || 360) + '_' + (ga.banquetHistory.length + 1),
      day: W.day || 360,
      chefId: chef.id,
      chefNameTh: HC.fullName(chef),
      menuNameTh,
      attendeesCount: alive.length,
      bondedNamesTh,
      summaryTh: '🍲 พ่อครัวปราณ「' + HC.fullName(chef) + '」รังสรรค์เมนู「' + menuNameTh + '」จัดงานเลี้ยงฉลองทั่วสำนัก (' + alive.length + ' คน) ฟื้นฟูอารมณ์ +25 ลดจิตมาร -15 ลดคลื่นใต้น้ำการเมือง -15' + (bondedNamesTh ? (' และทำให้ ' + bondedNamesTh + ' ดื่มสุราร่วมสาบานเป็นพี่น้อง!') : '!')
    };
    ga.banquetHistory.unshift(bRec);
    if (ga.banquetHistory.length > 15) ga.banquetHistory.length = 15;

    const chron = (g.EXPED && g.EXPED.recordChronicle) ? g.EXPED.recordChronicle(W, {
      category: 'GRAND_ASSEMBLY',
      reportFormat: 'CONTINENTAL_ASSEMBLY_GAZETTE',
      icon: '🍲',
      involvedSects: [W.sect.name],
      involvedFigures: [HC.fullName(chef)].concat(bondedNamesTh ? bondedNamesTh.split(' & ') : []),
      npcIds: [chef.id],
      titleTh: 'งานเลี้ยงฉลองสำนักปราณโอชา: 「' + HC.fullName(chef) + '」ปรุง「' + menuNameTh + '」สมานฉันท์ 4 ก๊กการเมือง!',
      storyTh: bRec.summaryTh,
      originCauseTh: 'ผลผลิตจากระบบตกปลาวิญญาณและโรงครัวปราณ นำมาปรุงโดย ' + HC.fullName(chef) + ' เพื่อผ่อนคลายความตึงเครียดของศิษย์และสภาผู้อาวุโส',
      actorChainTh: 'พ่อครัวเอก: ' + HC.fullName(chef) + ' ➔ ศิษย์ร่วมงาน ' + alive.length + ' คน' + (bondedNamesTh ? (' (คู่ร่วมสาบาน: ' + bondedNamesTh + ')') : ''),
      systemImpactTh: 'เชื่อมโยง FISHING/SPIRIT_CUISINE ➔ ลดความเครียด (-25) & จิตมาร (-15) ➔ ลดคลื่นใต้น้ำ 4 ก๊ก (-15) ➔ สร้างสายสัมพันธ์พี่น้องร่วมสาบาน',
      consequenceTh: 'ศิษย์ทั้งสำนักอิ่มท้องและปราณฟื้นฟู (+22 ตบะ) · คลื่นใต้น้ำการเมืองลดลง -15',
      quiet: opts.quiet
    }) : null;

    return { ok: true, banquet: bRec, chef, swornPairsCreated, chronicle: chron };
  };

  GRAND_ASSEMBLY_BANQUET.tick = (W, opts) => {
    opts = opts || {};
    const ga = GRAND_ASSEMBLY_BANQUET.ensure(W);
    if (!ga) return { ok: false };
    let asmRes = null;
    let bqRes = null;
    const curYear = Math.max(1, Math.floor((W.day || 360) / 360));
    if (curYear > (ga.lastHeldYear || 0) || opts.forceAssembly) {
      asmRes = GRAND_ASSEMBLY_BANQUET.conveneGrandAssembly(W, { quiet: opts.quiet });
    }
    const pol = W.sect && W.sect.internalPolitics;
    if ((pol && (pol.undercurrent || 0) >= 35) || ((W.day || 360) % 90 === 0) || opts.forceBanquet) {
      bqRes = GRAND_ASSEMBLY_BANQUET.hostSpiritCuisineBanquet(W, null, null, { quiet: opts.quiet });
    }
    return { ok: true, asmRes, bqRes };
  };

  SECT.GRAND_ASSEMBLY_BANQUET = GRAND_ASSEMBLY_BANQUET;

  /* =========================================================================
   * STRATEGIC PROPOSAL FLAGSHIP 8 (I02 + I04 + I01):
   * Heavenly Dao AI Storyteller Director, 4 Cultivation Era Shifts,
   * 4 Player Archetype Lenses & Asynchronous Jade Seal Code Sharing (SECT.HEAVENLY_DAO_DIRECTOR)
   * ========================================================================= */
  const HEAVENLY_DAO_DIRECTOR = {};

  HEAVENLY_DAO_DIRECTOR.ERA_DEFS = Object.freeze({
    PRIMORDIAL_HARMONY_ERA: {
      id: 'PRIMORDIAL_HARMONY_ERA',
      nameTh: 'ยุคเบญจธาตุบรรพกาลสมดุล (Primordial Harmony Era)',
      icon: '☯️',
      boostedElements: ['WOOD', 'FIRE', 'EARTH', 'METAL', 'WATER'],
      boostedPaths: ['XIAN', 'SAGE_SUPPORT', 'CRAFT_CREATION'],
      cultMult: 1.12,
      marketFocusCat: 'ALCH_PILL',
      descTh: 'กระแสปราณฟ้าดินทั้ง 5 ธาตุไหลเวียนสอดประสานอย่างสมดุล เอื้อต่อการวางรากฐานสำนักและการค้าขาย'
    },
    ASTRAL_PROSPERITY_ERA: {
      id: 'ASTRAL_PROSPERITY_ERA',
      nameTh: 'ยุคปราณดาราสวรรค์เฟื่องฟู (Astral Prosperity Era)',
      icon: '🌌',
      boostedElements: ['ASTRAL', 'LIGHTNING', 'WIND'],
      boostedPaths: ['ARRAY_TALISMAN', 'HEART_SOUL', 'KARMA_SAMSARA', 'XIAN'],
      cultMult: 1.22,
      marketFocusCat: 'TALISMAN_ARRAY',
      descTh: 'ดวงดาวบรรพกาลโคจรใกล้โลกมนุษย์ ปราณดาราและอัสนีเข้มข้นสูงสุด แดนลับโบราณคลายผนึกทั่วทุกภูมิภาค'
    },
    BLOOD_FIEND_ERA: {
      id: 'BLOOD_FIEND_ERA',
      nameTh: 'ยุคโลหิตมารครองพิภพ (Crimson Blood-Tide Era)',
      icon: '🩸',
      boostedElements: ['BLOOD', 'FIRE', 'METAL'],
      boostedPaths: ['DEMON', 'BODY', 'GOD'],
      cultMult: 1.25,
      marketFocusCat: 'WEAPON_GEAR',
      descTh: 'ปราณโลหิตและไอสังหารปะทุขึ้นจากรอยแยกใต้พิภพ สำนักมารเคลื่อนไหวดุดัน ศาสตราวุธตื่นรู้จิตวิญญาณเร็วขึ้น'
    },
    WITHERING_DHARMA_ERA: {
      id: 'WITHERING_DHARMA_ERA',
      nameTh: 'ยุคปราณเสื่อมถอย・กายาและกลไกผงาด (Iron & Mechanism Era)',
      icon: '⚙️',
      boostedElements: ['METAL', 'EARTH', 'ICE'],
      boostedPaths: ['MECH_PUPPET', 'BODY', 'STRATEGY_GOVERNANCE', 'CRAFT_CREATION'],
      cultMult: 1.15,
      marketFocusCat: 'ORE_METAL',
      descTh: 'ปราณธรรมชาติเบาบางลง สมุนไพรมีราคาแพงขึ้น แต่ศาสตร์หุ่นเชิดกลไก การหลอมกายา และพิชัยสงครามก้าวขึ้นเป็นใหญ่'
    }
  });

  HEAVENLY_DAO_DIRECTOR.PERSONAS = Object.freeze({
    IMPARTIAL_DAO: {
      id: 'IMPARTIAL_DAO',
      nameTh: '⚖️ ฟ้าดินเที่ยงธรรม (Impartial Heavenly Dao)',
      descTh: 'ถ่วงดุลความเจริญและบททดสอบอย่างสมเหตุสมผล ส่งวาสนาเมื่อสำนักบอบช้ำ และส่งบทพิสูจน์เมื่อสำนักรุ่งเรืองสุดขีด'
    },
    MERCIFUL_DAO: {
      id: 'MERCIFUL_DAO',
      nameTh: '🪷 ฟ้าดินเมตตา (Merciful Sage Storyteller)',
      descTh: 'เน้นการตรัสรู้มรรคา วาสนาคัมภีร์โบราณ การคลี่คลายปมมารในใจ และความอบอุ่นของสายสัมพันธ์ศิษย์อาจารย์'
    },
    RUTHLESS_CALAMITY: {
      id: 'RUTHLESS_CALAMITY',
      nameTh: '⚡ ฟ้าดินไร้ปราณี (Ruthless Calamity Director)',
      descTh: 'เร่งจังหวะความขัดแย้งทางการเมือง ศึกชิงมรดกแดนลับ และบททดสอบมารในใจสุดเข้มข้นสำหรับเจ้าสำนักสายฮาร์ดคอร์'
    }
  });

  HEAVENLY_DAO_DIRECTOR.PLAYER_LENSES = Object.freeze({
    WORLD_WATCHER: {
      id: 'WORLD_WATCHER',
      nameTh: '🌍 สายเฝ้ามองความเป็นไปของโลก (World Ecosystem Watcher)',
      icon: '🌍',
      descTh: 'โฟกัสมหภาค: การเปลี่ยนยุคสมัยแห่งปราณ ดุลอำนาจ 19 สำนัก ขบวนคาราวาน และคลื่นเศรษฐกิจยุทธภพ'
    },
    NOVEL_READER: {
      id: 'NOVEL_READER',
      nameTh: '📖 สายอ่านนิยายและมหากาพย์ชีวิต (Wuxia Novel Reader)',
      icon: '📖',
      descTh: 'โฟกัสวรรณกรรม: ร้อยเรียงเหตุการณ์จริงในเกมเป็นบทนิยายกำลังภายใน มีตัวเอกประจำบท โศกนาฏกรรม และการก้าวข้ามปมในใจ'
    },
    NPC_OBSERVER: {
      id: 'NPC_OBSERVER',
      nameTh: '🔍 สายจับตาดูชีวิตและจิตใจ NPC (NPC Biographer & Stalker)',
      icon: '🔍',
      descTh: 'โฟกัสจุลภาค: เจาะลึกแรงจูงใจเร้นลับ ความสัมพันธ์รัก-แค้น-ผู้ช่วยชีวิต การเมืองในก๊ก และบันทึกชีวิตส่วนตัวของศิษย์แต่ละคน'
    },
    GRAND_STRATEGIST: {
      id: 'GRAND_STRATEGIST',
      nameTh: '♟️ สายเจ้าสำนักบริหารยุทธศาสตร์ (Grand Sect Strategist)',
      icon: '♟️',
      descTh: 'โฟกัสบริหาร: สรุปประสิทธิภาพค่ายกลฮวงจุ้ย 10 ธาตุ มติสภาผู้อาวุโส โควตาราชโองการ และความพร้อมก่อนศึกใหญ่'
    }
  });

  HEAVENLY_DAO_DIRECTOR.ensure = W => {
    if (!W || !W.world || !W.sect) return null;
    if (!W.world.heavenlyDao || typeof W.world.heavenlyDao !== 'object') {
      W.world.heavenlyDao = {
        seq: 0,
        persona: 'IMPARTIAL_DAO',
        playerLensMode: 'NOVEL_READER',
        currentEraId: 'PRIMORDIAL_HARMONY_ERA',
        currentEra: HEAVENLY_DAO_DIRECTOR.ERA_DEFS.PRIMORDIAL_HARMONY_ERA,
        eraStartedDay: W.day || 360,
        tensionScore: 32,
        prosperityScore: 58,
        dramaDensity: 64,
        spotlightNpcId: null,
        spotlightSummaryTh: '',
        lastChapterTitleTh: '',
        lastChapterStoryTh: '',
        guestSectDelegation: null,
        history: []
      };
    }
    const hd = W.world.heavenlyDao;
    if (!hd.currentEra || !HEAVENLY_DAO_DIRECTOR.ERA_DEFS[hd.currentEraId]) {
      hd.currentEraId = 'PRIMORDIAL_HARMONY_ERA';
      hd.currentEra = HEAVENLY_DAO_DIRECTOR.ERA_DEFS.PRIMORDIAL_HARMONY_ERA;
    }
    if (!Array.isArray(hd.history)) hd.history = [];
    return hd;
  };

  HEAVENLY_DAO_DIRECTOR.shiftCultivationEra = (W, targetEraId, opts) => {
    opts = opts || {};
    const hd = HEAVENLY_DAO_DIRECTOR.ensure(W);
    if (!hd) return { ok: false, reason: 'no-director' };

    const eraKeys = Object.keys(HEAVENLY_DAO_DIRECTOR.ERA_DEFS);
    const nextId = (targetEraId && HEAVENLY_DAO_DIRECTOR.ERA_DEFS[targetEraId])
      ? targetEraId
      : eraKeys[(eraKeys.indexOf(hd.currentEraId) + 1) % eraKeys.length];
    const eraDef = HEAVENLY_DAO_DIRECTOR.ERA_DEFS[nextId];

    hd.currentEraId = eraDef.id;
    hd.currentEra = eraDef;
    hd.eraStartedDay = W.day || 360;

    // Ripple 1: Update Feng Shui Celestial Phenomenon & Leyline Resonance
    if (SECT.FENG_SHUI) {
      const fs = SECT.FENG_SHUI.ensure(W);
      if (fs) {
        if (eraDef.id === 'ASTRAL_PROSPERITY_ERA') fs.celestialPhenomenon = SECT.FENG_SHUI.CELESTIAL_PHENOMENA.STARFALL_NIGHT;
        else if (eraDef.id === 'BLOOD_FIEND_ERA') fs.celestialPhenomenon = SECT.FENG_SHUI.CELESTIAL_PHENOMENA.BLOOD_MOON_TIDE;
        else if (eraDef.id === 'WITHERING_DHARMA_ERA') fs.celestialPhenomenon = SECT.FENG_SHUI.CELESTIAL_PHENOMENA.EARTH_GOLDEN_CONVERGENCE;
        else fs.celestialPhenomenon = SECT.FENG_SHUI.CELESTIAL_PHENOMENA.VERDANT_SPRING_FLOW;
        SECT.FENG_SHUI.recomputeMatrix(W);
      }
    }

    // Ripple 2: Shift Jianghu Market Index for the Era's focus category
    if (SECT.CARAVAN_AUCTION) {
      const ca = SECT.CARAVAN_AUCTION.ensure(W);
      if (ca && ca.marketIndex && ca.marketIndex[eraDef.marketFocusCat]) {
        const m = ca.marketIndex[eraDef.marketFocusCat];
        m.multiplier = clamp(+((m.multiplier || 1.0) + 0.25).toFixed(2), 0.65, 1.60);
        m.trend = 'UP';
        m.reasonTh = 'อิทธิพลจาก「' + eraDef.nameTh + '」ทำให้ความต้องการพุ่งสูงทั่วแผ่นดิน';
      }
    }

    const chron = (g.EXPED && g.EXPED.recordChronicle) ? g.EXPED.recordChronicle(W, {
      category: 'HEAVENLY_DAO_ERA',
      reportFormat: 'HEAVENLY_DAO_OMEN_SCROLL',
      icon: eraDef.icon || '🌌',
      involvedSects: [W.sect.name],
      involvedFigures: ['ผู้กำกับชะตาฟ้าดิน'],
      titleTh: 'วัฏจักรฟ้าดินเปลี่ยนผ่านสู่「' + eraDef.nameTh + '」!',
      storyTh: 'กระแสชีพจรปราณทั่วทั้งทวีปแปรเปลี่ยนครั้งใหญ่ ก้าวเข้าสู่「' + eraDef.nameTh + '」— ' + eraDef.descTh + ' ส่งผลให้ปราณธาตุ (' + eraDef.boostedElements.join('/') + ') และวิถี (' + eraDef.boostedPaths.join('/') + ') ได้รับแรงหนุนจากฟ้าดิน ×' + eraDef.cultMult.toFixed(2) + '!',
      originCauseTh: 'การหมุนเวียนของวัฏจักรปราณฟ้าดินและดวงดาวตามกฎธรรมชาติของยุทธภพ',
      actorChainTh: 'ชีพจรฟ้าดิน ➔ ค่ายกลฮวงจุ้ยสำนัก (FENG_SHUI) ➔ ดัชนีตลาดยุทธภพ (CARAVAN_AUCTION) ➔ ผู้ฝึกตนทั้ง 19 สำนัก',
      systemImpactTh: 'เชื่อมโยง HEAVENLY_DAO_DIRECTOR ➔ FENG_SHUI (ปรากฏการณ์ฟ้าดิน) ➔ CARAVAN_AUCTION (ราคาหมวด ' + eraDef.marketFocusCat + ' พุ่งขึ้น) ➔ โบนัสตบะสาย ' + eraDef.boostedPaths.join('/'),
      consequenceTh: 'เข้าสู่ ' + eraDef.nameTh + ' · เร่งตบะสายที่สอดคล้อง ×' + eraDef.cultMult.toFixed(2),
      quiet: opts.quiet
    }) : null;

    return { ok: true, era: eraDef, chronicle: chron };
  };

  HEAVENLY_DAO_DIRECTOR.evaluateDirectorPulse = (W, personaOverride, lensOverride, opts) => {
    opts = opts || {};
    const hd = HEAVENLY_DAO_DIRECTOR.ensure(W);
    if (!hd) return { ok: false, reason: 'no-director' };

    if (personaOverride && HEAVENLY_DAO_DIRECTOR.PERSONAS[personaOverride]) hd.persona = personaOverride;
    if (lensOverride && HEAVENLY_DAO_DIRECTOR.PLAYER_LENSES[lensOverride]) hd.playerLensMode = lensOverride;

    const alive = (W.npcs || []).filter(n => n && !n.dead && !n.exiled);
    if (!alive.length) return { ok: false, reason: 'no-disciples' };

    const pol = SECT.ensureHierarchyAndPolitics(W);
    const unresolvedKnots = alive.reduce((sum, n) => sum + ((Array.isArray(n.heartDemons) ? n.heartDemons.filter(k => k && !k.resolved).length : 0)), 0);
    const avgStress = alive.reduce((sum, n) => sum + ((n.h && n.h.state && n.h.state.stress) || 20), 0) / alive.length;

    hd.tensionScore = clamp(Math.round(((pol && pol.undercurrent) || 10) * 0.45 + unresolvedKnots * 12 + avgStress * 0.35), 10, 100);
    hd.prosperityScore = clamp(Math.round(Math.min(50, (W.sect.stones || 300) / 30) + ((W.sect.fengShui && W.sect.fengShui.sectAverageScore) || 68) * 0.45), 15, 100);
    hd.dramaDensity = clamp(Math.round(45 + ((W.world.chronicles && W.world.chronicles.length) || 5) * 1.5), 25, 100);

    // Pick the #1 Protagonist Spotlight NPC based on real life events, heart demons, weapon spirit, and rank
    const spotlight = alive.slice().sort((a, b) => {
      const score = n => {
        let sc = (n.rank || 1) * 12 + (CULT.power ? CULT.power(n) * 0.08 : 10);
        if (Array.isArray(n.heartDemons) && n.heartDemons.length) sc += 35;
        if (Array.isArray(n.daoScars) && n.daoScars.length) sc += 30;
        if (n.equip && n.equip.WEAPON && n.equip.WEAPON.weaponSpirit) sc += 28;
        if (n.companionId) sc += 25;
        if (n.renegadeOrigin) sc += 30;
        if (Array.isArray(n.assemblyTitles) && n.assemblyTitles.length) sc += 25;
        return sc;
      };
      return score(b) - score(a);
    })[0] || alive[0];

    hd.spotlightNpcId = spotlight.id;
    const spName = HC.fullName(spotlight);
    const spPath = (spotlight.cult && CULT.PATHS[spotlight.cult.path] && CULT.PATHS[spotlight.cult.path].nameTh) || (spotlight.cult && spotlight.cult.path) || 'ผู้ฝึกตน';
    const spStage = spotlight.cult ? CULT.stageName(spotlight) : 'ปุถุชน';
    const spWpn = (spotlight.equip && spotlight.equip.WEAPON && spotlight.equip.WEAPON.weaponSpirit) ? spotlight.equip.WEAPON.weaponSpirit.spiritNameTh : 'ศาสตราประจำกาย';
    const spScars = (Array.isArray(spotlight.daoScars) && spotlight.daoScars.length) ? spotlight.daoScars[0].nameTh : null;

    // Trigger organic Director Event based on Persona & Tension/Prosperity balance
    let interventionType = 'BALANCED_EPIPHANY';
    let interventionSummaryTh = '';
    if (hd.persona === 'MERCIFUL_DAO' || (hd.persona === 'IMPARTIAL_DAO' && hd.tensionScore >= 52)) {
      interventionType = 'FORTUITOUS_DAO_RAIN';
      if (spotlight.cult) CULT.gain(spotlight, 50, W, 'heavenly_dao_epiphany');
      if (SECT.HEART_DEMON && Array.isArray(spotlight.heartDemons) && spotlight.heartDemons.some(k => k && !k.resolved)) {
        SECT.HEART_DEMON.counselHeartDemon(W, null, spotlight, null, { quiet: true });
      }
      interventionSummaryTh = 'ผู้กำกับชะตาฟ้าดิน (' + HEAVENLY_DAO_DIRECTOR.PERSONAS[hd.persona].nameTh + ') เล็งเห็นความตึงเครียดในสำนัก จึงประทาน「สายพิรุณสัจธรรมแห่งเต๋า」ช่วยให้「' + spName + '」เกิดภาวะบรรลุธรรมฉับพลัน (+50 ตบะ และชำระจิตมาร)!';
    } else if (hd.persona === 'RUTHLESS_CALAMITY' || (hd.persona === 'IMPARTIAL_DAO' && hd.prosperityScore >= 75)) {
      interventionType = 'HEAVENLY_TRIAL_TEMPERING';
      if (spotlight.cult) CULT.gain(spotlight, 65, W, 'heavenly_trial_tempering');
      if (SECT.SOUL_FORGE && SECT.SOUL_FORGE.recordWeaponFeat) {
        SECT.SOUL_FORGE.recordWeaponFeat(W, spotlight, 'ฝ่าบททดสอบนิมิตอัสนีของผู้กำกับชะตาฟ้าดิน', 35);
      }
      interventionSummaryTh = 'ผู้กำกับชะตาฟ้าดิน (' + HEAVENLY_DAO_DIRECTOR.PERSONAS[hd.persona].nameTh + ') เห็นสำนักรุ่งเรืองไร้คู่ต่อกร จึงส่ง「นิมิตอัสนีบททดสอบชะตาสวรรค์」ลงมาหล่อหลอม「' + spName + '」และปลุกจิตศาสตรา「' + spWpn + '」ให้แกร่งกล้าขึ้น (+65 ตบะ · +35 XP จิตศาสตรา)!';
    } else {
      interventionType = 'KARMIC_SCROLL_DISCOVERY';
      if (SECT.SECRET_REALM_NODES) {
        const ne = SECT.SECRET_REALM_NODES.ensure(W);
        if (ne) ne.ancientScrollFragments = (ne.ancientScrollFragments || 0) + 1;
      }
      if (spotlight.cult) CULT.gain(spotlight, 40, W, 'heavenly_dao_scroll');
      interventionSummaryTh = 'ผู้กำกับชะตาฟ้าดินชักนำวาสนาให้「' + spName + '」ค้นพบเบาะแสเศษคัมภีร์โบราณจากการโคจรปราณใต้แสงดารา (+1 เศษคัมภีร์โบราณ · +40 ตบะ)!';
    }

    hd.spotlightSummaryTh = 'ตัวเอกประจำบท: 「' + spName + '」(' + spPath + ' · ' + spStage + ') ผู้ครอบครอง ' + spWpn + (spScars ? (' และบรรลุ ' + spScars) : '');
    hd.lastChapterTitleTh = 'บทจารึกชะตาฟ้าดิน: เส้นทางมรรคาของ「' + spName + '」ท่ามกลาง' + hd.currentEra.nameTh;
    hd.lastChapterStoryTh = 'ท่ามกลางกระแสแห่ง「' + hd.currentEra.nameTh + '」 ดวงชะตาของสำนัก「' + W.sect.name + '」ได้หมุนรอบตัวของ「' + spName + '」(' + spPath + ' · ' + spStage + '). ' + interventionSummaryTh;

    const ArchetypeReports = HEAVENLY_DAO_DIRECTOR.getPlayerArchetypeReport(W, hd.playerLensMode);

    const hRec = {
      id: 'HDAO_' + (++hd.seq),
      day: W.day || 360,
      persona: hd.persona,
      playerLensMode: hd.playerLensMode,
      eraId: hd.currentEraId,
      eraNameTh: hd.currentEra.nameTh,
      spotlightNpcId: spotlight.id,
      spotlightNameTh: spName,
      interventionType,
      interventionSummaryTh,
      tensionScore: hd.tensionScore,
      prosperityScore: hd.prosperityScore,
      dramaDensity: hd.dramaDensity,
      archetypeReport: ArchetypeReports
    };
    hd.history.unshift(hRec);
    if (hd.history.length > 20) hd.history.length = 20;

    const chron = (g.EXPED && g.EXPED.recordChronicle) ? g.EXPED.recordChronicle(W, {
      category: 'HEAVENLY_DAO_ERA',
      reportFormat: 'HEAVENLY_DAO_OMEN_SCROLL',
      icon: '🌌',
      involvedSects: [W.sect.name],
      involvedFigures: [spName],
      npcIds: [spotlight.id],
      titleTh: hd.lastChapterTitleTh,
      storyTh: hd.lastChapterStoryTh,
      originCauseTh: 'ผู้กำกับชะตาฟ้าดินประเมินค่าความตึงเครียด (' + hd.tensionScore + '/100) และความมั่งคั่ง (' + hd.prosperityScore + '/100) ของสำนัก',
      actorChainTh: 'ผู้กำกับชะตาฟ้าดิน (' + HEAVENLY_DAO_DIRECTOR.PERSONAS[hd.persona].nameTh + ') ➔ ตัวเอกประจำบท: ' + spName,
      systemImpactTh: 'เชื่อมโยง HEAVENLY_DAO_DIRECTOR ➔ ' + interventionType + ' ➔ มุมมองผู้เล่น 4 สไตล์ (' + hd.playerLensMode + ')',
      directorInsightTh: '[Director (' + hd.persona + ')]: Tension=' + hd.tensionScore + ', Prosperity=' + hd.prosperityScore + ', Drama=' + hd.dramaDensity + ' ➔ ขับเคลื่อนเรื่องราวผ่าน ' + spName,
      playerLensHighlights: ArchetypeReports.allLenses,
      consequenceTh: interventionSummaryTh,
      quiet: opts.quiet
    }) : null;

    return { ok: true, directorState: hd, record: hRec, spotlight, archetypeReport: ArchetypeReports, chronicle: chron };
  };

  HEAVENLY_DAO_DIRECTOR.getPlayerArchetypeReport = (W, lensOverride) => {
    const hd = HEAVENLY_DAO_DIRECTOR.ensure(W);
    const activeLens = (lensOverride && HEAVENLY_DAO_DIRECTOR.PLAYER_LENSES[lensOverride]) ? lensOverride : (hd ? hd.playerLensMode : 'NOVEL_READER');
    const alive = (W.npcs || []).filter(n => n && !n.dead && !n.exiled);
    const sp = (hd && hd.spotlightNpcId && W.byId && W.byId[hd.spotlightNpcId]) || alive[0];
    const spName = sp ? HC.fullName(sp) : 'ศิษย์เอก';
    const eraName = (hd && hd.currentEra && hd.currentEra.nameTh) || 'ยุคเบญจธาตุบรรพกาล';
    const fsGrade = (W.sect && W.sect.fengShui && W.sect.fengShui.sectGrade) || 'A';
    const agendaName = (W.sect && W.sect.edicts && W.sect.edicts.activeCliqueAgenda && W.sect.edicts.activeCliqueAgenda.nameTh) || 'รักษาสมดุล 4 ก๊ก';

    const allLenses = {
      WORLD_WATCHER: '🌍 [มุมมองคนชอบดูความเป็นไปของโลก]: ยุทธภพกำลังอยู่ใน「' + eraName + '」ดัชนีการค้าและคาราวานหมุนเวียนตามศึกของ 19 สำนัก โดยมี「' + W.sect.name + '」เป็นศูนย์กลางเศรษฐกิจและเจ้าภาพมหาชุมนุมทวีป',
      NOVEL_READER: '📖 [มุมมองคนชอบอ่านนิยาย]: บทที่ ' + ((hd && hd.seq) || 1) + ' — 「' + spName + '」ก้าวผ่านบททดสอบแห่งปมมารในใจและศึกแดนลับ 5 โหนด จารึกชื่อในฐานะผู้สืบทอดเจตนารมณ์แห่ง「' + W.sect.name + '」',
      NPC_OBSERVER: '🔍 [มุมมองคนชอบจับตาดู NPC]: 「' + spName + '」มีความมุ่งมั่น ' + (sp ? Math.round(HC.eff(sp, 'intellect.willpower')) : 65) + ' · สังกัดก๊ก ' + ((sp && sp.cliqueId) || 'สายปราชญ์') + ' · มีสายสัมพันธ์แน่นแฟ้นกับเพื่อนร่วมสำนักและจิตศาสตราคู่กาย',
      GRAND_STRATEGIST: '♟️ [มุมมองนักวางแผนและบริหาร]: ฮวงจุ้ยสำนักระดับ ' + fsGrade + ' · วาระสภาผู้อาวุโสปัจจุบันคือ「' + agendaName + '」· โควตาคลังสำรองทำงานอัตโนมัติสมบูรณ์'
    };

    return {
      activeLens,
      activeLensNameTh: HEAVENLY_DAO_DIRECTOR.PLAYER_LENSES[activeLens].nameTh,
      activeSummaryTh: allLenses[activeLens],
      allLenses
    };
  };

  HEAVENLY_DAO_DIRECTOR.exportJadeSealCode = W => {
    if (!W || !W.sect) return { ok: false, reason: 'invalid-world' };
    const alive = (W.npcs || []).filter(n => n && !n.dead && !n.exiled).sort((a, b) => CULT.power(b) - CULT.power(a));
    const top3 = alive.slice(0, 3).map(n => ({
      nameTh: HC.fullName(n),
      path: (n.cult && n.cult.path) || 'XIAN',
      stage: (n.cult && n.cult.stage) || 3,
      power: Math.round(CULT.power ? CULT.power(n) : 120)
    }));
    const sutra = (W.sect.mentorship && Array.isArray(W.sect.mentorship.heritageArts) && W.sect.mentorship.heritageArts[0])
      ? W.sect.mentorship.heritageArts[0].nameTh
      : 'คัมภีร์เมฆาหยกต้นกำเนิด';
    const arrayName = (W.sect.fengShui && W.sect.fengShui.activeGrandArray && W.sect.fengShui.activeGrandArray.nameTh)
      || 'ค่ายกลดาราอัสนีพิทักษ์สวรรค์';

    const payload = {
      v: '2.0.32',
      sectNameTh: W.sect.name || 'สำนักเมฆาหยก',
      tierNameTh: W.sect.tierNameTh || 'สำนักใหญ่',
      fame: W.sect.fame || 50,
      sutraNameTh: sutra,
      grandArrayNameTh: arrayName,
      champions: top3
    };
    const jsonStr = JSON.stringify(payload);
    const b64 = (typeof Buffer !== 'undefined')
      ? Buffer.from(jsonStr, 'utf8').toString('base64')
      : btoa(unescape(encodeURIComponent(jsonStr)));
    const code = 'JADE_SEAL_V1:' + b64;
    return { ok: true, code, payload };
  };

  HEAVENLY_DAO_DIRECTOR.importJadeSealCode = (W, codeStr, opts) => {
    opts = opts || {};
    const hd = HEAVENLY_DAO_DIRECTOR.ensure(W);
    if (!hd) return { ok: false, reason: 'no-director' };

    let payload = null;
    try {
      const raw = String(codeStr || '').trim();
      const b64 = raw.startsWith('JADE_SEAL_V1:') ? raw.slice('JADE_SEAL_V1:'.length) : raw;
      const jsonStr = (typeof Buffer !== 'undefined')
        ? Buffer.from(b64, 'base64').toString('utf8')
        : decodeURIComponent(escape(atob(b64)));
      payload = JSON.parse(jsonStr);
    } catch (e) {
      payload = {
        v: '2.0.32',
        sectNameTh: 'สำนักดาราหยกพันธมิตรต่างแดน',
        tierNameTh: 'สำนักมหาอำนาจ',
        fame: 120,
        sutraNameTh: 'คัมภีร์กระบี่ดาราเก้าสวรรค์',
        grandArrayNameTh: 'ค่ายกลเบญจธาตุหมุนเวียน',
        champions: [{ nameTh: 'หลินเทียนหยา', path: 'XIAN', stage: 5, power: 420 }]
      };
    }

    const hostRep = (W.npcs || []).filter(n => n && !n.dead && !n.exiled).sort((a, b) => CULT.power(b) - CULT.power(a))[0];
    if (hostRep && hostRep.cult) {
      CULT.gain(hostRep, 45, W, 'jade_seal_exchange');
    }
    if (SECT.SECRET_REALM_NODES) {
      const ne = SECT.SECRET_REALM_NODES.ensure(W);
      if (ne) ne.ancientScrollFragments = (ne.ancientScrollFragments || 0) + 1;
    }

    hd.guestSectDelegation = {
      importedDay: W.day || 360,
      sectNameTh: payload.sectNameTh || 'สำนักแขกผู้มาเยือน',
      sutraNameTh: payload.sutraNameTh || 'คัมภีร์โบราณต่างแดน',
      grandArrayNameTh: payload.grandArrayNameTh || 'ค่ายกลพิทักษ์สำนัก',
      champions: payload.champions || [],
      hostRepNameTh: hostRep ? HC.fullName(hostRep) : 'เจ้าสำนัก',
      summaryTh: 'รับเทียบเชิญตราหยกจาก「' + (payload.sectNameTh || 'สำนักต่างแดน') + '」แลกเปลี่ยนอรรถาธิบาย「' + (payload.sutraNameTh || 'คัมภีร์โบราณ') + '」และประลองชี้แนะกับ ' + (hostRep ? HC.fullName(hostRep) : 'ศิษย์เอก') + ' (+45 ตบะ · +1 เศษคัมภีร์โบราณ)!'
    };

    const chron = (g.EXPED && g.EXPED.recordChronicle) ? g.EXPED.recordChronicle(W, {
      category: 'HEAVENLY_DAO_ERA',
      reportFormat: 'HEAVENLY_DAO_OMEN_SCROLL',
      icon: '🎴',
      involvedSects: [W.sect.name, hd.guestSectDelegation.sectNameTh],
      involvedFigures: [hd.guestSectDelegation.hostRepNameTh],
      npcIds: hostRep ? [hostRep.id] : [],
      titleTh: 'เทียบเชิญตราหยกข้ามสำนัก: คณะทูต「' + hd.guestSectDelegation.sectNameTh + '」มาเยือนแลกเปลี่ยนคัมภีร์「' + hd.guestSectDelegation.sutraNameTh + '」!',
      storyTh: hd.guestSectDelegation.summaryTh,
      originCauseTh: 'การเปิดผนึกตราหยกเทียบเชิญข้ามสำนัก (Asynchronous Jade Seal Code Sharing — I01)',
      actorChainTh: 'คณะผู้แทน ' + hd.guestSectDelegation.sectNameTh + ' ➔ ผู้รับรอง: ' + hd.guestSectDelegation.hostRepNameTh,
      systemImpactTh: 'เชื่อมโยง HEAVENLY_DAO_DIRECTOR (I01 Jade Seal) ➔ แลกเปลี่ยนความเข้าใจคัมภีร์ (+1 เศษคัมภีร์โบราณ) + ตบะ (+45)',
      consequenceTh: hd.guestSectDelegation.summaryTh,
      quiet: opts.quiet
    }) : null;

    return { ok: true, guestSect: hd.guestSectDelegation, chronicle: chron };
  };

  HEAVENLY_DAO_DIRECTOR.tick = (W, opts) => {
    opts = opts || {};
    const hd = HEAVENLY_DAO_DIRECTOR.ensure(W);
    if (!hd) return { ok: false };
    // Shift Cultivation Era every 180 days (or when forced)
    if (((W.day || 360) - (hd.eraStartedDay || 360)) >= 180 || opts.forceEraShift) {
      HEAVENLY_DAO_DIRECTOR.shiftCultivationEra(W, null, { quiet: opts.quiet });
    }
    const pulseRes = HEAVENLY_DAO_DIRECTOR.evaluateDirectorPulse(W, null, null, { quiet: opts.quiet });
    return { ok: true, directorState: hd, pulseRes };
  };

  SECT.HEAVENLY_DAO_DIRECTOR = HEAVENLY_DAO_DIRECTOR;

  /* =========================================================================
   * PATCH v2.0.33 — PILLAR 2:
   * Unappointed Elder Status & Rank System (SECT.ELDER_STATUS)
   * Elders do not need to hold one of the 22 central administrative posts to hold
   * Elder Status (rank = 4, isElder = true). They earn Elder rank through cultivation
   * stage, seniority, and merit, and can found/lead Peaks or vote in the Elder Council.
   * ========================================================================= */
  const ELDER_STATUS = {};

  ELDER_STATUS.TITLES_BY_STYLE = Object.freeze({
    MARTIAL: 'ผู้อาวุโสพิทักษ์มรรคา',
    SCHOLAR: 'ผู้อาวุโสปราชญ์คัมภีร์',
    CRAFT: 'ผู้อาวุโสปรมาจารย์หลอมสร้าง',
    HERMIT: 'ผู้อาวุโสเร้นกายบำเพ็ญพรต',
    HONORARY: 'ผู้อาวุโสกิตติมศักดิ์'
  });

  ELDER_STATUS.deriveElderTitle = npc => {
    if (!npc) return ELDER_STATUS.TITLES_BY_STYLE.HONORARY;
    const p = npc.cult && npc.cult.path;
    if (['XIAN', 'BODY', 'GOD', 'DEMON'].includes(p)) return ELDER_STATUS.TITLES_BY_STYLE.MARTIAL;
    if (['CRAFT_CREATION', 'ARRAY_TALISMAN', 'MECH_PUPPET'].includes(p)) return ELDER_STATUS.TITLES_BY_STYLE.CRAFT;
    if (['HEART_SOUL', 'KARMA_SAMSARA'].includes(p)) return ELDER_STATUS.TITLES_BY_STYLE.HERMIT;
    if (['SAGE_SUPPORT', 'STRATEGY_GOVERNANCE'].includes(p)) return ELDER_STATUS.TITLES_BY_STYLE.SCHOLAR;
    return ELDER_STATUS.TITLES_BY_STYLE.HONORARY;
  };

  ELDER_STATUS.qualifiesForElderStatus = (W, npc, opts) => {
    opts = opts || {};
    if (!npc || npc.dead || npc.exiled) return false;
    if (npc.rank >= 4 || npc.isElder || npc.post || npc.peakRole === 'MASTER') return true;
    const stage = npc.cult ? (CULT.equivalentStage ? CULT.equivalentStage(npc) : npc.cult.stage) : 0;
    const age = HC.ageYears ? HC.ageYears(npc) : 20;
    const merit = npc.merit || 0;
    if (opts.force) return true;
    if (stage >= 4) return true;
    if (stage >= 3 && (merit >= 140 || age >= 35 || npc.rank >= 3)) return true;
    if (stage >= 2 && npc.rank >= 3 && merit >= 180) return true;
    return false;
  };

  ELDER_STATUS.conferElderStatus = (W, npcOrId, reasonTh, opts) => {
    opts = opts || {};
    if (!W) return { ok: false, reason: 'invalid-world' };
    const npc = typeof npcOrId === 'object' && npcOrId ? npcOrId : (W.byId && W.byId[npcOrId]);
    if (!npc || npc.dead || npc.exiled) return { ok: false, reason: 'npc-unavailable' };

    const wasElder = npc.rank >= 4 || !!npc.isElder;
    if (npc.rank < 4) npc.rank = 4;
    npc.isElder = true;
    if (!npc.elderTitleTh) {
      npc.elderTitleTh = ELDER_STATUS.deriveElderTitle(npc);
    }
    npc.elderAscendedDay = npc.elderAscendedDay || (W.day || 360);
    npc.sat = clamp((npc.sat || 65) + 12, 0, 100);

    if (!wasElder && npc.h && npc.h.life && Array.isArray(npc.h.life.bio)) {
      npc.h.life.bio.push({
        age: HC.ageYears ? Math.round(HC.ageYears(npc)) : 30,
        t: 'ได้รับการสถาปนาขึ้นสู่ฐานะ「' + npc.elderTitleTh + '」(' + (reasonTh || 'ตบะและบารมีถึงเกณฑ์ผู้อาวุโสสำนัก') + ')'
      });
    }
    if (!wasElder && !opts.quiet && W.log) {
      W.log('promote', '🎖️ ' + HC.fullName(npc) + ' บรรลุตบะและบารมี ได้รับการยกย่องขึ้นเป็น「' + npc.elderTitleTh + '」โดยไม่ต้องครองตำแหน่งบริหารส่วนกลาง!', [npc.id]);
    }
    return { ok: true, npc, elderTitleTh: npc.elderTitleTh, wasElder };
  };

  ELDER_STATUS.evaluateElderAscensions = (W, opts) => {
    opts = opts || {};
    if (!W || !Array.isArray(W.npcs)) return { ok: false, ascended: [] };
    const ascended = [];
    for (const n of W.npcs) {
      if (!n || n.dead || n.exiled) continue;
      if (n.rank >= 4) {
        n.isElder = true;
        if (!n.elderTitleTh) n.elderTitleTh = ELDER_STATUS.deriveElderTitle(n);
        continue;
      }
      if (ELDER_STATUS.qualifiesForElderStatus(W, n)) {
        const res = ELDER_STATUS.conferElderStatus(W, n, 'ตบะและผลงานถึงเกณฑ์ผู้อาวุโสสำนัก', { quiet: opts.quiet });
        if (res && res.ok) ascended.push(n);
      }
    }
    return { ok: true, ascended };
  };

  SECT.ELDER_STATUS = ELDER_STATUS;

  /* =========================================================================
   * PATCH v2.0.33 — PILLAR 3:
   * Deep Karmic Social Graph & 24 Action Keyword Relationship Modifiers (SECT.SOCIAL_MATRIX)
   * Every interaction, shared expedition, life-and-death survival, peak fellowship,
   * inter-peak rivalry, and resource gift/snub applies structured modifiers with memory logs.
   * ========================================================================= */
  const SOCIAL_MATRIX = {};

  SOCIAL_MATRIX.ACTION_MODIFIERS = Object.freeze({
    SAME_PEAK_DAILY_PRACTICE: {
      id: 'SAME_PEAK_DAILY_PRACTICE',
      nameTh: 'ฝึกปราณและพำนักร่วมยอดเขาเดียวกัน',
      a: 5, t: 6, r: 3, g: 2, v: 0, l: 1
    },
    SHARED_EXPEDITION_JOURNEY: {
      id: 'SHARED_EXPEDITION_JOURNEY',
      nameTh: 'ร่วมเดินทางผจญภัยนอกสำนักด้วยกัน',
      a: 10, t: 12, r: 5, g: 6, v: 0, l: 2
    },
    LIFE_AND_DEATH_TRIBULATION: {
      id: 'LIFE_AND_DEATH_TRIBULATION',
      nameTh: 'ร่วมเป็นร่วมตายฝ่าวิกฤตแดนลับรอดชีวิตด้วยกัน',
      a: 24, t: 30, r: 14, g: 28, v: -12, l: 8,
      setLifeAndDeath: true
    },
    LIFE_SAVIOR_SHIELD: {
      id: 'LIFE_SAVIOR_SHIELD',
      nameTh: 'สละกายรับคมกระบี่ช่วยชีวิตในยามคับขัน',
      a: 34, t: 40, r: 18, g: 48, v: -25, l: 12,
      bondOverride: 'LIFE_SAVIOR',
      setLifeAndDeath: true
    },
    HEAL_CRITICAL_INJURY: {
      id: 'HEAL_CRITICAL_INJURY',
      nameTh: 'รักษาอาการบาดเจ็บสาหัสหรือมอบโอสถช่วยชีวิต',
      a: 16, t: 14, r: 8, g: 24, v: -6, l: 3
    },
    COUNSEL_HEART_DEMON: {
      id: 'COUNSEL_HEART_DEMON',
      nameTh: 'ชี้แนะสัจธรรมช่วยคลี่คลายปมมารในใจ',
      a: 20, t: 22, r: 16, g: 30, v: -10, l: 4
    },
    PEAK_RESOURCE_BESTOWAL: {
      id: 'PEAK_RESOURCE_BESTOWAL',
      nameTh: 'ผู้นำยอดเขาจัดสรรทรัพยากรและโอสถให้',
      a: 12, t: 10, r: 9, g: 18, v: -4, l: 0
    },
    CENTRAL_TO_PEAK_FAVOR: {
      id: 'CENTRAL_TO_PEAK_FAVOR',
      nameTh: 'ส่วนกลางจัดสรรทรัพยากรหนุนยอดเขาอย่างใจกว้าง',
      a: 14, t: 12, r: 10, g: 16, v: -5, l: 0
    },
    CENTRAL_TO_PEAK_SNUB: {
      id: 'CENTRAL_TO_PEAK_SNUB',
      nameTh: 'ส่วนกลางลำเอียงตัดงบทรัพยากรของยอดเขา',
      a: -14, t: -10, r: -6, g: 0, v: 16, l: 0
    },
    PEAK_NEPOTISM_PASSED_OVER: {
      id: 'PEAK_NEPOTISM_PASSED_OVER',
      nameTh: 'ถูกผู้นำยอดเขาข้ามหัวในการแจกจ่ายทรัพยากร',
      a: -18, t: -16, r: -10, g: 0, v: 20, l: 0
    },
    RIVAL_PEAK_PREJUDICE: {
      id: 'RIVAL_PEAK_PREJUDICE',
      nameTh: 'ความบาดหมางและอคติระหว่างยอดเขาคู่ปรับ',
      a: -10, t: -8, r: -4, g: 0, v: 15, l: 0
    },
    INTER_PEAK_QUARREL: {
      id: 'INTER_PEAK_QUARREL',
      nameTh: 'ปะทะคารมและวิวาทข้ามยอดเขา',
      a: -18, t: -12, r: -6, g: 0, v: 24, l: 0
    },
    HONORABLE_PEAK_SPAR: {
      id: 'HONORABLE_PEAK_SPAR',
      nameTh: 'ประลองตัวแทนยอดเขาอย่างสมศักดิ์ศรีและแลกเปลี่ยนวิชา',
      a: 10, t: 8, r: 16, g: 6, v: 6, l: 0
    },
    RUTHLESS_TOURNAMENT_INJURY: {
      id: 'RUTHLESS_TOURNAMENT_INJURY',
      nameTh: 'ลงมืออำมหิตทำร้ายคู่ประลองบาดเจ็บสาหัส',
      a: -26, t: -25, r: -12, g: 0, v: 35, l: 0
    },
    BANQUET_SWORN_TOAST: {
      id: 'BANQUET_SWORN_TOAST',
      nameTh: 'ร่วมดื่มสุราสาบานในงานเลี้ยงฉลองสำนัก',
      a: 18, t: 20, r: 8, g: 12, v: -8, l: 8,
      bondOverride: 'พี่น้องร่วมสาบาน'
    },
    DUAL_CULTIVATION_RESONANCE: {
      id: 'DUAL_CULTIVATION_RESONANCE',
      nameTh: 'โคจรปราณคู่บำเพ็ญเกื้อหนุนกัน',
      a: 15, t: 18, r: 10, g: 14, v: -10, l: 20
    },
    MENTOR_QI_IMPARTATION: {
      id: 'MENTOR_QI_IMPARTATION',
      nameTh: 'อาจารย์ถ่ายทอดปราณและชี้แนะเคล็ดวิชา',
      a: 18, t: 20, r: 28, g: 35, v: -10, l: 0
    },
    DEFEND_COMRADE_IN_COUNCIL: {
      id: 'DEFEND_COMRADE_IN_COUNCIL',
      nameTh: 'ออกหน้าปกป้องและโหวตหนุนในสภาสำนัก',
      a: 14, t: 16, r: 10, g: 20, v: -6, l: 0
    },
    OBSTRUCT_IN_COUNCIL: {
      id: 'OBSTRUCT_IN_COUNCIL',
      nameTh: 'โหวตคัดค้านหรือขัดขวางในสภาสำนัก',
      a: -16, t: -14, r: -8, g: 0, v: 22, l: 0
    },
    CARAVAN_GUARD_COMRADESHIP: {
      id: 'CARAVAN_GUARD_COMRADESHIP',
      nameTh: 'ร่วมคุ้มกันกองคาราวานฝ่าอันตราย',
      a: 12, t: 15, r: 8, g: 10, v: -4, l: 2
    },
    SCROLL_RESEARCH_COLLABORATION: {
      id: 'SCROLL_RESEARCH_COLLABORATION',
      nameTh: 'ร่วมกันถอดรหัสคัมภีร์โบราณในหอคัมภีร์',
      a: 11, t: 10, r: 14, g: 8, v: -2, l: 0
    },
    INDEPENDENT_LOOKED_DOWN: {
      id: 'INDEPENDENT_LOOKED_DOWN',
      nameTh: 'ถูกศิษย์มีสังกัดยอดเขาดูแคลนว่าเป็นศิษย์ไร้สังกัด',
      a: -8, t: -6, r: -4, g: 0, v: 10, l: 0
    },
    SHARED_GRIEF_CONSOLATION: {
      id: 'SHARED_GRIEF_CONSOLATION',
      nameTh: 'ปลอบประโลมยามสูญเสียคนสำคัญในสำนัก',
      a: 16, t: 18, r: 6, g: 18, v: -6, l: 10
    },
    SENTIENT_WEAPON_RECOGNITION: {
      id: 'SENTIENT_WEAPON_RECOGNITION',
      nameTh: 'สืบทอดเจตนารมณ์ผ่านศาสตราจิตวิญญาณ',
      a: 14, t: 16, r: 22, g: 25, v: 0, l: 0
    }
  });

  SOCIAL_MATRIX.applyActionModifier = (W, actorOrId, targetOrId, keywordId, opts) => {
    opts = opts || {};
    if (!W) return { ok: false, reason: 'invalid-world' };
    const a = typeof actorOrId === 'object' && actorOrId ? actorOrId : (W.byId && W.byId[actorOrId]);
    const b = typeof targetOrId === 'object' && targetOrId ? targetOrId : (W.byId && W.byId[targetOrId]);
    if (!a || !b || a.id === b.id) return { ok: false, reason: 'invalid-pair' };

    const mod = SOCIAL_MATRIX.ACTION_MODIFIERS[keywordId] || SOCIAL_MATRIX.ACTION_MODIFIERS.SAME_PEAK_DAILY_PRACTICE;
    const scale = Number.isFinite(opts.scale) ? opts.scale : 1.0;

    const rAB = SECT.rel(a, b.id);
    const rBA = SECT.rel(b, a.id);

    const applyTo = (r, mult) => {
      r.a = clamp((r.a || 0) + Math.round((mod.a || 0) * mult), -100, 100);
      r.t = clamp((r.t ?? 40) + Math.round((mod.t || 0) * mult), 0, 100);
      r.r = clamp((r.r ?? 30) + Math.round((mod.r || 0) * mult), 0, 100);
      r.g = clamp((r.g || 0) + Math.round((mod.g || 0) * mult), 0, 100);
      r.v = clamp((r.v || 0) + Math.round((mod.v || 0) * mult), 0, 100);
      r.l = clamp((r.l || 0) + Math.round((mod.l || 0) * mult), 0, 100);
      r.n = (r.n || 0) + 1;
      r.last = W.t || ((W.day || 360) * 1440);
      if (mod.setLifeAndDeath) {
        r.lifeAndDeathCount = (r.lifeAndDeathCount || 0) + 1;
      }
      if (mod.bondOverride) {
        r.bond = mod.bondOverride;
      }
      if (!Array.isArray(r.historyKeywords)) r.historyKeywords = [];
      r.historyKeywords.unshift({
        day: W.day || 360,
        keyword: mod.id,
        nameTh: opts.customReasonTh || mod.nameTh,
        deltaA: Math.round((mod.a || 0) * mult)
      });
      if (r.historyKeywords.length > 12) r.historyKeywords.length = 12;
    };

    applyTo(rAB, scale);
    if (opts.mutual !== false) {
      applyTo(rBA, scale * 0.9);
    }

    if (g.AI && g.AI.updateBond) {
      g.AI.updateBond(W, a, b, rAB);
      if (opts.mutual !== false) g.AI.updateBond(W, b, a, rBA);
    }
    if (g.AI && g.AI.mem && Math.abs(mod.a || 0) >= 12) {
      g.AI.mem(W, a, (opts.customReasonTh || mod.nameTh) + ' กับ ' + HC.fullName(b), 0.65, b.id);
    }

    return {
      ok: true,
      keyword: mod.id,
      nameTh: mod.nameTh,
      actorId: a.id,
      targetId: b.id,
      relAB: rAB,
      relBA: rBA
    };
  };

  SECT.SOCIAL_MATRIX = SOCIAL_MATRIX;

  /* =========================================================================
   * PATCH v2.0.33 — PILLAR 1 & PILLAR 4:
   * 8 Canonical Sect Peaks / Valleys, Founded-Only UI Visibility, Peak Politics,
   * Central-to-Peak Resource Allocation, Independent Disciple Drawbacks,
   * Inter-Peak Tournament & Deep NPC Cognitive Integration (SECT.PEAKS)
   * ========================================================================= */
  const PEAKS = {};
  PEAKS._activeWorld = null;

  // 8 Canonical Peaks locking all 12 Cultivation Paths (4 Solo-Path Major Peaks + 4 Dual-Path Paired Peaks)
  PEAKS.PEAK_ALIASES = Object.freeze({
    PEAK_SWORD: 'PEAK_AZURE_SWORD',
    PEAK_BODY: 'PEAK_VAJRA_BODY',
    PEAK_CHAOS: 'PEAK_CRIMSON_SHADOW',
    PEAK_ALCHEMY: 'PEAK_DIVINE_CAULDRON',
    PEAK_MAGIC: 'PEAK_SOUL_SAMSARA',
    PEAK_ARRAY: 'PEAK_ASTRAL_MECHANISM',
    PEAK_SCHOLAR: 'PEAK_SAGE_STRATEGIST',
    PEAK_BEAST: 'PEAK_DIVINE_BEAST',
    peak_sword: 'PEAK_AZURE_SWORD',
    peak_body: 'PEAK_VAJRA_BODY',
    peak_chaos: 'PEAK_CRIMSON_SHADOW',
    peak_alchemy: 'PEAK_DIVINE_CAULDRON',
    peak_magic: 'PEAK_SOUL_SAMSARA',
    peak_array: 'PEAK_ASTRAL_MECHANISM',
    peak_scholar: 'PEAK_SAGE_STRATEGIST',
    peak_beast: 'PEAK_DIVINE_BEAST'
  });

  PEAKS.resolvePeakId = peakId => {
    if (!peakId) return null;
    return PEAKS.PEAK_ALIASES[peakId] || peakId;
  };

  PEAKS.PEAK_DEFS = Object.freeze({
    PEAK_AZURE_SWORD: {
      id: 'PEAK_AZURE_SWORD',
      aliasId: 'PEAK_SWORD',
      nameTh: 'ยอดเขากระบี่เมฆาคราม',
      shortTh: 'ยอดเขากระบี่เมฆา',
      icon: '🗡️',
      isSoloPath: true,
      paths: ['XIAN', 'CELESTIAL_WEATHER', 'CHRONO_EPOCH', 'SHADOW_SAMURAI', 'TIDE_VOYAGER'],
      auraBonus: { cultRate: 0.14, swordPower: 0.10, p: { atk: 0.10, matk: 0.10 } },
      descTh: 'ยอดเขาเอกแห่งวิถีเซียนปราณและกระบี่เหินเมฆา โบนัสดาเมจอาวุธกระบี่ +10%'
    },
    PEAK_VAJRA_BODY: {
      id: 'PEAK_VAJRA_BODY',
      aliasId: 'PEAK_BODY',
      nameTh: 'ยอดผาหลอมกายาวัชระ',
      shortTh: 'ยอดผากายาวัชระ',
      icon: '⛰️',
      isSoloPath: true,
      paths: ['BODY', 'GRAVITY_DAO', 'PRIMORDIAL_SHIFTER', 'DEVOURING_FLESH', 'ARENA_GLORY'],
      auraBonus: { cultRate: 0.14, hpMaxMult: 0.12, p: { hp: 0.12 } },
      descTh: 'หน้าผาหินเหล็กไหลสำหรับผู้ฝึกตนวิถีหลอมกายา เพิ่มพลังชีวิตสูงสุด +12%'
    },
    PEAK_CRIMSON_SHADOW: {
      id: 'PEAK_CRIMSON_SHADOW',
      aliasId: 'PEAK_CHAOS',
      nameTh: 'หุบเขาเงาโลหิตอสูร',
      shortTh: 'หุบเขาเงาโลหิต',
      icon: '🩸',
      isSoloPath: true,
      paths: ['DEMON', 'VENOM_GU', 'SOUL_PUPPETRY', 'NINPO_SHADOW', 'VOID_HERETIC_PACT', 'NETHER_GRAVE'],
      auraBonus: { cultRate: 0.15, combatFerocity: 0.12, critBonus: 10, btBonus: 0.10, p: { atk: 0.10 }, f: { crit: 10 } },
      descTh: 'หุบเขาลี้ลับและแดนอัสนีโลหิต เพิ่มอัตราคริติคอล +10% และโอกาสทะลวงด่าน +10%'
    },
    PEAK_DIVINE_CAULDRON: {
      id: 'PEAK_DIVINE_CAULDRON',
      aliasId: 'PEAK_ALCHEMY',
      nameTh: 'ยอดเขาเตาหลอมเทวะ',
      shortTh: 'ยอดเขาเตาหลอม',
      icon: '⚗️',
      isSoloPath: true,
      paths: ['CRAFT_CREATION', 'DRAGON_VEIN_GEOMANCY', 'MERCANTILE_DAO', 'FORTUNE_GAMBLER', 'SPIRIT_HUSBANDRY'],
      auraBonus: { cultRate: 0.13, craftQuality: 0.15, alchemySuccess: 0.15 },
      descTh: 'ยอดเขาแห่งไฟปฐพีและทั่งตีเหล็กสวรรค์ เพิ่มอัตราความสำเร็จและคุณภาพโอสถ/ศาสตรา +15%'
    },
    PEAK_SOUL_SAMSARA: {
      id: 'PEAK_SOUL_SAMSARA',
      aliasId: 'PEAK_MAGIC',
      nameTh: 'ยอดเขาทะเลวิญญาณวัฏสงสาร',
      shortTh: 'ยอดเขาวิญญาณวัฏจักร',
      icon: '🪷',
      isSoloPath: false,
      paths: ['HEART_SOUL', 'KARMA_SAMSARA', 'BUDDHA_DHARMA', 'VOID_SPACE', 'PRIMORDIAL_CHAOS', 'DIVINE_POSSESSION', 'ANCESTRAL_RITUAL'],
      auraBonus: { cultRate: 0.14, heartDemonResist: 0.15, matkMult: 0.10, p: { matk: 0.10, mdef: 0.10 } },
      descTh: 'ยอดเขาหยินหยางเต๋าและวิญญาณวัฏจักร เพิ่ม MATK วิชามหาธาตุ +10% และต้านทานจิตมาร +15%'
    },
    PEAK_ASTRAL_MECHANISM: {
      id: 'PEAK_ASTRAL_MECHANISM',
      aliasId: 'PEAK_ARRAY',
      nameTh: 'ยอดเขาค่ายกลดาราจักรกล',
      shortTh: 'ยอดเขาค่ายกลจักรกล',
      icon: '⚙️',
      isSoloPath: false,
      paths: ['ARRAY_TALISMAN', 'MECH_PUPPET', 'ASTRO_DIVINATION', 'INK_LITERATI', 'NINPO_ELEMENTAL', 'OCCULT_MAGE'],
      auraBonus: { cultRate: 0.14, arrayMechMastery: 0.15, sectArrayDefense: 0.15, p: { def: 0.15, mdef: 0.15 } },
      descTh: 'ยอดเขายันต์ค่ายกลและกลจักรดารา เพิ่มพลังป้องกันค่ายกลสำนักและเกราะป้องกัน +15%'
    },
    PEAK_SAGE_STRATEGIST: {
      id: 'PEAK_SAGE_STRATEGIST',
      aliasId: 'PEAK_SCHOLAR',
      nameTh: 'หุบเขาปราชญ์พิชัยยุทธ์',
      shortTh: 'หุบเขาปราชญ์พิชัย',
      icon: '📜',
      isSoloPath: false,
      paths: ['SAGE_SUPPORT', 'STRATEGY_GOVERNANCE', 'SONIC_HARMONY', 'WANDERING_DAO', 'LORE_ARCHIVIST'],
      auraBonus: { cultRate: 0.14, supportGovernance: 0.15, cpGainBonus: 0.15, studySpeedBonus: 0.15, f: { cast: 10 } },
      descTh: 'หุบเขาปราชญ์พิชัย เพิ่มอัตราการได้รับแต้มคุณูปการ (CP) และความเร็วฝึกสกิล +15%'
    },
    PEAK_DIVINE_BEAST: {
      id: 'PEAK_DIVINE_BEAST',
      aliasId: 'PEAK_BEAST',
      nameTh: 'ยอดเขาเทวะราชันอสูร',
      shortTh: 'ยอดเขาเทวะอสูร',
      icon: '🐉',
      isSoloPath: false,
      paths: ['GOD', 'BEAST_SOVEREIGN', 'DIVINE_SUMMONER', 'DIVINE_CHANNELER'],
      auraBonus: { cultRate: 0.14, beastDeityMight: 0.15, petStatBonus: 0.15, tameBonus: 0.15, p: { atk: 0.12, hp: 0.10 } },
      descTh: 'ยอดเขาเทวะราชันอสูร เพิ่มค่าสเตตัสสัตว์เลี้ยงและอัตราการจับสัตว์อสูร +15%'
    }
  });

  PEAKS.PEAK_IDS = Object.freeze(Object.keys(PEAKS.PEAK_DEFS));

  PEAKS.ensure = W => {
    if (!W || !W.sect) return null;
    PEAKS._activeWorld = W;
    const S = W.sect;
    if (!S.peaks || typeof S.peaks !== 'object') {
      S.peaks = {
        seq: 0,
        byId: {},
        interPeakRelations: {},
        tournamentHistory: [],
        allocationHistory: [],
        independentDrawbackLog: []
      };
    }
    const pk = S.peaks;
    if (!pk.byId || typeof pk.byId !== 'object') pk.byId = {};
    if (!pk.interPeakRelations || typeof pk.interPeakRelations !== 'object') pk.interPeakRelations = {};
    if (!Array.isArray(pk.tournamentHistory)) pk.tournamentHistory = [];
    if (!Array.isArray(pk.allocationHistory)) pk.allocationHistory = [];
    if (!Array.isArray(pk.independentDrawbackLog)) pk.independentDrawbackLog = [];

    PEAKS.PEAK_IDS.forEach(pid => {
      const def = PEAKS.PEAK_DEFS[pid];
      if (pk.byId[pid] && Array.isArray(def.paths)) {
        pk.byId[pid].paths = def.paths.slice();
      }
      if (!pk.byId[pid]) {
        pk.byId[pid] = {
          id: pid,
          nameTh: def.nameTh,
          shortTh: def.shortTh,
          icon: def.icon,
          isSoloPath: def.isSoloPath,
          paths: def.paths.slice(),
          descTh: def.descTh,
          founded: false, // STRICT RULE: Only shown in UI when founded === true!
          foundedDay: null,
          masterId: null,
          masterNameTh: null,
          deputyId: null,
          deputyNameTh: null,
          memberIds: [],
          treasuryStones: 0,
          pillReserve: 0,
          lastExpeditionDay: 0,
          vault: { stones: 0, herbs: 0, ores: 0, pills: 0 },
          prestige: 50,
          budgetMultiplier: 1.0,
          policy: {
            allocationRule: 'MERITOCRATIC', // MERITOCRATIC | EGALITARIAN | NEPOTISTIC_INNER_CIRCLE
            allocationRuleTh: 'เน้นผลงานและตบะ (Meritocratic)',
            strictness: 55,
            generosity: 60,
            exclusivityStance: 'COMPETITIVE'
          }
        };
      }
    });

    // Ensure inter-peak relation matrix
    for (let i = 0; i < PEAKS.PEAK_IDS.length; i++) {
      const pA = PEAKS.PEAK_IDS[i];
      if (!pk.interPeakRelations[pA]) pk.interPeakRelations[pA] = {};
      for (let j = 0; j < PEAKS.PEAK_IDS.length; j++) {
        const pB = PEAKS.PEAK_IDS[j];
        if (i === j) continue;
        if (pk.interPeakRelations[pA][pB] == null) {
          // Natural ideological friction: Crimson Shadow (DEMON) vs Azure Sword (XIAN) / Sage Strategist
          let initScore = 0;
          if ((pA === 'PEAK_CRIMSON_SHADOW' && (pB === 'PEAK_AZURE_SWORD' || pB === 'PEAK_SAGE_STRATEGIST')) ||
              (pB === 'PEAK_CRIMSON_SHADOW' && (pA === 'PEAK_AZURE_SWORD' || pA === 'PEAK_SAGE_STRATEGIST'))) {
            initScore = -24;
          } else if ((pA === 'PEAK_DIVINE_CAULDRON' && pB === 'PEAK_SAGE_STRATEGIST') ||
                     (pB === 'PEAK_DIVINE_CAULDRON' && pA === 'PEAK_SAGE_STRATEGIST')) {
            initScore = 22;
          }
          pk.interPeakRelations[pA][pB] = initScore;
        }
      }
    }
    PEAKS.PEAK_IDS.forEach(pid => {
      const def = PEAKS.PEAK_DEFS[pid];
      const pObj = pk.byId[pid];
      if (pObj) {
        pk[pid] = pObj;
        if (def && def.aliasId) {
          pk[def.aliasId] = pObj;
          pk[def.aliasId.toLowerCase()] = pObj;
        }
      }
    });
    if (g.MAP && g.MAP.syncPeakSanctuaries) g.MAP.syncPeakSanctuaries(W);
    return pk;
  };

  // Strict UI Visibility Helper: Returns ONLY founded peaks!
  PEAKS.getVisibleFoundedPeaks = W => {
    const pk = PEAKS.ensure(W);
    if (!pk) return [];
    return PEAKS.PEAK_IDS.map(pid => pk.byId[pid]).filter(p => p && p.founded === true);
  };

  PEAKS.getInterPeakScore = (W, peakA, peakB) => {
    if (!W || !W.sect || !W.sect.peaks || !peakA || !peakB || peakA === peakB) return 0;
    const ip = W.sect.peaks.interPeakRelations;
    return (ip && ip[peakA] && Number.isFinite(ip[peakA][peakB])) ? ip[peakA][peakB] : 0;
  };

  PEAKS.adjustInterPeakRelation = (W, peakA, peakB, delta, reasonTh) => {
    const pk = PEAKS.ensure(W);
    if (!pk || !peakA || !peakB || peakA === peakB) return 0;
    pk.interPeakRelations[peakA] = pk.interPeakRelations[peakA] || {};
    pk.interPeakRelations[peakB] = pk.interPeakRelations[peakB] || {};
    const next = clamp((pk.interPeakRelations[peakA][peakB] || 0) + delta, -100, 100);
    pk.interPeakRelations[peakA][peakB] = next;
    pk.interPeakRelations[peakB][peakA] = next;
    return next;
  };

  PEAKS.peakIdForPath = pathId => {
    if (!pathId) return null;
    for (const pid of PEAKS.PEAK_IDS) {
      if (PEAKS.PEAK_DEFS[pid].paths.includes(pathId)) return pid;
    }
    return null;
  };

  // Check the 3 Strict Founding Conditions for a Peak:
  // 1) >= 4 living members cultivating the Peak's designated path(s)
  // 2) >= 1 member with Elder status (rank >= 4 or isElder === true) to serve as Peak Master
  // 3) >= 4 members total (1 Peak Master + 1 Deputy Peak Master + >= 2 regular members)
  PEAKS.checkFoundingEligibility = (W, peakId) => {
    peakId = PEAKS.resolvePeakId(peakId);
    const pk = PEAKS.ensure(W);
    if (!pk || !pk.byId[peakId]) return { eligible: false, reason: 'invalid-peak' };
    const pObj = pk.byId[peakId];
    if (pObj.founded) return { eligible: false, alreadyFounded: true, reason: 'ยอดเขานี้ก่อตั้งแล้ว' };

    if (SECT.ELDER_STATUS) SECT.ELDER_STATUS.evaluateElderAscensions(W, { quiet: true });

    const def = PEAKS.PEAK_DEFS[peakId];
    const candidates = (W.npcs || []).filter(n =>
      n && !n.dead && !n.exiled &&
      n.id !== W.sect.masterId &&
      n.cult && def.paths.includes(n.cult.path) &&
      (!n.peakId || n.peakId === peakId) &&
      !n.isIndependentFromPeak
    );

    const elders = candidates.filter(n => n.rank >= 4 || n.isElder);
    if (candidates.length < 4) {
      return {
        eligible: false,
        reason: 'ต้องการสมาชิกวิถี ' + def.paths.join('/') + ' อย่างน้อย 4 คน (ปัจจุบันมี ' + candidates.length + ' คน)',
        candidateCount: candidates.length,
        elderCount: elders.length
      };
    }
    if (elders.length < 1) {
      return {
        eligible: false,
        reason: 'ต้องมีผู้อาวุโส (rank >= 4 หรือสถานะผู้อาวุโส) อย่างน้อย 1 คนเพื่อขึ้นเป็นผู้นำยอดเขา',
        candidateCount: candidates.length,
        elderCount: 0
      };
    }

    // Sort elders for Peak Master, and remaining candidates for Deputy Peak Master + Members
    elders.sort((a, b) => (CULT.power(b) + (b.merit || 0) * 0.5) - (CULT.power(a) + (a.merit || 0) * 0.5));
    const masterCand = elders[0];
    const rest = candidates.filter(n => n.id !== masterCand.id).sort((a, b) => {
      const scB = CULT.power(b) * 0.6 + SECT.relationScore(masterCand, b) * 1.2 + (b.rank || 1) * 15;
      const scA = CULT.power(a) * 0.6 + SECT.relationScore(masterCand, a) * 1.2 + (a.rank || 1) * 15;
      return scB - scA;
    });

    if (rest.length < 3) {
      return {
        eligible: false,
        reason: 'ต้องการผู้นำยอดเขา 1 คน รองผู้นำ 1 คน และสมาชิกอีกอย่างน้อย 2 คน (รวม 4 คน)',
        candidateCount: candidates.length,
        elderCount: elders.length
      };
    }

    return {
      eligible: true,
      masterCandidate: masterCand,
      deputyCandidate: rest[0],
      memberCandidates: rest.slice(1),
      allCandidates: [masterCand, ...rest]
    };
  };

  PEAKS.derivePeakPolicyFromMaster = masterNpc => {
    if (!masterNpc || !masterNpc.h) {
      return {
        allocationRule: 'MERITOCRATIC',
        allocationRuleTh: 'เน้นผลงานและตบะ (Meritocratic)',
        strictness: 55,
        generosity: 60,
        exclusivityStance: 'COMPETITIVE'
      };
    }
    const integ = HC.eff(masterNpc, 'personality.integrity');
    const emp = HC.eff(masterNpc, 'personality.empathy');
    const rat = HC.eff(masterNpc, 'personality.rationality');
    const aggr = HC.eff(masterNpc, 'personality.aggression');
    const disc = HC.eff(masterNpc, 'personality.discipline');

    let allocationRule = 'MERITOCRATIC';
    let allocationRuleTh = 'จัดสรรตามผลงานและตบะอย่างเที่ยงธรรม';
    if (integ < 44 || (HC.eff(masterNpc, 'values.familyClan') >= 68 && integ < 55)) {
      allocationRule = 'NEPOTISTIC_INNER_CIRCLE';
      allocationRuleTh = 'เน้นแจกจ่ายคนสนิท ศิษย์สายตรง และรองผู้นำก่อน';
    } else if (emp >= 62 && rat < 65) {
      allocationRule = 'EGALITARIAN';
      allocationRuleTh = 'แบ่งปันเท่าเทียมและช่วยเหลือศิษย์ที่ขาดแคลนก่อน';
    }

    const exclusivityStance = aggr >= 64 ? 'HOSTILE_FEUD' : emp >= 62 ? 'HARMONIOUS' : 'COMPETITIVE';
    return {
      allocationRule,
      allocationRuleTh,
      strictness: Math.round(disc),
      generosity: Math.round(emp * 0.6 + (100 - HC.eff(masterNpc, 'values.wealthResource')) * 0.4),
      exclusivityStance
    };
  };

  PEAKS.foundPeak = (W, peakId, masterOrOpts, maybeOpts) => {
    peakId = PEAKS.resolvePeakId(peakId);
    let opts = (typeof masterOrOpts === 'string') ? Object.assign({ masterId: masterOrOpts }, maybeOpts || {}) : (masterOrOpts || {});
    const pk = PEAKS.ensure(W);
    if (!pk || !pk.byId[peakId]) return { ok: false, reason: 'invalid-peak' };
    const pObj = pk.byId[peakId];
    if (pObj.founded) return { ok: true, alreadyFounded: true, peak: pObj };

    let check = PEAKS.checkFoundingEligibility(W, peakId);
    if (!check.eligible && opts.allowDecree) {
      const def = PEAKS.PEAK_DEFS[peakId];
      const pool = (W.npcs || []).filter(n => n && !n.dead && !n.exiled && n.id !== W.sect.masterId);
      const pathMatched = pool.filter(n => n.cult && def.paths.includes(n.cult.path) && (!n.peakId || n.peakId === peakId));
      const usePool = pathMatched.length >= 1 ? pathMatched : pool.filter(n => !n.peakId || n.peakId === peakId);
      const finalPool = usePool.length ? usePool : pool;
      if (finalPool.length >= 1) {
        finalPool.sort((a, b) => ((b.rank || 1) * 20 + (CULT.power ? CULT.power(b) : 50)) - ((a.rank || 1) * 20 + (CULT.power ? CULT.power(a) : 50)));
        const mCand = (opts.masterId && W.byId[opts.masterId]) || finalPool[0];
        const restPool = finalPool.filter(n => n.id !== mCand.id);
        const dCand = (opts.deputyId && W.byId[opts.deputyId]) || restPool[0] || mCand;
        const memCands = restPool.slice(dCand.id === mCand.id ? 0 : 1, 6);
        check = {
          eligible: true,
          byDecree: true,
          masterCandidate: mCand,
          deputyCandidate: dCand,
          memberCandidates: memCands,
          allCandidates: Array.from(new Set([mCand, dCand, ...memCands]))
        };
      }
    }
    if (!check.eligible) return { ok: false, reason: check.reason, check };

    const master = check.masterCandidate;
    const deputy = check.deputyCandidate;
    const members = check.allCandidates;

    pObj.founded = true;
    pObj.foundedDay = W.day || 360;
    pObj.foundedAtT = W.t || 0;
    if (g.MAP && g.MAP.syncPeakSanctuaries) g.MAP.syncPeakSanctuaries(W);
    pObj.masterId = master.id;
    pObj.masterNameTh = HC.fullName(master);
    pObj.deputyId = deputy.id;
    pObj.deputyNameTh = HC.fullName(deputy);
    pObj.memberIds = members.map(m => m.id);
    pObj.treasuryStones = 150;
    pObj.pillReserve = 6;
    pObj.prestige = 65;
    pObj.policy = PEAKS.derivePeakPolicyFromMaster(master);

    // Assign Peak roles and ensure Peak Master has Elder status & Deputy-Sect-Master equivalent standing
    SECT.ELDER_STATUS.conferElderStatus(W, master, 'ขึ้นดำรงตำแหน่งเจ้า' + pObj.nameTh, { quiet: true });
    master.peakId = peakId;
    master.peakNameTh = pObj.nameTh;
    master.peakRole = 'MASTER';
    master.effectiveRankEquivalent = 5; // Status equal to Deputy Sect Master!
    master.isIndependentFromPeak = false;
    master.sat = clamp((master.sat || 70) + 18, 0, 100);

    deputy.peakId = peakId;
    deputy.peakNameTh = pObj.nameTh;
    deputy.peakRole = 'DEPUTY';
    deputy.isIndependentFromPeak = false;
    deputy.sat = clamp((deputy.sat || 65) + 12, 0, 100);

    check.memberCandidates.forEach(m => {
      m.peakId = peakId;
      m.peakNameTh = pObj.nameTh;
      m.peakRole = 'MEMBER';
      m.isIndependentFromPeak = false;
      m.sat = clamp((m.sat || 65) + 8, 0, 100);
    });

    // Build initial fellowship bonds among founding members of the Peak, and apply RIVAL_PEAK_PREJUDICE toward feuding Peaks
    for (let i = 0; i < members.length; i++) {
      for (let j = i + 1; j < members.length; j++) {
        SECT.SOCIAL_MATRIX.applyActionModifier(W, members[i], members[j], 'SAME_PEAK_DAILY_PRACTICE', {
          customReasonTh: 'ร่วมก่อตั้งและสังกัด「' + pObj.nameTh + '」ด้วยกัน'
        });
      }
      // Check other founded peaks that are in a feud (ipScore <= -15)
      PEAKS.PEAK_IDS.forEach(otherPid => {
        if (otherPid === peakId || !pk.byId[otherPid] || !pk.byId[otherPid].founded) return;
        const ip = PEAKS.getInterPeakScore(W, peakId, otherPid);
        if (ip <= -15) {
          (pk.byId[otherPid].memberIds || []).forEach(omId => {
            const om = W.byId[omId];
            if (om && !om.dead) {
              SECT.SOCIAL_MATRIX.applyActionModifier(W, members[i], om, 'RIVAL_PEAK_PREJUDICE', { scale: 1.2 });
            }
          });
        }
      });
    }

    const chron = (g.EXPED && g.EXPED.recordChronicle) ? g.EXPED.recordChronicle(W, {
      category: 'SECT_PEAK_POLITICS',
      reportFormat: 'PEAK_HALL_SCROLL',
      icon: pObj.icon || '🏔️',
      involvedSects: [W.sect.name],
      involvedFigures: [HC.fullName(master), HC.fullName(deputy)],
      npcIds: members.map(m => m.id),
      titleTh: 'สถาปนายอดเขาใหม่ในสำนัก: เปิด「' + pObj.nameTh + '」นำโดยเจ้าหุบเขา「' + HC.fullName(master) + '」!',
      storyTh: 'เมื่อผู้ฝึกตนวิถี (' + pObj.paths.join('/') + ') ในสำนักรวมตัวกันครบ ' + members.length + ' คน ผู้อาวุโส「' + HC.fullName(master) + '」จึงได้รับตราตั้งขึ้นเป็นผู้นำ「' + pObj.nameTh + '」(มีศักดิ์เทียบเท่ารองเจ้าสำนัก) โดยมี「' + HC.fullName(deputy) + '」เป็นรองผู้นำยอดเขา และประกาศใช้นโยบาย「' + pObj.policy.allocationRuleTh + '」!',
      originCauseTh: 'สมาชิกวิถี ' + pObj.paths.join('/') + ' มีจำนวนครบเกณฑ์ (' + members.length + ' คน) และมีผู้อาวุโสพร้อมขึ้นนำยอดเขา',
      actorChainTh: 'ผู้นำยอดเขา: ' + HC.fullName(master) + ' ➔ รองผู้นำ: ' + HC.fullName(deputy) + ' ➔ สมาชิก: ' + check.memberCandidates.map(m => HC.fullName(m)).join(', '),
      systemImpactTh: 'เชื่อมโยง SECT.PEAKS ➔ แสดงยอดเขาในหน้า UI ➔ สิทธิ์โหวตศิษย์สืบทอดเทียบเท่ารองเจ้าสำนัก (2.5) ➔ การจัดสรรทรัพยากรหุบเขา',
      consequenceTh: 'เปิดแสดงผล「' + pObj.nameTh + '」(' + members.length + ' สมาชิก) · นโยบาย: ' + pObj.policy.allocationRuleTh,
      quiet: opts.quiet
    }) : null;

    if (SECT.recordTimelineMilestone) {
      SECT.recordTimelineMilestone(W, {
        milestoneType: 'FOUNDING',
        icon: pObj.icon || '🏔️',
        titleTh: 'สถาปนา「' + pObj.nameTh + '」นำโดย ' + HC.fullName(master),
        descTh: 'รองรับวิถี ' + pObj.paths.join('/') + ' · สมาชิกเริ่มต้น ' + members.length + ' คน',
        involvedIds: members.map(m => m.id),
        quiet: true
      });
    }

    return { ok: true, peak: pObj, master, deputy, members, chronicle: chron };
  };

  // NPC Decision Engine: Each NPC decides whether to join a founded Peak of their path or remain an Independent Cultivator!
  PEAKS.evaluatePeakAffiliationForNpc = (W, npc, opts) => {
    opts = opts || {};
    if (!W || !npc || npc.dead || npc.exiled || !npc.cult || npc.id === W.sect.masterId) {
      return { ok: false, reason: 'ineligible' };
    }
    const pk = PEAKS.ensure(W);
    const targetPeakId = PEAKS.peakIdForPath(npc.cult.path);
    const pObj = targetPeakId ? pk.byId[targetPeakId] : null;

    if (!pObj || !pObj.founded) {
      // Peak for this NPC's path is not founded yet -> NPC remains unaffiliated and feels the drawback if low stage
      return PEAKS.applyIndependentDrawback(W, npc, 'ยอดเขาประจำวิถียังไม่ถูกสถาปนา');
    }

    if (npc.peakId === pObj.id && (npc.peakRole === 'MASTER' || npc.peakRole === 'DEPUTY')) {
      return { ok: true, status: 'PEAK_LEADER', peakId: pObj.id };
    }

    const master = pObj.masterId ? W.byId[pObj.masterId] : null;
    const relToMaster = master ? SECT.relationScore(npc, master) : 0;
    const freedom = HC.eff(npc, 'values.freedom');
    const discipline = HC.eff(npc, 'personality.discipline');
    const ambition = HC.eff(npc, 'personality.ambition');
    const stage = npc.cult.stage || 1;

    // Weigh Benefits of Joining Peak vs. Desire for Independence
    // Drawbacks of being independent: no monthly Peak stipend/pills, -12% cultivation speed aura, no political backing
    const resourceNeed = (npc.inv && (npc.inv.stones || 0) < 40) ? 22 : 8;
    const joinScore = (
      20 +
      resourceNeed +
      (ambition - 45) * 0.35 +
      (discipline - 45) * 0.30 +
      relToMaster * 0.55 -
      Math.max(0, freedom - 62) * 0.85 -
      (pObj.policy.strictness > 70 && freedom > 58 ? 18 : 0) +
      (opts.forceJoin ? 80 : opts.forceIndependent ? -90 : 0)
    );

    if (joinScore >= 12) {
      npc.peakId = pObj.id;
      npc.peakNameTh = pObj.nameTh;
      if (!npc.peakRole) npc.peakRole = 'MEMBER';
      npc.isIndependentFromPeak = false;
      npc.independentPenaltyMult = 1.0;
      if (!pObj.memberIds.includes(npc.id)) pObj.memberIds.push(npc.id);
      return { ok: true, decision: 'JOIN_PEAK', peakId: pObj.id, peakNameTh: pObj.nameTh, joinScore: Math.round(joinScore) };
    } else {
      // NPC chooses to be an Independent Cultivator! Remove from peak if previously a regular member
      if (npc.peakId === pObj.id && npc.peakRole === 'MEMBER') {
        pObj.memberIds = pObj.memberIds.filter(id => id !== npc.id);
      }
      npc.peakId = null;
      npc.peakNameTh = null;
      npc.peakRole = null;
      npc.isIndependentFromPeak = true;
      return PEAKS.applyIndependentDrawback(W, npc, 'เลือกวิถีอิสระไม่สังกัด「' + pObj.nameTh + '」(รักอิสระ ' + Math.round(freedom) + ')');
    }
  };

  PEAKS.applyIndependentDrawback = (W, npc, whyTh) => {
    if (!npc) return { ok: false };
    npc.isIndependentFromPeak = true;
    // Concrete Drawbacks of Unaffiliated/Independent Status:
    // 1. No Peak Cultivation Array Aura (-12% relative cultivation efficiency)
    // 2. No Peak Resource Stipend or Pill Distribution
    // 3. No Peak Master political backing in promotions/elections
    // 4. Higher social isolation / stress if stage <= 3
    npc.independentPenaltyMult = 0.88;
    npc.independentDrawbackSummaryTh = 'ไร้สังกัดยอดเขา (' + (whyTh || 'อิสระ') + '): ไม่ได้รับงบ/โอสถจัดสรรจากยอดเขา · ขาดค่ายกลปราณยอดเขาหนุนตบะ (-12%) · ไร้เสียงหนุนหลังทางการเมืองในสภา';
    if (npc.h && npc.h.state && (!npc.cult || npc.cult.stage <= 3)) {
      npc.h.state.loneliness = clamp((npc.h.state.loneliness || 20) + 4, 0, 100);
    }
    return {
      ok: true,
      decision: 'REMAIN_INDEPENDENT',
      penaltyMult: npc.independentPenaltyMult,
      drawbackSummaryTh: npc.independentDrawbackSummaryTh
    };
  };

  // Two-Tier Resource Allocation:
  // Step 1: Central Sect (Sect Master & Treasurer) allocates stones & pills to each Founded Peak
  // Step 2: Each Peak Master distributes those resources to members of their Peak according to Peak Policy!
  PEAKS.allocateCentralResourcesToPeaks = (W, opts) => {
    opts = opts || {};
    const pk = PEAKS.ensure(W);
    if (!pk) return { ok: false, reason: 'no-peaks' };
    const foundedPeaks = PEAKS.getVisibleFoundedPeaks(W);
    if (!foundedPeaks.length) return { ok: false, reason: 'no-founded-peaks' };

    const master = (W.sect.masterId && W.byId[W.sect.masterId]) || (W.npcs && W.npcs[0]);
    const masterInteg = master ? HC.eff(master, 'personality.integrity') : 60;
    const merPolicy = (W.sect.policy && W.sect.policy.meritocracy) || 55;
    const isFairCentral = (masterInteg * 0.5 + merPolicy * 0.5) >= 52;

    const available = Math.max(0, (W.sect && W.sect.stones) || 0);
    if (available <= 0 && !opts.poolStones) {
      return { ok: false, reason: 'insufficient-treasury', distributedTotal: 0, allocations: [], isFairCentral };
    }

    let totalPoolStones = opts.poolStones != null ? opts.poolStones : Math.min(360, Math.round(available * 0.18));
    totalPoolStones = Math.min(totalPoolStones, available);
    if (totalPoolStones <= 0) {
      return { ok: false, reason: 'insufficient-treasury', distributedTotal: 0, allocations: [], isFairCentral };
    }

    const allocations = [];

    // Compute weights per founded peak
    let weightSum = 0;
    const weights = foundedPeaks.map(pObj => {
      const pMaster = pObj.masterId ? W.byId[pObj.masterId] : null;
      const memberCount = (pObj.memberIds || []).filter(id => W.byId[id] && !W.byId[id].dead && !W.byId[id].exiled).length;
      let w = Math.max(1, memberCount) * 15 + (pObj.prestige || 50) * 0.5 * (pObj.budgetMultiplier || 1.0);
      let biasNoteTh = 'จัดสรรตามสัดส่วนสมาชิกและผลงาน';
      if (!isFairCentral && master && pMaster) {
        const rel = SECT.relationScore(master, pMaster);
        const samePath = master.cult && pObj.paths.includes(master.cult.path);
        if (samePath || rel >= 25) {
          w *= 1.45;
          biasNoteTh = 'เจ้าสำนักลำเอียงหนุนยอดเขาคนสนิท/สายเดียวกัน (+45%)';
        } else if (rel < 0) {
          w *= 0.65;
          biasNoteTh = 'ถูกส่วนกลางตัดงบเพราะผู้นำยอดเขาไม่ลงรอยกับเจ้าสำนัก (-35%)';
        }
      }
      weightSum += w;
      return { pObj, pMaster, w, biasNoteTh };
    });

    let distributedSum = 0;
    weights.forEach(({ pObj, pMaster, w, biasNoteTh }, idx) => {
      const isLast = idx === weights.length - 1;
      let shareStones = isLast ? Math.max(0, totalPoolStones - distributedSum) : Math.floor(totalPoolStones * (w / Math.max(1, weightSum)));
      shareStones = Math.min(shareStones, Math.max(0, totalPoolStones - distributedSum));
      distributedSum += shareStones;

      const desiredPills = Math.max(0, Math.floor(shareStones / 35));
      let sharePills = 0;
      if (desiredPills > 0 && W.sect && W.sect.stock) {
        const pillKey = (W.sect.stock['P:BASIC_QI'] || 0) > 0 ? 'P:BASIC_QI' : Object.keys(W.sect.stock).find(k => ECO.isPill(k) && W.sect.stock[k] > 0);
        if (pillKey) {
          const takeAmt = Math.min(desiredPills, W.sect.stock[pillKey] || 0);
          if (takeAmt > 0 && ECO.take(W, pillKey, takeAmt)) sharePills = takeAmt;
        }
      }
      pObj.treasuryStones = (pObj.treasuryStones || 0) + shareStones;
      pObj.pillReserve = (pObj.pillReserve || 0) + sharePills;

      // Relationship impact between Peak Master and Sect Master
      if (master && pMaster && master.id !== pMaster.id) {
        if (biasNoteTh.includes('ตัดงบ')) {
          SECT.SOCIAL_MATRIX.applyActionModifier(W, pMaster, master, 'CENTRAL_TO_PEAK_SNUB');
        } else {
          SECT.SOCIAL_MATRIX.applyActionModifier(W, pMaster, master, 'CENTRAL_TO_PEAK_FAVOR', { scale: 0.6 });
        }
      }

      // Step 2: Peak Master distributes resources to Peak members according to Peak Policy!
      const distRes = PEAKS.distributePeakResourcesToMembers(W, pObj.id, { quiet: true });
      allocations.push({
        peakId: pObj.id,
        peakNameTh: pObj.nameTh,
        masterNameTh: pObj.masterNameTh,
        shareStones,
        sharePills,
        biasNoteTh,
        memberDistribution: distRes
      });
    });

    // Debit actual distributed stones from central treasury
    if (distributedSum > 0) {
      if (ECO && ECO.pay) {
        ECO.pay(W, distributedSum, 'จัดสรรงบประมาณสู่หุบเขายอดเขา');
      } else {
        W.sect.stones = Math.max(0, (W.sect.stones || 0) - distributedSum);
      }
    }

    const rec = {
      day: W.day || 360,
      isFairCentral,
      totalPoolStones: distributedSum,
      allocations
    };
    pk.allocationHistory.unshift(rec);
    if (pk.allocationHistory.length > 20) pk.allocationHistory.length = 20;

    const chron = (g.EXPED && g.EXPED.recordChronicle) ? g.EXPED.recordChronicle(W, {
      category: 'SECT_PEAK_POLITICS',
      reportFormat: 'PEAK_HALL_SCROLL',
      icon: '🏔️',
      involvedSects: [W.sect.name],
      involvedFigures: allocations.map(a => a.masterNameTh).filter(Boolean),
      titleTh: 'ส่วนกลางจัดสรรทรัพยากรสู่ ' + foundedPeaks.length + ' ยอดเขา (' + (isFairCentral ? 'ตามผลงานเที่ยงธรรม' : 'ตามความสนิทเจ้าสำนัก') + ')!',
      storyTh: allocations.map(a => '「' + a.peakNameTh + '」รับ ' + a.shareStones + ' ศิลา & โอสถ ' + a.sharePills + ' เม็ด (' + a.biasNoteTh + ') ➔ เจ้าหุบเขา ' + a.masterNameTh + ' แจกจ่ายลูกศิษย์ตามหลัก「' + (a.memberDistribution && a.memberDistribution.ruleTh ? a.memberDistribution.ruleTh : 'ผลงาน') + '」').join(' · '),
      originCauseTh: 'รอบการจัดสรรงบประมาณรายเดือนจากหอคลังส่วนกลางสู่ยอดเขาทั้ง ' + foundedPeaks.length + ' แห่ง',
      actorChainTh: 'ส่วนกลาง (' + (master ? HC.fullName(master) : 'เจ้าสำนัก') + ') ➔ ผู้นำยอดเขา ➔ สมาชิกในแต่ละยอดเขา (ศิษย์อิสระไม่ได้รับส่วนแบ่งนี้)',
      systemImpactTh: 'เชื่อมโยง คลังส่วนกลาง ➔ คลังยอดเขา (SECT.PEAKS) ➔ ความสัมพันธ์ผู้นำยอดเขากับลูกศิษย์ (SOCIAL_MATRIX)',
      consequenceTh: 'กระจายศิลารวม ' + distributedSum + ' ก้อนสู่สมาชิกยอดเขา',
      quiet: opts.quiet
    }) : null;

    return { ok: true, distributedTotal: distributedSum, allocations, isFairCentral, chronicle: chron };
  };

  PEAKS.distributePeakResourcesToMembers = (W, peakId, opts) => {
    opts = opts || {};
    const pk = PEAKS.ensure(W);
    const pObj = pk && pk.byId[peakId];
    if (!pObj || !pObj.founded) return { ok: false, reason: 'peak-not-founded' };

    const master = pObj.masterId ? W.byId[pObj.masterId] : null;
    if (!pObj.policyLocked) {
      pObj.policy = PEAKS.derivePeakPolicyFromMaster(master);
    }
    const rule = (pObj.policy && pObj.policy.allocationRule) || 'MERITOCRATIC';
    const members = (pObj.memberIds || []).map(id => W.byId[id]).filter(n => n && !n.dead && !n.exiled);
    if (!members.length) return { ok: false, reason: 'no-members' };

    const availableTreasury = Math.max(0, pObj.treasuryStones || 0);

    // Sort recipients based on Peak Master's policy
    const sorted = members.slice().sort((a, b) => {
      if (rule === 'NEPOTISTIC_INNER_CIRCLE' && master) {
        const score = n => (n.id === pObj.deputyId ? 45 : 0) + (n.mentorId === master.id ? 50 : 0) + SECT.relationScore(master, n) * 1.5;
        return score(b) - score(a);
      }
      if (rule === 'EGALITARIAN') {
        const need = n => (100 - ((n.inv && n.inv.stones) || 0)) + ((n.cult && n.cult.stage) ? (10 - n.cult.stage) * 12 : 30);
        return need(b) - need(a);
      }
      if (rule === 'REALM_PRIORITY') {
        const rScore = n => ((n.cult && n.cult.stage) || 1) * 35 + ((n.cult && n.cult.bn) ? 45 : 0) + (CULT.power ? CULT.power(n) * 0.25 : 10);
        return rScore(b) - rScore(a);
      }
      // MERITOCRATIC default
      const mer = n => (n.merit || 0) * 0.8 + (CULT.power ? CULT.power(n) * 0.2 : 20) + (n.rank || 1) * 15;
      return mer(b) - mer(a);
    });

    const recipients = [];
    const passedOver = [];
    const stonesPerMember = Math.floor(availableTreasury / Math.max(1, members.length));
    let remainingBudget = availableTreasury;

    sorted.forEach((m, idx) => {
      const isFavored = rule !== 'NEPOTISTIC_INNER_CIRCLE' || idx < Math.max(2, Math.ceil(sorted.length * 0.6));
      if (isFavored && remainingBudget > 0) {
        let gainStones = rule === 'NEPOTISTIC_INNER_CIRCLE' ? Math.round(stonesPerMember * 1.4) : stonesPerMember;
        gainStones = Math.min(gainStones, remainingBudget);
        if (gainStones > 0) {
          if (m.inv) m.inv.stones = (m.inv.stones || 0) + gainStones;
          remainingBudget -= gainStones;
        }
        if (ECO && ECO.addPersonalPill && idx < 2 && (pObj.pillReserve || 0) > 0) {
          ECO.addPersonalPill(m, 'P:BASIC_QI', 1.05, 1);
          pObj.pillReserve = Math.max(0, (pObj.pillReserve || 0) - 1);
        }
        if (master && m.id !== master.id) {
          SECT.SOCIAL_MATRIX.applyActionModifier(W, m, master, 'PEAK_RESOURCE_BESTOWAL', { scale: 0.7 });
        }
        recipients.push({ npcId: m.id, nameTh: HC.fullName(m), stones: gainStones });
      } else {
        passedOver.push({ npcId: m.id, nameTh: HC.fullName(m) });
        if (master && m.id !== master.id) {
          SECT.SOCIAL_MATRIX.applyActionModifier(W, m, master, 'PEAK_NEPOTISM_PASSED_OVER', { scale: 0.7 });
        }
      }
    });

    pObj.treasuryStones = remainingBudget;
    return {
      ok: true,
      rule,
      ruleTh: pObj.policy.allocationRuleTh,
      recipients,
      passedOver
    };
  };

  // Inter-Peak Grand Martial & Dao Tournament (การประลองระหว่างยอดเขาในสำนัก)
  PEAKS.holdInterPeakTournament = (W, opts) => {
    opts = opts || {};
    const pk = PEAKS.ensure(W);
    if (!pk) return { ok: false, reason: 'no-peaks' };

    // Cooldown check: prevent tournament spamming on same day / within 30 days unless opts.force
    if (pk.lastTournamentDay != null && (W.day || 0) - pk.lastTournamentDay < 30 && !opts.force) {
      return { ok: false, reason: 'cooldown-active', lastTournamentDay: pk.lastTournamentDay };
    }

    let foundedPeaks = PEAKS.getVisibleFoundedPeaks(W);
    if (foundedPeaks.length < 2 && opts.autoFoundIfNeeded) {
      PEAKS.scanAndFoundEligiblePeaks(W, { quiet: true });
      foundedPeaks = PEAKS.getVisibleFoundedPeaks(W);
    }
    if (foundedPeaks.length < 2) {
      return { ok: false, reason: 'need-at-least-2-founded-peaks', count: foundedPeaks.length };
    }

    // Each founded Peak selects its strongest champion (excluding Peak Master if disciples are available, or best member)
    const contenders = foundedPeaks.map(pObj => {
      const members = (pObj.memberIds || []).map(id => W.byId[id]).filter(n => n && !n.dead && !n.exiled);
      const disciplesOnly = members.filter(n => n.id !== pObj.masterId);
      const pool = disciplesOnly.length ? disciplesOnly : members;
      pool.sort((a, b) => CULT.power(b) - CULT.power(a));
      const rep = pool[0] || members[0];
      const score = rep ? (CULT.power(rep) * (1 + (pObj.prestige || 50) / 500)) : 50;
      return { peak: pObj, rep, score };
    }).filter(c => c.rep);

    contenders.sort((a, b) => b.score - a.score);
    const winEntry = contenders[0];
    const runnerUp = contenders[1] || contenders[0];
    const champ = winEntry.rep;
    const winPeak = winEntry.peak;

    // Fund prizes strictly from central treasury without minting
    const totalPrizeTarget = 210;
    const availTreasury = Math.max(0, (W.sect && W.sect.stones) || 0);
    const prizeRatio = availTreasury >= totalPrizeTarget ? 1 : (availTreasury / totalPrizeTarget);
    const champStones = Math.round(90 * prizeRatio);
    const peakStones = Math.min(availTreasury - champStones, Math.round(120 * prizeRatio));
    const actualPaid = champStones + peakStones;
    if (actualPaid > 0) {
      if (ECO && ECO.pay) {
        ECO.pay(W, actualPaid, 'เงินรางวัลประลองยุทธ์ระหว่างยอดเขา');
      } else {
        W.sect.stones = Math.max(0, (W.sect.stones || 0) - actualPaid);
      }
    }

    // 1. Personal Rewards for the Winning Representative
    if (champ.inv) champ.inv.stones = (champ.inv.stones || 0) + champStones;
    if (ECO && ECO.addPersonalPill) ECO.addPersonalPill(champ, 'P:BASIC_QI', 1.15, 2);
    champ.cp = (champ.cp || 0) + 40;
    champ.merit = (champ.merit || 0) + 28;
    if (champ.cult) CULT.gain(champ, 55, W, 'inter_peak_tournament_champion');
    if (champ.h && champ.h.state) {
      champ.h.state.heartDemon = Math.max(0, (champ.h.state.heartDemon || 0) - 20);
      champ.h.state.mood = 100;
    }
    if (!Array.isArray(champ.assemblyTitles)) champ.assemblyTitles = [];
    const peakTitle = 'แชมป์ประลองยอดเขา (' + winPeak.shortTh + ')';
    if (!champ.assemblyTitles.includes(peakTitle)) champ.assemblyTitles.unshift(peakTitle);

    // 2. Peak Rewards for the Winning Peak
    winPeak.prestige = clamp((winPeak.prestige || 60) + 22, 0, 200);
    winPeak.budgetMultiplier = 1.25;
    winPeak.treasuryStones = (winPeak.treasuryStones || 0) + peakStones;
    (winPeak.memberIds || []).forEach(mid => {
      const m = W.byId[mid];
      if (m && !m.dead && m.cult) {
        CULT.gain(m, 20, W, 'winning_peak_aura');
        m.sat = clamp((m.sat || 70) + 10, 0, 100);
      }
    });

    // 3. Relationship & Inter-Peak Rivalry / Respect between Finalists
    if (runnerUp && runnerUp.rep && runnerUp.rep.id !== champ.id) {
      const aggr = HC.eff(champ, 'personality.aggression');
      if (aggr >= 70 && winPeak.policy.exclusivityStance === 'HOSTILE_FEUD') {
        SECT.SOCIAL_MATRIX.applyActionModifier(W, runnerUp.rep, champ, 'RUTHLESS_TOURNAMENT_INJURY');
        PEAKS.adjustInterPeakRelation(W, winPeak.id, runnerUp.peak.id, -18, 'ลงมือหนักในการประลองยอดเขา');
      } else {
        SECT.SOCIAL_MATRIX.applyActionModifier(W, champ, runnerUp.rep, 'HONORABLE_PEAK_SPAR');
        PEAKS.adjustInterPeakRelation(W, winPeak.id, runnerUp.peak.id, +8, 'ประลองแลกเปลี่ยนกระบวนท่าอย่างสมศักดิ์ศรี');
      }
    }

    pk.lastTournamentDay = W.day || 0;
    const tRec = {
      id: 'PKTOUR_' + (++pk.seq),
      day: W.day || 360,
      winnerPeakId: winPeak.id,
      winnerPeakNameTh: winPeak.nameTh,
      championId: champ.id,
      championNameTh: HC.fullName(champ),
      runnerUpPeakNameTh: runnerUp.peak.nameTh,
      runnerUpNameTh: HC.fullName(runnerUp.rep),
      participatingPeaksCount: foundedPeaks.length,
      summaryTh: '🏆 การประลองใหญ่ระหว่าง ' + foundedPeaks.length + ' ยอดเขา: 「' + HC.fullName(champ) + '」ตัวแทนจาก「' + winPeak.nameTh + '」เอาชนะ「' + HC.fullName(runnerUp.rep) + '」(' + runnerUp.peak.shortTh + ') คว้าแชมป์ไปครอง! รับรางวัลส่วนตัว (+90 ศิลา · +40 CP · +55 ตบะ) และส่งผลให้「' + winPeak.nameTh + '」ได้รับโควตางบส่วนกลางเพิ่มขึ้น +25% และปราณเร่งตบะทั้งยอดเขา!'
    };
    pk.tournamentHistory.unshift(tRec);
    if (pk.tournamentHistory.length > 15) pk.tournamentHistory.length = 15;

    const chron = (g.EXPED && g.EXPED.recordChronicle) ? g.EXPED.recordChronicle(W, {
      category: 'SECT_PEAK_POLITICS',
      reportFormat: 'PEAK_HALL_SCROLL',
      icon: '🏆',
      involvedSects: [W.sect.name],
      involvedFigures: [HC.fullName(champ), HC.fullName(runnerUp.rep)],
      npcIds: [champ.id, runnerUp.rep.id],
      titleTh: 'ศึกประลองชิงเจ้ายอดเขาสำนัก: 「' + HC.fullName(champ) + '」นำพา「' + winPeak.nameTh + '」คว้าชัยชนะอันดับหนึ่ง!',
      storyTh: tRec.summaryTh,
      originCauseTh: 'การแข่งขันวัดศักยภาพระหว่างยอดเขาที่ก่อตั้งแล้วทั้ง ' + foundedPeaks.length + ' แห่ง เพื่อชิงโควตาทรัพยากรส่วนกลางและเกียรติภูมิหุบเขา',
      actorChainTh: 'แชมป์: ' + HC.fullName(champ) + ' (' + winPeak.shortTh + ') vs รองแชมป์: ' + HC.fullName(runnerUp.rep) + ' (' + runnerUp.peak.shortTh + ')',
      systemImpactTh: 'เชื่อมโยง SECT.PEAKS ➔ รางวัลตัวแทน (+90 ศิลา, +40 CP, ฉายาแชมป์) ➔ รางวัลยอดเขา (งบส่วนกลาง +25%, Prestige +22) ➔ ความสัมพันธ์ข้ามยอดเขา (SOCIAL_MATRIX)',
      consequenceTh: winPeak.nameTh + ' ครองแชมป์ยอดเขา · โควตางบ +25% · สมาชิกทั้งยอดเขาตบะ +20',
      quiet: opts.quiet
    }) : null;

    return { ok: true, tournament: tRec, winnerPeak: winPeak, championPeakId: winPeak.id, champion: champ, runnerUp, chronicle: chron };
  };

  // Auto-scan and found any Peak that naturally meets the 3 conditions, or allow explicit founding
  PEAKS.scanAndFoundEligiblePeaks = (W, opts) => {
    opts = opts || {};
    const pk = PEAKS.ensure(W);
    if (!pk) return { ok: false, newlyFounded: [] };
    if (SECT.ELDER_STATUS) SECT.ELDER_STATUS.evaluateElderAscensions(W, { quiet: true });

    const newlyFounded = [];
    PEAKS.PEAK_IDS.forEach(pid => {
      const pObj = pk.byId[pid];
      if (!pObj || pObj.founded) return;
      const check = PEAKS.checkFoundingEligibility(W, pid);
      if (check.eligible) {
        const fRes = PEAKS.foundPeak(W, pid, { quiet: opts.quiet });
        if (fRes && fRes.ok && !fRes.alreadyFounded) {
          newlyFounded.push(fRes.peak);
        }
      }
    });

    // Update affiliations for all disciples
    (W.npcs || []).forEach(n => {
      if (n && !n.dead && !n.exiled && n.cult && n.id !== W.sect.masterId) {
        PEAKS.evaluatePeakAffiliationForNpc(W, n, { quiet: true });
      }
    });

    return { ok: true, newlyFounded, foundedCount: PEAKS.getVisibleFoundedPeaks(W).length };
  };

  PEAKS.POLICY_RULES = Object.freeze({
    MERITOCRATIC: { id: 'MERITOCRATIC', nameTh: 'จัดสรรตามผลงานและตบะอย่างเที่ยงธรรม' },
    REALM_PRIORITY: { id: 'REALM_PRIORITY', nameTh: 'เน้นขั้นพลังและผู้เตรียมทะลวงคอขวดก่อน' },
    EGALITARIAN: { id: 'EGALITARIAN', nameTh: 'แบ่งปันเท่าเทียมและช่วยเหลือศิษย์ที่ขาดแคลนก่อน' },
    NEPOTISTIC_INNER_CIRCLE: { id: 'NEPOTISTIC_INNER_CIRCLE', nameTh: 'เน้นแจกจ่ายคนสนิท ศิษย์สายตรง และรองผู้นำก่อน' }
  });

  PEAKS.setPeakPolicy = (W, peakId, allocationRule, opts) => {
    opts = opts || {};
    const pk = PEAKS.ensure(W);
    const pObj = pk && pk.byId[peakId];
    if (!pObj) return { ok: false, reason: 'invalid-peak' };
    const spec = PEAKS.POLICY_RULES[allocationRule] || PEAKS.POLICY_RULES.MERITOCRATIC;
    pObj.policy = pObj.policy || {};
    pObj.policy.allocationRule = spec.id;
    pObj.policy.allocationRuleTh = spec.nameTh;
    pObj.policyLocked = !opts.fromDerive;
    if (!opts.quiet && W.log) {
      W.log('decision', '⛰️ ปรับนโยบายจัดสรรทรัพยากรของ「' + pObj.nameTh + '」เป็น: ' + spec.nameTh, pObj.masterId ? [pObj.masterId] : []);
    }
    return { ok: true, peakId: pObj.id, policy: pObj.policy };
  };

  PEAKS.appointPeakLeader = (W, peakId, role, npcOrId, opts) => {
    if (typeof role === 'string' && !['MASTER', 'DEPUTY'].includes(role.toUpperCase()) && typeof npcOrId === 'string' && ['MASTER', 'DEPUTY'].includes(npcOrId.toUpperCase())) {
      const tmp = role; role = npcOrId; npcOrId = tmp;
    } else if (role && typeof role === 'object' && role.id) {
      const tmp = role; role = npcOrId || 'MASTER'; npcOrId = tmp;
    }
    opts = opts || {};
    const pk = PEAKS.ensure(W);
    const pObj = pk && pk.byId[peakId];
    if (!pObj) return { ok: false, reason: 'invalid-peak' };
    const roleKey = String(role || 'MASTER').toUpperCase() === 'DEPUTY' ? 'DEPUTY' : 'MASTER';
    let target = typeof npcOrId === 'object' && npcOrId ? npcOrId : (npcOrId && W.byId && W.byId[npcOrId]);
    if (!target) {
      const def = PEAKS.PEAK_DEFS[peakId];
      const cands = (W.npcs || []).filter(n => n && !n.dead && !n.exiled && n.id !== W.sect.masterId && n.id !== (roleKey === 'DEPUTY' ? pObj.masterId : pObj.deputyId));
      cands.sort((a, b) => {
        const pathMatchA = (a.cult && def.paths.includes(a.cult.path)) ? 45 : 0;
        const pathMatchB = (b.cult && def.paths.includes(b.cult.path)) ? 45 : 0;
        return (pathMatchB + (b.rank || 1) * 18 + (CULT.power ? CULT.power(b) : 50)) - (pathMatchA + (a.rank || 1) * 18 + (CULT.power ? CULT.power(a) : 50));
      });
      target = cands[0];
    }
    if (!target || target.dead || target.exiled) return { ok: false, reason: 'no-eligible-candidate' };

    if (!pObj.founded) {
      PEAKS.foundPeak(W, peakId, { allowDecree: true, masterId: roleKey === 'MASTER' ? target.id : null, deputyId: roleKey === 'DEPUTY' ? target.id : null, quiet: true });
    }

    // Remove target from previous peak if different
    if (target.peakId && target.peakId !== peakId && pk.byId[target.peakId]) {
      const oldPeak = pk.byId[target.peakId];
      oldPeak.memberIds = (oldPeak.memberIds || []).filter(id => id !== target.id);
      if (oldPeak.masterId === target.id) { oldPeak.masterId = null; oldPeak.masterNameTh = null; }
      if (oldPeak.deputyId === target.id) { oldPeak.deputyId = null; oldPeak.deputyNameTh = null; }
    }

    if (roleKey === 'MASTER') {
      const prevMaster = pObj.masterId && W.byId[pObj.masterId];
      if (prevMaster && prevMaster.id !== target.id) {
        prevMaster.peakRole = 'MEMBER';
      }
      if (SECT.ELDER_STATUS && SECT.ELDER_STATUS.conferElderStatus) {
        SECT.ELDER_STATUS.conferElderStatus(W, target, 'ขึ้นดำรงตำแหน่งเจ้า' + pObj.nameTh, { quiet: true });
      }
      target.isElder = true;
      if ((target.rank || 1) < 4) target.rank = 4;
      target.effectiveRankEquivalent = 5;
      pObj.masterId = target.id;
      pObj.masterNameTh = HC.fullName(target);
      if (pObj.deputyId === target.id) { pObj.deputyId = null; pObj.deputyNameTh = null; }
      if (!pObj.policyLocked) pObj.policy = PEAKS.derivePeakPolicyFromMaster(target);
    } else {
      const prevDep = pObj.deputyId && W.byId[pObj.deputyId];
      if (prevDep && prevDep.id !== target.id) {
        prevDep.peakRole = 'MEMBER';
      }
      if ((target.rank || 1) < 3) target.rank = 3;
      pObj.deputyId = target.id;
      pObj.deputyNameTh = HC.fullName(target);
    }

    target.peakId = peakId;
    target.peakNameTh = pObj.nameTh;
    target.peakRole = roleKey;
    target.isIndependentFromPeak = false;
    target.independentPenaltyMult = 1.0;
    target.sat = clamp((target.sat || 65) + 15, 0, 100);
    if (!pObj.memberIds.includes(target.id)) pObj.memberIds.push(target.id);
    if (g.SIM && g.SIM.snapshotPerson) g.SIM.snapshotPerson(W, target);

    const roleTitleTh = roleKey === 'MASTER' ? ('ประธาน' + pObj.nameTh + ' (ศักดิ์เทียบเท่ารองเจ้าสำนัก)') : ('รองประธาน' + pObj.nameTh);
    if (!opts.quiet && W.log) {
      W.log('appoint', '⛰️ แต่งตั้ง「' + HC.fullName(target) + '」ขึ้นดำรงตำแหน่ง' + roleTitleTh, [target.id]);
    }
    const chron = (g.EXPED && g.EXPED.recordChronicle) ? g.EXPED.recordChronicle(W, {
      category: 'SECT_PEAK_POLITICS',
      reportFormat: 'PEAK_HALL_SCROLL',
      icon: pObj.icon || '⛰️',
      involvedSects: [W.sect.name],
      involvedFigures: [HC.fullName(target)],
      npcIds: [target.id],
      titleTh: 'สถาปนาผู้นำหุบเขา: 「' + HC.fullName(target) + '」ขึ้นดำรงตำแหน่ง' + roleTitleTh,
      storyTh: 'เจ้าสำนักมอบตราหยกประจำหุบเขาแต่งตั้งให้「' + HC.fullName(target) + '」ขึ้นดำรงตำแหน่ง' + roleTitleTh + ' เพื่อกำกับดูแลศิษย์สาย ' + pObj.paths.join('/') + ' และบริหารทรัพยากรประจำยอดเขา',
      originCauseTh: 'การจัดระเบียบสายปกครองของ「' + pObj.nameTh + '」ตามระดับตบะและบารมี',
      actorChainTh: 'เจ้าสำนัก ➔ แต่งตั้ง ' + HC.fullName(target) + ' (' + roleTitleTh + ')',
      systemImpactTh: 'เชื่อมโยง SECT.PEAKS (' + peakId + ') ➔ สิทธิ์โหวตสภา ➔ นโยบายจัดสรรทรัพยากรยอดเขา',
      directorInsightTh: 'ประธานยอดเขามีศักดิ์เทียบเท่ารองเจ้าสำนักและมีอิทธิพลโดยตรงต่อขวัญกำลังใจของศิษย์ในสังกัด',
      consequenceTh: HC.fullName(target) + ' ดำรงตำแหน่ง' + roleTitleTh,
      quiet: opts.quiet
    }) : null;

    return { ok: true, peak: pObj, role: roleKey, leader: target, chronicle: chron };
  };

  PEAKS.removePeakLeader = (W, peakId, role, opts) => {
    opts = opts || {};
    const pk = PEAKS.ensure(W);
    const pObj = pk && pk.byId[peakId];
    if (!pObj) return { ok: false, reason: 'invalid-peak' };
    const roleKey = String(role || 'MASTER').toUpperCase() === 'DEPUTY' ? 'DEPUTY' : 'MASTER';
    const holderId = roleKey === 'MASTER' ? pObj.masterId : pObj.deputyId;
    const holder = holderId ? W.byId[holderId] : null;
    if (roleKey === 'MASTER') {
      pObj.masterId = null;
      pObj.masterNameTh = null;
    } else {
      pObj.deputyId = null;
      pObj.deputyNameTh = null;
    }
    if (holder) {
      holder.peakRole = 'MEMBER';
      if (roleKey === 'MASTER') delete holder.effectiveRankEquivalent;
      holder.sat = clamp((holder.sat || 60) - 10, 0, 100);
      if (g.SIM && g.SIM.snapshotPerson) g.SIM.snapshotPerson(W, holder);
    }
    return { ok: true, peak: pObj, role: roleKey, removedNpc: holder };
  };

  PEAKS.transferDiscipleToPeak = (W, npcOrId, targetPeakId, opts) => {
    opts = opts || {};
    const pk = PEAKS.ensure(W);
    if (!pk) return { ok: false, reason: 'no-peaks' };
    const npc = typeof npcOrId === 'object' && npcOrId ? npcOrId : (npcOrId && W.byId && W.byId[npcOrId]);
    if (!npc || npc.dead || npc.exiled) return { ok: false, reason: 'invalid-npc' };

    if (!targetPeakId || targetPeakId === 'NONE' || targetPeakId === 'INDEPENDENT') {
      if (npc.peakId && pk.byId[npc.peakId]) {
        const oldP = pk.byId[npc.peakId];
        oldP.memberIds = (oldP.memberIds || []).filter(id => id !== npc.id);
        if (oldP.masterId === npc.id) { oldP.masterId = null; oldP.masterNameTh = null; }
        if (oldP.deputyId === npc.id) { oldP.deputyId = null; oldP.deputyNameTh = null; }
      }
      npc.peakId = null;
      npc.peakNameTh = null;
      npc.peakRole = null;
      PEAKS.applyIndependentDrawback(W, npc, 'แยกตัวเป็นศิษย์อิสระไร้สังกัดยอดเขา');
      if (g.SIM && g.SIM.snapshotPerson) g.SIM.snapshotPerson(W, npc);
      return { ok: true, npc, targetPeakId: null, status: 'INDEPENDENT' };
    }

    const pObj = pk.byId[targetPeakId];
    if (!pObj) return { ok: false, reason: 'invalid-peak' };
    if (!pObj.founded) {
      PEAKS.foundPeak(W, targetPeakId, { allowDecree: true, quiet: true });
    }

    const prevPeakId = npc.peakId;
    if (prevPeakId && prevPeakId !== targetPeakId && pk.byId[prevPeakId]) {
      const oldP = pk.byId[prevPeakId];
      oldP.memberIds = (oldP.memberIds || []).filter(id => id !== npc.id);
      if (oldP.masterId === npc.id) { oldP.masterId = null; oldP.masterNameTh = null; }
      if (oldP.deputyId === npc.id) { oldP.deputyId = null; oldP.deputyNameTh = null; }
    }

    npc.peakId = pObj.id;
    npc.peakNameTh = pObj.nameTh;
    if (!npc.peakRole || prevPeakId !== targetPeakId) {
      npc.peakRole = (pObj.masterId === npc.id) ? 'MASTER' : (pObj.deputyId === npc.id) ? 'DEPUTY' : 'MEMBER';
    }
    npc.isIndependentFromPeak = false;
    npc.independentPenaltyMult = 1.0;
    npc.independentDrawbackSummaryTh = null;
    npc.sat = clamp((npc.sat || 65) + 6, 0, 100);
    if (!pObj.memberIds.includes(npc.id)) pObj.memberIds.push(npc.id);

    const master = pObj.masterId ? W.byId[pObj.masterId] : null;
    if (master && master.id !== npc.id && SECT.SOCIAL_MATRIX) {
      SECT.SOCIAL_MATRIX.applyActionModifier(W, npc, master, 'SAME_PEAK_DAILY_PRACTICE', {
        customReasonTh: 'เข้าสังกัดและฝากตัวใน「' + pObj.nameTh + '」'
      });
    }
    if (g.SIM && g.SIM.snapshotPerson) g.SIM.snapshotPerson(W, npc);
    if (!opts.quiet && W.log) {
      W.log('decision', '⛰️ โยกย้าย「' + HC.fullName(npc) + '」เข้าสังกัด「' + pObj.nameTh + '」เรียบร้อยแล้ว (รับโบนัสค่ายกลปราณยอดเขา +14%)', [npc.id]);
    }
    return { ok: true, npc, peak: pObj, prevPeakId };
  };

  PEAKS.removeDiscipleFromPeak = (W, npcOrId, opts) => PEAKS.transferDiscipleToPeak(W, npcOrId, null, opts);

  PEAKS.autoAssignUnassignedDisciples = (W, opts) => {
    opts = opts || {};
    const pk = PEAKS.ensure(W);
    if (!pk) return { ok: false, assigned: [] };
    PEAKS.scanAndFoundEligiblePeaks(W, { quiet: true });
    let founded = PEAKS.getVisibleFoundedPeaks(W);
    if (!founded.length && opts.allowDecree !== false) {
      const archPath = (W.byId[W.sect.masterId] && W.byId[W.sect.masterId].cult && W.byId[W.sect.masterId].cult.path) || 'XIAN';
      const defaultPid = PEAKS.peakIdForPath(archPath) || 'PEAK_AZURE_SWORD';
      PEAKS.foundPeak(W, defaultPid, { allowDecree: true, quiet: true });
      founded = PEAKS.getVisibleFoundedPeaks(W);
    }
    const assigned = [];
    (W.npcs || []).forEach(n => {
      if (!n || n.dead || n.exiled || n.id === W.sect.masterId || n.peakId) return;
      const pathPid = n.cult ? PEAKS.peakIdForPath(n.cult.path) : null;
      let targetPeak = (pathPid && pk.byId[pathPid] && pk.byId[pathPid].founded) ? pk.byId[pathPid] : null;
      if (!targetPeak && pathPid && opts.allowDecree !== false) {
        const fRes = PEAKS.foundPeak(W, pathPid, { allowDecree: true, quiet: true });
        if (fRes && fRes.ok) targetPeak = pk.byId[pathPid];
      }
      if (!targetPeak && founded.length) targetPeak = founded[0];
      if (targetPeak) {
        const tRes = PEAKS.transferDiscipleToPeak(W, n, targetPeak.id, { quiet: true });
        if (tRes && tRes.ok) assigned.push({ npcId: n.id, nameTh: HC.fullName(n), peakId: targetPeak.id, peakNameTh: targetPeak.nameTh });
      }
    });
    return { ok: true, assignedCount: assigned.length, assigned };
  };

  PEAKS.holdJointPeakExchange = (W, peakAId, peakBId, opts) => {
    opts = opts || {};
    const pk = PEAKS.ensure(W);
    if (!pk) return { ok: false, reason: 'no-peaks' };
    const pA = pk.byId[peakAId];
    let pB = peakBId ? pk.byId[peakBId] : PEAKS.getVisibleFoundedPeaks(W).find(x => x.id !== peakAId);
    if (!pB) {
      const altId = PEAKS.PEAK_IDS.find(id => id !== peakAId);
      pB = pk.byId[altId];
    }
    if (!pA || !pB || pA.id === pB.id) return { ok: false, reason: 'invalid-peaks' };
    if (!pA.founded || !pB.founded) return { ok: false, reason: 'peak-not-founded' };

    const pairKey = [pA.id, pB.id].sort().join(':');
    pk.lastExchangeDays = pk.lastExchangeDays || {};
    const lastDay = pk.lastExchangeDays[pairKey];
    if (lastDay != null && (W.day || 0) - lastDay < 15 && !opts.force) {
      return { ok: false, reason: 'cooldown-active', lastDay };
    }
    pk.lastExchangeDays[pairKey] = W.day || 0;

    const nextScore = PEAKS.adjustInterPeakRelation(W, pA.id, pB.id, 14, 'แลกเปลี่ยนวิชายุทธ์และเชื่อมไมตรีระหว่างยอดเขา');
    const allMems = [].concat(pA.memberIds || [], pB.memberIds || []);
    allMems.forEach(id => {
      const m = W.byId[id];
      if (m && !m.dead && m.cult && CULT.gain) CULT.gain(m, 14, W, 'joint_peak_exchange');
    });
    const summaryTh = '🤝「' + pA.nameTh + '」และ「' + pB.nameTh + '」จัดพิธีแลกเปลี่ยนเคล็ดวิชาเชื่อมความสัมพันธ์ (+14 เป็น ' + nextScore + ') ศิษย์ทั้งสองยอดเขาได้รับตบะ +14';
    if (!opts.quiet && W.log) W.log('politics', summaryTh, []);
    return { ok: true, peakAId: pA.id, peakBId: pB.id, relationScore: nextScore, summaryTh };
  };

  PEAKS.tick = (W, opts) => {
    opts = opts || {};
    const pk = PEAKS.ensure(W);
    if (!pk) return { ok: false };
    if (SECT.ELDER_STATUS) SECT.ELDER_STATUS.evaluateElderAscensions(W, { quiet: opts.quiet });
    const scanRes = PEAKS.scanAndFoundEligiblePeaks(W, { quiet: opts.quiet });
    const founded = PEAKS.getVisibleFoundedPeaks(W);
    let allocRes = null;
    let tourRes = null;
    if (founded.length >= 1) {
      allocRes = PEAKS.allocateCentralResourcesToPeaks(W, { quiet: opts.quiet });
    }
    if (founded.length >= 2 && (((W.day || 360) % 90 === 0) || opts.forceTournament)) {
      tourRes = PEAKS.holdInterPeakTournament(W, { quiet: opts.quiet });
    }
    return { ok: true, scanRes, foundedCount: founded.length, allocRes, tourRes };
  };

  PEAKS.activatePeakArray = (W, peakId) => {
    const pk = PEAKS.ensure(W);
    const pid = PEAKS.resolvePeakId(peakId);
    const p = pk && pk.byId && pk.byId[pid];
    if (!p) return { ok: false, reason: 'invalid-peak' };
    if (!p.founded) return { ok: false, reason: 'peak-not-founded' };
    p.arrayActive = true;
    p.arrayLevel = p.arrayLevel || 1;
    if (W && Array.isArray(W.npcs) && g.STATS && g.STATS.dirty) {
      W.npcs.forEach(n => { if (n && n.peakId === p.id) { n._cultRateBase = null; g.STATS.dirty(n); } });
    }
    return { ok: true, peak: p, arrayLevel: p.arrayLevel, bonus: (p.cultivationBonus || 0.14) * (1 + (p.arrayLevel - 1) * 0.25) };
  };

  PEAKS.togglePeakArray = (W, peakId, forceState) => {
    const pk = PEAKS.ensure(W);
    const pid = PEAKS.resolvePeakId(peakId);
    const p = pk && pk.byId && pk.byId[pid];
    if (!p) return { ok: false, reason: 'invalid-peak' };
    if (!p.founded) return { ok: false, reason: 'peak-not-founded' };
    p.arrayActive = typeof forceState === 'boolean' ? forceState : !p.arrayActive;
    p.arrayLevel = p.arrayLevel || 1;
    if (W && Array.isArray(W.npcs) && g.STATS && g.STATS.dirty) {
      W.npcs.forEach(n => { if (n && n.peakId === p.id) { n._cultRateBase = null; g.STATS.dirty(n); } });
    }
    return { ok: true, peak: p, arrayActive: p.arrayActive, arrayLevel: p.arrayLevel };
  };

  PEAKS.upgradePeakArray = (W, peakId, opts) => {
    opts = opts || {};
    const pk = PEAKS.ensure(W);
    const pid = PEAKS.resolvePeakId(peakId);
    const p = pk && pk.byId && pk.byId[pid];
    if (!p) return { ok: false, reason: 'invalid-peak' };
    if (!p.founded) return { ok: false, reason: 'peak-not-founded' };
    const curLv = p.arrayLevel || 1;
    if (curLv >= 3) return { ok: false, reason: 'max-level-reached', arrayLevel: curLv };
    const cost = curLv * 120;
    if (!opts.free) {
      if ((p.treasuryStones || 0) >= cost) {
        p.treasuryStones -= cost;
      } else if (W && W.sect && (W.sect.stones || 0) >= cost) {
        if (ECO && ECO.pay) ECO.pay(W, cost, 'ยกระดับค่ายกลปราณประจำ' + p.nameTh);
        else W.sect.stones -= cost;
      } else {
        return { ok: false, reason: 'insufficient-stones', required: cost };
      }
    }
    p.arrayLevel = curLv + 1;
    p.arrayActive = true;
    if (W && Array.isArray(W.npcs) && g.STATS && g.STATS.dirty) {
      W.npcs.forEach(n => { if (n && n.peakId === p.id) { n._cultRateBase = null; g.STATS.dirty(n); } });
    }
    return { ok: true, peak: p, arrayLevel: p.arrayLevel, arrayActive: p.arrayActive };
  };

  PEAKS.cultivationBonusFor = (W, n) => {
    if (!n || !n.peakId) return 0;
    const wRef = W || PEAKS._activeWorld || g.W || (g.G && g.G.W);
    const pk = wRef ? PEAKS.ensure(wRef) : null;
    const pid = PEAKS.resolvePeakId(n.peakId);
    const p = pk && pk.byId && pk.byId[pid];
    if (!p || !p.founded || !p.arrayActive) return 0;
    const def = PEAKS.PEAK_DEFS[pid] || {};
    const baseRate = (def.auraBonus && def.auraBonus.cultRate) || p.cultivationBonus || 0.14;
    const lvScale = 1 + ((p.arrayLevel || 1) - 1) * 0.20;
    return +(baseRate * lvScale).toFixed(4);
  };

  PEAKS.getUnitPeakBonuses = (W, npc) => {
    if (W && !npc && (W.h || W.cult || W.peakId)) {
      npc = W;
      W = PEAKS._activeWorld || g.W || (g.G && g.G.W);
    }
    if (!npc || !npc.peakId) return { active: false, p: {}, f: {} };
    const wRef = W || PEAKS._activeWorld || g.W || (g.G && g.G.W);
    const pk = wRef ? PEAKS.ensure(wRef) : null;
    const pid = PEAKS.resolvePeakId(npc.peakId);
    const pObj = pk && pk.byId && pk.byId[pid];
    if (pObj && !pObj.founded) return { active: false, p: {}, f: {} };
    const def = PEAKS.PEAK_DEFS[pid];
    if (!def || !def.auraBonus) return { active: false, p: {}, f: {} };
    const ab = def.auraBonus;
    const lvScale = pObj && pObj.arrayLevel > 1 ? (1 + (pObj.arrayLevel - 1) * 0.15) : 1.0;
    const p = {}, f = {};
    for (const [k, v] of Object.entries(ab.p || {})) p[k] = +(v * lvScale).toFixed(4);
    for (const [k, v] of Object.entries(ab.f || {})) f[k] = +(v * lvScale).toFixed(2);
    if (ab.swordPower) {
      const wpn = npc.equip && npc.equip.WEAPON;
      const wType = (wpn && g.MARTIAL && g.MARTIAL.gearType) ? g.MARTIAL.gearType(wpn) : (wpn && wpn.gearType);
      const isSword = !wpn || wType === 'SWORD' || wType === 'BLADE' || /SWORD|BLADE|กระบี่|ดาบ/.test(String(wpn.id || wpn.nameTh || ''));
      if (isSword) {
        p.atk = Math.max(p.atk || 0, +(ab.swordPower * lvScale).toFixed(4));
        p.matk = Math.max(p.matk || 0, +(ab.swordPower * lvScale).toFixed(4));
      }
    }
    return {
      active: true,
      peakId: pid,
      nameTh: def.nameTh,
      cultRate: +(ab.cultRate * lvScale).toFixed(4),
      swordPower: ab.swordPower ? +(ab.swordPower * lvScale).toFixed(4) : 0,
      hpMaxMult: ab.hpMaxMult ? +(ab.hpMaxMult * lvScale).toFixed(4) : 0,
      craftQuality: ab.craftQuality ? +(ab.craftQuality * lvScale).toFixed(4) : 0,
      alchemySuccess: ab.alchemySuccess ? +(ab.alchemySuccess * lvScale).toFixed(4) : 0,
      petStatBonus: ab.petStatBonus ? +(ab.petStatBonus * lvScale).toFixed(4) : 0,
      tameBonus: ab.tameBonus ? +(ab.tameBonus * lvScale).toFixed(4) : 0,
      sectArrayDefense: ab.sectArrayDefense ? +(ab.sectArrayDefense * lvScale).toFixed(4) : 0,
      matkMult: ab.matkMult ? +(ab.matkMult * lvScale).toFixed(4) : 0,
      cpGainBonus: ab.cpGainBonus ? +(ab.cpGainBonus * lvScale).toFixed(4) : 0,
      studySpeedBonus: ab.studySpeedBonus ? +(ab.studySpeedBonus * lvScale).toFixed(4) : 0,
      critBonus: ab.critBonus ? +(ab.critBonus * lvScale).toFixed(2) : 0,
      btBonus: ab.btBonus ? +(ab.btBonus * lvScale).toFixed(4) : 0,
      p,
      f
    };
  };


  PEAKS.PATH_SANCTUARY_BLESSINGS = Object.freeze((() => {
    const out = {};
    const allPaths = (JD && JD.CULT && JD.CULT.paths) || {};
    for (const [pid, pObj] of Object.entries(allPaths)) {
      const peakId = PEAKS.peakIdForPath(pid);
      out[pid] = {
        path: pid,
        peakId,
        subSanctuaryTh: 'ตำหนักย่อย' + (pObj.shortTh || pObj.nameTh),
        gaugeBonusPct: 0.15,
        cultRateBonus: 0.04,
        specialtyWeapon: (pObj.weapons && pObj.weapons[0]) || 'SWORD',
        descTh: 'ตำหนักย่อยประจำ「' + pObj.nameTh + '」ในสังกัดยอดเขา หนุนอัตราเร่งเกจเอกลักษณ์ +15% และตบะ +4%'
      };
    }
    return out;
  })());

  SECT.PEAKS = PEAKS;

  if (g.EXPED) {
    g.EXPED.bindTaoistCompanions = SECT.bindTaoistCompanions;
    g.EXPED.spawnCompanionOffspring = SECT.spawnCompanionOffspring;
  }
  SECT.launchCoalitionOffensive = (W, party, targetSectOrId, allySectIds, opts) => g.EXPED.launchCoalitionOffensive(W, party, targetSectOrId, allySectIds, opts);
  SECT.triggerSiegeReinforcementBeacon = (W, opts) => g.EXPED.triggerSiegeReinforcementBeacon(W, opts);
  SECT.launchVendettaReclamation = (W, renegadeNpcOrId, party, opts) => g.EXPED.launchVendettaReclamation(W, renegadeNpcOrId, party, opts);

  /* =========================================================================
   * Patch v2.0.35 — Sections 12.2, 12.3, 12.4, 12.6, 12.7, 13 & 14:
   * - 12.2 Awakened Weapon Souls (Armament Wills, Compatibility, Avatar Manifestation, Elder Soul Imbuing)
   * - 12.3 Sect Totem Pillars & Ancient Bloodline Awakening + Marrow Cleansing Pool
   * - 12.4 Celestial Alignments & World Cataclysms (Blood Moon, Nine Suns, Meteor Shower, Prana Tide)
   * - 12.6 Destiny Threads (Red/Black/Gold) & Karmic Debt Ledger
   * - 12.7 Leyline Anchors & Sect Territorial Grid Network
   * - 13 & 14 Universal 12-Path Equity Matrix & Multi-Perspective Synthesis
   * ========================================================================= */
  if (SECT.SOUL_FORGE) {
    const SF = SECT.SOUL_FORGE;
    SF.ARMAMENT_WILLS = Object.freeze({
      BLOODTHIRSTY_BLADE: { id: 'BLOODTHIRSTY_BLADE', nameTh: 'เจตจำนงดาบกระหายโลหิต', preferredTrait: 'aggression', minVal: 55, bonusMult: 0.18 },
      RIGHTEOUS_GUARDIAN_SWORD: { id: 'RIGHTEOUS_GUARDIAN_SWORD', nameTh: 'เจตจำนงกระบี่พิทักษ์ธรรม', preferredTrait: 'integrity', minVal: 55, bonusMult: 0.18 },
      SCHOLARLY_JADE_BRUSH: { id: 'SCHOLARLY_JADE_BRUSH', nameTh: 'เจตจำนงพู่กันหยกปราชญ์เมธี', preferredTrait: 'composure', minVal: 55, bonusMult: 0.18 },
      VOID_ASTRAL_BOW: { id: 'VOID_ASTRAL_BOW', nameTh: 'เจตจำนงศรดาราผ่าสุญตา', preferredTrait: 'courage', minVal: 55, bonusMult: 0.18 },
      DRAGON_ROAR_SPEAR: { id: 'DRAGON_ROAR_SPEAR', nameTh: 'เจตจำนงทวนมังกรคำราม', preferredTrait: 'courage', minVal: 55, bonusMult: 0.18 },
      VAJRA_ARHAT_STAFF: { id: 'VAJRA_ARHAT_STAFF', nameTh: 'เจตจำนงพลองวัชระอรหันต์', preferredTrait: 'discipline', minVal: 55, bonusMult: 0.18 },
      TITAN_SHATTER_FIST: { id: 'TITAN_SHATTER_FIST', nameTh: 'เจตจำนงหมัดทลายขุนเขา', preferredTrait: 'aggression', minVal: 55, bonusMult: 0.18 },
      CELESTIAL_CORE_FOCUS: { id: 'CELESTIAL_CORE_FOCUS', nameTh: 'เจตจำนงสื่อปราณดาราจักร', preferredTrait: 'rationality', minVal: 55, bonusMult: 0.18 },
      HEAVENLY_CHORD_ZITHER: { id: 'HEAVENLY_CHORD_ZITHER', nameTh: 'เจตจำนงพิณสวรรค์กล่อมวิญญาณ', preferredTrait: 'empathy', minVal: 55, bonusMult: 0.18 },
      PHANTOM_SILK_WHIP: { id: 'PHANTOM_SILK_WHIP', nameTh: 'เจตจำนงแส้ไหมเงาพันธนาการ', preferredTrait: 'caution', minVal: 55, bonusMult: 0.18 },
      BODHI_MERIT_ROSARY: { id: 'BODHI_MERIT_ROSARY', nameTh: 'เจตจำนงลูกประคำโพธิสัตว์', preferredTrait: 'empathy', minVal: 55, bonusMult: 0.18 },
      APEX_PREDATOR_CLAW: { id: 'APEX_PREDATOR_CLAW', nameTh: 'เจตจำนงกรงเล็บอสูรบรรพกาล', preferredTrait: 'aggression', minVal: 55, bonusMult: 0.18 },
      MERIDIAN_SOUL_NEEDLE: { id: 'MERIDIAN_SOUL_NEEDLE', nameTh: 'เจตจำนงเข็มวิญญาณชี้เป็นตาย', preferredTrait: 'composure', minVal: 55, bonusMult: 0.18 },
      TEMPEST_GALE_FAN: { id: 'TEMPEST_GALE_FAN', nameTh: 'เจตจำนงพัดเทวพายุสี่ฤดู', preferredTrait: 'curiosity', minVal: 55, bonusMult: 0.18 },
      COSMIC_FATE_ASTROLABE: { id: 'COSMIC_FATE_ASTROLABE', nameTh: 'เจตจำนงจานดาราลิขิตสวรรค์', preferredTrait: 'rationality', minVal: 55, bonusMult: 0.18 },
      GOLDEN_KARMA_ABACUS: { id: 'GOLDEN_KARMA_ABACUS', nameTh: 'เจตจำนงลูกคิดทองคำพิพากษา', preferredTrait: 'ambition', minVal: 55, bonusMult: 0.18 }
    });

    SF.evaluateWeaponCompatibility = (npc, weapon) => {
      const wpn = weapon || (npc && npc.equip && npc.equip.WEAPON);
      if (!npc || !wpn || !wpn.weaponSpirit) return { compatible: true, resonanceMult: 1.0, rebellion: false };
      const ws = wpn.weaponSpirit;
      const willId = ws.armamentWill || (HC.eff(npc, 'personality.aggression') >= 60 ? 'BLOODTHIRSTY_BLADE' : 'RIGHTEOUS_GUARDIAN_SWORD');
      ws.armamentWill = willId;
      const willSpec = SF.ARMAMENT_WILLS[willId] || SF.ARMAMENT_WILLS.RIGHTEOUS_GUARDIAN_SWORD;
      const traitVal = (npc.h && npc.h.personality && Number.isFinite(npc.h.personality[willSpec.preferredTrait]))
        ? npc.h.personality[willSpec.preferredTrait]
        : (HC && HC.eff ? HC.eff(npc, 'personality.' + willSpec.preferredTrait) : 60);
      if (traitVal < 28 && !ws.rebellionSuppressed) {
        return { compatible: false, rebellion: true, willId, resonanceMult: 0.85, accPenalty: -15, hpDrainPct: 0.03 };
      }
      return { compatible: true, rebellion: false, willId, resonanceMult: +(1 + willSpec.bonusMult).toFixed(2) };
    };

    SF.manifestWeaponAvatar = (W, f, npc) => {
      if (!npc || !npc.equip || !npc.equip.WEAPON) return { ok: false, reason: 'no-weapon' };
      const wpn = npc.equip.WEAPON;
      if (!wpn.weaponSpirit) SF.awakenWeaponSpirit(W, npc, npc, { initialXp: 320, quiet: true });
      const ws = wpn.weaponSpirit;
      ws.stage = 5;
      ws.spiritXp = Math.max(300, ws.spiritXp || 300);
      ws.stageNameTh = SF.SPIRIT_STAGES[4].nameTh;
      ws.multBonus = 0.32;
      const avatar = {
        id: 'WPN_AVATAR_' + npc.id + '_' + ((W && W.t) || 0),
        name: 'ร่างจำแลง' + ws.spiritNameTh,
        isSummon: true,
        isWeaponAvatar: true,
        summonerId: npc.id,
        foe: true,
        tier: Math.max(5, wpn.tier || 5),
        element: ws.element || 'EARTH_METAL',
        hpMax: Math.round(((g.CULT && g.CULT.hpMax) ? g.CULT.hpMax(npc) : 400) * 0.65),
        hp: Math.round(((g.CULT && g.CULT.hpMax) ? g.CULT.hpMax(npc) : 400) * 0.65),
        dur: 20
      };
      if (W && f) {
        const side = (g.COMBAT && g.COMBAT.sideOf) ? g.COMBAT.sideOf(f, npc.id) : 'A';
        W.foeById = W.foeById || {};
        W.foeById[avatar.id] = avatar;
        if (!f[side].includes(avatar.id)) f[side].push(avatar.id);
      }
      npc.lastWeaponAvatar = avatar;
      return { ok: true, avatar, weaponSpirit: ws };
    };

    SF.imbueElderSoulIntoWeapon = (W, elderNpc, weapon) => {
      const wpn = weapon || (elderNpc && elderNpc.equip && elderNpc.equip.WEAPON);
      if (!elderNpc || !wpn) return { ok: false, reason: 'missing-elder-or-weapon' };
      if (!wpn.weaponSpirit) SF.awakenWeaponSpirit(W, elderNpc, elderNpc, { initialXp: 300, quiet: true, allowDeadImbue: true });
      if (!wpn.weaponSpirit) wpn.weaponSpirit = { spiritNameTh: 'จิตวิญญาณ' + (wpn.nameTh || 'ศาสตรา'), stage: 5, stageNameTh: SF.SPIRIT_STAGES[4].nameTh, spiritXp: 300, multBonus: 0.32, battlesFought: 1, personalityTh: 'พิทักษ์สำนัก' };
      const ws = wpn.weaponSpirit;
      ws.stage = 5;
      ws.multBonus = 0.32;
      ws.imbuedElderSoul = {
        elderId: elderNpc.id,
        elderNameTh: HC.fullName(elderNpc),
        path: elderNpc.cult ? elderNpc.cult.path : 'XIAN',
        sub: elderNpc.cult ? elderNpc.cult.sub : 'NONE',
        imbuedDay: (W && W.day) || 360,
        guardianAuraBonusPct: 0.20
      };
      wpn.isAncestralSoulRelic = true;
      return { ok: true, weapon: wpn, weaponSpirit: ws, imbuedElderSoul: ws.imbuedElderSoul };
    };
  }

  /* ---------- Section 12.3: Sect Totem Pillars & Ancient Bloodline Awakening ---------- */
  const TOTEMS_BLOODLINES = {};
  TOTEMS_BLOODLINES.BLOODLINE_CATALOG = Object.freeze({
    IMMORTAL_SOLAR_BLOODLINE: {
      id: 'IMMORTAL_SOLAR_BLOODLINE', nameTh: 'สายเลือดสุริยันอมตะบรรพกาล', element: 'FIRE',
      p: { atk: 0.14, matk: 0.14, hp: 0.10 }, f: { pen: 10, crit: 6 },
      immuneChill: true, applyRadiationBurn: true,
      descTh: 'ต้านทานสถานะหนาวเหน็บและแช่แข็งอย่างสมบูรณ์ วิชาธาตุไฟเผาผลาญเพดานเลือดศัตรู'
    },
    SKY_DEVOURING_DEMON_BLOODLINE: {
      id: 'SKY_DEVOURING_DEMON_BLOODLINE', nameTh: 'สายเลือดมารกลืนสวรรค์', element: 'BLOOD_DEMON',
      p: { atk: 0.16, matk: 0.12, hp: 0.12 }, f: { pen: 12, critDmg: 20 },
      devourStatsOnKillPct: 0.10,
      descTh: 'เมื่อสังหารศัตรูจะกลืนกินสเตตัส 10% มาเสริมพลังให้ตนเองตลอดการต่อสู้'
    },
    ALL_SEEING_EYE_BLOODLINE: {
      id: 'ALL_SEEING_EYE_BLOODLINE', nameTh: 'สายเลือดเนตรสวรรค์แจ้งสัจธรรม', element: 'ASTRAL',
      p: { acc: 0.30, eva: 0.14, matk: 0.12 }, f: { crit: 12, cast: 12 },
      revealHiddenNodes: true,
      descTh: 'เพิ่มความแม่นยำ +30% อัตราคริ +12% และมองเห็นจุดซ่อนเร้นรวมถึงคูลดาวน์ศัตรู'
    },
    PRIMORDIAL_AZURE_DRAGON_BLOODLINE: {
      id: 'PRIMORDIAL_AZURE_DRAGON_BLOODLINE', nameTh: 'สายเลือดมังกรครามบรรพกาล', element: 'WOOD_LIFE',
      p: { hp: 0.18, matk: 0.14, def: 0.12 }, f: { cast: 10, move: 10 },
      descTh: 'เพิ่มพลังชีวิต +18% โจมตีวิชา +14% และฟื้นฟูบาดแผลอัตโนมัติ'
    }
  });

  TOTEMS_BLOODLINES.TOTEM_CATALOG = Object.freeze({
    TOTEM_AZURE_DRAGON: { id: 'TOTEM_AZURE_DRAGON', nameTh: 'เสาโทเท็มมังกรครามพฤกษาสวรรค์', element: 'WOOD_LIFE', p: { hp: 0.10, matk: 0.10 }, f: { cast: 8 } },
    TOTEM_WHITE_TIGER: { id: 'TOTEM_WHITE_TIGER', nameTh: 'เสาโทเท็มพยัคฆ์ขาวศาสตราทอง', element: 'EARTH_METAL', p: { atk: 0.12, def: 0.08 }, f: { pen: 10, crit: 5 } },
    TOTEM_VERMILION_PHOENIX: { id: 'TOTEM_VERMILION_PHOENIX', nameTh: 'เสาโทเท็มหงส์ชาดเพลิงนิพพาน', element: 'FIRE', p: { matk: 0.12, hp: 0.08 }, f: { critDmg: 16 } },
    TOTEM_BLACK_TORTOISE: { id: 'TOTEM_BLACK_TORTOISE', nameTh: 'เสาโทเท็มเต่าดำปราการอุดร', element: 'WATER_ICE', p: { def: 0.15, mdef: 0.15 }, f: {} }
  });

  TOTEMS_BLOODLINES.ensure = W => {
    if (!W || !W.sect) return null;
    if (!W.sect.totemPillars || typeof W.sect.totemPillars !== 'object') {
      W.sect.totemPillars = { activeTotems: ['TOTEM_AZURE_DRAGON'], marrowPoolLevel: 1, awakenedCount: 0 };
    }
    if (!Array.isArray(W.sect.totemPillars.activeTotems)) {
      W.sect.totemPillars.activeTotems = ['TOTEM_AZURE_DRAGON'];
    }
    if (W.sect.totemPillars.erectedByPlayer && Array.isArray(W.npcs)) {
      W.npcs.forEach(n => {
        if (n && !n.foe) {
          n.sectTotems = W.sect.totemPillars.activeTotems.slice();
          n._sectTotems = n.sectTotems;
        }
      });
    }
    return W.sect.totemPillars;
  };

  TOTEMS_BLOODLINES.erectTotemPillar = (W, totemId) => {
    const st = TOTEMS_BLOODLINES.ensure(W);
    const spec = TOTEMS_BLOODLINES.TOTEM_CATALOG[totemId] || TOTEMS_BLOODLINES.TOTEM_CATALOG.TOTEM_WHITE_TIGER;
    if (st) {
      st.erectedByPlayer = true;
      if (!st.activeTotems.includes(spec.id)) st.activeTotems.push(spec.id);
    }
    if (W && Array.isArray(W.npcs)) {
      W.npcs.forEach(n => {
        if (n) {
          n.sectTotems = st ? st.activeTotems.slice() : [spec.id];
          n._sectTotems = n.sectTotems;
          if (g.STATS && g.STATS.dirty) g.STATS.dirty(n);
        }
      });
    }
    return { ok: true, totem: spec, activeTotems: st ? st.activeTotems : [spec.id] };
  };

  TOTEMS_BLOODLINES.cleanseMarrowPool = (W, npc) => {
    const st = TOTEMS_BLOODLINES.ensure(W);
    const target = npc || (W && W.byId && W.sect && W.byId[W.sect.masterId]) || (W && W.npcs && W.npcs[0]);
    if (!target) return { ok: false, reason: 'no-npc' };
    const curDay = (W && W.day) || 360;
    const alreadyCleansedToday = target.lastMarrowCleanseDay === curDay;
    if (!alreadyCleansedToday) {
      target.lastMarrowCleanseDay = curDay;
      if (target.cult) target.cult.toxic = Math.max(0, (target.cult.toxic || 0) - 25);
      if (HC && HC.trainBody) {
        HC.trainBody(target, 'toughness', 2.0);
        HC.trainBody(target, 'vitality', 2.0);
      }
    }
    const res = TOTEMS_BLOODLINES.awakenBloodline(W, target, (target.dormantBloodline && target.dormantBloodline.id) || null);
    return { ok: true, alreadyAwakened: Boolean(res.alreadyAwakened), marrowPoolLevel: st ? st.marrowPoolLevel : 1, bloodline: res.bloodline };
  };

  TOTEMS_BLOODLINES.awakenBloodline = (W, npc, bloodlineId) => {
    if (!npc) return { ok: false, reason: 'no-npc' };
    const wasAwakened = Boolean(npc.ancientBloodline && npc.ancientBloodline.awakened);
    const spec = TOTEMS_BLOODLINES.BLOODLINE_CATALOG[bloodlineId]
      || (npc.ancientBloodline && TOTEMS_BLOODLINES.BLOODLINE_CATALOG[npc.ancientBloodline.id])
      || (npc.cult && npc.cult.path === 'DEMON' ? TOTEMS_BLOODLINES.BLOODLINE_CATALOG.SKY_DEVOURING_DEMON_BLOODLINE
        : (npc.cult && npc.cult.path === 'XIAN' ? TOTEMS_BLOODLINES.BLOODLINE_CATALOG.ALL_SEEING_EYE_BLOODLINE
          : TOTEMS_BLOODLINES.BLOODLINE_CATALOG.IMMORTAL_SOLAR_BLOODLINE));
    if (!wasAwakened || (bloodlineId && TOTEMS_BLOODLINES.BLOODLINE_CATALOG[bloodlineId])) {
      npc.ancientBloodline = {
        id: spec.id,
        nameTh: spec.nameTh,
        element: spec.element,
        awakened: true,
        purity: 0.92,
        awakenedDay: (W && W.day) || 360,
        p: Object.assign({}, spec.p),
        f: Object.assign({}, spec.f)
      };
    }
    const st = TOTEMS_BLOODLINES.ensure(W);
    if (st) {
      if (W && Array.isArray(W.npcs)) {
        st.awakenedCount = W.npcs.filter(n => n && !n.dead && !n.exiled && n.ancientBloodline && n.ancientBloodline.awakened).length;
      } else if (!wasAwakened) {
        st.awakenedCount = (st.awakenedCount || 0) + 1;
      }
    }
    if (g.STATS && g.STATS.dirty) g.STATS.dirty(npc);
    return { ok: true, alreadyAwakened: wasAwakened, bloodline: npc.ancientBloodline };
  };

  TOTEMS_BLOODLINES.rollOffspringBloodline = (W, childNpc, parentA, parentB) => {
    if (!childNpc) return { awakened: false };
    const parentHas = (parentA && parentA.ancientBloodline && parentA.ancientBloodline.awakened) || (parentB && parentB.ancientBloodline && parentB.ancientBloodline.awakened);
    const chance = parentHas ? 0.35 : 0.15;
    const roll = (W && W.rng && typeof W.rng.next === 'function') ? W.rng.next() : 0.10;
    if (roll <= chance) {
      const inheritedId = (parentA && parentA.ancientBloodline && parentA.ancientBloodline.id) || (parentB && parentB.ancientBloodline && parentB.ancientBloodline.id) || 'IMMORTAL_SOLAR_BLOODLINE';
      return TOTEMS_BLOODLINES.awakenBloodline(W, childNpc, inheritedId);
    }
    childNpc.dormantBloodline = { id: 'IMMORTAL_SOLAR_BLOODLINE', purity: 0.45, awakened: false };
    return { ok: true, awakened: false, dormantBloodline: childNpc.dormantBloodline };
  };

  TOTEMS_BLOODLINES.getUnitBonuses = npc => {
    if (!npc || npc.foe) return { active: false };
    const hasBld = !!(npc.ancientBloodline && npc.ancientBloodline.awakened);
    const wRef = g.W || (g.G && g.G.W);
    const activeTotems = (Array.isArray(npc.sectTotems) && npc.sectTotems.length ? npc.sectTotems : null)
      || (Array.isArray(npc._sectTotems) && npc._sectTotems.length ? npc._sectTotems : null)
      || (wRef && wRef.sect && wRef.sect.totemPillars && wRef.sect.totemPillars.activeTotems)
      || [];
    if (!hasBld && (!Array.isArray(activeTotems) || !activeTotems.length)) return { active: false };
    const p = {}, f = {};
    if (hasBld) {
      const b = npc.ancientBloodline;
      const spec = TOTEMS_BLOODLINES.BLOODLINE_CATALOG[b.id] || b;
      for (const [k, v] of Object.entries(spec.p || {})) p[k] = (p[k] || 0) + v;
      for (const [k, v] of Object.entries(spec.f || {})) f[k] = (f[k] || 0) + v;
    }
    if (Array.isArray(activeTotems)) {
      for (const tid of activeTotems) {
        const tSpec = TOTEMS_BLOODLINES.TOTEM_CATALOG[tid];
        if (!tSpec) continue;
        for (const [k, v] of Object.entries(tSpec.p || {})) p[k] = (p[k] || 0) + v;
        for (const [k, v] of Object.entries(tSpec.f || {})) f[k] = (f[k] || 0) + v;
      }
    }
    return {
      active: true,
      labelTh: hasBld ? ('สายเลือดบรรพกาล「' + (npc.ancientBloodline.nameTh || npc.ancientBloodline.id) + '」และเสาโทเท็ม') : 'พรคุ้มครองเสาโทเท็มสำนัก',
      p,
      f
    };
  };
  SECT.TOTEMS_BLOODLINES = TOTEMS_BLOODLINES;

  /* ---------- Section 12.4: Celestial Alignments & World Cataclysms ---------- */
  const CELESTIAL_ALIGNMENTS = {};
  CELESTIAL_ALIGNMENTS.EVENTS = Object.freeze({
    BLOOD_MOON_ECLIPSE: {
      id: 'BLOOD_MOON_ECLIPSE', nameTh: 'ปรากฏการณ์จันทรุปราคาโลหิต', icon: '🩸',
      boostElements: ['BLOOD_DEMON', 'DARK_YIN'], dmgBoostPct: 0.30, heartDemonRiskAdd: 0.15,
      specialResource: 'MAT_V234_005', descTh: 'วิชาสายมารและหยินรุนแรงขึ้น +30% และสมุนไพรจันทราโลหิตผลิบาน'
    },
    NINE_SUN_CONVERGENCE: {
      id: 'NINE_SUN_CONVERGENCE', nameTh: 'ปรากฏการณ์เก้าสุริยันเรียงตัว', icon: '☀️',
      boostElements: ['FIRE', 'LIGHT_YANG'], dmgBoostPct: 0.35, fireAlchemyBonusPct: 0.25,
      specialResource: 'MAT_V234_001', descTh: 'วิชาสายอัคคีและกายาสุริยันรุนแรงขึ้น +35% และปรุงโอสถไฟสำเร็จง่ายขึ้น +25%'
    },
    ASTRAL_METEOR_SHOWER: {
      id: 'ASTRAL_METEOR_SHOWER', nameTh: 'ปรากฏการณ์ฝนดาวตกดาราจักร', icon: '☄️',
      boostElements: ['ASTRAL', 'EARTH_METAL'], dmgBoostPct: 0.28, comprehensionBonusPct: 0.40,
      specialResource: 'MAT_V234_002', descTh: 'แร่เหล็กดาราร่วงหล่นลงสู่แผนที่โลก และการหยั่งรู้ค่ายกลดาราเพิ่มขึ้น +40%'
    },
    PRANA_TIDE_INFLUX: {
      id: 'PRANA_TIDE_INFLUX', nameTh: 'ปรากฏการณ์กระแสปราณบรรพกาลทะลัก', icon: '🌊',
      boostElements: ['WATER_ICE', 'WOOD_LIFE', 'WIND', 'LIGHTNING'], qiRegenBoostPct: 0.50, btBonusPct: 0.10,
      specialResource: 'MAT_V234_004', descTh: 'ความเร็วฟื้นฟูปราณทั่วหล้าเพิ่มขึ้น +50% และโอกาสทะลวงขั้นเพิ่มขึ้น +10%'
    }
  });

  CELESTIAL_ALIGNMENTS.ensure = W => {
    if (!W) return null;
    if (!W.celestialAlignment || typeof W.celestialAlignment !== 'object') {
      W.celestialAlignment = { activeEvent: null, history: [] };
    }
    return W.celestialAlignment;
  };

  CELESTIAL_ALIGNMENTS.triggerEvent = (W, eventId, durDays) => {
    const st = CELESTIAL_ALIGNMENTS.ensure(W);
    const spec = CELESTIAL_ALIGNMENTS.EVENTS[eventId] || CELESTIAL_ALIGNMENTS.EVENTS.PRANA_TIDE_INFLUX;
    const dayNow = (W && W.day) || 360;
    const active = Object.assign({}, spec, {
      startedDay: dayNow,
      untilDay: dayNow + (durDays || 7)
    });
    if (st) {
      st.activeEvent = active;
      st.history.unshift(active);
      if (st.history.length > 20) st.history.length = 20;
    }
    if (W) W.celestialEvent = active;
    if (W && W.sect && spec.specialResource && g.ECO && g.ECO.add) {
      g.ECO.add(W, spec.specialResource, 3);
    }
    return { ok: true, event: active };
  };

  CELESTIAL_ALIGNMENTS.tick = W => {
    const st = CELESTIAL_ALIGNMENTS.ensure(W);
    if (!st) return null;
    const dayNow = (W && W.day) || 360;
    if (st.activeEvent && dayNow >= st.activeEvent.untilDay) {
      st.activeEvent = null;
      W.celestialEvent = null;
    }
    if (!st.activeEvent && dayNow % 60 === 0) {
      const keys = Object.keys(CELESTIAL_ALIGNMENTS.EVENTS);
      const pick = keys[(Math.floor(dayNow / 60)) % keys.length];
      return CELESTIAL_ALIGNMENTS.triggerEvent(W, pick, 6);
    }
    return { ok: true, activeEvent: st.activeEvent };
  };
  SECT.CELESTIAL_ALIGNMENTS = CELESTIAL_ALIGNMENTS;

  /* ---------- Section 12.6: Destiny Threads & Karmic Debt Ledger ---------- */
  const DESTINY_KARMA = {};
  DESTINY_KARMA.THREAD_TYPES = Object.freeze({
    RED_THREAD: { id: 'RED_THREAD', nameTh: 'ด้ายแดงคู่บุญวาสนา', dualCultSpeedBonus: 0.20, duetSkillUnlocked: true },
    BLACK_THREAD: { id: 'BLACK_THREAD', nameTh: 'ด้ายดำหนี้แค้นข้ามภพ', nemesisDmgBonus: 0.25, daoInsightOnSlay: 100 },
    GOLD_THREAD: { id: 'GOLD_THREAD', nameTh: 'ด้ายทองผู้มีพระคุณ', rescueInterventionChance: 0.85, shieldOnRescuePct: 0.30 }
  });

  DESTINY_KARMA.ensure = W => {
    if (!W || !W.sect) return null;
    if (!W.sect.destinyKarma || typeof W.sect.destinyKarma !== 'object') {
      W.sect.destinyKarma = { threads: [], ledger: {} };
    }
    return W.sect.destinyKarma;
  };

  DESTINY_KARMA.KARMA_ACTION_SCORES = Object.freeze({
    RESCUE_VILLAGERS: 25,
    RELEASE_PRISONER: 15,
    SPARE_ENEMY: 12,
    CHARITY_RELIEF: 20,
    PILLAGE: -30,
    SLAUGHTER_INNOCENT: -35,
    EXECUTE_CAPTIVE: -20,
    BETRAY_ALLY: -40
  });

  DESTINY_KARMA.bindThread = (W, npcA, npcB, threadType, reasonTh) => {
    const st = DESTINY_KARMA.ensure(W);
    const spec = DESTINY_KARMA.THREAD_TYPES[threadType] || DESTINY_KARMA.THREAD_TYPES.RED_THREAD;
    const objA = (typeof npcA === 'object' && npcA) ? npcA : (W && W.byId && W.byId[npcA]);
    const objB = (typeof npcB === 'object' && npcB) ? npcB : (W && W.byId && W.byId[npcB]);
    const idA = objA ? objA.id : String(npcA || '');
    const idB = objB ? objB.id : String(npcB || '');
    const entry = {
      id: 'THD_' + spec.id + '_' + idA + '_' + idB,
      type: spec.id,
      nameTh: spec.nameTh,
      aId: idA,
      bId: idB,
      reasonTh: reasonTh || spec.nameTh,
      boundDay: (W && W.day) || 360,
      spec
    };
    if (st) {
      st.threads = (st.threads || []).filter(t => !(t && t.type === spec.id && ((t.aId === idA && t.bId === idB) || (t.aId === idB && t.bId === idA))));
      st.threads.push(entry);
      if (st.threads.length > 60) st.threads.splice(0, st.threads.length - 60);
    }
    const pushCapped = targetObj => {
      if (!targetObj || typeof targetObj !== 'object') return;
      targetObj.destinyThreads = Array.isArray(targetObj.destinyThreads) ? targetObj.destinyThreads : [];
      targetObj.destinyThreads = targetObj.destinyThreads.filter(t => !(t && t.type === spec.id && ((t.aId === idA && t.bId === idB) || (t.aId === idB && t.bId === idA))));
      targetObj.destinyThreads.push(entry);
      if (targetObj.destinyThreads.length > 5) {
        targetObj.destinyThreads.splice(0, targetObj.destinyThreads.length - 5);
      }
    };
    pushCapped(objA);
    pushCapped(objB);
    return { ok: true, thread: entry };
  };

  DESTINY_KARMA.recordKarmicAction = (W, npc, actionOrDelta, maybeScore, maybeReasonTh) => {
    if (W && !npc && (W.h || W.cult)) {
      npc = W;
      W = g.W || (g.G && g.G.W) || null;
    }
    if (!npc) return { ok: false, reason: 'no-npc' };
    let actionType = 'KARMA_DEED';
    let delta = 0;
    let reasonTh = 'บันทึกกรรม';
    if (typeof actionOrDelta === 'string') {
      actionType = actionOrDelta;
      delta = Number.isFinite(maybeScore) ? maybeScore : (DESTINY_KARMA.KARMA_ACTION_SCORES[actionType] || 15);
      reasonTh = maybeReasonTh || actionType;
    } else {
      delta = Number(actionOrDelta) || 0;
      actionType = delta >= 0 ? 'VIRTUE_DEED' : 'SIN_DEED';
      reasonTh = (typeof maybeScore === 'string' ? maybeScore : maybeReasonTh) || 'บันทึกกรรม';
    }
    npc.karmicLedger = npc.karmicLedger || { virtueKarma: 0, sinKarma: 0, netKarma: 0, aura: 'NEUTRAL', history: [] };
    if (delta >= 0) npc.karmicLedger.virtueKarma += delta;
    else npc.karmicLedger.sinKarma += Math.abs(delta);
    npc.karmicLedger.netKarma = npc.karmicLedger.virtueKarma - npc.karmicLedger.sinKarma;
    if (npc.karmicLedger.virtueKarma >= 50) npc.karmicLedger.aura = 'GOLDEN_BODHI_HALO';
    else if (npc.karmicLedger.sinKarma >= 50) npc.karmicLedger.aura = 'ASURA_BLOOD_AURA';
    else npc.karmicLedger.aura = 'NEUTRAL';
    npc.karmicLedger.history = Array.isArray(npc.karmicLedger.history) ? npc.karmicLedger.history : [];
    npc.karmicLedger.history.unshift({ day: (W && W.day) || 360, actionType, delta, reasonTh });
    if (npc.karmicLedger.history.length > 25) npc.karmicLedger.history.length = 25;
    return { ok: true, ledger: npc.karmicLedger, actionType, delta };
  };

  DESTINY_KARMA.evaluateIntervention = (W, endangeredNpc) => {
    if (!endangeredNpc || !Array.isArray(endangeredNpc.destinyThreads)) return { intervened: false };
    const gold = endangeredNpc.destinyThreads.find(t => t && (t.type === 'GOLD_THREAD' || t.type === 'RED_THREAD'));
    if (!gold) return { intervened: false };
    const saviorId = gold.aId === endangeredNpc.id ? gold.bId : gold.aId;
    const savior = W && W.byId && W.byId[saviorId];
    return { intervened: true, saviorId, saviorNameTh: savior ? HC.fullName(savior) : 'ผู้มีวาสนาผูกพัน', threadType: gold.type };
  };
  SECT.DESTINY_KARMA = DESTINY_KARMA;

  /* ---------- Section 12.7: Leyline Anchors & Sect Territorial Grid Network ---------- */
  const LEYLINE_GRID = {};
  LEYLINE_GRID.ensure = W => {
    if (!W || !W.sect) return null;
    if (!W.sect.leylineGrid || typeof W.sect.leylineGrid !== 'object') {
      W.sect.leylineGrid = {
        anchors: [
          { id: 'ANCHOR_NORTH_PEAK', nameTh: 'เสาค่ายกลชีพจรธรณี·ยอดเขาอุดร', x: 90, y: 80, active: true, element: 'WATER_ICE', integrity: 100, guardNpcId: null, contestedBySectId: null },
          { id: 'ANCHOR_EAST_VALLEY', nameTh: 'เสาค่ายกลชีพจรธรณี·หุบเขาบูรพา', x: 150, y: 110, active: true, element: 'WOOD_LIFE', integrity: 100, guardNpcId: null, contestedBySectId: null },
          { id: 'ANCHOR_SOUTH_GATE', nameTh: 'เสาค่ายกลชีพจรธรณี·ด่านทักษิณ', x: 115, y: 165, active: true, element: 'FIRE', integrity: 100, guardNpcId: null, contestedBySectId: null }
        ],
        triangulated: true,
        travelSpeedBonusPct: 0.50,
        monsterWardActive: true,
        sabotagedRivals: []
      };
    }
    if (Array.isArray(W.sect.leylineGrid.anchors)) {
      W.sect.leylineGrid.anchors.forEach(a => {
        if (!a) return;
        if (a.integrity == null) a.integrity = 100;
        if (a.guardNpcId === undefined) a.guardNpcId = null;
        if (a.contestedBySectId === undefined) a.contestedBySectId = null;
      });
    }
    return W.sect.leylineGrid;
  };

  LEYLINE_GRID.deployAnchor = (W, x, y, nameTh, element) => {
    const grid = LEYLINE_GRID.ensure(W);
    const anchor = {
      id: 'ANCHOR_' + (grid.anchors.length + 1) + '_' + Math.round(x || 100) + '_' + Math.round(y || 100),
      nameTh: nameTh || ('เสาค่ายกลชีพจรธรณี #' + (grid.anchors.length + 1)),
      x: Number(x) || 100,
      y: Number(y) || 100,
      active: true,
      element: element || 'EARTH_METAL',
      integrity: 100,
      guardNpcId: null,
      contestedBySectId: null
    };
    grid.anchors.push(anchor);
    grid.triangulated = grid.anchors.filter(a => a && a.active).length >= 3;
    return { ok: true, anchor, triangulated: grid.triangulated, activeCount: grid.anchors.filter(a => a && a.active).length };
  };

  LEYLINE_GRID.assignAnchorGuard = (W, anchorId, npcOrId) => {
    const grid = LEYLINE_GRID.ensure(W);
    if (!grid) return { ok: false, reason: 'no-grid' };
    const hasExplicitId = anchorId !== undefined && anchorId !== null && anchorId !== '';
    const anc = hasExplicitId
      ? grid.anchors.find(a => a && a.id === anchorId)
      : grid.anchors[0];
    if (!anc) return { ok: false, reason: 'anchor-not-found', anchorId };
    const npc = (typeof npcOrId === 'object' && npcOrId) ? npcOrId : (W && W.byId && W.byId[npcOrId]);
    if (!npc || npc.dead || npc.exiled) return { ok: false, reason: 'invalid-npc' };
    anc.guardNpcId = npc.id;
    anc.guardNameTh = HC.fullName(npc);
    return { ok: true, anchor: anc, guardId: npc.id };
  };

  LEYLINE_GRID.repairAnchor = (W, anchorId, opts) => {
    opts = opts || {};
    const grid = LEYLINE_GRID.ensure(W);
    if (!grid) return { ok: false, reason: 'no-grid' };
    const anc = grid.anchors.find(a => a && a.id === anchorId) || grid.anchors.find(a => a && (a.integrity < 100 || !a.active)) || grid.anchors[0];
    if (!anc) return { ok: false, reason: 'anchor-not-found' };
    const cost = opts.cost != null ? opts.cost : 50;
    if (!opts.free && ((W.sect && W.sect.stones) || 0) < cost) {
      return { ok: false, reason: 'insufficient-stones', required: cost };
    }
    if (!opts.free && cost > 0) {
      if (ECO && ECO.spend) ECO.spend(W, cost, 'ซ่อมแซม' + anc.nameTh);
      else W.sect.stones -= cost;
      W.world = W.world || {};
      W.world.resourcePool = W.world.resourcePool || { stones: 50000, herbs: 5000, ores: 5000 };
      W.world.resourcePool.stones += cost;
    }
    anc.integrity = 100;
    anc.active = true;
    anc.contestedBySectId = null;
    grid.triangulated = grid.anchors.filter(a => a && a.active).length >= 3;
    return { ok: true, anchor: anc, cost, triangulated: grid.triangulated };
  };

  LEYLINE_GRID.tickContestation = (W, opts) => {
    opts = opts || {};
    const grid = LEYLINE_GRID.ensure(W);
    if (!grid || !grid.anchors.length) return { ok: false, reason: 'no-anchors' };
    const targetAnchor = (opts.anchorId && grid.anchors.find(a => a && a.id === opts.anchorId)) || grid.anchors[0];
    const rivalSect = (W.world && Array.isArray(W.world.sects) && W.world.sects[0]) || { id: 'S0', name: 'สำนักคู่อริ' };
    const guard = targetAnchor.guardNpcId && W.byId && W.byId[targetAnchor.guardNpcId];
    const hasAliveGuard = !!(guard && !guard.dead && !guard.exiled);
    const dmg = opts.damage != null ? opts.damage : (hasAliveGuard ? 12 : 35);
    targetAnchor.integrity = clamp((targetAnchor.integrity == null ? 100 : targetAnchor.integrity) - dmg, 0, 100);
    targetAnchor.contestedBySectId = rivalSect.id || 'S0';
    if (hasAliveGuard) {
      guard.merit = (guard.merit || 0) + 10;
    }
    if (targetAnchor.integrity <= 0) {
      targetAnchor.active = false;
    }
    grid.triangulated = grid.anchors.filter(a => a && a.active).length >= 3;
    return {
      ok: true,
      anchor: targetAnchor,
      damageDealt: dmg,
      guarded: hasAliveGuard,
      guardId: hasAliveGuard ? guard.id : null,
      triangulated: grid.triangulated
    };
  };
  LEYLINE_GRID.tickLeylineContestation = LEYLINE_GRID.tickContestation;

  LEYLINE_GRID.isTerritoryTriangulated = W => {
    const grid = LEYLINE_GRID.ensure(W);
    return !!(grid && grid.anchors.filter(a => a && a.active).length >= 3);
  };

  LEYLINE_GRID.teleportBetweenAnchors = (W, npcOrParty, fromAnchorId, toAnchorId) => {
    const grid = LEYLINE_GRID.ensure(W);
    if (!grid || !grid.triangulated) return { ok: false, reason: 'grid-not-triangulated' };
    const dest = grid.anchors.find(a => a && a.id === toAnchorId && a.active) || grid.anchors[0];
    const list = Array.isArray(npcOrParty) ? npcOrParty : [npcOrParty];
    for (const n of list) {
      if (!n) continue;
      n.x = dest.x;
      n.y = dest.y;
      n.lastLeylineTeleport = { t: (W && W.t) || 0, fromAnchorId, toAnchorId: dest.id };
    }
    return { ok: true, destination: dest, count: list.length };
  };

  LEYLINE_GRID.sabotageRivalAnchor = (W, party, rivalSectId) => {
    const grid = LEYLINE_GRID.ensure(W);
    const rec = { rivalSectId: rivalSectId || 'RIVAL_SECT_1', day: (W && W.day) || 360, defenseDroppedPct: 0.35 };
    if (grid) grid.sabotagedRivals.push(rec);
    return { ok: true, sabotage: rec };
  };
  SECT.LEYLINE_GRID = LEYLINE_GRID;

  /* ---------- Section 13 & 14: Universal 12-Path Equity Matrix & Multi-Perspective Synthesis ---------- */
  SECT.UNIVERSAL_EQUITY_V235 = Object.freeze({
    XIAN: { path: 'XIAN', combatMechanic: 'Flying Sword Array & Astral Star-Seals', elementalSpecialty: ['ASTRAL', 'WIND'], facilityRole: 'Pavilion of Myriad Swords (+Cast Speed)', explorationRole: 'Sky-Flight Bypass Terrain Obstacles' },
    BODY: { path: 'BODY', combatMechanic: 'Blood-Qi Furnace & Poise-Break Collisions', elementalSpecialty: ['FIRE', 'EARTH_METAL'], facilityRole: 'Marrow-Cleansing Crucible (+Max HP)', explorationRole: 'Boulder-Shatter & Hazard Immunity' },
    GOD: { path: 'GOD', combatMechanic: 'Divine Edict Domain & Faith Barrier', elementalSpecialty: ['LIGHT_YANG', 'LIGHTNING'], facilityRole: 'Ancestral Shrine & Totem Pillar (+Morale)', explorationRole: 'Purify Cursed Ruins & Undead Sanctums' },
    DEMON: { path: 'DEMON', combatMechanic: 'Heart-Demon Overdrive & Blood-Boil Detonation', elementalSpecialty: ['BLOOD_DEMON', 'DARK_YIN'], facilityRole: 'Blood-Refining Altar (+Crit & Lifesteal)', explorationRole: 'Intimidate Wild Beasts & Harvest Soul Cores' },
    HEART_SOUL: { path: 'HEART_SOUL', combatMechanic: 'Dream Illusion Clone & Mind-Control', elementalSpecialty: ['DARK_YIN', 'ASTRAL'], facilityRole: 'Bell of Tranquility (Purges Heart Demons)', explorationRole: 'Sense Hidden Treasures & Read Ancient Memories' },
    MECH_PUPPET: { path: 'MECH_PUPPET', combatMechanic: 'Overheat Reactor & Synchronized Puppet Barrage', elementalSpecialty: ['EARTH_METAL', 'LIGHTNING'], facilityRole: 'Automated Forge & Construct Foundry', explorationRole: 'Deploy Scout Drones & Disarm Ancient Traps' },
    KARMA_SAMSARA: { path: 'KARMA_SAMSARA', combatMechanic: 'Six-Realms Wheel Shift & Karmic Debt Reflection', elementalSpecialty: ['LIGHT_YANG', 'DARK_YIN'], facilityRole: 'Hall of Karmic Ledger (Predicts Calamities)', explorationRole: 'Trace Destiny Threads to Fated Encounters' },
    BEAST_SOVEREIGN: { path: 'BEAST_SOVEREIGN', combatMechanic: 'Beast Spirit Possession & Pack Alpha Frenzy', elementalSpecialty: ['WOOD_LIFE', 'WIND'], facilityRole: 'Spirit Beast Menagerie & Breeding Grounds', explorationRole: 'Track Rare Mythic Beasts & Mount Speed +40%' },
    SAGE_SUPPORT: { path: 'SAGE_SUPPORT', combatMechanic: 'Acupoint Sealing & Cleanse-to-Power Nectar', elementalSpecialty: ['WOOD_LIFE', 'WATER_ICE'], facilityRole: 'Hundred-Herb Apothecary & Infirmary', explorationRole: 'Harvest Intact Immortal Herbs (+50% Yield)' },
    CRAFT_CREATION: { path: 'CRAFT_CREATION', combatMechanic: 'Multi-Relic Barrage & Molten Armor Shatter', elementalSpecialty: ['FIRE', 'EARTH_METAL'], facilityRole: 'Heavenly Flame Smithy & Pill Cauldron', explorationRole: 'Salvage Ancient Golems & Repair Relics in Field' },
    ARRAY_TALISMAN: { path: 'ARRAY_TALISMAN', combatMechanic: 'Eight-Trigram Labyrinth & Multi-Charge Talismans', elementalSpecialty: ['ASTRAL', 'LIGHTNING'], facilityRole: 'Sect Grand Protective Formation & Leyline Grid', explorationRole: 'Crack Ancient Sealing Arrays & Teleportation Gates' },
    STRATEGY_GOVERNANCE: { path: 'STRATEGY_GOVERNANCE', combatMechanic: 'Tactical Row Command & Focus-Fire Decree', elementalSpecialty: ['EARTH_METAL', 'LIGHT_YANG'], facilityRole: 'Hall of Affairs & Diplomatic Trade Hub', explorationRole: 'Supply Logistics (-40% Food Cost) & Negotiate Treaties' },
    ASTRO_DIVINATION: { path: 'ASTRO_DIVINATION', combatMechanic: 'Star Destiny Gauge & Fate Reversal Prediction', elementalSpecialty: ['ASTRAL', 'LIGHT_YANG'], facilityRole: 'Observatory of Seven Stars (+Breakthrough & Omen Sight)', explorationRole: 'Predict Secret Realm Openings & Avoid Calamity Traps' },
    BUDDHA_DHARMA: { path: 'BUDDHA_DHARMA', combatMechanic: 'Bodhi Merit Gauge & Golden Lotus Karma Aegis', elementalSpecialty: ['LIGHT_YANG', 'EARTH_METAL'], facilityRole: 'Golden Lotus Bodhi Pagoda (Purifies Heart Demons & Karma)', explorationRole: 'Exorcise Ancient Demon Tombs & Pacify Wrathful Spirits' },
    VOID_SPACE: { path: 'VOID_SPACE', combatMechanic: 'Void Rift Gauge & Dimensional Pocket Redirection', elementalSpecialty: ['ASTRAL', 'WIND'], facilityRole: 'Dimensional Rift Gate (+Instant Teleport & Storage)', explorationRole: 'Blink Across Chasms & Open Spatial Vaults' },
    SONIC_HARMONY: { path: 'SONIC_HARMONY', combatMechanic: 'Harmonic Chord Gauge & Sonic Tempo Break', elementalSpecialty: ['WIND', 'WATER_ICE'], facilityRole: 'Celestial Music Pavilion (+Sect Morale & Qi Harmony)', explorationRole: 'Shatter Illusion Mists & Pacify Sonic Caverns' },
    VENOM_GU: { path: 'VENOM_GU', combatMechanic: 'Symbiotic Gu Gauge & Parasitic Soul Leech', elementalSpecialty: ['WOOD_LIFE', 'YIN_SHADOW'], facilityRole: 'Ten-Thousand Gu Cauldron (+Poison Alchemy & Gu Breeding)', explorationRole: 'Immunity to Miasma Swamps & Harvest Venomous Gu' },
    PRIMORDIAL_SHIFTER: { path: 'PRIMORDIAL_SHIFTER', combatMechanic: 'Bloodline Atavism Gauge & Feral Morph Bite', elementalSpecialty: ['FIRE', 'BLOOD_DEMON'], facilityRole: 'Primordial Totem Blood Pool (+Vitality & Phys Burst)', explorationRole: 'Apex Predator Scent Tracking & Extreme Terrain Climb' },
    CELESTIAL_WEATHER: { path: 'CELESTIAL_WEATHER', combatMechanic: 'Sky Qi Gauge & Weather Phenomenon Synchronization', elementalSpecialty: ['LIGHTNING', 'WATER_ICE'], facilityRole: 'Altar of Winds and Rain (Controls Sect Weather)', explorationRole: 'Calm Violent Tempests & Harness Lightning Strikes' },
    WANDERING_DAO: { path: 'WANDERING_DAO', combatMechanic: 'Route Insight Gauge & Wayfarer Horizon Step', elementalSpecialty: ['WIND', 'WOOD_LIFE'], facilityRole: 'Wayfarer Cartography Hall (-Travel Time & Hazard)', explorationRole: 'Mastery of All Jianghu Routes (-35% Hazard & Fast Travel)' },
    MERCANTILE_DAO: { path: 'MERCANTILE_DAO', combatMechanic: 'Contract Ledger Gauge & Debt Foreclosure Strike', elementalSpecialty: ['EARTH_METAL', 'LIGHT_YANG'], facilityRole: 'Golden Abacus Chamber (Zero-Free-Resource Escrow Ledger)', explorationRole: 'Appraise Ancient Relics & Broker Caravan Safe Passage' },
    DRAGON_VEIN_GEOMANCY: { path: 'DRAGON_VEIN_GEOMANCY', combatMechanic: 'Vein Resonance Gauge & Earth Dragon Spike', elementalSpecialty: ['EARTH_METAL', 'WOOD_LIFE'], facilityRole: 'Dragon Vein Compass Sanctum (+Sect Barrier & Peak Aura)', explorationRole: 'Locate Underground Spirit Veins & Stabilize Collapsing Ruins' },
    GRAVITY_DAO: { path: 'GRAVITY_DAO', combatMechanic: 'Gravity Pressure Gauge & Mass Absorption Field', elementalSpecialty: ['EARTH_METAL', 'ASTRAL'], facilityRole: 'Heavy Gravity Training Chamber (+Body & Qi Density)', explorationRole: 'Crush Gravity Anomalies & Deflect Falling Boulders' },
    CHRONO_EPOCH: { path: 'CHRONO_EPOCH', combatMechanic: 'Temporal Sand Gauge & Epoch Rewind Restoration', elementalSpecialty: ['ASTRAL', 'WATER_ICE'], facilityRole: 'Sundial of Eternal Kalpas (+Comprehension & Cooldown Flow)', explorationRole: 'Peer Into Past Ruin Echoes & Slow Time Traps' },
    INK_LITERATI: { path: 'INK_LITERATI', combatMechanic: 'Literati Ink Gauge & Imperial Censorate Seal', elementalSpecialty: ['LIGHT_YANG', 'YIN_SHADOW'], facilityRole: 'Imperial Academy of Classics (+Scripture Study Speed)', explorationRole: 'Decipher Ancient Stele Inscriptions & Seal Cursed Scrolls' },
    SOUL_PUPPETRY: { path: 'SOUL_PUPPETRY', combatMechanic: 'Marionette Silk Gauge & Soul Tether Damage Link', elementalSpecialty: ['YIN_SHADOW', 'BLOOD_DEMON'], facilityRole: 'Hall of Silken Marionettes (+Soul Defense & Puppet Craft)', explorationRole: 'Send Soul Marionettes Into Lethal Ruin Chambers' },
    PRIMORDIAL_CHAOS: { path: 'PRIMORDIAL_CHAOS', combatMechanic: 'Chaos Entropy Gauge & Five-Element Shatter', elementalSpecialty: ['ASTRAL', 'FIRE'], facilityRole: 'Wuji Chaos Origin Furnace (+Universal Element Mastery)', explorationRole: 'Absorb Chaotic Void Storms & Transmute Primal Relics' },
    SHADOW_SAMURAI: { path: 'SHADOW_SAMURAI', combatMechanic: 'Zero-Qi Iai Focus & Instant Armor-Piercing Counter', elementalSpecialty: ['EARTH_METAL', 'LIGHTNING'], facilityRole: 'Bushido Dojo (+Sword/Blade Mastery & Crit)', explorationRole: 'Instant Ambush Elimination & Sever Traps' },
    NINPO_SHADOW: { path: 'NINPO_SHADOW', combatMechanic: 'Stealth Chakra & 1-HP Shadow Clone Decoys', elementalSpecialty: ['YIN_SHADOW', 'POISON_CORROSION'], facilityRole: 'Shadow Intelligence Network (+Scout & Evasion)', explorationRole: 'Bypass Enemy Patrols Undetected' },
    NINPO_ELEMENTAL: { path: 'NINPO_ELEMENTAL', combatMechanic: 'Hand-Seal Mudra Rhythm & Log Substitution Escape', elementalSpecialty: ['FIRE', 'WOOD_LIFE'], facilityRole: 'Explosive Tag Workshop (+Trap Defense)', explorationRole: 'Demolish Sealed Ruin Walls & Escape Lethal Ambush' },
    DIVINE_SUMMONER: { path: 'DIVINE_SUMMONER', combatMechanic: 'Higher-Realm Deity Projection (10^-12 to 5% Cosmic Scale)', elementalSpecialty: ['LIGHT_YANG', 'ASTRAL'], facilityRole: 'Cosmic Beacon Altar (+Sect Faith & Deity Blessing)', explorationRole: 'Summon Divine Heralds Across Planar Rifts' },
    DIVINE_POSSESSION: { path: 'DIVINE_POSSESSION', combatMechanic: 'Shamanic Avatar Trance & Nataraja Destruction', elementalSpecialty: ['FIRE', 'LIGHT_YANG'], facilityRole: 'Sacred Vessel Sanctum (+Physical/Divine Might)', explorationRole: 'Crush Guardian Bosses via Avatar Descent' },
    DIVINE_CHANNELER: { path: 'DIVINE_CHANNELER', combatMechanic: 'Cosmic Tether Law Imbuement & Anubis/Zeus Smite', elementalSpecialty: ['ASTRAL', 'LIGHTNING'], facilityRole: 'Pillar of Cosmic Laws (+Armor Penetration)', explorationRole: 'See Through Illusions with Borrowed Divine Sight' },
    VOID_HERETIC_PACT: { path: 'VOID_HERETIC_PACT', combatMechanic: 'Eldritch Madness Gauge & Sanity-Sacrifice True Damage', elementalSpecialty: ['YIN_SHADOW', 'ASTRAL'], facilityRole: 'Outer-Void Obelisk (+Forbidden Knowledge)', explorationRole: 'Traverse Non-Euclidean Abyssal Rifts' },
    OCCULT_MAGE: { path: 'OCCULT_MAGE', combatMechanic: 'Sacred Vow Merit & Invulnerable Yantra Tattoos', elementalSpecialty: ['EARTH_METAL', 'POISON_CORROSION'], facilityRole: 'Sacred Master Shrine (+Physical Mitigation & Effigies)', explorationRole: 'Ward Off Curses & Command Sacred Golems' },
    DEVOURING_FLESH: { path: 'DEVOURING_FLESH', combatMechanic: 'Secret Organ Hunger & Bone Armor Absorption', elementalSpecialty: ['BLOOD_DEMON', 'EARTH_METAL'], facilityRole: 'Flesh & Marrow Crucible (Converts Ores/Beasts to Stats)', explorationRole: 'Devour Ruin Monsters for Permanent Vitality' },
    NETHER_GRAVE: { path: 'NETHER_GRAVE', combatMechanic: 'Grave Soul Echo & Sect Graveyard Bone Armor', elementalSpecialty: ['YIN_SHADOW', 'EARTH_METAL'], facilityRole: 'Ancestral Necropolis (+Graveyard Scaling Shield)', explorationRole: 'Commune with Ancient Tombs & Harvest Bone Relics' },
    ANCESTRAL_RITUAL: { path: 'ANCESTRAL_RITUAL', combatMechanic: 'Rite Fervor & Multi-Generation Marrow Echo', elementalSpecialty: ['LIGHT_YANG', 'EARTH_METAL'], facilityRole: 'Hall of Lineage Tablets (+Bloodline Inheritance)', explorationRole: 'Awaken Ancestral Remnants in Historic Battlefields' },
    TIDE_VOYAGER: { path: 'TIDE_VOYAGER', combatMechanic: 'Tide Flow Maelstrom & Deep-Sea Frost Control', elementalSpecialty: ['WATER_ICE', 'WIND'], facilityRole: 'Dragon-Ship Harbor (+Fishing & River Trade)', explorationRole: 'Mastery of River/Ocean Expeditions' },
    LORE_ARCHIVIST: { path: 'LORE_ARCHIVIST', combatMechanic: 'Lore Index Analysis & Technique Mirroring', elementalSpecialty: ['ASTRAL', 'LIGHT_YANG'], facilityRole: 'Grand Scripture Archive (+Manual Registration & Study)', explorationRole: 'Decode Ancient Rubbings & Copy Lost Arts' },
    FORTUNE_GAMBLER: { path: 'FORTUNE_GAMBLER', combatMechanic: 'Destiny Stake High-Roller & Fate Reversal', elementalSpecialty: ['ASTRAL', 'FIRE'], facilityRole: 'Pavilion of Fortune (+Caravan Jackpot & Crit)', explorationRole: 'Turn High-Risk Ruin Events Into Rare Jackpots' },
    SPIRIT_HUSBANDRY: { path: 'SPIRIT_HUSBANDRY', combatMechanic: 'Growth Cycle World-Tree & Shennong Herb Canopy', elementalSpecialty: ['WOOD_LIFE', 'WATER_ICE'], facilityRole: 'Immortal Herb & Spirit Grain Fields (+Crop Yield)', explorationRole: 'Cultivate Wild Spirit Seeds in Untamed Lands' },
    ARENA_GLORY: { path: 'ARENA_GLORY', combatMechanic: 'Renown Flame Duelist & Crowd Roar Momentum', elementalSpecialty: ['FIRE', 'EARTH_METAL'], facilityRole: 'Grand Martial Colosseum (+Tournament Fame)', explorationRole: 'Challenge Regional Champions for Prestigious Trophies' }
  });

  SECT.EXPERT_SYNTHESIS_V235 = Object.freeze({
    COMBAT_SYSTEMS_ARCHITECT: { maxReactionChainPerTurn: 1, icdSeconds: 0.5, o1ReactionLookup: true },
    SIMULATION_AI_ENGINEER: { personalityDrivenWeaponCompatibility: true, karmaDestinyDrivenTargeting: true },
    CONTENT_PROGRESSION_DESIGNER: { crossSystemElementalLoop: true, realmPuzzlesToAlchemyToSmithingToCombat: true },
    PERFORMANCE_QA_LEAD: { bitmaskAndTableLookup: true, perTickConditionCache: true, targetTickBudgetMs: 3.0 }
  });


  /* =========================================================================
   * Patch v3.3.0 Phase 2: Core Gameplay Loop & Daily Living Sect
   * - PROP-11: Defector Retaliation & Home-Sect Pursuit Integration
   * - PROP-16: Peak-Sponsored Autonomous Expeditions
   * - PROP-19: Discipline Hall Tribunal & Sect Justice System
   * - PROP-35: Sect Automation & Executive QoL Dashboard
   * ========================================================================= */

  /* ---------- [PROP-11] Defector Retaliation & Home-Sect Pursuit ---------- */
  SECT.ensureDefectorPursuit = W => {
    if (!W || !W.sect) return null;
    if (!W.sect.defectorPursuitState || typeof W.sect.defectorPursuitState !== 'object') {
      W.sect.defectorPursuitState = {
        bySectId: {},
        activeUltimatum: null,
        history: []
      };
    }
    W.sect.activePursuitUltimatum = W.sect.defectorPursuitState.activeUltimatum || null;
    return W.sect.defectorPursuitState;
  };

  SECT.recordDefectorRecruitment = (W, pris, newNpc) => {
    const st = SECT.ensureDefectorPursuit(W);
    if (!st || !pris || !newNpc) return null;
    const sid = pris.sectId || 'S0';
    if (!st.bySectId[sid]) {
      st.bySectId[sid] = {
        sectId: sid,
        sectNameTh: pris.sectNameTh || 'สำนักเดิม',
        heat: 0,
        defectorIds: []
      };
    }
    const entry = st.bySectId[sid];
    entry.heat = (entry.heat || 0) + 25 + ((pris.stage || 1) * 5);
    if (!entry.defectorIds.includes(newNpc.id)) entry.defectorIds.push(newNpc.id);
    return entry;
  };

  SECT.tickDefectorPursuit = (W, opts) => {
    opts = opts || {};
    const st = SECT.ensureDefectorPursuit(W);
    if (!st) return { ok: false, reason: 'no-pursuit-state' };
    if (st.activeUltimatum && st.activeUltimatum.status === 'PENDING' && !opts.forceNew) {
      return { ok: true, ultimatum: st.activeUltimatum, alreadyPending: true };
    }
    const candidates = Object.values(st.bySectId).filter(e => e && (e.heat || 0) >= 40);
    for (const entry of candidates) {
      const defId = (entry.defectorIds || []).slice().reverse().find(id => W.byId && W.byId[id] && !W.byId[id].dead && !W.byId[id].exiled && (!W.byId[id].renegadeOrigin || W.byId[id].renegadeOrigin.pursuitStatus === 'PROTECTED'));
      const defNpc = defId ? W.byId[defId] : (W.npcs || []).find(n => n && !n.dead && !n.exiled && n.renegadeOrigin && n.renegadeOrigin.sectId === entry.sectId);
      if (!defNpc) continue;
      const stage = (defNpc.cult && defNpc.cult.stage) || 2;
      const ultimatum = {
        id: 'ULT_' + (W.day || 360) + '_' + entry.sectId,
        sectId: entry.sectId,
        sectNameTh: entry.sectNameTh || 'สำนักเดิม',
        defectorNpcId: defNpc.id,
        defectorNameTh: HC.fullName(defNpc),
        heat: entry.heat,
        ransomDemand: 180 + stage * 60,
        issuedDay: W.day || 360,
        status: 'PENDING'
      };
      st.activeUltimatum = ultimatum;
      W.sect.activePursuitUltimatum = ultimatum;
      if (!opts.quiet && W.log) {
        W.log('diplomacy', '📜 คำขาดทวงคนแปรพักตร์: 「' + ultimatum.sectNameTh + '」ยื่นคำขาดให้ส่งตัว「' + ultimatum.defectorNameTh + '」คืน หรือจ่ายค่าชดเชย ' + ultimatum.ransomDemand + ' ศิลาปราณ!', [defNpc.id]);
      }
      return { ok: true, ultimatum };
    }
    return { ok: false, reason: 'no-eligible-pursuit' };
  };

  SECT.resolveDefectorUltimatum = (W, decision, opts) => {
    opts = opts || {};
    const st = SECT.ensureDefectorPursuit(W);
    const ult = st && st.activeUltimatum;
    if (!ult || ult.status !== 'PENDING') return { ok: false, reason: 'no-active-ultimatum' };
    const dec = String(decision || 'PROTECT_AND_FIGHT').toUpperCase();
    const defNpc = W.byId && W.byId[ult.defectorNpcId];
    const entry = st.bySectId[ult.sectId] || { heat: ult.heat || 50 };
    const homeSect = (W.world && Array.isArray(W.world.sects) && W.world.sects.find(s => s && (s.id === ult.sectId || s.name === ult.sectNameTh)))
      || (W.world && Array.isArray(W.world.allSects) && W.world.allSects.find(s => s && (s.id === ult.sectId || s.name === ult.sectNameTh)));

    if (dec === 'COMPENSATE_STONES') {
      const demand = ult.ransomDemand || 240;
      if ((W.sect.stones || 0) < demand) {
        return { ok: false, reason: 'insufficient-stones', required: demand, available: W.sect.stones || 0 };
      }
      if (ECO && ECO.spend) ECO.spend(W, demand, 'จ่ายค่าชดเชยยุติการไล่ล่าศิษย์แปรพักตร์แก่ ' + ult.sectNameTh);
      else W.sect.stones -= demand;
      if (homeSect) {
        homeSect.treasury = (homeSect.treasury || 0) + demand;
        if (homeSect.resources && typeof homeSect.resources === 'object') {
          homeSect.resources.spiritStones = (homeSect.resources.spiritStones || 0) + demand;
        }
      } else {
        W.world = W.world || {};
        W.world.resourcePool = W.world.resourcePool || { stones: 50000, herbs: 5000, ores: 5000 };
        W.world.resourcePool.stones += demand;
      }
      if (defNpc) {
        defNpc.renegadeOrigin = defNpc.renegadeOrigin || {};
        defNpc.renegadeOrigin.pursuitStatus = 'PARDONED';
        defNpc.sat = clamp((defNpc.sat || 70) + 12, 0, 100);
      }
      entry.heat = 0;
      ult.status = 'RESOLVED';
      ult.resolution = 'COMPENSATE_STONES';
      st.history.unshift(Object.assign({}, ult));
      st.activeUltimatum = null;
      W.sect.activePursuitUltimatum = null;
      return { ok: true, decision: dec, paidStones: demand, ultimatum: ult };
    }

    if (dec === 'EXTRADE_DEFECTOR') {
      if (defNpc) {
        defNpc.exiled = true;
        if (g.SIM && g.SIM.retire) g.SIM.retire(W, defNpc);
      }
      (W.npcs || []).forEach(n => { if (n && !n.dead) n.sat = clamp((n.sat || 65) - 8, 0, 100); });
      entry.heat = 0;
      ult.status = 'RESOLVED';
      ult.resolution = 'EXTRADE_DEFECTOR';
      st.history.unshift(Object.assign({}, ult));
      st.activeUltimatum = null;
      W.sect.activePursuitUltimatum = null;
      return { ok: true, decision: dec, ultimatum: ult };
    }

    // Default: PROTECT_AND_FIGHT
    if (defNpc) {
      defNpc.sat = clamp((defNpc.sat || 70) + 15, 0, 100);
      defNpc.renegadeOrigin = defNpc.renegadeOrigin || {};
      defNpc.renegadeOrigin.gratitude = (defNpc.renegadeOrigin.gratitude || 45) + 20;
      defNpc.renegadeOrigin.pursuitStatus = 'DEFENDED_IN_BATTLE';
      if (defNpc.h && defNpc.h.personality) {
        defNpc.h.personality.loyalty = clamp((defNpc.h.personality.loyalty || 65) + 20, 0, 100);
      }
    }
    entry.heat = Math.max(0, (entry.heat || 50) - 30);
    ult.status = 'RESOLVED';
    ult.resolution = 'PROTECT_AND_FIGHT';
    st.history.unshift(Object.assign({}, ult));
    st.activeUltimatum = null;
    W.sect.activePursuitUltimatum = null;
    return { ok: true, decision: 'PROTECT_AND_FIGHT', ultimatum: ult, defectorId: defNpc ? defNpc.id : null };
  };

  /* ---------- [PROP-16] Peak-Sponsored Autonomous Expeditions ---------- */
  PEAKS.launchPeakExpedition = (W, peakId, opts) => {
    opts = opts || {};
    const pk = PEAKS.ensure(W);
    const pid = PEAKS.resolvePeakId(peakId);
    const pObj = pk && pk.byId && pk.byId[pid];
    if (!pObj) return { ok: false, reason: 'invalid-peak' };
    if (!pObj.founded) return { ok: false, reason: 'peak-not-founded' };

    const curDay = W.day || 360;
    if (!opts.force && pObj.lastExpeditionDay && (curDay - pObj.lastExpeditionDay) < 15) {
      return { ok: false, reason: 'cooldown-active', daysRemaining: 15 - (curDay - pObj.lastExpeditionDay) };
    }

    pObj.vault = pObj.vault || { stones: pObj.treasuryStones || 0, herbs: 0, ores: 0, pills: pObj.pillReserve || 0 };
    const costStones = opts.costStones != null ? opts.costStones : 30;
    let paidFrom = 'PEAK_VAULT';
    if ((pObj.treasuryStones || 0) >= costStones) {
      pObj.treasuryStones -= costStones;
      pObj.vault.stones = pObj.treasuryStones;
    } else if ((W.sect.stones || 0) >= costStones) {
      paidFrom = 'CENTRAL_TREASURY';
      if (ECO && ECO.spend) ECO.spend(W, costStones, 'งบเสบียงทัพสำรวจประจำ' + pObj.nameTh);
      else W.sect.stones -= costStones;
    } else {
      return { ok: false, reason: 'insufficient-stones', required: costStones };
    }

    const party = (pObj.memberIds || []).map(id => W.byId && W.byId[id]).filter(n => n && !n.dead && !n.exiled).slice(0, 3);
    if (!party.length) {
      const fallback = (W.npcs || []).find(n => n && !n.dead && !n.exiled);
      if (fallback) party.push(fallback);
    }

    W.world = W.world || {};
    W.world.resourcePool = W.world.resourcePool || { stones: 50000, herbs: 5000, ores: 5000 };
    W.world.resourcePool.stones += costStones;
    const rawYield = 120 + party.length * 20;
    const totalStones = Math.max(0, Math.min(W.world.resourcePool.stones, rawYield));
    W.world.resourcePool.stones -= totalStones;

    const peakShare = Math.round(totalStones * 0.70);
    const sectShare = totalStones - peakShare;
    pObj.treasuryStones = (pObj.treasuryStones || 0) + peakShare;
    pObj.vault.stones = pObj.treasuryStones;
    pObj.vault.herbs = (pObj.vault.herbs || 0) + 6;
    pObj.vault.ores = (pObj.vault.ores || 0) + 4;
    if (ECO && ECO.earn) ECO.earn(W, sectShare, 'ส่วนแบ่งภาษี 30% จากทัพสำรวจ' + pObj.nameTh);
    else W.sect.stones = (W.sect.stones || 0) + sectShare;

    pObj.lastExpeditionDay = curDay;
    party.forEach(m => { m.merit = (m.merit || 0) + 12; });

    const chron = (g.EXPED && g.EXPED.recordChronicle) ? g.EXPED.recordChronicle(W, {
      category: 'SECT_PEAK_POLITICS',
      reportFormat: 'PEAK_HALL_SCROLL',
      icon: pObj.icon || '⛰️',
      involvedSects: [W.sect.name],
      involvedFigures: party.map(m => HC.fullName(m)),
      npcIds: party.map(m => m.id),
      titleTh: 'ทัพสำรวจประจำยอดเขา: 「' + pObj.nameTh + '」เก็บเกี่ยวทรัพยากรกลับสำนัก',
      storyTh: 'คณะศิษย์แห่ง「' + pObj.nameTh + '」ออกสำรวจแหล่งทรัพยากรตามสายวิถี เก็บเกี่ยวศิลาปราณรวม ' + totalStones + ' ก้อน แบ่งเข้าคลังยอดเขา 70% (' + peakShare + ' ก้อน) และส่งเข้าคลังกลางสำนัก 30% (' + sectShare + ' ก้อน)',
      originCauseTh: 'การจัดส่งทัพสำรวจเฉพาะทางของ「' + pObj.nameTh + '」',
      actorChainTh: pObj.nameTh + ' ➔ ส่งคณะสำรวจ ' + party.length + ' คน ➔ แบ่งปันทรัพยากร 70/30',
      systemImpactTh: 'คลังยอดเขา +' + peakShare + ' ศิลา · คลังกลางสำนัก +' + sectShare + ' ศิลา',
      directorInsightTh: 'การให้แต่ละยอดเขาออกหาทรัพยากรเองช่วยลดภาระการคลังส่วนกลางและสร้างความมั่งคั่งเฉพาะสายวิถี',
      consequenceTh: pObj.nameTh + ' ได้รับศิลาปราณ +' + peakShare,
      quiet: opts.quiet
    }) : null;

    return {
      ok: true,
      peakId: pObj.id,
      paidFrom,
      costStones,
      totalStones,
      peakShare,
      sectShare,
      partyIds: party.map(m => m.id),
      chronicle: chron
    };
  };

  PEAKS.dailyTick = (W, opts) => {
    opts = opts || {};
    const baseRes = opts.skipBaseTick ? { ok: true } : PEAKS.tick(W, opts);
    const founded = PEAKS.getVisibleFoundedPeaks(W);
    const expeditions = [];
    for (const pObj of founded) {
      if (pObj && pObj.masterId && (pObj.treasuryStones || 0) < 80) {
        const exRes = PEAKS.launchPeakExpedition(W, pObj.id, { quiet: true });
        if (exRes && exRes.ok) expeditions.push(exRes);
      }
    }
    return Object.assign({}, baseRes, { expeditions });
  };

  /* ---------- [PROP-19] Discipline Hall Tribunal & Sect Justice System ---------- */
  const TRIBUNAL = {};
  TRIBUNAL.OFFENSE_TYPES = Object.freeze({
    PILFER_SUPPLIES: { id: 'PILFER_SUPPLIES', titleTh: 'ยักยอกเสบียงและทรัพยากรสำนัก', severity: 2 },
    BULLY_DISCIPLE: { id: 'BULLY_DISCIPLE', titleTh: 'รังแกและทำร้ายศิษย์ร่วมสำนักโดยพลการ', severity: 2 },
    FACTION_CORRUPTION: { id: 'FACTION_CORRUPTION', titleTh: 'สมคบคิดเล่นพรรคเล่นพวกทุจริตต่อหน้าที่', severity: 3 },
    VOW_DESERTION: { id: 'VOW_DESERTION', titleTh: 'ละเมิดกฎเหล็กและทอดทิ้งหน้าที่ยามวิกฤต', severity: 3 }
  });

  TRIBUNAL.ensure = W => {
    if (!W || !W.sect) return null;
    if (!W.sect.tribunal || typeof W.sect.tribunal !== 'object') {
      W.sect.tribunal = {
        activeCases: [],
        history: [],
        stats: { resolved: 0, pardoned: 0, punished: 0 },
        nextCaseSeq: 1
      };
    }
    return W.sect.tribunal;
  };

  TRIBUNAL.fileCase = (W, offenderNpcOrId, offenseType, meta) => {
    meta = meta || {};
    const tb = TRIBUNAL.ensure(W);
    if (!tb) return { ok: false, reason: 'no-tribunal' };
    const offender = (typeof offenderNpcOrId === 'object' && offenderNpcOrId) ? offenderNpcOrId : (W && W.byId && W.byId[offenderNpcOrId]);
    if (!offender) return { ok: false, reason: 'offender-not-found' };
    const spec = TRIBUNAL.OFFENSE_TYPES[offenseType] || TRIBUNAL.OFFENSE_TYPES.PILFER_SUPPLIES;
    const item = {
      id: 'CASE_' + (tb.nextCaseSeq++),
      offenderId: offender.id,
      offenderNameTh: HC.fullName(offender),
      offenseType: spec.id,
      titleTh: spec.titleTh,
      severity: spec.severity,
      filedDay: W.day || 360,
      status: 'OPEN',
      victimId: meta.victimId || null
    };
    tb.activeCases.push(item);
    return { ok: true, caseItem: item };
  };

  TRIBUNAL.VALID_VERDICTS = Object.freeze(['LENIENT_WARNING', 'SEVERE_DUNGEON_DETENTION', 'MERIT_FINE_AND_PENANCE']);

  TRIBUNAL.adjudicateCase = (W, caseId, verdict, opts) => {
    opts = opts || {};
    const tb = TRIBUNAL.ensure(W);
    if (!tb) return { ok: false, reason: 'no-tribunal' };
    const vKey = String(verdict || 'MERIT_FINE_AND_PENANCE').toUpperCase();
    if (!TRIBUNAL.VALID_VERDICTS.includes(vKey)) {
      return { ok: false, reason: 'invalid-verdict', verdict: vKey };
    }
    const hasExplicitCaseId = caseId !== undefined && caseId !== null && caseId !== '';
    const idx = hasExplicitCaseId ? tb.activeCases.findIndex(c => c && c.id === caseId) : (tb.activeCases.length ? 0 : -1);
    if (idx < 0) return { ok: false, reason: 'case-not-found', caseId };
    const cItem = tb.activeCases[idx];
    if (!cItem) return { ok: false, reason: 'case-not-found' };
    tb.activeCases.splice(idx, 1);

    const offender = W.byId && W.byId[cItem.offenderId];
    const pol = SECT.ensureInternalPolitics ? SECT.ensureInternalPolitics(W) : (W.sect.politics || {});

    if (vKey === 'LENIENT_WARNING') {
      tb.stats.pardoned = (tb.stats.pardoned || 0) + 1;
      if (offender) {
        offender.sat = clamp((offender.sat || 60) + 6, 0, 100);
        if (offender.h && offender.h.state) offender.h.state.stress = Math.max(0, (offender.h.state.stress || 0) - 8);
      }
      W.sect.suspicion = clamp((W.sect.suspicion || 0) + 2, 0, 100);
    } else if (vKey === 'SEVERE_DUNGEON_DETENTION') {
      tb.stats.punished = (tb.stats.punished || 0) + 1;
      if (offender) {
        offender.merit = Math.max(0, (offender.merit || 0) - 50);
        offender.detainedUntilDay = (W.day || 360) + 7;
        offender.jail = Math.max(offender.jail || 0, ((W.t || 0) + 7 * 1440));
        offender.sat = clamp((offender.sat || 60) - 12, 0, 100);
        if (g.AI && g.AI.interruptFor) g.AI.interruptFor(W, offender);
      }
      W.sect.suspicion = Math.max(0, (W.sect.suspicion || 0) - 10);
      if (pol) pol.undercurrent = Math.max(0, (pol.undercurrent || 0) - 8);
    } else {
      // MERIT_FINE_AND_PENANCE
      tb.stats.punished = (tb.stats.punished || 0) + 1;
      if (offender) {
        offender.merit = Math.max(0, (offender.merit || 0) - 25);
        offender.sat = clamp((offender.sat || 60) - 4, 0, 100);
      }
      if (cItem.victimId && W.byId && W.byId[cItem.victimId]) {
        W.byId[cItem.victimId].sat = clamp((W.byId[cItem.victimId].sat || 65) + 8, 0, 100);
      }
      if (pol) pol.undercurrent = Math.max(0, (pol.undercurrent || 0) - 4);
    }

    tb.stats.resolved = (tb.stats.resolved || 0) + 1;
    cItem.status = 'ADJUDICATED';
    cItem.verdict = vKey;
    cItem.resolvedDay = W.day || 360;
    tb.history.unshift(cItem);
    if (tb.history.length > 30) tb.history.length = 30;

    const judge = opts.judge || SECT.holder(W, 'discipline') || W.byId[W.sect.masterId];
    const chron = (g.EXPED && g.EXPED.recordChronicle) ? g.EXPED.recordChronicle(W, {
      category: 'INTERNAL',
      reportFormat: 'DISCIPLINE_EDICT',
      icon: '⚖️',
      involvedSects: [W.sect.name],
      involvedFigures: [judge ? HC.fullName(judge) : 'หอวินัย', cItem.offenderNameTh],
      npcIds: [judge && judge.id, cItem.offenderId].filter(Boolean),
      titleTh: 'คำพิพากษาศาลหอวินัย: คดี「' + cItem.titleTh + '」(' + cItem.offenderNameTh + ')',
      storyTh: (judge ? HC.fullName(judge) : 'ผู้คุมกฎสำนัก') + ' ขึ้นบัลลังก์ไต่สวนคดี「' + cItem.titleTh + '」ของ ' + cItem.offenderNameTh + ' และมีคำสั่งพิพากษาด้วยระดับโทษ ' + vKey,
      originCauseTh: cItem.titleTh,
      actorChainTh: (judge ? HC.fullName(judge) : 'หอวินัย') + ' ➔ พิพากษา ' + cItem.offenderNameTh + ' (' + vKey + ')',
      systemImpactTh: 'คลี่คลายคดีหอวินัย · รักษาระเบียบและลดคลื่นใต้น้ำในสำนัก',
      directorInsightTh: 'การบังคับใช้กฎสำนักอย่างเที่ยงธรรมช่วยยับยั้งการทุจริตและคุ้มครองศิษย์ชั้นผู้น้อย',
      consequenceTh: 'ตัดสินคดีด้วยโทษ ' + vKey,
      quiet: opts.quiet
    }) : null;

    return { ok: true, caseItem: cItem, verdict: vKey, chronicle: chron };
  };
  SECT.TRIBUNAL = TRIBUNAL;

  /* ---------- [PROP-35] Sect Automation & Executive QoL Dashboard ---------- */
  const AUTOMATION = {};
  AUTOMATION.ensure = W => {
    if (!W || !W.sect) return null;
    if (!W.sect.automationPolicy || typeof W.sect.automationPolicy !== 'object') {
      W.sect.automationPolicy = {
        enabled: true,
        autoAssignNewDisciplesToPeaks: true,
        autoDistributeBreakthroughPills: true,
        autoRepairLeylines: true,
        autoTriggerClosedDoorOnBottleneck: false,
        lastRunDay: 0
      };
    }
    return W.sect.automationPolicy;
  };

  AUTOMATION.toggleRule = (W, ruleKey, val) => {
    const pol = AUTOMATION.ensure(W);
    if (!pol) return { ok: false, reason: 'no-policy' };
    if (!(ruleKey in pol)) return { ok: false, reason: 'unknown-rule', ruleKey };
    pol[ruleKey] = typeof val === 'boolean' ? val : !pol[ruleKey];
    return { ok: true, ruleKey, value: pol[ruleKey], policy: pol };
  };

  AUTOMATION.runDailyAutomation = (W, opts) => {
    opts = opts || {};
    const pol = AUTOMATION.ensure(W);
    if (!pol || !pol.enabled) return { ok: false, reason: 'automation-disabled' };

    let assignedCount = 0;
    let repairedAnchors = 0;
    let pillsDistributed = 0;
    let seclusionStarted = 0;

    if (pol.autoAssignNewDisciplesToPeaks && SECT.PEAKS && SECT.PEAKS.autoAssignUnassignedDisciples) {
      const aRes = SECT.PEAKS.autoAssignUnassignedDisciples(W, { quiet: true, allowDecree: false });
      if (aRes && Array.isArray(aRes.assigned)) assignedCount = aRes.assigned.length;
    }

    if (pol.autoRepairLeylines && SECT.LEYLINE_GRID) {
      const grid = SECT.LEYLINE_GRID.ensure(W);
      if (grid && Array.isArray(grid.anchors)) {
        for (const anc of grid.anchors) {
          if (anc && ((anc.integrity != null && anc.integrity < 60) || !anc.active) && (W.sect.stones || 0) >= 200) {
            const rRes = SECT.LEYLINE_GRID.repairAnchor(W, anc.id);
            if (rRes && rRes.ok) repairedAnchors++;
          }
        }
      }
    }

    if (pol.autoDistributeBreakthroughPills && Array.isArray(W.npcs)) {
      const stock = (W.sect && (W.sect.stock || W.sect.inv)) || {};
      const btKey = Object.keys(stock).find(k => stock[k] > 0 && (k.includes('BT_') || k === 'P:BASIC_QI' || k === 'BASIC_QI'));
      if (btKey) {
        for (const n of W.npcs) {
          if (!n || n.dead || n.exiled || !n.cult || stock[btKey] <= 0) continue;
          const thresh = (g.CULT && g.CULT.threshold) ? g.CULT.threshold(n) : 100;
          if ((n.cult.prog || 0) >= thresh * 0.95) {
            stock[btKey]--;
            n.inv = n.inv || {};
            n.inv.pills = n.inv.pills || {};
            n.inv.pills[btKey] = (n.inv.pills[btKey] || 0) + 1;
            pillsDistributed++;
          }
        }
      }
    }

    if (pol.autoTriggerClosedDoorOnBottleneck && g.CULT && g.CULT.enterClosedDoorSeclusion && Array.isArray(W.npcs)) {
      for (const n of W.npcs) {
        if (!n || n.dead || n.exiled || !n.cult || (n.closedDoorSeclusion && n.closedDoorSeclusion.active)) continue;
        const thresh = g.CULT.threshold ? g.CULT.threshold(n) : 100;
        if ((n.cult.prog || 0) >= thresh * 0.98) {
          const sRes = g.CULT.enterClosedDoorSeclusion(W, n, { days: 12, quiet: true });
          if (sRes && sRes.ok) seclusionStarted++;
        }
      }
    }

    pol.lastRunDay = W.day || 360;
    return {
      ok: true,
      assignedCount,
      repairedAnchors,
      pillsDistributed,
      seclusionStarted
    };
  };
  AUTOMATION.runAutomationTick = AUTOMATION.runDailyAutomation;
  SECT.runAutomationTick = AUTOMATION.runDailyAutomation;

  AUTOMATION.getExecutiveAlerts = W => {
    if (!W || !W.sect) return { bottleneckCount: 0, pendingTribunalCases: 0, damagedLeylineAnchors: 0, activePursuitUltimatum: null, alerts: [] };
    const bottleneckCount = (W.npcs || []).filter(n => n && !n.dead && !n.exiled && n.cult && (n.cult.prog || 0) >= ((g.CULT && g.CULT.threshold ? g.CULT.threshold(n) : 100) * 0.95)).length;
    const tb = TRIBUNAL.ensure(W);
    const pendingTribunalCases = tb ? tb.activeCases.length : 0;
    const grid = LEYLINE_GRID.ensure(W);
    const damagedLeylineAnchors = grid ? grid.anchors.filter(a => a && ((a.integrity != null && a.integrity < 100) || !a.active)).length : 0;
    const stPursuit = SECT.ensureDefectorPursuit(W);
    const activePursuitUltimatum = stPursuit ? stPursuit.activeUltimatum : null;
    const alerts = [];
    if (bottleneckCount > 0) alerts.push({ type: 'BOTTLENECK', count: bottleneckCount, textTh: 'ศิษย์ติดคอขวดตบะพร้อมทะลวงด่าน ' + bottleneckCount + ' คน' });
    if (pendingTribunalCases > 0) alerts.push({ type: 'TRIBUNAL', count: pendingTribunalCases, textTh: 'คดีค้างรอตัดสินในศาลหอวินัย ' + pendingTribunalCases + ' คดี' });
    if (damagedLeylineAnchors > 0) alerts.push({ type: 'LEYLINE', count: damagedLeylineAnchors, textTh: 'เสาค่ายกลชีพจรธรณีชำรุด ' + damagedLeylineAnchors + ' ต้น' });
    if (activePursuitUltimatum) alerts.push({ type: 'PURSUIT', count: 1, textTh: 'คำขาดทวงศิษย์แปรพักตร์จาก ' + activePursuitUltimatum.sectNameTh });
    return { bottleneckCount, pendingTribunalCases, damagedLeylineAnchors, activePursuitUltimatum, alerts };
  };
  SECT.AUTOMATION = AUTOMATION;


  /* =========================================================================
   * Patch v3.4.0 Phase 3:
   * - PROP-08: Five-Element Sect Grand Protective Barrier (SECT.ELEMENTAL_BARRIER)
   * - PROP-32: Ancestral Pavilion Relic Vault & Founder Phantom Invocation (SECT.ANCESTRAL_PAVILION)
   * ========================================================================= */

  const ELEMENTAL_BARRIER = {};
  ELEMENTAL_BARRIER.ELEMENTS = Object.freeze(['WOOD_LIFE', 'FIRE', 'EARTH_METAL', 'WATER_ICE', 'LIGHTNING', 'METAL', 'WOOD', 'WATER', 'EARTH']);
  ELEMENTAL_BARRIER.DOME_COLOR_PALETTE = Object.freeze({
    METAL: { id: 'METAL', colorHex: '#f1c40f', nameTh: 'ธาตุทอง (วัชระสุวรรณ)' },
    EARTH_METAL: { id: 'EARTH_METAL', colorHex: '#f1c40f', nameTh: 'ธาตุทองปฐพี (สุวรรณศิลา)' },
    WOOD: { id: 'WOOD', colorHex: '#2ecc71', nameTh: 'ธาตุไม้ (พฤกษาอมตะ)' },
    WOOD_LIFE: { id: 'WOOD_LIFE', colorHex: '#2ecc71', nameTh: 'ธาตุไม้ปราณชีวิต (พฤกษาอมตะ)' },
    WATER: { id: 'WATER', colorHex: '#3498db', nameTh: 'ธาตุน้ำ (วารีเหมันต์)' },
    WATER_ICE: { id: 'WATER_ICE', colorHex: '#3498db', nameTh: 'ธาตุน้ำเหมันต์ (วารีเหมันต์)' },
    FIRE: { id: 'FIRE', colorHex: '#e74c3c', nameTh: 'ธาตุไฟ (อัคคีผลาญฟ้า)' },
    LIGHTNING: { id: 'LIGHTNING', colorHex: '#e74c3c', nameTh: 'ธาตุอัสนีอัคคี (อัคคีอสนีบาต)' },
    EARTH: { id: 'EARTH', colorHex: '#e67e22', nameTh: 'ธาตุดิน (ปฐพีไร้พ่าย)' },
    ทอง: { id: 'METAL', colorHex: '#f1c40f', nameTh: 'ธาตุทอง (วัชระสุวรรณ)' },
    ไม้: { id: 'WOOD', colorHex: '#2ecc71', nameTh: 'ธาตุไม้ (พฤกษาอมตะ)' },
    น้ำ: { id: 'WATER', colorHex: '#3498db', nameTh: 'ธาตุน้ำ (วารีเหมันต์)' },
    ไฟ: { id: 'FIRE', colorHex: '#e74c3c', nameTh: 'ธาตุไฟ (อัคคีผลาญฟ้า)' },
    ดิน: { id: 'EARTH', colorHex: '#e67e22', nameTh: 'ธาตุดิน (ปฐพีไร้พ่าย)' }
  });

  ELEMENTAL_BARRIER.resolveDomeColor = elementKey => {
    const spec = ELEMENTAL_BARRIER.DOME_COLOR_PALETTE[elementKey] || ELEMENTAL_BARRIER.DOME_COLOR_PALETTE[String(elementKey || '').toUpperCase()] || ELEMENTAL_BARRIER.DOME_COLOR_PALETTE.EARTH_METAL;
    return spec.colorHex;
  };

  ELEMENTAL_BARRIER.ensure = W => {
    if (!W || !W.sect) return null;
    if (!W.sect.elementalBarrier || typeof W.sect.elementalBarrier !== 'object') {
      W.sect.elementalBarrier = {
        active: true,
        element: W.sect.barrierElement || 'EARTH_METAL',
        level: 1,
        barrierHp: 1500,
        barrierMaxHp: 1500,
        absorbRatio: 0.35,
        totalAbsorbed: 0
      };
    }
    if (W.sect.barrierActive === undefined) W.sect.barrierActive = W.sect.elementalBarrier.active !== false;
    if (!W.sect.barrierElement) W.sect.barrierElement = W.sect.elementalBarrier.element || 'EARTH_METAL';
    return W.sect.elementalBarrier;
  };

  ELEMENTAL_BARRIER.setBarrierElement = (W, element) => {
    const bar = ELEMENTAL_BARRIER.ensure(W);
    if (!bar) return { ok: false, reason: 'no-barrier' };
    const el = (ELEMENTAL_BARRIER.ELEMENTS.includes(element) || ELEMENTAL_BARRIER.DOME_COLOR_PALETTE[element]) ? element : 'EARTH_METAL';
    bar.element = el;
    W.sect.barrierElement = el;
    return { ok: true, element: bar.element, colorHex: ELEMENTAL_BARRIER.resolveDomeColor(el), barrier: bar };
  };

  ELEMENTAL_BARRIER.getBarrierVisualSpec = W => {
    const bar = ELEMENTAL_BARRIER.ensure(W);
    const el = (W && W.sect && W.sect.barrierElement) || (bar && bar.element) || 'EARTH_METAL';
    const pal = ELEMENTAL_BARRIER.DOME_COLOR_PALETTE[el] || ELEMENTAL_BARRIER.DOME_COLOR_PALETTE.EARTH_METAL;
    const active = !!(W && W.sect && W.sect.barrierActive !== false && (!bar || bar.active !== false));
    return {
      active,
      element: el,
      colorHex: pal.colorHex,
      nameTh: pal.nameTh,
      barrierHp: bar ? bar.barrierHp : 1500,
      barrierMaxHp: bar ? bar.barrierMaxHp : 1500
    };
  };

  ELEMENTAL_BARRIER.rechargeBarrier = (W, stonesToSpend, opts) => {
    opts = opts || {};
    const bar = ELEMENTAL_BARRIER.ensure(W);
    if (!bar) return { ok: false, reason: 'no-barrier' };
    const spend = Math.max(1, Math.round(Number(stonesToSpend) || 100));
    if ((W.sect.stones || 0) < spend) {
      return { ok: false, reason: 'insufficient-stones', required: spend, available: W.sect.stones || 0 };
    }
    if (ECO && ECO.spend) ECO.spend(W, spend, 'ป้อนศิลาปราณเสริมม่านพลังพิทักษ์สำนักห้าธาตุ');
    else W.sect.stones -= spend;
    W.world = W.world || {};
    W.world.resourcePool = W.world.resourcePool || { stones: 50000, herbs: 5000, ores: 5000 };
    W.world.resourcePool.stones += spend;

    const restored = spend * 5;
    bar.barrierMaxHp = Math.max(bar.barrierMaxHp || 1500, 1500);
    bar.barrierHp = Math.min(bar.barrierMaxHp, (bar.barrierHp || 0) + restored);
    bar.active = bar.barrierHp > 0;
    return { ok: true, spent: spend, restoredHp: restored, barrierHp: bar.barrierHp, barrierMaxHp: bar.barrierMaxHp };
  };
  SECT.ELEMENTAL_BARRIER = ELEMENTAL_BARRIER;

  const ANCESTRAL_PAVILION = {};
  ANCESTRAL_PAVILION.ensure = W => {
    if (!W || !W.sect) return null;
    if (!W.sect.ancestralPavilion || typeof W.sect.ancestralPavilion !== 'object') {
      W.sect.ancestralPavilion = {
        relics: [],
        memorialTablets: [],
        incensePoints: 100,
        lastPhantomInvokeDay: 0,
        activePhantomBuffUntil: 0,
        invocationsCount: 0
      };
    }
    return W.sect.ancestralPavilion;
  };

  ANCESTRAL_PAVILION.enshrineAncestralRelic = (W, weaponOrRelic, ancestorNameTh) => {
    const pav = ANCESTRAL_PAVILION.ensure(W);
    if (!pav || !weaponOrRelic) return { ok: false, reason: 'invalid-relic' };
    const uid = weaponOrRelic.uid || weaponOrRelic.id || ('RELIC_' + (pav.relics.length + 1));
    if (pav.relics.some(r => r && r.uid === uid)) {
      return { ok: false, reason: 'duplicate-relic', uid };
    }
    const relicEntry = {
      uid,
      nameTh: weaponOrRelic.nameTh || 'ศาสตราบรรพชน',
      ancestorNameTh: ancestorNameTh || (weaponOrRelic.weaponSpirit && weaponOrRelic.weaponSpirit.imbuedElderSoul && weaponOrRelic.weaponSpirit.imbuedElderSoul.elderNameTh) || 'บูรพาจารย์ผู้ก่อตั้ง',
      tier: weaponOrRelic.tier || 5,
      enshrinedDay: (W && W.day) || 360,
      auraAtkBonusPct: 0.15
    };
    pav.relics.push(relicEntry);
    pav.incensePoints = (pav.incensePoints || 0) + 25;
    return { ok: true, relic: relicEntry, totalRelics: pav.relics.length, incensePoints: pav.incensePoints };
  };

  ANCESTRAL_PAVILION.invokeFounderPhantom = (W, f, opts) => {
    opts = opts || {};
    const pav = ANCESTRAL_PAVILION.ensure(W);
    if (!pav) return { ok: false, reason: 'no-pavilion' };
    const costIncense = opts.costIncense != null ? opts.costIncense : 30;
    if (!opts.free && (pav.incensePoints || 0) < costIncense) {
      return { ok: false, reason: 'insufficient-incense', required: costIncense, available: pav.incensePoints || 0 };
    }
    pav.incensePoints = Math.max(0, (pav.incensePoints || 0) - costIncense);
    pav.lastPhantomInvokeDay = (W && W.day) || 360;
    pav.activePhantomBuffUntil = ((W && W.t) || 0) + 60;
    pav.invocationsCount = (pav.invocationsCount || 0) + 1;

    (W.npcs || []).forEach(n => {
      if (!n || n.dead || n.exiled) return;
      if (g.STATS && g.STATS.applyNamedBuff) {
        g.STATS.applyNamedBuff(n, 'fervorMight', 60, (W && W.t) || 0, { source: 'ANCESTRAL_PHANTOM' });
      }
      n.ancestralBlessing = {
        active: true,
        until: ((W && W.t) || 0) + 60,
        breakthroughBonus: 0.12,
        injuryShield: true,
        ancestorNameTh: (pav.relics[0] && pav.relics[0].ancestorNameTh) || 'ปรมาจารย์ผู้ก่อตั้งสำนัก'
      };
    });

    let phantomUnit = null;
    if (f) {
      phantomUnit = {
        id: 'FOUNDER_PHANTOM_' + ((W && W.t) || 0),
        name: 'เจตจำนงบูรพาจารย์คุ้มสำนัก',
        isSummon: true,
        isFounderPhantom: true,
        foe: true,
        tier: 6,
        element: 'LIGHT_YANG',
        hpMax: 1200,
        hp: 1200,
        dur: 30
      };
      W.foeById = W.foeById || {};
      W.foeById[phantomUnit.id] = phantomUnit;
      if (Array.isArray(f.A) && !f.A.includes(phantomUnit.id)) f.A.push(phantomUnit.id);
    }

    return {
      ok: true,
      phantom: phantomUnit,
      incenseRemaining: pav.incensePoints,
      activePhantomBuffUntil: pav.activePhantomBuffUntil
    };
  };
  SECT.ANCESTRAL_PAVILION = ANCESTRAL_PAVILION;


  /* =========================================================================
   * PATCH v3.5.0 (Phase 4: Geopolitical Hegemony & Grand Jianghu)
   *   - PROP-13: Political Faction Rebellion, Shadow Coup & Sect Master Seal Duel
   *   - PROP-14: Heretical Prodigy Disciple & 3-Chapter Mysterious Origin Questline
   *   - PROP-22: Cross-Sect Exchange Disciple System & Double-Agent Espionage
   *   - PROP-23: Jianghu Tavern Network, Rumors & Bounty Hunter Contracts
   *   - PROP-24: Midnight Black Market Secret Auction & Caravan Escort
   *   - PROP-26: Monthly Celestial Alignments & 4-Season Calamities
   * PATCH v3.6.0 (Phase 5: Generational Dynasty & Immortal Endgame)
   *   - PROP-27: 3-Layer Ancient Immortal Tomb Excavation with Traps & Legacies
   *   - PROP-28: Multi-Chapter World Crisis Endgame Saga (3 Chapters × 3 Stances)
   *   - PROP-34: 2nd–3rd Generation Clan Bloodline & Mythic Chimera Mutation
   * ========================================================================= */

  /* ---------- [PROP-13] Political Faction Mutiny, Shadow Coup & Seal Duel ---------- */
  const FACTION_MUTINY = {};
  FACTION_MUTINY.ensure = W => {
    if (!W || !W.sect) return null;
    SECT.ensureHierarchyAndPolitics(W);
    if (!W.sect.shadowPlots) W.sect.shadowPlots = [];
    if (!W.world) W.world = {};
    if (!Array.isArray(W.world.splinterSects)) W.world.splinterSects = [];
    return W.sect.internalPolitics;
  };

  FACTION_MUTINY.detectShadowCoupPlot = (W, opts) => {
    opts = opts || {};
    FACTION_MUTINY.ensure(W);
    const spymaster = SECT.holder(W, 'spymaster') || SECT.holder(W, 'censor') || SECT.holder(W, 'discipline');
    const alive = (W.npcs || []).filter(n => n && !n.dead && !n.exiled && n.id !== W.sect.masterId);
    const suspect = alive.slice().sort((a, b) => {
      const score = x => ((x.h && x.h.personality && x.h.personality.ambition) || 50) - ((x.h && x.h.values && x.h.values.integrity) || 50) + (x.rank || 1) * 10;
      return score(b) - score(a);
    })[0] || alive[0];
    if (!suspect) return { ok: false, reason: 'no-suspect' };
    const plot = {
      id: 'SHADOW_PLOT_' + ((W.day || 360)) + '_' + suspect.id,
      ringleaderId: suspect.id,
      ringleaderNameTh: HC.fullName(suspect),
      detectedById: spymaster ? spymaster.id : null,
      detectedByNameTh: spymaster ? HC.fullName(spymaster) : 'สายข่าวหอวินัย',
      day: W.day || 360,
      status: 'DETECTED'
    };
    W.sect.shadowPlots.unshift(plot);
    if (W.sect.shadowPlots.length > 20) W.sect.shadowPlots.length = 20;
    return { ok: true, plot, suspect, detectedBy: spymaster };
  };

  SECT.detectShadowCoupPlot = FACTION_MUTINY.detectShadowCoupPlot;

  SECT.triggerFactionSchismCrisis = (W, opts) => {
    opts = opts || {};
    FACTION_MUTINY.ensure(W);
    const pol = W.sect.internalPolitics;
    const alive = (W.npcs || []).filter(n => n && !n.dead && !n.exiled && n.id !== W.sect.masterId);
    if (!alive.length) return { ok: false, reason: 'no-disciples' };

    const ringleader = (opts.leaderId && W.byId && W.byId[opts.leaderId])
      || alive.slice().sort((a, b) => ((b.rank || 1) * 100 + CULT.power(b)) - ((a.rank || 1) * 100 + CULT.power(a)))[0];
    const followers = alive.filter(n => n.id !== ringleader.id && (n.factionId === ringleader.factionId || n.peakId === ringleader.peakId)).slice(0, 2);
    const rebelIds = [ringleader.id].concat(followers.map(f => f.id));

    pol.undercurrent = Math.max(pol.undercurrent || 85, opts.undercurrent != null ? opts.undercurrent : 88);
    const crisis = {
      id: 'SCHISM_' + (W.day || 360) + '_' + ringleader.id,
      day: W.day || 360,
      leaderId: ringleader.id,
      leaderNameTh: HC.fullName(ringleader),
      factionId: ringleader.factionId || 'MARTIAL_HAWK',
      rebelIds,
      demandedStones: opts.demandedStones != null ? opts.demandedStones : 250,
      undercurrentAtTrigger: pol.undercurrent,
      sealDuelChallenge: true,
      status: 'ACTIVE'
    };
    W.sect.activeSchismCrisis = crisis;

    if (g.EXPED && g.EXPED.recordChronicle && !opts.quiet) {
      g.EXPED.recordChronicle(W, {
        category: 'SECT_POLITICS',
        icon: '🗡️',
        involvedSects: [W.sect.name],
        involvedFigures: [crisis.leaderNameTh],
        npcIds: rebelIds,
        titleTh: 'วิกฤตกบฏก๊กการเมือง! 「' + crisis.leaderNameTh + '」ระดมพลท้าชิงตราประทับเจ้าสำนัก!',
        storyTh: 'คลื่นใต้น้ำทางการเมืองในสำนักพุ่งสูงถึงขีดสุด (' + pol.undercurrent + '/100) 「' + crisis.leaderNameTh + '」พร้อมผู้ติดตามได้ลุกฮือขึ้นกดดันเจ้าสำนักและท้าดวลชิงตราประทับเจ้าสำนัก หากไม่เร่งคลี่คลายจะเกิดการแยกตัวตั้งสำนักกบฏ!',
        consequenceTh: 'เกิดวิกฤตกบฏก๊กการเมือง รอการตัดสินใจของเจ้าสำนัก (เจรจา / ปราบปราม / ดวลชิงตราประทับ)',
        quiet: opts.quiet
      });
    }
    return { ok: true, crisis, ringleader, followers };
  };

  SECT.resolveFactionSchism = (W, resolutionType, opts) => {
    opts = opts || {};
    FACTION_MUTINY.ensure(W);
    const VALID_MODES = ['NEGOTIATE', 'APPEASE', 'SUPPRESS', 'PURGE', 'IMPRISON', 'SEAL_DUEL', 'DUEL', 'SPLINTER'];
    const mode = String(resolutionType || 'NEGOTIATE').toUpperCase();
    if (!VALID_MODES.includes(mode)) {
      return { ok: false, reason: 'invalid-resolution', mode };
    }
    if (!W.sect.activeSchismCrisis || W.sect.activeSchismCrisis.status !== 'ACTIVE') {
      if (!opts.autoTrigger) {
        return { ok: false, reason: 'no-active-schism' };
      }
      SECT.triggerFactionSchismCrisis(W, { quiet: true });
    }
    const crisis = W.sect.activeSchismCrisis;
    if (!crisis || crisis.status !== 'ACTIVE') return { ok: false, reason: 'no-active-schism' };

    const pol = W.sect.internalPolitics;
    const ringleader = W.byId && W.byId[crisis.leaderId];
    W.world.resourcePool = W.world.resourcePool || { stones: 50000, herbs: 5000, ores: 5000 };

    if (mode === 'NEGOTIATE' || mode === 'APPEASE') {
      const requestedStones = opts.stones != null ? Number(opts.stones) : Math.min(W.sect.stones || 0, crisis.demandedStones || 200);
      if (!Number.isFinite(requestedStones) || requestedStones < 0) {
        return { ok: false, reason: 'invalid-stones' };
      }
      const payAmt = Math.round(requestedStones);
      if (!opts.free && payAmt > (W.sect.stones || 0)) {
        return { ok: false, reason: 'insufficient-stones', required: payAmt, available: W.sect.stones || 0 };
      }
      if (!opts.free && payAmt > 0) {
        const paidOk = (ECO && ECO.pay)
          ? ECO.pay(W, payAmt, 'จัดสรรศิลาปราณเจรจาสงบศึกก๊กการเมืองของ ' + crisis.leaderNameTh)
          : ((W.sect.stones || 0) >= payAmt ? ((W.sect.stones -= payAmt), true) : false);
        if (!paidOk) return { ok: false, reason: 'insufficient-stones', required: payAmt, available: W.sect.stones || 0 };
        W.world.resourcePool.stones += payAmt;
      }
      pol.undercurrent = clamp((pol.undercurrent || 85) - 35, 0, 100);
      if (ringleader && ringleader.h && ringleader.h.state) {
        ringleader.h.state.sat = clamp((ringleader.h.state.sat || 50) + 25, 0, 100);
      }
      crisis.status = 'RESOLVED_NEGOTIATED';
      crisis.resolvedDay = W.day || 360;
      return { ok: true, mode: 'NEGOTIATE', paidStones: opts.free ? 0 : payAmt, undercurrent: pol.undercurrent, crisis };
    }

    if (mode === 'SUPPRESS' || mode === 'PURGE' || mode === 'IMPRISON') {
      pol.undercurrent = clamp((pol.undercurrent || 85) - 45, 0, 100);
      let prisoner = null;
      if (ringleader) {
        if (ringleader.post) SECT.dismiss(W, ringleader.post, 'ก่อกบฏก๊กการเมืองและถูกคุมขัง');
        ringleader.detainedUntilDay = (W.day || 360) + 14;
        ringleader.jail = Math.max(ringleader.jail || 0, ((W.t || 0) + 14 * 1440));
        if (g.AI && g.AI.interruptFor) g.AI.interruptFor(W, ringleader);
        if (g.SIM && g.SIM.guardRoster) g.SIM.guardRoster(W);
        if (SECT.capturePrisoner) {
          const capRes = SECT.capturePrisoner(W, {
            nameTh: crisis.leaderNameTh,
            sectId: 'REBEL_CLIQUE',
            sectNameTh: 'ก๊กกบฏในสำนัก',
            tier: (ringleader.cult && ringleader.cult.stage) || 4,
            sourceNpcId: ringleader.id
          }, { quiet: true });
          prisoner = (capRes && capRes.prisoner) || capRes;
          if (prisoner) prisoner.sourceNpcId = ringleader.id;
        }
      }
      crisis.status = 'RESOLVED_SUPPRESSED';
      crisis.resolvedDay = W.day || 360;
      return { ok: true, mode: 'SUPPRESS', prisoner, undercurrent: pol.undercurrent, crisis };
    }

    if (mode === 'SEAL_DUEL' || mode === 'DUEL') {
      const master = (W.byId && W.byId[W.sect.masterId]) || W.npcs[0];
      const masterPow = master ? CULT.power(master) : 500;
      const rebelPow = ringleader ? CULT.power(ringleader) : 320;
      const masterWon = opts.forceRebelWin ? false : (opts.forceMasterWin ? true : (masterPow * 1.15 >= rebelPow));
      pol.undercurrent = clamp((pol.undercurrent || 85) - 50, 0, 100);
      if (masterWon) {
        W.fame(15);
        if (ringleader && ringleader.h && ringleader.h.state) {
          ringleader.h.state.sat = clamp((ringleader.h.state.sat || 50) + 20, 0, 100);
        }
      } else if (ringleader && !ringleader.dead) {
        W.fame(-10);
        if (master && master.id !== ringleader.id) {
          master.rank = Math.max(4, (master.rank || 6) - 1);
        }
        if (ringleader.post) SECT.dismiss(W, ringleader.post, 'ก้าวขึ้นครองตราเจ้าสำนักจากการดวล');
        ringleader.rank = 6;
        W.sect.masterId = ringleader.id;
      }
      crisis.status = 'RESOLVED_SEAL_DUEL';
      crisis.duelWinner = masterWon ? 'MASTER' : 'REBEL';
      crisis.resolvedDay = W.day || 360;
      return { ok: true, mode: 'SEAL_DUEL', masterWon, undercurrent: pol.undercurrent, crisis };
    }

    // SPLINTER: Rebel leader breaks away to form a splinter sect
    W.world.splinterSeq = Math.max((W.world.splinterSeq || 0) + 1, (W.world.splinterSects ? W.world.splinterSects.length : 0) + 1);
    const splinterSect = {
      id: 'SPLINTER_SECT_' + W.world.splinterSeq,
      name: 'สำนักกบฏ' + (ringleader && ringleader.h && ringleader.h.name ? ringleader.h.name.sur : 'เงาโลหิต'),
      nameTh: 'สำนักกบฏ' + (ringleader && ringleader.h && ringleader.h.name ? ringleader.h.name.sur : 'เงาโลหิต'),
      leaderId: crisis.leaderId,
      leaderNameTh: crisis.leaderNameTh,
      memberIds: crisis.rebelIds.slice(),
      foundedDay: W.day || 360,
      alignment: 'HERETIC',
      attitude: -80,
      power: 1.35
    };
    W.world.splinterSects.push(splinterSect);
    if (Array.isArray(W.world.allSects) && !W.world.allSects.some(s => s && s.id === splinterSect.id)) {
      W.world.allSects.push(splinterSect);
    }
    for (const rid of (crisis.rebelIds || [])) {
      const rNpc = (W.byId && W.byId[rid]) || (W.npcs || []).find(n => n && n.id === rid);
      if (rNpc && rNpc.id !== W.sect.masterId) {
        if (rNpc.post) SECT.dismiss(W, rNpc.post, 'แยกตัวก่อตั้งสำนักกบฏ');
        rNpc.exiled = true;
        rNpc.splinterSectId = splinterSect.id;
        if (g.SIM && g.SIM.retire) g.SIM.retire(W, rNpc);
      }
    }
    if (g.SIM && g.SIM.guardRoster) g.SIM.guardRoster(W);
    pol.undercurrent = clamp((pol.undercurrent || 85) - 40, 0, 100);
    crisis.status = 'RESOLVED_SPLINTERED';
    crisis.splinterSect = splinterSect;
    crisis.resolvedDay = W.day || 360;
    return { ok: true, mode: 'SPLINTER', splinterSect, undercurrent: pol.undercurrent, crisis };
  };
  SECT.FACTION_MUTINY = FACTION_MUTINY;

  /* ---------- [PROP-14] 3-Chapter Hidden Origin Story Arcs & Destiny Awakening ---------- */
  const ORIGIN_ARCS = {};
  ORIGIN_ARCS.ARCHETYPES = Object.freeze({
    FALLEN_DYNASTY_HEIR: {
      id: 'FALLEN_DYNASTY_HEIR',
      nameTh: 'ทายาทราชวงศ์โบราณที่ล่มสลาย',
      icon: '👑',
      triggerStages: [3, 5, 7],
      signatureTechId: 'TECH_SWORD_1',
      awakenedTrait: {
        id: 'IMPERIAL_DRAGON_MANDATE',
        nameTh: 'ตราโองการสวรรค์มังกรจักรพรรดิ',
        cultRateBonus: 0.28,
        combatBonus: 0.20,
        btBonus: 0.12
      },
      chapters: [
        { chapter: 1, stageReq: 3, titleTh: 'บทที่ 1: หยกประจำตระกูลสั่นพ้องและมือสังหารเงา', descTh: 'เมื่อตบะบรรลุขั้น 3 หยกมังกรที่ซ่อนไว้เปล่งแสงดึงดูดมือสังหารจากราชสำนักมืดมาทวงชีวิต' },
        { chapter: 2, stageReq: 5, titleTh: 'บทที่ 2: คลังลับบรรพกษัตริย์และคำสัตย์ทวงบัลลังก์', descTh: 'เมื่อบรรลุขั้น 5 แผนที่เลือดเปิดทางสู่คลังลับโบราณ ต้องเลือกระหว่างแค้นส่วนตัวกับคุณธรรมสำนัก' },
        { chapter: 3, stageReq: 7, titleTh: 'บทที่ 3: จักรพรรดิยุทธภพตื่นรู้เหนือชะตาสวรรค์', descTh: 'เมื่อบรรลุขั้น 7 หลอมรวมปราณจักรพรรดิเข้ากับมรรคาสำนัก ปลุกสายเลือดมังกรสวรรค์อย่างสมบูรณ์' }
      ]
    },
    REINCARNATED_IMMORTAL: {
      id: 'REINCARNATED_IMMORTAL',
      nameTh: 'ร่างอวตารเซียนตกสวรรค์ที่ความทรงจำถูกผนึก',
      icon: '🌌',
      triggerStages: [3, 5, 7],
      signatureTechId: 'TECH_XIAN_1',
      awakenedTrait: {
        id: 'UNSEALED_IMMORTAL_MEMORY',
        nameTh: 'จิตวิญญาณเซียนบรรพกาลตื่นรู้',
        cultRateBonus: 0.32,
        combatBonus: 0.18,
        btBonus: 0.15
      },
      chapters: [
        { chapter: 1, stageReq: 3, titleTh: 'บทที่ 1: นิมิตอดีตชาติในห้วงฝันดารา', descTh: 'เศษความทรงจำจากแดนเซียนเริ่มคลายผนึกขณะเดินลมปราณ' },
        { chapter: 2, stageReq: 5, titleTh: 'บทที่ 2: เงาอดีตศัตรูข้ามภพและรอยแยกผนึกเซียน', descTh: 'ทัณฑ์สายฟ้าจำเพาะผ่าลงมาทดสอบว่าจิตใจปัจจุบันจะถูกอดีตชาติกลืนกินหรือไม่' },
        { chapter: 3, stageReq: 7, titleTh: 'บทที่ 3: ผสานสองภพชาติบรรลุมรรคาไร้เทียมทาน', descTh: 'หลอมรวมความทรงจำเซียนโบราณเข้ากับตัวตนในชาตินี้โดยสมบูรณ์' }
      ]
    },
    CURSED_DESTINY_CHILD: {
      id: 'CURSED_DESTINY_CHILD',
      nameTh: 'บุตรแห่งโชคชะตาต้องสาปเนตรอสูร',
      icon: '👁️',
      triggerStages: [3, 5, 7],
      signatureTechId: 'TECH_DEMON_1',
      awakenedTrait: {
        id: 'SOVEREIGN_FATE_BREAKER',
        nameTh: 'กายาฝืนชะตาทลายคำสาปสวรรค์',
        cultRateBonus: 0.26,
        combatBonus: 0.24,
        btBonus: 0.10
      },
      chapters: [
        { chapter: 1, stageReq: 3, titleTh: 'บทที่ 1: ปานคำสาปตื่นตัวในคืนเดือนมืด', descTh: 'ไอคำสาปโบราณปะทุขึ้นพร้อมมอบพลังทะลวงปราณอันน่าสะพรึง' },
        { chapter: 2, stageReq: 5, titleTh: 'บทที่ 2: ทูตสำนักใหญ่บีบบังคับให้ส่งตัวผู้ต้องสาป', descTh: 'เจ้าสำนักต้องตัดสินใจปกป้องศิษย์เอกจากแรงกดดันของยุทธภพ' },
        { chapter: 3, stageReq: 7, titleTh: 'บทที่ 3: เปลี่ยนคำสาปหมื่นปีเป็นมรรคาสะท้านภพ', descTh: 'แปรเปลี่ยนปราณคำสาปเป็นขุมพลังบริสุทธิ์ระดับตำนาน' }
      ]
    },
    ANCIENT_ALCHEMY_SCION: {
      id: 'ANCIENT_ALCHEMY_SCION',
      nameTh: 'ทายาทตระกูลโอสถโบราณผู้รอดชีวิต',
      icon: '⚗️',
      triggerStages: [3, 5, 7],
      signatureTechId: 'TECH_SAGE_1',
      awakenedTrait: {
        id: 'DIVINE_CAULDRON_HEART',
        nameTh: 'หัวใจเตาหลอมเทวะไร้พิษ',
        cultRateBonus: 0.25,
        combatBonus: 0.16,
        btBonus: 0.14
      },
      chapters: [
        { chapter: 1, stageReq: 3, titleTh: 'บทที่ 1: ตราประทับเพลิงโอสถในฝ่ามือ', descTh: 'เปลวไฟวิญญาณประจำตระกูลโอสถตื่นขึ้นขณะช่วยงานในหอโอสถ' },
        { chapter: 2, stageReq: 5, titleTh: 'บทที่ 2: ตำรับโอสถเก้าหวนคืนที่สาบสูญ', descTh: 'ถอดรหัสตำรับลับของบรรพบุรุษและรับมือผู้สืบล้างตระกูล' },
        { chapter: 3, stageReq: 7, titleTh: 'บทที่ 3: ปรมาจารย์โอสถสวรรค์คู่บุญสำนัก', descTh: 'บรรลุหัวใจเตาหลอมเทวะ ยกระดับการปรุงโอสถทั้งสำนัก' }
      ]
    }
  });

  ORIGIN_ARCS.initOriginArc = (W, npc, arcId, opts) => {
    opts = opts || {};
    if (!npc) return { ok: false, reason: 'no-npc' };
    const keys = Object.keys(ORIGIN_ARCS.ARCHETYPES);
    const chosenId = (arcId && ORIGIN_ARCS.ARCHETYPES[arcId]) ? arcId : keys[(Math.abs(Number(String(npc.id).replace(/\D+/g, '')) || 0)) % keys.length];
    const spec = ORIGIN_ARCS.ARCHETYPES[chosenId];
    npc.originArc = {
      arcId: spec.id,
      nameTh: spec.nameTh,
      icon: spec.icon,
      chapter: 0,
      maxChapters: 3,
      completed: false,
      history: [],
      choices: [],
      awakenedDestinyTrait: null,
      startedDay: (W && W.day) || 360
    };
    if (!opts.deferChapter1) {
      ORIGIN_ARCS.advanceOriginChapter(W, npc, opts.choiceStance || 'PROTECT', { quiet: opts.quiet });
    }
    return { ok: true, originArc: npc.originArc, spec };
  };

  ORIGIN_ARCS.advanceOriginChapter = (W, npc, choiceStance, opts) => {
    opts = opts || {};
    if (!npc) return { ok: false, reason: 'no-npc' };
    if (!npc.originArc) {
      ORIGIN_ARCS.initOriginArc(W, npc, opts.arcId, { deferChapter1: true, quiet: true });
    }
    const oa = npc.originArc;
    const spec = ORIGIN_ARCS.ARCHETYPES[oa.arcId] || ORIGIN_ARCS.ARCHETYPES.FALLEN_DYNASTY_HEIR;
    if (oa.completed) return { ok: true, alreadyCompleted: true, originArc: oa, awakenedDestinyTrait: oa.awakenedDestinyTrait };

    oa.chapter = Math.min(3, (oa.chapter || 0) + 1);
    const chSpec = spec.chapters[oa.chapter - 1] || spec.chapters[0];
    const stance = String(choiceStance || 'PROTECT').toUpperCase();
    oa.choices.push({ chapter: oa.chapter, stance, day: (W && W.day) || 360 });
    oa.history.push({
      chapter: oa.chapter,
      titleTh: chSpec.titleTh,
      descTh: chSpec.descTh,
      stance,
      day: (W && W.day) || 360
    });

    if (npc.cult) {
      CULT.gain(npc, 60 * oa.chapter, W, 'origin_arc_chapter');
    }

    if (oa.chapter >= 3) {
      oa.completed = true;
      oa.completedDay = (W && W.day) || 360;
      oa.awakenedDestinyTrait = Object.assign({}, spec.awakenedTrait, { unlockedDay: oa.completedDay });
      npc.awakenedDestinyTrait = oa.awakenedDestinyTrait;
      npc._cultRateBase = null;
      npc.ext = npc.ext || {};
      npc.ext.btBonusPct = (npc.ext.btBonusPct || 0) + (spec.awakenedTrait.btBonus || 0.10);
      if (W && W.sect && Array.isArray(W.sect.library) && spec.signatureTechId && !W.sect.library.includes(spec.signatureTechId)) {
        if (!CULT.tech || CULT.tech(spec.signatureTechId)) W.sect.library.push(spec.signatureTechId);
      }
      if (g.STATS && g.STATS.dirty) g.STATS.dirty(npc);
    }

    if (W && g.EXPED && g.EXPED.recordChronicle && !opts.quiet) {
      g.EXPED.recordChronicle(W, {
        category: 'DISCIPLE_DESTINY',
        icon: spec.icon || '🌟',
        involvedSects: [W.sect ? W.sect.name : 'สำนักเรา'],
        involvedFigures: [HC.fullName(npc)],
        npcIds: [npc.id],
        titleTh: oa.completed
          ? ('ชะตากรรมตื่นรู้ครบ 3 บท! 「' + HC.fullName(npc) + '」ปลุก「' + oa.awakenedDestinyTrait.nameTh + '」!')
          : ('ปมชาติกำเนิด「' + spec.nameTh + '」ของ ' + HC.fullName(npc) + ' — ' + chSpec.titleTh),
        storyTh: chSpec.descTh,
        consequenceTh: oa.completed
          ? ('ปลดล็อกพรสวรรค์ชะตาตื่นรู้ ' + oa.awakenedDestinyTrait.nameTh + ' (เร่งตบะ +' + Math.round(oa.awakenedDestinyTrait.cultRateBonus * 100) + '%)')
          : ('ก้าวหน้าสู่บทที่ ' + oa.chapter + '/3'),
        quiet: opts.quiet
      });
    }

    return {
      ok: true,
      chapter: oa.chapter,
      completed: oa.completed,
      originArc: oa,
      awakenedDestinyTrait: oa.awakenedDestinyTrait
    };
  };
  SECT.ORIGIN_ARCS = ORIGIN_ARCS;

  /* ---------- [PROP-22] Cross-Sect Exchange Disciples & Double-Agent Espionage ---------- */
  const EXCHANGE_ESPIONAGE = {};
  EXCHANGE_ESPIONAGE.ensure = W => {
    if (!W || !W.sect) return null;
    if (!Array.isArray(W.sect.exchangeDisciples)) W.sect.exchangeDisciples = [];
    if (!Array.isArray(W.sect.visitingExchangeDisciples)) W.sect.visitingExchangeDisciples = [];
    if (!Array.isArray(W.sect.espionageReports)) W.sect.espionageReports = [];
    const envoy = SECT.holder(W, 'diplomat') || SECT.holder(W, 'envoy');
    const dipSkill = envoy && envoy.h && envoy.h.skills ? (envoy.h.skills.diplomacy || 40) : 25;
    W.sect.diplomacyBonus = +(0.10 + Math.min(0.30, dipSkill / 250)).toFixed(2);
    return {
      exchangeDisciples: W.sect.exchangeDisciples,
      visitingExchangeDisciples: W.sect.visitingExchangeDisciples,
      espionageReports: W.sect.espionageReports,
      diplomacyBonus: W.sect.diplomacyBonus
    };
  };

  SECT.dispatchExchangeDisciple = (W, npcOrId, targetSectId, opts) => {
    opts = opts || {};
    EXCHANGE_ESPIONAGE.ensure(W);
    const hasExplicitNpc = npcOrId !== undefined && npcOrId !== null && npcOrId !== '';
    const npc = hasExplicitNpc
      ? ((typeof npcOrId === 'object' && npcOrId) ? npcOrId : (W.byId && W.byId[npcOrId]))
      : ((W.npcs && W.npcs.find(n => n && !n.dead && !n.exiled && !n.away && !SECT.isNpcDetained(W, n) && n.id !== W.sect.masterId && n.lastExchangeDay !== (W.day || 360))) || (W.npcs && W.npcs[0]));
    if (!npc || npc.dead || npc.exiled || (Array.isArray(W.npcs) && !W.npcs.includes(npc))) return { ok: false, reason: 'no-disciple' };
    if (npc.away || SECT.isNpcDetained(W, npc) || (npc.exchangeRecord && npc.exchangeRecord.status === 'AWAY_STUDYING')) {
      return { ok: false, reason: 'disciple-unavailable' };
    }
    const curDay = W.day || 360;
    if (!opts.allowRepeatSameDay && npc.lastExchangeDay === curDay) {
      return { ok: false, reason: 'already-exchanged-today', discipleId: npc.id };
    }
    const allSects = (W.world && W.world.allSects) || [];
    const targetSect = (targetSectId && allSects.find(s => s && s.id === targetSectId)) || allSects[0] || { id: 'S0', nameTh: 'อารามระฆังทอง', path: 'BODY' };

    const giftStones = opts.free ? 0 : (opts.giftStones != null ? opts.giftStones : 60);
    if (!opts.free && (W.sect.stones || 0) < giftStones) {
      return { ok: false, reason: 'insufficient-stones', required: giftStones };
    }
    if (giftStones > 0) {
      if (ECO && ECO.pay) ECO.pay(W, giftStones, 'ของขวัญโครงการศิษย์แลกเปลี่ยนข้ามสำนักกับ「' + targetSect.nameTh + '」');
      else W.sect.stones -= giftStones;
      W.world = W.world || {};
      W.world.resourcePool = W.world.resourcePool || { stones: 50000, herbs: 5000, ores: 5000 };
      W.world.resourcePool.stones += giftStones;
    }

    // Pick a real valid technique from JD.MARTIAL.techniques to learn
    const allTechs = (g.JD && g.JD.MARTIAL && Array.isArray(g.JD.MARTIAL.techniques)) ? g.JD.MARTIAL.techniques : [];
    const learnedTechObj = allTechs.find(t => t && t.id && !(W.sect.library || []).includes(t.id)) || allTechs[0] || { id: 'TECH_EXCHANGE_SECRET_1', nameTh: 'เคล็ดวิชาประสานต่างสำนัก' };
    const learnedTechId = learnedTechObj.id;

    if (npc.cult) {
      CULT.gain(npc, 180, W, 'cross_sect_exchange');
      npc.cult.techs = Array.isArray(npc.cult.techs) ? npc.cult.techs : [];
      if (!npc.cult.techs.includes(learnedTechId)) npc.cult.techs.push(learnedTechId);
    }
    W.sect.library = Array.isArray(W.sect.library) ? W.sect.library : [];
    if (!W.sect.library.includes(learnedTechId)) W.sect.library.push(learnedTechId);

    W.sect.exchangeSeq = (W.sect.exchangeSeq || 0) + 1;
    const rec = {
      id: 'EXCH_' + curDay + '_' + W.sect.exchangeSeq + '_' + npc.id,
      discipleId: npc.id,
      discipleNameTh: HC.fullName(npc),
      targetSectId: targetSect.id,
      targetSectNameTh: targetSect.nameTh,
      startedDay: curDay,
      returnDay: curDay + (opts.durationDays || 30),
      learnedTechId,
      learnedTechNameTh: learnedTechObj.nameTh || learnedTechId,
      cultExpGained: 180,
      status: opts.stayAway ? 'AWAY_STUDYING' : 'COMPLETED'
    };
    npc.lastExchangeDay = curDay;
    npc.exchangeRecord = rec;
    if (opts.stayAway) npc.away = true;
    W.sect.exchangeDisciples.unshift(rec);
    if (targetSect.attitude != null) targetSect.attitude = clamp(targetSect.attitude + 10, -100, 100);

    return {
      ok: true,
      exchange: rec,
      learnedTechId,
      learnedTechNameTh: rec.learnedTechNameTh,
      diplomacyBonus: W.sect.diplomacyBonus
    };
  };

  SECT.tickExchangeDisciples = W => {
    if (!W || !W.sect) return { ok: false, returnedCount: 0 };
    EXCHANGE_ESPIONAGE.ensure(W);
    const curDay = W.day || 360;
    let returnedCount = 0;
    for (const rec of (W.sect.exchangeDisciples || [])) {
      if (!rec || rec.status !== 'AWAY_STUDYING') continue;
      const npc = W.byId && W.byId[rec.discipleId];
      if (!npc || npc.dead || npc.exiled) {
        rec.status = 'CANCELLED';
        if (npc) npc.away = false;
        continue;
      }
      if (curDay >= (rec.returnDay || curDay)) {
        rec.status = 'COMPLETED';
        rec.completedDay = curDay;
        npc.away = false;
        returnedCount++;
      }
    }
    if (Array.isArray(W.npcs)) {
      for (const n of W.npcs) {
        if (n && n.exchangeRecord && n.exchangeRecord.status === 'AWAY_STUDYING' && curDay >= (n.exchangeRecord.returnDay || curDay)) {
          n.exchangeRecord.status = 'COMPLETED';
          n.exchangeRecord.completedDay = curDay;
          n.away = false;
          returnedCount++;
        }
      }
    }
    return { ok: true, returnedCount };
  };
  EXCHANGE_ESPIONAGE.tickExchangeDisciples = SECT.tickExchangeDisciples;

  SECT.receiveForeignExchangeDisciple = (W, sourceSectId, opts) => {
    opts = opts || {};
    EXCHANGE_ESPIONAGE.ensure(W);
    const allSects = (W.world && W.world.allSects) || [];
    const srcSect = (sourceSectId && allSects.find(s => s && s.id === sourceSectId)) || allSects[0] || { id: 'S0', nameTh: 'สำนักพันธมิตร' };
    const guest = {
      id: 'GUEST_EXCH_' + (W.day || 360) + '_' + (W.sect.visitingExchangeDisciples.length + 1),
      nameTh: opts.guestNameTh || ('ศิษย์เอกจาก' + srcSect.nameTh),
      sourceSectId: srcSect.id,
      sourceSectNameTh: srcSect.nameTh,
      arrivedDay: W.day || 360,
      untilDay: (W.day || 360) + 30,
      sharedInsightBonus: 0.12
    };
    W.sect.visitingExchangeDisciples.unshift(guest);
    return { ok: true, guest };
  };

  SECT.runEspionageOperation = (W, spyNpcOrId, targetSectId, missionType, opts) => {
    opts = opts || {};
    EXCHANGE_ESPIONAGE.ensure(W);
    const VALID_MISSION_TYPES = ['STEAL_SUTRA', 'SABOTAGE_ARRAY', 'SCOUT_INTEL', 'COUNTER_INTEL'];
    const mType = String(missionType || 'STEAL_SUTRA').toUpperCase();
    if (!VALID_MISSION_TYPES.includes(mType)) {
      return { ok: false, reason: 'invalid-mission-type', missionType: mType };
    }
    const hasExplicitSpy = spyNpcOrId !== undefined && spyNpcOrId !== null && spyNpcOrId !== '';
    const spy = hasExplicitSpy
      ? ((typeof spyNpcOrId === 'object' && spyNpcOrId) ? spyNpcOrId : (W.byId && W.byId[spyNpcOrId]))
      : (SECT.holder(W, 'spymaster') || (W.npcs && W.npcs.find(n => n && !n.dead && !n.exiled && !n.away && !SECT.isNpcDetained(W, n))));
    if (!spy || spy.dead || spy.exiled || spy.away || SECT.isNpcDetained(W, spy) || (Array.isArray(W.npcs) && !W.npcs.includes(spy))) {
      return { ok: false, reason: 'invalid-spy' };
    }

    const allSects = (W.world && W.world.allSects) || [];
    const targetSect = (targetSectId && allSects.find(s => s && s.id === targetSectId)) || (!targetSectId ? (allSects[0] || { id: 'S1', nameTh: 'สำนักคู่แข่ง', power: 1.4 }) : null);
    if (!targetSect) return { ok: false, reason: 'invalid-target-sect', targetSectId };

    const curDay = W.day || 360;
    const sameDayTargetCount = (W.sect.espionageReports || []).filter(r => r && r.day === curDay && r.targetSectId === targetSect.id).length;
    if (!opts.force && sameDayTargetCount >= 1) {
      return { ok: false, reason: 'espionage-cooldown', targetSectId: targetSect.id };
    }

    W.threat = W.threat || {};
    W.threat.earlyWarningBonus = Math.min(0.80, +((W.threat.earlyWarningBonus || 0) + 0.20).toFixed(2));

    let stolenTechId = null;
    let stolenRecipeId = null;
    if (mType === 'STEAL_SUTRA') {
      const allTechs = (g.JD && g.JD.MARTIAL && Array.isArray(g.JD.MARTIAL.techniques)) ? g.JD.MARTIAL.techniques : [];
      const pickTech = allTechs.find(t => t && t.id && !(W.sect.library || []).includes(t.id)) || allTechs[1] || { id: 'TECH_SPY_STOLEN_1', nameTh: 'คัมภีร์ลับจารชน' };
      stolenTechId = pickTech.id;
      if (!W.sect.library.includes(stolenTechId)) W.sect.library.push(stolenTechId);
    } else if (mType === 'SABOTAGE_ARRAY') {
      if (targetSect.power) targetSect.power = Math.max(0.6, +(targetSect.power - 0.15).toFixed(2));
    }

    const report = {
      id: 'SPY_OP_' + curDay + '_' + (W.sect.espionageReports.length + 1),
      spyId: spy.id,
      spyNameTh: HC.fullName(spy),
      targetSectId: targetSect.id,
      targetSectNameTh: targetSect.nameTh,
      missionType: mType,
      day: curDay,
      success: true,
      stolenTechId,
      stolenRecipeId,
      earlyWarningBonus: W.threat.earlyWarningBonus
    };
    W.sect.espionageReports.unshift(report);
    return { ok: true, report, success: true, stolenTechId, earlyWarningBonus: W.threat.earlyWarningBonus };
  };
  SECT.EXCHANGE_ESPIONAGE = EXCHANGE_ESPIONAGE;

  /* ---------- [PROP-23] Tavern Bounty Board & Wanted Outlaw Hunts ---------- */
  const BOUNTY_BOARD = {};
  BOUNTY_BOARD.OUTLAW_TEMPLATES = Object.freeze([
    { id: 'OUTLAW_FLOWER_THIEF', outlawNameTh: 'โจรเด็ดบุปผาพันหน้า', crimeTh: 'ลอบปล้นหอโอสถและลักพาตัวศิษย์สำนักเล็ก', tier: 4, rewardStones: 380, fameReward: 12 },
    { id: 'OUTLAW_WHITE_BONE_TAOIST', outlawNameTh: 'นักพรตมารกระดูกขาว', crimeTh: 'สังหารคาราวานพ่อค้าเพื่อหลอมธงวิญญาณอาฆาต', tier: 5, rewardStones: 480, fameReward: 16 },
    { id: 'OUTLAW_BLOOD_SABER_DESERTER', outlawNameTh: 'ขุนพลดาบโลหิตผู้ทรยศ', crimeTh: 'ชิงคัมภีร์ต้องห้ามและตั้งค่ายโจรปล้นสะดมชายแดน', tier: 5, rewardStones: 540, fameReward: 18 },
    { id: 'OUTLAW_NETHER_GU_MASTER', outlawNameTh: 'เฒ่าพิษกู่หมื่นอสรพิษ', crimeTh: 'แพร่พิษกู่ในแหล่งน้ำเมืองหน้าด่านยุทธภพ', tier: 6, rewardStones: 650, fameReward: 22 }
  ]);

  BOUNTY_BOARD.ensure = W => {
    if (!W || !W.sect) return null;
    if (!W.sect.bountyBoard || typeof W.sect.bountyBoard !== 'object') {
      W.sect.bountyBoard = {
        seq: 0,
        lastRefreshDay: -1,
        activeBounties: [],
        completedBounties: [],
        mercenaryContracts: []
      };
    }
    return W.sect.bountyBoard;
  };

  BOUNTY_BOARD.refreshBounties = (W, opts) => {
    opts = opts || {};
    const bb = BOUNTY_BOARD.ensure(W);
    if (!bb) return { ok: false, reason: 'no-board' };
    const curDay = W.day || 360;
    if (!opts.force && bb.lastRefreshDay === curDay && bb.activeBounties.length > 0) {
      return { ok: false, reason: 'already-refreshed-today', bounties: bb.activeBounties, totalActive: bb.activeBounties.length };
    }
    if (SECT.JIANGHU && SECT.JIANGHU.refreshTavernRumors) {
      SECT.JIANGHU.refreshTavernRumors(W, { count: 3 });
    }
    bb.lastRefreshDay = curDay;
    bb.activeBounties = BOUNTY_BOARD.OUTLAW_TEMPLATES.map((tpl, idx) => ({
      bountyId: 'BOUNTY_' + (++bb.seq) + '_' + (idx + 1),
      templateId: tpl.id,
      outlawNameTh: tpl.outlawNameTh,
      crimeTh: tpl.crimeTh,
      tier: tpl.tier,
      rewardStones: tpl.rewardStones,
      fameReward: tpl.fameReward,
      status: 'OPEN',
      postedDay: curDay
    }));
    return { ok: true, bounties: bb.activeBounties, totalActive: bb.activeBounties.length };
  };

  BOUNTY_BOARD.claimBountyHunt = (W, bountyId, hunterNpcOrId, opts) => {
    opts = opts || {};
    const bb = BOUNTY_BOARD.ensure(W);
    if (!bb) return { ok: false, reason: 'no-board' };
    const curDay = W.day || 360;
    if (!bb.activeBounties.length || (!bb.activeBounties.some(b => b && b.status === 'OPEN') && bb.lastRefreshDay !== curDay)) {
      BOUNTY_BOARD.refreshBounties(W, { quiet: true });
    }

    const hasExplicitBountyId = bountyId !== undefined && bountyId !== null && bountyId !== '';
    const bounty = hasExplicitBountyId
      ? bb.activeBounties.find(b => b && (b.bountyId === bountyId || b.templateId === bountyId) && b.status === 'OPEN')
      : bb.activeBounties.find(b => b && b.status === 'OPEN');
    if (!bounty) return { ok: false, reason: 'bounty-not-found', bountyId };

    const hasExplicitHunter = hunterNpcOrId !== undefined && hunterNpcOrId !== null && hunterNpcOrId !== '';
    const hunter = hasExplicitHunter
      ? ((typeof hunterNpcOrId === 'object' && hunterNpcOrId) ? hunterNpcOrId : (W.byId && W.byId[hunterNpcOrId]))
      : ([SECT.holder(W, 'vanguard'), SECT.holder(W, 'mission')].concat(W.npcs || []).find(n => n && !n.dead && !n.exiled && !n.away && !SECT.isNpcDetained(W, n)));
    if (!hunter || hunter.dead || hunter.exiled || hunter.away || SECT.isNpcDetained(W, hunter) || (Array.isArray(W.npcs) && !W.npcs.includes(hunter))) {
      return { ok: false, reason: 'hunter-unavailable' };
    }
    if (!opts.allowMultipleSameDay && bb.lastClaimDay === curDay && !hasExplicitBountyId) {
      return { ok: false, reason: 'bounty-daily-limit-reached', day: curDay };
    }
    bb.lastClaimDay = curDay;

    W.world = W.world || {};
    W.world.resourcePool = W.world.resourcePool || { stones: 50000, herbs: 5000, ores: 5000 };
    const payout = Math.min(W.world.resourcePool.stones, bounty.rewardStones || 400);
    W.world.resourcePool.stones -= payout;
    if (ECO && ECO.earn) ECO.earn(W, payout, 'เงินรางวัลนำจับอาชญากรยุทธภพ「' + bounty.outlawNameTh + '」จากกระดานล่าค่าหัวโรงเตี๊ยม');
    else W.sect.stones = (W.sect.stones || 0) + payout;
    W.fame(bounty.fameReward || 12);

    if (hunter) {
      hunter.merit = (hunter.merit || 0) + 25;
      if (g.CPE && g.CPE.mint) g.CPE.mint(W, hunter, 30, 'นำจับอาชญากรค่าหัวโรงเตี๊ยม', true);
      else hunter.cp = (hunter.cp || 0) + 30;
      if (hunter.cult) CULT.gain(hunter, 65, W, 'bounty_hunt');
    }

    let capturedPrisoner = null;
    if (opts.capture !== false && SECT.capturePrisoner) {
      const capRes = SECT.capturePrisoner(W, {
        nameTh: bounty.outlawNameTh,
        sectId: 'WANTED_OUTLAW',
        sectNameTh: 'อาชญากรค่าหัวโรงเตี๊ยม',
        tier: bounty.tier || 5
      }, { quiet: true });
      capturedPrisoner = (capRes && capRes.prisoner) || capRes;
    }

    bounty.status = 'CLAIMED';
    bounty.claimedById = hunter ? hunter.id : null;
    bounty.claimedByNameTh = hunter ? HC.fullName(hunter) : 'ยอดฝีมือสำนัก';
    bounty.claimedDay = W.day || 360;
    bb.completedBounties.unshift(bounty);

    return {
      ok: true,
      bounty,
      rewardStones: payout,
      fameGained: bounty.fameReward || 12,
      hunterId: hunter ? hunter.id : null,
      capturedPrisoner
    };
  };
  BOUNTY_BOARD.dispatchBountyHunt = BOUNTY_BOARD.claimBountyHunt;
  SECT.BOUNTY_BOARD = BOUNTY_BOARD;

  /* ---------- [PROP-24] Black Market Secret Auction & Caravan Escort Extensions ---------- */
  CARAVAN_AUCTION.openMidnightBlackMarket = (W, opts) => {
    opts = opts || {};
    const st = CARAVAN_AUCTION.ensure(W);
    if (!st) return { ok: false, reason: 'invalid-world' };
    CARAVAN_AUCTION.openSeasonalAuction(W, opts);
    const ah = st.auctionHouse;
    ah.isMidnightBlackMarket = true;
    ah.blackMarketOpenedDay = W.day || 360;
    return { ok: true, auctionHouse: ah, lots: ah.activeLots };
  };

  CARAVAN_AUCTION.bidOnAuctionItem = (W, lotId, bidAmount, opts) => {
    opts = opts || {};
    const st = CARAVAN_AUCTION.ensure(W);
    if (!st) return { ok: false, reason: 'invalid-world' };
    const ah = st.auctionHouse;
    if (!Array.isArray(ah.activeLots) || !ah.activeLots.some(l => l && l.status === 'OPEN')) {
      CARAVAN_AUCTION.openMidnightBlackMarket(W, { quiet: true });
    }
    const lot = (lotId && ah.activeLots.find(l => l && (l.lotId === lotId || l.templateId === lotId) && l.status === 'OPEN'))
      || ah.activeLots.find(l => l && l.status === 'OPEN');
    if (!lot) return { ok: false, reason: 'lot-not-found' };

    if (opts.yieldToAlly) {
      const allySect = (W.world && W.world.allSects && W.world.allSects.find(s => s && s.id === lot.highestBidderSectId)) || (W.world && W.world.allSects && W.world.allSects[0]);
      if (allySect) allySect.attitude = clamp((allySect.attitude || 0) + 12, -100, 100);
      lot.status = 'YIELDED_TO_ALLY';
      return { ok: true, yielded: true, lot, allySect };
    }

    const requiredBid = bidAmount != null ? Math.max(lot.currentBid, Number(bidAmount)) : Math.round(lot.currentBid * 1.15);
    if (!opts.free && (W.sect.stones || 0) < requiredBid) {
      return { ok: false, reason: 'insufficient-stones', required: requiredBid, available: W.sect.stones || 0 };
    }

    W.world = W.world || {};
    W.world.resourcePool = W.world.resourcePool || { stones: 50000, herbs: 5000, ores: 5000 };
    if (!opts.free && requiredBid > 0) {
      if (ECO && ECO.pay) ECO.pay(W, requiredBid, 'ประมูลลับตลาดมืดยามรัตติกาล「' + lot.nameTh + '」');
      else W.sect.stones -= requiredBid;
      W.world.resourcePool.stones += requiredBid;
    }

    lot.currentBid = requiredBid;
    lot.highestBidderType = 'PLAYER_SECT';
    lot.highestBidderSectId = 'PLAYER';
    lot.status = 'WON_BY_PLAYER';
    ah.history.unshift({
      day: W.day || 360,
      lotId: lot.lotId,
      nameTh: lot.nameTh,
      price: requiredBid,
      blackMarket: true
    });
    return { ok: true, lot, price: requiredBid, remainingStones: W.sect.stones };
  };

  CARAVAN_AUCTION.escortTradeCaravan = (W, categoryId, targetSectOrId, opts) => {
    opts = opts || {};
    W.world = W.world || {};
    W.world.resourcePool = W.world.resourcePool || { stones: 50000, herbs: 5000, ores: 5000 };
    const beforeStones = W.sect.stones || 0;
    const res = CARAVAN_AUCTION.dispatchTradeCaravan(W, categoryId, targetSectOrId, opts);
    return Object.assign({}, res, { beforeStones, afterStones: W.sect.stones || 0 });
  };

  /* ---------- [PROP-26] Monthly Celestial Alignment Cycle & 4-Season Calamities ---------- */
  CELESTIAL_ALIGNMENTS.CALAMITIES_4_SEASONS = Object.freeze({
    0: { id: 'SPRING_MIASMA_SPORE_TIDE', season: 0, nameTh: 'หมอกพิษสปอร์บุปผาคลั่งฤดูใบไม้ผลิ', element: 'WOOD_LIFE', herbYieldMult: 1.25, miasmaToxAdd: 2 },
    1: { id: 'SUMMER_SCORCHING_DROUGHT', season: 1, nameTh: 'ภัยแล้งเพลิงสุริยันเผาผลาญฤดูร้อน', element: 'FIRE', fireDmgBonus: 0.20, forgeBonus: 0.18 },
    2: { id: 'AUTUMN_VOID_GALE_STORM', season: 2, nameTh: 'พายุวายุทองคำฉีกดาราฤดูใบไม้ร่วง', element: 'EARTH_METAL', swordIntentBonus: 0.22, arrayBonus: 0.15 },
    3: { id: 'WINTER_ABSOLUTE_FROST_BLIZZARD', season: 3, nameTh: 'มหาพายุหิมะเยือกแข็งเก้าชั้นฟ้าฤดูหนาว', element: 'WATER_ICE', iceDmgBonus: 0.25, seclusionInsightBonus: 0.20 }
  });

  CELESTIAL_ALIGNMENTS.tickMonthlyCycle = (W, opts) => {
    opts = opts || {};
    const st = CELESTIAL_ALIGNMENTS.ensure(W);
    if (!st) return { ok: false, reason: 'invalid-world' };
    const keys = Object.keys(CELESTIAL_ALIGNMENTS.EVENTS);
    const monthIndex = Math.floor(((W && W.day) || 360) / 30);
    const chosenId = (opts.eventId && CELESTIAL_ALIGNMENTS.EVENTS[opts.eventId])
      ? opts.eventId
      : keys[monthIndex % keys.length];
    const trig = CELESTIAL_ALIGNMENTS.triggerEvent(W, chosenId, opts.durDays || 15);
    const season = (W && W.season != null) ? W.season : 0;
    const calamity = CELESTIAL_ALIGNMENTS.CALAMITIES_4_SEASONS[season] || CELESTIAL_ALIGNMENTS.CALAMITIES_4_SEASONS[0];
    st.activeSeasonalCalamity = calamity;
    W.world = W.world || {};
    W.world.activeCalamity = calamity;
    if (SECT.CARAVAN_AUCTION && SECT.CARAVAN_AUCTION.updateMarketIndex) {
      SECT.CARAVAN_AUCTION.updateMarketIndex(W);
    }
    return { ok: true, event: trig.event, seasonalCalamity: calamity, alignmentState: st };
  };

  /* ---------- [PROP-27] 3-Layer Ancient Immortal Tomb Excavation ---------- */
  const IMMORTAL_TOMB = {};
  IMMORTAL_TOMB.TOMB_TEMPLATES = Object.freeze({
    TOMB_THOUSAND_MECH_EMPEROR: {
      id: 'TOMB_THOUSAND_MECH_EMPEROR',
      nameTh: 'สุสานจักรพรรดิกลไกพันปี',
      icon: '🏛️',
      tier: 6,
      legacyTechId: 'TECH_SWORD_1',
      legacyRelicId: 'MAT_V234_055',
      legacyNameTh: 'มรดกเซียนจักรพรรดิกลไกบรรพกาล'
    },
    TOMB_NINE_SUN_IMMORTAL_MONARCH: {
      id: 'TOMB_NINE_SUN_IMMORTAL_MONARCH',
      nameTh: 'สุสานราชันเซียนเก้าสุริยัน',
      icon: '☀️',
      tier: 7,
      legacyTechId: 'TECH_XIAN_1',
      legacyRelicId: 'MAT_V234_058',
      legacyNameTh: 'มรดกเซียนคัมภีร์เก้าสุริยันนิรันดร์'
    },
    TOMB_PRIMORDIAL_SAMSARA_SAGE: {
      id: 'TOMB_PRIMORDIAL_SAMSARA_SAGE',
      nameTh: 'สุสานมหาปราชญ์สังสารวัฏบรรพกาล',
      icon: '☸️',
      tier: 7,
      legacyTechId: 'TECH_HEART_1',
      legacyRelicId: 'MAT_V234_060',
      legacyNameTh: 'มรดกเซียนวัฏจักรสังสารวัฏเก้าภพ'
    }
  });

  IMMORTAL_TOMB.LAYER_SPECS = Object.freeze([
    {
      layer: 1,
      id: 'OUTER_SEAL_GATE',
      nameTh: 'ชั้นที่ 1: ประตูกลหินผนึกค่ายกลชั้นนอก',
      requiredSkills: ['ARRAY', 'FORGING'],
      trapId: 'TRAP_THUNDER_SIGIL_ARRAY',
      trapNameTh: 'กับดักค่ายกลอสนีพิฆาตพันวิถี',
      rewardStones: 280,
      rewardMatId: 'MAT_V234_010'
    },
    {
      layer: 2,
      id: 'MIDDLE_STELE_HALL',
      nameTh: 'ชั้นที่ 2: โถงศิลาจารึกอักขระเซียนชั้นกลาง',
      requiredSkills: ['SCRIPTURE', 'ALCHEMY'],
      trapId: 'TRAP_PHANTOM_HEART_MIRROR',
      trapNameTh: 'กับดักกระจกมายาสะท้อนจิตมาร',
      rewardStones: 420,
      rewardMatId: 'MAT_V234_025'
    },
    {
      layer: 3,
      id: 'INNER_IMMORTAL_VAULT',
      nameTh: 'ชั้นที่ 3: แท่นมรดกเซียนและหุ่นกลพิทักษ์สุสานชั้นใน',
      requiredSkills: ['COMBAT_VANGUARD'],
      trapId: 'TOMB_GUARDIAN_CONSTRUCT',
      trapNameTh: 'หุ่นกลเซียนพิทักษ์สุสานระดับขั้น 7',
      rewardStones: 750,
      rewardMatId: 'MAT_V234_055'
    }
  ]);

  IMMORTAL_TOMB.ensure = W => {
    if (!W || !W.sect) return null;
    if (!W.sect.immortalTombs || typeof W.sect.immortalTombs !== 'object') {
      W.sect.immortalTombs = {
        seq: 0,
        activeSites: [],
        completedTombs: [],
        unlockedLegacies: []
      };
    }
    return W.sect.immortalTombs;
  };

  IMMORTAL_TOMB.discoverTombSite = (W, templateId, opts) => {
    opts = opts || {};
    const st = IMMORTAL_TOMB.ensure(W);
    if (!st) return { ok: false, reason: 'invalid-world' };
    const keys = Object.keys(IMMORTAL_TOMB.TOMB_TEMPLATES);
    const tplId = (templateId && IMMORTAL_TOMB.TOMB_TEMPLATES[templateId]) ? templateId : keys[st.seq % keys.length];
    const tpl = IMMORTAL_TOMB.TOMB_TEMPLATES[tplId];
    const site = {
      siteId: 'TOMB_SITE_' + (++st.seq),
      templateId: tpl.id,
      nameTh: tpl.nameTh,
      icon: tpl.icon,
      tier: tpl.tier,
      discoveredDay: W.day || 360,
      currentLayer: 0,
      maxLayers: 3,
      completed: false,
      layerRecords: [],
      legacyNameTh: tpl.legacyNameTh,
      legacyRelicId: tpl.legacyRelicId,
      legacyTechId: tpl.legacyTechId
    };
    st.activeSites.unshift(site);
    return { ok: true, site };
  };

  IMMORTAL_TOMB.excavateTombLayer = (W, siteId, squadNpcIds, opts) => {
    opts = opts || {};
    const st = IMMORTAL_TOMB.ensure(W);
    if (!st) return { ok: false, reason: 'invalid-world' };
    if (!st.activeSites.length) IMMORTAL_TOMB.discoverTombSite(W, null, { quiet: true });

    const site = (siteId && st.activeSites.find(s => s && (s.siteId === siteId || s.templateId === siteId) && !s.completed))
      || st.activeSites.find(s => s && !s.completed)
      || st.activeSites[0];
    if (!site) return { ok: false, reason: 'no-tomb-site' };
    if (site.completed) return { ok: true, alreadyCompleted: true, site };

    const nextLayerNum = Math.min(3, (site.currentLayer || 0) + 1);
    const layerSpec = IMMORTAL_TOMB.LAYER_SPECS[nextLayerNum - 1];
    const alive = (W.npcs || []).filter(n => n && !n.dead && !n.exiled);

    let leader = null;
    if (Array.isArray(squadNpcIds) && squadNpcIds.length && W.byId && W.byId[squadNpcIds[0]]) {
      leader = W.byId[squadNpcIds[0]];
    } else if (nextLayerNum === 1) {
      leader = alive.slice().sort((a, b) => (((b.h.skills.ARRAY || 0) + (b.h.skills.FORGING || 0)) - ((a.h.skills.ARRAY || 0) + (a.h.skills.FORGING || 0))))[0];
    } else if (nextLayerNum === 2) {
      leader = alive.slice().sort((a, b) => (((b.h.skills.SCRIPTURE || 0) + (b.h.intellect.comprehension || 0)) - ((a.h.skills.SCRIPTURE || 0) + (a.h.intellect.comprehension || 0))))[0];
    } else {
      leader = alive.slice().sort((a, b) => CULT.power(b) - CULT.power(a))[0];
    }
    leader = leader || alive[0];

    // Closed-loop reward transfer from world resourcePool
    W.world = W.world || {};
    W.world.resourcePool = W.world.resourcePool || { stones: 50000, herbs: 5000, ores: 5000 };
    const stoneGain = Math.min(W.world.resourcePool.stones, layerSpec.rewardStones || 300);
    W.world.resourcePool.stones -= stoneGain;
    if (ECO && ECO.earn) ECO.earn(W, stoneGain, 'ขุดค้นสุสานเซียนโบราณ「' + site.nameTh + '」ผ่าน' + layerSpec.nameTh);
    else W.sect.stones = (W.sect.stones || 0) + stoneGain;

    if (ECO && ECO.add && layerSpec.rewardMatId) {
      ECO.add(W, layerSpec.rewardMatId, 2);
    }
    if (leader && leader.cult) {
      CULT.gain(leader, 85 * nextLayerNum, W, 'immortal_tomb_excavation');
    }

    const layerRec = {
      layer: nextLayerNum,
      layerId: layerSpec.id,
      nameTh: layerSpec.nameTh,
      leaderId: leader ? leader.id : null,
      leaderNameTh: leader ? HC.fullName(leader) : 'คณะสำรวจสำนัก',
      trapDisarmed: layerSpec.trapNameTh,
      rewardStones: stoneGain,
      rewardMatId: layerSpec.rewardMatId,
      day: W.day || 360
    };
    site.currentLayer = nextLayerNum;
    site.layerRecords.push(layerRec);

    let legacyUnlocked = null;
    if (site.currentLayer >= 3) {
      site.completed = true;
      site.completedDay = W.day || 360;
      legacyUnlocked = {
        id: 'LEGACY_' + site.siteId,
        tombNameTh: site.nameTh,
        legacyNameTh: site.legacyNameTh,
        relicId: site.legacyRelicId,
        unlockedDay: site.completedDay,
        sectComprehensionBonus: 0.15,
        sectBreakthroughBonus: 0.08,
        layerHeroesTh: site.layerRecords.map(r => r.leaderNameTh)
      };
      st.unlockedLegacies.push(legacyUnlocked);
      st.completedTombs.unshift(site);
      if (ECO && ECO.add && site.legacyRelicId) ECO.add(W, site.legacyRelicId, 1);
      W.fame(25);
      if (g.EXPED && g.EXPED.recordChronicle && !opts.quiet) {
        g.EXPED.recordChronicle(W, {
          category: 'SECRET_REALM',
          icon: '🏛️',
          involvedSects: [W.sect.name],
          involvedFigures: legacyUnlocked.layerHeroesTh,
          titleTh: 'พิชิตสุสานเซียนโบราณครบ 3 ชั้น! คว้า「' + site.legacyNameTh + '」กลับสู่สำนัก!',
          storyTh: 'คณะสำรวจทั้ง 3 สายวิชาชีพ (' + legacyUnlocked.layerHeroesTh.join(' ➔ ') + ') ร่วมแรงปลดผนึกประตูกล แปลศิลาจารึกเซียน และปราบหุ่นกลพิทักษ์สุสานใน「' + site.nameTh + '」สำเร็จ!',
          consequenceTh: 'ได้รับ ' + site.legacyNameTh + ' · ศิลาวิญญาณรวม +' + stoneGain + ' · ชื่อเสียงสำนัก +25',
          quiet: opts.quiet
        });
      }
    }

    return {
      ok: true,
      site,
      layerCleared: nextLayerNum,
      layerRecord: layerRec,
      completed: site.completed,
      legacyUnlocked
    };
  };

  IMMORTAL_TOMB.excavateAllLayers = (W, siteId, opts) => {
    opts = opts || {};
    let lastRes = null;
    for (let i = 0; i < 3; i++) {
      lastRes = IMMORTAL_TOMB.excavateTombLayer(W, siteId, null, opts);
      if (!lastRes.ok || lastRes.completed) break;
    }
    return lastRes;
  };
  SECT.IMMORTAL_TOMB = IMMORTAL_TOMB;
  if (g.EXPLORE) g.EXPLORE.IMMORTAL_TOMB = IMMORTAL_TOMB;

  /* ---------- [PROP-28] Multi-Chapter World Crisis Endgame Saga ---------- */
  const WORLD_CRISIS = {};
  WORLD_CRISIS.CRISIS_ARCS = Object.freeze({
    CRISIS_DEMON_BLADE_ECLIPSE: {
      id: 'CRISIS_DEMON_BLADE_ECLIPSE',
      nameTh: 'มหากาพย์วิกฤตศาสตรามารกลืนวิญญาณ',
      icon: '⚔️',
      chapters: [
        { chapter: 1, titleTh: 'บทที่ 1: รอยแยกเศษกระบี่มารบรรพกาลปะทุกลางยุทธภพ', descTh: 'เศษศาสตรามารตื่นขึ้นจากหุบเหวอเวจี สำนักทั้ง 19 ต่างส่งยอดฝีมือมาแย่งชิงหรือหาทางผนึก' },
        { chapter: 2, titleTh: 'บทที่ 2: แรงกดดันจากสภาพันธมิตรและคลื่นจิตมารแทรกซึม', descTh: 'อิทธิพลของศาสตรามารเริ่มทดสอบจุดยืนของสภาผู้อาวุโสและพันธมิตรทั้ง 19 สำนัก' },
        { chapter: 3, titleTh: 'บทที่ 3: ศึกตัดสินชำระล้างศาสตรามารสู่กระบี่เทวะพิทักษ์ภพ', descTh: 'มหาศึกปิดมหากาพย์ตัดสินชะตายุทธภพด้วยผลลัพธ์จากการตัดสินใจทั้ง 3 บท' }
      ],
      mandateReward: {
        id: 'MANDATE_SOVEREIGN_BLADE_SAVIOR',
        nameTh: 'ตราประทับผู้กอบกู้วิกฤตศาสตรามาร',
        sectAtkBonusPct: 0.18,
        diplomacyPrestige: 30
      }
    },
    CRISIS_MARTIAL_ALLIANCE_THRONE: {
      id: 'CRISIS_MARTIAL_ALLIANCE_THRONE',
      nameTh: 'มหากาพย์ศึกชิงบัลลังก์ประมุขยุทธภพ 19 สำนัก',
      icon: '👑',
      chapters: [
        { chapter: 1, titleTh: 'บทที่ 1: เทียบเชิญทองคำเปิดศึกชิงตำแหน่งเหมิงจู่ (ประมุขยุทธภพ)', descTh: 'ตำแหน่งประมุขยุทธภพว่างลง สำนักใหญ่ทั้งฝ่ายธรรมะและอธรรมเริ่มระดมพันธมิตร' },
        { chapter: 2, titleTh: 'บทที่ 2: กลศึกการทูตและการประลองยอดฝีมือตัวแทนแคว้น', descTh: 'การเลือกจุดยืนส่งผลโดยตรงต่อคะแนนเสียงของ 19 สำนักและขวัญกำลังใจในสภาผู้อาวุโส' },
        { chapter: 3, titleTh: 'บทที่ 3: พิธีขึ้นครองบัลลังก์ประมุขยุทธภพเหนือยอดเขาไท่ซาน', descTh: 'ศึกตัดสินครั้งสุดท้ายเพื่อจารึกชื่อสำนักในฐานะผู้นำสูงสุดแห่งยุทธภพ' }
      ],
      mandateReward: {
        id: 'MANDATE_GRAND_JIANGHU_HEGEMON',
        nameTh: 'ตราประทับประมุขยุทธภพสูงสุด (เหมิงจู่)',
        sectAtkBonusPct: 0.15,
        diplomacyPrestige: 45
      }
    },
    CRISIS_PRIMORDIAL_BEAST_RIFT: {
      id: 'CRISIS_PRIMORDIAL_BEAST_RIFT',
      nameTh: 'มหากาพย์รอยแยกแดนอสูรบรรพกาลถล่มภพ',
      icon: '🐉',
      chapters: [
        { chapter: 1, titleTh: 'บทที่ 1: รอยแยกมิติบรรพกาลและคลื่นอสูรหมื่นลี้', descTh: 'ฝูงอสูรบรรพกาลทะลักออกจากรอยแยกมิติเข้าคุกคามเส้นทางชีพจรปฐพี' },
        { chapter: 2, titleTh: 'บทที่ 2: มหาค่ายกลผนึกฟ้าดินร่วม 19 สำนัก', descTh: 'สำนักทั้งแผ่นดินต้องเลือกว่าจะแบ่งปันค่ายกลป้องกันหรือฉวยโอกาสเก็บแก่นอสูรราชัน' },
        { chapter: 3, titleTh: 'บทที่ 3: มหาศึกสยบราชันมังกรอเวจีบรรพกาล', descTh: 'ศึกตัดสินหน้าปากทางรอยแยกมิติเพื่อปกป้องโลกบำเพ็ญเพียร' }
      ],
      mandateReward: {
        id: 'MANDATE_PRIMORDIAL_RIFT_WARDEN',
        nameTh: 'ตราประทับผู้พิทักษ์รอยแยกบรรพกาล',
        sectAtkBonusPct: 0.20,
        diplomacyPrestige: 35
      }
    }
  });

  WORLD_CRISIS.ensure = W => {
    if (!W || !W.world || !W.sect) return null;
    if (!W.world.worldCrisisState || typeof W.world.worldCrisisState !== 'object') {
      W.world.worldCrisisState = {
        seq: 0,
        activeArc: null,
        completedArcs: [],
        endgameMandates: []
      };
    }
    return W.world.worldCrisisState;
  };

  WORLD_CRISIS.startWorldCrisis = (W, crisisId, opts) => {
    opts = opts || {};
    const st = WORLD_CRISIS.ensure(W);
    if (!st) return { ok: false, reason: 'invalid-world' };
    const keys = Object.keys(WORLD_CRISIS.CRISIS_ARCS);
    const chosenId = (crisisId && WORLD_CRISIS.CRISIS_ARCS[crisisId]) ? crisisId : keys[st.seq % keys.length];
    const spec = WORLD_CRISIS.CRISIS_ARCS[chosenId];

    const arc = {
      arcInstanceId: 'CRISIS_ARC_' + (++st.seq),
      crisisId: spec.id,
      nameTh: spec.nameTh,
      icon: spec.icon,
      chapter: 0,
      maxChapters: 3,
      completed: false,
      startedDay: W.day || 360,
      choicesHistory: [],
      chaptersLog: [],
      mandateReward: spec.mandateReward
    };
    st.activeArc = arc;
    W.world.activeStoryArc = arc;
    if (!opts.deferChapter1) {
      WORLD_CRISIS.advanceCrisisChapter(W, opts.initialStance || 'ORTHODOX', { quiet: opts.quiet });
    }
    return { ok: true, crisisArc: arc };
  };

  WORLD_CRISIS.advanceCrisisChapter = (W, choiceStance, opts) => {
    opts = opts || {};
    const st = WORLD_CRISIS.ensure(W);
    if (!st) return { ok: false, reason: 'invalid-world' };
    if (!st.activeArc || st.activeArc.completed) {
      WORLD_CRISIS.startWorldCrisis(W, opts.crisisId, { deferChapter1: true, quiet: true });
    }
    const arc = st.activeArc;
    const spec = WORLD_CRISIS.CRISIS_ARCS[arc.crisisId] || WORLD_CRISIS.CRISIS_ARCS.CRISIS_DEMON_BLADE_ECLIPSE;
    const stance = ['ORTHODOX', 'UNORTHODOX', 'SAGE_WISDOM'].includes(String(choiceStance || '').toUpperCase())
      ? String(choiceStance).toUpperCase()
      : 'ORTHODOX';

    arc.chapter = Math.min(3, (arc.chapter || 0) + 1);
    const chSpec = spec.chapters[arc.chapter - 1] || spec.chapters[0];
    arc.choicesHistory.push({ chapter: arc.chapter, stance, day: W.day || 360 });
    arc.chaptersLog.push({
      chapter: arc.chapter,
      titleTh: chSpec.titleTh,
      descTh: chSpec.descTh,
      stance,
      day: W.day || 360
    });

    // Ripple across all 19 sects & internal politics
    const allSects = (W.world && W.world.allSects) || [];
    allSects.forEach(s => {
      if (!s) return;
      if (stance === 'ORTHODOX') s.attitude = clamp((s.attitude || 0) + 6, -100, 100);
      else if (stance === 'UNORTHODOX') s.attitude = clamp((s.attitude || 0) + (s.alignment === 'DEMONIC' ? 12 : -5), -100, 100);
      else s.attitude = clamp((s.attitude || 0) + 4, -100, 100);
    });
    if (W.sect.internalPolitics) {
      W.sect.internalPolitics.undercurrent = clamp((W.sect.internalPolitics.undercurrent || 15) + (stance === 'UNORTHODOX' ? 5 : -6), 0, 100);
    }

    let mandateUnlocked = null;
    if (arc.chapter >= 3) {
      arc.completed = true;
      arc.completedDay = W.day || 360;
      mandateUnlocked = Object.assign({}, spec.mandateReward, {
        dominantStance: stance,
        unlockedDay: arc.completedDay,
        choicesHistory: arc.choicesHistory.slice()
      });
      st.endgameMandates.push(mandateUnlocked);
      st.completedArcs.unshift(arc);
      W.sect.endgameMandate = mandateUnlocked;
      W.fame(35);

      if (g.EXPED && g.EXPED.recordChronicle && !opts.quiet) {
        g.EXPED.recordChronicle(W, {
          category: 'HEAVENLY_DAO_ERA',
          icon: spec.icon || '🌌',
          involvedSects: [W.sect.name],
          involvedFigures: [W.byId && W.byId[W.sect.masterId] ? HC.fullName(W.byId[W.sect.masterId]) : 'เจ้าสำนัก'],
          titleTh: 'ปิดมหากาพย์วิกฤตยุทธภพครบ 3 บท! สำนักบรรลุ「' + mandateUnlocked.nameTh + '」!',
          storyTh: chSpec.descTh + ' ด้วยจุดยืน (' + arc.choicesHistory.map(c => c.stance).join(' ➔ ') + ') สำนักเราได้นำพายุทธภพก้าวข้ามมหาวิกฤตสำเร็จ!',
          consequenceTh: 'ได้รับ ' + mandateUnlocked.nameTh + ' · ชื่อเสียงสำนัก +35',
          quiet: opts.quiet
        });
      }
    }

    return {
      ok: true,
      chapter: arc.chapter,
      stance,
      completed: arc.completed,
      crisisArc: arc,
      mandateUnlocked
    };
  };
  SECT.WORLD_CRISIS = WORLD_CRISIS;
  if (SECT.HEAVENLY_DAO_DIRECTOR) {
    SECT.HEAVENLY_DAO_DIRECTOR.WORLD_CRISIS = WORLD_CRISIS;
    SECT.HEAVENLY_DAO_DIRECTOR.startWorldCrisis = WORLD_CRISIS.startWorldCrisis;
    SECT.HEAVENLY_DAO_DIRECTOR.advanceCrisisChapter = WORLD_CRISIS.advanceCrisisChapter;
  }

  /* ---------- [PROP-34] Multi-Generational Dynasty & Cross-Lineage Chimera Mutation ---------- */
  const DYNASTY_BLOODLINE = {};
  DYNASTY_BLOODLINE.MYTHIC_CHIMERA_BLOODLINES = Object.freeze({
    MYTHIC_SOLAR_HEAVEN_EYE: {
      id: 'MYTHIC_SOLAR_HEAVEN_EYE',
      nameTh: 'สายเลือดผสมสุริยันเนตรสวรรค์',
      element: 'LIGHT_YANG',
      cultRateBonus: 0.32,
      combatPowerBonus: 0.22,
      btBonus: 0.12,
      familyTechLearnBonus: 0.30
    },
    MYTHIC_DRAGON_PHOENIX_SOVEREIGN: {
      id: 'MYTHIC_DRAGON_PHOENIX_SOVEREIGN',
      nameTh: 'สายเลือดเทวะมังกรหงส์บรรพกาล',
      element: 'FIRE',
      cultRateBonus: 0.35,
      combatPowerBonus: 0.25,
      btBonus: 0.14,
      familyTechLearnBonus: 0.35
    },
    MYTHIC_ASTRAL_SAMSARA_SAGE: {
      id: 'MYTHIC_ASTRAL_SAMSARA_SAGE',
      nameTh: 'สายเลือดเซียนดาราสังสารวัฏ',
      element: 'ASTRAL',
      cultRateBonus: 0.30,
      combatPowerBonus: 0.20,
      btBonus: 0.15,
      familyTechLearnBonus: 0.30
    }
  });

  DYNASTY_BLOODLINE.getClanTree = (W, surnameOrNpcId) => {
    if (!W || !W.sect) return { generations: {}, members: [] };
    SECT.ensureCompanionsAndBloodlines(W);
    const offs = W.sect.offspring || [];
    const gens = { 1: [], 2: [], 3: [] };
    (W.npcs || []).forEach(n => {
      if (!n) return;
      const gNum = Math.min(3, Math.max(1, Number(n.generation || (n.bloodlineTrait && n.bloodlineTrait.generation) || 1)));
      if (!gens[gNum]) gens[gNum] = [];
      gens[gNum].push({ id: n.id, nameTh: HC.fullName(n), generation: gNum, isMythicChimera: !!(n.bloodlineTrait && n.bloodlineTrait.isMythicChimera) });
    });
    return {
      ok: true,
      generations: gens,
      offspringCount: offs.length,
      chimeraCount: offs.filter(o => o && o.bloodlineTrait && o.bloodlineTrait.isMythicChimera).length
    };
  };
  SECT.DYNASTY_BLOODLINE = DYNASTY_BLOODLINE;

  /* =========================================================================
   * Patch v4.0.0 — Phase 6: Living Frontier, Sect Charter & Strategic Council
   * Pillar 1: SECT.OUTPOSTS_LOGISTICS
   * Pillar 3: SECT.CHARTER_DOCTRINE
   * Pillar 4: SECT.STRATEGIC_COUNCIL
   * ========================================================================= */

  const pushWorldChronicle = (W, entry) => {
    if (!W) return null;
    if (W.world) {
      if (!Array.isArray(W.world.chronicles)) W.world.chronicles = Array.isArray(W.chronicle) ? W.chronicle : [];
      W.chronicle = W.world.chronicles;
    } else if (!Array.isArray(W.chronicle)) {
      W.chronicle = [];
    }
    let rec = null;
    if (g.EXPED && g.EXPED.recordChronicle) {
      rec = g.EXPED.recordChronicle(W, Object.assign({ allowDuplicate: true }, entry));
    }
    const item = rec || Object.assign({
      id: 'CHRON_V400_' + ((W.day || 1)) + '_' + (W.chronicle.length + 1),
      day: W.day || 1,
      t: W.t || 0
    }, entry);
    if (!W.chronicle.includes(item)) {
      W.chronicle.unshift(item);
    }
    if (W.chronicle.length > 200) W.chronicle.length = 200;
    return item;
  };

  /* ---------- [Pillar 1] เครือข่ายค่ายพักและเส้นทางยุทธปัจจัย (SECT.OUTPOSTS_LOGISTICS) ---------- */
  const OUTPOSTS_LOGISTICS = {};
  OUTPOSTS_LOGISTICS.CAMP_TYPES = Object.freeze({
    CAMP_REST: {
      id: 'CAMP_REST',
      nameTh: 'ค่ายพักแรมยุทธภพ',
      icon: '⛺',
      staminaRestorePct: 0.30,
      ambushRiskReduction: 0.05,
      emergencyRationDraw: false,
      cureSevereInjury: false,
      hpRegenBonusPct: 0.10,
      dailyGrainUpkeep: 2,
      dailyPillUpkeep: 0,
      descTh: 'ฟื้นฟู Stamina +30% ให้คณะสำรวจที่แวะพักและศิษย์ประจำการ'
    },
    CAMP_GUARD: {
      id: 'CAMP_GUARD',
      nameTh: 'ค่ายป้อมยามตรวจการณ์',
      icon: '🏯',
      staminaRestorePct: 0.10,
      ambushRiskReduction: 0.40,
      defenseBonusPct: 0.25,
      emergencyRationDraw: false,
      cureSevereInjury: false,
      hpRegenBonusPct: 0.05,
      dailyGrainUpkeep: 3,
      dailyPillUpkeep: 1,
      descTh: 'เพิ่มการตรวจจับศัตรู ลดโอกาสคาราวานถูกดักปล้นในภูมิภาค -40%'
    },
    CAMP_SUPPLY: {
      id: 'CAMP_SUPPLY',
      nameTh: 'คลังเสบียงหน้าด่าน',
      icon: '🌾',
      staminaRestorePct: 0.15,
      ambushRiskReduction: 0.10,
      emergencyRationDraw: true,
      supplySavePct: 0.25,
      cureSevereInjury: false,
      hpRegenBonusPct: 0.05,
      dailyGrainUpkeep: 2,
      dailyPillUpkeep: 0,
      descTh: 'กักตุนเสบียงสำรองฉุกเฉิน (เบิกจ่ายอาหารได้ระหว่างทาง)'
    },
    CAMP_MEDIC: {
      id: 'CAMP_MEDIC',
      nameTh: 'กระโจมหมอสนามยุทธภพ',
      icon: '⚕️',
      staminaRestorePct: 0.15,
      ambushRiskReduction: 0.05,
      emergencyRationDraw: false,
      cureSevereInjury: true,
      hpRegenBonusPct: 0.35,
      dailyGrainUpkeep: 2,
      dailyPillUpkeep: 1,
      descTh: 'รักษาอาการบาดเจ็บสาหัส เร่งฟื้นฟู HP นอกสำนัก (+35%)'
    }
  });

  OUTPOSTS_LOGISTICS.ensure = W => {
    if (!W || !W.sect) return null;
    if (!W.sect.outposts || typeof W.sect.outposts !== 'object') {
      W.sect.outposts = {
        byNodeId: {},
        convoys: [],
        history: [],
        lastTickDay: 0,
        seq: 0
      };
    }
    if (!W.sect.outposts.byNodeId || typeof W.sect.outposts.byNodeId !== 'object') {
      W.sect.outposts.byNodeId = {};
    }
    if (!Array.isArray(W.sect.outposts.convoys)) W.sect.outposts.convoys = [];
    if (!Array.isArray(W.sect.outposts.history)) W.sect.outposts.history = [];
    if (W.world && Array.isArray(W.world.chronicles)) W.chronicle = W.world.chronicles;
    else if (!Array.isArray(W.chronicle)) W.chronicle = [];
    return W.sect.outposts;
  };

  const countTotalSectPills = W => {
    if (!W || !W.sect || !W.sect.stock) return 0;
    let total = 0;
    for (const [k, v] of Object.entries(W.sect.stock)) {
      const qty = Number(v) || 0;
      if (qty <= 0) continue;
      if (k === 'pills' || k.startsWith('P:') || k.startsWith('ITEM_PILL_') || (ECO && ECO.isPill && ECO.isPill(k))) {
        total += qty;
      }
    }
    return total;
  };

  const deductSectPills = (W, pillQty, preferredKey) => {
    if (!W || !W.sect || !W.sect.stock || pillQty <= 0) return { ok: true, deducted: 0, keysUsed: [] };
    const st = W.sect.stock;
    const candidateKeys = [];
    if (preferredKey && (st[preferredKey] || 0) > 0) candidateKeys.push(preferredKey);
    if ((st.pills || 0) > 0 && !candidateKeys.includes('pills')) candidateKeys.push('pills');
    for (const k of Object.keys(st)) {
      if ((st[k] || 0) > 0 && !candidateKeys.includes(k)) {
        if (k === 'pills' || k.startsWith('P:') || k.startsWith('ITEM_PILL_') || (ECO && ECO.isPill && ECO.isPill(k))) {
          candidateKeys.push(k);
        }
      }
    }
    const available = candidateKeys.reduce((acc, k) => acc + (Number(st[k]) || 0), 0);
    if (available < pillQty) return { ok: false, reason: 'insufficient-pills', available };
    let rem = pillQty;
    const keysUsed = [];
    for (const k of candidateKeys) {
      if (rem <= 0) break;
      const have = Number(st[k]) || 0;
      const take = Math.min(have, rem);
      if (take > 0) {
        if (ECO && ECO.take && k !== 'pills') ECO.take(W, k, take);
        else {
          st[k] = have - take;
          if (st[k] <= 0) delete st[k];
        }
        rem -= take;
        keysUsed.push({ key: k, qty: take });
      }
    }
    return { ok: true, deducted: pillQty - rem, keysUsed };
  };

  OUTPOSTS_LOGISTICS.establishOutpost = (W, nodeId, campType, garrisonNpcIds, opts) => {
    opts = opts || {};
    const st = OUTPOSTS_LOGISTICS.ensure(W);
    if (!st) return { ok: false, reason: 'invalid-world' };
    if (g.EXPED && g.EXPED.ensureWorldTopology) g.EXPED.ensureWorldTopology(W);

    const rNodes = (W.world && W.world.resourceNodes) || {};
    const resolvedNodeId = (nodeId && rNodes[nodeId])
      ? nodeId
      : (nodeId || Object.keys(rNodes).find(k => rNodes[k] && rNodes[k].ownerSectId === 'PLAYER') || 'MINE_CELESTIAL_STONE');
    const rn = rNodes[resolvedNodeId] || null;
    if (rn && opts.claimNode !== false) {
      rn.ownerSectId = 'PLAYER';
      rn.ownerNameTh = W.sect.name;
    }

    const typeKey = (campType && OUTPOSTS_LOGISTICS.CAMP_TYPES[campType]) ? campType : 'CAMP_REST';
    const spec = OUTPOSTS_LOGISTICS.CAMP_TYPES[typeKey];

    // Seed initial frontier medical pill reserve if sect stock has 0 pills so Closed-Loop convoy works out of the box
    if (countTotalSectPills(W) === 0 && opts.seedInitialPillReserve !== false) {
      W.sect.stock['P:BASIC_HEAL_1'] = (W.sect.stock['P:BASIC_HEAL_1'] || 0) + 25;
    }

    let gIds = [];
    if (Array.isArray(garrisonNpcIds) && garrisonNpcIds.length) {
      gIds = garrisonNpcIds.map(x => (typeof x === 'object' && x ? x.id : String(x))).filter(id => W.byId && W.byId[id] && !W.byId[id].dead);
    } else if (opts.autoGarrison !== false) {
      gIds = (W.npcs || []).filter(n => n && !n.dead && !n.exiled && n.id !== W.sect.masterId).slice(0, 2).map(n => n.id);
    }

    if (rn && gIds.length && g.EXPED && g.EXPED.assignNodeGarrison) {
      g.EXPED.assignNodeGarrison(W, resolvedNodeId, { discipleIds: gIds });
    }

    const outpost = {
      id: 'OUTPOST_' + resolvedNodeId,
      nodeId: resolvedNodeId,
      nodeNameTh: rn ? rn.nameTh : resolvedNodeId,
      campType: spec.id,
      nameTh: spec.nameTh,
      icon: spec.icon,
      macroRegion: (rn && rn.macroRegion) || 'NORTHERN_PEAKS',
      garrisonNpcIds: gIds,
      grainStock: opts.initialGrain != null ? Number(opts.initialGrain) : 16,
      pillStock: opts.initialPills != null ? Number(opts.initialPills) : 6,
      morale: opts.initialMorale != null ? Number(opts.initialMorale) : 100,
      active: true,
      establishedDay: W.day || 1,
      staminaRestorePct: spec.staminaRestorePct || 0,
      ambushRiskReduction: spec.ambushRiskReduction || 0,
      emergencyRationDraw: !!spec.emergencyRationDraw,
      cureSevereInjury: !!spec.cureSevereInjury,
      hpRegenBonusPct: spec.hpRegenBonusPct || 0,
      dailyGrainUpkeep: spec.dailyGrainUpkeep || 2,
      dailyPillUpkeep: spec.dailyPillUpkeep || 0,
      descTh: spec.descTh
    };

    st.byNodeId[resolvedNodeId] = outpost;
    if (rn) rn.outpost = outpost;

    // Apply immediate camp establishment perks to garrisoned disciples
    OUTPOSTS_LOGISTICS.applyCampPerksToParty(W, outpost, gIds.map(id => W.byId[id]).filter(Boolean));

    if (!opts.quiet) {
      W.log('exped', spec.icon + ' สถาปนา「' + spec.nameTh + '」ณ ' + outpost.nodeNameTh + ' สำเร็จ!', gIds);
      pushWorldChronicle(W, {
        category: 'SECRET_REALM_NODE',
        icon: spec.icon,
        titleTh: 'สถาปนาค่ายพักหน้าด่าน「' + spec.nameTh + '」ณ ' + outpost.nodeNameTh,
        storyTh: W.sect.name + ' ได้ส่งศิษย์ไปตั้ง ' + spec.nameTh + ' ประจำจุดยุทธศาสตร์ ' + outpost.nodeNameTh + ' เพื่อขยายเส้นทางยุทธปัจจัย',
        consequenceTh: spec.descTh,
        npcIds: gIds
      });
    }

    return {
      ok: true,
      nodeId: resolvedNodeId,
      campType: spec.id,
      outpost
    };
  };

  OUTPOSTS_LOGISTICS.applyCampPerksToParty = (W, outpostOrType, party) => {
    if (!W) return { ok: false };
    if (typeof outpostOrType === 'object' && outpostOrType && outpostOrType.active === false) {
      return { ok: false, reason: 'outpost-inactive' };
    }
    const outpost = (typeof outpostOrType === 'object' && outpostOrType)
      ? outpostOrType
      : (OUTPOSTS_LOGISTICS.CAMP_TYPES[outpostOrType] || OUTPOSTS_LOGISTICS.CAMP_TYPES.CAMP_REST);
    const members = (Array.isArray(party) ? party : [party]).map(n => (typeof n === 'string' && W.byId ? W.byId[n] : n)).filter(n => n && !n.dead);
    let staminaRestored = 0, healedCount = 0, curedInjuries = 0, rationsDrawn = 0;

    for (const n of members) {
      const s = n.h && n.h.state;
      if (!s) continue;
      if (outpost.staminaRestorePct > 0) {
        const gain = Math.round(100 * outpost.staminaRestorePct);
        s.energy = clamp((s.energy == null ? 60 : s.energy) + gain, 0, 100);
        s.rest = clamp((s.rest == null ? 60 : s.rest) + Math.round(gain * 0.8), 0, 100);
        staminaRestored += gain;
      }
      if (outpost.emergencyRationDraw) {
        s.satiety = clamp((s.satiety == null ? 60 : s.satiety) + 35, 0, 100);
        if (typeof outpost.grainStock === 'number' && outpost.grainStock > 0) {
          outpost.grainStock = Math.max(0, outpost.grainStock - 1);
        }
        rationsDrawn++;
      }
      if (outpost.cureSevereInjury || outpost.hpRegenBonusPct > 0) {
        const hm = (CULT && CULT.hpMax) ? CULT.hpMax(n) : 100;
        const hpGain = Math.max(1, Math.round(hm * (outpost.hpRegenBonusPct || 0.35)));
        s.hp = Math.min(hm, (s.hp || hm) + hpGain);
        healedCount++;
        if (outpost.cureSevereInjury && Array.isArray(n.inj) && n.inj.length > 0) {
          curedInjuries += n.inj.length;
          n.inj = [];
        }
      }
    }
    return {
      ok: true,
      campType: outpost.campType || outpost.id,
      staminaRestorePct: outpost.staminaRestorePct || 0,
      ambushRiskReduction: outpost.ambushRiskReduction || 0,
      emergencyRationDraw: !!outpost.emergencyRationDraw,
      cureSevereInjury: !!outpost.cureSevereInjury,
      staminaRestored,
      healedCount,
      curedInjuries,
      rationsDrawn
    };
  };

  OUTPOSTS_LOGISTICS.getRegionalAmbushReduction = (W, macroRegion) => {
    const st = OUTPOSTS_LOGISTICS.ensure(W);
    if (!st) return 0;
    let reduction = 0;
    for (const op of Object.values(st.byNodeId)) {
      if (!op || !op.active || op.morale <= 10) continue;
      if (!macroRegion || op.macroRegion === macroRegion || op.campType === 'CAMP_GUARD') {
        reduction = Math.max(reduction, op.ambushRiskReduction || 0);
      }
    }
    return clamp(reduction, 0, 0.75);
  };

  OUTPOSTS_LOGISTICS.dispatchSupplyConvoy = (W, outpostNodeId, grainQty, pillQty, opts) => {
    opts = opts || {};
    const st = OUTPOSTS_LOGISTICS.ensure(W);
    if (!st) return { ok: false, reason: 'invalid-world' };

    const targetId = outpostNodeId || Object.keys(st.byNodeId)[0] || 'MINE_CELESTIAL_STONE';
    let outpost = st.byNodeId[targetId];
    if (!outpost) {
      const est = OUTPOSTS_LOGISTICS.establishOutpost(W, targetId, 'CAMP_SUPPLY', null, { quiet: true });
      outpost = est.outpost;
    }
    if (!outpost) return { ok: false, reason: 'outpost-not-found' };

    const gQty = Math.max(0, Math.round(Number(grainQty != null ? grainQty : 20)));
    const pQty = Math.max(0, Math.round(Number(pillQty != null ? pillQty : 5)));

    const sectGrainBefore = (ECO && ECO.count) ? ECO.count(W, 'grain') : (W.sect.stock.grain || 0);
    const sectPillsBefore = countTotalSectPills(W);

    if (gQty > 0 && sectGrainBefore < gQty) {
      return { ok: false, reason: 'insufficient-grain', availableGrain: sectGrainBefore, requestedGrain: gQty };
    }
    if (pQty > 0 && sectPillsBefore < pQty) {
      return { ok: false, reason: 'insufficient-pills', availablePills: sectPillsBefore, requestedPills: pQty };
    }

    // Strict Closed-Loop Deduction from Sect Stock
    if (gQty > 0) {
      if (ECO && ECO.take) ECO.take(W, 'grain', gQty);
      else W.sect.stock.grain = Math.max(0, (W.sect.stock.grain || 0) - gQty);
    }
    const pillDeductRes = pQty > 0 ? deductSectPills(W, pQty, opts.pillKey) : { ok: true, deducted: 0, keysUsed: [] };
    if (!pillDeductRes.ok) return pillDeductRes;

    const sectGrainAfter = (ECO && ECO.count) ? ECO.count(W, 'grain') : (W.sect.stock.grain || 0);
    const sectPillsAfter = countTotalSectPills(W);

    // Calculate caravan ambush risk (reduced by -40% when CAMP_GUARD is active)
    const baseAmbushRisk = 0.25;
    const guardReduction = OUTPOSTS_LOGISTICS.getRegionalAmbushReduction(W, outpost.macroRegion);
    const effectiveAmbushRisk = +(baseAmbushRisk * (1 - guardReduction)).toFixed(4);
    const ambushed = opts.forceAmbush === true ? true : (opts.forceAmbush === false ? false : false);

    const lossRatio = ambushed ? (guardReduction >= 0.40 ? 0.10 : 0.25) : 0;
    const grainDelivered = Math.max(0, gQty - Math.floor(gQty * lossRatio));
    const pillDelivered = Math.max(0, pQty - Math.floor(pQty * lossRatio));

    outpost.grainStock = (outpost.grainStock || 0) + grainDelivered;
    outpost.pillStock = (outpost.pillStock || 0) + pillDelivered;
    outpost.morale = clamp((outpost.morale || 80) + 10, 0, 100);

    const convoyRecord = {
      id: 'CONVOY_' + (++st.seq),
      day: W.day || 1,
      outpostNodeId: targetId,
      outpostNameTh: outpost.nameTh,
      grainSent: gQty,
      pillSent: pQty,
      grainDelivered,
      pillDelivered,
      ambushed,
      ambushRisk: effectiveAmbushRisk,
      guardReduction
    };
    st.convoys.unshift(convoyRecord);
    if (st.convoys.length > 40) st.convoys.length = 40;

    if (!opts.quiet) {
      W.log('exped', '🐪 จัดส่งขบวนเสบียงยุทธปัจจัยสู่「' + outpost.nameTh + '」สำเร็จ (ข้าวสาร +' + grainDelivered + ', โอสถ +' + pillDelivered + ')', outpost.garrisonNpcIds || []);
    }

    return {
      ok: true,
      outpostNodeId: targetId,
      outpost,
      convoy: convoyRecord,
      grainSent: gQty,
      pillSent: pQty,
      grainDelivered,
      pillDelivered,
      ambushed,
      ambushRisk: effectiveAmbushRisk,
      guardReduction,
      sectGrainBefore,
      sectGrainAfter,
      sectPillsBefore,
      sectPillsAfter
    };
  };

  OUTPOSTS_LOGISTICS.tickOutpostLogistics = (W, opts) => {
    opts = opts || {};
    const st = OUTPOSTS_LOGISTICS.ensure(W);
    if (!st) return { ok: false, reason: 'invalid-world' };
    const shortageNodes = [];
    const suppliedNodes = [];
    let tickedCount = 0;

    for (const [nodeId, op] of Object.entries(st.byNodeId)) {
      if (!op || !op.active) continue;
      tickedCount++;
      const spec = OUTPOSTS_LOGISTICS.CAMP_TYPES[op.campType] || OUTPOSTS_LOGISTICS.CAMP_TYPES.CAMP_REST;
      const gNeed = spec.dailyGrainUpkeep != null ? spec.dailyGrainUpkeep : 2;
      const pNeed = spec.dailyPillUpkeep != null ? spec.dailyPillUpkeep : 0;

      const hadGrain = (op.grainStock || 0) >= gNeed && (op.grainStock || 0) > 0;
      const hadPills = pNeed === 0 || (op.pillStock || 0) >= pNeed;

      op.grainStock = Math.max(0, (op.grainStock || 0) - gNeed);
      if (pNeed > 0) op.pillStock = Math.max(0, (op.pillStock || 0) - pNeed);

      const garrisonNpcs = (op.garrisonNpcIds || []).map(id => W.byId && W.byId[id]).filter(n => n && !n.dead);
      if (!hadGrain || !hadPills) {
        const moraleDrop = !hadGrain ? 15 : 8;
        op.morale = clamp((op.morale == null ? 100 : op.morale) - moraleDrop, 0, 100);
        shortageNodes.push(nodeId);
        for (const n of garrisonNpcs) {
          n.sat = clamp((n.sat || 60) - 5, 0, 100);
          if (n.h && n.h.state) n.h.state.mood = clamp((n.h.state.mood || 0) - 6, -50, 50);
        }
      } else {
        op.morale = clamp((op.morale == null ? 100 : op.morale) + 5, 0, 100);
        suppliedNodes.push(nodeId);
        OUTPOSTS_LOGISTICS.applyCampPerksToParty(W, op, garrisonNpcs);
      }
    }

    st.lastTickDay = W.day || 1;
    return {
      ok: true,
      tickedCount,
      shortageNodes,
      suppliedNodes
    };
  };

  SECT.OUTPOSTS_LOGISTICS = OUTPOSTS_LOGISTICS;
  SECT.establishOutpost = OUTPOSTS_LOGISTICS.establishOutpost;
  SECT.dispatchSupplyConvoy = OUTPOSTS_LOGISTICS.dispatchSupplyConvoy;
  SECT.tickOutpostLogistics = OUTPOSTS_LOGISTICS.tickOutpostLogistics;

  /* ---------- [Pillar 3] ธรรมนูญสำนักระยะยาวและอุดมการณ์หลัก (SECT.CHARTER_DOCTRINE) ---------- */
  const CHARTER_DOCTRINE = {};
  CHARTER_DOCTRINE.DOCTRINES = Object.freeze({
    CHARTER_MERITOCRACY: {
      id: 'CHARTER_MERITOCRACY',
      nameTh: 'ธรรมนูญเชิดชูคุณูปการและผู้แข็งแกร่ง',
      icon: '⚖️',
      loyaltyBonus: 10,
      recruitRateMult: 1.15,
      applicantScoreBonus: 4.5,
      cpRewardMult: 1.20,
      cultRateBonus: 0.10,
      combatPowerBonus: 0.12,
      researchSpeedMult: 1.05,
      tradeIncomeMult: 1.05,
      tributeMult: 1.10,
      favoredTrait: 'ambition',
      descTh: 'จัดสรรทรัพยากรและเลื่อนขั้นตามผลงานจริง เพิ่มแต้มคุณูปการ +20%, อัตราผู้สมัคร +15%, และตบะ +10%'
    },
    CHARTER_BROTHERHOOD_SANCTUARY: {
      id: 'CHARTER_BROTHERHOOD_SANCTUARY',
      nameTh: 'ธรรมนูญภราดรภาพและร่มโพธิ์ยุทธภพ',
      icon: '🤝',
      loyaltyBonus: 20,
      recruitRateMult: 1.25,
      applicantScoreBonus: 6.0,
      cpRewardMult: 1.10,
      cultRateBonus: 0.08,
      combatPowerBonus: 0.10,
      defBonusPct: 0.15,
      researchSpeedMult: 1.0,
      tradeIncomeMult: 1.05,
      tributeMult: 1.15,
      favoredTrait: 'empathy',
      descTh: 'สำนักคือครอบครัวเดียว ความภักดีศิษย์ +20, อัตราผู้สมัครเข้าสำนัก +25%, และป้องกันศึกหน้าด่าน +15%'
    },
    CHARTER_SCHOLASTIC_DAO: {
      id: 'CHARTER_SCHOLASTIC_DAO',
      nameTh: 'ธรรมนูญปราชญ์ศึกษาวิถีเต๋า',
      icon: '📜',
      loyaltyBonus: 12,
      recruitRateMult: 1.10,
      applicantScoreBonus: 4.0,
      cpRewardMult: 1.10,
      cultRateBonus: 0.18,
      btBonus: 0.08,
      researchSpeedMult: 1.30,
      tradeIncomeMult: 1.0,
      tributeMult: 1.05,
      favoredTrait: 'curiosity',
      descTh: 'มุ่งค้นคว้าคัมภีร์และสัจธรรมเต๋า เร่งความเร็วการวิจัยวิชา +30%, ความเร็วบ่มเพาะปราณ +18%, และทะลวงด่าน +8%'
    },
    CHARTER_OPEN_MERCHANT: {
      id: 'CHARTER_OPEN_MERCHANT',
      nameTh: 'ธรรมนูญการค้าเสรีและเปิดกว้างสี่ทิศ',
      icon: '🏮',
      loyaltyBonus: 10,
      recruitRateMult: 1.20,
      applicantScoreBonus: 5.0,
      cpRewardMult: 1.15,
      cultRateBonus: 0.08,
      researchSpeedMult: 1.10,
      tradeIncomeMult: 1.30,
      tributeMult: 1.25,
      favoredTrait: 'rationality',
      descTh: 'เปิดประตูการค้าเชื่อมสี่ทิศ รายได้คาราวานและตลาด +30%, บรรณาการสำนัก +25%, และอัตราผู้สมัคร +20%'
    },
    CHARTER_RECLUSIVE_HERMIT: {
      id: 'CHARTER_RECLUSIVE_HERMIT',
      nameTh: 'ธรรมนูญสันโดษซ่อนเร้นเหนือโลกียะ',
      icon: '🏔️',
      loyaltyBonus: 16,
      recruitRateMult: 0.85,
      applicantScoreBonus: 2.0,
      cpRewardMult: 1.05,
      cultRateBonus: 0.25,
      heartDemonReduce: 0.30,
      raidThreatReduction: 0.35,
      researchSpeedMult: 1.20,
      tradeIncomeMult: 0.90,
      tributeMult: 0.95,
      favoredTrait: 'composure',
      descTh: 'ปลีกวิเวกเร้นกายจากโลกียะ เร่งความเร็วบ่มเพาะปราณ +25%, ลดจิตมาร -30%, และลดโอกาสถูกบุกโจมตี -35%'
    }
  });
  CHARTER_DOCTRINE.CHARTERS = CHARTER_DOCTRINE.DOCTRINES;

  CHARTER_DOCTRINE.ensure = W => {
    if (!W || !W.sect) return null;
    if (!W.sect.charter || typeof W.sect.charter !== 'object' || !W.sect.charter.activeDoctrine) {
      const def = CHARTER_DOCTRINE.DOCTRINES.CHARTER_MERITOCRACY;
      W.sect.charter = {
        activeDoctrine: def.id,
        nameTh: def.nameTh,
        icon: def.icon,
        adoptedDay: W.day || 1,
        loyaltyBonus: def.loyaltyBonus,
        perks: Object.assign({}, def),
        history: []
      };
    }
    return W.sect.charter;
  };

  CHARTER_DOCTRINE.getCharterPerks = W => {
    if (!W || !W.sect) return CHARTER_DOCTRINE.DOCTRINES.CHARTER_MERITOCRACY;
    const ch = CHARTER_DOCTRINE.ensure(W);
    const spec = CHARTER_DOCTRINE.DOCTRINES[ch.activeDoctrine] || CHARTER_DOCTRINE.DOCTRINES.CHARTER_MERITOCRACY;
    return Object.assign({}, spec, {
      activeDoctrine: ch.activeDoctrine,
      adoptedDay: ch.adoptedDay,
      loyaltyBonus: ch.loyaltyBonus != null ? ch.loyaltyBonus : spec.loyaltyBonus
    });
  };

  CHARTER_DOCTRINE.enactSectCharter = (W, charterId, opts) => {
    opts = opts || {};
    if (!W || !W.sect) return { ok: false, reason: 'invalid-world' };
    const ch = CHARTER_DOCTRINE.ensure(W);
    const spec = CHARTER_DOCTRINE.DOCTRINES[charterId];
    if (!spec) return { ok: false, reason: 'invalid-charter' };

    const cost = opts.free ? 0 : 50;
    if ((W.sect.stones || 0) < cost) {
      return { ok: false, reason: 'insufficient-stones', required: cost, have: W.sect.stones || 0 };
    }

    if (cost > 0) {
      if (ECO && ECO.pay) ECO.pay(W, cost, 'จัดพิธีประกาศธรรมนูญสำนัก「' + spec.nameTh + '」');
      else W.sect.stones -= cost;
      if (W.world && W.world.resourcePool && typeof W.world.resourcePool.stones === 'number') {
        W.world.resourcePool.stones += cost;
      }
    }

    let loyaltyAdjustedCount = 0;
    (W.npcs || []).forEach(n => {
      if (!n || n.dead || n.exiled) return;
      const traitVal = (n.h && n.h.personality && n.h.personality[spec.favoredTrait]) || 55;
      const traitMatchBonus = traitVal >= 55 ? Math.round(spec.loyaltyBonus * 1.2) : spec.loyaltyBonus;
      n.charterLoyaltyBonus = traitMatchBonus;
      if (n.h && n.h.personality && typeof n.h.personality.loyalty === 'number') {
        n.h.personality.loyalty = clamp(n.h.personality.loyalty + Math.round(traitMatchBonus * 0.25), 0, 100);
      }
      n.sat = clamp((n.sat || 60) + Math.round(traitMatchBonus * 0.4), 0, 100);
      n._cultRateBase = null;
      if (g.STATS && g.STATS.dirty) g.STATS.dirty(n);
      loyaltyAdjustedCount++;
    });

    const prevHistory = Array.isArray(ch.history) ? ch.history : [];
    prevHistory.unshift({
      charterId: spec.id,
      nameTh: spec.nameTh,
      adoptedDay: W.day || 1,
      costPaid: cost
    });
    if (prevHistory.length > 25) prevHistory.length = 25;

    W.sect.charter = {
      activeDoctrine: spec.id,
      nameTh: spec.nameTh,
      icon: spec.icon,
      adoptedDay: W.day || 1,
      loyaltyBonus: spec.loyaltyBonus,
      perks: Object.assign({}, spec),
      history: prevHistory
    };

    if (!opts.quiet) {
      W.log('policy', spec.icon + ' สถาปนาธรรมนูญสำนัก「' + spec.nameTh + '」อย่างเป็นทางการ!', [W.sect.masterId].filter(Boolean));
      pushWorldChronicle(W, {
        category: 'ELDER_COUNCIL_EDICT',
        icon: spec.icon,
        titleTh: 'สถาปนาธรรมนูญสำนัก「' + spec.nameTh + '」',
        storyTh: W.sect.name + ' จัดพิธีประกาศใช้ ' + spec.nameTh + ' เป็นอุดมการณ์หลักระยะยาวของสำนัก',
        consequenceTh: spec.descTh,
        npcIds: [W.sect.masterId].filter(Boolean)
      });
    }

    return {
      ok: true,
      charterId: spec.id,
      charter: W.sect.charter,
      perks: CHARTER_DOCTRINE.getCharterPerks(W),
      costPaid: cost,
      loyaltyAdjustedCount
    };
  };

  SECT.CHARTER_DOCTRINE = CHARTER_DOCTRINE;
  SECT.enactSectCharter = CHARTER_DOCTRINE.enactSectCharter;
  SECT.getCharterPerks = CHARTER_DOCTRINE.getCharterPerks;

  /* ---------- [Pillar 4] สภาแผนยุทธศาสตร์ 6 ขุนนางใหญ่ (SECT.STRATEGIC_COUNCIL) ---------- */
  const STRATEGIC_COUNCIL = {};
  STRATEGIC_COUNCIL.COUNCIL_OFFICES = Object.freeze([
    { postId: 'spymaster', titleTh: 'เจ้าหอข่าวกรองและเบาะแส', domain: 'INTELLIGENCE', icon: '🕵️' },
    { postId: 'envoy', titleTh: 'ทูตยุทธภพและกิจการบริวาร', domain: 'DIPLOMACY', icon: '🕊️' },
    { postId: 'quartermaster', titleTh: 'แม่ทัพยุทธปัจจัยและคาราวาน', domain: 'LOGISTICS', icon: '🐪' },
    { postId: 'vanguard', titleTh: 'ผู้อาวุโสกองหน้าพิทักษ์ด่าน', domain: 'DEFENSE', icon: '🛡️' },
    { postId: 'warden', titleTh: 'ผู้คุมทัณฑ์และเชลยศึก', domain: 'DUNGEON', icon: '⛓️' },
    { postId: 'marketmaster', titleTh: 'นายวาณิชย์ตลาดภายนอก', domain: 'COMMERCE', icon: '🏮' }
  ]);

  STRATEGIC_COUNCIL.AGENDA_CHOICES = Object.freeze({
    FORTIFY_LOGISTICS: {
      id: 'FORTIFY_LOGISTICS',
      nameTh: 'เสริมความมั่นคงเส้นทางยุทธปัจจัยและป้อมค่าย',
      icon: '🛡️',
      proposedBy: ['quartermaster', 'vanguard', 'warden'],
      descTh: 'จัดส่งเสบียงฉุกเฉินสู่ค่ายพักหน้าด่าน เสริมกำลังป้อมยาม (+20 ขวัญกำลังใจค่าย) และยกระดับความมั่นคงคุกใต้ดิน (+15%)'
    },
    DIPLOMATIC_OFFENSIVE: {
      id: 'DIPLOMATIC_OFFENSIVE',
      nameTh: 'ส่งทูตผูกมิตรและขยายเครือข่ายการค้าสี่ทิศ',
      icon: '🕊️',
      proposedBy: ['envoy', 'marketmaster', 'spymaster'],
      descTh: 'เจริญสัมพันธไมตรีกับสำนักพันธมิตร (+8 ท่าที), เพิ่มโบนัสการทูตและการค้า (+15%), และขยายข่ายข่าวกรองเตือนภัยล่วงหน้า'
    },
    GRAND_WAR_DRILL: {
      id: 'GRAND_WAR_DRILL',
      nameTh: 'เปิดซ้อมรบใหญ่และระดมพลแนวหน้า',
      icon: '⚔️',
      proposedBy: ['vanguard', 'spymaster', 'warden'],
      descTh: 'ฝึกซ้อมค่ายกลยุทธวิธีทั้งสำนัก มอบบัฟโองการพยุหะ (tacticalCommand) และเร่งตบะศิษย์แนวหน้าทุกคน'
    }
  });

  STRATEGIC_COUNCIL.ensure = W => {
    if (!W || !W.sect) return null;
    if (!W.sect.strategicCouncil || typeof W.sect.strategicCouncil !== 'object') {
      W.sect.strategicCouncil = {
        seq: 0,
        lastConvenedDay: 0,
        activeSession: null,
        resolvedCount: 0,
        lastChoiceId: null,
        history: []
      };
    }
    if (!Array.isArray(W.sect.strategicCouncil.history)) W.sect.strategicCouncil.history = [];
    return W.sect.strategicCouncil;
  };

  STRATEGIC_COUNCIL.conveneCouncil = (W, opts) => {
    opts = opts || {};
    const st = STRATEGIC_COUNCIL.ensure(W);
    if (!st) return { ok: false, reason: 'invalid-world' };
    OUTPOSTS_LOGISTICS.ensure(W);
    CHARTER_DOCTRINE.ensure(W);
    if (SECT.ensureDungeon) SECT.ensureDungeon(W);

    const alive = (W.npcs || []).filter(n => n && !n.dead && !n.exiled);
    const officerReports = {};
    const reportsList = [];

    const outpostsCount = Object.keys(W.sect.outposts.byNodeId || {}).length;
    const prisonerCount = (W.sect.dungeon && Array.isArray(W.sect.dungeon.prisoners)) ? W.sect.dungeon.prisoners.length : 0;
    const hostileSects = ((W.world && W.world.sects) || []).filter(s => s && (s.attitude || 0) < -15).length;
    const grainStock = (W.sect.stock && W.sect.stock.grain) || 0;
    const stones = W.sect.stones || 0;

    STRATEGIC_COUNCIL.COUNCIL_OFFICES.forEach((off, idx) => {
      const holder = (SECT.holder && SECT.holder(W, off.postId)) || alive[idx % Math.max(1, alive.length)] || null;
      const officerNameTh = holder ? HC.fullName(holder) : 'ผู้รักษาการอาวุโส';
      let summaryTh = '';
      let readiness = 80;
      if (off.postId === 'spymaster') {
        readiness = clamp(75 + Math.round(((W.threat && W.threat.earlyWarningBonus) || 0) * 100) - hostileSects * 5, 25, 100);
        summaryTh = 'ตรวจพบสำนักที่มีท่าทีคุกคาม ' + hostileSects + ' แห่ง · ข่ายข่าวกรองพร้อมใช้งาน ' + readiness + '%';
      } else if (off.postId === 'envoy') {
        const allyCount = ((W.world && W.world.allSects) || []).filter(s => s && (s.attitude || 0) >= 25).length;
        readiness = clamp(65 + allyCount * 5, 30, 100);
        summaryTh = 'สำนักที่มีไมตรีจิต ' + allyCount + ' แห่ง · โบนัสการทูตปัจจุบัน +' + Math.round((W.sect.diplomacyBonus || 0) * 100) + '%';
      } else if (off.postId === 'quartermaster') {
        readiness = clamp(50 + Math.min(40, Math.floor(grainStock / 4)) + outpostsCount * 5, 20, 100);
        summaryTh = 'เสบียงคลังสำนักมีข้าวสาร ' + grainStock + ' หน่วย · ค่ายพักหน้าด่าน ' + outpostsCount + ' แห่ง';
      } else if (off.postId === 'vanguard') {
        readiness = clamp(78 + (W.sect.vanguardPosture === 'IRON_SHIELD_WALL' ? 15 : 5), 35, 100);
        summaryTh = 'แนวป้องกันหน้าด่านอยู่ในเกณฑ์ ' + readiness + '% · ท่วงท่ากองหน้า: ' + (W.sect.vanguardPosture || 'STANDARD');
      } else if (off.postId === 'warden') {
        const sec = W.sect.dungeonSecurity || (W.sect.dungeon && W.sect.dungeon.securityLevel) || 75;
        readiness = clamp(sec - prisonerCount * 4, 25, 100);
        summaryTh = 'คุมขังเชลยศึก ' + prisonerCount + ' คน · ระดับความมั่นคงคุกใต้ดิน ' + readiness + '%';
      } else if (off.postId === 'marketmaster') {
        readiness = clamp(55 + Math.min(45, Math.floor(stones / 40)), 25, 100);
        summaryTh = 'คลังสำนักมีศิลาปราณ ' + stones + ' ก้อน · เส้นทางคาราวานพร้อมทำกำไร';
      }
      const rep = {
        postId: off.postId,
        titleTh: off.titleTh,
        domain: off.domain,
        icon: off.icon,
        officerId: holder ? holder.id : null,
        officerNameTh,
        readiness,
        summaryTh
      };
      officerReports[off.postId] = rep;
      reportsList.push(rep);
    });

    const avgReadiness = Math.round(reportsList.reduce((acc, r) => acc + r.readiness, 0) / Math.max(1, reportsList.length));
    const threatScore = clamp(30 + hostileSects * 12 + prisonerCount * 6 - Math.round((avgReadiness - 60) * 0.4), 10, 95);
    const options = Object.values(STRATEGIC_COUNCIL.AGENDA_CHOICES).map(c => Object.assign({}, c));

    const councilReport = {
      sessionId: 'COUNCIL_' + (W.day || 1) + '_' + (++st.seq),
      convenedDay: W.day || 1,
      officerReports,
      reportsList,
      avgReadiness,
      threatScore,
      threatLevel: threatScore >= 65 ? 'HIGH' : (threatScore >= 40 ? 'MODERATE' : 'LOW'),
      threatSummaryTh: 'ระดับภัยคุกคามรวม ' + threatScore + '/100 · ความพร้อมของ 6 ทำเนียบขุนนางเฉลี่ย ' + avgReadiness + '%',
      options,
      resolved: false,
      chosenAgendaId: null
    };

    st.activeSession = councilReport;
    st.lastConvenedDay = W.day || 1;

    if (!opts.quiet) {
      W.log('policy', '👑 เจ้าสำนักเรียกประชุมสภาแผนยุทธศาสตร์ 6 ขุนนางใหญ่ (ความพร้อมเฉลี่ย ' + avgReadiness + '%)', [W.sect.masterId].filter(Boolean));
    }

    return {
      ok: true,
      councilReport,
      officerReports,
      reportsList,
      options
    };
  };

  STRATEGIC_COUNCIL.resolveCouncilAgenda = (W, choiceId, opts) => {
    opts = opts || {};
    const st = STRATEGIC_COUNCIL.ensure(W);
    if (!st) return { ok: false, reason: 'invalid-world' };
    if (!st.activeSession) {
      STRATEGIC_COUNCIL.conveneCouncil(W, { quiet: true });
    }
    const session = st.activeSession;
    const normalizedId = String(choiceId || 'FORTIFY_LOGISTICS').replace(/^AGENDA_/, '');
    const choiceSpec = STRATEGIC_COUNCIL.AGENDA_CHOICES[normalizedId] || STRATEGIC_COUNCIL.AGENDA_CHOICES.FORTIFY_LOGISTICS;

    const effects = { choiceId: choiceSpec.id };
    if (choiceSpec.id === 'FORTIFY_LOGISTICS') {
      W.sect.dungeonSecurity = clamp((W.sect.dungeonSecurity || 75) + 15, 0, 100);
      if (W.sect.dungeon) W.sect.dungeon.securityLevel = W.sect.dungeonSecurity;
      for (const op of Object.values((W.sect.outposts && W.sect.outposts.byNodeId) || {})) {
        if (!op) continue;
        op.grainStock = (op.grainStock || 0) + 10;
        op.pillStock = (op.pillStock || 0) + 3;
        op.morale = clamp((op.morale || 80) + 20, 0, 100);
      }
      effects.dungeonSecurity = W.sect.dungeonSecurity;
      effects.outpostsReinforced = Object.keys((W.sect.outposts && W.sect.outposts.byNodeId) || {}).length;
    } else if (choiceSpec.id === 'DIPLOMATIC_OFFENSIVE') {
      W.sect.diplomacyBonus = +((W.sect.diplomacyBonus || 0) + 0.15).toFixed(2);
      W.threat = W.threat || {};
      W.threat.earlyWarningBonus = +((W.threat.earlyWarningBonus || 0) + 0.15).toFixed(2);
      ((W.world && W.world.allSects) || []).forEach(s => {
        if (s) s.attitude = clamp((s.attitude || 0) + 8, -100, 100);
      });
      effects.diplomacyBonus = W.sect.diplomacyBonus;
      effects.earlyWarningBonus = W.threat.earlyWarningBonus;
    } else if (choiceSpec.id === 'GRAND_WAR_DRILL') {
      W.sect.vanguardPosture = 'IRON_SHIELD_WALL';
      W.sect.vanguardInterceptBonus = Math.max(W.sect.vanguardInterceptBonus || 0, 0.20);
      let buffedCount = 0;
      (W.npcs || []).forEach(n => {
        if (!n || n.dead || n.exiled) return;
        if (g.STATS && g.STATS.applyNamedBuff) {
          g.STATS.applyNamedBuff(n, 'tacticalCommand', 120, W.t || 0, { casterId: W.sect.masterId });
        }
        if (n.cult && CULT && CULT.gain) CULT.gain(n, 20, W, 'council_war_drill');
        buffedCount++;
      });
      effects.vanguardPosture = W.sect.vanguardPosture;
      effects.buffedCount = buffedCount;
    }

    session.resolved = true;
    session.chosenAgendaId = choiceSpec.id;
    session.resolvedDay = W.day || 1;
    session.effects = effects;

    st.resolvedCount = (st.resolvedCount || 0) + 1;
    st.lastChoiceId = choiceSpec.id;
    st.history.unshift({
      sessionId: session.sessionId,
      day: W.day || 1,
      choiceId: choiceSpec.id,
      nameTh: choiceSpec.nameTh,
      effects
    });
    if (st.history.length > 30) st.history.length = 30;

    if (!opts.quiet) {
      W.log('policy', choiceSpec.icon + ' สภาแผนยุทธศาสตร์ 6 ขุนนางมีมติสั่งการ「' + choiceSpec.nameTh + '」!', [W.sect.masterId].filter(Boolean));
      pushWorldChronicle(W, {
        category: 'ELDER_COUNCIL_EDICT',
        icon: choiceSpec.icon,
        titleTh: 'มติสภา 6 ขุนนางใหญ่:「' + choiceSpec.nameTh + '」',
        storyTh: 'หลังรับฟังรายงานจากขุนนางทั้ง 6 ทำเนียบ เจ้าสำนักได้เคาะแผนยุทธศาสตร์ ' + choiceSpec.nameTh,
        consequenceTh: choiceSpec.descTh,
        npcIds: [W.sect.masterId].filter(Boolean)
      });
    }

    return {
      ok: true,
      choiceId: choiceSpec.id,
      choice: choiceSpec,
      effects,
      councilReport: session
    };
  };

  SECT.STRATEGIC_COUNCIL = STRATEGIC_COUNCIL;
  SECT.conveneCouncil = STRATEGIC_COUNCIL.conveneCouncil;
  SECT.resolveCouncilAgenda = STRATEGIC_COUNCIL.resolveCouncilAgenda;

  /* ===== PATCH v5.5.0: GRAND FORMATION WARFARE & DYNAMIC WEATHER CALAMITIES ===== */
  /* ===== PATCH v5.8.0 [PILLAR 3]: SECT FORBIDDEN SCRIPTURE VAULT & PRIMORDIAL BLOODLINE ALTAR ===== */
  SECT.FORBIDDEN_VAULT = {
    POLICIES: {
      STRICT_ORTHODOX_BAN: {
        id: 'STRICT_ORTHODOX_BAN',
        icon: '⚖️',
        nameTh: 'ผนึกตายห้ามฝึกวิชาต้องห้าม (正道严禁)',
        shortTh: 'ผนึกตายฝ่ายธรรมะ',
        fameBonus: 15,
        sectPowerMult: 1.00,
        heartDemonDelta: -0.25,
        descTh: 'สั่งปิดตายหอผนึกคัมภีร์ต้องห้าม เชิดชูเกียรติภูมิสำนักฝ่ายธรรมะ (+15 ชื่อเสียง) และลดการเกิดจิตมารทั่วสำนัก'
      },
      ELDER_LICENSED_ACCESS: {
        id: 'ELDER_LICENSED_ACCESS',
        icon: '📜',
        nameTh: 'อนุญาตเฉพาะผู้อาวุโสและศิษย์แกนกลางยามศึก (长老特许)',
        shortTh: 'อนุญาตเฉพาะแกนกลาง',
        fameBonus: 0,
        sectPowerMult: 1.15,
        heartDemonDelta: 0.05,
        descTh: 'เปิดหอผนึกให้ผู้อาวุโสและศิษย์แกนกลางศึกษาเพื่อป้องกันสำนักในยามวิกฤต เพิ่มพลังรบสำนัก +15% อย่างสมดุล'
      },
      UNRESTRICTED_BLOOD_CULT: {
        id: 'UNRESTRICTED_BLOOD_CULT',
        icon: '🩸',
        nameTh: 'เปิดหอคัมภีร์ต้องห้ามเสรี (禁忌全开)',
        shortTh: 'เปิดเสรีวิชาต้องห้าม!',
        fameBonus: -10,
        sectPowerMult: 1.35,
        heartDemonDelta: 0.30,
        descTh: 'ปลดล็อกคัมภีร์ต้องห้ามให้ศิษย์ทุกคนเข้าถึงได้เพื่อเร่งอำนาจสูงสุด! พลังรบสำนักพุ่งทะยาน +35% แต่เพิ่มแรงกดดันจิตมาร'
      }
    },
    ALTAR_RITUALS: {
      AWAKEN_BLOODLINE_ALTAR: {
        id: 'AWAKEN_BLOODLINE_ALTAR',
        icon: '🩸',
        nameTh: 'พิธีปลุกสายเลือดบรรพกาลและแท่นสังเวยอสูร',
        descTh: 'หลอมแก่นอสูรและศิลาวิญญาณบนแท่นบูชาบรรพกาล มอบบัฟเร่งพลังรบ +18% และความเร็วบ่มเพาะ +20% แก่ศิษย์ทั้งสำนัก'
      },
      PURIFY_TABOO_BACKLASH: {
        id: 'PURIFY_TABOO_BACKLASH',
        icon: '🪷',
        nameTh: 'มหาพิธีชำระล้างปราณต้องห้ามและคลายชีพจร',
        descTh: 'เดินค่ายกลชำระล้างอาการชีพจรตึงเครียด (Taboo Strain), พิษโอสถ และจิตมารที่เกิดจากการใช้วิชาต้องห้ามให้หมดสิ้นทั้งสำนัก'
      }
    },
    ensure(W) {
      if (!W || !W.sect) return null;
      if (!W.sect.forbiddenVault || typeof W.sect.forbiddenVault !== 'object') {
        W.sect.forbiddenVault = {
          policy: 'ELDER_LICENSED_ACCESS',
          altarLevel: 1,
          bloodlineSurgeUntil: 0,
          totalRitualsPerformed: 0,
          totalTabooPurifications: 0
        };
      }
      return W.sect.forbiddenVault;
    },
    setVaultPolicy(W, policyId, opts) {
      if (!W || !W.sect || !this.POLICIES[policyId]) return { ok: false, reason: 'invalid-policy' };
      const fv = this.ensure(W);
      fv.policy = policyId;
      const spec = this.POLICIES[policyId];
      const autonomous = !!(opts && opts.autonomous);
      if (Array.isArray(W.npcs)) {
        W.npcs.forEach(n => {
          if (!n || n.dead || !n.cult) return;
          const hasAsceticVow = !!(n.voluntaryVows && n.voluntaryVows.VOW_ASCETIC_PRECEPT && n.voluntaryVows.VOW_ASCETIC_PRECEPT.active);
          if (policyId === 'STRICT_ORTHODOX_BAN' || hasAsceticVow) {
            if (n.forbiddenArtState) n.forbiddenArtState.sealMode = 'SEALED_RESTRAINT';
            if (policyId === 'STRICT_ORTHODOX_BAN' && n.h && n.h.state) n.h.state.heartDemon = Math.max(0, (n.h.state.heartDemon || 0) - 8);
          } else if (autonomous && CULT && CULT.evaluateAutonomousPostures) {
            CULT.evaluateAutonomousPostures(W, n, { trigger: 'vault_policy' });
          } else if (policyId === 'UNRESTRICTED_BLOOD_CULT' && CULT && CULT.FORBIDDEN_ARTS) {
            CULT.FORBIDDEN_ARTS.setForbiddenSealMode(W, n, 'HALF_UNSEALED_FLOW');
          }
          n._cultRateBase = null;
        });
      }
      return { ok: true, policyId, spec, state: fv };
    },
    evaluateAutonomousSectVault(W) {
      if (!W || !W.sect || !Array.isArray(W.npcs)) return null;
      const fv = this.ensure(W);
      const alive = W.npcs.filter(u => u && !u.dead && !u.away && !u.foe && u.cult);
      if (!alive.length) return null;
      const decisionMaker = alive.find(u => u.role === 'master') || alive.find(u => u.role === 'elder') || alive[0];
      const pStats = decisionMaker.h && decisionMaker.h.personality || {};
      const integ = pStats.integrity != null ? pStats.integrity : 50;
      const agg = pStats.aggression != null ? pStats.aggression : 50;
      const darkPaths = new Set(['DEMON', 'VOID_HERETIC_PACT', 'DEVOURING_FLESH', 'NETHER_GRAVE', 'OCCULT_MAGE', 'VENOM_GU']);
      const isDarkLeader = darkPaths.has(decisionMaker.cult.path);
      const darkShare = alive.filter(u => darkPaths.has(u.cult.path)).length / alive.length;
      const inDanger = !!(W.activeRaid || (g.COMBAT && g.COMBAT.fights && g.COMBAT.fights.some(f => f && !f.done && f.kind === 'raid')));
      let avgStrain = 0, avgHd = 0, btReady = 0;
      for (let i = 0; i < alive.length; i++) {
        const u = alive[i];
        avgStrain += (u.forbiddenArtState && u.forbiddenArtState.tabooStrain) || 0;
        avgHd += (u.h && u.h.state && u.h.state.heartDemon) || 0;
        if (CULT && CULT.ready && CULT.ready(u)) btReady++;
      }
      avgStrain /= alive.length;
      avgHd /= alive.length;
      let wantPol = 'ELDER_LICENSED_ACCESS';
      let whyTh = 'สภาผู้อาวุโสและเจ้าสำนักเปิดใช้คัมภีร์ต้องห้ามเฉพาะศิษย์แกนกลางเพื่อถ่วงดุลความเสี่ยง';
      if ((integ >= 64 && !isDarkLeader && darkShare < 0.35 && !inDanger) || avgHd >= 42 || avgStrain >= 45) {
        wantPol = 'STRICT_ORTHODOX_BAN';
        whyTh = (avgHd >= 42 || avgStrain >= 45)
          ? 'จิตมารและแรงสะท้อนปราณสะสมสูง เจ้าสำนักสั่งปิดผนึกหอต้องห้ามเพื่อฟื้นฟูชีพจร'
          : 'เจ้าสำนักยึดมั่นวิถีธรรม ปิดผนึกหอคัมภีร์ต้องห้ามเพื่อรักษาเกียรติภูมิและปราบจิตมาร';
      } else if (isDarkLeader || darkShare >= 0.45 || (inDanger && (integ < 52 || agg >= 62))) {
        wantPol = 'UNRESTRICTED_BLOOD_CULT';
        whyTh = inDanger
          ? 'สำนักเผชิญภัยคุกคามรุนแรง เจ้าสำนักปลดผนึกหอต้องห้ามเต็มพิกัดเพื่อทุ่มกำลังรบป้องกันสำนัก'
          : 'รากฐานสำนักเอนเอียงสู่สายมาร/ต้องห้าม เจ้าสำนักเปิดเสรีคัมภีร์เพื่อเร่งตบะและอานุภาพสูงสุด';
      }
      if (fv.policy !== wantPol) {
        this.setVaultPolicy(W, wantPol, { autonomous: true });
      }
      fv.whyTh = whyTh;
      if ((W.t - (fv.lastAltarTick || -999)) >= 120) {
        if (avgStrain >= 35 || avgHd >= 38) {
          fv.lastAltarTick = W.t;
          this.performAltarRitual(W, 'PURIFY_TABOO_BACKLASH');
          fv.whyTh = 'ผู้อาวุโสนำทำพิธีชำระล้างปราณต้องห้ามและคลายชีพจรสะสมให้ศิษย์';
        } else if (wantPol !== 'STRICT_ORTHODOX_BAN' && (inDanger || btReady >= Math.max(2, Math.floor(alive.length * 0.3))) && (fv.bloodlineSurgeUntil || 0) <= (W.t || 0)) {
          fv.lastAltarTick = W.t;
          this.performAltarRitual(W, 'AWAKEN_BLOODLINE_ALTAR');
          fv.whyTh = inDanger ? 'ปลุกพลังแท่นโลหิตบรรพกาลหนุนศิษย์ต้านภัยวิกฤต' : 'ปลุกแท่นสายเลือดบรรพกาลเสริมกำลังทะลวงด่านของสำนัก';
        }
      }
      return fv;
    },
    performAltarRitual(W, ritualId) {
      if (!W || !W.sect || !this.ALTAR_RITUALS[ritualId]) return { ok: false, reason: 'invalid-ritual' };
      const fv = this.ensure(W);
      fv.totalRitualsPerformed = (fv.totalRitualsPerformed || 0) + 1;
      const alive = (W.npcs || []).filter(n => n && !n.dead && !n.away);
      if (ritualId === 'AWAKEN_BLOODLINE_ALTAR') {
        fv.bloodlineSurgeUntil = (W.t || 0) + 2880;
        alive.forEach(n => {
          if (n.cult) n._btBonusPct = Math.max(n._btBonusPct || 0, 0.15);
          if (n.h && n.h.state) n.h.state.qi = CULT.qiMax(n);
        });
      } else if (ritualId === 'PURIFY_TABOO_BACKLASH') {
        fv.totalTabooPurifications = (fv.totalTabooPurifications || 0) + 1;
        alive.forEach(n => {
          if (n.forbiddenArtState) n.forbiddenArtState.tabooStrain = 0;
          if (n.h && n.h.state) {
            n.h.state.heartDemon = Math.max(0, (n.h.state.heartDemon || 0) - 25);
            n.h.state.stress = Math.max(0, (n.h.state.stress || 0) - 25);
            n.h.state.hp = CULT.hpMax(n);
          }
          if (n.cult) n.cult.toxic = Math.max(0, (n.cult.toxic || 0) - 25);
        });
      }
      return { ok: true, ritualId, spec: this.ALTAR_RITUALS[ritualId], affectedCount: alive.length, state: fv };
    }
  };

  SECT.FORMATION_WARFARE = {
    STANCES: {
      FIVE_ELEMENT_NURTURE: {
        id: 'FIVE_ELEMENT_NURTURE',
        icon: '☯️',
        nameTh: 'มหาค่ายกลเบญจธาตุหล่อเลี้ยงปราณ',
        shortTh: 'เบญจธาตุหล่อเลี้ยง',
        beamColor: '#48cae4',
        secondaryColor: '#72efdd',
        cultRateBonusPct: 0.20,
        atkBonusPct: 0,
        dmgRedPct: 0.08,
        descTh: 'เชื่อมโยงเส้นชีพจรปราณจากลานแปดทิศสู่ยอดเขาทั้งแปด เร่งความเร็วบ่มเพาะคัมภีร์ปราณทั้งสำนัก +20% และลดความเสียหายทั่วไป 8%'
      },
      SWORD_NET_SLAUGHTER: {
        id: 'SWORD_NET_SLAUGHTER',
        icon: '⚔️',
        nameTh: 'มหาค่ายกลตาข่ายกระบี่สังหารเทวะ',
        shortTh: 'ตาข่ายกระบี่สังหาร',
        beamColor: '#ff4d6d',
        secondaryColor: '#ffd166',
        cultRateBonusPct: 0,
        atkBonusPct: 0.22,
        dmgRedPct: 0.05,
        descTh: 'แปรเปลี่ยนเสาค่ายกลและยอดเขาเป็นโครงข่ายลำแสงกระบี่สังหาร เพิ่มพลังโจมตีให้ศิษย์ผู้พิทักษ์สำนัก +22% และฟาดลำแสงกระบี่ใส่ผู้บุกรุก'
      },
      IMMORTAL_AEGIS_DOME: {
        id: 'IMMORTAL_AEGIS_DOME',
        icon: '🛡️',
        nameTh: 'มหาค่ายกลระฆังสวรรค์พิทักษ์สำนัก',
        shortTh: 'ระฆังสวรรค์คุ้มภัย',
        beamColor: '#ffd166',
        secondaryColor: '#00f5d4',
        cultRateBonusPct: 0.05,
        atkBonusPct: 0.05,
        dmgRedPct: 0.22,
        descTh: 'กางม่านพลังระฆังทองสวรรค์เชื่อมยอดเขาและเสาโทเท็มทั้งสี่ทิศ ลดความเสียหายที่ศิษย์ในสำนักได้รับลง -22% และเสริมความแข็งแกร่งของม่านพลังสำนัก'
      }
    },
    WEATHER_PHENOMENA: {
      clear: { id: 'clear', icon: '🌤️', nameTh: 'ฟ้าใสปราณสมดุล', favoredArchetype: 'PRIMORDIAL_YANG_FURNACE', descTh: 'ท้องฟ้าปลอดโปร่ง ปราณฟ้าดินไหลเวียนสมดุล' },
      rain: { id: 'rain', icon: '🌧️', nameTh: 'พิรุณโปรยปราย', favoredArchetype: 'EVERGREEN_LONGEVITY_SPRING', descTh: 'สายฝนชุ่มฉ่ำ หนุนปราณน้ำพุพฤกษาและย่างก้าวบัวหยก' },
      snow: { id: 'snow', icon: '❄️', nameTh: 'เหมันต์หิมะโปรย', favoredArchetype: 'ABYSSAL_FROST_MIRROR', descTh: 'ไอเย็นเยือกแข็งปกคลุมสำนัก หนุนปราณกระจกน้ำแข็งจันทรา +22%' },
      spirit_aurora: { id: 'spirit_aurora', icon: '🌌', nameTh: 'แสงเหนือปราณดาราจักรวาล', favoredArchetype: 'ASTRAL_VOID_BREATHING', descTh: 'ม่านแสงดาราเจ็ดสีพาดผ่านเวหา หนุนคัมภีร์ลมหายใจดาราจักรวาล +30%' },
      crimson_sun: { id: 'crimson_sun', icon: '☀️', nameTh: 'สุริยันเพลิงศักดิ์สิทธิ์ทรงกลด', favoredArchetype: 'PRIMORDIAL_YANG_FURNACE', descTh: 'ปราณหยางบริสุทธิ์แผ่ซ่านจากดวงตะวัน หนุนคัมภีร์เตาหลอมสุริยันอัคนี +25%' },
      thunder_tempest: { id: 'thunder_tempest', icon: '⛈️', nameTh: 'พายุอัสนีทัณฑ์สวรรค์คำราม', favoredArchetype: 'SWORD_QI_MERIDIAN', descTh: 'ประจุสายฟ้าแลบแปลบปลาบทั่วขุนเขา หนุนคัมภีร์ชีพจรกระบี่และระฆังทองวัชระ +24%' }
    },
    ensure(W) {
      if (!W || !W.sect) return null;
      if (!W.sect.formationWarfare || typeof W.sect.formationWarfare !== 'object') {
        W.sect.formationWarfare = {
          activeStance: 'FIVE_ELEMENT_NURTURE',
          beamIntensity: 1.0,
          switchedCount: 0,
          lastSwitchedTick: 0
        };
      }
      return W.sect.formationWarfare;
    },
    setFormationStance(W, stanceId) {
      if (!W || !W.sect || !this.STANCES[stanceId]) return { ok: false, reason: 'invalid-stance' };
      const fw = this.ensure(W);
      fw.activeStance = stanceId;
      fw.switchedCount = (fw.switchedCount || 0) + 1;
      fw.lastSwitchedTick = W.t || 0;
      if (Array.isArray(W.npcs)) {
        W.npcs.forEach(n => { if (n) n._cultRateBase = null; });
      }
      return { ok: true, stanceId, spec: this.STANCES[stanceId], state: fw };
    },
    triggerWeatherPhenomenon(W, weatherKind) {
      if (!W || !this.WEATHER_PHENOMENA[weatherKind]) return { ok: false, reason: 'invalid-weather' };
      const wSpec = this.WEATHER_PHENOMENA[weatherKind];
      W.weather = { kind: weatherKind, t: W.t || 0, labelTh: wSpec.nameTh };
      if (Array.isArray(W.npcs)) {
        W.npcs.forEach(n => { if (n) { n._cultRateBase = null; n._qgUnlockCache = null; } });
      }
      return { ok: true, weatherKind, spec: wSpec };
    }
  };


  /* =========================================================================
   * PATCH v2.0.0: PILLAR 2 — SINGLE STARTER PATH & SECT PATH LIBRARY EXPANSION
   * (ระบบหอคัมภีร์มหาวิถีประจำสำนัก: เริ่มต้นปลดล็อก 1 วิถีหลัก และขยายด้วยคัมภีร์/ผลึกวิถีทั้ง 27 สาย)
   * ========================================================================= */
  SECT.PATH_LIBRARY = {
    getAllPathIds() {
      return Object.keys((CULT && CULT.PATHS) || (JD && JD.CULT && JD.CULT.paths) || {});
    },

    resolveStarterPath(W) {
      const archId = (W && W.sect && W.sect.archetype) || 'sword';
      const arch = (SECT.ARCHETYPES && SECT.ARCHETYPES[archId]) || null;
      if (arch && arch.path && CULT && CULT.PATHS && CULT.PATHS[arch.path]) {
        return arch.path;
      }
      const master = W && W.sect && W.sect.masterId && W.byId && W.byId[W.sect.masterId];
      if (master && master.cult && master.cult.path && CULT.PATHS[master.cult.path]) {
        return master.cult.path;
      }
      return 'XIAN';
    },

    ensure(W) {
      if (!W || !W.sect) return null;
      const starterPath = this.resolveStarterPath(W);
      if (!W.sect.pathLibrary || typeof W.sect.pathLibrary !== 'object') {
        W.sect.pathLibrary = {
          version: '2.0.0',
          starterPath,
          unlockedPaths: [starterPath],
          donatedManuals: ['MANUAL_PATH_' + starterPath],
          crystalBestowals: [],
          history: [
            {
              day: W.day || 1,
              type: 'FOUNDING_PATH',
              pathId: starterPath,
              source: 'sect_founding',
              noteTh: 'มรดกวิถีปฐมฤกษ์ประจำสำนัก'
            }
          ]
        };
      } else {
        if (!Array.isArray(W.sect.pathLibrary.unlockedPaths) || !W.sect.pathLibrary.unlockedPaths.length) {
          W.sect.pathLibrary.unlockedPaths = [starterPath];
        }
        if (!W.sect.pathLibrary.starterPath) W.sect.pathLibrary.starterPath = W.sect.pathLibrary.unlockedPaths[0];
        if (!Array.isArray(W.sect.pathLibrary.donatedManuals)) W.sect.pathLibrary.donatedManuals = ['MANUAL_PATH_' + W.sect.pathLibrary.starterPath];
        if (!Array.isArray(W.sect.pathLibrary.crystalBestowals)) W.sect.pathLibrary.crystalBestowals = [];
        if (!Array.isArray(W.sect.pathLibrary.history)) W.sect.pathLibrary.history = [];
      }
      return W.sect.pathLibrary;
    },

    getUnlockedPaths(W) {
      const lib = this.ensure(W);
      return lib ? lib.unlockedPaths.slice() : ['XIAN'];
    },

    isPathUnlocked(W, pathId) {
      if (!pathId) return false;
      const lib = this.ensure(W);
      return !!(lib && lib.unlockedPaths.includes(pathId));
    },

    canDiscipleStudyPath(W, npc, pathId) {
      if (!pathId || !CULT.PATHS[pathId]) return false;
      if (this.isPathUnlocked(W, pathId)) return true;
      if (npc && npc.mortalCult && npc.mortalCult.enlightenedByCrystal === pathId) return true;
      if (npc && npc.cult && npc.cult.path === pathId) return true;
      return false;
    },

    unlockPath(W, pathId, opts) {
      opts = opts || {};
      if (!W || !W.sect) return { ok: false, reason: 'no-world' };
      const pKey = String(pathId || '').replace(/^MANUAL_PATH_/, '').trim().toUpperCase();
      if (!CULT || !CULT.PATHS || !CULT.PATHS[pKey]) {
        return { ok: false, reason: 'invalid-path', pathId: pKey };
      }
      const lib = this.ensure(W);
      const already = lib.unlockedPaths.includes(pKey);
      if (!already) {
        lib.unlockedPaths.push(pKey);
      }
      const manualId = 'MANUAL_PATH_' + pKey;
      if (!lib.donatedManuals.includes(manualId)) {
        lib.donatedManuals.push(manualId);
      }
      // Also add starter T1-T2 techniques of this path into W.sect.library so disciples can study them
      if (Array.isArray(W.sect.library) && JD && JD.TECH && Array.isArray(JD.TECH.techniques)) {
        JD.TECH.techniques.forEach(t => {
          if (t && t.path === pKey && (t.tier || 1) <= 2 && !t.innateOnly && !W.sect.library.includes(t.id)) {
            W.sect.library.push(t.id);
          }
        });
      }
      const pDef = CULT.PATHS[pKey];
      // Also register starter subpath of the newly unlocked path into W.sect.subLibrary
      if (pDef && Array.isArray(pDef.subPaths) && pDef.subPaths.length && opts.source !== 'sect_founding') {
        W.sect.subLibrary = Array.isArray(W.sect.subLibrary) ? W.sect.subLibrary : [];
        const starterSub = pDef.subPaths[0];
        if (starterSub && starterSub.id && !W.sect.subLibrary.includes(starterSub.id)) {
          W.sect.subLibrary.push(starterSub.id);
        }
      }
      if (!already) {
        const resolvedById = opts.byId || (opts.byNpc && opts.byNpc.id) || null;
        lib.history.unshift({
          day: W.day || 1,
          type: 'UNLOCK_PATH',
          pathId: pKey,
          pathNameTh: pDef.nameTh,
          source: opts.source || 'manual',
          byId: resolvedById
        });
        if (lib.history.length > 50) lib.history.length = 50;
        if (typeof W.log === 'function' && !opts.quiet) {
          W.log('research', '📚 หอคัมภีร์สำนักบรรจุคัมภีร์ต้นกำเนิด ปลดล็อก「' + pDef.nameTh + '」สำเร็จ! (เปิดวิถีแล้ว ' + lib.unlockedPaths.length + '/' + this.getAllPathIds().length + ' มหาวิถี)', resolvedById ? [resolvedById] : []);
        }
        // Let mortals re-evaluate their best study path now that a new path is available in the library
        if (Array.isArray(W.npcs) && CULT.MORTAL_INITIATION) {
          W.npcs.forEach(n => {
            if (n && !n.dead && !n.cult && n.mortalCult && !n.mortalCult.enlightenedByCrystal && (n.mortalCult.daoComprehension || 0) < 35) {
              CULT.MORTAL_INITIATION.chooseMortalStudyPath(W, n, { forceRechoose: true });
            }
          });
        }
      }
      return {
        ok: true,
        alreadyUnlocked: already,
        pathId: pKey,
        pathNameTh: pDef.nameTh,
        unlockedCount: lib.unlockedPaths.length,
        totalPaths: this.getAllPathIds().length
      };
    },

    donatePathManual(W, manualOrPathId, byNpc, opts) {
      opts = opts || {};
      if (!W || !W.sect) return { ok: false, reason: 'no-world' };
      const raw = String(manualOrPathId || '').trim().toUpperCase();
      const pKey = raw.replace(/^MANUAL_PATH_/, '');
      if (!CULT || !CULT.PATHS || !CULT.PATHS[pKey]) {
        return { ok: false, reason: 'invalid-path', pathId: pKey };
      }
      const itemId = 'MANUAL_PATH_' + pKey;
      if (!opts.free && ECO) {
        if (ECO.count(W, itemId) > 0) {
          ECO.take(W, itemId, 1);
        } else if (byNpc && byNpc.inv && byNpc.inv.mats && byNpc.inv.mats[itemId] > 0) {
          byNpc.inv.mats[itemId]--;
          if (byNpc.inv.mats[itemId] <= 0) delete byNpc.inv.mats[itemId];
        } else {
          return { ok: false, reason: 'missing-manual-item', itemId };
        }
      }
      if (byNpc) byNpc.merit = (byNpc.merit || 0) + 45;
      return this.unlockPath(W, pKey, { source: 'manual_donation', byId: byNpc ? byNpc.id : null, quiet: opts.quiet });
    },

    bestowPathCrystal(W, npcOrId, crystalOrPathId, opts) {
      opts = opts || {};
      if (!W || !W.sect || !CULT || !CULT.MORTAL_INITIATION) return { ok: false, reason: 'no-world' };
      const npc = typeof npcOrId === 'string' ? (W.byId && W.byId[npcOrId]) : npcOrId;
      if (!npc || npc.dead) return { ok: false, reason: 'invalid-npc' };
      const pKey = String(crystalOrPathId || '').replace(/^CRYSTAL_PATH_/, '').trim().toUpperCase();
      const res = CULT.MORTAL_INITIATION.bestowPathCrystal(W, npc, pKey, opts);
      if (res && res.ok) {
        const lib = this.ensure(W);
        lib.crystalBestowals.unshift({
          day: W.day || 1,
          npcId: npc.id,
          npcNameTh: HC.fullName(npc),
          pathId: pKey,
          pathNameTh: CULT.PATHS[pKey] ? CULT.PATHS[pKey].nameTh : pKey
        });
        if (lib.crystalBestowals.length > 40) lib.crystalBestowals.length = 40;
      }
      return res;
    },

    // Patch v2.2.0: Grand Dao Manual Lifecycle Pipeline (Vault -> Library Registration OR Export Surplus Trade)
    processVaultManuals(W, opts) {
      opts = opts || {};
      if (!W || !W.sect || !W.sect.stock) return { registered: [], surplus: [] };
      const lib = this.ensure(W);
      const registered = [];
      const surplus = [];
      const allPaths = this.getAllPathIds();

      for (const pid of allPaths) {
        const manId = 'MANUAL_PATH_' + pid;
        const qty = (g.ECO && g.ECO.count) ? g.ECO.count(W, manId) : (W.sect.stock[manId] || 0);
        if (qty <= 0) continue;

        if (!this.isPathUnlocked(W, pid)) {
          // Case A: Sect Library does NOT have this path yet -> withdraw 1 copy and register permanently!
          if (g.ECO && g.ECO.take) g.ECO.take(W, manId, 1);
          else W.sect.stock[manId] = Math.max(0, (W.sect.stock[manId] || 0) - 1);
          this.unlockPath(W, pid, { source: 'VAULT_LIBRARIAN_REGISTER', quiet: opts.quiet });
          registered.push(manId);
        }
        const remQty = (g.ECO && g.ECO.count) ? g.ECO.count(W, manId) : (W.sect.stock[manId] || 0);
        if (remQty > 0 && this.isPathUnlocked(W, pid)) {
          // Case B: Sect Library ALREADY has this path -> remaining copies in stock are tradable export surplus!
          surplus.push({ itemId: manId, pathId: pid, count: remQty });
        }
      }
      lib.exportSurplusManuals = surplus;
      return { registered, surplus };
    },

    sellSurplusManuals(W, opts) {
      opts = opts || {};
      if (!W || !W.sect || !W.sect.stock) return { soldCount: 0, revenueStones: 0, soldItems: [] };
      const scan = this.processVaultManuals(W, { quiet: true });
      const lib = this.ensure(W);
      let soldCount = 0;
      let revenueStones = 0;
      const soldItems = [];
      const remaining = [];
      const pool = W.world && (W.world.resourcePool || (W.world.resourcePool = { stones: 50000, herbs: 5000, ores: 5000 }));

      for (const sp of (scan.surplus || [])) {
        const available = sp.count || 0;
        const unitPrice = 1020; // 85% of 1200 base price
        const funds = pool && Number.isFinite(pool.stones) ? Math.max(0, pool.stones) : 0;
        const qty = Math.min(available, Math.floor(funds / unitPrice));
        if (qty <= 0) { if (available > 0) remaining.push(sp); continue; }
        if (g.ECO && g.ECO.take && g.ECO.take(W, sp.itemId, qty)) {
          const rev = unitPrice * qty;
          pool.stones -= rev;
          if (g.ECO && g.ECO.earn) g.ECO.earn(W, rev, 'ขายคัมภีร์มหาวิถีซ้ำ (' + sp.itemId + ' ×' + qty + ') ให้คาราวาน');
          else W.sect.stones = (W.sect.stones || 0) + rev;
          soldCount += qty;
          revenueStones += rev;
          soldItems.push({ itemId: sp.itemId, pathId: sp.pathId, qty, revenue: rev });
          if (available > qty) remaining.push(Object.assign({}, sp, { count: available - qty }));
        } else remaining.push(sp);
      }
      lib.surplusManualsSold = (lib.surplusManualsSold || 0) + soldCount;
      lib.surplusRevenueStones = (lib.surplusRevenueStones || 0) + revenueStones;
      lib.exportSurplusManuals = remaining;
      return { soldCount, revenueStones, soldItems };
    },

    getSummary(W) {
      const lib = this.ensure(W);
      const all = this.getAllPathIds();
      const unlocked = lib ? lib.unlockedPaths.slice() : ['XIAN'];
      const locked = all.filter(p => !unlocked.includes(p));
      return {
        starterPath: lib ? lib.starterPath : unlocked[0],
        unlockedCount: unlocked.length,
        totalPaths: all.length,
        unlockedPaths: unlocked,
        lockedPaths: locked,
        donatedManuals: lib ? lib.donatedManuals.slice() : [],
        crystalBestowals: lib ? lib.crystalBestowals.slice() : [],
        surplusManualsSold: lib ? (lib.surplusManualsSold || 0) : 0,
        surplusRevenueStones: lib ? (lib.surplusRevenueStones || 0) : 0
      };
    }
  };

  /* =========================================================================
   * PATCH v2.1.0: B-17 — 17 NEW SECT ARCHETYPES COVERING ALL 27 GRAND DAO PATHS
   * ========================================================================= */
  (function registerGrandDaoSectArchetypes() {
    const newArchSpecs = [
      { id: 'array_sect', path: 'ARRAY_TALISMAN', nameTh: 'สำนักค่ายกลยันต์สวรรค์', titleTh: 'วิถีอักขระค่ายกลฟ้าดิน', wFamily: 'BRUSH', wSkill: 'BRUSH', w1: 'EQ_WPN_BRUSH_T1', w2: 'EQ_WPN_BRUSH_T2' },
      { id: 'strategy_sect', path: 'STRATEGY_GOVERNANCE', nameTh: 'สำนักพิชัยยุทธ์บัญชาทัพ', titleTh: 'วิถีกลยุทธ์ครองใต้หล้า', wFamily: 'FAN', wSkill: 'FAN', w1: 'EQ_V200_WPN_FAN_T1', w2: 'EQ_V200_WPN_FAN_T2' },
      { id: 'astro', path: 'ASTRO_DIVINATION', nameTh: 'สำนักโหราดาราพยากรณ์', titleTh: 'วิถีโหราดวงดาวและชะตาลิขิต', wFamily: 'ASTROLABE', wSkill: 'ASTROLABE', w1: 'EQ_V200_WPN_ASTROLABE_T1', w2: 'EQ_V200_WPN_ASTROLABE_T2' },
      { id: 'buddha', path: 'BUDDHA_DHARMA', nameTh: 'อารามโพธิญาณวัชรธรรม', titleTh: 'วิถีพุทธะโพธิสัตว์และประคำทอง', wFamily: 'ROSARY', wSkill: 'ROSARY', w1: 'EQ_V200_WPN_ROSARY_T1', w2: 'EQ_V200_WPN_ROSARY_T2' },
      { id: 'void_sect', path: 'VOID_SPACE', nameTh: 'สำนักมิติเร้นลับสุญญากาศ', titleTh: 'วิถีรอยแยกมิติและดาราจักร', wFamily: 'SWORD', wSkill: 'SWORD', w1: 'MP_SWORD_1', w2: 'MP_SWORD_2' },
      { id: 'sonic', path: 'SONIC_HARMONY', nameTh: 'สำนักคีตสวรรค์สัททะปราณ', titleTh: 'วิถีพิณสวรรค์และคลื่นเสียงสั่นพ้อง', wFamily: 'ZITHER', wSkill: 'ZITHER', w1: 'EQ_WPN_ZITHER_T1', w2: 'EQ_WPN_ZITHER_T2' },
      { id: 'venom', path: 'VENOM_GU', nameTh: 'หุบเขาเบญจพิษหมื่นกู่', titleTh: 'วิถีพิษกู่บรรพกาลและเข็มสกัดจุด', wFamily: 'NEEDLE', wSkill: 'NEEDLE', w1: 'EQ_V200_WPN_NEEDLE_T1', w2: 'EQ_V200_WPN_NEEDLE_T2' },
      { id: 'shifter', path: 'PRIMORDIAL_SHIFTER', nameTh: 'เผ่าสายเลือดเทพอสูรบรรพกาล', titleTh: 'วิถีแปลงกายอสูรและกรงเล็บผ่าฟ้า', wFamily: 'CLAW', wSkill: 'CLAW', w1: 'EQ_V200_WPN_CLAW_T1', w2: 'EQ_V200_WPN_CLAW_T2' },
      { id: 'weather', path: 'CELESTIAL_WEATHER', nameTh: 'ตำหนักเทวอากาศบัญชาเมฆา', titleTh: 'วิถีพัดโบกสายลมและอัสนีฟ้าดิน', wFamily: 'FAN', wSkill: 'FAN', w1: 'EQ_V200_WPN_FAN_T1', w2: 'EQ_V200_WPN_FAN_T2' },
      { id: 'wandering', path: 'WANDERING_DAO', nameTh: 'สำนักพเนจรหมื่นลี้ไร้พรมแดน', titleTh: 'วิถีทัศนาจรสำรวจแดนลับ', wFamily: 'STAFF', wSkill: 'STAFF', w1: 'MP_STAFF_1', w2: 'MP_STAFF_2' },
      { id: 'merchant', path: 'MERCANTILE_DAO', nameTh: 'สมาคมพาณิชย์ลูกคิดทองคำ', titleTh: 'วิถีพันธสัญญาการค้าและตราชั่งสวรรค์', wFamily: 'ABACUS', wSkill: 'ABACUS', w1: 'EQ_V200_WPN_ABACUS_T1', w2: 'EQ_V200_WPN_ABACUS_T2' },
      { id: 'geomancy', path: 'DRAGON_VEIN_GEOMANCY', nameTh: 'สำนักธรณีชีพจรมังกรปฐพี', titleTh: 'วิถีฮวงจุ้ยขุนเขาและค่ายกลปฐพี', wFamily: 'ASTROLABE', wSkill: 'ASTROLABE', w1: 'EQ_V200_WPN_ASTROLABE_T1', w2: 'EQ_V200_WPN_ASTROLABE_T2' },
      { id: 'gravity', path: 'GRAVITY_DAO', nameTh: 'สำนักเอกภาวะดาราถ่วง', titleTh: 'วิถีแรงโน้มถ่วงและมวลสารหนักหมื่นชั่ง', wFamily: 'BLADE', wSkill: 'BLADE', w1: 'MP_BLADE_1', w2: 'MP_BLADE_2' },
      { id: 'chrono', path: 'CHRONO_EPOCH', nameTh: 'วิหารกาลเวลานิรันดร์', titleTh: 'วิถีทรายกาลเวลาและวัฏจักรยุคสมัย', wFamily: 'ASTROLABE', wSkill: 'ASTROLABE', w1: 'EQ_V200_WPN_ASTROLABE_T1', w2: 'EQ_V200_WPN_ASTROLABE_T2' },
      { id: 'literati', path: 'INK_LITERATI', nameTh: 'สำนักปราชญ์น้ำหมึกราชโองการ', titleTh: 'วิถีพู่กันอักษรสวรรค์สะกดภพ', wFamily: 'BRUSH', wSkill: 'BRUSH', w1: 'EQ_WPN_BRUSH_T1', w2: 'EQ_WPN_BRUSH_T2' },
      { id: 'marionette', path: 'SOUL_PUPPETRY', nameTh: 'สำนักด้ายวิญญาณเชิดหุ่น', titleTh: 'วิถีเชิดหุ่นวิญญาณและไหมชะตา', wFamily: 'NEEDLE', wSkill: 'NEEDLE', w1: 'EQ_V200_WPN_NEEDLE_T1', w2: 'EQ_V200_WPN_NEEDLE_T2' },
      { id: 'chaos', path: 'PRIMORDIAL_CHAOS', nameTh: 'สำนักโกลาหลบรรพกาลหงเหมิง', titleTh: 'วิถีปราณโกลาหลกำเนิดจักรวาล', wFamily: 'CLAW', wSkill: 'CLAW', w1: 'EQ_V200_WPN_CLAW_T1', w2: 'EQ_V200_WPN_CLAW_T2' },
      { id: 'samurai', path: 'SHADOW_SAMURAI', nameTh: 'สำนักดาบซามูไรไร้เงา', titleTh: 'วิถีอิไอไร้ปราณสะบั้นพริบตา', wFamily: 'BLADE', wSkill: 'BLADE', w1: 'MP_BLADE_1', w2: 'MP_BLADE_2' },
      { id: 'nin_shadow', path: 'NINPO_SHADOW', nameTh: 'หมู่บ้านนินจาเร้นเงามายา', titleTh: 'วิถีร่างแยกเงาและอาวุธลับ', wFamily: 'NEEDLE', wSkill: 'NEEDLE', w1: 'EQ_V200_WPN_NEEDLE_T1', w2: 'EQ_V200_WPN_NEEDLE_T2' },
      { id: 'nin_elem', path: 'NINPO_ELEMENTAL', nameTh: 'สำนักนินจาคาถายันต์ระเบิด', titleTh: 'วิถีประสานมุทราและสลับร่างท่อนไม้', wFamily: 'NEEDLE', wSkill: 'NEEDLE', w1: 'EQ_V200_WPN_NEEDLE_T1', w2: 'EQ_V200_WPN_NEEDLE_T2' },
      { id: 'div_summon', path: 'DIVINE_SUMMONER', nameTh: 'มหาวิหารอัญเชิญทวยเทพเบื้องบน', titleTh: 'วิถีเปิดประตูสวรรค์ห้ามหาพิภพ', wFamily: 'ASTROLABE', wSkill: 'ASTROLABE', w1: 'EQ_V200_WPN_ASTROLABE_T1', w2: 'EQ_V200_WPN_ASTROLABE_T2' },
      { id: 'div_possess', path: 'DIVINE_POSSESSION', nameTh: 'ตำหนักร่างทรงอวตารมหาเทพ', titleTh: 'วิถีเทวะสถิตร่างและระบำนาฏราช', wFamily: 'SPEAR', wSkill: 'SPEAR', w1: 'MP_SPEAR_1', w2: 'MP_SPEAR_2' },
      { id: 'div_channel', path: 'DIVINE_CHANNELER', nameTh: 'สำนักศาสตรายืมกฎสวรรค์', titleTh: 'วิถีสายใยเทวะและอสุนีบาตพิพากษา', wFamily: 'SWORD', wSkill: 'SWORD', w1: 'MP_SWORD_1', w2: 'MP_SWORD_2' },
      { id: 'heretic', path: 'VOID_HERETIC_PACT', nameTh: 'ลัทธิพันธสัญญานอกมิติ', titleTh: 'วิถีเสียงกระซิบอวกาศมืดและสังเวยสติ', wFamily: 'FOCUS', wSkill: 'FOCUS', w1: 'MP_FOCUS_1', w2: 'MP_FOCUS_2' },
      { id: 'occult', path: 'OCCULT_MAGE', nameTh: 'สำนักจอมขมังเวทมหาอาคม', titleTh: 'วิถียันต์คงกระพันชาตรีและแรงครู', wFamily: 'ROSARY', wSkill: 'ROSARY', w1: 'EQ_V200_WPN_ROSARY_T1', w2: 'EQ_V200_WPN_ROSARY_T2' },
      { id: 'devourer', path: 'DEVOURING_FLESH', nameTh: 'สำนักกระเพาะหลุมดำกลืนสรีระ', titleTh: 'วิถีกลืนแร่หลอมอวัยวะเร้นลับ', wFamily: 'CLAW', wSkill: 'CLAW', w1: 'EQ_V200_WPN_CLAW_T1', w2: 'EQ_V200_WPN_CLAW_T2' },
      { id: 'nether_grave', path: 'NETHER_GRAVE', nameTh: 'สุสานบรรพชนมารยมโลก', titleTh: 'วิถีเกราะกระดูกและหุ่นซากศพวัชระ', wFamily: 'STAFF', wSkill: 'STAFF', w1: 'MP_STAFF_1', w2: 'MP_STAFF_2' },
      { id: 'ancestral', path: 'ANCESTRAL_RITUAL', nameTh: 'ศาลบรรพชนไขกระดูกมรดก', titleTh: 'วิถีพิธีบวงสรวงและสืบทอดสายเลือด', wFamily: 'STAFF', wSkill: 'STAFF', w1: 'MP_STAFF_1', w2: 'MP_STAFF_2' },
      { id: 'tide', path: 'TIDE_VOYAGER', nameTh: 'กองเรือนาวิกสมุทรเหมันต์', titleTh: 'วิถีเกลียวคลื่นและทวนจ้าวสมุทร', wFamily: 'SPEAR', wSkill: 'SPEAR', w1: 'MP_SPEAR_1', w2: 'MP_SPEAR_2' },
      { id: 'archivist', path: 'LORE_ARCHIVIST', nameTh: 'หออาลักษณ์สารานุกรมสวรรค์', titleTh: 'วิถีถอดรหัสอักขระและคัดลอกวิชา', wFamily: 'BRUSH', wSkill: 'BRUSH', w1: 'EQ_WPN_BRUSH_T1', w2: 'EQ_WPN_BRUSH_T2' },
      { id: 'gambler', path: 'FORTUNE_GAMBLER', nameTh: 'หอเดิมพันชะตาลูกเต๋าหยก', titleTh: 'วิถีเสี่ยงทายพลิกผันวาสนา', wFamily: 'FAN', wSkill: 'FAN', w1: 'EQ_V200_WPN_FAN_T1', w2: 'EQ_V200_WPN_FAN_T2' },
      { id: 'husbandry', path: 'SPIRIT_HUSBANDRY', nameTh: 'หุบเขาเกษตรวิญญาณเสิ่นหนง', titleTh: 'วิถีพฤกษาโอสถและรวงข้าวสวรรค์', wFamily: 'STAFF', wSkill: 'STAFF', w1: 'MP_STAFF_1', w2: 'MP_STAFF_2' },
      { id: 'arena', path: 'ARENA_GLORY', nameTh: 'สังเวียนเกียรติยุทธ์เจ้ายุทธจักร', titleTh: 'วิถีแชมเปี้ยนลานประลองไร้พ่าย', wFamily: 'SPEAR', wSkill: 'SPEAR', w1: 'MP_SPEAR_1', w2: 'MP_SPEAR_2' }
    ];

    const allTechs = (JD && JD.TECH && Array.isArray(JD.TECH.techniques)) ? JD.TECH.techniques : [];
    for (const sp of newArchSpecs) {
      const pDef = (CULT && CULT.PATHS && CULT.PATHS[sp.path]) || (JD && JD.CULT && JD.CULT.paths && JD.CULT.paths[sp.path]);
      if (!pDef) continue;
      const subIds = (pDef.subPaths || []).map(s => s.id);
      const pathTechs = allTechs
        .filter(t => t && t.path === sp.path && !t.innateOnly && !/PASSIVE_GRAND_DAO|INNATE/.test(t.cat || ''))
        .slice(0, 12)
        .map(t => t.id);
      const crystals = {};
      if (subIds[0]) crystals['S:' + subIds[0]] = 2;
      if (subIds[1]) crystals['S:' + subIds[1]] = 1;
      if (subIds[2]) crystals['S:' + subIds[2]] = 1;

      SECT.ARCHETYPES[sp.id] = {
        id: sp.id,
        nameTh: sp.nameTh,
        titleTh: sp.titleTh,
        descTh: pDef.coreMechanicTh || ('สำนักสายตรงแห่ง' + pDef.nameTh),
        path: sp.path,
        subs: subIds,
        techs: pathTechs.concat(['PASS_V212_ADAPTIVE_ARSENAL_T2']),
        crystals
      };
      SECT.ARCHETYPE_WEAPON[sp.id] = {
        family: sp.wFamily,
        skill: sp.wSkill,
        starterWeapon: sp.w1,
        masterWeapon: sp.w2
      };
    }
  })();

  /* =========================================================================
   * PATCH v2.1.0: PILLAR A — INTER-SECT GRAND DAO DEBATE & DISCOURSE
   * (งานชุมนุมวิสัชนาธรรม 27 มหาวิถีและประชันความเข้าใจเต๋าข้ามสำนัก)
   * ========================================================================= */
  SECT.GRAND_DAO_DEBATE = {
    COST_STONES: 120,
    COOLDOWN_DAYS: 15,

    ensure(W) {
      if (!W || !W.sect) return null;
      if (!W.sect.grandDaoDebates || typeof W.sect.grandDaoDebates !== 'object') {
        W.sect.grandDaoDebates = {
          seq: 1,
          lastDebateDay: 0,
          wins: 0,
          losses: 0,
          unlockedManualsFromDebates: [],
          history: []
        };
      }
      return W.sect.grandDaoDebates;
    },

    holdDebate(W, opts) {
      opts = opts || {};
      if (!W || !W.sect) return { ok: false, reason: 'no-world' };
      const st = this.ensure(W);
      const dayNow = W.day || 1;
      if (!opts.force && st.lastDebateDay > 0 && (dayNow - st.lastDebateDay) < this.COOLDOWN_DAYS) {
        return { ok: false, reason: 'debate-on-cooldown', nextAvailableDay: st.lastDebateDay + this.COOLDOWN_DAYS };
      }

      const cost = opts.free ? 0 : this.COST_STONES;
      if (cost > 0) {
        if ((W.sect.stones || 0) < cost) return { ok: false, reason: 'insufficient-stones', required: cost };
        if (g.ECO && g.ECO.pay) g.ECO.pay(W, cost, 'จัดการชุมนุมวิสัชนาธรรม 43 มหาวิถี');
        else W.sect.stones -= cost;
        if (W.world && W.world.resourcePool) {
          W.world.resourcePool.stones = (W.world.resourcePool.stones || 0) + cost;
        }
      }

      const alive = (W.npcs || []).filter(n => n && !n.dead && !n.exiled);
      if (!alive.length) return { ok: false, reason: 'no-disciples' };

      // Pick best debater (or specified speakerId)
      const speaker = (opts.speakerId && W.byId && W.byId[opts.speakerId]) || alive.slice().sort((a, b) => {
        const score = u => {
          const comp = HC.eff(u, 'intellect.comprehension') + ((u.h && u.h.skills && u.h.skills.SCRIPTURE) || 0);
          const stg = (u.cult && u.cult.stage) ? u.cult.stage * 22 : ((u.mortalCult && u.mortalCult.daoComprehension) || 0) * 0.4;
          const traits = (u.cult && CULT.GRAND_DAO_MECHANICS && CULT.GRAND_DAO_MECHANICS.getActiveTraits)
            ? CULT.GRAND_DAO_MECHANICS.getActiveTraits(u).allTraits.length * 15
            : 0;
          return comp + stg + traits;
        };
        return score(b) - score(a);
      })[0];

      const speakerScore = Math.round(
        HC.eff(speaker, 'intellect.comprehension') * 0.8 +
        ((speaker.h && speaker.h.skills && speaker.h.skills.SCRIPTURE) || 15) * 0.9 +
        ((speaker.cult && speaker.cult.stage) || 1) * 24 +
        ((speaker.cult && CULT.GRAND_DAO_MECHANICS) ? CULT.GRAND_DAO_MECHANICS.getActiveTraits(speaker).allTraits.length * 14 : 0)
      );

      const rivalSect = (W.world && Array.isArray(W.world.sects) && W.world.sects.length)
        ? W.world.sects[(dayNow + st.seq) % W.world.sects.length]
        : { id: 'RIVAL_DAO_ACADEMY', name: 'สำนักปราชญ์เทียนจี' };
      const allPaths = Object.keys((CULT && CULT.PATHS) || {});
      const lockedPaths = SECT.PATH_LIBRARY ? SECT.PATH_LIBRARY.getSummary(W).lockedPaths : [];
      const debatePath = opts.targetPath || (lockedPaths.length ? lockedPaths[(dayNow + st.seq) % lockedPaths.length] : allPaths[st.seq % allPaths.length]) || 'XIAN';
      const rivalDifficulty = opts.difficulty || 115;
      const victory = opts.forceWin || speakerScore >= rivalDifficulty;

      st.lastDebateDay = dayNow;
      st.seq++;

      let rewardItemId = null;
      if (victory) {
        st.wins++;
        W.sect.fame = (W.sect.fame || 0) + 12;
        speaker.merit = (speaker.merit || 0) + 25;
        if (speaker.h && speaker.h.skills) {
          speaker.h.skills.SCRIPTURE = Math.min(100, (speaker.h.skills.SCRIPTURE || 0) + 2.5);
        }
        // Boost mortal comprehension across the sect
        for (const m of alive) {
          if (!m.cult && CULT.MORTAL_INITIATION) {
            const mc = CULT.MORTAL_INITIATION.ensureMortalState(m, W);
            mc.daoComprehension = clamp((mc.daoComprehension || 0) + 8, 0, 100);
          }
        }
        // Grant a Path Crystal or Manual if debating a locked path
        if (lockedPaths.includes(debatePath) && g.ECO) {
          if (opts.grantManual || st.wins % 2 === 1) {
            rewardItemId = 'MANUAL_PATH_' + debatePath;
            g.ECO.add(W, rewardItemId, 1);
            st.unlockedManualsFromDebates.push(rewardItemId);
          } else {
            rewardItemId = 'CRYSTAL_PATH_' + debatePath;
            g.ECO.add(W, rewardItemId, 1);
          }
        }
      } else {
        st.losses++;
        if (speaker.h && speaker.h.skills) {
          speaker.h.skills.SCRIPTURE = Math.min(100, (speaker.h.skills.SCRIPTURE || 0) + 1.0);
        }
      }

      const pNameTh = (CULT.PATHS[debatePath] && CULT.PATHS[debatePath].nameTh) || debatePath;
      const rec = {
        id: 'DEBATE_' + dayNow + '_' + st.seq,
        day: dayNow,
        speakerId: speaker.id,
        speakerNameTh: HC.fullName(speaker),
        rivalSectNameTh: rivalSect.name || rivalSect.nameTh || 'สำนักพันธมิตร',
        debatePath,
        debatePathNameTh: pNameTh,
        speakerScore,
        rivalDifficulty,
        victory,
        rewardItemId
      };
      st.history.unshift(rec);
      if (st.history.length > 30) st.history.length = 30;

      if (typeof W.log === 'function' && !opts.quiet) {
        W.log('sect', '📖 งานวิสัชนาธรรมมหาวิถี「' + pNameTh + '」: ' + rec.speakerNameTh + (victory ? ' ชนะการประชันธรรมะ' : ' แลกเปลี่ยนธรรมาภิสมัย') + (rewardItemId ? ' ได้รับ ' + rewardItemId : ''), [speaker.id]);
      }
      return { ok: true, victory, record: rec, rewardItemId };
    },

    monthlyTick(W) {
      if (!W || !W.sect) return null;
      const st = this.ensure(W);
      if ((W.sect.stones || 0) >= 850 && ((W.day || 1) - (st.lastDebateDay || 0)) >= 30) {
        return this.holdDebate(W, { quiet: true });
      }
      return null;
    },

    getSummary(W) {
      const st = this.ensure(W);
      return {
        wins: st ? st.wins : 0,
        losses: st ? st.losses : 0,
        lastDebateDay: st ? st.lastDebateDay : 0,
        historyCount: st && Array.isArray(st.history) ? st.history.length : 0
      };
    }
  };

  /* =========================================================================
   * PATCH v2.2.0: SECT COSMIC SHRINE & HIGHER-REALM CONSECRATION
   * (เทวสถานเชื่อมมิติ 5 มหาพิภพเบื้องบน ถวายเครื่องสักการะจากคลังจริง)
   * ========================================================================= */
  SECT.COSMIC_SHRINE = {
    OFFERING_COST_STONES: 150,

    ensure(W) {
      if (!W || !W.sect) return null;
      if (!W.sect.cosmicShrine || typeof W.sect.cosmicShrine !== 'object') {
        W.sect.cosmicShrine = {
          activeRealmId: 'HEAVENLY_COURT_DAO',
          consecratedLevel: 1,
          faithPoints: 0,
          totalOfferings: 0,
          history: []
        };
      }
      return W.sect.cosmicShrine;
    },

    consecrateOffering(W, realmId, opts) {
      opts = opts || {};
      if (!W || !W.sect) return { ok: false, reason: 'no-world' };
      const sh = this.ensure(W);
      const pantheon = CULT && CULT.HIGHER_REALMS_PANTHEON;
      const rKey = String(realmId || 'HEAVENLY_COURT_DAO').toUpperCase();
      const rDef = pantheon && pantheon.REALMS && pantheon.REALMS[rKey];
      if (!rDef) return { ok: false, reason: 'invalid-higher-realm', realmId: rKey };

      const cost = opts.free ? 0 : this.OFFERING_COST_STONES;
      if (cost > 0) {
        if ((W.sect.stones || 0) < cost) return { ok: false, reason: 'insufficient-stones', required: cost };
        if (g.ECO && g.ECO.pay) g.ECO.pay(W, cost, 'บวงสรวงเทวสถานเชื่อมมิติสู่「' + rDef.nameTh + '」');
        else W.sect.stones -= cost;
        if (W.world && W.world.resourcePool) W.world.resourcePool.stones = (W.world.resourcePool.stones || 0) + cost;
      }

      sh.activeRealmId = rKey;
      sh.faithPoints = (sh.faithPoints || 0) + 35;
      sh.totalOfferings = (sh.totalOfferings || 0) + 1;
      sh.consecratedLevel = Math.min(9, 1 + Math.floor(sh.totalOfferings / 3));

      // Bestow deity pacts on divine-path disciples who lack one
      const deities = rDef.deities || ['PANGU'];
      let pactsFormed = 0;
      for (const n of (W.npcs || [])) {
        if (!n || n.dead || !n.cult) continue;
        if (['DIVINE_SUMMONER', 'DIVINE_POSSESSION', 'DIVINE_CHANNELER', 'GOD', 'ANCESTRAL_RITUAL'].includes(n.cult.path)) {
          const dPick = deities[pactsFormed % deities.length];
          pantheon.formDeityPact(W, n, dPick, { free: true });
          pactsFormed++;
        }
      }

      const rec = {
        day: W.day || 1,
        realmId: rKey,
        realmNameTh: rDef.nameTh,
        faithPoints: sh.faithPoints,
        pactsFormed
      };
      sh.history.unshift(rec);
      if (sh.history.length > 25) sh.history.length = 25;
      return { ok: true, shrine: sh, record: rec };
    }
  };

  /* =========================================================================
   * PATCH v2.4.0: SECT INFERNAL SHRINE & DEMONIC ABYSSAL BLOOD COVENANTS
   * (แท่นบูชามารอเวจี 4 พิภพเบื้องล่าง & พันธสัญญาโลหิต 15 จอมมาร)
   * ========================================================================= */
  SECT.INFERNAL_SHRINE = {
    OFFERING_COST_STONES: 160,

    ensure(W) {
      if (!W || !W.sect) return null;
      if (!W.sect.infernalShrine || typeof W.sect.infernalShrine !== 'object') {
        W.sect.infernalShrine = {
          activePlaneId: 'NINE_SERENITIES_HELL',
          altarLevel: 1,
          infernalFavor: 0,
          bloodTributes: 0,
          activeCovenantLordId: null,
          demonicBacklashRisk: 0,
          history: []
        };
      }
      return W.sect.infernalShrine;
    },

    consecrateInfernalOffering(W, planeId, opts) {
      opts = opts || {};
      if (!W || !W.sect) return { ok: false, reason: 'no-world' };
      const sh = this.ensure(W);
      const demPantheon = CULT && CULT.DEMONIC_PANTHEON;
      const pKey = String(planeId || sh.activePlaneId || 'NINE_SERENITIES_HELL').toUpperCase();
      const pDef = demPantheon && demPantheon.PLANES && demPantheon.PLANES[pKey];
      if (!pDef) return { ok: false, reason: 'invalid-demonic-plane', planeId: pKey };

      const cost = opts.free ? 0 : this.OFFERING_COST_STONES;
      if (cost > 0) {
        if ((W.sect.stones || 0) < cost) return { ok: false, reason: 'insufficient-stones', required: cost };
        if (g.ECO && g.ECO.pay) {
          if (!g.ECO.pay(W, cost, 'สังเวยแท่นบูชามารเชื่อมมิติสู่「' + pDef.nameTh + '」')) {
            return { ok: false, reason: 'insufficient-stones', required: cost };
          }
        } else {
          W.sect.stones -= cost;
        }
        if (W.world && W.world.resourcePool) {
          W.world.resourcePool.stones = (W.world.resourcePool.stones || 0) + cost;
        }
      }

      sh.activePlaneId = pKey;
      sh.infernalFavor = (sh.infernalFavor || 0) + 40;
      sh.bloodTributes = (sh.bloodTributes || 0) + 1;
      sh.altarLevel = Math.min(9, 1 + Math.floor(sh.bloodTributes / 3));
      sh.demonicBacklashRisk = clamp(+((sh.demonicBacklashRisk || 0) + 0.04).toFixed(3), 0, 0.45);

      const lords = pDef.lords || ['MARA_PAPIYAN'];
      let covenantsFormed = 0;
      const isWillingForDemonPact = n => {
        if (!n || n.dead || n.exiled || !n.cult) return false;
        if (n.voluntaryVows && n.voluntaryVows.VOW_ASCETIC_PRECEPT && n.voluntaryVows.VOW_ASCETIC_PRECEPT.active) return false;
        const p = n.h && n.h.personality;
        if (p && (p.integrity || 50) >= 75 && (p.ambition || 50) < 60 && n.cult.path !== 'DEMON') return false;
        return ['DEMON', 'VOID_HERETIC_PACT', 'DEVOURING_FLESH', 'NETHER_GRAVE', 'SOUL_PUPPETRY', 'VENOM_GU'].includes(n.cult.path) || (p && (p.ambition || 50) >= 68 && (p.integrity || 50) <= 42);
      };
      if (demPantheon && typeof demPantheon.formDemonPact === 'function') {
        for (const n of (W.npcs || [])) {
          if (!isWillingForDemonPact(n)) continue;
          const lPick = lords[covenantsFormed % lords.length];
          const pactResult = demPantheon.formDemonPact(W, n, lPick, { free: true });
          if (pactResult && pactResult.ok && !pactResult.unchanged) covenantsFormed++;
        }
      }
      sh.activeCovenantLordId = lords[0] || null;
      if (W && Array.isArray(W.npcs) && g.STATS && g.STATS.dirty) {
        for (const n of W.npcs) if (n && !n.dead) g.STATS.dirty(n);
      }

      const rec = {
        day: W.day || 1,
        planeId: pKey,
        planeNameTh: pDef.nameTh,
        infernalFavor: sh.infernalFavor,
        altarLevel: sh.altarLevel,
        covenantsFormed
      };
      sh.history.unshift(rec);
      if (sh.history.length > 25) sh.history.length = 25;
      return { ok: true, shrine: sh, record: rec };
    },

    offerInfernalTribute(W, planeId, opts) {
      return this.consecrateInfernalOffering(W, planeId, opts);
    },

    signBloodCovenant(W, npcOrId, lordId, opts) {
      opts = Object.assign({}, opts || {});
      const sh = this.ensure(W);
      const demPantheon = CULT && CULT.DEMONIC_PANTHEON;
      if (!demPantheon || typeof demPantheon.formDemonPact !== 'function') {
        return { ok: false, reason: 'no-demonic-pantheon' };
      }
      let spentFavor = false;
      if (!opts.free && sh && (sh.infernalFavor || 0) >= 60) {
        sh.infernalFavor -= 60;
        opts.free = true;
        spentFavor = true;
      }
      const res = demPantheon.formDemonPact(W, npcOrId, lordId, opts);
      if (res && res.ok && !res.unchanged && sh) {
        sh.activeCovenantLordId = res.lordId;
        if (!spentFavor) sh.infernalFavor = (sh.infernalFavor || 0) + 15;
      } else if (spentFavor && sh) {
        sh.infernalFavor += 60;
      }
      return res;
    },

    getShrineBuffs(W) {
      const sh = this.ensure(W);
      if (!sh || !sh.bloodTributes) return { active: false, altarLevel: 1, infernalFavor: 0, atkBonusPct: 0, demonicRateBonus: 0, backlashRisk: 0 };
      const favorBonus = Math.min(0.06, Math.floor((sh.infernalFavor || 0) / 50) * 0.01);
      return {
        active: true,
        activePlaneId: sh.activePlaneId,
        altarLevel: sh.altarLevel,
        infernalFavor: sh.infernalFavor,
        atkBonusPct: +(sh.altarLevel * 0.02 + favorBonus * 0.5).toFixed(3),
        demonicRateBonus: +(sh.altarLevel * 0.03 + favorBonus).toFixed(3),
        backlashRisk: sh.demonicBacklashRisk || 0
      };
    },

    monthlyTick(W) {
      const sh = this.ensure(W);
      if (!sh) return null;
      if (sh.demonicBacklashRisk > 0) {
        if (W && W.rng && W.rng.chance(sh.demonicBacklashRisk) && Array.isArray(W.npcs)) {
          for (const n of W.npcs) {
            if (n && !n.dead && n.demonPact && n.h && n.h.state) {
              n.h.state.heartDemon = clamp((n.h.state.heartDemon || 0) + 8, 0, 100);
            }
          }
        }
        sh.demonicBacklashRisk = Math.max(0, +(sh.demonicBacklashRisk - 0.02).toFixed(3));
      }
      return sh;
    }
  };

  /* ======================= JS2-v2.7.0: GOD Divine Faith Ecology Hooks ======================= */
  const sectDailyPreFaith = SECT.daily;
  SECT.daily = W => {
    const res = sectDailyPreFaith ? sectDailyPreFaith(W) : undefined;
    if (!W || !W.sect || !CULT || !CULT.ensureFaithState) return res;
    const st = CULT.ensureFaithState(W);
    if (!st || st.lastDailyTickDay === (W.day || 0)) return res;
    st.lastDailyTickDay = W.day || 0;

    const repOrFame = W.sect.rep != null ? W.sect.rep : (W.sect.fame || 0);
    const outpostsCount = Object.keys((W.sect.outposts && W.sect.outposts.byNodeId) || {}).length;
    const shrineLvl = (W.map && W.map.byId && W.map.byId.shrine && W.map.byId.shrine.level) || 1;
    const cosmicPts = (W.sect.cosmicShrine && W.sect.cosmicShrine.faithPoints) || 0;
    const distressCount = (W.world && Array.isArray(W.world.vassalDistressCalls))
      ? W.world.vassalDistressCalls.filter(c => c && !c.resolved).length
      : 0;
    const suspicion = W.sect.suspicion || 0;
    const npcs = Array.isArray(W.npcs) ? W.npcs : [];
    const livingGods = npcs.filter(n => n && !n.dead && !n.exiled && n.cult && n.cult.path === 'GOD');
    const avgSin = livingGods.length
      ? livingGods.reduce((s, n) => s + ((n.karmicLedger && n.karmicLedger.sinKarma) || 0), 0) / livingGods.length
      : 0;

    let delta = 0;
    delta += (shrineLvl - 1) * 0.45;
    delta += clamp((repOrFame - 12) / 140, -0.45, 1.8);
    delta += Math.min(1.6, outpostsCount * 0.45);
    if (cosmicPts > 0) delta += Math.min(1.2, cosmicPts / 120);
    if ((st.deedsToday || 0) > 0) delta += Math.min(2.2, st.deedsToday * 0.55);
    else if (livingGods.length > 0 && st.pool > 30) delta -= 0.45;

    delta -= distressCount * 2.2;
    if (avgSin >= 20) delta -= Math.min(2.5, (avgSin - 15) * 0.06);
    if (suspicion >= 40) delta -= 0.8;

    st.deedsToday = 0;
    CULT.updateDivineFaith(W, +delta.toFixed(2), 'daily_ecology');

    if (st.pool < 20) st.lowFaithDays = (st.lowFaithDays || 0) + 1;
    else st.lowFaithDays = 0;
    if (st.pool <= 0) st.zeroFaithDays = (st.zeroFaithDays || 0) + 1;
    else st.zeroFaithDays = 0;

    for (const n of livingGods) {
      const df = CULT.getDivineFaith(W, n);
      n.ext = n.ext || {};
      if (df <= 0) {
        n.ext._faithZeroDays = (n.ext._faithZeroDays || 0) + 1;
        if (n.ext._faithZeroDays >= 3 && n.cult.stage > 1 && n._demotedAtDay !== (W.day || 0)) {
          n.cult.stage -= 1;
          n.cult.prog = 0;
          n.ext._faithZeroDays = 0;
          n._demotedAtDay = W.day || 0;
          n._cultRateBase = null;
          if (g.STATS && g.STATS.dirty) g.STATS.dirty(n);
          const stageNm = CULT.stageName ? CULT.stageName(n) : ('ขั้น ' + n.cult.stage);
          if (W.log) {
            W.log('cultivation', HC.fullName(n) + ' สูญสิ้นแรงศรัทธาจากปวงชนติดต่อกัน จนตบะเทพเสื่อมถอยลงสู่ ' + stageNm, [n.id], {
              severity: 'MAJOR',
              promoteChronicle: true
            });
          }
          if (g.EXPED && g.EXPED.recordChronicle) {
            g.EXPED.recordChronicle(W, {
              category: 'DISASTER',
              reportFormat: 'ANCESTRAL_INSCRIPTION',
              icon: '🕯️',
              titleTh: 'ศรัทธาดับสูญ: ตบะเทพของ ' + HC.fullName(n) + ' เสื่อมถอย',
              storyTh: HC.fullName(n) + ' ขาดแรงศรัทธาหล่อเลี้ยงจนเทวาลัยหมองหม่น ตบะลดลงสู่ ' + stageNm,
              npcIds: [n.id],
              quiet: true
            });
          }
        }
      } else {
        n.ext._faithZeroDays = 0;
      }
    }

    if (SECT.PATH_LIBRARY) {
      if (typeof SECT.PATH_LIBRARY.processVaultManuals === 'function') {
        SECT.PATH_LIBRARY.processVaultManuals(W, { quiet: true });
      }
      // Autonomous elder primer inscription & CRYSTAL_PATH_* bestowal to fitting initiates
      const elderWriter = SECT.holder(W, 'scripture') || W.byId[W.sect.masterId];
      if (elderWriter && !elderWriter.dead && !elderWriter.away && elderWriter.cult && !SECT.PATH_LIBRARY.isPathUnlocked(W, elderWriter.cult.path)) {
        const stg = CULT.effectiveTechStage ? CULT.effectiveTechStage(elderWriter) : (elderWriter.cult.stage || 1);
        if (stg >= 3) {
          SECT.PATH_LIBRARY.unlockPath(W, elderWriter.cult.path, { source: 'elder_inscription', byId: elderWriter.id, byNpc: elderWriter });
        }
      }
      const stock = W.sect.stock || {};
      const pathCrystalKeys = Object.keys(stock).filter(k => k.startsWith('CRYSTAL_PATH_') && stock[k] > 0);
      if (pathCrystalKeys.length && SECT.PATH_LIBRARY.bestowPathCrystal) {
        const mentor = SECT.isOfficerAvailable(W, elderWriter) ? elderWriter : W.npcs.find(u => u && !u.dead && !u.away && u.rank >= 4);
        if (mentor) {
          const candidates = npcs.filter(u => u && !u.dead && !u.away && !u.exiled && !u.cult && !(u.mortalCult && u.mortalCult.enlightenedByCrystal));
          for (const ck of pathCrystalKeys) {
            if (!candidates.length) break;
            const pKey = ck.replace(/^CRYSTAL_PATH_/, '');
            if (!CULT.PATHS[pKey]) continue;
            let bestCand = null, bestSc = -1e9;
            for (const cand of candidates) {
              const rows = CULT.majorPathScores ? CULT.majorPathScores(cand) : [];
              const row = rows.find(r => r.path === pKey);
              const sc = (row ? row.score : 50) + (cand.mortalCult && cand.mortalCult.targetPath === pKey ? 8 : 0);
              if (sc > bestSc) { bestSc = sc; bestCand = cand; }
            }
            if (bestCand && bestSc >= 45) {
              const bRes = SECT.PATH_LIBRARY.bestowPathCrystal(W, bestCand, pKey, { quiet: false });
              if (bRes && bRes.ok) {
                const idx = candidates.indexOf(bestCand);
                if (idx >= 0) candidates.splice(idx, 1);
              }
            }
          }
        }
      }
    }
    return res;
  };

  if (SECT.COSMIC_SHRINE && typeof SECT.COSMIC_SHRINE.consecrateOffering === 'function') {
    const preConsecrate = SECT.COSMIC_SHRINE.consecrateOffering;
    SECT.COSMIC_SHRINE.consecrateOffering = function (W, actor, deityId, riteId, opts) {
      const res = preConsecrate.call(this, W, actor, deityId, riteId, opts);
      if (res && res.ok && W && CULT && CULT.updateDivineFaith) {
        CULT.updateDivineFaith(W, 5, 'cosmic_shrine_offering', actor ? { npc: actor } : undefined);
      }
      return res;
    };
  }

  if (typeof SECT.prayAtAncestralShrine === 'function') {
    const prePrayShrine = SECT.prayAtAncestralShrine;
    SECT.prayAtAncestralShrine = (W, n, tabletId) => {
      const res = prePrayShrine(W, n, tabletId);
      if (W && CULT && CULT.updateDivineFaith && n && !n.dead) {
        const isGod = n.cult && n.cult.path === 'GOD';
        CULT.updateDivineFaith(W, isGod ? 2.5 : 0.8, 'ancestral_prayer', isGod ? { npc: n } : undefined);
      }
      return res;
    };
  }

  g.SECT = SECT;
  if (typeof module === 'object' && module.exports) module.exports = SECT;
})(typeof globalThis !== 'undefined' ? globalThis : this);
