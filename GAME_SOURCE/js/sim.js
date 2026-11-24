/* sim.js — แกนกลางของโลก: สร้างโลก, นาฬิกา/ปฏิทิน, วงจรจำลอง (1 tick = 1 นาทีเกม), บันทึก/โหลด
 * ทุกระบบอ่าน-เขียนสถานะผ่านวัตถุ W เดียว (single source of truth) */
(function (g) {
  'use strict';
  const U = g.U || require('./util.js'), HC = g.HC, MAP = g.MAP, CULT = g.CULT, ECO = g.ECO, SECT = g.SECT, AI = g.AI, COMBAT = g.COMBAT, EXPED = g.EXPED, JD = g.JD;
  const clamp = U.clamp;
  const SIM = {
    VERSION: '1.10.11',
    PATCH_VERSION: '3.9.6',
    SUPPORTED_PATCHES: ['3.9.5', '3.9.4', '3.9.3', '3.9.2', '3.9.1', '3.9.0', '3.0.0', '3.1.0', '3.1.1', '3.2.0', '3.3.0', '3.4.0', '3.5.0a', '3.5.0b', '3.5.0c', '3.5.0', '3.6.0a', '3.6.0b', '3.6.0c', '3.7.0', '3.7.0a', '3.7.0b', '3.7.0c', '3.8.0', '3.8.1', '3.8.2', '3.8.3', '3.8.4', '3.8.5', '3.6.0', '4.0.0', '4.1.0', '5.0.0', '5.1.0', '5.2.0', '5.3.0', '5.4.0', '5.5.0', '5.6.0', '5.7.0', '5.8.0', '2.0.0', '2.1.0', '2.2.0', '2.3.0', '2.4.0', '2.5.0', '2.6.0'],
    SAVE_SCHEMA_VERSION: '3.9.6-deep-gameplay-integration',
    DAY_FACTOR: 1.5,
    CALENDAR_MINS_PER_DAY: 1440,
    WORK_STEPS_PER_DAY: 2160,
    MIN_PER_YEAR: 360 * 1440,
    TRANSIENT_CACHE_KEYS: new Set(['_c', '_d', '_cs', '_csBase', '_csStatic', '_cultRateBase', '_nd', '_hpMaxCache', '_qiMaxCache', '_mDer', '_condCache', '_wsBase', '_qgUnlockCache', '_qgTickCache', '_hasActiveDefSupportAura', '_skRateCache', '_dwVer', '_dwDay', '_alivePop', 'jianghuSects', 'inventoryIntelligence', 'castFx', 'fx', 'lastTranscendentCutIn', 'lastEquipProcVfx', 'lastActionVfx', 'lastRelicProcVfx', 'lastComboVfx', 'lastCounterVfx', 'lastParryVfx', 'lastDodgeVfx', 'lastCritVfx', 'lastHealVfx', 'lastShieldVfx', 'lastSummonVfx', 'lastFormationVfx', 'lastDomainVfx', 'lastBreakthroughVfx', 'lastTribulationVfx', 'lastAuraPulseVfx', 'lastWeaponMotionVfx', 'lastMantraVfx'])
  };
  const E = (n, p) => HC.eff(n, p);


  /* ---------- Patch v2.0.21: Mega Wuxia/Xianxia Name & Surname Pool Expansion (125 Surnames + 260 Given Names) ---------- */
  const EXTRA_FAMILY_SURNAMES = [
    // แซ่คู่โบราณ (Ancient Compound Surnames)
    'ตงฟาง', 'มู่หรง', 'ซ่างกวน', 'โอวหยาง', 'ซือหม่า', 'ซือถู', 'ซือคง', 'จูกัด', 'หนานกง', 'เป่ยถัง',
    'ซีเหมิน', 'เซี่ยโหว', 'กงซุน', 'หวงฝู่', 'ต้วนมู่', 'ตูกู', 'เฮ่อเหลียน', 'เหวินเหริน', 'จงหลี', 'อวี้เหวิน',
    'ฉางซุน', 'ไป๋หลี่', 'ตงกัว', 'หนานเหมิน', 'หลิงหู', 'ชิวชู่', 'เจ๋อเย่', 'ฮั่นหยาง', 'อวิ๋นกู่', 'เทียนสุ่ย',
    // แซ่เดี่ยวยุทธภพเพิ่มเติม (Expanded Wuxia Single Surnames)
    'กู้', 'เย่', 'เฟิง', 'หลง', 'จ้าว', 'หวง', 'สวี', 'หม่า', 'หู', 'กัว',
    'เหอ', 'เจิ้ง', 'ซ่ง', 'ถาน', 'เติ้ง', 'สวี่', 'ฝู', 'เผิง', 'เจียง', 'ไช่',
    'พาน', 'ไต้', 'เถา', 'ชี', 'หยวน', 'หลาน', 'โม่', 'ซาง', 'ชิว', 'จี้',
    'ลั่ว', 'ฮัว', 'หลิว', 'จิน', 'คัง', 'เหยา', 'สยง', 'เมิ่ง', 'ฉาง', 'เนี่ย',
    'เยียน', 'อวิ๋น', 'เหลย', 'ซู่', 'หง', 'เหวิน', 'จวง', 'เยว่', 'ฟ่าน', 'กง',
    'เฉิง', 'สิง', 'เผย', 'หรง', 'เซี่ยง'
  ];
  const EXPANDED_GIVEN_M = [
    'เทียนหยา', 'เจี้ยนซิน', 'อู๋จี๋', 'ชิงอวิ๋น', 'เสวียนหมิง', 'ฮ่าวหราน', 'เจิ้นเทียน', 'ปู้ไป่', 'หลิงเซียว', 'จื่อหาน',
    'เฟยหลง', 'ฉางชิง', 'เย่ไป๋', 'หานซาน', 'จิ่งเทียน', 'อี้เฉิน', 'โม่โฉว', 'ชางไห่', 'ซิงเหอ', 'อวิ๋นฟาน',
    'เจี้ยนเฉิน', 'หลงหยวน', 'เสวียนอู่', 'ชิงเฟิง', 'ไป๋อวิ๋น', 'จื่อหยาง', 'เทียนหลง', 'หานเฟิง', 'อู๋ซวง', 'จิ่วเซียว',
    'เมิ่งเฉิน', 'ฉู่เหอ', 'เย่หลาน', 'หลิงเฟิง', 'เจ๋อหยวน', 'อวี้เหิง', 'ชิงซาน', 'เฟิงเหลย', 'เสวียนเย่', 'ไท่ชู',
    'วั่งซู', 'จิ่งหาน', 'เฉิงเฟิง', 'ซือหยวน', 'รั่วเฉิน', 'ป๋อเหวิน', 'จวินหาว', 'อี้หมิง', 'หงอวิ๋น', 'เจี้ยนหนาน',
    'ชิงหลง', 'ไป๋หู่', 'จูเชวี่ย', 'เทียนซู', 'เหยียนเจ๋อ', 'กู้เฉิน', 'ลั่วชวน', 'ซูหมิง', 'หานโจว', 'อวิ๋นเซียว',
    'ตงเฉิน', 'ซีเย่', 'หนานเฟิง', 'เป่ยเฉิน', 'จงหยวน', 'ฉางอัน', 'ไห่ชวน', 'ซานเหอ', 'เทียนอี้', 'เต้าเสวียน',
    'ชิงซวี', 'อู๋เหิน', 'พั่วจวิน', 'ชีซา', 'ทานหลาง', 'จื่อเว่ย', 'เทียนฝู่', 'ไท่หยาง', 'ไท่อิน', 'อู๋เชวีย',
    'เจี้ยนอู่', 'ตาวหาน', 'เฉียงเฟิง', 'ฉินหมิง', 'ฉีหยวน', 'ซูหาน', 'ฮว่าอวิ๋น', 'หลิงซู', 'เป่ยหมิง', 'หนานหมิง',
    'จิ่วโยว', 'ชิงเหลียน', 'จินเผิง', 'อิ๋นเจียว', 'ยวี่หลง', 'อัสนี', 'เมฆา', 'วายุ', 'พิรุณ', 'ดารา'
  ];
  const EXPANDED_GIVEN_F = [
    'ชิงเสวี่ย', 'รั่วสุ่ย', 'หว่านเอ๋อร์', 'จื่อเยียน', 'อวิ๋นซี', 'หลิงหลง', 'ชิงเหลียน', 'เยว่ซิน', 'ซู่อี้', 'ไป๋ลู่',
    'เสี่ยวหาน', 'ชิงชิง', 'เหมยเซียน', 'อวี้เหยา', 'เฟยเยียน', 'หนิงซวง', 'รั่วหลาน', 'ซินอี๋', 'เมิ่งเหยา', 'ฉู่ฉู่',
    'เสวี่ยฉี', 'ปี้เหยา', 'ลู่เสวี่ย', 'หว่านชิง', 'จื่อรั่ว', 'เสี่ยวอวี้', 'ชิงเหยา', 'อวิ๋นเมิ่ง', 'เยว่ฉาน', 'ซิงหลาน',
    'ฮว่านซา', 'หนิงเซียง', 'ไป๋เสวี่ย', 'หงอวี้', 'ชิงซวง', 'หลิงเอ๋อร์', 'เยียนหราน', 'ซูซิน', 'จิ่นซี', 'อวี้หลาน',
    'ฟางเซียน', 'เหม่ยหลิน', 'ชิงอวี้', 'เสวี่ยเหลียน', 'เยว่หาน', 'หลานซิน', 'ฉีเอ๋อร์', 'เหยาเซียน', 'หนิงอวี้', 'ซูเหยา',
    'ชิงเกอ', 'อวิ๋นซู', 'เฟยเสวี่ย', 'รั่วซี', 'จื่อหลาน', 'หลิงซวง', 'ซินเยว่', 'เหมยหรู', 'เสวี่ยอิ๋ง', 'หานเยว่',
    'ชิงหลัว', 'อวี้ซวง', 'ไป๋เหลียน', 'หงเหลียน', 'จื่อเซียว', 'ชิงเฟิ่ง', 'หงเฟิ่ง', 'หลวนเอ๋อร์', 'หนี่ชาง', 'อวิ๋นชาง',
    'เยว่หยิง', 'ซิงเยว่', 'หมิงจู', 'รั่วอวิ๋น', 'ชิงซี', 'หลิงอวี้', 'ซูหว่าน', 'เจียวเอ๋อร์', 'หานซวง', 'เหมยอวี้',
    'เสวี่ยเอ๋อร์', 'ชิงหลาน', 'อวิ๋นเหยา', 'จื่อซิน', 'รั่วเสวี่ย', 'เฟยฮวา', 'หลานเยว่', 'ซินหรู', 'อวี้ถิง', 'ชิงเหมย',
    'บุปผาหยก', 'หิมะแรก', 'จันทร์กระจ่าง', 'สายหมอก', 'บัวสวรรค์', 'หยกขาว', 'ดาราพราย', 'วสันต์หยก', 'พิรุณโปรย', 'เมฆาขาว'
  ];
  if (HC && Array.isArray(HC.NAME_FAMILY)) {
    EXTRA_FAMILY_SURNAMES.forEach(s => {
      if (!HC.NAME_FAMILY.includes(s)) HC.NAME_FAMILY.push(s);
    });
  }
  SIM.NAME_POOLS = Object.freeze({
    FAMILY: (HC && Array.isArray(HC.NAME_FAMILY)) ? HC.NAME_FAMILY : EXTRA_FAMILY_SURNAMES,
    GIVEN_M: EXPANDED_GIVEN_M,
    GIVEN_F: EXPANDED_GIVEN_F
  });

  const SEASON_TH = ['ฤดูใบไม้ผลิ', 'ฤดูร้อน', 'ฤดูใบไม้ร่วง', 'ฤดูหนาว'];
  const MONTH_NAMES_TH = Object.freeze([
    'เดือนอ้ายวสันต์', 'เดือนยี่บุปผา', 'เดือนสามวสันต์ปลาย',
    'เดือนสี่คิมหันต์แรก', 'เดือนห้าสุริยัน', 'เดือนหกพิรุณร้อน',
    'เดือนเจ็ดสารทแรก', 'เดือนแปดใบไม้ร่วง', 'เดือนเก้าสารทปลาย',
    'เดือนสิบเหมันต์แรก', 'เดือนสิบเอ็ดน้ำค้างแข็ง', 'เดือนสิบสองเหมันต์ลึก'
  ]);
  SIM.SEASON_TH = SEASON_TH;
  SIM.CALENDAR = Object.freeze({
    ERA_CODE_TH: 'ศ.ท.',
    ERA_NAME_TH: 'ศักราชหลังเทียนกู่ล่มสลาย (Post-Tiangu Era)',
    PREHISTORY_CODE_TH: 'ก่อน ศ.ท.',
    PREHISTORY_NAME_TH: 'มหายุคก่อนประวัติศาสตร์ (ก่อนมหาจักรวรรดิเทียนกู่ล่มสลาย)',
    EPOCH_ZERO_EVENT_TH: 'คืนประตูมิติหลวงแตกและวันล่มสลายของมหาจักรวรรดิเทียนกู่ (ยุคที่ 0 ปีที่ 0)',
    YEARS_PER_EPOCH: 1000,
    START_EPOCH: 101,
    START_YEAR_IN_EPOCH: 1,
    START_WORLD_YEAR: 100001,
    START_DAY_OFFSET: 360,
    DAYS_PER_MONTH: 30,
    MONTHS_PER_YEAR: 12,
    DAYS_PER_YEAR: 360,
    MONTH_NAMES_TH,
    SEASON_NAMES_TH: Object.freeze(SEASON_TH.slice())
  });
  SIM.splitWorldYear = y => {
    const n = Math.trunc(Number(y) || 0);
    if (n <= 0) return { worldYear: n, isPrehistory: n < 0, epoch: 0, yearInEpoch: n };
    const ype = SIM.CALENDAR.YEARS_PER_EPOCH;
    return {
      worldYear: n,
      isPrehistory: false,
      epoch: Math.floor((n - 1) / ype) + 1,
      yearInEpoch: ((n - 1) % ype) + 1
    };
  };
  SIM.worldYearFromEpoch = (epoch, yearInEpoch) => {
    const ep = Math.trunc(Number(epoch) || 1);
    const yr = Math.trunc(Number(yearInEpoch) || 1);
    return (ep - 1) * SIM.CALENDAR.YEARS_PER_EPOCH + yr;
  };
  SIM.formatWorldYear = (y, compact) => {
    const n = Math.trunc(Number(y) || 0);
    if (n === 0) return compact ? 'ยุค 0 ปี 0' : 'ยุคที่ 0 ปีที่ 0 (คืนประตูมิติหลวงแตก)';
    if (n < 0) return compact ? ('ก่อนยุค ' + Math.abs(n) + ' ปี') : ('มหายุคก่อนประวัติศาสตร์ (ก่อน ศ.ท. ' + Math.abs(n).toLocaleString('en-US') + ' ปี)');
    const p = SIM.splitWorldYear(n);
    return compact ? ('ยุค ' + p.epoch + ' ปี ' + p.yearInEpoch) : ('ยุคที่ ' + p.epoch + ' ปีที่ ' + p.yearInEpoch);
  };
  SIM.worldYearFromYearsAgo = (yearsAgo, refYear) => (refYear != null ? refYear : SIM.CALENDAR.START_WORLD_YEAR) - Math.trunc(Number(yearsAgo) || 0);
  SIM.yearsAgoFromWorldYear = (worldYear, refYear) => (refYear != null ? refYear : SIM.CALENDAR.START_WORLD_YEAR) - Math.trunc(Number(worldYear) || 0);
  SIM.calendar = t => {
    const day = Math.floor(t / 1440);
    const elapsedDay = Math.max(0, day - (SIM.CALENDAR.START_DAY_OFFSET || 0));
    const yd = ((elapsedDay % 360) + 360) % 360;
    const year = Math.floor(elapsedDay / 360) + 1;
    const month = Math.floor(yd / 30) + 1;
    const dom = (yd % 30) + 1;
    const season = Math.floor(yd / 90);
    const hour = Math.floor((t % 1440) / 60);
    const minute = t % 60;
    const worldYear = (SIM.CALENDAR.START_WORLD_YEAR - 1) + year;
    const ep = SIM.splitWorldYear(worldYear);
    const monthNameTh = MONTH_NAMES_TH[month - 1] || ('เดือน ' + month);
    return {
      day, year, sectYear: year, worldYear, epoch: ep.epoch, yearInEpoch: ep.yearInEpoch,
      eraCodeTh: SIM.CALENDAR.ERA_CODE_TH,
      month, monthNameTh, dom, season, seasonNameTh: SEASON_TH[season], hour, minute
    };
  };
  SIM.dateText = t => {
    const c = SIM.calendar(t);
    return 'ยุคที่ ' + c.epoch + ' ปีที่ ' + c.yearInEpoch + ' เดือน ' + c.month + ' (' + c.monthNameTh + ') วันที่ ' + c.dom + ' · ' + U.pad2(c.hour) + ':' + U.pad2(c.minute) + ' · ' + SEASON_TH[c.season];
  };

  /* ---------- สร้างตัวละคร ---------- */
  SIM.buildNpc = (W, rng, o) => {
    if (CULT.EXPERIENCE_TRAITS.installSystemHooks) CULT.EXPERIENCE_TRAITS.installSystemHooks();
    HC.nowDay = W.day;
    const npc = HC.generate(rng, { id: o.id, day: W.day, sex: o.sex, ageYears: o.ageYears, quality: o.quality || 0, archetype: o.archetype, rootGrade: o.rootGrade, _fromTierRoll: !!o._fromTierRoll, skillExp: o.skillExp, trainedness: o.trainedness, traitCount: o.traitCount, customRoots: o.customRoots, forceRootCount: o.forceRootCount, forceElements: o.forceElements, forceGrades: o.forceGrades });
    if (CULT && CULT.EXPERIENCE_TRAITS && CULT.EXPERIENCE_TRAITS.stripBirthIneligibleTraits) {
      CULT.EXPERIENCE_TRAITS.stripBirthIneligibleTraits(npc);
    }
    if (npc && npc.h && npc.h.name && npc.h.genome) {
      const gm = Math.abs(npc.h.genome | 0);
      if ((gm % 3) !== 0) {
        const gPool = npc.h.sex === 'F' ? EXPANDED_GIVEN_F : EXPANDED_GIVEN_M;
        npc.h.name.given = gPool[gm % gPool.length];
      }
    }
    if (g.MARTIAL && g.MARTIAL.ensureSkills) g.MARTIAL.ensureSkills(npc, rng);
    if (g.ELEM && g.ELEM.ensureNpcElementalState) g.ELEM.ensureNpcElementalState(npc);
    Object.assign(npc, { x: 0, y: 0, px: 0, py: 0, face: 1, dir: 0, rank: o.rank || 0, post: null, assist: null, merit: o.merit || 0, sat: 60, mentor: null, bed: null, joinDay: W.day - (o.tenure || 0), inv: { stones: Math.round(20 + (o.rank || 0) * 40 * (0.5 + rng.next())), pills: {}, mats: {}, crystals: {}, subManuals: [], gear: [] }, equip: {}, inj: [], cool: {}, recent: [], act: { id: 'idle', stage: 'do', left: 0, total: 0, ctx: {}, why: [] }, path: null, pi: 0, hidden: false, away: false, dead: false, stats: {}, why: [], travel: null });

    // Archetype founding alignment for weapon skill & starter weapon
    if (o.archetypeKey && g.SECT && g.SECT.ARCHETYPE_WEAPON) {
      const wInfo = g.SECT.ARCHETYPE_WEAPON[o.archetypeKey];
      if (wInfo) {
        if (o.isFounderMaster || o.founderIndex === 0) {
          npc.h.skills[wInfo.skill] = Math.max(npc.h.skills[wInfo.skill] || 0, 70);
          const wItem = g.ECO && (g.ECO.itemById[wInfo.masterWeapon] || g.ECO.itemById[wInfo.starterWeapon]);
          if (wItem) npc.equip.WEAPON = g.ECO.mintGear(W, wItem, 1.15);
        } else if (!o.isFounderMaster && o.founderIndex != null && o.founderIndex > 0) {
          npc.h.skills[wInfo.skill] = Math.max(npc.h.skills[wInfo.skill] || 0, 35);
          const wItem = g.ECO && g.ECO.itemById[wInfo.starterWeapon];
          if (wItem) npc.equip.WEAPON = g.ECO.mintGear(W, wItem, 1.0);
        }
      }
    }

    if (typeof o.stage === 'function' || o.stage > 0) SIM.awaken(W, rng, npc, o.stage, o);
    else if (o.stage == null && o.awakenChance != null) { if (rng.chance(o.awakenChance)) SIM.awaken(W, rng, npc, 1, o); }
    if (!npc.cult && CULT && CULT.MORTAL_INITIATION) {
      CULT.MORTAL_INITIATION.ensureMortalState(npc, W);
    }
    npc.h.state.hp = CULT.hpMax(npc);
    npc.h.state.qi = CULT.qiMax(npc);
    CULT.EXPERIENCE_TRAITS.ensureState(npc);
    if(g.COMBAT && g.COMBAT.ACTION_MASTERY_TRAITS)g.COMBAT.ACTION_MASTERY_TRAITS.ensureHistory(npc);
    return npc;
  };
  SIM.awaken = (W, rng, npc, stage, o) => {
    o = o || {};
    const archKey = o.archetypeKey;
    const archDef = archKey && g.SECT && g.SECT.ARCHETYPES && g.SECT.ARCHETYPES[archKey];

    if (archDef && o.archetypeKey && W._founding !== false) {
      if (g.ELEM && g.ELEM.ensureNpc) g.ELEM.ensureNpc(npc);
      const primaryPath = archDef.path || 'XIAN';
      const samePathSubs = (archDef.subs || []).filter(sid => {
        const se = g.CULT && g.CULT.subList && g.CULT.subList.find(x => x.sub.id === sid);
        return se && se.path === primaryPath;
      });
      const fallbackPathSubs = (g.CULT && g.CULT.PATHS && g.CULT.PATHS[primaryPath] && Array.isArray(g.CULT.PATHS[primaryPath].subPaths))
        ? g.CULT.PATHS[primaryPath].subPaths.map(s => s.id)
        : archDef.subs;
      const validPool = samePathSubs.length ? samePathSubs : fallbackPathSubs;
      const scoreRows = (g.CULT && g.CULT.pathScores) ? g.CULT.pathScores(npc).filter(r => r.path === primaryPath && validPool.includes(r.sub)) : [];
      let chosenSub = validPool[0];
      if (scoreRows.length) {
        if (o.founderIndex === 0) {
          chosenSub = scoreRows[0].sub;
        } else {
          const topBand = scoreRows.slice(0, Math.min(3, scoreRows.length));
          const picked = (rng && rng.weighted) ? rng.weighted(topBand, r => Math.exp(Math.max(-20, (r.score - topBand[0].score) / 6))) : topBand[0];
          chosenSub = (picked && picked.sub) || topBand[0].sub;
        }
      } else {
        const subIdx = (o.founderIndex != null ? o.founderIndex : 0) % validPool.length;
        chosenSub = validPool[subIdx] || validPool[0];
      }
      const memberPath = primaryPath;
      const mant = CULT.bestMantra(memberPath, 1, npc);
      npc.cult = { path: memberPath, sub: chosenSub, stage: 1, prog: 0, mantra: mant ? mant.id : null, techs: [], learning: null, toxic: 0, lifeBonus: 0, since: W.day, attempts: 0, secl: null, rate: 0, pillT: 0 };
      if (CULT.trackDef(chosenSub)) npc.cult.track = CULT.initTrack(chosenSub, 1, W.day);
      if (g.ELEM && g.ELEM.syncSpecialAccess) g.ELEM.syncSpecialAccess(npc);
      CULT.refreshLifespan(npc);
      HC.bump(npc);
    } else {
      const chosen = CULT.awaken(npc, rng, null, W.day, W);
      if (W._founding !== false) { npc.cult.sub = chosen.sub; if (CULT.trackDef(chosen.sub)) npc.cult.track = CULT.initTrack(chosen.sub, 1, W.day); }
    }

    const c = npc.cult;
    if (typeof stage === 'function') stage = stage(c.path);
    c.stage = Math.min(stage, CULT.maxStage(npc));
    c.prog = Math.round(CULT.threshold(npc) * (0.1 + rng.next() * 0.6));
    const m = CULT.bestMantra(c.path, c.stage, npc);
    if (m) c.mantra = m.id;

    const lib = JD.TECH.techniques.filter(t => !t.sourcePack && !t.martialRare && !t.overhaulPack && !t.innateOnly && !t.v230).map(t => t.id);
    let cand = [];
    if (archDef && o.archetypeKey && W._founding !== false && Array.isArray(archDef.techs) && archDef.techs.length) {
      cand = archDef.techs.map(CULT.tech).filter(t => {
        if (!t) return false;
        if (t.martialRare || t.v212Pack) return false;
        if (t.path !== 'ANY' && t.path !== c.path) return false;
        const subOk = CULT.isSubCompatible ? CULT.isSubCompatible(t, c.sub, false) : (!t.sub || t.sub === c.sub);
        if (!subOk) return false;
        if (t.innateOnly && t.sub !== c.sub) return false;
        return (t.reqTier || t.tier) <= c.stage;
      });
    }
    if (!cand.length) {
      cand = CULT.learnable(npc, lib, { strictPrimarySub: !!W._founding }).map(CULT.tech).filter(t => (t.reqTier || t.tier) <= c.stage);
    }
    const want = Math.min(CULT.maxTechs(npc) - 1, c.stage);
    for (let i = 0; i < want && cand.length; i++) {
      const t = rng.weighted(cand, x => 1 + x.power / 60 + (x.sub === c.sub ? 2 : 0));
      c.techs.push(t.id);
      cand.splice(cand.indexOf(t), 1);
    }
    if (g.MARTIAL && g.MARTIAL.reconcileInnate) g.MARTIAL.reconcileInnate(npc, W);
    if (g.MARTIAL && g.MARTIAL.reconcilePassives) g.MARTIAL.reconcilePassives(npc);
    if (g.ELEM && g.ELEM.syncSpecialAccess) g.ELEM.syncSpecialAccess(npc);
    CULT.refreshLifespan(npc);
  };
  SIM.placeNear = (W, n, cx, cy, r) => {
    for (let i = 0; i < 20; i++) { const f = MAP.nearestFree(W.map, cx + (W.rng.next() - 0.5) * 2 * r, cy + (W.rng.next() - 0.5) * 2 * r); if (f) { n.x = f.x + .5; n.y = f.y + .5; n.px = n.x; n.py = n.y; return; } }
    n.x = cx + .5; n.y = cy + .5; n.px = n.x; n.py = n.y;
  };
  SIM.CANDIDATE_COUNT = 3;
  SIM.masterOpts = (seed, i, archKey) => {
    const r = new U.RNG(String(seed) + ':master:' + i);
    const arch = archKey && g.SECT && g.SECT.ARCHETYPES && g.SECT.ARCHETYPES[archKey];
    const archPath = arch ? arch.path : 'XIAN';
    const opts = {
      id: 'n_master',
      sex: r.chance(0.7) ? 'M' : 'F',
      ageYears: r.int(44, 62),
      quality: 1.1,
      skillExp: 0.95,
      trainedness: 0.9,
      traitCount: 2,
      rank: 6,
      stage: path => ((path || archPath) === 'BODY' || (path || archPath) === 'GOD') ? 2 : 3,
      tenure: 4000,
      merit: 500
    };
    if (archKey) {
      opts.archetypeKey = archKey;
      opts.isFounder = true;
      opts.isFounderMaster = true;
      opts.founderIndex = Number.isInteger(i) ? i : 0;
    }
    return { r, o: opts };
  };
  /** ผู้สมัครตำแหน่งเจ้าสำนัก 3 คน — ให้ผู้เล่นเลือกก่อนเริ่ม (นิสัยต่างกัน → สำนักต่างกัน) */
  SIM.candidates = (seed, archKey) => {
    archKey = archKey || 'sword';
    const W = { day: 360, _founding: true };
    const out = [];
    for (let i = 0; i < SIM.CANDIDATE_COUNT; i++) {
      const { r, o } = SIM.masterOpts(seed, i, archKey);
      const npc = SIM.buildNpc(W, r, o);
      HC.nowDay = W.day;
      const st = SECT.styleOf(npc);
      out.push({ idx: i, npc, name: HC.fullName(npc), identity: HC.identity(npc), style: st, path: npc.cult.path + '/' + npc.cult.sub, age: HC.ageText(npc) });
    }
    return out;
  };

  /* ---------- สร้างโลก ---------- */
  SIM.create = (seed, opts) => {
    if (g.CULT && g.CULT.EXPERIENCE_TRAITS.installSystemHooks) g.CULT.EXPERIENCE_TRAITS.installSystemHooks();
    opts = opts || {};
    if (ECO && ECO.resetDynamicItems) ECO.resetDynamicItems();
    const rng = new U.RNG(String(seed) + ':world');
    const W = { _founding: true, workSteps: 0, timePhase: 0, v: SIM.VERSION, seed: String(seed), rng, t: 360 + 360 * 1440, speed: 1, npcs: [], byId: {}, logs: [], logSeq: 0, seqN: 0, fights: [], foes: [], foeById: {}, duelQueue: [], graveyard: [], gone: [], deaths: 0, avgSat: 60, avgMood: 10, weather: { kind: 'clear', t: 0 }, season: 0, day: 0, createdAt: 0 };
    if (g.STATS) g.STATS.now = W.t;
    if (g.SECT && g.SECT.PEAKS) g.SECT.PEAKS._activeWorld = W;
    const cal = SIM.calendar(W.t); W.day = cal.day; W.season = cal.season; HC.nowDay = W.day; HC.nowSeason = W.season;
    W.map = MAP.create(W.seed);
    W.market = ECO.newMarket(rng);
    W.log = (type, text, ids, meta) => SIM.log(W, type, text, ids, meta);
    W.fame = v => { W.sect.fame = Math.max(0, (W.sect.fame || 0) + v); };
    W.makeNpc = o => SIM.addNpc(W, o);
    W.sect = { name: opts.sectName || 'สำนักเมฆาหยกสวรรค์', masterId: null, deputyId: null, posts: {}, policy: null, stock: {}, gear: [], stones: 1000, ledger: [], recipeTier: 2, library: [], fame: 12, cd: {}, lastDuty: {}, orders: {}, suspicion: 0, festival: null, tournament: null, guardRoster: [], buyList: [], efficiency: 0, produced: 0, fallen: [], research: null, stipendOk: true, policyShift: W.day, reserveDirectives: null, shortageDirectives: [], welfareHistory: [], assemblyHistory: [], trackedNpcIds: [] };
    if (g.CULT && g.CULT.menagerieTick) g.CULT.menagerieTick(W);
    SECT.POST_IDS.forEach(p => W.sect.posts[p] = null);
    EXPED.initWorld(W); EXPLORE.init(W);
    // ---- ห้องสมุด/คลัง/ตำรับ และ Archetype ----
    const archKey = opts.archetype || opts.sectArchetype || null;
    const arch = (archKey && g.SECT && g.SECT.ARCHETYPES && g.SECT.ARCHETYPES[archKey]) || (g.SECT && g.SECT.ARCHETYPES && g.SECT.ARCHETYPES.sword);
    if (arch) {
      W.sect.archetype = arch.id;
      if (!opts.sectName) W.sect.name = arch.nameTh;
      const baseCurriculum = JD.TECH.techniques.filter(t => t && t.id && t.id.startsWith('MP_BASE_')).map(t => t.id);
      W.sect.library = Array.from(new Set(arch.techs.concat(baseCurriculum)));
      W.sect.crystals = Object.assign({}, arch.crystals);
      W.sect.unlockedSubs = arch.subs.slice();
    } else {
      W.sect.library = JD.TECH.techniques.filter(t => !t.sourcePack && !t.martialRare && !t.overhaulPack && !t.innateOnly && t.tier <= 2).map(t => t.id).concat(JD.TECH.techniques.filter(t => !t.sourcePack && !t.martialRare && !t.overhaulPack && !t.innateOnly && t.tier === 3).slice(0, 12).map(t => t.id)).concat(JD.TECH.techniques.filter(t => !t.sourcePack && !t.martialRare && !t.overhaulPack && !t.innateOnly && t.tier === 3 && (t.path === 'DEMON' || t.path === 'HEART_SOUL')).map(t => t.id)).concat(JD.TECH.techniques.filter(t => t.starterPassive && !t.innateOnly).map(t => t.id));
    }
    // ---- เจ้าสำนัก ----
    const mi = opts.masterIdx != null ? opts.masterIdx : 0;
    const mo = SIM.masterOpts(seed, mi, archKey);
    const master = SIM.buildNpc(W, mo.r, mo.o);
    SIM.register(W, master);
    W.sect.masterId = master.id;
    // ---- ศิษย์ตามลำดับ ----
    for (let i = 0; i < 2; i++) {
      const discOpts = {
        sex: i === 0 ? (master.h.sex === 'M' ? 'F' : 'M') : rng.chance(0.5) ? 'M' : 'F',
        ageYears: rng.int(16, 23),
        quality: 0.5 + rng.gauss(0, 0.3),
        skillExp: 0.25,
        trainedness: 0.55,
        rank: 1,
        stage: 1,
        tenure: rng.int(200, 700),
        merit: 40
      };
      if (archKey) {
        discOpts.archetypeKey = archKey;
        discOpts.isFounder = true;
        discOpts.founderIndex = i + 1;
      }
      const n = SIM.buildNpc(W, rng, discOpts);
      SIM.register(W, n);
      n.mentor = master.id;
      n.mentorId = master.id;
      master.h.life.family.disciples.push(n.id);
      master.apprenticeIds = master.h.life.family.disciples.slice();
      n.h.life.family.master = master.id;
    }
    W._founding = false;
    const S = W.sect; S.stock.grain = 150; S.stock.meal = 30;
    ECO.recipesFor(W, ['ALCHEMY', 'FORGING', 'ARRAY', 'TALISMAN']).forEach(r => r.inputs.forEach(i => { const m = ECO.matById[i.matId]; if (m && m.tier <= 2) S.stock[i.matId] = Math.max(S.stock[i.matId] || 0, 8 + (m.tier === 1 ? 6 : 0)); }));
    S.policy = SECT.initPolicy(W); if (SECT.ensureDirectives) { SECT.ensureDirectives(W); SECT.updateReserveDirectives(W); }
    if (g.ECO && g.ECO.ensureStockTracker) g.ECO.ensureStockTracker(W);
    if (g.SECT && g.SECT.ensureFacilityDemand) g.SECT.ensureFacilityDemand(W);
    g.CPE.init(W); if (g.SECT && g.SECT.ensureDirectives) g.SECT.ensureDirectives(W); g.CONTENT.ensure(W); g.MARTIAL.ensure(W);
    if (g.WILD_RES) g.WILD_RES.init(W);
    if (g.FISHING) g.FISHING.ensure(W);
    if (ECO && ECO.ensureUniqueGearUids) ECO.ensureUniqueGearUids(W);
    const pl = W.map.byId.plaza; W.npcs.forEach(n => SIM.placeNear(W, n, pl.x + pl.w / 2, pl.y + pl.h / 2, 12));
    W.logs.length = 0; W.logSeq = 0;
    W.log('system', 'เปิดศักราชยุคที่ 101 — เจ้าสำนักรุ่นที่ ' + (S.masterGeneration || 7) + ' ' + HC.fullName(master) + ' สืบทอดและฟื้นฟู「' + S.name + '」', [master.id]);
    if (g.SECT && g.SECT.ensureCompanionsAndBloodlines) g.SECT.ensureCompanionsAndBloodlines(W);
    if (g.SECT && g.SECT.FENG_SHUI) g.SECT.FENG_SHUI.ensure(W);
    if (g.SECT && g.SECT.CARAVAN_AUCTION) g.SECT.CARAVAN_AUCTION.ensure(W);
    if (g.SECT && g.SECT.ELDER_COUNCIL_EDICTS) g.SECT.ELDER_COUNCIL_EDICTS.ensure(W);
    if (g.SECT && g.SECT.SECRET_REALM_NODES) g.SECT.SECRET_REALM_NODES.ensure(W);
    if (g.SECT && g.SECT.GRAND_ASSEMBLY_BANQUET) g.SECT.GRAND_ASSEMBLY_BANQUET.ensure(W);
    if (g.SECT && g.SECT.HEAVENLY_DAO_DIRECTOR) g.SECT.HEAVENLY_DAO_DIRECTOR.ensure(W);
    if (g.SECT && g.SECT.PEAKS) g.SECT.PEAKS.ensure(W);
    if (g.SECT && g.SECT.ELEMENTAL_BARRIER) g.SECT.ELEMENTAL_BARRIER.ensure(W);
    if (g.MAP && g.MAP.syncPeakSanctuaries) g.MAP.syncPeakSanctuaries(W);
    if (g.SECT && g.SECT.ensureDungeon) g.SECT.ensureDungeon(W);
    if (g.SECT && g.SECT.ensureJurisdictionLog) g.SECT.ensureJurisdictionLog(W);
    if (g.SECT && g.SECT.TOTEMS_BLOODLINES) g.SECT.TOTEMS_BLOODLINES.ensure(W);
    if (g.SECT && g.SECT.CELESTIAL_ALIGNMENTS) g.SECT.CELESTIAL_ALIGNMENTS.ensure(W);
    if (g.SECT && g.SECT.DESTINY_KARMA) g.SECT.DESTINY_KARMA.ensure(W);
    if (g.SECT && g.SECT.LEYLINE_GRID) g.SECT.LEYLINE_GRID.ensure(W);
    if (g.SECT && g.SECT.TRIBUNAL) g.SECT.TRIBUNAL.ensure(W);
    if (g.SECT && g.SECT.AUTOMATION) g.SECT.AUTOMATION.ensure(W);
    if (g.SECT && g.SECT.ensureDefectorPursuit) g.SECT.ensureDefectorPursuit(W);
    if (g.SECT && g.SECT.ELEMENTAL_BARRIER) g.SECT.ELEMENTAL_BARRIER.ensure(W);
    if (g.SECT && g.SECT.ANCESTRAL_PAVILION) g.SECT.ANCESTRAL_PAVILION.ensure(W);
    if (g.SECT && g.SECT.OUTPOSTS_LOGISTICS) g.SECT.OUTPOSTS_LOGISTICS.ensure(W);
    if (g.SECT && g.SECT.CHARTER_DOCTRINE) g.SECT.CHARTER_DOCTRINE.ensure(W);
    if (g.SECT && g.SECT.STRATEGIC_COUNCIL) g.SECT.STRATEGIC_COUNCIL.ensure(W);
    if (g.SECT && g.SECT.PATH_LIBRARY) g.SECT.PATH_LIBRARY.ensure(W);
    if (g.SECT && g.SECT.INFERNAL_SHRINE) g.SECT.INFERNAL_SHRINE.ensure(W);
    if (g.CULT && g.CULT.GRAND_DAO_MECHANICS) g.CULT.GRAND_DAO_MECHANICS.ensureWorldState(W);
    if (g.EXPLORE && g.EXPLORE.ensureMicroLocations) g.EXPLORE.ensureMicroLocations(W);
    if (g.EXPED && g.EXPED.ensureWanderingFigures) g.EXPED.ensureWanderingFigures(W);
    if (g.EXPED && g.EXPED.ensureNewsSystem) g.EXPED.ensureNewsSystem(W);
    SIM.dailyUpdate(W, true);
    return W;
  };
  SIM.snapshotPerson = (W, n, statusOverride) => {
    if (!W || !W.sect || !n || !n.id || !n.h || !n.h.name) return null;
    if (!W.sect.historicalPeople || typeof W.sect.historicalPeople !== "object") W.sect.historicalPeople = {};
    const prev = W.sect.historicalPeople[n.id] || {};
    const curGiven = n.h.name.given || prev.given || n.id;
    const curSurname = n.h.name.surname || n.h.name.family || prev.surname || "";
    const fullName = HC.fullName ? HC.fullName(n) : (curSurname + curGiven);
    const formerSet = new Set(Array.isArray(prev.formerNames) ? prev.formerNames : []);
    if (Array.isArray(n.h.name.formerNames)) {
      n.h.name.formerNames.forEach(fn => { if (fn && fn !== fullName && fn !== curGiven) formerSet.add(fn); });
    }
    if (prev.fullName && prev.fullName !== fullName) formerSet.add(prev.fullName);
    if (prev.given && prev.given !== curGiven) formerSet.add(prev.given);
    n.h.name.formerNames = Array.from(formerSet).slice(0, 8);

    const roleTh = (g.SECT && g.SECT.title) ? g.SECT.title(n) : (prev.roleTh || "ศิษย์สำนัก");
    const statusTh = statusOverride || (n.dead ? ("เสียชีวิตแล้ว" + (n.deathWhy ? " (" + n.deathWhy + ")" : "")) : n.exiled ? "ออกจากสำนักแล้ว" : (prev.statusTh && prev.dead && !n.dead ? "สมาชิกสำนัก" : (n.away ? "ปฏิบัติภารกิจนอกสำนัก" : "สมาชิกสำนัก")));
    const pId = n.cult ? n.cult.path : (prev.path || null);
    const subId = n.cult ? n.cult.sub : (prev.sub || null);
    const pDef = (pId && CULT && CULT.PATHS && CULT.PATHS[pId]) || null;
    const subEntry = (subId && CULT && CULT.subList && CULT.subList.find(x => x.sub && x.sub.id === subId)) || null;
    const stgNameTh = (n.cult && CULT && CULT.stageName) ? CULT.stageName(n) : (prev.stageNameTh || (n.cult ? ("ขั้นที่ " + n.cult.stage) : "ปุถุชน"));
    const topWhyTh = (Array.isArray(n.why) && n.why[0] && n.why[0][0]) ? String(n.why[0][0]) : (prev.topWhyTh || null);
    const goalObj = (n.cognition && n.cognition.goal) || null;
    const aspObj = (n.cognition && n.cognition.aspiration) || null;
    const snap = {
      id: n.id,
      given: curGiven,
      surname: curSurname,
      fullName: fullName || prev.fullName || n.id,
      formerNames: n.h.name.formerNames.slice(),
      roleTh,
      rank: n.rank != null ? n.rank : (prev.rank || 0),
      post: n.post || prev.post || null,
      path: pId,
      pathNameTh: (pDef && pDef.nameTh) || prev.pathNameTh || pId || "คนธรรมดา",
      sub: subId,
      subNameTh: (subEntry && subEntry.sub && subEntry.sub.nameTh) || prev.subNameTh || subId || null,
      stage: n.cult ? n.cult.stage : (prev.stage || 0),
      stageNameTh: stgNameTh,
      origin: n.ext?.world?.originPublic ? Object.assign({}, n.ext.world) : null,
      dead: !!n.dead,
      exiled: !!n.exiled,
      deathDay: n.deathDay != null ? n.deathDay : (prev.deathDay != null ? prev.deathDay : null),
      deathWhy: n.deathWhy || prev.deathWhy || null,
      joinDay: n.joinDay != null ? n.joinDay : (prev.joinDay != null ? prev.joinDay : null),
      merit: Math.round(n.merit != null ? n.merit : (prev.merit || 0)),
      mentorId: n.mentorId || n.mentor || prev.mentorId || null,
      companionId: n.companionId || prev.companionId || null,
      topWhyTh,
      goalId: (goalObj && goalObj.id) || prev.goalId || null,
      goalTitleTh: (goalObj && goalObj.title) || prev.goalTitleTh || null,
      aspirationId: (aspObj && aspObj.id) || prev.aspirationId || null,
      statusTh,
      snapshotDay: W.day || 0,
      snapshotTick: W.t || 0
    };
    W.sect.historicalPeople[n.id] = snap;
    return snap;
  };
  SIM.register = (W, n) => {
    EXPED.assignHometown(W, n);
    n.n = ++W.seqN;
    if (W && W.sect && W.sect.totemPillars && Array.isArray(W.sect.totemPillars.activeTotems) && W.sect.totemPillars.activeTotems.length) {
      n.sectTotems = W.sect.totemPillars.activeTotems.slice();
      n._sectTotems = n.sectTotems;
    }
    if (n && n.inv && Number.isFinite(n.inv.stones) && n.personalStones == null) {
      n.personalStones = n.inv.stones;
    }
    W.npcs.push(n);
    W.byId[n.id] = n;
    SIM.snapshotPerson(W, n);
    return n;
  };
  SIM.addNpc = (W, o) => {
    o = o || {};
    const id = 'n' + (W.seqN + 1) + '_' + W.rng.int(100, 999);
    let tierRoll = null;
    if ((o.fromApplicant || o.useTalentTier) && o.quality == null && SECT.rollApplicantTier) {
      tierRoll = SECT.rollApplicantTier(W.rng, W.sect ? W.sect.fame : 12);
    }
    const effQuality = o.quality != null ? o.quality : (tierRoll ? tierRoll.quality : 0);
    const effRoot = o.rootGrade || (tierRoll ? tierRoll.rootGrade : undefined);
    const effTraits = o.traitCount != null ? o.traitCount : (tierRoll ? tierRoll.traitCount : undefined);
    const awaken = o.fromExped ? 0.65 + Math.max(0, effQuality) * 0.15 : 0.5;
    const isMortalRecruit = o.stage == null && ((o.rank || 0) === 0 || o.fromApplicant) && !o.fromExped && !o.forceAwaken;
    const n = SIM.buildNpc(W, W.rng, {
      id,
      sex: o.sex,
      ageYears: o.ageYears,
      quality: effQuality,
      skillExp: clamp(((o.ageYears || 18) - 12) / 40, 0.03, 0.35),
      trainedness: 0.5,
      rank: o.rank || 0,
      stage: o.stage != null ? o.stage : (isMortalRecruit ? 0 : (W.rng.chance(awaken) ? 1 : 0)),
      awakenChance: null,
      merit: 0,
      traitCount: effTraits,
      rootGrade: effRoot,
      _fromTierRoll: !!(tierRoll && !o.rootGrade),
      customRoots: o.customRoots,
      forceRootCount: o.forceRootCount,
      forceElements: o.forceElements,
      forceGrades: o.forceGrades
    });
    if (tierRoll) {
      n.ext = n.ext || {};
      n.ext.applicant = {
        tier: tierRoll.tierId,
        tierId: tierRoll.tierId,
        nameTh: tierRoll.nameTh,
        isGifted: tierRoll.isGifted,
        isExceptional: tierRoll.isExceptional,
        rolledAtDay: W.day
      };
    }
    n.joinDay = W.day; n.sat = 70;
    if (o.queue) { EXPED.assignHometown(W,n); n.n = ++W.seqN; return n; }
    SIM.register(W, n);
    if (!W._founding && W.npcs && W.npcs.length >= 10 && n.x === 0 && n.y === 0) {
      if (W.map && W.map.byId && W.map.byId.plaza) {
        const pl = W.map.byId.plaza;
        n.x = pl.x + (n.n % Math.max(1, pl.w)) + 0.5;
        n.y = pl.y + (Math.floor(n.n / Math.max(1, pl.w)) % Math.max(1, pl.h)) + 0.5;
        n.px = n.x;
        n.py = n.y;
      }
      if (n.act && n.act.id === 'idle' && n.act.left === 0) {
        n.act.left = (n.n * 5) % 220;
      }
      if (HC && HC.derived) HC.derived(n);
      if (CULT && CULT.rate && n.cult) CULT.rate(n, 1);
    }
    return n;
  };

  SIM.log = (W, type, text, ids, meta) => {
    if (W._expeditionLocation && !meta?.location) meta = Object.assign({},meta,{location:W._expeditionLocation});
    const cleanIds = (ids || []).filter(Boolean);
    const actorSnaps = [];
    const names = cleanIds.map((id, idx) => {
      const n = W.byId && W.byId[id];
      if (n) {
        const hp0 = W.sect && W.sect.historicalPeople && W.sect.historicalPeople[id];
        const curFull = HC.fullName(n);
        if (!hp0 || hp0.fullName !== curFull || hp0.stage !== (n.cult ? n.cult.stage : 0) || hp0.dead !== !!n.dead || hp0.exiled !== !!n.exiled || hp0.rank !== n.rank || hp0.post !== n.post) {
          SIM.snapshotPerson(W, n);
        }
        const snap = W.sect && W.sect.historicalPeople && W.sect.historicalPeople[id];
        if (idx < 4 && snap) {
          actorSnaps.push({
            id: snap.id,
            fullName: snap.fullName,
            given: snap.given,
            surname: snap.surname,
            roleTh: snap.roleTh,
            pathNameTh: snap.pathNameTh,
            stage: snap.stage,
            stageNameTh: snap.stageNameTh,
            topWhyTh: (Array.isArray(n.why) && n.why[0] && n.why[0][0]) ? String(n.why[0][0]) : snap.topWhyTh,
            goalTitleTh: (n.cognition && n.cognition.goal && n.cognition.goal.title) || snap.goalTitleTh || null,
            dead: !!n.dead
          });
        }
        return curFull;
      }
      const hp = W.sect && W.sect.historicalPeople && W.sect.historicalPeople[id];
      if (idx < 4 && hp) {
        actorSnaps.push({
          id: hp.id,
          fullName: hp.fullName,
          given: hp.given,
          surname: hp.surname,
          roleTh: hp.roleTh,
          pathNameTh: hp.pathNameTh,
          stage: hp.stage,
          stageNameTh: hp.stageNameTh,
          topWhyTh: hp.topWhyTh || null,
          goalTitleTh: hp.goalTitleTh || null,
          dead: !!hp.dead
        });
      }
      return hp ? hp.fullName : "";
    });
    const e = { id: ++W.logSeq, t: W.t, day: W.day || Math.floor((W.t || 0) / 1440), type, text, ids: cleanIds, names };
    if (actorSnaps.length) e.actorSnaps = actorSnaps;
    if (meta && typeof meta === "object") {
      if (meta.txKind) e.txKind = meta.txKind;
      if (meta.storyThreadId) e.storyThreadId = meta.storyThreadId;
      if (meta.severity) e.severity = meta.severity;
      if (meta.location?.nodeId) e.location = Object.assign({}, meta.location);
      e.meta = Object.assign({}, meta);
    }
    const isRoutineTraining = (type === "breakthrough" && /ฝึกประจำวัน/.test(text));
    const majorType = !isRoutineTraining && (
      ["death","succession","marriage","recruit","tournament","expel","legacy","challenge","scandal","crisis","sect","policy","diplomacy","desert"].includes(type) ||
      (type === "duel" && (meta && meta.combatSummary)) ||
      (type === "breakthrough" && (/ทะลวง.*(สำเร็จ|ล้มเหลว)|กลืนกิน|ติดคอขวด|ตัดสินใจทะลวง|ผ่าน「|วิวัฒนาการสายเลือด|ปลุกสายเลือด/.test(text) || (meta && meta.promoteChronicle))) ||
      (type === "raid" && /(ต้านการบุก|ถูกบุกและปล้น|สังหารผู้บุกรุก|ตีฝ่า|กำลังบุกสำนัก|สหายร่วมสาบาน)/.test(text)) ||
      (["research","craft","heal","finance","decision","exped","appoint","promote","demote","punish"].includes(type) && (
        /☯️|🌌|🪷|🗡️|📜|🐪|🔨|🏛️|⛰️|👑|🕯️|⚡|🏮|⛺|🏯|ชะลอการขยาย|ชะลอการจัดซื้อ|ยักยอก|คุณภาพชั้นเลิศ|ล้มเหลว|วิจัยตำรับ/.test(text) ||
        (meta && meta.promoteChronicle)
      ))
    );
    if (majorType && W.sect) {
      if (!Array.isArray(W.sect.sectChronicle)) W.sect.sectChronicle = [];
      const eventKey = (meta && meta.eventKey) || (type + ":" + text);
      const last = W.sect.sectChronicle[W.sect.sectChronicle.length - 1];
      if (!last || last.eventKey !== eventKey || Math.abs((W.t || 0) - (last.t || 0)) > 5) {
        const isMilestone = ["death","succession","marriage","legacy"].includes(type) ||
          (type === "raid" && /(ต้านการบุก|ถูกบุกและปล้น)/.test(text)) ||
          (type === "breakthrough" && /ฝ่าทัณฑ์สวรรค์|ฉายาเซียนสูงสุด/.test(text)) ||
          !!(meta && (meta.isMilestone || meta.severity === "CRITICAL"));
        const severity = (meta && meta.severity) || (
          (["death","succession","crisis","scandal"].includes(type) || (type === "raid" && /ถูกบุกและปล้น|กำลังบุกสำนัก/.test(text))) ? "CRITICAL" :
          (["marriage","tournament","challenge","expel","sect","policy","diplomacy"].includes(type) || isMilestone) ? "MAJOR" : "NOTABLE"
        );
        const chronItem = {
          id: e.id,
          t: e.t,
          day: e.day,
          type: e.type,
          location: e.location || null,
          text: e.text,
          ids: cleanIds.slice(),
          names: names.slice(),
          eventKey,
          severity,
          isMilestone
        };
        if (actorSnaps.length) chronItem.actorSnaps = actorSnaps;
        if (meta && meta.combatSummary) chronItem.combatSummary = meta.combatSummary;
        if (meta && meta.originCauseTh) chronItem.originCauseTh = meta.originCauseTh;
        if (meta && meta.consequenceTh) chronItem.consequenceTh = meta.consequenceTh;
        if (meta && meta.followUpTh) chronItem.followUpTh = meta.followUpTh;
        if (meta && meta.storyThreadId) chronItem.storyThreadId = meta.storyThreadId;
        if (meta && meta.storyThreadTitleTh) chronItem.storyThreadTitleTh = meta.storyThreadTitleTh;
        if (meta && meta.factDeltas) chronItem.factDeltas = meta.factDeltas;
        W.sect.sectChronicle.push(chronItem);
        if (W.sect.sectChronicle.length > 600) {
          const overflow = W.sect.sectChronicle.length - 600;
          let removed = 0;
          let pinnedSeen = 0;
          for (let ci = 0; ci < W.sect.sectChronicle.length && removed < overflow; ci++) {
            const item = W.sect.sectChronicle[ci];
            if (item && item.isMilestone && pinnedSeen < 160) {
              pinnedSeen++;
              continue;
            }
            W.sect.sectChronicle.splice(ci, 1);
            ci--;
            removed++;
          }
          if (W.sect.sectChronicle.length > 600) {
            W.sect.sectChronicle.splice(0, W.sect.sectChronicle.length - 600);
          }
          W.sect.sectChronicleTrimmedCount = (W.sect.sectChronicleTrimmedCount || 0) + overflow;
        }
      }
    }
    W.logs.push(e); if (W.logs.length > 1500) W.logs.splice(0, 400);
    if (W.onLog) W.onLog(e);
    if (e.ids.length && !['finance', 'event', 'system', 'raid'].includes(type)) {
      e.ids.forEach(id => {
        const n = W.byId[id];
        if (n) {
          const b = n.h.life.bio;
          b.push({ d: W.day, text });
          if (b.length > 80) {
            const keepPinned = new Set(['DIVINE_GIFT', 'TRAIT_SHIFT', 'lineage', 'tribulation', 'breakthrough']);
            let removed = 0;
            for (let bi = 0; bi < b.length && removed < 16 && b.length > 80; ) {
              if (b[bi] && keepPinned.has(b[bi].kind)) { bi++; continue; }
              b.splice(bi, 1);
              removed++;
            }
            if (b.length > 80) b.splice(0, b.length - 80);
          }
        }
      });
    }
    return e;
  };

  /* ---------- วงจรจำลอง ---------- */
  SIM.tick = W => {
    if (g.SECT && g.SECT.PEAKS) g.SECT.PEAKS._activeWorld = W;
    W.workSteps = (W.workSteps || 0) + 1;
    // 1.5x Day Length Contract: 3 work-steps = 2 calendar minutes (2160 work-steps = 1440 calendar minutes = 1 calendar day)
    W.timePhase = (W.timePhase || 0) + 2;
    let advancedCalendarMinute = false;
    if (W.timePhase >= 3) {
      W.timePhase -= 3;
      W.t++;
      advancedCalendarMinute = true;
    }
    W._isNewCalendarMinute = advancedCalendarMinute;
    g.STATS.now = W.t;
    if (advancedCalendarMinute) {
      const d = Math.floor(W.t / 1440);
      if (d !== W.day && W._lastDailyUpdateDay !== d) {
        W.day = d;
        W._lastDailyUpdateDay = d;
        HC.nowDay = d;
        SIM.dailyUpdate(W);
      }
      if (W.t % 30 === 0 && W.world?.fallenStarEpic?.war?.campaign) EXPED.FALLEN_STAR_EPIC.tickCampaign(W);
    }
    const npcs = W.npcs;
    if (true) {
      let ap = 0;
      for (let i = 0; i < npcs.length; i++) {
        const x = npcs[i];
        if (x && !x.dead && !x.exiled) ap++;
      }
      W._alivePop = Math.max(1, ap);
    }
    for (let i = 0; i < npcs.length; i++) {
      const n = npcs[i]; if (n.dead) continue;
      if (n.travel) { n.px = n.x; n.py = n.y; AI.needs(W, n); if (!n.dead) EXPED.travelStep(W, n); if (n.away && n.exiled) { SIM.retire(W, n); i--; } continue; }
      if (n.away) continue;
      AI.step(W, n);
    }
    if (W.wildlife && Array.isArray(W.wildlife.beasts)) {
      for (let bi = 0; bi < W.wildlife.beasts.length; bi++) {
        const b = W.wildlife.beasts[bi];
        if (b) { b._px = b.x; b._py = b.y; }
      }
    }
    if (Array.isArray(W.foes)) {
      for (let fi = 0; fi < W.foes.length; fi++) {
        const f = W.foes[fi];
        if (f) { f._px = f.x; f._py = f.y; }
      }
    }
    if (W.world && Array.isArray(W.world.visitors)) {
      for (let vi = 0; vi < W.world.visitors.length; vi++) {
        const v = W.world.visitors[vi];
        if (v) { v._px = v.x; v._py = v.y; }
      }
    }
    if (g.WILD) g.WILD.tick(W);
    if (g.WILD_RES) g.WILD_RES.tick(W);
    if (W.foes.length) EXPED.raidTick(W);
    if (g.WILD) g.WILD.clampCombat(W);
    if (W.sect && Array.isArray(W.sect.activeTribulations) && W.sect.activeTribulations.length > 0 && CULT.TRIBULATION && CULT.TRIBULATION.tickAll) {
      CULT.TRIBULATION.tickAll(W);
    }
    COMBAT.tick(W);
    if (advancedCalendarMinute && W.t % 60 === 0 && W._lastHourlyUpdateT !== W.t) {
      W._lastHourlyUpdateT = W.t;
      SIM.hourly(W);
    }
  };
  SIM.cleanupDepartedNpcRefs = (W, n) => {
    if (!W || !n || !n.id) return;
    if (W.sect && W.sect.peaks && W.sect.peaks.byId) {
      Object.values(W.sect.peaks.byId).forEach(pObj => {
        if (!pObj) return;
        if (Array.isArray(pObj.memberIds)) pObj.memberIds = pObj.memberIds.filter(id => id !== n.id);
        if (pObj.masterId === n.id) { pObj.masterId = null; pObj.masterNameTh = null; }
        if (pObj.deputyId === n.id) { pObj.deputyId = null; pObj.deputyNameTh = null; }
      });
    }
    if (W.sect && W.sect.leylineGrid && W.sect.leylineGrid.anchors) {
      Object.values(W.sect.leylineGrid.anchors).forEach(a => {
        if (a && a.guardNpcId === n.id) a.guardNpcId = null;
      });
    }
    if (W.sect && W.sect.outposts && W.sect.outposts.byNodeId) {
      Object.values(W.sect.outposts.byNodeId).forEach(op => {
        if (op && Array.isArray(op.garrisonNpcIds)) {
          op.garrisonNpcIds = op.garrisonNpcIds.filter(id => id !== n.id);
        }
      });
    }
    if (Array.isArray(W.npcs)) {
      W.npcs.forEach(o => {
        if (!o || o.id === n.id) return;
        if (o.closedDoorSeclusion) {
          if (o.closedDoorSeclusion.protectorId === n.id) o.closedDoorSeclusion.protectorId = null;
          if (o.closedDoorSeclusion.companionId === n.id) o.closedDoorSeclusion.companionId = null;
        }
      });
    }
  };
  SIM.retire = (W, n) => {
    AI.cancelAct(W, n); AI.freeBed(W, n); if (n.post) { W.sect.posts[n.post] = null; n.post = null; }
    if (g.WILD_RES) g.WILD_RES.releaseClaim(W, n);
    if (g.CPE && g.CPE.retireNpc) g.CPE.retireNpc(W, n, 'ออกจากสำนัก');
    for (const k of Object.keys(n.equip || {})) { if (n.equip[k]) W.sect.gear.push(n.equip[k]); } n.equip = {};
    if (n.inv && Array.isArray(n.inv.gear)) { n.inv.gear.forEach(g2 => { if (g2) W.sect.gear.push(g2); }); n.inv.gear = []; }
    for (const k of Object.keys((n.inv && n.inv.pills) || {})) {
      ECO.add(W, k, n.inv.pills[k]);
      if (n.inv.spawnedPills && n.inv.spawnedPills[k] > 0) {
        W.sect.spawnedPills = W.sect.spawnedPills || {};
        W.sect.spawnedPills[k] = (W.sect.spawnedPills[k] || 0) + n.inv.spawnedPills[k];
      }
    }
    if (!n.exiled && g.MARTIAL) g.MARTIAL.returnKnowledge(W, n);
    for (const k of Object.keys((n.inv && n.inv.mats) || {})) {
      ECO.add(W, k, n.inv.mats[k]);
      if (n.inv.spawnedMats && n.inv.spawnedMats[k] > 0) {
        W.sect.spawnedMats = W.sect.spawnedMats || {};
        W.sect.spawnedMats[k] = (W.sect.spawnedMats[k] || 0) + n.inv.spawnedMats[k];
      }
    }
    if (!n.exiled) {
      for (const id of ((n.inv && n.inv.techs) || [])) if (CULT.tech(id) && !W.sect.library.includes(id)) W.sect.library.push(id);
      for (const id of ((n.inv && n.inv.recipes) || [])) if (ECO.recipeById[id] && !W.sect.knownRecipes.includes(id)) { W.sect.knownRecipes.push(id); if (W.world && W.world.contentMetrics) W.world.contentMetrics.formulas++; }
    }
    const heldStones = Math.max(0, Math.round((n.inv && n.inv.stones) || 0));
    if (heldStones > 0) {
      if (!n.exiled) {
        ECO.earn(W, heldStones, 'ส่งคืนศิลาส่วนตัวของ ' + (n.h && n.h.name ? n.h.name.given : n.id), { internalTransfer: true });
      } else if (W.world && W.world.resourcePool && Number.isFinite(W.world.resourcePool.stones)) {
        W.world.resourcePool.stones += heldStones;
      }
    }
    if (Array.isArray(n.pets) && n.pets.length > 0) {
      W.sect.reservePets = W.sect.reservePets || [];
      while (n.pets.length > 0) {
        const pt = n.pets.shift();
        if (pt && !pt.dead) {
          pt.active = false;
          pt.formerOwnerId = n.id;
          W.sect.reservePets.push(pt);
        }
      }
    }
    if (n.inv) { n.inv.stones = 0; n.inv.pills = {}; n.inv.mats = {}; n.inv.techs = []; n.inv.recipes = []; }
    n.personalStones = 0;
    SIM.cleanupDepartedNpcRefs(W, n);
    SIM.snapshotPerson(W, n, n.exiled ? "ถูกขับไล่/ออกจากสำนัก" : "ออกจากสำนักแล้ว");
    n.retired = true;
    const i = W.npcs.indexOf(n);
    if (i >= 0) W.npcs.splice(i, 1);
    if (W.byId && W.byId[n.id] === n) delete W.byId[n.id];
    if (!W.gone.includes(n.id)) W.gone.push(n.id);
    if (n.id === W.sect.deputyId) W.sect.deputyId = null;
    if (W.sect && W.sect.successorId === n.id) W.sect.successorId = null;
    if (g.COG && g.COG.syncOfficeAuthority) g.COG.syncOfficeAuthority(W);
    if (W.world && W.world.resourceNodes && g.EXPED && g.EXPED.recomputeNodeGarrison) {
      Object.values(W.world.resourceNodes).forEach(rn => {
        if (rn && rn.garrison && Array.isArray(rn.garrison.discipleIds) && rn.garrison.discipleIds.includes(n.id)) {
          g.EXPED.recomputeNodeGarrison(W, rn);
        }
      });
    }
    if (g.VC && g.VC.syncUniqueArtifacts) g.VC.syncUniqueArtifacts(W);
    if (g.MARTIAL && g.MARTIAL.syncLibrary) g.MARTIAL.syncLibrary(W);
  };
  SIM.hourly = W => {
    if (g.STATS) g.STATS.now = W.t;
    W.npcs.forEach(n => {
      if (!n.dead) {
        if (g.STATS && g.STATS.purgeExpired) g.STATS.purgeExpired(n, W.t);
        if (g.STATS && g.STATS.hasBuff && g.STATS.hasBuff(n, 'vitalRegen', W.t)) {
          const hm = CULT.hpMax(n);
          n.h.state.hp = Math.min(hm, (n.h.state.hp || hm) + Math.max(1, Math.round(hm * 0.05)));
        }
        if (n.cult && n.cult.path === 'MECH_PUPPET' && n.act && n.act.id !== 'fight' && CULT.ensureMechState) {
          const ms = CULT.ensureMechState(n);
          const mwLv = (W.sect && W.sect.specialistFacilities && W.sect.specialistFacilities.mech_workshop) ? W.sect.specialistFacilities.mech_workshop.level : 1;
          ms.heat = Math.max(0, (ms.heat || 0) - (8 + mwLv * 4));
          ms.charge = Math.min(100, (ms.charge || 0) + (6 + mwLv * 3));
          if (ms.integrity < 100) {
            ms.integrity = Math.min(100, ms.integrity + (4 + mwLv * 3));
            ms.constructReadiness = ms.integrity;
          }
          ms.overclockReady = ms.charge >= 50;
        }
        if (CULT && CULT.tickMultiPhasePills && n.ext && Array.isArray(n.ext.multiPhasePills) && n.ext.multiPhasePills.length) {
          CULT.tickMultiPhasePills(W, n, W.t);
        }
        AI.healTick(W, n);
        g.STATS.recover(n);
        g.CPE.autoUse(W, n);
        if (CULT && CULT.evaluateAutonomousPostures) CULT.evaluateAutonomousPostures(W, n, { trigger: 'hourly' });
        if (n.equip) {
          for (const k in n.equip) {
            const it = n.equip[k];
            if (!it) continue;
            if (ECO && ECO.evaluateSoulBoundCondition) {
              const sb = ECO.evaluateSoulBoundCondition(n, it);
              if (sb && sb.drawbackHpDrainPct > 0 && n.h && n.h.state) {
                const drain = Math.max(1, Math.round(CULT.hpMax(n) * sb.drawbackHpDrainPct));
                n.h.state.hp = Math.max(1, (n.h.state.hp || 1) - drain);
              }
            }
            if (it.dur != null && n.act.id === 'fight') {
              if (ECO && ECO.wearGear) ECO.wearGear(it, 0.5, W, n);
              else it.dur = Math.max(0, it.dur - 0.5);
            }
            const hasPatina = Array.isArray(it.combatKeywords) && it.combatKeywords.some(k => k.kw === 'KW_PATINA_WEAR');
            const repairThreshold = hasPatina ? 0.28 : 0.45;
            if (n.act.id !== 'fight') {
              if (it.procedural && (it.retired || (it.dur <= 0 && (it.maxDur || 100) <= 20))) {
                if (ECO && ECO.retireGear) ECO.retireGear(W, n, it);
              } else if ((it.dur <= 0 || it.dur <= (it.maxDur || 100) * repairThreshold) && (it.maxDur || 100) > 20 && ECO && ECO.repairGear) {
                const hasPersonalStone = n.inv && n.inv.mats && Object.keys(ECO.REPAIR_STONES || {}).some(sid => (n.inv.mats[sid] || 0) > 0);
                if (!n.away || hasPersonalStone) ECO.repairGear(W, it, null, n);
              }
            }
            const hrNow = Math.floor((W.t || 0) / 60);
            if (!n.away && n.act.id !== 'fight' && it.maxCharges > 0 && (it.charges || 0) <= 0 && ECO && ECO.rechargeGear && hrNow % 24 === 0) {
              ECO.rechargeGear(W, it, n, { quiet: true });
            }
            if (ECO && ECO.recordGearLineage && hrNow % 24 === 0 && (it.provenanceLoreId || (it.combatKeywords && it.combatKeywords.some(k => k && (k.kw === 'KW_SOUL_SCAR_ECHO' || k.id === 'KW_SOUL_SCAR_ECHO'))))) {
              ECO.recordGearLineage(W, it, n);
            }
          }
        }
      }
    });
    const _simHr = Math.floor((W.t || 0) / 60);
    if (W._isNewCalendarMinute && W.t % 1440 === 0 && g.CULT) {
      for (const n of W.npcs) {
        if (!n || n.dead) continue;
        if (g.CULT.MARTIAL_VOWS && g.CULT.MARTIAL_VOWS.evaluateAutonomousAdoption) {
          g.CULT.MARTIAL_VOWS.evaluateAutonomousAdoption(W, n);
        }
        if (g.CULT.SIX_PATH_MASTERY && g.CULT.SIX_PATH_MASTERY.syncDaily) {
          g.CULT.SIX_PATH_MASTERY.syncDaily(W, n);
        }
      }
      if (g.EXPED && g.EXPED.EXTERNAL_WORLD_EVENTS && g.EXPED.EXTERNAL_WORLD_EVENTS.tickDaily) {
        g.EXPED.EXTERNAL_WORLD_EVENTS.tickDaily(W);
      }
      if (g.EXPED && g.EXPED.LIVING_SECTS && g.EXPED.LIVING_SECTS.tickMonthly) {
        g.EXPED.LIVING_SECTS.tickMonthly(W);
      }
      if (g.EXPED && g.EXPED.LIVING_POLITIES && g.EXPED.LIVING_POLITIES.tickMonthly) {
        g.EXPED.LIVING_POLITIES.tickMonthly(W);
      if (typeof CULT !== 'undefined' && CULT.LEGENDARY_DAO && CULT.LEGENDARY_DAO.tickMonthlyDiscoveryAndRipples) CULT.LEGENDARY_DAO.tickMonthlyDiscoveryAndRipples(W);
      if (g.EXPED && g.EXPED.POLITICAL_LIVES) { g.EXPED.POLITICAL_LIVES.tickDaily(W); g.EXPED.POLITICAL_LIVES.tickMonthly(W); }
      if (g.EXPED && g.EXPED.LIVING_INSTITUTIONS && g.EXPED.LIVING_INSTITUTIONS.tickDaily) { g.EXPED.LIVING_INSTITUTIONS.tickDaily(W); }
      if (g.EXPED && g.EXPED.WITNESSES_AND_SHARDS && g.EXPED.WITNESSES_AND_SHARDS.tickDaily) { g.EXPED.WITNESSES_AND_SHARDS.tickDaily(W); }
      }
      if (g.EXPED && g.EXPED.BLACK_LEDGER && g.EXPED.BLACK_LEDGER.tickDaily) g.EXPED.BLACK_LEDGER.tickDaily(W);
    }
    if (_simHr % 72 === 0 && ECO && ECO.maintainUpkeepGear) {
      for (const n of W.npcs) {
        if (n && !n.dead && !n.away) ECO.maintainUpkeepGear(W, n);
      }
    }
    if (_simHr % 24 === 0 && g.SECT && g.SECT.FORBIDDEN_VAULT && g.SECT.FORBIDDEN_VAULT.evaluateAutonomousSectVault) {
      g.SECT.FORBIDDEN_VAULT.evaluateAutonomousSectVault(W);
    }
    if (_simHr % 12 === 0 && g.CULT && g.CULT.SUPPORT_ARTS && g.CULT.SUPPORT_ARTS.evaluateAutonomousEmergencySupport) {
      g.CULT.SUPPORT_ARTS.evaluateAutonomousEmergencySupport(W);
    }
    W.map.buildings.forEach(b => { if (b.building && W.t >= b.building.until) SIM.finishBuilding(W, b); });
    if (W.map && W.map.buildings && g.SECT && g.SECT.ensureFacilityDemand) {
      g.SECT.ensureFacilityDemand(W);
      W.map.buildings.forEach(b => {
        const fd = W.sect.facilityDemand && W.sect.facilityDemand[b.id];
        if (!fd) return;
        const stIds = b.stations;
        if (!stIds || !stIds.length) return;
        let totalSt = 0, occ = 0;
        for (let si = 0; si < stIds.length; si++) {
          const stObj = W.map.stations[stIds[si]];
          if (stObj) { totalSt++; if (stObj.occ != null) occ++; }
        }
        if (!totalSt) return;
        const ratio = occ / totalSt;
        if (ratio >= 0.95) {
          fd.congestedHours = (fd.congestedHours || 0) + 1;
          fd.lastCongestionHour = W.t;
          if (fd.congestedHours >= 3) {
            fd.unmetDemands = (fd.unmetDemands || 0) + 1;
          }
        } else if (ratio < 0.6) {
          fd.congestedHours = 0;
        }
      });
    }
    EXPED.hourly(W);
    SECT.OUTPOSTS_LOGISTICS?.settleSupplyConvoys(W);
    if (W.sect.gear.length && W.t % 360 === 0) SIM.distributeGear(W);
    W.npcs.forEach(n => { if (!n.dead && !n.away && n.inj && n.inj.length && n.h.state.hp < CULT.hpMax(n) * 0.5) { for (const k of Object.keys(W.sect.stock)) { const info = ECO.isPill(k) ? ECO.pillInfo(k) : null; if (info && k.startsWith('P:BASIC_') && (info.effect.healHealth || info.effect.healInjury) && W.sect.stock[k] > 0 && n.rank >= 1) { ECO.usePill(W, n, k); break; } } } });
  };
  SIM.finishBuilding = (W, b) => {
    const maxL = SECT.maxBuildingLevel ? SECT.maxBuildingLevel(b) : 3;
    b.level = Math.min(maxL, b.building.to);
    b.building = null; b.hp = 100;
    SIM.expandStations(W, b);
    const fd = W.sect.facilityDemand && W.sect.facilityDemand[b.id];
    if (fd) {
      fd.congestedHours = 0;
      fd.failedAttempts = 0;
      fd.unmetDemands = 0;
      fd.lastUpgradedDay = W.day;
    }
    if (b.stations.some(id => W.map.stations[id] && W.map.stations[id].kind === 'bed')) {
      W.npcs.forEach(n => {
        if (!n.dead && !n.away && n.bed == null) {
          AI.assignBed(W, n);
        }
      });
    }
    W.log('build', b.nameTh + ' ขยายเป็นระดับ ' + b.level + '/' + maxL + ' เสร็จสมบูรณ์ (เพิ่มพื้นที่ใช้งานรองรับสมาชิก)', [b.id]); W.fame(1);
  };
  SIM.expandStations = (W, b) => {
    const M = W.map; M.extraSt = M.extraSt || [];
    const maxL = SECT.maxBuildingLevel ? SECT.maxBuildingLevel(b) : 3;
    if (b.level > maxL) b.level = maxL;

    // 1. Authoritative Dormitory Bed Progression (56 + 28 + 16 = 100 max)
    if (SECT.HOUSING_IDS && SECT.HOUSING_IDS.includes(b.id)) {
      const spec = SECT.FACILITY_SPECS && SECT.FACILITY_SPECS[b.id];
      const targetBeds = (spec && spec.bedsByLevel && spec.bedsByLevel[b.level]) || b.stations.length;
      const bedStations = b.stations.map(id => M.stations[id]).filter(s => s && s.kind === 'bed');
      const add = Math.max(0, targetBeds - bedStations.length);
      for (let i = 0; i < add; i++) {
        const s0 = bedStations[i % bedStations.length] || { bid: b.n, bkey: b.id, x: b.door ? b.door.x : b.x, y: b.door ? b.door.y : b.y, inside: true };
        const s = { id: M.stations.length, bid: s0.bid, bkey: s0.bkey, kind: 'bed', x: s0.x, y: s0.y, inside: true, occ: null, owner: null, n: b.stations.length };
        M.stations.push(s);
        b.stations.push(s.id);
        M.extraSt.push({ bid: s.bid, kind: 'bed', x: s.x, y: s.y, inside: true });
      }
      return;
    }

    // 2. Non-housing facilities NEVER add bed stations
    if (b.isPeakSanctuary && (!MAP.isPeakBuildingActive || !MAP.isPeakBuildingActive(W, b))) {
      b.stations.forEach(sid => {
        const st = M.stations[sid];
        if (st && st.kind === 'bed') {
          st.peakStationKind = 'bed';
          st.kind = 'peak_dorm';
        }
      });
      return;
    }
    const base = b.stations.slice();
    const kinds = {};
    base.forEach(id => {
      const s = M.stations[id];
      if (!s || s.kind === 'bed') return;
      (kinds[s.kind] = kinds[s.kind] || []).push(s);
    });
    Object.keys(kinds).forEach(k => {
      if (['guard', 'cell', 'treat', 'board', 'browse', 'work'].includes(k) && b.level < 3) return;
      const list = kinds[k];
      const add = Math.max(1, Math.round(list.length * 0.35));
      for (let i = 0; i < add; i++) {
        const s0 = list[i % list.length];
        let x = s0.x, y = s0.y;
        if (!s0.inside) {
          const maxYardY = b.y + b.h + Math.max(1, (b.yard || 2) - 1);
          const candX = Math.min(b.x + b.w - 1, Math.max(b.x, s0.x + (i % 3) - 1));
          const candY = Math.min(maxYardY, Math.max(b.y + b.h, s0.y + ((i >> 1) % 2)));
          const f = MAP.nearestFree(M, candX, candY);
          if (f && f.y <= maxYardY && (!MAP.findPath || MAP.findPath(M, MAP.GATE_IN.x, MAP.GATE_IN.y, f.x, f.y))) {
            x = f.x;
            y = f.y;
          }
        }
        const s = { id: M.stations.length, bid: s0.bid, bkey: s0.bkey, kind: k, x, y, inside: s0.inside, occ: null, n: list.length + i };
        M.stations.push(s);
        b.stations.push(s.id);
        M.extraSt.push({ bid: s.bid, kind: k, x, y, inside: s0.inside });
      }
    });
  };
  SIM.distributeGear = W => {
    if (SECT.distributeSectStock) {
      return SECT.distributeSectStock(W, { onlyGear: true });
    }
  };

  /* ---------- รายวัน ---------- */
  SIM.dailyUpdate = (W, silent) => {
    const rng = W.rng; const cal = SIM.calendar(W.t); W.season = cal.season; HC.nowDay = W.day; HC.nowSeason = W.season;
    if (g.CULT && g.CULT.TRIBULATION && g.CULT.TRIBULATION.tickAll) g.CULT.TRIBULATION.tickAll(W);
      for (let i = 0; i < W.npcs.length; i++) {
      const n = W.npcs[i];
      if (!n || n.dead) continue;
      if (n._dwVer === n._ver) n._dwDay = W.day;
      const c = n._c;
      if (c && c.ver === n._ver && (!n.mods || !n.mods.length || !n.mods.some(m => m.until === W.day))) {
        const oldBio = c.bio, newBio = HC.bioAge(n);
        c.day = W.day; c.bio = newBio;
        if (oldBio >= 22 && oldBio <= 30 && newBio >= 22 && newBio <= 30) {
          delete c.v["intellect.wisdom"];
          if (n._d && n._d.ver === n._ver) n._d.day = W.day;
          if (n._csBase && n._csBase.ver === n._ver) n._csBase.day = W.day;
          if (n._nd && n._nd.ver === n._ver) n._nd.day = W.day;
          if (n._wsBase && n._wsBase.ver === n._ver) n._wsBase.day = W.day;
          if (n._skRateCache && n._skRateCache.ver === n._ver) n._skRateCache.day = W.day;
          if (n._cultRateBase && n._cultRateBase.ver === n._ver && (!n.cult || n.cult.path !== "KARMA_SAMSARA")) n._cultRateBase.day = W.day;
          if (n._mDer && n._mDer.ver === n._ver) n._mDer.day = W.day;
          if (n._hpMaxCache && n._hpMaxCache.ver === n._ver) n._hpMaxCache.day = W.day;
        } else if (oldBio >= 18 && oldBio <= 30 && newBio >= 18 && newBio <= 30) {
          for (const k in c.v) {
            if (k.charCodeAt(0) === 105 && k.startsWith("intellect.")) delete c.v[k];
          }
          if (n._nd && n._nd.ver === n._ver) n._nd.day = W.day;
          if (n._wsBase && n._wsBase.ver === n._ver) n._wsBase.day = W.day;
          if (n._hpMaxCache && n._hpMaxCache.ver === n._ver) n._hpMaxCache.day = W.day;
        } else {
          for (const k in c.v) {
            if (k.charCodeAt(0) === 112 && k.startsWith("physiology.") || k.charCodeAt(0) === 105 && k.startsWith("intellect.")) delete c.v[k];
          }
        }
      }
    }
    const wr = rng.next(); const ss = cal.season;
    W.weather = { kind: ss === 3 ? (wr < 0.35 ? 'snow' : wr < 0.65 ? 'cloud' : 'clear') : ss === 0 ? (wr < 0.35 ? 'rain' : wr < 0.65 ? 'cloud' : 'clear') : ss === 1 ? (wr < 0.2 ? 'rain' : wr < 0.4 ? 'cloud' : 'clear') : (wr < 0.25 ? 'fog' : wr < 0.4 ? 'rain' : wr < 0.65 ? 'cloud' : 'clear'), t: W.t };
    W.avgMood = W.npcs.length ? W.npcs.reduce((s, n) => s + (n.dead ? 0 : n.h.state.mood), 0) / Math.max(1, W.npcs.filter(n => !n.dead).length) : 0;
    if (EXPED && EXPED.ANNUAL_FESTIVALS && EXPED.ANNUAL_FESTIVALS.dailyTick) EXPED.ANNUAL_FESTIVALS.dailyTick(W, cal, { silent: !!silent });
    if (EXPED && EXPED.GRAND_FESTIVALS && EXPED.GRAND_FESTIVALS.dailyTick) EXPED.GRAND_FESTIVALS.dailyTick(W, cal, { silent: !!silent });
    if (EXPED && EXPED.FALLEN_STAR_EPIC && EXPED.FALLEN_STAR_EPIC.tickDaily) EXPED.FALLEN_STAR_EPIC.tickDaily(W, cal, { silent: !!silent });
    if (silent) return;
    if (EXPED && EXPED.BLACK_LEDGER && EXPED.BLACK_LEDGER.tickDaily) EXPED.BLACK_LEDGER.tickDaily(W);
    if (CULT.LONGEVITY && CULT.LONGEVITY.evaluateDaily) CULT.LONGEVITY.evaluateDaily(W);
    W.npcs.forEach(n => { if (n.dead) return; if (n.ext && n.ext.longevity && n.ext.longevity.stasis) return; const age = HC.ageYears(n), life = n.lifespanMax || CULT.lifespan(n); if (age > life * 0.92) { const p = clamp((age - life * 0.92) / (life * 0.08), 0, 1) * 0.06; if (rng.chance(p)) AI.kill(W, n, 'ชราภาพ'); } });
    for (let i = W.npcs.length - 1; i >= 0; i--) { const n = W.npcs[i]; if (n.dead && W.day - n.deathDay > 4) { SIM.snapshotPerson(W, n, "เสียชีวิตและฝังในสุสานสำนัก"); W.npcs.splice(i, 1); if (W.byId && W.byId[n.id] === n) delete W.byId[n.id]; if (!W.graveyard.includes(n.id)) W.graveyard.push(n.id); } }
    if (!W.byId[W.sect.masterId] || W.byId[W.sect.masterId].dead) {
      if (SECT.resolvePlayerSuccessionCrisis) SECT.resolvePlayerSuccessionCrisis(W, 'เจ้าสำนักเดิมถึงแก่อนิจกรรม');
      else SECT.succession(W, 'เจ้าสำนักว่าง');
    }
    SIM.guardRoster(W);
    SIM.assistants(W);
    if (CULT.tickClosedDoorSeclusion) CULT.tickClosedDoorSeclusion(W);
    SECT.daily(W);
    if (g.COG && g.COG.syncOfficeAuthority) g.COG.syncOfficeAuthority(W);
    W.npcs.forEach(n => {
      if (!n.dead && !n.away) {
        if (g.COG && g.COG.reconcileLoadout) g.COG.reconcileLoadout(W, n);
        if (CULT && CULT.EXPERIENCE_TRAITS && CULT.EXPERIENCE_TRAITS.evaluateDaily) CULT.EXPERIENCE_TRAITS.evaluateDaily(W, n);
        if (COMBAT && COMBAT.ACTION_MASTERY_TRAITS && COMBAT.ACTION_MASTERY_TRAITS.reconcileActiveMasteries) COMBAT.ACTION_MASTERY_TRAITS.reconcileActiveMasteries(W,n);
      }
    });
    if (g.CULT && g.CULT.menagerieTick) g.CULT.menagerieTick(W);
    EXPED.daily(W); EXPLORE.daily(W); BN.daily(W); CPE.daily(W); g.CONTENT.daily(W); if (g.EXT) g.EXT.daily(W); if (g.FISHING) g.FISHING.daily(W); if (g.NECRO) g.NECRO.daily(W);
    W.npcs.forEach(n => {
      if (n.dead) {
        if (Array.isArray(n.pets) && n.pets.length > 0) {
          W.sect.reservePets = W.sect.reservePets || [];
          while (n.pets.length > 0) {
            const orphan = n.pets.shift();
            if (orphan) { orphan.active = false; orphan.formerOwnerId = n.id; W.sect.reservePets.push(orphan); }
          }
        }
        return;
      }
      if (g.STATS && g.STATS.purgeExpired) g.STATS.purgeExpired(n, W.t);
      if (Array.isArray(n.pets) && n.pets.length > 0) {
        for (let pi = 0; pi < n.pets.length; pi++) {
          const pt = n.pets[pi];
          if (!pt) continue;
          pt.hunger = Math.max(10, (pt.hunger == null ? 80 : pt.hunger) - 6);
          pt.fatigue = Math.max(0, (pt.fatigue || 0) - 22);
          if (pt.hunger < 55 && CULT.feedPet) CULT.feedPet(W, n, pt.uid);
        }
      }
      if (n.cult && n.cult.path === 'MECH_PUPPET' && CULT.ensureMechState) {
        const ms = CULT.ensureMechState(n);
        ms.heat = 0;
        ms.charge = 100;
        if (ms.integrity < 75 && CULT.repairConstruct) CULT.repairConstruct(W, n);
      }
      if (n.away || !n.cult || !n.cult.track) return;
      if (CULT.trackReady(n)) {
        const gate = CULT.checkTrackGates(W, n);
        if (gate.ok) CULT.trackBreakthrough(W, n);
      }
    });
    CULT.tickSovereignNursery(W);
    SIM.researchTick(W);
    if (cal.dom === 1) SIM.monthly(W);
    const pop = W.npcs.filter(n => !n.dead).length;
    if (Array.isArray(W.sect.reservePets) && W.sect.reservePets.length > 0) {
      for (let rpi = W.sect.reservePets.length - 1; rpi >= 0; rpi--) {
        const rPet = W.sect.reservePets[rpi];
        if (!rPet || rPet.dead) { W.sect.reservePets.splice(rpi, 1); continue; }
        const adopter = W.npcs.find(cand => cand && !cand.dead && !cand.exiled && !cand.away && (!Array.isArray(cand.pets) || cand.pets.length === 0) && (
          (rPet.formerOwnerId && (cand.mentor === rPet.formerOwnerId || cand.mentorId === rPet.formerOwnerId || cand.companionId === rPet.formerOwnerId)) ||
          (cand.cult && ['BEAST_SOVEREIGN', 'PRIMORDIAL_SHIFTER', 'SPIRIT_HUSBANDRY', 'WILDERNESS_RANGER'].includes(cand.cult.path)) ||
          ((cand.h && cand.h.skills && (cand.h.skills.BEAST_TAMING || 0) >= 25))
        ));
        if (adopter) {
          W.sect.reservePets.splice(rpi, 1);
          rPet.active = true;
          rPet.ownerId = adopter.id;
          adopter.pets = Array.isArray(adopter.pets) ? adopter.pets : [];
          adopter.pets.push(rPet);
          adopter.pet = rPet;
          W.log('craft', adopter.h.name.given + ' รับสืบทอดสัตว์วิญญาณสำรอง「' + (rPet.nameTh || rPet.name || 'สัตว์อสูร') + '」มาดูแลต่อ', [adopter.id]);
        }
      }
    }
    if (ECO.count(W, 'meal') + ECO.count(W, 'grain') * 3 < pop * 1.5 && W.sect.stones > 200 && !W.threat.roadBlocked) { const n = Math.round(pop * 4); const c = Math.round(ECO.price(W, 'grain') * 1.3 * n); if (W.sect.stones >= c) { ECO.pay(W, c, 'ซื้อข้าวฉุกเฉิน', { toPool: true }); ECO.add(W, 'grain', n); W.log('finance', 'เสบียงใกล้หมด หอคลังซื้อข้าวฉุกเฉิน ' + n + ' กระสอบ', [], { txKind: 'purchase', itemId: 'grain', qty: n }); } }
    if (W.day % 30 === 15) W.npcs.forEach(n => { if (!n.dead) n.h.state.novelty = Math.max(0, n.h.state.novelty - 3); });
    if (g.EXPED && g.EXPED.dailyChronicleDigestTick) g.EXPED.dailyChronicleDigestTick(W);
  };
  SIM.monthly = W => {
    SECT.monthly(W); EXPED.caravan(W);
    if (EXPED && EXPED.tickWanderingFigures) EXPED.tickWanderingFigures(W);
    if (EXPED && EXPED.tickForeignSectCognitionTiers) EXPED.tickForeignSectCognitionTiers(W);
    if (SECT && SECT.tickCompanionsAndOffspring) SECT.tickCompanionsAndOffspring(W);
    if (SECT && SECT.FENG_SHUI && SECT.FENG_SHUI.tick) SECT.FENG_SHUI.tick(W);
    if (SECT && SECT.HEART_DEMON && SECT.HEART_DEMON.tick) SECT.HEART_DEMON.tick(W);
    if (SECT && SECT.CARAVAN_AUCTION && SECT.CARAVAN_AUCTION.tick) SECT.CARAVAN_AUCTION.tick(W);
    if (SECT && SECT.ELDER_COUNCIL_EDICTS && SECT.ELDER_COUNCIL_EDICTS.tick) SECT.ELDER_COUNCIL_EDICTS.tick(W);
    if (SECT && SECT.SECRET_REALM_NODES && SECT.SECRET_REALM_NODES.tick) SECT.SECRET_REALM_NODES.tick(W);
    if (SECT && SECT.GRAND_ASSEMBLY_BANQUET && SECT.GRAND_ASSEMBLY_BANQUET.tick) SECT.GRAND_ASSEMBLY_BANQUET.tick(W);
    if (SECT && SECT.HEAVENLY_DAO_DIRECTOR && SECT.HEAVENLY_DAO_DIRECTOR.tick) SECT.HEAVENLY_DAO_DIRECTOR.tick(W);
    if (SECT && SECT.PEAKS && SECT.PEAKS.tick) SECT.PEAKS.tick(W);
    if (SECT && SECT.CELESTIAL_ALIGNMENTS) {
      if (SECT.CELESTIAL_ALIGNMENTS.tickMonthlyCycle) SECT.CELESTIAL_ALIGNMENTS.tickMonthlyCycle(W);
      else if (SECT.CELESTIAL_ALIGNMENTS.tick) SECT.CELESTIAL_ALIGNMENTS.tick(W);
    }
    if (CULT && CULT.MORTAL_INITIATION) {
      CULT.MORTAL_INITIATION.monthlyTick(W);
    }
    if (SECT && SECT.INFERNAL_SHRINE && SECT.INFERNAL_SHRINE.monthlyTick) {
      SECT.INFERNAL_SHRINE.monthlyTick(W);
    }
    if (CULT && CULT.tickMonthlyWorldHooks) {
      CULT.tickMonthlyWorldHooks(W);
    }
    if (Array.isArray(W.npcs) && (Array.isArray(W.graveyard) || Array.isArray(W.gone))) {
      const deadSet = new Set([...(W.graveyard || []).map(x => typeof x === 'string' ? x : (x && x.id)), ...(W.gone || [])]);
      if (deadSet.size > 0) {
        for (let ni = 0; ni < W.npcs.length; ni++) {
          const u = W.npcs[ni];
          const rels = u && u.h && u.h.mind && u.h.mind.relations;
          if (!rels) continue;
          const fam = (u.h.life && u.h.life.family) || {};
          for (const rid of Object.keys(rels)) {
            if (!deadSet.has(rid)) continue;
            const r = rels[rid];
            if (!r || r.bond) continue;
            if (u.companionId === rid || u.mentorId === rid || u.mentor === rid || fam.spouse === rid || fam.master === rid) continue;
            if (Array.isArray(fam.parents) && fam.parents.includes(rid)) continue;
            if (Array.isArray(fam.children) && fam.children.includes(rid)) continue;
            if (Array.isArray(fam.disciples) && fam.disciples.includes(rid)) continue;
            if (Math.abs(r.a || 0) < 25 && (r.v || 0) < 25 && (r.l || 0) < 25 && (r.n || 0) <= 3) {
              delete rels[rid];
            }
          }
        }
      }
    }
  };
  SIM.guardRoster = W => {
    const pop = W.npcs.filter(n => !n.dead).length; const k = 2 + Math.floor(pop / 14);
    const pool = W.npcs.filter(n => !n.dead && !n.away && n.rank >= 1 && n.rank <= 3 && !(n.inj && n.inj.length) && !n.sealed && !(n.ext && n.ext.longevity && n.ext.longevity.stasis) && !(SECT && SECT.isNpcDetained && SECT.isNpcDetained(W, n)));
    const scored = pool.map(n => ({ n, score: AI.dutyWeight(n) + W.rng.next() * 0.8 }));
    scored.sort((a, b) => b.score - a.score);
    W.sect.guardRoster = scored.slice(0, k).map(x => x.n.id);
  };
  SIM.assistants = W => {
    ['alchemy', 'forge'].forEach(h => {
      const cur = W.npcs.filter(n => !n.dead && n.assist === h);
      cur.forEach(n => { if (n.post) n.assist = null; });
      const have = W.npcs.filter(n => !n.dead && n.assist === h).length;
      if (have < 2) { let bestC = null, bestRel = 18; for (let i = 0; i < W.npcs.length; i++) { const n = W.npcs[i]; if (!n.dead && !n.away && n.rank >= 1 && n.rank <= 3 && !n.assist && !n.post && !(n.ext && n.ext.longevity && n.ext.longevity.stasis)) { const rel = SECT.relevance(h, n); if (rel > bestRel) { bestRel = rel; bestC = n; } } } if (bestC) bestC.assist = h; }
    });
  };
  SIM.researchTick = W => {
    const S = W.sect; if (!S.research) return; const head = W.byId[S.research.lead];
    const bestCraftSk = head && !head.dead ? Math.max(head.h.skills.ALCHEMY || 0, head.h.skills.FORGING || 0, head.h.skills.ARRAY || 0, head.h.skills.TALISMAN || 0) : 0;
    const r = (head && !head.dead ? (E(head, 'intellect.comprehension') + (head.h.skills.SCRIPTURE || 0) + bestCraftSk) / 10 : 4) * (1 + 0.1 * (W.map.byId.scripture.level - 1)) * (1 + S.policy.focus.scholar);
    S.research.progress += r;
    if (S.research.progress >= S.research.need) { S.recipeTier = S.research.tier; W.log('research', 'หอคัมภีร์วิจัยตำรับระดับ ' + S.recipeTier + ' สำเร็จ! หอโอสถและโรงหลอมผลิตของใหม่ได้', head ? [head.id] : []); W.fame(2); if (head) { head.merit += 30; HC.experience(head, 'craft_success', 1); } S.research = null; }
  };

  /* ---------- บันทึก/โหลด ---------- */
  SIM.serialize = W => {
    if (W && Array.isArray(W.npcs)) { for (let i = 0; i < W.npcs.length; i++) { if (W.npcs[i]) { W.npcs[i]._cultRateBase = null; W.npcs[i]._autoWalkRateC = null; W.npcs[i]._mantraResCache = null; W.npcs[i]._qgTickCache = null; W.npcs[i]._wsBase = null; W.npcs[i]._c = null; W.npcs[i]._d = null; if (g.CULT && g.CULT.ELEM && g.CULT.ELEM.invalidateNpcCache) g.CULT.ELEM.invalidateNpcCache(W.npcs[i]); } } }
    const M = W.map;
    const snap = {
      ...(W._saveExtras || {}),
      schemaVersion: SIM.SAVE_SCHEMA_VERSION,
      patchVersion: SIM.PATCH_VERSION,
      celestialAlignment: W.celestialAlignment || null,
      celestialEvent: W.celestialEvent || null,
      wildlife: W.wildlife,
      wildResources: W.wildResources,
      fishing: W.fishing,
      v: SIM.VERSION,
      runtimeTiming: W.runtimeTiming,
      hc: HC.FINGERPRINT,
      seed: W.seed,
      t: W.t,
      workSteps: W.workSteps || 0,
      timePhase: W.timePhase || 0,
      speed: W.speed,
      rng: W.rng.getState(),
      seqN: W.seqN,
      logSeq: W.logSeq,
      deaths: W.deaths,
      avgSat: W.avgSat,
      avgMood: W.avgMood,
      weather: W.weather,
      market: W.market,
      sect: W.sect,
      world: W.world,
      threat: W.threat,
      explore: W.explore,
      npcs: W.npcs,
      graveyard: W.graveyard,
      gone: W.gone,
      logs: W.logs.slice(-600),
      duelQueue: W.duelQueue,
      fights: W.fights,
      foes: W.foes,
      foeSeq: W.foeSeq,
      fightSeq: W.fightSeq,
      map: { mapW: M.W, mapH: M.H, extra: M.extraSt || [], buildings: M.buildings.map(b => ({ id: b.id, level: b.level, hp: b.hp, building: b.building || null })) }
    };
    const transientSet = SIM.TRANSIENT_CACHE_KEYS;
    const PERSISTED_UNDERSCORE_KEYS = new Set(['_ver', '_stSig', '_btBonusPct', '_dantianBonusPct', '_saveExtras', '_divineStrain', '_studyHrsAcc', '_gatherHrsAcc', '_gravityFieldCdUntil', '_duetCdUntil', '_ccImmuneUntil', '_itemEfxCds', '_beastFusedUntil', '_lastGearSwapAt', '_lastExchangeDay', '_lastCaravanDay', '_lastTemperDay', '_stockSeq', '_officeOrderSeq', '_activeStance', '_combatStance', '_kwAdaptiveStacks', '_kwAdaptiveElem', '_kwAdaptiveUntil', '_absorbReleaseStored', '_statusTransferCd', '_tempoStealCd', '_lastHarvestedDay', '_lastSeasonalHarvestPeriod', '_fromRuneSocket', '_fromTierRoll', '_modVer', '_origFigureId', '_recruitedFromSectTh', '_renegadeTitleTh', '_phoenixClauseReady', '_phoenixClauseUsed', '_phoenixRebirthUsed', '_signalJamActiveUntil', '_emergencyBeaconActiveUntil', '_veinAnchoredUntil', '_beastSpiritPossessedUntil', '_possessedPetSnapshot', '_initChronicleDone', '_raidEndProcessed', '_hasCatalysts', '_marksmanFocus', '_lastBreathUsedFightId', '_temporalRewindCdUntil', '_aegisInterceptCdUntil', '_elemAuras', '_poiseGauge', '_ccDrStacks', '_ccDrUntil', '_shadowClones', '_boneArmorHp', '_supHealIcd', '_cheatDeathSavesCount', '_cheatDeathFightId', '_salvaged', '_lastStepTick', '_lastSupportBlessAt', '_lastUrgentBnAt', '_lastAegisInterceptTick', '_lastDodgeOrParryAt', '_lastTacLogAt', '_roundStartFired', '_lastTabooCostTick', '_lastAttackElement', '_unitFirstStrikeDone', '_closedOnBy', '_gapClosedOn', '_traitCds', '_lastSovCutInTick', '_cocoonUsedInFight', '_cocoonStasisUntil', '_lastChronoRewindTick', '_pendingChronoEcho', '_tcmbFlow', '_woundLedgerPool', '_chronoBookmarks', '_castCounter', '_basePreTranscendent', '_lastSpiritBeastCrucibleGain', '_necroFallen', '_necroSynced', '_necroSnap', '_necroHauntAt']);
    return JSON.stringify(snap, (k, v) => (transientSet.has(k) || (k[0] === '_' && !PERSISTED_UNDERSCORE_KEYS.has(k))) ? undefined : v);
  };
  SIM.deserialize = str => {
    const s = JSON.parse(str);
    const object = v => v != null && typeof v === 'object' && !Array.isArray(v);
    const invalid = field => { throw new Error('ข้อมูลเซฟไม่ถูกต้อง: ' + field); };
    if (!object(s)) invalid('save');
    if (s.hc && s.hc !== HC.FINGERPRINT) throw new Error('เซฟนี้สร้างจากแกนมนุษย์คนละเวอร์ชัน (' + s.hc + ' ≠ ' + HC.FINGERPRINT + ')');
    const SUPPORTED_SAVE_SCHEMAS = new Set([
      SIM.SAVE_SCHEMA_VERSION,
      '3.9.5-witnesses-and-12shards',
      '3.9.4-living-institutions-and-cycles',
      '3.9.3-grand-lore-canon-104books',
      '3.9.2-grand-lore-unification-96books',
      '3.9.1-audit-hardening-and-90book-ui',
      '3.9.0-political-lives-and-external-institutions',
      '3.8.6-90book-grand-lore-archive',
      '3.8.5-lore-continuity-canon-hardening',
      '3.8.4-grand-lore-44books',
      '3.8.3-grand-lore-chronicles',
      '3.8.2-chaos-era-lore-archive',
      '3.8.1-world-calendar-epoch',
      '3.8.0-master-lore-compendium',
      '3.7.0c-final-polish',
      '3.7.0b-p1-realism-polish',
      '3.7.0a-p0-audit-fixes',
      '3.7.0-legendary-dao',
      '3.6.0c-living-world-audit',
      '3.6.0b-living-polities',
      '3.6.0a-living-sects',
      '3.5.0c-release-polish',
      '3.5.0b-p1-hardening',
      '3.5.0a-p0-hardening',
      '3.4.0-world-events',
      '3.3.0-tactical-sixpaths',
      '3.2.0-equipment-expansion',
      '3.1.0-living-lore',
      '3.0.0-living-continent',
      '2.6.0-living-chronicle-and-reporting',
      '2.5.0-pathbound-visuals-and-item-art',
      '2.4.0-tactical-composable-grand-dao',
      '2.3.0-grand-dao-deep-parity-release',
      '2.2.0-cosmic-pantheon-shinobi-manual-lifecycle',
      '2.1.0-grand-dao-debates-apex-trials',
      '2.0.0-grand-dao-epoch-mortal-awakening',
      '5.8.0-forbidden-arts-passive-awakening-and-blood-altar',
      '5.7.0-support-and-auxiliary-arts-overhaul',
      '5.6.0-defensive-kungfu-and-aegis-overhaul',
      '5.5.0-mantra-resonance-and-formation-warfare',
      '5.4.0-qinggong-movement-and-flight',
      '5.3.0-heavenly-tribulation-and-skill-vfx',
      '5.2.0-subtabs-and-world-visuals',
      '5.1.0-interactive-visual-dioramas',
      '5.0.0-celestial-visual-overhaul',
      '4.1.0-sect-expansion-and-architecture',
      '4.0.0-living-frontier-charter',
      '3.6.0-immortal-endgame-dynasty',
      '3.5.0-macro-jianghu-and-alchemy',
      '3.4.0-combat-depth-and-duet-synergies',
      '3.3.0-living-sect-and-daily-loop',
      '3.2.0-dormant-awakening',
      '3.1.0-autonomous-governance-peaks'
    ]);
    if (s.schemaVersion != null) {
      if (typeof s.schemaVersion !== 'string' || !SUPPORTED_SAVE_SCHEMAS.has(s.schemaVersion)) {
        throw new Error('ไฟล์เซฟสร้างจาก Schema เวอร์ชันที่ใหม่กว่าหรือไม่รองรับ (' + s.schemaVersion + ' > ' + SIM.SAVE_SCHEMA_VERSION + ') ไม่สามารถโหลดได้');
      }
    }
    if (s.patchVersion != null) {
      if (typeof s.patchVersion !== 'string' || (s.patchVersion !== SIM.PATCH_VERSION && !SIM.SUPPORTED_PATCHES.includes(s.patchVersion))) {
        throw new Error('ไฟล์เซฟสร้างจาก Patch เวอร์ชันที่ใหม่กว่าหรือไม่รองรับ (' + s.patchVersion + ' > ' + SIM.PATCH_VERSION + ') ไม่สามารถโหลดได้');
      }
    }
    if (s.v != null) {
      if (typeof s.v !== 'string' || !/^\d+\.\d+(\.\d+)?$/.test(s.v) || parseFloat(s.v) > 2) {
        throw new Error('ไฟล์เซฟสร้างจากเกมเวอร์ชันที่ใหม่กว่าหรือไม่รองรับ (' + s.v + ' > ' + SIM.VERSION + ') ไม่สามารถโหลดได้');
      }
    }
    if (typeof s.seed !== 'string' && !Number.isFinite(s.seed)) invalid('seed');
    if (!Number.isSafeInteger(s.t) || s.t < 0) invalid('t');
    for (const key of ['seqN', 'logSeq']) if (!Number.isSafeInteger(s[key]) || s[key] < 0) invalid(key);
    if (!Array.isArray(s.rng) || s.rng.length !== 4 || !s.rng.every(Number.isInteger)) invalid('rng');
    if (s.speed != null && (!Number.isFinite(s.speed) || s.speed < 0)) invalid('speed');
    for (const key of ['sect', 'world', 'market', 'weather', 'threat', 'map']) if (!object(s[key])) invalid(key);
    if (!Number.isFinite(s.sect.stones) || s.sect.stones < 0) invalid('sect.stones');
    if (s.sect.stock != null) {
      if (!object(s.sect.stock)) invalid('sect.stock');
      for (const [mk, mv] of Object.entries(s.sect.stock)) {
        if (mv != null && (typeof mv !== 'number' || !Number.isFinite(mv) || mv < 0 || mv > Number.MAX_SAFE_INTEGER)) invalid('sect.stock.' + mk);
      }
    }
    for (const key of ['npcs', 'logs', 'graveyard', 'gone']) if (!Array.isArray(s[key])) invalid(key);
    for (const key of ['buildings', 'extra']) if (!Array.isArray(s.map[key])) invalid('map.' + key);
    for (const key of ['duelQueue', 'fights', 'foes']) if (s[key] != null && !Array.isArray(s[key])) invalid(key);
    const npcIds = new Set();
    s.npcs.forEach(n => {
      if (!object(n) || typeof n.id !== 'string' || !n.id || npcIds.has(n.id)) invalid('npcs.id');
      if (n.cult != null) {
        if (!object(n.cult)) invalid('npcs.cult');
        const maxSt = (CULT && CULT.PATHS && n.cult.path && CULT.PATHS[n.cult.path] && CULT.PATHS[n.cult.path].maxStage) || 12;
        if (!Number.isInteger(n.cult.stage) || n.cult.stage < 1 || n.cult.stage > Math.max(12, maxSt)) invalid('npcs.cult.stage');
      }
      npcIds.add(n.id);
    });
    if (s.npcs.length > 0 && s.sect.masterId != null) {
      const inGrave = Array.isArray(s.graveyard) && s.graveyard.some(g2 => (typeof g2 === 'string' ? g2 === s.sect.masterId : g2 && g2.id === s.sect.masterId));
      if (typeof s.sect.masterId !== 'string' || (!npcIds.has(s.sect.masterId) && !inGrave)) invalid('sect.masterId');
    }
    const hadDay = Object.prototype.hasOwnProperty.call(HC, 'nowDay'), dayBefore = HC.nowDay;
    const hadSeason = Object.prototype.hasOwnProperty.call(HC, 'nowSeason'), seasonBefore = HC.nowSeason;
    const stats = g.STATS, hadStatsTime = stats && Object.prototype.hasOwnProperty.call(stats, 'now'), statsTimeBefore = stats && stats.now;
    const prevBoundWorld = ECO ? ECO._boundWorld : null;
    try {
      const W = SIM.create(s.seed, { masterIdx: 0 });
      W.rng.setState(s.rng); W.t = s.t; if (g.STATS) g.STATS.now = W.t; W.day = Math.floor(W.t / 1440); W.season = SIM.calendar(W.t).season; HC.nowDay = W.day; HC.nowSeason = W.season; W.speed = s.speed == null ? 1 : s.speed; W.seqN = s.seqN; W.logSeq = s.logSeq; W.deaths = s.deaths; W.avgSat = s.avgSat; W.avgMood = s.avgMood; W.weather = s.weather; W.market = s.market; W.sect = s.sect; if (W.sect && !Array.isArray(W.sect.trackedNpcIds)) W.sect.trackedNpcIds = []; W.world = s.world;
      if (!Array.isArray(W.world.chronicles)) W.world.chronicles = Array.isArray(W.chronicle) ? W.chronicle : [];
      W.chronicle = W.world.chronicles; W.threat = s.threat; if (s.explore) W.explore = s.explore; W.graveyard = s.graveyard; W.gone = s.gone; W.logs = s.logs; W.duelQueue = s.duelQueue || []; W.fights = s.fights || []; W.foes = s.foes || []; W.foeSeq = s.foeSeq; W.fightSeq = s.fightSeq;
      W.foeById = {}; W.foes.forEach(u => W.foeById[u.id] = u);
      W.wildlife = s.wildlife || { seq: 0, beasts: [], kills: 0 };
      W.wildlife.beasts = W.wildlife.beasts.map(b => W.foeById[b.id] || b);
      if (s.wildResources) W.wildResources = s.wildResources;
      if (s.fishing) W.fishing = s.fishing;
      W.npcs = s.npcs.map(n => {
        const base = { id: n.id, h: n.h, mods: n.mods || [], ext: n.ext || {}, _ver: (n._ver != null ? n._ver : 1), _c: null, _d: null };
        for (const k of Object.keys(n)) {
          if (!(k in base) && !SIM.TRANSIENT_CACHE_KEYS.has(k)) base[k] = n[k];
        }
        return base;
      });
      W.byId = {}; W.npcs.forEach(n => { W.byId[n.id] = n; if (g.MARTIAL && g.MARTIAL.ensureSkills) g.MARTIAL.ensureSkills(n); });
      const M = W.map; M.extraSt = [];
      s.map.buildings.forEach(sb => { const b = M.byId[sb.id]; if (b) { b.level = sb.level; b.hp = sb.hp; b.building = sb.building; } });
      s.map.extra.forEach(e => { if (!object(e)) invalid('map.extra'); const b = M.buildings.find(x => x.n === e.bid); if (!b) invalid('map.extra.bid'); const st = { id: M.stations.length, bid: e.bid, bkey: b.id, kind: e.kind, x: e.x, y: e.y, inside: e.inside, occ: null, n: b.stations.length }; M.stations.push(st); b.stations.push(st.id); M.extraSt.push(e); });
      M.stations.forEach(st => { st.occ = null; if (st.owner != null) st.owner = null; });
      M.buildings.forEach(b => { b.inside = []; });
      W.npcs.forEach(n => { if (!Number.isFinite(n.px)) n.px = n.x; if (!Number.isFinite(n.py)) n.py = n.y; if (n.bed != null && M.stations[n.bed]) M.stations[n.bed].owner = n.id; if (n.act && n.act.st != null && M.stations[n.act.st]) { M.stations[n.act.st].occ = n.id; if (M.stations[n.act.st].inside) { M.buildings[M.stations[n.act.st].bid].inside.push(n.id); } } });
      EXPED.initContinent(W);
      (W.npcs || []).forEach(n => EXPED.assignHometown(W,n));
      W.log = (type, text, ids, meta) => SIM.log(W, type, text, ids, meta); W.fame = v => { W.sect.fame = Math.max(0, (W.sect.fame || 0) + v); }; W.makeNpc = o => SIM.addNpc(W, o);
      const knownKeys = new Set(['v', 'schemaVersion', 'patchVersion', 'celestialAlignment', 'celestialEvent', 'hc', 'seed', 't', 'workSteps', 'timePhase', '_lastWildTickT', '_lastHourlyUpdateT', '_lastDailyUpdateDay', 'speed', 'rng', 'seqN', 'logSeq', 'deaths', 'avgSat', 'avgMood', 'weather', 'market', 'sect', 'world', 'threat', 'explore', 'npcs', 'graveyard', 'gone', 'logs', 'duelQueue', 'fights', 'foes', 'foeSeq', 'fightSeq', 'map', 'runtimeTiming', 'wildlife', 'wildResources', 'fishing']);
      if (s.celestialAlignment) W.celestialAlignment = s.celestialAlignment;
      if (s.celestialEvent) W.celestialEvent = s.celestialEvent;
      W._saveExtras = Object.fromEntries(Object.entries(s).filter(([k]) => !knownKeys.has(k)));
      if (s.runtimeTiming && typeof s.runtimeTiming === 'object') {
        W.runtimeTiming = Object.assign({}, s.runtimeTiming, {
          pendingTicks: Math.max(0, typeof s.runtimeTiming.pendingTicks === 'number' && Number.isFinite(s.runtimeTiming.pendingTicks) ? s.runtimeTiming.pendingTicks : 0)
        });
      }
      const legacyContent = !s.sect.contentVersion;
      if (legacyContent) W.npcs.forEach(n => {
        const a = n.act, ctx = a && a.ctx;
        if (a && ['brew', 'forge', 'brewBasic'].includes(a.id) && a.stage === 'do' && a.started2 && ctx && !ctx.craftReceipt) {
          const r = ECO.recipeById[ctx.rid]; if (r) ECO.adoptLegacyCraft(W, n, r, ctx);
        }
      });
      ECO.pruneCraftTransactions(W);
      if (ECO && ECO.resetDynamicItems) ECO.resetDynamicItems(W);
      else if (W.sect && W.sect.customPills && ECO) {
        Object.entries(W.sect.customPills).forEach(([pid, pdef]) => {
          if (ECO.v235ItemById) ECO.v235ItemById[pid] = pdef;
          if (ECO.itemById) ECO.itemById[pid] = pdef;
        });
      }
      if (g.SECT && g.SECT.ensureDirectives) g.SECT.ensureDirectives(W);
      if (g.SECT && g.SECT.ensureFacilityDemand) g.SECT.ensureFacilityDemand(W);
      if (g.ECO && g.ECO.ensureStockTracker) g.ECO.ensureStockTracker(W);
      if (g.CPE && g.CPE.S) g.CPE.S(W);
      g.CONTENT.ensure(W); W._founding = false;
      if (W.world && Array.isArray(W.world.allSects) && W.world.allSects.length > 0) {
        if (Array.isArray(W.world.sects)) {
          const byId = new Map(W.world.allSects.map(sc => [sc && sc.id, sc]));
          for (let si = 0; si < W.world.sects.length; si++) {
            const sc = W.world.sects[si];
            if (sc && sc.id && byId.has(sc.id)) W.world.sects[si] = byId.get(sc.id);
          }
        }
        W.world.jianghuSects = W.world.allSects;
      }
      g.MARTIAL.restore(W); if (g.FISHING) g.FISHING.ensure(W);
      if (g.SECT && g.SECT.PATH_LIBRARY) g.SECT.PATH_LIBRARY.ensure(W);
      if (g.SECT && g.SECT.INFERNAL_SHRINE) g.SECT.INFERNAL_SHRINE.ensure(W);
      if (g.CULT && g.CULT.GRAND_DAO_MECHANICS) g.CULT.GRAND_DAO_MECHANICS.ensureWorldState(W);
      if (g.CULT && g.CULT.MORTAL_INITIATION && Array.isArray(W.npcs)) {
        W.npcs.forEach(n => { if (n && !n.dead && !n.cult) g.CULT.MORTAL_INITIATION.ensureMortalState(n, W); });
      }
      if (W.sect && W.sect.delegations && typeof W.sect.delegations === "object") {
        for (const p of Object.keys(W.sect.delegations)) {
          const d = W.sect.delegations[p];
          if (!d || !W.byId[d.delegateId] || W.byId[d.delegateId].dead) delete W.sect.delegations[p];
        }
      }
      if (W.sect && Array.isArray(W.sect.petitions)) {
        W.sect.petitions = W.sect.petitions.filter(p => p && W.byId[p.npcId] && !W.byId[p.npcId].dead);
      }
      W.npcs.forEach(n => {
        if (n.cognition && typeof n.cognition === "object") {
          if (n.cognition.memory != null && !Array.isArray(n.cognition.memory)) n.cognition.memory = [];
          if (n.cognition.trace != null && !Array.isArray(n.cognition.trace)) n.cognition.trace = [];
          if (n.cognition.commitment && (!W.byId[n.cognition.commitment.partnerId] || W.byId[n.cognition.commitment.partnerId].dead)) n.cognition.commitment = null;
        }
      });
      if (W.sect && Array.isArray(W.sect.queue) && g.SECT && g.SECT.sanitizeQueue) g.SECT.sanitizeQueue(W);
      if (W.sect && Array.isArray(W.sect.queue)) W.sect.queue.forEach(a => { if (g.ELEM) g.ELEM.ensureNpcElementalState(a); if (HC.touch) HC.touch(a); });
      if (W.sect && Array.isArray(W.sect.beasts) && g.CULT && g.CULT.ensureMenagerie) g.CULT.ensureMenagerie(W);
      W.npcs.forEach(n => { if (g.ELEM) g.ELEM.ensureNpcElementalState(n); if ((Array.isArray(n.pets) || n.pet) && g.CULT && g.CULT.ensurePets) g.CULT.ensurePets(n); if (g.CULT && g.CULT.HIGHER_REALMS_PANTHEON && g.CULT.HIGHER_REALMS_PANTHEON.healPact) g.CULT.HIGHER_REALMS_PANTHEON.healPact(n); if (HC.touch) HC.touch(n); });
      if (ECO && ECO.ensureUniqueGearUids) ECO.ensureUniqueGearUids(W);
      if (g.SECT && g.SECT.ensureCompanionsAndBloodlines) g.SECT.ensureCompanionsAndBloodlines(W);
      if (g.SECT && g.SECT.FENG_SHUI && !W.sect.fengShui) g.SECT.FENG_SHUI.ensure(W);
      if (g.SECT && g.SECT.CARAVAN_AUCTION && (!W.world.marketIndex || !W.world.auctionHouse)) g.SECT.CARAVAN_AUCTION.ensure(W);
      if (g.SECT && g.SECT.ELDER_COUNCIL_EDICTS && !W.sect.edicts) g.SECT.ELDER_COUNCIL_EDICTS.ensure(W);
      if (g.SECT && g.SECT.SECRET_REALM_NODES && (!W.explore || !W.explore.nodeExpeditions)) g.SECT.SECRET_REALM_NODES.ensure(W);
      if (g.SECT && g.SECT.GRAND_ASSEMBLY_BANQUET && (!W.world || !W.world.grandAssembly)) g.SECT.GRAND_ASSEMBLY_BANQUET.ensure(W);
      if (g.SECT && g.SECT.HEAVENLY_DAO_DIRECTOR && (!W.world || !W.world.heavenlyDao)) g.SECT.HEAVENLY_DAO_DIRECTOR.ensure(W);
      if (g.SECT && g.SECT.PEAKS) g.SECT.PEAKS.ensure(W);
    if (g.SECT && g.SECT.ELEMENTAL_BARRIER) g.SECT.ELEMENTAL_BARRIER.ensure(W);
    if (g.MAP && g.MAP.syncPeakSanctuaries) g.MAP.syncPeakSanctuaries(W);
      if (g.SECT && g.SECT.ensureDungeon) g.SECT.ensureDungeon(W);
      if (g.SECT && g.SECT.ensureJurisdictionLog) g.SECT.ensureJurisdictionLog(W);
      if (g.SECT && g.SECT.TOTEMS_BLOODLINES) g.SECT.TOTEMS_BLOODLINES.ensure(W);
      if (g.SECT && g.SECT.CELESTIAL_ALIGNMENTS) g.SECT.CELESTIAL_ALIGNMENTS.ensure(W);
      if (g.SECT && g.SECT.DESTINY_KARMA) g.SECT.DESTINY_KARMA.ensure(W);
      if (g.SECT && g.SECT.LEYLINE_GRID) g.SECT.LEYLINE_GRID.ensure(W);
      if (g.SECT && g.SECT.TRIBUNAL) g.SECT.TRIBUNAL.ensure(W);
      if (g.SECT && g.SECT.AUTOMATION) g.SECT.AUTOMATION.ensure(W);
      if (g.SECT && g.SECT.ensureDefectorPursuit) g.SECT.ensureDefectorPursuit(W);
      if (g.SECT && g.SECT.ANCESTRAL_PAVILION) g.SECT.ANCESTRAL_PAVILION.ensure(W);
      if (g.SECT && g.SECT.OUTPOSTS_LOGISTICS) g.SECT.OUTPOSTS_LOGISTICS.ensure(W);
      if (g.SECT && g.SECT.CHARTER_DOCTRINE) g.SECT.CHARTER_DOCTRINE.ensure(W);
      if (g.SECT && g.SECT.STRATEGIC_COUNCIL) g.SECT.STRATEGIC_COUNCIL.ensure(W);
      if (g.EXPLORE && g.EXPLORE.ensureMicroLocations) g.EXPLORE.ensureMicroLocations(W);
      if (W.sect && W.sect.posts && g.SECT && Array.isArray(g.SECT.POST_IDS)) {
        g.SECT.POST_IDS.forEach(pid => {
          if (W.sect.posts[pid] === undefined) W.sect.posts[pid] = null;
        });
      }

      if (W.world && Array.isArray(W.world.wanderingFigures) && g.EXPED && g.EXPED.ensureWanderingFigures) g.EXPED.ensureWanderingFigures(W);
      if (W.world) {
        if (!W.world.resourcePool || typeof W.world.resourcePool !== "object") W.world.resourcePool = { stones: 50000, herbs: 5000, ores: 5000 };
        if (!Array.isArray(W.world.chronicles)) W.world.chronicles = Array.isArray(W.chronicle) ? W.chronicle : [];
        W.chronicle = W.world.chronicles;
      }
      if (g.EXPED && g.EXPED.ensureNewsSystem) g.EXPED.ensureNewsSystem(W);
      if (g.SECT && g.SECT.PEAKS) g.SECT.PEAKS._activeWorld = W;
      return W;
    } catch (error) {
      if (ECO && ECO.resetDynamicItems) ECO.resetDynamicItems(prevBoundWorld || (g.G && g.G.W) || undefined);
      if (hadDay) HC.nowDay = dayBefore; else delete HC.nowDay;
      if (stats) { if (hadStatsTime) stats.now = statsTimeBefore; else delete stats.now; }
      throw error;
    }
  };


  /* ---------- Deterministic Literary Prose Composer (14A/14B/14C — Zero W.rng) ---------- */
  SIM.PROSE = {
    pick(seedInt, variants) {
      if (!Array.isArray(variants) || !variants.length) return '';
      return variants[Math.abs(seedInt | 0) % variants.length];
    },
    actorLabel(W, n) {
      if (!n || !n.h) return 'ผู้ไร้นาม';
      const full = (g.HC && g.HC.fullName) ? g.HC.fullName(n) : ((n.h.name.family || '') + (n.h.name.given || ''));
      if (W && W.sect && W.sect.masterId === n.id) return 'เจ้าสำนัก ' + full;
      if (n.post && g.SECT && g.SECT.POSTS && g.SECT.POSTS[n.post]) {
        return g.SECT.POSTS[n.post].nameTh + ' ' + full;
      }
      const rkTitle = (g.SECT && g.SECT.RANKS && g.SECT.RANKS[n.rank]) ? g.SECT.RANKS[n.rank].nameTh : 'ศิษย์';
      return rkTitle + ' ' + full;
    },
    atmospherePrefix(W, seedInt) {
      const cal = SIM.calendar((W && W.t) || 0);
      const wKind = (W && W.weather && (W.weather.kind || W.weather)) || 'clear';
      const isNight = cal.hour >= 20 || cal.hour < 5;
      const isDawn = cal.hour >= 5 && cal.hour < 8;
      const seasonTh = (SIM.SEASON_TH && SIM.SEASON_TH[cal.season]) || 'วสันตฤดู';
      if (wKind === 'snow') return isNight ? 'ท่ามกลางหิมะโปรยปรายในคืนเหน็บหนาว ' : 'ใต้ละอองหิมะขาวเหนือยอดเขา ';
      if (wKind === 'rain') return isNight ? 'ท่ามกลางสายฝนพรำและเสียงฟ้าร้องยามวิกาล ' : 'ใต้สายฝนฉ่ำชื้นที่โปรยอาบอาราม ';
      if (wKind === 'fog') return 'ท่ามกลางม่านหมอกหนาที่ปกคลุมหุบเขา ';
      if (isDawn) return 'รับแสงอรุณแรกแห่ง' + seasonTh + ' ';
      if (isNight) return 'ภายใต้แสงจันทร์เงียบสงัดยามรัตติกาล ';
      return this.pick(seedInt, [
        'ณ ยามสายลมปราณพัดผ่านยอดเขา ',
        'ท่ามกลางบรรยากาศอันคึกคักของ' + seasonTh + ' ',
        'ภายใต้ท้องฟ้ากระจ่างเหนือขุนเขา '
      ]);
    },
    oddsDramaPhrase(ok, chancePct) {
      const pct = Number.isFinite(chancePct) ? Math.round(chancePct) : 50;
      if (ok) {
        if (pct <= 30) return 'ฝืนชะตาฟ้าสำเร็จราวปาฏิหาริย์ ทั้งที่มีโอกาสเพียงริบหรี่ (' + pct + '%)';
        if (pct <= 55) return 'กัดฟันฝ่าวิกฤตห้าสิบห้าสิบไปได้อย่างหวุดหวิด (โอกาส ' + pct + '%)';
        if (pct >= 85) return 'ทะลวงผ่านอย่างมั่นคงไร้ข้อกังขาสมดังที่เตรียมการไว้พร้อมสรรพ (โอกาส ' + pct + '%)';
        return 'โคจรปราณฝ่าด่านสำเร็จลุล่วง (โอกาส ' + pct + '%)';
      } else {
        if (pct >= 78) return 'เกิดเหตุพลิกผันน่าตกตะลึง พลาดท่าล้มเหลวทั้งที่มีโอกาสสูงถึง ' + pct + '%!';
        if (pct <= 35) return 'ไม่อาจฝืนกำแพงคอขวดอันสูงชันไปได้ตามคาด (โอกาสเพียง ' + pct + '%)';
        return 'ปราณสะดุดกลางคันจนด่านตบะตีกลับ (โอกาส ' + pct + '%)';
      }
    },
    pathFamily(pathId) {
      const p = String(pathId || 'XIAN');
      if (['XIAN', 'CELESTIAL_WEATHER', 'TIDE_VOYAGER', 'SPIRIT_HUSBANDRY'].includes(p)) return 'QI_IMMORTAL';
      if (['BODY', 'ARENA_GLORY', 'PRIMORDIAL_SHIFTER'].includes(p)) return 'BODY_CRUCIBLE';
      if (['GOD', 'DIVINE_SUMMONER', 'DIVINE_POSSESSION', 'DIVINE_CHANNELER', 'ANCESTRAL_RITUAL'].includes(p)) return 'DIVINE_FAITH';
      if (['DEMON', 'VENOM_GU', 'DEVOURING_FLESH', 'NETHER_GRAVE', 'VOID_HERETIC_PACT', 'OCCULT_MAGE', 'CORPSE_SOVEREIGN', 'WRAITH_GRIEVANCE', 'DEATHLESS_CADAVER'].includes(p)) return 'DEMON_ABYSS';
      if (['BUDDHA_DHARMA', 'HEART_SOUL', 'KARMA_SAMSARA', 'SOUL_PUPPETRY'].includes(p)) return 'DHARMA_SOUL';
      if (['INK_LITERATI', 'LORE_ARCHIVIST', 'SONIC_HARMONY', 'STRATEGY_GOVERNANCE', 'MERCANTILE_DAO', 'FORTUNE_GAMBLER', 'WANDERING_DAO'].includes(p)) return 'SCHOLAR_HARMONY';
      if (['SHADOW_SAMURAI', 'NINPO_SHADOW', 'NINPO_ELEMENTAL'].includes(p)) return 'BUSHIDO_SHINOBI';
      if (['CRAFT_CREATION', 'MECH_PUPPET', 'ARRAY_TALISMAN', 'SAGE_SUPPORT', 'BEAST_SOVEREIGN'].includes(p)) return 'ARTIFICER_SAGE';
      return 'COSMIC_LAW';
    },
    awakenProse(W, n, pathNameTh) {
      const seed = ((n && n.n) || 1) + ((W && W.t) || 0);
      const atm = this.atmospherePrefix(W, seed);
      const lbl = this.actorLabel(W, n);
      const fam = this.pathFamily(n && n.cult && n.cult.path);
      const pName = pathNameTh || 'วิถีเซียน';
      if (fam === 'BODY_CRUCIBLE') {
        return atm + 'เสียงกระดูกและเส้นเอ็นของ ' + lbl + ' ลั่นสะท้านดั่งสายธนูตึงตัว! เลือดลมในกายเดือดพล่านหลอมรวมเป็นปราณโลหิต ก้าวพ้นสังขารคนสามัญเข้าสู่วิถี「' + pName + '」สำเร็จ!';
      }
      if (fam === 'BUSHIDO_SHINOBI') {
        return atm + 'แม้ไร้จุดตันเถียนกักปราณเยี่ยงเซียนทั่วไป แต่ ' + lbl + ' ตวัดคมดาบซ้ำแล้วซ้ำเล่าจนจิตสังหารและลมหายใจรวมเป็นหนึ่งเดียว ก้าวเข้าสู่วิถี「' + pName + '」ด้วยเจตจำนงเหล็กกล้าสำเร็จ!';
      }
      if (fam === 'DHARMA_SOUL' || fam === 'SCHOLAR_HARMONY') {
        return atm + 'ทะเลสำนึกของ ' + lbl + ' พลันสว่างกระจ่างดั่งกระจกไร้ฝุ่น ตื่นรู้สัจธรรมเบื้องต้นและเบิกเนตรวิญญาณเข้าสู่วิถี「' + pName + '」สำเร็จ!';
      }
      if (fam === 'DEMON_ABYSS') {
        return atm + 'กลิ่นอายเย็นเยียบแผ่ซ่านออกจากร่างของ ' + lbl + ' ดวงตาฉายประกายอำมหิตหลังกลืนกินปราณหยินเปิดชีพจรต้องห้าม ก้าวเข้าสู่วิถี「' + pName + '」สำเร็จ!';
      }
      return atm + lbl + ' ชักนำปราณฟ้าดินสายแรกทะลวงจุดตันเถียนที่ปิดตายมาแต่กำเนิดได้สำเร็จ! ไอขุ่นปุถุชนถูกขับออกทางรูขุมขน ก้าวเท้าเข้าสู่ทำเนียบผู้บำเพ็ญ「' + pName + '」อย่างเต็มภาคภูมิ';
    },
    breakthroughProse(W, n, ok, chancePct, stageNameTh, died) {
      const seed = ((n && n.n) || 1) + ((W && W.t) || 0);
      const atm = this.atmospherePrefix(W, seed);
      const lbl = this.actorLabel(W, n);
      const fam = this.pathFamily(n && n.cult && n.cult.path);
      const drama = this.oddsDramaPhrase(ok, chancePct);
      const stg = stageNameTh || 'ขั้นถัดไป';
      if (ok) {
        const mapOk = {
          QI_IMMORTAL: lbl + ' ชักนำกระแสปราณฟ้าดินหมุนวนเก้ารอบ ทะลวงสู่ ' + stg + ' สำเร็จ! กลิ่นอายปราณบริสุทธิ์พวยพุ่งเหนือยอดเขา — ' + drama,
          BODY_CRUCIBLE: lbl + ' คำรามก้องฟ้า ใช้เลือดเนื้อรับแรงบดขยี้จนกระดูกผลัดเปลี่ยนสีทองคำ ทะลวงสู่ ' + stg + ' สำเร็จ! — ' + drama,
          DIVINE_FAITH: lbl + ' อาบแสงควันธูปและเสียงกังวานจากฟากฟ้า ขยายภาชนะวิญญาณ ทะลวงสู่ ' + stg + ' สำเร็จ! — ' + drama,
          DEMON_ABYSS: lbl + ' กลืนกินไออาฆาตและเสียงกระซิบมืดมิด ฉีกกระชากโซ่ตรวนคอขวด ทะลวงสู่ ' + stg + ' สำเร็จ! — ' + drama,
          DHARMA_SOUL: lbl + ' สยบมารในใจจนนิ่งสงบดั่งสระบัวไร้ระลอกคลื่น บรรลุญาณทัศนะ ทะลวงสู่ ' + stg + ' สำเร็จ! — ' + drama,
          SCHOLAR_HARMONY: lbl + ' ร้อยเรียงสัจธรรมแห่งโลกหล้าเข้าเป็นหนึ่งเดียว ทะลวงสู่ ' + stg + ' สำเร็จ! ท่ามกลางเสียงกังวานแห่งมรรคา — ' + drama,
          BUSHIDO_SHINOBI: lbl + ' นั่งขัดสมาธิสงบนิ่งก่อนชักดาบผ่าอากาศสะบั้นความลังเลในใจ ทะลวงสู่ ' + stg + ' สำเร็จ! — ' + drama,
          ARTIFICER_SAGE: lbl + ' ประสานเพลิงปราณและผังค่ายกลเข้ากับชีพจรตนเอง ทะลวงสู่ ' + stg + ' สำเร็จ! — ' + drama,
          COSMIC_LAW: lbl + ' สัมผัสระลอกคลื่นกฎฟ้าดินใต้ผืนม่านภพ บิดเกลียวปราณ ทะลวงสู่ ' + stg + ' สำเร็จ! — ' + drama
        };
        return atm + (mapOk[fam] || mapOk.QI_IMMORTAL);
      } else {
        const injSuffix = 'บาดเจ็บ' + (died ? ' ถึงแก่ชีวิต' : '');
        const mapFail = {
          QI_IMMORTAL: lbl + ' ทะลวงขั้นล้มเหลว (' + drama + ') กระแสปราณในตันเถียนปั่นป่วนตีกลับจนกระอักโลหิต ' + injSuffix,
          BODY_CRUCIBLE: lbl + ' ทะลวงขั้นล้มเหลว (' + drama + ') เส้นเอ็นและกล้ามเนื้อปริแตกจากแรงอัดปราณโลหิตเกินพิกัด ' + injSuffix,
          DIVINE_FAITH: lbl + ' ทะลวงขั้นล้มเหลว (' + drama + ') กายเนื้อรับแรงกดดันเทวานุภาพไม่ไหวจนวิญญาณสั่นคลอน ' + injSuffix,
          DEMON_ABYSS: lbl + ' ทะลวงขั้นล้มเหลว (' + drama + ') พิษมารและจิตคลุ้มคลั่งย้อนกัดกินอวัยวะภายใน ' + injSuffix,
          DHARMA_SOUL: lbl + ' ทะลวงขั้นล้มเหลว (' + drama + ') ภาพมายาและวิบากในใจปะทุขึ้นรบกวนสมาธิจนทะเลสำนึกร้าวฉาน ' + injSuffix,
          SCHOLAR_HARMONY: lbl + ' ทะลวงขั้นล้มเหลว (' + drama + ') คำนวณจังหวะฟ้าดินคลาดเคลื่อนไปเพียงเสี้ยวลมหายใจ ' + injSuffix,
          BUSHIDO_SHINOBI: lbl + ' ทะลวงขั้นล้มเหลว (' + drama + ') จังหวะลมหายใจสะดุดกลางคันจนคมเจตจำนงย้อนบาดตนเอง ' + injSuffix,
          ARTIFICER_SAGE: lbl + ' ทะลวงขั้นล้มเหลว (' + drama + ') สมดุลธาตุติดขัดตีกลับเข้าสู่เส้นชีพจร ' + injSuffix,
          COSMIC_LAW: lbl + ' ทะลวงขั้นล้มเหลว (' + drama + ') แรงบีบอัดของกฎมิติและชีพจรดินสะท้อนกลับบดขยี้ร่าง ' + injSuffix
        };
        return atm + (mapFail[fam] || mapFail.QI_IMMORTAL);
      }
    },
    deathEulogy(W, n, why) {
      const lbl = this.actorLabel(W, n);
      const wStr = String(why || 'สิ้นอายุขัย');
      const stg = (n && n.cult && n.cult.stage) || 0;
      let closeFriends = 0, affSum = 0, affCnt = 0;
      const hasComp = !!(n && n.companionId);
      if (W && Array.isArray(W.npcs) && n) {
        for (let i = 0; i < W.npcs.length; i++) {
          const o = W.npcs[i];
          if (!o || o.dead || o.id === n.id || !o.h || !o.h.mind || !o.h.mind.relations) continue;
          const r = o.h.mind.relations[n.id];
          if (!r) continue;
          if (typeof r.a === 'number') {
            affSum += r.a;
            affCnt++;
            if (r.a >= 55) closeFriends++;
          }
        }
      }
      const avgAff = affCnt > 0 ? (affSum / affCnt) : 0;
      const condolence = (hasComp || closeFriends >= 3)
        ? 'ท่ามกลางเสียงร่ำไห้ปิ่มว่าจะขาดใจของคู่บำเพ็ญและศิษย์ผู้ใกล้ชิด'
        : (affCnt >= 2 && avgAff < -20)
        ? 'ทิ้งไว้เพียงความเงียบงันและถอนหายใจโล่งอกของผู้คนที่เคยถูกข่มเหง'
        : 'ท่ามกลางความอาลัยของศิษย์ร่วมสำนัก';

      if (wStr === 'ชราภาพ' || wStr.includes('ชราภาพ') || wStr.includes('อายุขัย')) {
        if (stg >= 5) {
          return lbl + ' นั่งขัดสมาธิหลับตาละสังขารอย่างสงบเมื่อสิ้นอายุขัย (' + wStr + ') ทิ้งตำนานแห่งยุคไว้ให้ศิษย์รุ่นหลังก้มกราบ';
        }
        return lbl + ' ตะเกียงชีวิตมอดดับลงอย่างสงบตามกฎสังสารวัฏ (' + wStr + ') ' + condolence;
      }
      if (wStr.includes('ทะลวง') || wStr.includes('ฟ้าทัณฑ์') || wStr.includes('ตบะแตก')) {
        return lbl + ' ฝืนชะตาทะลวงด่านแต่ปราณแตกซ่านย้อนทำลายชีพจรจนสิ้นชีพคาแท่นปิดด่าน (' + wStr + ') เสียงสายฟ้าและกลิ่นคาวโลหิตสะเทือนใจผู้คนทั้งหุบเขา';
      }
      if (wStr === 'อดอยาก' || wStr.includes('อดอยาก')) {
        return 'โศกนาฏกรรมยามข้าวยากหมากแพง! ' + lbl + ' สิ้นไร้เรี่ยวแรงล้มตายลงเพราะความอดอยาก (' + wStr + ') สร้างความตื่นตระหนกและสะเทือนขวัญไปทั่วทั้งสำนัก!';
      }
      if (wStr.includes('ดวล') || wStr.includes('ประหาร')) {
        return lbl + ' จบชีวิตลงท่ามกลางคมศาสตราแห่งความบาดหมาง (' + wStr + ') ปิดฉากหนี้แค้นด้วยเลือดเนื้อ — ' + condolence;
      }
      if (wStr.includes('ศึก') || wStr.includes('สังหาร') || wStr.includes('ปกป้อง') || wStr.includes('สละชีพ') || wStr.includes('บาดเจ็บ') || wStr.includes('อาการทรุด')) {
        return lbl + ' ยืนหยัดหลั่งเลือดหยดสุดท้ายจนสิ้นลมหายใจกลางสมรภูมิ (' + wStr + ') เลือดนักรบย้อมผืนดินสำนักไม่ยอมถอยแม้ครึ่งก้าว! — ' + condolence;
      }
      return lbl + ' เสียชีวิตลง (' + wStr + ') ' + condolence;
    },
    psychLens(W, n) {
      if (!n || !n.h) return { demeanorId: 'BALANCED', demeanorTh: 'สุขุมรอบคอบ', valueId: 'sectDuty', burdenId: null };
      const effP = k => (g.HC && g.HC.eff) ? g.HC.eff(n, 'personality.' + k) : ((n.h.personality && n.h.personality[k]) || 50);
      const effV = k => (g.HC && g.HC.eff) ? g.HC.eff(n, 'values.' + k) : ((n.h.values && n.h.values[k]) || 50);
      const v = n.h.values || {}, st = n.h.state || {};
      const demeanorScores = [
        { id: 'PRIDEFUL', th: 'หยิ่งทระนงถือเกียรติ', sc: effP('pride') >= 68 ? effP('pride') : 0 },
        { id: 'FIERCE', th: 'ดุดันเด็ดขาด', sc: (effP('aggression') >= 68 || effP('courage') >= 72) ? Math.max(effP('aggression'), effP('courage')) : 0 },
        { id: 'STOIC', th: 'สุขุมเยือกเย็นดั่งขุนเขา', sc: (effP('composure') >= 68 && effP('discipline') >= 62) ? (effP('composure') + effP('discipline')) * 0.5 : 0 },
        { id: 'SCHEMING', th: 'ทะเยอทะยานช่างคำนวณ', sc: (effP('ambition') >= 68 && effP('integrity') <= 42) ? effP('ambition') + (50 - effP('integrity')) * 0.4 : 0 },
        { id: 'BENEVOLENT', th: 'เปี่ยมเมตตายึดคุณธรรม', sc: (effP('empathy') >= 68 && effP('integrity') >= 55) ? (effP('empathy') + effP('integrity')) * 0.5 : 0 },
        { id: 'WARY', th: 'ระแวดระวังรอบคอบ', sc: (effP('caution') >= 68 || effP('trustfulness') <= 35) ? Math.max(effP('caution'), 100 - effP('trustfulness')) : 0 }
      ].sort((a, b) => b.sc - a.sc);
      const topDem = demeanorScores[0] && demeanorScores[0].sc > 0 ? demeanorScores[0] : { id: 'BALANCED', th: 'สุขุมรอบคอบ' };
      const demeanorId = topDem.id, demeanorTh = topDem.th;
      const valEntries = Object.keys(v).map(k => [k, effV(k)]).filter(([, x]) => Number.isFinite(x)).sort((a, b) => b[1] - a[1]);
      const valueId = valEntries[0] ? valEntries[0][0] : 'sectDuty';
      let burdenId = null;
      if ((st.heartDemon || 0) >= 50) burdenId = 'HEART_DEMON';
      else if ((n.grief || 0) > 0) burdenId = 'GRIEF';
      else if (Array.isArray(n.h.mind && n.h.mind.grudges) && n.h.mind.grudges.length > 0) burdenId = 'GRUDGE';
      else if (Array.isArray(n.inj) && n.inj.length > 0) burdenId = 'INJURED';
      return { demeanorId, demeanorTh, valueId, burdenId };
    },
    recordLifeChapter(W, n, text, kind, meta) {
      if (!n || !n.h || !n.h.life || !text) return;
      n.h.life.bio = Array.isArray(n.h.life.bio) ? n.h.life.bio : [];
      const age = (g.HC && g.HC.ageYears) ? Math.floor(g.HC.ageYears(n)) : (n.age || 18);
      const day = (W && W.day) || 0;
      const entry = { d: day, day, text: String(text), t: String(text), age, kind: kind || 'milestone' };
      if (meta && typeof meta === 'object') entry.meta = meta;
      n.h.life.bio.push(entry);
      if (n.h.life.bio.length > 80) n.h.life.bio.splice(0, n.h.life.bio.length - 80);
    },
    buildNpcBiography(W, npcOrId) {
      const n = (typeof npcOrId === 'string') ? (W && W.byId && W.byId[npcOrId]) : npcOrId;
      if (!n || !n.h) return null;
      const lens = SIM.PROSE.psychLens(W, n);
      const nameTh = (g.HC && g.HC.fullName) ? g.HC.fullName(n) : (n.name || n.id || 'ศิษย์');
      const ageYears = (g.HC && g.HC.ageYears) ? Math.floor(g.HC.ageYears(n)) : (n.age || 18);
      const stage = (n.cult && n.cult.stage) || 1;
      const realmTh = (g.CULT && g.CULT.stageName) ? g.CULT.stageName(n) : ('ขั้น ' + stage);
      const subPathObj = (n.cult && g.CULT && g.CULT.subInfo && n.cult.path && n.cult.sub) ? g.CULT.subInfo(n.cult.path, n.cult.sub) : ((g.CULT && g.CULT.sub) ? g.CULT.sub(n) : null);
      const subPathTh = (subPathObj && subPathObj.nameTh) || (n.cult && n.cult.subPathNameTh) || '';
      const roleTh = (g.SECT && g.SECT.title) ? g.SECT.title(n) : (n.role || 'ศิษย์สำนัก');

      const VALUE_TH = {
        martialPeak: 'มุ่งสู่จุดสูงสุดแห่งยุทธ์',
        sectDuty: 'ภักดีและรับผิดชอบต่อสำนัก',
        familyClan: 'หวงแหนสายสัมพันธ์และวงศ์ตระกูล',
        knowledgeCraft: 'ใฝ่รู้คัมภีร์และศาสตร์ช่าง',
        freedom: 'รักอิสระไม่ผูกมัด',
        wealthResource: 'แสวงหาทรัพย์และทรัพยากร',
        powerStatus: 'แสวงหาอำนาจและบารมี',
        honorLegacy: 'ปรารถนาเกียรติยศและนามกระเดื่อง',
        wealth: 'แสวงหาทรัพย์และทรัพยากร',
        fame: 'ปรารถนาเกียรติยศชื่อเสียง',
        knowledge: 'ใฝ่รู้คัมภีร์และหลักเต๋า',
        bonds: 'หวงแหนสายสัมพันธ์และคนใกล้ชิด',
        power: 'แสวงหาอำนาจและอิทธิพล'
      };
      const topValues = Object.keys(n.h.values || {})
        .map(k => [k, (g.HC && g.HC.eff) ? g.HC.eff(n, 'values.' + k) : n.h.values[k]])
        .filter(([, v]) => Number.isFinite(v))
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([k, v]) => ({ id: k, labelTh: VALUE_TH[k] || k, score: Math.round(v) }));

      let innerVoiceTh = '';
      try {
        if (!n.dead && g.COG && typeof g.COG.explain === 'function') {
          const mind = g.COG.explain(W, n);
          if (mind && mind.innerVoiceTh) innerVoiceTh = mind.innerVoiceTh;
        }
      } catch (_) {}

      const mentor = (n.mentorId || n.mentor) && W && W.byId ? W.byId[n.mentorId || n.mentor] : null;
      const disciples = ((W && W.npcs) || []).filter(o => o && o !== n && (o.mentorId || o.mentor) === n.id).slice(0, 6);
      const rels = n.h.mind && n.h.mind.relations ? Object.entries(n.h.mind.relations)
        .map(([id, r]) => ({ id, r, o: W && W.byId && W.byId[id] }))
        .filter(x => x.o) : [];
      const closestBond = rels.filter(x => ((x.r.a || 0) + (x.r.l || 0) * 1.4) > 0).sort((a, b) => ((b.r.a || 0) + (b.r.l || 0) * 1.4) - ((a.r.a || 0) + (a.r.l || 0) * 1.4))[0] || null;
      const topRival = rels.filter(x => (x.r.v || 0) >= 25 || x.r.bond === 'ศัตรู').sort((a, b) => (b.r.v || 0) - (a.r.v || 0))[0] || null;

      const KIND_META = {
        DIVINE_GIFT: { icon: '🎁', labelTh: 'วาสนาฟ้าประทาน' },
        TRAIT_SHIFT: { icon: '🔮', labelTh: 'จิตใจแปรเปลี่ยน' },
        tribulation: { icon: '⚡', labelTh: 'ทัณฑ์สวรรค์' },
        breakthrough: { icon: '✨', labelTh: 'ทะลวงขอบเขต' },
        combat: { icon: '⚔️', labelTh: 'ศึกชี้ชะตา' },
        lineage: { icon: '🎓', labelTh: 'สายสืบทอด' },
        mentorship: { icon: '🎓', labelTh: 'ศิษย์อาจารย์' },
        bereavement: { icon: '🥀', labelTh: 'สูญเสียคนสำคัญ' },
        vengeance: { icon: '🔥', labelTh: 'ปณิธานล้างแค้น' },
        chronicle: { icon: '📜', labelTh: 'พงศาวดารยุทธภพ' },
        milestone: { icon: '🕯️', labelTh: 'หมุดหมายชีวิต' }
      };
      const startOff = (SIM.CALENDAR && SIM.CALENDAR.START_DAY_OFFSET) || 360;
      const seen = new Set();
      const seenObsDayKind = new Set();
      const timeline = [];
      const pushEvt = (day, text, kind, source, extraIds, tickOpt) => {
        const clean = String(text || '').trim();
        if (!clean) return;
        const dNum = Number.isFinite(day) ? Math.floor(day) : startOff;
        if (kind === 'DIVINE_GIFT' || kind === 'TRAIT_SHIFT') {
          const obsSig = dNum + '|' + kind;
          if (seenObsDayKind.has(obsSig)) return;
          seenObsDayKind.add(obsSig);
        }
        const sig = dNum + '|' + clean.slice(0, 48);
        if (seen.has(sig)) return;
        seen.add(sig);
        const relDay = Math.max(0, dNum - startOff);
        const km = KIND_META[kind] || KIND_META.milestone;
        timeline.push({
          day: dNum,
          relDay: relDay + 1,
          tick: Number.isFinite(tickOpt) ? tickOpt : (dNum * 1440),
          year: Math.floor(relDay / 360) + 1,
          month: Math.floor((relDay % 360) / 30) + 1,
          text: clean,
          kind: kind || 'milestone',
          icon: km.icon,
          kindLabelTh: km.labelTh,
          source: source || 'bio',
          npcIds: Array.isArray(extraIds) && extraIds.length ? extraIds : [n.id]
        });
      };

      (n.h.life && Array.isArray(n.h.life.bio) ? n.h.life.bio : []).forEach(b => {
        if (!b) return;
        const d = Number.isFinite(b.d) ? b.d : (Number.isFinite(b.day) ? b.day : startOff);
        const txt = b.text || b.t || '';
        const k = b.kind || (/ทัณฑ์สวรรค์/.test(txt) ? 'tribulation' : /ทะลวง|ขอบเขต|ชีพจร/.test(txt) ? 'breakthrough' : /ศิษย์|อาจารย์|เจ้าสำนัก|คู่บำเพ็ญ/.test(txt) ? 'lineage' : /สังหาร|ชนะศึก|ประลอง|ล้างแค้น/.test(txt) ? 'combat' : 'milestone');
        pushEvt(d, txt, k, 'bio', [n.id]);
      });

      const MAJOR_LOG_TYPES = new Set(['breakthrough', 'death', 'marriage', 'succession', 'challenge', 'tournament', 'raid', 'legend', 'explore', 'expel', 'desert', 'chronicle']);
      ((W && W.logs) || []).forEach(l => {
        if (!l || !Array.isArray(l.ids) || !l.ids.includes(n.id)) return;
        const isObs = l.txKind === 'player-spawn' || l.txKind === 'player-edit';
        if (!isObs && !MAJOR_LOG_TYPES.has(l.type)) return;
        const d = Math.floor((l.t || 0) / 1440);
        const k = l.txKind === 'player-spawn' ? 'DIVINE_GIFT' : l.txKind === 'player-edit' ? 'TRAIT_SHIFT' : (/ทัณฑ์สวรรค์/.test(l.text || '') ? 'tribulation' : (l.type === 'breakthrough' ? 'breakthrough' : (l.type === 'raid' || l.type === 'challenge' || l.type === 'tournament') ? 'combat' : (l.type === 'marriage' || l.type === 'succession') ? 'lineage' : 'milestone'));
        pushEvt(d, l.text, k, isObs ? 'observer' : 'log', l.ids, l.t);
      });

      ((W && W.world && W.world.chronicles) || []).forEach(c => {
        if (!c || !Array.isArray(c.npcIds) || !c.npcIds.includes(n.id)) return;
        pushEvt(c.day || startOff, (c.titleTh ? ('「' + c.titleTh + '」 ') : '') + (c.storyTh || ''), 'chronicle', 'chronicle', c.npcIds);
      });

      timeline.sort((a, b) => (b.day - a.day) || (b.tick - a.tick));

      const chronoAsc = timeline.slice().reverse();
      const observerExperiments = [];
      for (let i = 0; i < chronoAsc.length; i++) {
        const ev = chronoAsc[i];
        if (ev.kind !== 'DIVINE_GIFT' && ev.kind !== 'TRAIT_SHIFT') continue;
        const aftermath = [];
        for (let j = i + 1; j < chronoAsc.length && aftermath.length < 3; j++) {
          if (chronoAsc[j].kind !== 'DIVINE_GIFT' && chronoAsc[j].kind !== 'TRAIT_SHIFT') {
            aftermath.push({ day: chronoAsc[j].day, relDay: chronoAsc[j].relDay, year: chronoAsc[j].year, month: chronoAsc[j].month, text: chronoAsc[j].text, icon: chronoAsc[j].icon });
          }
        }
        if (aftermath.length < 3 && W && Array.isArray(W.logs)) {
          for (let j = 0; j < W.logs.length && aftermath.length < 3; j++) {
            const l = W.logs[j];
            if (!l || !Array.isArray(l.ids) || !l.ids.includes(n.id)) continue;
            if (l.txKind === 'player-spawn' || l.txKind === 'player-edit' || /^\[(แก้ไขโดยผู้เล่น|เสกโดยผู้เล่น)\]/.test(l.text || '')) continue;
            const ld = Math.floor((l.t || 0) / 1440);
            if ((ld > ev.day || (ld === ev.day && (l.t || 0) > ev.tick)) && !aftermath.some(a => a.text === l.text)) {
              const rld = Math.max(0, ld - startOff);
              aftermath.push({ day: ld, relDay: rld + 1, year: Math.floor(rld / 360) + 1, month: Math.floor((rld % 360) / 30) + 1, text: l.text, icon: '🔎' });
            }
          }
        }
        observerExperiments.push({
          day: ev.day,
          relDay: ev.relDay,
          year: ev.year,
          month: ev.month,
          kind: ev.kind,
          icon: ev.icon,
          labelTh: ev.kindLabelTh,
          eventTh: ev.text,
          aftermath
        });
      }

      const rawEp = Array.isArray(n.epithets) ? n.epithets : (n.epithets && Array.isArray(n.epithets.owned) ? n.epithets.owned : []);
      const epithets = rawEp.filter(Boolean).map(e => e.titleTh || e.id);
      const summaryTh = nameTh + ' (' + roleTh + ' · ' + realmTh + (subPathTh ? ' สาย' + subPathTh : '') + ') มีอุปนิสัย' + lens.demeanorTh + (topValues[0] ? (' ยึดมั่นในการ' + topValues[0].labelTh) : '') + (epithets.length ? (' ได้รับสมญานาม「' + epithets[0] + '」') : '') + ' — มีบันทึกหมุดหมายสำคัญ ' + timeline.length + ' เหตุการณ์';

      return {
        npcId: n.id,
        nameTh,
        ageYears,
        stage,
        realmTh,
        subPathTh,
        roleTh,
        dead: !!n.dead,
        lens,
        topValues,
        innerVoiceTh,
        epithets,
        mentor: mentor ? { id: mentor.id, nameTh: (g.HC && g.HC.fullName) ? g.HC.fullName(mentor) : mentor.id } : null,
        disciples: disciples.map(d => ({ id: d.id, nameTh: (g.HC && g.HC.fullName) ? g.HC.fullName(d) : d.id })),
        closestBond: closestBond ? { id: closestBond.id, nameTh: (g.HC && g.HC.fullName) ? g.HC.fullName(closestBond.o) : closestBond.id, bondTh: closestBond.r.bond || 'สหายสนิท' } : null,
        topRival: topRival ? { id: topRival.id, nameTh: (g.HC && g.HC.fullName) ? g.HC.fullName(topRival.o) : topRival.id, bondTh: topRival.r.bond || 'คู่ปรับ' } : null,
        summaryTh,
        observerExperiments: observerExperiments.reverse().slice(0, 6),
        timeline: timeline.slice(0, 60)
      };
    }
  };
  SIM.proseName = (W, n) => SIM.PROSE.actorLabel(W, n);

  g.SIM = SIM;
  if (typeof module === 'object' && module.exports) module.exports = SIM;
/* === LIVING_JIANGHU_EPITHETS_SIM_HOOK_V260 === */

  const _origSimCreateEp = SIM.create;
  SIM.create = (seed, opts) => {
    const W = _origSimCreateEp(seed, opts);
    if (W && g.CULT && g.CULT.EPITHETS) {
      g.CULT.EPITHETS.ensureWorldCrowns(W);
      g.CULT.EPITHETS.ensureCollectiveGroups(W);
      (W.npcs || []).forEach(n => {
        g.CULT.EPITHETS.ensureNpcEpithets(n);
        g.CULT.EPITHETS.ensureDeedStats(n);
      });
      g.CULT.EPITHETS.refreshLineageTitles(W);
      g.CULT.EPITHETS.reconcileUniqueCrowns(W, { immediatePublic: true });
    }
    return W;
  };

  const _origSnapshotPersonEp = SIM.snapshotPerson;
  SIM.snapshotPerson = (W, n, statusOverride) => {
    const snap = _origSnapshotPersonEp(W, n, statusOverride);
    if (snap && n && g.CULT && g.CULT.EPITHETS) {
      const ep = g.CULT.EPITHETS.peekNpcEpithets(n);
      snap.epithetSnapshot = {
        primaryId: ep.primaryId || null,
        primaryTextTh: ep.primaryTextTh || null,
        campusId: ep.campusId || null,
        campusTextTh: ep.campusTextTh || null,
        daoNameTh: ep.daoNameTh || null,
        lineageTitleTh: ep.lineageTitleTh || null,
        groupTitleTh: ep.groupTitleTh || null,
        crownIds: Array.isArray(ep.crownIds) ? ep.crownIds.slice() : [],
        posthumousId: ep.posthumousId || null,
        posthumousTitleTh: ep.posthumousTitleTh || null,
        fullDisplayTitleTh: g.CULT.EPITHETS.formatDisplayTitle(n, { includeDaoName: true, includePosthumous: true })
      };
      snap.epithetAtEventTh = ep.primaryTextTh || ep.daoNameTh || ep.campusTextTh || null;
      if (ep.posthumousTitleTh) snap.posthumousTitleTh = ep.posthumousTitleTh;
    }
    return snap;
  };

  const _origSimDailyEp = SIM.dailyUpdate;
  SIM.dailyUpdate = (W, silent) => {
    const res = typeof _origSimDailyEp === 'function' ? _origSimDailyEp(W, silent) : undefined;
    if (!silent && W && g.CULT && g.CULT.EPITHETS && g.CULT.EPITHETS.onDailyTick) {
      g.CULT.EPITHETS.onDailyTick(W);
    }
    return res;
  };

  const _origSimMonthlyEp = SIM.monthly;
  SIM.monthly = W => {
    const res = _origSimMonthlyEp(W);
    if (W && g.CULT && g.CULT.EPITHETS && g.CULT.EPITHETS.onMonthlyAudit) {
      g.CULT.EPITHETS.onMonthlyAudit(W);
    }
    return res;
  };

  const _origSimDeserializeEp = SIM.deserialize;
  SIM.deserialize = str => {
    const rawSnap = JSON.parse(str);
    const isLegacy240Map = !rawSnap.map || !rawSnap.map.mapW || rawSnap.map.mapW < 360;
    const W = _origSimDeserializeEp(str);
    if (W) {
      W.workSteps = Number.isSafeInteger(rawSnap.workSteps) && rawSnap.workSteps >= 0 ? rawSnap.workSteps : Math.round((W.t || 0) * (SIM.DAY_FACTOR || 1.5));
      W.timePhase = Number.isInteger(rawSnap.timePhase) && rawSnap.timePhase >= 0 && rawSnap.timePhase < 3 ? rawSnap.timePhase : 0;
      W._lastDailyUpdateDay = W.day;
      W._lastWildTickT = W.t;
      if (W.t % 60 === 0 && (W.timePhase || 0) > 0) W._lastHourlyUpdateT = W.t;
      if (isLegacy240Map && W.map) {
        const dx = 62, dy = 42;
        const shiftEntity = u => {
          if (!u || typeof u !== 'object') return;
          if (Number.isFinite(u.x)) u.x = clamp(u.x + dx, 3.5, W.map.W - 3.5);
          if (Number.isFinite(u.y)) u.y = clamp(u.y + dy, 3.5, W.map.H - 3.5);
          if (Number.isFinite(u.px)) u.px = u.x;
          if (Number.isFinite(u.py)) u.py = u.y;
          if (u.path) u.path = null;
          if (W.map && MAP.blocked && MAP.nearestFree && Number.isFinite(u.x) && Number.isFinite(u.y) && !u.hidden && MAP.blocked(W.map, u.x, u.y)) {
            const nf = MAP.nearestFree(W.map, u.x, u.y);
            if (nf) { u.x = nf.x + 0.5; u.y = nf.y + 0.5; u.px = u.x; u.py = u.y; }
          }
        };
        (W.npcs || []).forEach(shiftEntity);
        (W.foes || []).forEach(shiftEntity);
        if (W.world && Array.isArray(W.world.visitors)) W.world.visitors.forEach(shiftEntity);
        if (W.wildlife && Array.isArray(W.wildlife.beasts)) W.wildlife.beasts.forEach(shiftEntity);
        if (W.wildResources && Array.isArray(W.wildResources.nodes)) {
          W.wildResources.nodes.forEach(nd => {
            if (!nd) return;
            nd.x = clamp(Math.floor((nd.x || 100) + dx), 4, W.map.W - 5);
            nd.y = clamp(Math.floor((nd.y || 140) + dy), 4, W.map.H - 5);
            if (MAP.blocked(W.map, nd.x, nd.y)) {
              const nf = MAP.nearestFree(W.map, nd.x, nd.y);
              if (nf) { nd.x = nf.x; nd.y = nf.y; }
            }
          });
        }
      }
      if (g.WILD && g.WILD.init) g.WILD.init(W);
      (W.npcs || []).forEach(n => {
        if (g.CULT && g.CULT.EPITHETS) {
          g.CULT.EPITHETS.ensureNpcEpithets(n);
          g.CULT.EPITHETS.ensureDeedStats(n);
        }
        if (g.CULT && g.CULT.EXPERIENCE_TRAITS) {
          g.CULT.EXPERIENCE_TRAITS.ensureState(n);
        }
        if (g.COMBAT && g.COMBAT.ACTION_MASTERY_TRAITS) {
          g.COMBAT.ACTION_MASTERY_TRAITS.ensureHistory(n);
        }
      });
      if (g.CULT && g.CULT.EPITHETS) {
        g.CULT.EPITHETS.ensureWorldCrowns(W);
        g.CULT.EPITHETS.ensureCollectiveGroups(W);
      }
    }
    return W;
  };

})(typeof globalThis !== 'undefined' ? globalThis : this);

/* === CARBON_COMPENDIA_SIM_HOOKS_V260 === */
(function initCarbonSimHooks(g) {
  const SIM = g.SIM, SECT = g.SECT, CULT = g.CULT, ECO = g.ECO;
  if (!SIM) return;

  const _origSimCreateCarbon = SIM.create;
  SIM.create = (seed, opts) => {
    const W = _origSimCreateCarbon(seed, opts);
    if (W && W.sect) {
      if (SECT && SECT.ensurePreHistoryLineage) SECT.ensurePreHistoryLineage(W);
      if (SECT && SECT.PATRIARCH_REGALIA) SECT.PATRIARCH_REGALIA.ensure(W);
      if (SECT && SECT.TRANSCENDENT_PANTHEON) SECT.TRANSCENDENT_PANTHEON.ensureWorldState(W);
      if (CULT && CULT.LOW_TIER_DISTRIBUTION) CULT.LOW_TIER_DISTRIBUTION.seedStarterSectLibrary(W, 7);
    }
    return W;
  };

  const _origAddNpcCarbon = SIM.addNpc;
  if (typeof _origAddNpcCarbon === 'function') {
    SIM.addNpc = (W, opts) => {
      const n = _origAddNpcCarbon(W, opts);
      if (n && W && W.sect) {
        if (!Number.isFinite(n.sectGeneration)) {
          n.sectGeneration = (n.id === W.sect.masterId) ? (W.sect.masterGeneration || 7) : ((W.sect.masterGeneration || 7) + 1);
        }
        if (!(opts && opts.grantMundaneLowArt === false) && CULT && CULT.LOW_TIER_DISTRIBUTION) {
          CULT.LOW_TIER_DISTRIBUTION.grantRecruitMundaneArt(W, n);
        }
      }
      return n;
    };
  }

  const _origDeserializeCarbon = SIM.deserialize;
  if (typeof _origDeserializeCarbon === 'function') {
    SIM.deserialize = raw => {
      const W = _origDeserializeCarbon(raw);
      if (W && W.sect) {
        if (SECT && SECT.ensurePreHistoryLineage) SECT.ensurePreHistoryLineage(W);
        if (SECT && SECT.PATRIARCH_REGALIA) SECT.PATRIARCH_REGALIA.ensure(W);
        if (SECT && SECT.TRANSCENDENT_PANTHEON) SECT.TRANSCENDENT_PANTHEON.ensureWorldState(W);
        if (ECO && ECO.resetDynamicItems) ECO.resetDynamicItems(W);
      }
      return W;
    };
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);


/* === LIVING_LORE_SIM_HOOKS_V310 === */
(function initLivingLoreSimHooks(g) {
  'use strict';
  const SIM = g.SIM;
  if (!SIM) return;

  const _origSimCreateLore = SIM.create;
  SIM.create = (seed, opts) => {
    const W = _origSimCreateLore(seed, opts);
    if (W && g.EXPED && g.EXPED.initLivingLore) {
      g.EXPED.initLivingLore(W);
    }
    return W;
  };

  const _origAddNpcLore = SIM.addNpc;
  if (typeof _origAddNpcLore === 'function') {
    SIM.addNpc = (W, opts) => {
      const n = _origAddNpcLore(W, opts);
      if (n && W && g.EXPED && g.EXPED.seedNpcInitialLore) {
        if (g.EXPED.assignHometown && (!n.ext || !n.ext.world || !n.ext.world.hometownNodeId)) {
          g.EXPED.assignHometown(W, n);
        }
        g.EXPED.seedNpcInitialLore(W, n);
      }
      return n;
    };
  }

  const _origDeserializeLore = SIM.deserialize;
  if (typeof _origDeserializeLore === 'function') {
    SIM.deserialize = raw => {
      const W = _origDeserializeLore(raw);
      if (W && g.EXPED && g.EXPED.initLivingLore) {
        g.EXPED.initLivingLore(W);
      }
      return W;
    };
  }

  /* === JS2_V390_SIM_HOOKS === */
  const _origCreatePL = SIM.create;
  if (typeof _origCreatePL === 'function') {
    SIM.create = (...args) => {
      const W = _origCreatePL(...args);
      if (W && g.EXPED && g.EXPED.POLITICAL_LIVES && g.EXPED.POLITICAL_LIVES.ensure) {
        g.EXPED.POLITICAL_LIVES.ensure(W);
      }
      if (W && g.EXPED && g.EXPED.LIVING_INSTITUTIONS && g.EXPED.LIVING_INSTITUTIONS.ensure) {
        g.EXPED.LIVING_INSTITUTIONS.ensure(W);
      }
      if (W && g.EXPED && g.EXPED.WITNESSES_AND_SHARDS && g.EXPED.WITNESSES_AND_SHARDS.ensure) {
        g.EXPED.WITNESSES_AND_SHARDS.ensure(W);
      }
      return W;
    };
  }
  const _origAddNpcPL = SIM.addNpc;
  if (typeof _origAddNpcPL === 'function') {
    SIM.addNpc = (W, o) => {
      const n = _origAddNpcPL(W, o);
      if (W && n && o && o.fromApplicant && g.EXPED && g.EXPED.POLITICAL_LIVES && g.EXPED.POLITICAL_LIVES.rollApplicantClanHeritage) {
        g.EXPED.POLITICAL_LIVES.rollApplicantClanHeritage(W, n);
        if (g.EXPED.WITNESSES_AND_SHARDS && g.EXPED.WITNESSES_AND_SHARDS.rollApplicantFolkTrait) g.EXPED.WITNESSES_AND_SHARDS.rollApplicantFolkTrait(W, n);
      }
      return n;
    };
  }
  const _origDeserializePL = SIM.deserialize;
  if (typeof _origDeserializePL === 'function') {
    SIM.deserialize = raw => {
      const W = _origDeserializePL(raw);
      if (W && g.EXPED && g.EXPED.POLITICAL_LIVES && g.EXPED.POLITICAL_LIVES.ensure) {
        g.EXPED.POLITICAL_LIVES.ensure(W);
        if (g.EXPED.LIVING_INSTITUTIONS && g.EXPED.LIVING_INSTITUTIONS.ensure) g.EXPED.LIVING_INSTITUTIONS.ensure(W);
        if (g.EXPED.WITNESSES_AND_SHARDS && g.EXPED.WITNESSES_AND_SHARDS.ensure) g.EXPED.WITNESSES_AND_SHARDS.ensure(W);
        if (g.EXPED.FALLEN_STAR_EPIC && g.EXPED.FALLEN_STAR_EPIC.ensure) g.EXPED.FALLEN_STAR_EPIC.ensure(W);
      }
      return W;
    };
  }

})(typeof globalThis !== 'undefined' ? globalThis : this);
