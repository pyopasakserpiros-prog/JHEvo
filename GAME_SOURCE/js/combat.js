/* combat.js — การต่อสู้: ประลองเบา (spar) ดวลจริง ท้าชิงตำแหน่ง ประลองยุทธ์สำนัก และการบุกของศัตรู
 * หน่วยรบ (unit) = NPC หรือศัตรู (foe) ผลลัพธ์มาจากกำลังรบ (CULT.power) + สภาพร่างกาย + ความคล่องตัว + นิสัย (กล้า/ยอมแพ้/หนี) ไม่ใช่ลูกเต๋าล้วน ๆ */
(function (g) {
  'use strict';
  const U = g.U || require('./util.js'), HC = g.HC, MAP = g.MAP, CULT = g.CULT, ECO = g.ECO, SECT = g.SECT, AI = g.AI, JD = g.JD;
  const clamp = U.clamp;
  const C = {};
  const E = (n, p) => HC.eff(n, p);

  /* ---------- หน่วยรบทั่วไป ---------- */
  C.unit = (W, id) => W.byId[id] || (W.foeById && W.foeById[id]) || null;
  C.alive = u => !!u && !u.dead && !u.fled && !u.yield;
  C.power = u => g.STATS.rating(u);
  C.hpMax = u => u.foe ? u.hpMax : CULT.hpMax(u);
  C.hp = u => u.foe ? u.hp : u.h.state.hp;
  C.setHp = (u, v) => { if (u.foe) u.hp = v; else u.h.state.hp = v; };
  C.name = u => u.foe ? u.name : u.h.name.given;
  C.agi = u => u.foe ? 50 + u.tier * 3 : (E(u, 'physiology.agility') + E(u, 'physiology.reflex')) / 2;

  /* ---------- ประลองเบา (คู่ฝึกยุทธ์) ---------- */
  C.sparRound = (W, a, b, d) => {
    d.sc = d.sc || { a: 0, b: 0 };
    const pa = CULT.power(a) * (0.7 + W.rng.next() * 0.6) * (0.9 + C.agi(a) / 500), pb = CULT.power(b) * (0.7 + W.rng.next() * 0.6) * (0.9 + C.agi(b) / 500);
    if (pa > pb) d.sc.a += pa / (pa + pb); else d.sc.b += pb / (pa + pb);
    d.rounds++;
    a.fx = { t: W.t, text: '⚔' }; b.fx = { t: W.t, text: '⚔' };
    [a, b].forEach(x => { x.h.state.energy = Math.max(0, x.h.state.energy - 0.9); HC.trainBody(x, 'reflex', 0.5); HC.trainBody(x, 'agility', 0.4); (g.MARTIAL && g.MARTIAL.skillPractice ? g.MARTIAL.skillPractice : HC.practice)(x, g.AI.pickTeachSkill(x, x), 1 / 30, 1.2); if (x.cult) CULT.gain(x, 0.15); });
    if (a.h.state.energy < 12 || b.h.state.energy < 12) return 'end';
    if (d.rounds >= 14) return 'end';
  };
  C.sparEnd = (W, a, b, d) => {
    const sc = d.sc || { a: 0, b: 0 }; if (d.rounds < 2) return;
    const aw = sc.a >= sc.b; const w = aw ? a : b, l = aw ? b : a;
    const close = Math.abs(sc.a - sc.b) / Math.max(0.01, sc.a + sc.b) < 0.18;
    const ra = SECT.rel(a, b.id), rb = SECT.rel(b, a.id);
    // ผู้แพ้ที่ทิฐิสูงเก็บความแค้น; ผู้ชนะที่ใจกว้างได้ความเคารพ
    const sore = (E(l, 'personality.pride') - 50) / 100 + (E(l, 'personality.aggression') - 50) / 200 - (close ? 0.3 : 0);
    SECT.rel(l, w.id).v += Math.max(0, sore) * 5; SECT.rel(l, w.id).r += close ? 2 : 4; SECT.rel(w, l.id).r += close ? 2 : 1;
    HC.feel(w, { mood: 4 }); HC.feel(l, { mood: close ? 1 : -3, stress: sore > 0.2 ? 3 : 0 });
    HC.experience(w, 'victory', 0.25); HC.experience(l, 'defeat', 0.2);
    [a, b].forEach(u => {
      if (u && !u.dead && u.cult && u.cult.path === 'HEART_SOUL') {
        u.h.state.heartDemon = Math.max(0, (u.h.state.heartDemon || 0) - 2.5);
        u.h.state.stress = Math.max(0, (u.h.state.stress || 0) - 3);
        HC.gainWisdom(u, 0.08);
        CULT.gain(u, 0.8);
      }
    });
    if (W.rng.chance(0.04 + (E(l, 'personality.aggression') - 50) / 800)) { AI.injure(W, l, 1, 'ได้รับบาดเจ็บขณะประลอง'); }
    AI.mem(W, w, 'ประลองกับ ' + l.h.name.given + (close ? ' เสมอกันหวุดหวิด' : ' และเป็นฝ่ายชนะ'), 0.3, l.id);
    AI.mem(W, l, 'ประลองกับ ' + w.h.name.given + (close ? ' เสมอกันหวุดหวิด' : ' และพ่ายแพ้'), 0.3, w.id);
    w.stats = w.stats || {}; l.stats = l.stats || {}; w.stats.sparWin = (w.stats.sparWin || 0) + 1; l.stats.sparLoss = (l.stats.sparLoss || 0) + 1;
    if (!close && (CULT.power(w) > CULT.power(l) * 1.5 || W.rng.chance(0.15))) W.log('spar', w.h.name.given + ' ประลองชนะ ' + l.h.name.given, [w.id, l.id]);
  };

  /* ---------- การต่อสู้จริง ---------- */
  C.startFight = (W, A, B, kind, opts) => {
    opts = opts || {};
    W.fights = W.fights || []; W.fightSeq = (W.fightSeq || 0) + 1;
    const f = { id: W.fightSeq, kind, serious: !!opts.serious, A: A.slice(), B: B.slice(), t0: W.t, state: opts.gather ? 'gather' : 'fight', arena: opts.arena || null, cb: opts.cb || null, ctx: opts.ctx || {}, over: false, log: [] };
    W.fights.push(f);
    [].concat(A, B).forEach(id => C.enter(W, f, id));
    return f;
  };
  C.enter = (W, f, id) => {
    const u = C.unit(W, id); if (!u) return;
    if (u.foe && !u.skl) u.skl = SKs().foeSkills(u);
    if (!u.foe && f.serious) STs().preFight(W, u, f.kind === 'raid');
    if (!u.foe) { AI.interruptFor(W, u); u.hidden = false; u.act = { id: 'fight', stage: 'do', left: 9999, total: 9999, ctx: { fid: f.id, target: null, cd: 0 }, why: [['เข้าต่อสู้', 9]] }; u.path = null; u.run = true; }
    else { u.act = { id: 'fight', ctx: { fid: f.id, target: null, cd: 0 } }; }
  };
  C.join = (W, f, id, side) => { if (f[side].includes(id)) return; f[side].push(id); C.enter(W, f, id); };
  C.fightOf = (W, u) => u.act && u.act.ctx && u.act.ctx.fid ? (W.fights || []).find(f => f.id === u.act.ctx.fid) : null;
  C.sideOf = (f, id) => f.A.includes(id) ? 'A' : 'B';
  C.enemies = (W, f, id) => (C.sideOf(f, id) === 'A' ? f.B : f.A).map(i => C.unit(W, i)).filter(C.alive);
  C.alliesOf = (W, f, id) => (C.sideOf(f, id) === 'A' ? f.A : f.B).map(i => C.unit(W, i)).filter(C.alive);

  function yieldThreshold(u) {
    if (u.foe) return u.fleeAt || 0.2;
    return clamp(0.34 - (E(u, 'personality.pride') - 50) / 400 - (E(u, 'personality.courage') - 50) / 500, 0.12, 0.45);
  }
  function fleeThreshold(u) { // เมื่อสู้จริงจัง
    if (u.foe) return u.fleeAt || 0.2;
    return clamp(0.22 - (E(u, 'personality.courage') - 50) / 260 - (E(u, 'personality.loyalty') - 50) / 400 + (E(u, 'personality.caution') - 50) / 400, 0.0, 0.3);
  }
  const FX_WORDS = ['ฟัน', 'แทง', 'ปะทะ', 'ฝ่ามือ', 'หลบ'];
  function techMove(W, u) {
    if (u.foe || !u.cult || !u.cult.techs.length) return null;
    const t = CULT.tech(W.rng.pick(u.cult.techs)); if (!t || !t.moves || !t.moves.length) return null; return W.rng.pick(t.moves);
  }
  function moveToward(W, u, tx, ty, run) {
    const dx = tx - u.x, dy = ty - u.y, d = Math.hypot(dx, dy); if (d < 0.01) return;
    if (u.foe) { const sp = u.speed * (run ? 1.0 : 0.8) * clamp(STs().get(u).move / 100, 0.4, 2); const s = Math.min(d, sp); const nx = u.x + dx / d * s, ny = u.y + dy / d * s; if (!MAP.blocked(W.map, nx, ny)) { u.x = nx; u.y = ny; } else { const ax = u.x + (dx > 0 ? s : -s) * (Math.abs(dx) > Math.abs(dy) ? 1 : 0.2), ay = u.y + (dy > 0 ? s : -s) * (Math.abs(dy) >= Math.abs(dx) ? 1 : 0.2); if (!MAP.blocked(W.map, ax, ay)) { u.x = ax; u.y = ay; } else { u.x += W.rng.gauss(0, 0.3); u.y += W.rng.gauss(0, 0.3); if (MAP.blocked(W.map, u.x, u.y)) { u.x = u.px; u.y = u.py; } } } u.face = dx >= 0 ? 1 : -1; return; }
    if (!u.path || (W.t + u.n) % 6 === 0) AI.goTo(W, u, Math.floor(tx), Math.floor(ty));
    AI.stepMove(W, u);
  }
  /* =====================================================================
   * ระบบสู้ใหม่ (v1.4 + v1.10 Overhaul): สเตตัสจริง (STATS) + วิชาหลายกระบวนท่า (SK) + วิชาติดตัว (PASSIVE)
   * ===================================================================== */
  const STs = () => g.STATS, SKs = () => g.SK;
  const FX_PHYS = ['ฟัน', 'แทง', 'ปะทะ', 'ฝ่ามือ'], FX_MAG = ['ปราณพุ่ง', 'คลื่นวิชา', 'แสงปราณ'];
  C.stats = u => STs().get(u);
  function hpFrac(u) { return clamp(C.hp(u) / Math.max(1, C.hpMax(u)), 0, 1); }
  function shieldOf(u) { const x = STs().statusOf(u, 'shield'); if (x && x.amt > 0) return x; if (u && u.shieldBp > 0) return { k: 'shield', amt: u.shieldBp }; return null; }

  /* ---------- Weapon Reach, Kiting & Guard-Shatter Tactical Engine (v2.0.5 Pillar B) ---------- */
  C.resolveWeaponTactics = (a, d, o, f) => {
    o = o || {};
    const SK = SKs(), ST = STs();
    if (!a || !d || !SK || !SK.weaponTacticalProfile) {
      return { relation: 'NEUTRAL', dmgMult: 1, accAdd: 0, critAdd: 0, penAdd: 0, shieldBreakMult: 1, shatterGuard: false, noteTh: '' };
    }
    const pa = SK.weaponTacticalProfile(a);
    const pd = SK.weaponTacticalProfile(d);
    const rawDist = (Number.isFinite(a.x) && Number.isFinite(d.x) && (a.x !== d.x || a.y !== d.y)) ? Math.hypot(a.x - d.x, a.y - d.y) : 2.1;
    const dist = o.dist != null ? o.dist : rawDist;
    const moveArch = o.arch || (o.skill && o.skill.arch) || '';
    const isGapCloserMove = ['charge', 'evade', 'flurry', 'pierce'].includes(moveArch) || !!(o.isGapCloser);
    const aHasLightness = pa.hasLightness || isGapCloserMove;
    const dHasLightness = pd.hasLightness || (ST && ST.has(d, 'evadeUp'));
    const dShielded = !!shieldOf(d) || (ST && ST.has(d, 'guardUp')) || pd.hasDefenseTech;

    let relation = 'NEUTRAL', dmgMult = 1, accAdd = 0, critAdd = 0, penAdd = 0, shieldBreakMult = 1, shatterGuard = false, noteTh = '';

    // 1. Long-reach polearms (SPEAR, STAFF) vs short-reach weapons (FIST, BLADE, SWORD)
    if (pa.reachClass === 'LONG_POLEARM' && (pd.reachClass === 'SHORT_SWIFT' || pd.reachClass === 'HEAVY_BREAKER')) {
      const firstStrikeWindow = !f || !f._firstStrikeUsed || !f._firstStrikeUsed[a.id];
      if (dHasLightness && (ST.has(d, 'evadeUp') || d._gapClosedOn === a.id)) {
        relation = 'POLEARM_COUNTERED_BY_LIGHTNESS';
        dmgMult = 0.96;
        noteTh = 'วิชาตัวเบาของ ' + C.name(d) + ' พุ่งฝ่าระยะ' + (pa.weaponType === 'SPEAR' ? 'หอก' : 'พลอง') + 'สลายความได้เปรียบเปิดศึก';
      } else if (firstStrikeWindow || dist >= 1.85) {
        relation = 'POLEARM_FIRST_STRIKE';
        dmgMult = pa.spec.firstStrikeMult || 1.12;
        accAdd += pa.spec.firstStrikeAcc || 10;
        if (f) { f._firstStrikeUsed = f._firstStrikeUsed || {}; f._firstStrikeUsed[a.id] = true; }
        noteTh = C.name(a) + ' อาศัยระยะ' + (pa.weaponType === 'SPEAR' ? 'ทวนยาว' : 'พลองยาว') + 'ชิงลงมือก่อนอาวุธสั้น';
      }
    }

    // 2. Ranged weapons (BOW, FOCUS) kiting distance advantage vs melee until closed on by dash/leap
    if (pa.reachClass === 'RANGED_KITE') {
      const closedOn = (a._closedOnBy === d.id) || (dist < 1.45 && dHasLightness);
      if (!closedOn && dist >= 1.65) {
        relation = 'RANGED_KITING_ADVANTAGE';
        dmgMult *= (pa.spec.kiteDmgMult || 1.12);
        critAdd += (pa.spec.kiteCritAdd || 5);
        accAdd += (pa.spec.kiteAccAdd || 8);
        noteTh = C.name(a) + ' รักษาระยะห่างยิงสกัดด้วย' + (pa.weaponType === 'BOW' ? 'ธนู' : 'สื่อปราณ');
      } else if (closedOn) {
        relation = 'RANGED_CLOSED_ON';
        dmgMult *= 0.94;
        noteTh = C.name(a) + ' ถูกประชิดตัว เสียเปรียบระยะยิงสกัด';
      }
    }

    // 3. Melee fighter using gap-closer / lightness art to counter RANGED_KITE or LONG_POLEARM
    if ((pa.reachClass === 'SHORT_SWIFT' || pa.reachClass === 'HEAVY_BREAKER') && (pd.reachClass === 'RANGED_KITE' || pd.reachClass === 'LONG_POLEARM')) {
      if (aHasLightness) {
        d._closedOnBy = a.id;
        a._gapClosedOn = d.id;
        if (relation === 'NEUTRAL') {
          relation = pd.reachClass === 'RANGED_KITE' ? 'DASH_CLOSE_COUNTER' : 'GAP_CLOSER_COUNTER';
          dmgMult *= (pa.spec.gapCloserMult || 1.10);
          accAdd += (pa.spec.gapCloserAcc || 8);
          noteTh = C.name(a) + ' ใช้วิชาตัวเบา/ท่าพุ่งประชิดทะลวงระยะของ ' + C.name(d);
        }
      }
    }

    // 4. Heavy weapons (BLADE, FIST Vajra/Titan/Body) guard-shatter bonus against shields & DEFENSIVE_TECHNIQUE
    if (pa.reachClass === 'HEAVY_BREAKER' && dShielded) {
      relation = 'HEAVY_GUARD_SHATTER';
      dmgMult *= (pa.spec.guardShatterDmgMult || 1.15);
      penAdd += (pa.spec.guardShatterPenAdd || 14);
      shieldBreakMult = pa.spec.shieldBreakMult || 1.45;
      shatterGuard = true;
      noteTh = C.name(a) + ' ใช้' + (pa.weaponType === 'BLADE' ? 'ดาบหนัก' : 'หมัดวัชระ') + 'ทลายโล่และกระบวนท่าตั้งรับของ ' + C.name(d);
    }

    return {
      relation,
      attackerReach: pa.reachClass,
      defenderReach: pd.reachClass,
      attackerWeapon: pa.weaponType,
      defenderWeapon: pd.weaponType,
      dmgMult: Math.round(dmgMult * 1000) / 1000,
      accAdd,
      critAdd,
      penAdd,
      shieldBreakMult,
      shatterGuard,
      noteTh
    };
  };

  C.explainTactics = (u, target) => {
    const SK = SKs();
    const prof = (SK && SK.weaponTacticalProfile) ? SK.weaponTacticalProfile(u) : null;
    if (!prof) return null;
    const vs = target ? C.resolveWeaponTactics(u, target, { dist: (Number.isFinite(u.x) && Number.isFinite(target.x)) ? Math.hypot(u.x - target.x, u.y - target.y) : 2.0 }) : null;
    const res = (g.MARTIAL && g.MARTIAL.evaluateResonanceSet && !u.foe) ? g.MARTIAL.evaluateResonanceSet(u) : null;
    return {
      weaponType: prof.weaponType,
      reachClass: prof.reachClass,
      engageRange: prof.engageRange,
      nameTh: prof.nameTh,
      stanceTh: prof.stanceTh,
      counteredByTh: prof.counteredByTh,
      descTh: prof.descTh,
      hasLightness: prof.hasLightness,
      hasDefenseTech: prof.hasDefenseTech,
      lastTacticalEvent: u.lastTacticalEvent || null,
      lastResonanceTrigger: u.lastResonanceTrigger || null,
      resonanceSet: res,
      matchup: vs
    };
  };

  /* Bounded Passive Procs (with strict internal cooldown and anti-recursion guard) */
  function runPassiveProcs(W, f, actor, target, triggerKind, dmgDealt) {
    if (f && f._inProc) return;
    if (!actor || actor.foe || actor.dead || !actor.cult || !g.MARTIAL || !g.MARTIAL.passiveStats) return;
    if (f) f._inProc = true;
    try {
    const ps = g.MARTIAL.passiveStats(actor);
    if (!ps || !Array.isArray(ps.procs) || !ps.procs.length) return;
    actor._procCds = actor._procCds || {};
    const ST = STs();
    for (const proc of ps.procs) {
      if (proc.kind !== triggerKind) continue;
      if ((actor._procCds[proc.techId] || 0) > W.t) continue;
      actor._procCds[proc.techId] = W.t + Math.max(1, proc.icdTicks || 6);
      if (proc.qiRestorePct && actor.cult) {
        const qm = CULT.qiMax(actor);
        actor.h.state.qi = Math.min(qm, (actor.h.state.qi == null ? qm : actor.h.state.qi) + qm * proc.qiRestorePct);
      }
      if (proc.hpRestorePct && !actor.dead) {
        const hm = C.hpMax(actor);
        C.setHp(actor, Math.min(hm, C.hp(actor) + Math.max(1, Math.round(hm * proc.hpRestorePct))));
      }
      if (proc.addStatus && !actor.dead) {
        ST.addStatus(actor, proc.addStatus, proc.dur || 6);
      }
      if (proc.counterStatus && target && C.alive(target)) {
        ST.addStatus(target, proc.counterStatus, proc.dur || 8);
      }
      if (proc.bonusPen && target && C.alive(target)) {
        ST.addStatus(target, 'armorbreak', 8);
      }
      actor.lastPassiveProc = { t: W.t, techId: proc.techId, kind: triggerKind };
    }
    } finally { if (f) f._inProc = false; }
  }
  C.runPassiveProcs = runPassiveProcs;

  /* รับความเสียหาย: โล่ → เลือด → ยอมแพ้/หนี/ตาย */
  C.applyDamage = (W, f, a, d, dmg, note) => {
    if (W && (W.h || W.foe) && typeof f === "number" && d === undefined) {
      d = W;
      dmg = f;
      a = null;
      W = { t: (g.STATS && g.STATS.now) || 0, rng: { chance: () => false, next: () => 0.5 }, byId: {} };
      f = { id: 0, serious: false, A: [d.id], B: [] };
    }
    const sh = shieldOf(d); if (sh) { const ab = Math.min(sh.amt, dmg); sh.amt -= ab; dmg -= ab; if (sh.amt <= 0) STs().clearStatus(d, x => x.k === 'shield'); }
    if (dmg > 0 && !d.foe && d.pets && d.pets.length && CULT.activePets) {
      const actPets = CULT.activePets(d);
      const guardPet = actPets.find(pt => (pt.role === 'IRON_GUARDIAN' || (d.cult && d.cult.sub === 'COLOSSUS_SHIELD_TAMER')) && (pt.hp == null || pt.hp > 15) && (pt.fatigue || 0) < 90);
      if (guardPet) {
        const share = (d.cult && d.cult.sub === 'COLOSSUS_SHIELD_TAMER') ? 0.38 : 0.28;
        const curPetHp = guardPet.hp != null ? guardPet.hp : (guardPet.hpMax || 100);
        const intercepted = Math.min(dmg * share, Math.max(0, curPetHp - 10));
        if (intercepted >= 1) {
          dmg -= intercepted;
          guardPet.hp = Math.max(5, Math.round(curPetHp - intercepted * 0.45));
          guardPet.fatigue = clamp((guardPet.fatigue || 0) + 3.5, 0, 100);
          d.lastPetIntercept = { t: W.t, petId: guardPet.uid || guardPet.petId, petName: guardPet.nameTh, intercepted: Math.round(intercepted) };
        }
      }
    }
    const nonlethal = !f.serious, hm = C.hpMax(d);
    if (dmg > 0 && !d.foe && d.cult && d.cult.path === 'KARMA_SAMSARA' && note !== 'สะท้อนจิต' && note !== 'วิบากสะท้อน' && CULT.ensureKarmaState) {
      const ks = CULT.ensureKarmaState(d);
      const debtRate = (d.cult.sub === 'REVERSED_RETRIBUTION' || d.cult.sub === 'FATE_SEVERING_THREAD' || d.cult.sub === 'RED_THREAD_ARBITER') ? 0.65 : 0.48;
      const addDebt = Math.max(1, Math.round(dmg * debtRate));
      ks.debtPool = clamp((ks.debtPool || 0) + addDebt, 0, ks.maxDebt || Math.max(50, Math.round(hm * 0.45)));
      ks.karmicDebt = ks.debtPool;
      ks.lastHarmSourceId = a ? a.id : ks.lastHarmSourceId;
      ks.lastHarmAt = W.t;
    }
    let hp = C.hp(d) - dmg;
    if (hp <= hm * 0.12 && !d.foe && d.cult && d.cult.path === 'MECH_PUPPET' && CULT.ensureMechState) {
      f._mechDecoyUsed = f._mechDecoyUsed || {};
      const ms = CULT.ensureMechState(d);
      if (!f._mechDecoyUsed[d.id] && (d.cult.sub === 'SOUL_VESSEL_AVATAR' || ms.decoyAvailable || ms.vesselDecoyReady || (d.cult.techs && (d.cult.techs.includes('ART_MECH_PUPPET_005') || d.cult.techs.includes('ART_MECH_PUP_005')))) && ms.integrity >= 25) {
        f._mechDecoyUsed[d.id] = true;
        ms.decoyAvailable = false;
        ms.vesselDecoyReady = false;
        ms.integrity = Math.max(5, ms.integrity - 35);
        ms.constructReadiness = ms.integrity;
        hp = Math.max(Math.round(hm * 0.38), hp);
        STs().addStatus(d, 'evadeUp', 10);
        STs().addStatus(d, 'shield', 10, { amt: Math.round(hm * 0.22) });
        d.fx = { t: W.t, text: '🪆 หุ่นเชิดสลับร่าง!' };
        d.lastDecoySave = { t: W.t, fightId: f.id };
        STs().dirty(d);
      }
    }
    if (hp <= hm * 0.12 && !d.foe && d.cult && d.cult.path === 'KARMA_SAMSARA' && CULT.ensureKarmaState) {
      const ks = CULT.ensureKarmaState(d);
      if (ks && ks.echoReady) {
        ks.echoReady = false;
        hp = Math.max(Math.round(hm * 0.35), hp);
        STs().addStatus(d, 'shield', 10, { amt: Math.round(hm * 0.20) });
        d.fx = { t: W.t, text: '☸️ กายาอดีตชาติคุ้มชีพ!' };
        STs().dirty(d);
      }
    }
    if (hp <= hm * 0.12 && !d.foe && STs().hasBuff && STs().hasBuff(d, 'nirvanaGrace', W.t)) {
      STs().clearBuff(d, 'nirvanaGrace');
      hp = Math.max(Math.round(hm * 0.36), hp);
      STs().addStatus(d, 'shield', 10, { amt: Math.round(hm * 0.20) }, W.t);
      d.fx = { t: W.t, text: '🏮 โคมวิญญาณคุ้มชีพ!' };
      d.lastNirvanaSave = { t: W.t, fightId: f ? f.id : 0 };
      STs().dirty(d);
    }
    if (d.act && d.act.ctx && d.act.ctx.channeling) {
      if (dmg >= hm * 0.12) C.interruptChannel(W, f, d, 'ถูกโจมตีหนัก');
    }
    if (!d.foe) { d.lastHurtBy = a ? a.id : d.lastHurtBy; d.h.state.stress += 0.8; d.h.state.fear = clamp(d.h.state.fear + 1.5 * (1 - E(d, 'personality.courage') / 130), 0, 100); HC.trainBody(d, 'toughness', 0.15); if (W.rng.chance(0.02 * (dmg / hm * 10))) AI.injure(W, d, hp < hm * .3 ? 2 : 1, 'บาดแผลจากการต่อสู้'); }
    if (hp <= 0) {
      if (d.isSummon) {
        C.setHp(d, 0); d.dead = true; d.gone = true;
        d.fx = { t: W.t, text: '💨 สลายร่าง' };
        return true;
      }
      if (nonlethal || (!d.foe && !f.serious)) { hp = Math.max(1, hm * 0.04); d.yield = true; }
      else { C.setHp(d, 0); C.slay(W, f, a || d, d); return true; }
    }
    C.setHp(d, hp);
    const ratio = hp / hm;
    if (ratio < (nonlethal ? yieldThreshold(d) : fleeThreshold(d)) && !d.yield && !d.fled) {
      if (nonlethal) d.yield = true; else if (W.rng.chance(d.foe ? 0.7 : 0.5)) { d.fled = true; d.fx = { t: W.t, text: 'ถอย!' }; if (!d.foe) { d.run = true; AI.mem(W, d, 'ถอยหนีจากการต่อสู้', 0.5); HC.experience(d, 'flee', 0.4); } }
    }
    return false;
  };
  /* หนึ่งการโจมตี: o = {M, type:'p'|'m', pen, dotHalf, forced, noCounter, noProc, crit+} */
  C.strike = (W, f, a, d, o) => {
    const ST = STs(), sa = ST.get(a), sd = ST.get(d), nonlethal = !f.serious;
    const effectiveAcc = Math.max(1, sa.acc + (Number.isFinite(o.accAdd) ? o.accAdd : 0));
    const hitP = o.forced ? 1 : clamp(effectiveAcc / (effectiveAcc + 0.55 * sd.eva), 0.12, 0.97);
    if (W.rng.next() > hitP) { d.fx = { t: W.t, text: 'หลบ' }; if (!d.foe) HC.trainBody(d, 'reflex', 0.3); return { hit: false }; }
    // ท่าสวนกลับ: ปัดทิ้งแล้วสวน (ป้องกันลูปสะท้อน/สวนซ้ำ)
    if (!o.noCounter) { const cs = ST.statusOf(d, 'counter'); if (cs && !d.dead) { ST.clearStatus(d, x => x.k === 'counter'); d.fx = { t: W.t, text: '↩ ปัดสวน!' }; C.strike(W, f, d, a, { M: cs.M, type: cs.type, pen: cs.pen, forced: true, noCounter: true, noReflect: true, noProc: true }); return { hit: false, countered: true }; } }
    const tb = (!a.foe && g.MARTIAL && g.MARTIAL.combatTargetBonus) ? g.MARTIAL.combatTargetBonus(a, d) : null;
    const tac = C.resolveWeaponTactics ? C.resolveWeaponTactics(a, d, o, f) : null;
    const resSet = (!a.foe && g.MARTIAL && g.MARTIAL.evaluateResonanceSet) ? g.MARTIAL.evaluateResonanceSet(a) : null;
    const resRiderMult = (resSet && resSet.active && resSet.pieces >= 3 && resSet.rider && resSet.rider.bonusDmgMult) ? resSet.rider.bonusDmgMult : 1;
    if (tac && tac.relation !== 'NEUTRAL') {
      a.lastTacticalEvent = { t: W.t, relation: tac.relation, noteTh: tac.noteTh, targetId: d.id };
      if (f && Array.isArray(f.log) && f.log.length < 40 && (!f._lastTacLogAt || W.t - f._lastTacLogAt >= 3)) {
        f._lastTacLogAt = W.t;
        f.log.push({ t: W.t, relation: tac.relation, text: tac.noteTh, a: a.id, d: d.id });
      }
    }
    if (tac && tac.shatterGuard) {
      const sh = shieldOf(d);
      if (sh && sh.amt > 0) {
        sh.amt = Math.max(0, Math.round(sh.amt * (o.isSkill ? 0.35 : 0.55)));
        if (sh.amt <= 0) ST.clearStatus(d, x => x.k === 'shield');
      }
      if (ST.has(d, 'guardUp')) ST.clearStatus(d, x => x.k === 'guardUp');
      ST.addStatus(d, 'armorbreak', 8);
    }
    const type = o.type || (sa.atk >= sa.matk ? 'p' : 'm'), A0 = type === 'p' ? sa.atk : sa.matk;
    const penTot = (sa.pen || 0) + (o.pen || 0) + (tb ? tb.penAdd : 0) + (tac ? tac.penAdd : 0);
    let D = (type === 'p' ? sd.def : sd.mdef) * (o.dotHalf ? 0.5 : 1) * (1 - clamp(penTot / 100, 0, 0.82));
    const critChance = ((sa.crit || 0) + (o.critAdd || 0) + (tb ? tb.critAdd : 0) + (tac ? tac.critAdd : 0)) / 100;
    const crit = !o.noCrit && W.rng.chance(clamp(critChance, 0, 0.90));
    let frac = 0.2 * (A0 / (A0 + 0.8 * Math.max(0, D))) * (o.M || 1) * (o.synDmgMult || 1) * (tb ? tb.dmgMult : 1) * (tac ? tac.dmgMult : 1) * resRiderMult * (0.85 + W.rng.next() * 0.3);
    if (crit) frac *= ((sa.critDmg || 150) + (o.critDmgAdd || 0) + (tb ? tb.critDmgAdd : 0)) / 100;
    // Major Path Offensive/Defensive Combat Identities
    if (!a.foe && a.cult) {
      if (a.cult.path === 'XIAN' && o.isSkill && (a.h.state.qi || 0) >= CULT.qiMax(a) * 0.5) {
        frac *= 1.08; // Meridian Qi Resonance
      } else if (a.cult.path === 'GOD') {
        const isCorrupt = !!(d.foe || (d.cult && d.cult.path === 'DEMON') || (d.h && d.h.state && (d.h.state.heartDemon || 0) >= 30));
        frac *= isCorrupt ? 1.14 : 1.08; // Divine Mandate Verdict
      } else if (a.cult.path === 'MECH_PUPPET' && CULT.ensureMechState) {
        const ms = CULT.ensureMechState(a);
        if (ms.integrity >= 25 && (ms.heat || 0) < 90) {
          frac *= ((ms.mode === 'SIEGE' || ms.mode === 'OVERDRIVE') ? 1.14 : ms.mode === 'SWARM' ? 1.10 : 1.06);
          if (o.isSkill) {
            ms.heat = clamp((ms.heat || 0) + 10, 0, 100);
            ms.charge = clamp((ms.charge || 0) + 12, 0, 100);
            if (ms.charge >= 50) {
              ms.charge -= 40;
              ms.overclockReady = ms.charge >= 50;
              frac *= 1.14;
              a.lastMechOverclock = { t: W.t, targetId: d.id };
            }
          }
        }
      } else if (a.cult.path === 'KARMA_SAMSARA' && !o.noProc && CULT.ensureKarmaState) {
        const ks = CULT.ensureKarmaState(a);
        if (ks.debtPool > 0 && a.cult.sub !== 'LOTUS_MERCY_PURIFIER' && (o.isSkill || a.cult.sub === 'ASURA_JUDGMENT_BLADE' || a.cult.sub === 'REVERSED_RETRIBUTION' || a.cult.sub === 'FATE_SEVERING_THREAD' || a.cult.sub === 'RED_THREAD_ARBITER')) {
          const spent = Math.max(1, Math.round(ks.debtPool * 0.6));
          ks.debtPool = Math.max(0, ks.debtPool - spent);
          ks.karmicDebt = ks.debtPool;
          const bonusMult = 1 + clamp(spent / Math.max(1, C.hpMax(a)) * 0.85, 0.06, 0.42);
          frac *= bonusMult;
          a.lastKarmaRelease = { t: W.t, mode: 'RETALIATION', spent, bonusMult: +bonusMult.toFixed(3), targetId: d.id };
        }
      } else if (a.cult.path === 'BEAST_SOVEREIGN') {
        if (a._beastFusedUntil && a._beastFusedUntil > W.t) frac *= 1.14;
        else if (CULT.activePets && CULT.activePets(a).length > 0) frac *= 1.07;
      }
    }
    if (!d.foe && d.cult) {
      if (d.cult.path === 'BODY') {
        const dHpf = hpFrac(d);
        if (dHpf <= 0.65) frac *= (1 - 0.08 * (1 - dHpf)); // Blood-Qi Flesh Crucible unyielding mitigation
      } else if (d.cult.path === 'GOD') {
        frac *= 0.91; // Divine Aegis Faith Ward
      } else if (d.cult.path === 'MECH_PUPPET' && CULT.ensureMechState) {
        const ms = CULT.ensureMechState(d);
        if (ms.integrity > 10) {
          const absRatio = (d.cult.sub === 'HEAVENLY_GOLEM' || d.cult.sub === 'IRON_COLOSSUS' || d.cult.sub === 'FORTRESS_BASTION_ARCHITECT' || ms.mode === 'BASTION' || ms.mode === 'AEGIS') ? 0.26 : 0.18;
          frac *= (1 - absRatio);
          ms.integrity = Math.max(0, ms.integrity - Math.max(1, Math.round(frac * 16)));
          ms.constructReadiness = ms.integrity;
          ms.charge = clamp((ms.charge || 0) + 8, 0, 100);
          ms.overclockReady = ms.charge >= 50;
          d.lastMechAbsorb = { t: W.t, absRatio, integrity: ms.integrity };
        }
      }
    }
    if (nonlethal) frac *= 0.55;
    const hm = C.hpMax(d), beastGuard = !d.foe && g.MARTIAL && g.MARTIAL.isBeast(a) ? g.MARTIAL.skillEffects(d).beastDamage : 1, dmg = hm * frac * beastGuard;
    a.fx = a.fx || {}; if (!o.silent) { a.fx = { t: W.t, text: o.label || (crit ? 'จุดตาย!' : type === 'p' ? W.rng.pick(FX_PHYS) : W.rng.pick(FX_MAG)) }; }
    d.fx = { t: W.t, text: (crit ? '✦' : '') + '-' + Math.max(1, Math.round(dmg)) };
    if (!a.foe) { a.h.state.energy = Math.max(0, a.h.state.energy - 0.15); (g.MARTIAL && g.MARTIAL.skillPractice ? g.MARTIAL.skillPractice : HC.practice)(a, (g.MARTIAL ? ({ FIST: 'FIST_PALM' }[g.MARTIAL.equippedType(a)] || g.MARTIAL.equippedType(a)) : g.AI.pickTeachSkill(a, a)), 1 / 90, 1.1); HC.trainBody(a, 'reflex', 0.1); a.lastHurt = null; }
    const killed = C.applyDamage(W, f, a, d, dmg);
    let lifesteal = 0, reflected = 0;
    if (!a.foe && !a.dead && a.cult && a.cult.path === 'DEMON' && dmg > 0) {
      const trA = CULT.trackRealm(a);
      const lsPct = clamp((trA && trA.realmBuffs && trA.realmBuffs.lifestealPct) ? trA.realmBuffs.lifestealPct : (a.cult.stage * 1.15), 1, 14);
      lifesteal = Math.max(1, Math.round(dmg * (lsPct / 100)));
      C.setHp(a, Math.min(C.hpMax(a), C.hp(a) + lifesteal));
      a.lastLifesteal = lifesteal;
    } else if (!a.foe && !a.dead && a.cult && a.cult.path === 'GOD' && dmg > 0 && o.isSkill) {
      const faithHeal = Math.max(1, Math.round(C.hpMax(a) * 0.028));
      C.setHp(a, Math.min(C.hpMax(a), C.hp(a) + faithHeal));
    }
    if (!o.noReflect && !d.foe && d.cult && d.cult.path === 'HEART_SOUL' && dmg > 0 && !a.dead) {
      const trD = CULT.trackRealm(d);
      const refPct = clamp((trD && trD.realmBuffs && trD.realmBuffs.reflectPct) ? trD.realmBuffs.reflectPct : (d.cult.stage * 1.3), 1, 15);
      reflected = Math.max(1, Math.min(Math.round(C.hpMax(a) * 0.18), Math.round(dmg * (refPct / 100))));
      d.lastReflect = reflected;
      C.applyDamage(W, f, d, a, reflected, 'สะท้อนจิต');
    }
    let resonanceTriggered = false;
    if (!o.noProc && dmg > 0) {
      if (resSet && resSet.active && resSet.pieces >= 3 && resSet.rider) {
        const rd = resSet.rider;
        const icdOk = !a._resRiderCd || W.t >= a._resRiderCd;
        if (icdOk && W.rng.chance(rd.chance || 0.35)) {
          a._resRiderCd = W.t + 5;
          resonanceTriggered = true;
          const tgt = rd.selfBuff ? a : d;
          if (C.alive(tgt)) {
            if (rd.status === 'burn' || rd.status === 'bleed' || rd.status === 'poison') {
              ST.addStatus(tgt, rd.status, rd.dur || 10, { per: 0.012, src: a.id });
            } else if (rd.status === 'leech') {
              C.setHp(a, Math.min(C.hpMax(a), C.hp(a) + Math.max(1, Math.round(dmg * 0.12))));
            } else {
              ST.addStatus(tgt, rd.status, rd.dur || 8);
            }
          }
          a.lastResonanceTrigger = { t: W.t, setId: resSet.setId, nameTh: resSet.nameTh, status: rd.status, descTh: rd.descTh, targetId: d.id };
        }
      }
      if (!o.noReflect && !d.foe && d.cult && d.cult.path === 'KARMA_SAMSARA' && (d.cult.sub === 'REVERSED_RETRIBUTION' || d.cult.sub === 'FATE_SEVERING_THREAD' || d.cult.sub === 'RED_THREAD_ARBITER') && dmg > 0 && !a.dead) {
        const kRef = Math.max(1, Math.min(Math.round(C.hpMax(a) * 0.16), Math.round(dmg * 0.14)));
        reflected += kRef;
        d.lastReflect = reflected;
        C.applyDamage(W, f, d, a, kRef, 'วิบากสะท้อน');
      }
      if (!o.isPetAssist && !a.foe && a.pets && a.pets.length && C.alive(d) && CULT.activePets) {
        const actPets = CULT.activePets(a);
        if (actPets.length > 0 && (!a._petStrikeCd || W.t >= a._petStrikeCd || o.isSkill)) {
          a._petStrikeCd = W.t + 3;
          const allocs = CULT.petCommandAllocation ? CULT.petCommandAllocation(a) : actPets.map(p => ({ pet: p, share: 1 / actPets.length }));
          let assistM = 0;
          let hasVenom = !!(a.cult && (a.cult.sub === 'SWARM_GU_HIVE_MASTER' || a.cult.sub === 'SWARM_INSECT_EMPEROR'));
          for (let pi = 0; pi < allocs.length; pi++) {
            const pt = allocs[pi].pet, sh = allocs[pi].share || (1 / actPets.length);
            const pMult = (0.18 + 0.035 * (pt.tier || 1) + 0.012 * (pt.level || 1)) * (pt.sovereignAwakened ? 1.25 : 1.0) * sh;
            assistM += pMult;
            if (pt.role === 'VENOM_SWARM' || pt.role === 'VENOM_STALKER') hasVenom = true;
            pt.exp = (pt.exp || pt.bondXp || 0) + 4;
            pt.bondXp = pt.exp;
            pt.fatigue = clamp((pt.fatigue || 0) + 1.2, 0, 100);
            if (pt.exp >= (pt.level || 1) * 25 && (pt.level || 1) < 9) {
              pt.level = (pt.level || 1) + 1;
              if (!pt.sovereignAwakened) pt.growthStage = Math.min(3, Math.max(1, Math.ceil(pt.level / 3)));
              ST.dirty(a);
            }
          }
          if (a.cult && a.cult.path === 'BEAST_SOVEREIGN') assistM *= (a.cult.sub === 'MYRIAD_BEAST_PACK' ? 1.38 : 1.22);
          assistM = clamp(assistM, 0.12, 0.85);
          const pRes = C.strike(W, f, a, d, { M: assistM, type: 'p', forced: true, noCounter: true, noReflect: true, noProc: true, isPetAssist: true, silent: true });
          if (hasVenom && C.alive(d)) {
            ST.addStatus(d, 'poison', 10, { per: 0.012, src: a.id });
          }
          a.lastPetAssist = { t: W.t, count: actPets.length, petNames: actPets.map(x => x.nameTh), dmg: pRes.dmg || 0 };
        }
      }
      runPassiveProcs(W, f, a, d, 'onHit', dmg);
      runPassiveProcs(W, f, d, a, 'onStruck', dmg);
    }
    return { hit: true, dmg, crit, killed, lifesteal, reflected, tacticalRelation: tac ? tac.relation : 'NEUTRAL', resonanceTriggered };
  };
  /* ---------- เลือกท่า ---------- */
  function chooseSkill(W, f, a, d, ctx) {
    const SK = SKs(), ST = STs(); if (ST.has(a, 'silence')) return null;
    const list = SK.list(a); if (!list.length) return null;
    const sa = ST.get(a), hpR = hpFrac(a), nonlethal = !f.serious, qi = a.foe ? 1e9 : (a.h.state.qi == null ? 1e9 : a.h.state.qi);
    const en = C.enemies(W, f, a.id), near = en.filter(x => Math.hypot(x.x - d.x, x.y - d.y) < 2.6).length;
    const aggr = a.foe ? 0.2 : (E(a, 'personality.aggression') - 50) / 200, caut = a.foe ? 0 : (E(a, 'personality.caution') - 50) / 200;
    const basicStat = Math.max(sa.atk, sa.matk), td = ST.get(d), tdp = C.power(d), self = C.power(a);
    const targetShielded = !!shieldOf(d) || ST.has(d, 'guardUp');
    const paTac = SK.weaponTacticalProfile ? SK.weaponTacticalProfile(a) : null;
    const pdTac = SK.weaponTacticalProfile ? SK.weaponTacticalProfile(d) : null;
    let best = null, bs = 1.15; ctx.cds = ctx.cds || {};
    for (const p of list) {
      if ((ctx.cds[p.id] || 0) > W.t) continue;
      if (p.tech && p.tech !== p.id && (ctx.cds['TECH_GCD:' + p.tech] || 0) > W.t) continue;
      if (!a.foe && g.MARTIAL && g.MARTIAL.skillEfficiency(a, p) <= 0) continue;
      const cost = a.foe ? 0 : SK.qiCost(a, p); if (qi < cost) continue;
      if (p.arch === 'forbid' && (nonlethal || (hpR > 0.45 && !(tdp > self * 1.5)))) continue;
      if (p.drawback && p.drawback.staminaCost && !a.foe && (a.h.state.energy || 0) < p.drawback.staminaCost + 8) continue;
      const syn = (!a.foe && g.MARTIAL && g.MARTIAL.skillSynergy) ? g.MARTIAL.skillSynergy(a, p) : null;
      const effWind = Math.max(2, (p.wind || 4) + (syn ? syn.windDelta : 0));
      const elemInter = g.ELEM ? g.ELEM.resolveCombatInteraction(a, d, p) : null;
      const elemDmgMult = elemInter ? elemInter.totalDamageMult : 1;
      let sc = 0; const stat = p.type === 'p' ? sa.atk : sa.matk, rel = stat / Math.max(1, basicStat), mas = a.foe ? 1 : SK.mastery(a, p);
      if (p.M) { const dmgEq = p.M * elemDmgMult * (p.hits || 1) * rel * mas * (p.aoe ? Math.max(1, near) : 1) + (p.dot || 0) * elemDmgMult * (syn ? syn.dotMult : 1) * rel * 0.8; sc = dmgEq * (4 / Math.max(3, effWind)) * 0.62; sc += aggr * 0.5; }
      if (p.arch === 'pierce') sc += clamp(td.def / Math.max(1, td.mdef), 0.5, 2) * 0.4;
      if (p.arch === 'control') sc = (ST.has(d, 'stun') || ST.has(d, 'silence') || ST.has(d, 'slow') ? 0.2 : 1.7) * (tdp > self * 0.5 ? 1 : 0.5);
      if (p.arch === 'dot') sc += (d.sx && d.sx.some(x => SK.STATUS[x.k] && SK.STATUS[x.k].dot && x.until > W.t) ? -1.5 : 0.7) + (hpFrac(d) > 0.5 ? 0.4 : -0.4);
      if (p.arch === 'drain') sc += (1 - hpR) * 1.6;
      if (p.arch === 'burst') sc += (hpFrac(d) > 0.35 ? 0.4 : -0.6) + aggr;
      if (p.arch === 'counter') sc = (ST.has(a, 'counter') ? 0 : 1.1 + caut) * (hpR < 0.9 ? 1.2 : 0.8) + (tdp > self * 0.8 ? 0.6 : 0);
      if (p.arch === 'guard' || p.arch === 'shield') sc = (ST.has(a, 'guardUp') ? 0 : (1 - hpR) * 4.2 + caut * 1.4 - 0.5);
      if (p.arch === 'execute') sc += (hpFrac(d) < 0.45 ? 1.4 : -0.2) + aggr * 0.6;
      if (p.arch === 'snipe' || p.arch === 'charge') sc += clamp(td.def / Math.max(1, td.mdef), 0.5, 1.8) * 0.35;
      if (p.arch === 'heal') {
        const ally = lowestAlly(W, f, a);
        const lowestRatio = ally ? Math.min(hpR, hpFrac(ally)) : hpR;
        sc = lowestRatio < 0.72 ? (0.72 - lowestRatio) * 11 : 0;
        if (lowestRatio < 0.38) sc += 3.5;
      }
      if (p.arch === 'support' || p.arch === 'buff') {
        const allies = C.alliesOf(W, f, a.id);
        const buffKind = p.grantBuff || (p.support && p.support.kind) || 'morale';
        const needBuff = allies.some(u => !(ST.has(u, buffKind) || (ST.hasBuff && ST.hasBuff(u, buffKind, W.t))));
        sc = needBuff ? (allies.length > 1 ? 2.8 : 1.2) + aggr * 0.4 : 0.2;
      }
      if (p.arch === 'summon') {
        const allies = C.alliesOf(W, f, a.id);
        const hasSummon = allies.some(u => u.summonerId === a.id);
        sc = hasSummon ? 0 : (2.4 + (en.length > 1 ? 1.0 : 0.3) + caut * 0.8);
      }
      if (p.arch === 'channel') {
        sc = (ctx.channeling ? 0 : 2.2) + (hpR > 0.4 ? 0.6 : -0.6) + aggr * 0.5;
      }
      if (p.arch === 'evade') sc = (ST.has(a, 'evadeUp') ? 0 : (hpR < 0.5 ? (0.5 - hpR) * 5 : 0) + (en.length > 2 ? 0.8 : 0) + caut);
      if (p.arch === 'forbid') sc += (hpR < 0.4 ? 2.2 : 0.4) + aggr + (tdp > self * 1.5 ? 1.2 : 0);
      // Tactical role bonuses & Counter-Weapon AI (v2.0.5 Pillar B)
      if (p.shatterShield && targetShielded) sc += 3.2;
      if (paTac && pdTac) {
        const pa = paTac, pd = pdTac;
        if ((pd.reachClass === 'RANGED_KITE' || pd.reachClass === 'LONG_POLEARM') && ['charge', 'evade', 'flurry'].includes(p.arch)) {
          sc += 1.45; // Prioritize gap-closers & lightness techniques against polearms and ranged kiters
        }
        if (pa.reachClass === 'HEAVY_BREAKER' && (targetShielded || pd.hasDefenseTech) && ['strike', 'execute', 'pierce', 'burst'].includes(p.arch)) {
          sc += 1.65; // Heavy weapon prioritizes guard-shattering strikes against shielded/defensive foes
        }
        if (pa.reachClass === 'LONG_POLEARM' && (pd.reachClass === 'SHORT_SWIFT' || pd.reachClass === 'HEAVY_BREAKER') && ['pierce', 'sweep', 'control'].includes(p.arch)) {
          sc += 0.95; // Polearm prioritizes reach control & first-strike thrusts
        }
        if (pa.reachClass === 'RANGED_KITE' && a._closedOnBy !== d.id && ['snipe', 'barrage', 'blast', 'channel'].includes(p.arch)) {
          sc += 1.15; // Ranged weapon capitalizes on kiting window
        }
      }
      if (p.aiRole === 'anti_armor' && td.def > td.mdef * 1.1) sc += 0.7;
      if (p.aiRole === 'finisher' && hpFrac(d) < 0.45) sc += 1.1;
      if (p.aiRole === 'opener' && hpFrac(d) > 0.75) sc += 0.6;
      if (p.aiRole === 'sustain' && (hpR < 0.65 || (!a.foe && qi < CULT.qiMax(a) * 0.45))) sc += 1.6;
      const archMeta = SK.ARCH && SK.ARCH[p.arch];
      const offensivePayload = archMeta
        ? archMeta.off === true
        : ((p.M || 0) > 0 || (p.dot || 0) > 0 || !!p.ctrl);
      if (offensivePayload && elemInter && elemInter.counterRelation === 'COUNTER_ADVANTAGE') sc += 0.38;
      else if (offensivePayload && elemInter && elemInter.counterRelation === 'RESISTED') sc -= 0.25;
      // Preserve the existing weapon-type synergy preference for utility/support skills too.
      if (syn && syn.matched) sc += 0.28;
      sc *= 0.88 + W.rng.next() * 0.24;
      if (sc > bs) { bs = sc; best = p; }
    }
    return best;
  }
  C.chooseSkill = chooseSkill;
  function lowestAlly(W, f, a) { const side = C.sideOf(f, a.id) === 'A' ? f.A : f.B; let w = null, m = 2; side.forEach(id => { const u = C.unit(W, id); if (!C.alive(u) || u.id === a.id) return; const r = hpFrac(u); if (r < m) { m = r; w = u; } }); return w; }
  function useSkill(W, f, a, d, p, ctx) {
    if (W && (W.h || W.foe) && f && (f.h || f.foe) && a && a.id && (!p || !p.id)) {
      const realW = d || { t: (g.STATS && g.STATS.now) || 0, rng: { chance: () => false, next: () => 0.5 }, byId: {} };
      const realA = W;
      const realD = f;
      const realP = a;
      W = realW;
      a = realA;
      d = realD;
      p = realP;
      f = { id: 0, serious: false, A: [a.id], B: [d.id] };
    }
    ctx = ctx || (a && a.act && a.act.ctx) || {};
    const SK = SKs(), ST = STs(), sa = ST.get(a);
    const elemInter = g.ELEM ? g.ELEM.resolveCombatInteraction(a, d, p) : null;
    p = Object.assign({}, p, {
      elementAccAdd: elemInter ? elemInter.accBonus : 0,
      elementControlChanceMult: elemInter ? elemInter.controlChanceMult : 1
    });
    const syn = (!a.foe && g.MARTIAL && g.MARTIAL.skillSynergy) ? g.MARTIAL.skillSynergy(a, p) : null;
    const elemDmgMult = elemInter ? elemInter.totalDamageMult : 1;
    const elemHealMult = elemInter && elemInter.healSupportMult ? elemInter.healSupportMult : 1;
    const masBase = a.foe ? 1 : (SK.masteryBase ? SK.masteryBase(a, p) : 1);
    if (!a.foe && g.MARTIAL) {
      const efficiency = g.MARTIAL.skillEfficiency(a, p);
      if (!efficiency) return;
      const dMult = efficiency * (syn ? syn.dmgMult : 1) * elemDmgMult;
      const shMult = efficiency * (syn ? syn.shieldMult : 1) * elemHealMult;
      const hlMult = efficiency * (syn ? syn.healMult : 1) * elemHealMult;
      const dtMult = efficiency * (syn ? syn.dotMult : 1);
      p = Object.assign({}, p, {
        M: p.M * efficiency,
        synDmgMult: (syn ? syn.dmgMult : 1) * elemDmgMult,
        shield: (p.shield || 0) * shMult,
        heal: (p.heal || 0) * hlMult,
        dot: (p.dot || 0) * dtMult * elemDmgMult,
        pen: (p.pen || 0) + (syn ? syn.penAdd : 0),
        critAdd: (p.critAdd || 0) + (syn ? syn.critAdd : 0),
        critDmgAdd: (p.critDmgAdd || 0) + (syn ? syn.critDmgAdd : 0),
        wind: Math.max(2, (p.wind || 3) + (syn ? syn.windDelta : 0)),
        qiRestorePct: (p.qiRestorePct || 0) + (syn ? syn.qiRestorePct : 0)
      });
      if (p.support && syn && syn.extraSupportDur) {
        p.support = Object.assign({}, p.support, { dur: (p.support.dur || 14) + syn.extraSupportDur });
      }
      if (p.channel && typeof p.channel === 'object') {
        p.channel = Object.assign({}, p.channel, { tickM: p.channel.tickM * dMult * masBase, finishM: p.channel.finishM * dMult * masBase });
      }
    } else if (a.foe) {
      // Foes do not use MARTIAL efficiency, but their species/technique element
      // must still modify real damage rather than remaining a UI-only matchup.
      p.synDmgMult = (p.synDmgMult || 1) * elemDmgMult;
      p.dot = (p.dot || 0) * elemDmgMult;
      if (p.shield) p.shield = (p.shield || 0) * elemHealMult;
      if (p.heal) p.heal = (p.heal || 0) * elemHealMult;
      if (p.channel && typeof p.channel === 'object') {
        p.channel = Object.assign({}, p.channel, {
          tickM: p.channel.tickM * elemDmgMult,
          finishM: p.channel.finishM * elemDmgMult
        });
      }
    }
    ctx.cds = ctx.cds || {};
    ctx.cds[p.id] = W.t + Math.max(Math.round(p.cd * 0.5), Math.round(p.cd * 100 / sa.cast));
    if (p.tech && p.tech !== p.id) {
      ctx.cds['TECH_GCD:' + p.tech] = W.t + Math.max(2, Math.round((p.wind || 3) * 80 / sa.cast));
    }
    if (!a.foe) {
      const rawCost = SK.qiCost(a, p);
      const cost = Math.max(0, Math.round(rawCost * (elemInter ? elemInter.costMult : 1)));
      a.h.state.qi = Math.max(0, (a.h.state.qi == null ? cost : a.h.state.qi) - cost);
      const techId = p.tech || p.id;
      const masGain = syn ? syn.masteryMult : 1;
      W._inSkillCast = true;
      try {
        if (SK.gainMastery) SK.gainMastery(W, a, techId, masGain);
        else { a.cult.tm = a.cult.tm || {}; a.cult.tm[techId] = (a.cult.tm[techId] || 0) + masGain; }
      } finally { W._inSkillCast = false; }
      if (g.ELEM && g.ELEM.gainMastery) {
        g.ELEM.gainMastery(a, CULT.tech(techId) || p, 'skill_cast', W, { sourceId: techId });
      }
      if (p.id !== techId) { a.cult.tm[p.id] = (a.cult.tm[p.id] || 0) + masGain; }
      if (p.qiRestorePct && a.cult) {
        const qm = CULT.qiMax(a);
        a.h.state.qi = Math.min(qm, (a.h.state.qi || 0) + qm * p.qiRestorePct);
      }
      if (syn && syn.cleanseHeartDemon && a.h && a.h.state) {
        a.h.state.heartDemon = Math.max(0, (a.h.state.heartDemon || 0) - syn.cleanseHeartDemon);
      }
      if (p.drawback) {
        if (p.drawback.staminaCost) a.h.state.energy = Math.max(0, (a.h.state.energy || 0) - p.drawback.staminaCost);
        if (p.drawback.exposeTicks) ST.addStatus(a, 'exposed', p.drawback.exposeTicks);
        if (p.drawback.heartDemonAdd) a.h.state.heartDemon = clamp((a.h.state.heartDemon || 0) + p.drawback.heartDemonAdd, 0, 100);
      }
    }
    const label = p.moves && p.moves.length ? W.rng.pick(p.moves) : p.nameTh;
    a.fx = { t: W.t, text: p.icon + ' ' + label };
    // One lightweight visual event per actual activation; text/damage feedback stays independent.
    const tech = p.tech && CULT.tech(p.tech), target = p.self || p.team || ['heal', 'support', 'buff', 'summon'].includes(p.arch) ? a : d || a;
    const isForbid = p.arch === 'forbid' || !!(tech && (tech.cat === 'FORBIDDEN_ART' || tech.cat === 'FORBIDDEN_TECHNIQUE'));
    const fxMotif = p.fxKind || (tech && tech.fxKind) || (isForbid ? 'forbidden' : 'normal');
    a.castFx = {
      t: W.t,
      kind: isForbid ? 'forbidden' : 'normal',
      motif: fxMotif,
      fxKind: p.fxKind || (tech && tech.fxKind) || null,
      legendary: !!(p.legendary || (tech && tech.legendary)),
      techId: tech ? tech.id : p.id,
      moveId: p.moveId || p.id,
      x: target.x,
      y: target.y,
      seq: ((a.castFx && a.castFx.seq) || 0) + 1
    };
    if (p.shatterShield && d) {
      ST.clearStatus(d, x => x.k === 'shield' || x.k === 'guardUp');
      if (d.shieldBp) d.shieldBp = 0;
    }
    const hm = C.hpMax(a);
    if (!a.foe && a.cult) {
      if (a.cult.path === 'KARMA_SAMSARA' && CULT.ensureKarmaState) {
        const ks = CULT.ensureKarmaState(a);
        const nextStance = (p.arch === 'heal' || p.arch === 'support' || p.arch === 'buff') ? 'DEVA'
          : (p.arch === 'execute' || p.arch === 'burst' || p.arch === 'forbid') ? 'ASURA'
          : (p.arch === 'guard' || p.arch === 'shield' || p.arch === 'counter') ? 'HUMAN'
          : (p.arch === 'drain' || p.arch === 'dot') ? 'PRETA'
          : (p.arch === 'pierce' || p.arch === 'control') ? 'NARAKA' : 'ANIMAL';
        if (ks.stance !== nextStance) { ks.stance = nextStance; ks.activeRealmStance = nextStance; ST.dirty(a); }
        if (ks.debtPool > 0 && (p.arch === 'heal' || p.arch === 'guard' || p.arch === 'shield' || a.cult.sub === 'LOTUS_MERCY_PURIFIER' || a.cult.sub === 'BODHI_VOW_GUARDIAN')) {
          const spent = ks.debtPool;
          ks.debtPool = 0;
          ks.karmicDebt = 0;
          const bonusHeal = Math.max(2, Math.round(spent * 0.85));
          C.setHp(a, Math.min(hm, C.hp(a) + bonusHeal));
          ST.addStatus(a, 'shield', 12, { amt: Math.round(spent * 0.65) });
          if (a.h && a.h.state) a.h.state.heartDemon = Math.max(0, (a.h.state.heartDemon || 0) - 4);
          a.lastKarmaRelease = { t: W.t, mode: 'MERCY_LOTUS', spent, bonusHeal };
        }
      }
      if (a.cult.path === 'BEAST_SOVEREIGN') {
        if ((a.cult.sub === 'SYMBIOTIC_BEAST_WARRIOR' || a.cult.sub === 'SYMBIOTIC_FANG_FUSION' || p.tech === 'ART_BEAST_SOV_005' || p.tech === 'INNATE_SYMBIOTIC_CLAW_FUSION') && CULT.activePets && CULT.activePets(a).length > 0) {
          a._beastFusedUntil = W.t + 16;
          a.lastBeastFusion = { t: W.t, until: a._beastFusedUntil };
          ST.dirty(a);
        }
        if (d && d.wild && !d.captured && (p.tech === 'ART_BEAST_SOV_001' || (f && f.ctx && f.ctx.tameIntent)) && C.hp(d) <= C.hpMax(d) * 0.45 && CULT.attemptTameBeast) {
          const tr = CULT.attemptTameBeast(W, a, d);
          if (tr && tr.ok) {
            d.fx = { t: W.t, text: '🐾 พันธสัญญาสำเร็จ!' };
            a.fx = { t: W.t, text: '🐾 สยบ ' + d.name };
            return;
          }
        }
      }
    }
    ST.now = W.t;
    const buffDur = (p.support && p.support.dur) || (14 + (p.tier || 1) * 2);
    if (p.arch === 'guard' || p.arch === 'shield') {
      ST.addStatus(a, 'guardUp', 12, null, W.t);
      if (p.shield > 0 || !p.qiRestorePct) ST.addStatus(a, 'shield', 12, { amt: hm * (p.shield || 0.15) }, W.t);
      if (p.grantBuff && ST.applyNamedBuff) ST.applyNamedBuff(a, p.grantBuff, buffDur, W.t, { casterId: a.id });
      if (p.heal > 0) C.setHp(a, Math.min(hm, C.hp(a) + Math.max(1, Math.round(hm * p.heal))));
      return;
    }
    if (p.arch === 'evade') {
      ST.addStatus(a, 'evadeUp', 14, null, W.t);
      if (p.grantBuff && ST.applyNamedBuff) ST.applyNamedBuff(a, p.grantBuff, buffDur, W.t, { casterId: a.id });
      if (d) { d._closedOnBy = a.id; a._gapClosedOn = d.id; }
      return;
    }
    if (p.arch === 'counter') {
      ST.addStatus(a, 'counter', 10, { M: p.M, type: p.type, pen: p.pen }, W.t);
      if (p.grantBuff && ST.applyNamedBuff) ST.applyNamedBuff(a, p.grantBuff, buffDur, W.t, { casterId: a.id });
      return;
    }
    if (p.arch === 'heal') {
      const healTargets = p.aoe ? C.alliesOf(W, f, a.id) : [(() => { const ally = lowestAlly(W, f, a); return (ally && hpFrac(ally) < hpFrac(a) - 0.05) ? ally : a; })()];
      const sageBonus = (!a.foe && a.cult && a.cult.path === 'SAGE_SUPPORT') ? 1.18 : 1.0;
      healTargets.forEach((tgt, idx) => {
        if (!tgt || !C.alive(tgt)) return;
        if (idx === 0) { a.castFx.x = tgt.x; a.castFx.y = tgt.y; }
        const thm = C.hpMax(tgt);
        const healAmt = Math.max(1, Math.round(thm * (p.heal || 0.22) * sageBonus));
        C.setHp(tgt, Math.min(thm, C.hp(tgt) + healAmt));
        if (p.shield > 0) ST.addStatus(tgt, 'shield', 12, { amt: Math.round(thm * p.shield) }, W.t);
        ST.clearStatus(tgt, x => { const S = SK.STATUS[x.k]; return S && (S.dot || ['slow', 'weaken', 'blind', 'armorbreak', 'mdefbreak', 'silence', 'stun'].includes(x.k)); });
        const bKind = p.grantBuff || ((!a.foe && a.cult && a.cult.path === 'SAGE_SUPPORT') ? 'vitalRegen' : null);
        if (bKind && ST.applyNamedBuff) ST.applyNamedBuff(tgt, bKind, buffDur, W.t, { casterId: a.id });
        tgt.fx = { t: W.t, text: '💚 +' + healAmt };
      });
      return;
    }
    if (p.arch === 'support' || p.arch === 'buff') {
      const allies = C.alliesOf(W, f, a.id);
      const buffKind = p.grantBuff || (p.support && p.support.kind) || 'morale';
      const dur = buffDur;
      allies.forEach(ally => {
        if (!C.alive(ally)) return;
        const ahm = C.hpMax(ally);
        if (p.heal > 0) C.setHp(ally, Math.min(ahm, C.hp(ally) + Math.max(1, Math.round(ahm * p.heal))));
        if (p.shield > 0) ST.addStatus(ally, 'shield', dur, { amt: Math.round(ahm * p.shield) }, W.t);
        if (ST.BUFF_CATALOG && ST.BUFF_CATALOG[buffKind] && ST.applyNamedBuff) {
          ST.applyNamedBuff(ally, buffKind, dur, W.t, { casterId: a.id });
        } else {
          ST.addStatus(ally, buffKind, dur, null, W.t);
        }
        ally.fx = { t: W.t, text: '✨ ' + (SK.STATUS[buffKind] ? SK.STATUS[buffKind].nameTh : 'หนุนทัพ') };
      });
      return;
    }
    if (p.grantBuff && ST.applyNamedBuff && !a.foe) {
      ST.applyNamedBuff(a, p.grantBuff, buffDur, W.t, { casterId: a.id });
    }
    if (p.arch === 'summon') {
      const side = C.sideOf(f, a.id);
      const sConf = p.summon || { dur: 18, hpPct: 0.4, statPct: 0.55, nameSuffix: 'ร่างอวตาร' };
      const sId = 'SUM_' + a.id + '_' + W.t;
      const sHp = Math.max(10, Math.round(C.hpMax(a) * sConf.hpPct));
      const sName = sConf.nameSuffix + 'ของ' + C.name(a);
      const summonUnit = {
        id: sId,
        name: sName,
        isSummon: true,
        summonerId: a.id,
        side,
        foe: true,
        tier: a.cult ? a.cult.stage : (a.tier || 1),
        hp: sHp,
        hpMax: sHp,
        speed: 1.0,
        x: a.x + (W.rng.next() - 0.5) * 1.5,
        y: a.y + (W.rng.next() - 0.5) * 1.5,
        px: a.x,
        py: a.y,
        act: { id: 'fight', ctx: { fid: f.id, target: d ? d.id : null, cd: 0 } },
        dur: sConf.dur,
        skl: [
          { id: 'S_' + sId + '_atk', nameTh: 'ฟาดฟัน', tier: 1, arch: 'strike', archTh: 'ท่าสังหารเดี่ยว', icon: '🗡️', type: p.type || 'p', cd: 8, wind: 3, hits: 1, M: 0.85, costPct: 0, moves: ['ฟาดพลัง'] }
        ]
      };
      W.foeById = W.foeById || {};
      W.foeById[sId] = summonUnit;
      W.foes = W.foes || [];
      if (!W.foes.some(x => x.id === sId)) W.foes.push(summonUnit);
      if (!f[side].includes(sId)) f[side].push(sId);
      a.fx = { t: W.t, text: '👥 อัญเชิญ' + sConf.nameSuffix };
      summonUnit.fx = { t: W.t, text: '⚡ ปรากฏกาย' };
      return;
    }
    if (p.arch === 'channel') {
      const ch = p.channel || { ticks: 3, tickM: 0.5, finishM: 1.0, interruptForce: 15 };
      ctx.channeling = {
        skillId: p.id,
        skill: p,
        targetId: d.id,
        ticksLeft: ch.ticks,
        totalTicks: ch.ticks,
        tickM: ch.tickM,
        finishM: ch.finishM,
        interruptForce: ch.interruptForce
      };
      ST.addStatus(a, 'channeling', ch.ticks * 4 + 2);
      a.fx = { t: W.t, text: '🌀 เริ่มร่าย ' + p.nameTh };
      return;
    }
    // ท่าโจมตี
    const targets = p.aoe ? C.enemies(W, f, a.id).filter(x => Math.hypot(x.x - d.x, x.y - d.y) < 2.6) : [d]; if (!targets.includes(d)) targets.unshift(d);
    const mas = masBase; let dealt = 0;
    targets.slice(0, 6).forEach(t => {
      if (!C.alive(t)) return;
      for (let i = 0; i < (p.hits || 1); i++) {
        if (!C.alive(t)) break;
        const wpnAcc = (!a.foe && g.MARTIAL && g.MARTIAL.weaponCompatibility) ? (g.MARTIAL.weaponCompatibility(a, p.tech || p.id).accDelta || 0) : 0;
        const r = C.strike(W, f, a, t, { M: p.M * mas * (p.aoe && t !== d ? 0.8 : 1), synDmgMult: p.synDmgMult || 1, accAdd: (p.elementAccAdd || 0) + wpnAcc, type: p.type, pen: p.pen, label: i === 0 ? label : null, silent: i > 0, critAdd: p.critAdd || 0, critDmgAdd: p.critDmgAdd || 0, isSkill: true, arch: p.arch, skill: p });
        if (r.hit) { dealt += r.dmg; applyRiders(W, f, a, t, p, r); }
      }
    });
    if (!a.foe && !a.dead && a.cult && a.cult.path === 'KARMA_SAMSARA' && (a.cult.sub === 'PAST_LIFE_MIRROR' || a.cult.sub === 'PAST_LIFE_CHRONICLER' || p.tech === 'ART_KARMA_SAMSARA_005' || p.tech === 'ART_KARMA_005') && dealt > 0 && d && C.alive(d)) {
      const echoRes = C.strike(W, f, a, d, { M: (p.M || 1) * 0.35, type: p.type || 'm', pen: p.pen || 0, forced: true, noCounter: true, noReflect: true, noProc: true, silent: true });
      if (echoRes.hit) { dealt += echoRes.dmg; a.lastPastLifeEcho = { t: W.t, skillId: p.id, dmg: echoRes.dmg }; }
    }
    if (p.steal && dealt > 0 && !a.dead) C.setHp(a, Math.min(C.hpMax(a), C.hp(a) + dealt * p.steal));
    if (p.recoil && !a.dead) { ST.addStatus(a, 'exposed', 12); const rd = C.hpMax(a) * p.recoil; if (C.hp(a) - rd > 1) C.setHp(a, C.hp(a) - rd); else C.setHp(a, 1); }
  }
  C.useSkill = useSkill;
  function applyRiders(W, f, a, t, p, r) {
    const SK = SKs(), ST = STs(); if (!C.alive(t) && t.dead) return;
    const ratio = clamp(C.power(a) / Math.max(1, C.power(t)), 0.3, 1.8);
    if (p.arch === 'pierce') ST.addStatus(t, 'armorbreak', 12);
    if (p.arch === 'dot') { const k = p.dotKind || 'bleed'; ST.addStatus(t, k, 12, { per: Math.min(0.06, (p.dot || 1) * 0.12 * (ST.get(a)[p.type === 'p' ? 'atk' : 'matk'] / Math.max(1, Math.max(ST.get(a).atk, ST.get(a).matk))) / 12), src: a.id }); }
    const elementProcMult = clamp(Number.isFinite(p.elementControlChanceMult) ? p.elementControlChanceMult : 1, 0.75, 1.25);
    if (p.ctrl) {
      const hasClarity = !t.foe && ST.hasBuff && ST.hasBuff(t, 'clarityLotus', W.t);
      const ctrlResistMult = hasClarity ? 0.72 : 1.0;
      const ok = W.rng.next() < clamp(0.78 * Math.pow(ratio, 0.7) * elementProcMult * ctrlResistMult, 0.08, 0.95);
      if (!ok) { t.fx = { t: W.t, text: 'ต้านทาน' }; return; }
      if (p.ctrl === 'stun' || p.ctrl === 'silence') C.interruptChannel(W, f, t, 'ถูกสะกดขัดจังหวะ');
      let dur = { stun: 4 + Math.floor(p.tier / 2), slow: 14, silence: 10, weaken: 12, blind: 12 }[p.ctrl] || 8;
      if (!t.foe && t.cult && (t.cult.path === 'BODY' || (t.cult.path === 'HEART_SOUL' && p.ctrl === 'silence'))) dur = Math.max(2, Math.round(dur * 0.75));
      if (hasClarity) dur = Math.max(2, Math.round(dur * 0.75));
      if (p.ctrl === 'burn' || p.ctrl === 'bleed') ST.addStatus(t, p.ctrl, 12, { per: 0.012 + 0.003 * p.tier, src: a.id });
      else ST.addStatus(t, p.ctrl, dur || 8);
      return;
    }
    if (p.rider && W.rng.chance(clamp(0.38 * elementProcMult, 0.1, 0.65))) {
      const k = p.rider;
      if (k === 'burn' || k === 'bleed') ST.addStatus(t, k, 10, { per: 0.006 + 0.0015 * p.tier, src: a.id });
      else if (k === 'critUp' || k === 'haste') ST.addStatus(a, k, 8);
      else if (k === 'leech') C.setHp(a, Math.min(C.hpMax(a), C.hp(a) + r.dmg * 0.08));
      else ST.addStatus(t, k, 10);
    }
  }
  C.statusTick = (W, f, u) => {
    const ST = STs(); ST.now = W.t;
    if (ST.purgeExpired) ST.purgeExpired(u, W.t);
    if (!u.sx || !u.sx.length) return;
    const SK = SKs(); const keep = [];
    u.sx.forEach(x => {
      if (x.until <= W.t) return;
      keep.push(x);
      const S = SK.STATUS[x.k];
      if (!S || u.dead) return;
      if (S.dot && x.per) {
        const src = x.src ? C.unit(W, x.src) : null;
        C.applyDamage(W, f, src && !src.dead ? src : null, u, C.hpMax(u) * x.per * (f.serious ? 1 : 0.55) * (src && !src.foe && g.MARTIAL && ['poison','bleed'].includes(x.k) ? g.MARTIAL.skillEffects(src).poisonPower : 1));
        u.fx = { t: W.t, text: S.icon };
      } else if (S.hot) {
        const hotAmt = Math.max(1, Math.round(C.hpMax(u) * (x.per || 0.035)));
        C.setHp(u, Math.min(C.hpMax(u), C.hp(u) + hotAmt));
        u.fx = { t: W.t, text: S.icon + ' +' + hotAmt };
      }
    });
    if (keep.length !== u.sx.length) { u.sx = keep; ST.dirty(u); }
  };
  C.interruptChannel = (W, f, u, reason) => {
    if (!u.act || !u.act.ctx || !u.act.ctx.channeling) return false;
    const ch = u.act.ctx.channeling;
    STs().clearStatus(u, x => x.k === 'channeling');
    u.act.ctx.cds = u.act.ctx.cds || {};
    u.act.ctx.cds[ch.skillId] = W.t + Math.round((ch.skill.cd || 16) * 0.7);
    delete u.act.ctx.channeling;
    u.fx = { t: W.t, text: '⚡ เสียสมาธิ!' };
    return true;
  };
  C.resolveChannelTick = (W, f, a, ctx) => {
    if (!ctx.channeling) return;
    const ch = ctx.channeling;
    const t = C.unit(W, ch.targetId);
    if (!C.alive(t)) {
      STs().clearStatus(a, x => x.k === 'channeling');
      delete ctx.channeling;
      return;
    }
    const isFinal = ch.ticksLeft <= 1;
    const mult = isFinal ? ch.finishM : ch.tickM;
    const r = C.strike(W, f, a, t, {
      M: mult,
      accAdd: ch.skill.elementAccAdd || 0,
      type: ch.skill.type || 'm',
      pen: ch.skill.pen || 0,
      label: isFinal ? '💥 ' + ch.skill.nameTh + ' ปะทุ!' : '🌀 คลื่นพลัง (' + (ch.totalTicks - ch.ticksLeft + 1) + '/' + ch.totalTicks + ')'
    });
    if (r.hit) applyRiders(W, f, a, t, ch.skill, r);
    ch.ticksLeft--;
    if (ch.ticksLeft <= 0 || !C.alive(t)) {
      STs().clearStatus(a, x => x.k === 'channeling');
      delete ctx.channeling;
      a.fx = { t: W.t, text: '✨ ปลดปล่อยสมบูรณ์' };
    }
  };
  C.attack = (W, f, a, d) => {
    const ST = STs(); a.fx = a.fx || {};
    const ctx = a.act && a.act.ctx ? a.act.ctx : {};
    if (ST.has(a, 'stun')) {
      if (ctx.channeling) C.interruptChannel(W, f, a, 'ติดมึนงง');
      a.fx = { t: W.t, text: '💫' };
      return 3;
    }
    if (ctx.channeling) {
      if (ST.has(a, 'silence')) {
        C.interruptChannel(W, f, a, 'ถูกผนึกวิชา');
        return 3;
      }
      C.resolveChannelTick(W, f, a, ctx);
      const sa = ST.get(a);
      return clamp(Math.round(250 / sa.cast), 2, 6);
    }
    const sa = ST.get(a), p = chooseSkill(W, f, a, d, ctx);
    if (p) { useSkill(W, f, a, d, p, ctx); return clamp(Math.round(p.wind * 100 / sa.cast), 2, 18); }
    C.strike(W, f, a, d, { M: 1 });
    return clamp(Math.round(400 / sa.cast), 2, 9);
  };
  C.slay = (W, f, killer, victim) => {
    victim.dead = true;
    if (victim.isSummon) {
      if (victim.fx) victim.fx = { t: W.t, text: '💨 สลายร่าง' };
      return;
    }
    if (!killer.foe && !killer.dead && killer.cult && killer.cult.path === 'DEMON') {
      const vTier = victim.tier || (victim.cult && victim.cult.stage) || 1;
      const gainAmt = 3 + vTier * 2.5;
      CULT.gain(killer, gainAmt);
      const qm = CULT.qiMax(killer);
      killer.h.state.qi = Math.min(qm, (killer.h.state.qi || 0) + qm * 0.18);
      killer.h.state.heartDemon = clamp((killer.h.state.heartDemon || 0) + 1.5, 0, 100);
      killer.stats = killer.stats || {};
      killer.stats.demonHarvest = (killer.stats.demonHarvest || 0) + Math.round(gainAmt);
    }
    if (victim.foe) {
      W.log('combat', C.name(killer) + ' สังหาร' + victim.name, killer.foe ? [] : [killer.id]);
      if (!killer.foe) { killer.stats = killer.stats || {}; killer.stats.kills = (killer.stats.kills || 0) + 1; HC.experience(killer, 'victory', 0.6); killer.merit += 3 + victim.tier * 2; }
      return;
    }
    AI.kill(W, victim, killer.foe ? 'ถูก' + killer.name + 'สังหาร' : 'ถูก' + killer.h.name.given + 'สังหารในการดวล');
    if (!killer.foe) { HC.experience(killer, 'killed', 0.8); const r = SECT.rel(killer, victim.id); AI.mem(W, killer, 'ปลิดชีพ ' + victim.h.name.given, 1, victim.id); killer.stats = killer.stats || {}; killer.stats.kills = (killer.stats.kills || 0) + 1; }
  };

  /* พฤติกรรมต่อนาทีของผู้ต่อสู้ที่เป็น NPC */
  C.fightStep = (W, n) => {
    const f = C.fightOf(W, n);
    if (!f || f.over) { C.leave(W, n); return; }
    if (n.dead) return;
    if (n.yield || n.fled) { // ยอมแพ้/หนี: ถอยออกจากวงและพักรักษา
      if (n.fled && !n.fleeTo) { const b = W.map.byId.infirmary; n.fleeTo = { x: b.door.x, y: b.door.y }; AI.goTo(W, n, n.fleeTo.x, n.fleeTo.y); }
      if (n.path) AI.stepMove(W, n); return;
    }
    const ctx = n.act.ctx; C.statusTick(W, f, n); if (n.dead || n.yield || n.fled) return;
    runPassiveProcs(W, f, n, null, 'combatTick', 0);
    if (n.h.state.qi != null && n.cult) { const qm = CULT.qiMax(n); const hasConduit = STs().hasBuff && STs().hasBuff(n, 'qiConduit', W.t); const qRegen = (n.cult.path === 'XIAN' ? 0.0075 : 0.006) + (hasConduit ? 0.015 : 0); n.h.state.qi = Math.min(qm, n.h.state.qi + qm * qRegen); }
    if (f.state === 'gather') {
      const ar = f.arena; if (Math.hypot(n.x - ar.x, n.y - ar.y) > 5 + (f.A.indexOf(n.id) + f.B.indexOf(n.id) + 1) % 3) { if (!n.path) AI.goTo(W, n, Math.floor(ar.x + (C.sideOf(f, n.id) === 'A' ? -3 : 3)), Math.floor(ar.y)); AI.stepMove(W, n); } else n.path = null;
      return;
    }
    let t = C.unit(W, ctx.target);
    if (!C.alive(t)) { const en = C.enemies(W, f, n.id); if (!en.length) return; en.sort((a, b) => Math.hypot(a.x - n.x, a.y - n.y) - Math.hypot(b.x - n.x, b.y - n.y)); t = en[0]; ctx.target = t.id; n.path = null; }
    const d = Math.hypot(t.x - n.x, t.y - n.y);
    const wProf = (SKs() && SKs().weaponTacticalProfile) ? SKs().weaponTacticalProfile(n) : null;
    const engageLim = (wProf && n._closedOnBy !== t.id) ? (wProf.engageRange || 1.7) : 1.7;
    if (d > engageLim) { moveToward(W, n, t.x, t.y, true); n.face = t.x >= n.x ? 1 : -1; return; }
    n.face = t.x >= n.x ? 1 : -1; n.path = null;
    if (--ctx.cd > 0) return;
    if (g.CPE && g.CPE.fightUse(W, n, ctx)) { ctx.cd = 2; return; }
    ctx.cd = C.attack(W, f, n, t);
  };
  C.leave = (W, n) => {
    if (n.act && n.act.ctx && n.act.ctx.channeling) delete n.act.ctx.channeling;
    if (n.sx && n.sx.length) { n.sx = n.sx.filter(x => x && x.fromBuffCatalog && x.until > W.t); STs().dirty(n); }
    n.run = false; n.fleeTo = null; n.yield = false; n.fled = false; n.path = null; n.lastHurtBy = null; n._closedOnBy = null; n._gapClosedOn = null;
    n.act = { id: 'idle', stage: 'do', left: 15, total: 15, ctx: {}, why: [] };
  };

  /* พฤติกรรมศัตรู */
  C.foeStep = (W, u) => {
    if (u.dead || u.gone) return;
    u.px = u.x; u.py = u.y;
    if (u.isSummon) {
      if (u.dur != null && --u.dur <= 0) {
        u.dead = true; u.gone = true;
        u.fx = { t: W.t, text: '💨 หมดเวลา' };
        return;
      }
    }
    if (u.fled) { moveToward(W, u, MAP.EXIT.x, MAP.EXIT.y, true); if (Math.hypot(u.x - MAP.EXIT.x, u.y - MAP.EXIT.y) < 3) { u.gone = true; } return; }
    const f = u.act && u.act.ctx && u.act.ctx.fid ? (W.fights || []).find(q => q.id === u.act.ctx.fid) : null;
    if (!f) { u.gone = true; return; }
    const ctx = u.act.ctx; C.statusTick(W, f, u); if (u.dead) return; if (STs().has(u, 'stun')) return;
    let t = C.unit(W, ctx.target);
    if (!C.alive(t) || t.hidden && (W.t % 10 === 0)) { const en = C.enemies(W, f, u.id).filter(x => !x.hidden && !x.away); if (!en.length) { // ไม่มีผู้ป้องกันในสนาม: มุ่งสู่ใจกลางสำนัก
        const mh = W.map.byId.main_hall; moveToward(W, u, mh.x + mh.w / 2, mh.y + mh.h + 2, false); u.reachedCore = Math.hypot(u.x - (mh.x + mh.w / 2), u.y - (mh.y + mh.h + 2)) < 3; return; }
      en.sort((a, b) => Math.hypot(a.x - u.x, a.y - u.y) - Math.hypot(b.x - u.x, b.y - u.y)); t = en[0]; ctx.target = t.id; }
    const d = Math.hypot(t.x - u.x, t.y - u.y);
    if (d > 1.7) { moveToward(W, u, t.x, t.y, false); return; }
    u.face = t.x >= u.x ? 1 : -1;
    if (--ctx.cd > 0) return;
    ctx.cd = C.attack(W, f, u, t);
  };

  /* ---------- วนรอบการต่อสู้ทุกนาที: ตัดสินผล ---------- */
  C.tick = W => {
    const fl = W.fights; if (!fl || !fl.length) { C.processQueue(W); C.tournamentTick(W); return; }
    for (const f of fl) {
      if (f.over) continue;
      if (f.state === 'gather') {
        const all = [].concat(f.A, f.B).map(id => C.unit(W, id)).filter(Boolean);
        const near = all.every(u => Math.hypot(u.x - f.arena.x, u.y - f.arena.y) < 8);
        if (near || W.t - f.t0 > 400) { f.state = 'fight'; all.forEach(u => { u.path = null; }); }
        continue;
      }
      const a = f.A.map(i => C.unit(W, i)).filter(C.alive), b = f.B.map(i => C.unit(W, i)).filter(C.alive);
      const timeout = W.t - f.t0 > (f.kind === 'raid' ? 900 : 300);
      if (!a.length || !b.length || timeout) { f.over = true; f.winner = timeout ? (f.kind === 'raid' ? 'B' : null) : (a.length ? 'A' : 'B'); C.conclude(W, f); }
    }
    W.fights = fl.filter(f => !f.over || W.t - f.t0 < 5);
    C.processQueue(W); C.tournamentTick(W);
  };
  C.conclude = (W, f) => {
    const all = [].concat(f.A, f.B).map(id => C.unit(W, id)).filter(Boolean);
    const ws = f.winner; const winners = ws ? (ws === 'A' ? f.A : f.B).map(i => C.unit(W, i)).filter(u => u && !u.dead) : [];
    const losers = ws ? (ws === 'A' ? f.B : f.A).map(i => C.unit(W, i)).filter(Boolean) : [];
    all.forEach(u => {
      if (u.isSummon) {
        u.dead = true; u.gone = true;
      } else if (!u.foe && !u.dead) {
        C.leave(W, u); u.yield = false; u.fled = false;
        if (!u.act || u.act.id === 'fight') u.act = { id: 'idle', stage: 'do', left: 20, total: 20, ctx: {}, why: [] };
      }
    });
    if (W.foes && W.foes.length) {
      W.foes = W.foes.filter(x => !x.isSummon || !x.dead);
    }
    if (f.kind === 'wild' && g.WILD) g.WILD.finish(W, f, ws);
    if (f.cb) f.cb(W, f, ws, winners, losers);
  };

  /* ---------- คิวดวลตัวต่อตัว (แค้น/ท้าชิงตำแหน่ง) ---------- */
  C.processQueue = W => {
    const q = W.duelQueue; if (!q || !q.length) return;
    const keep = [];
    for (const d of q) {
      const a = W.byId[d.a], b = W.byId[d.b];
      if (!a || !b || a.dead || b.dead || a.away || b.away) continue;
      const busy = u => u.sealed || (u.act && (u.act.id === 'breakthrough' || u.act.id === 'fight')) || u.jail > W.t;
      if (busy(a) || busy(b)) { d.wait = (d.wait || 0) + 1; if (d.wait < 600) keep.push(d); continue; }
      const tg = W.map.byId.training_ground; const arena = { x: tg.x + tg.w / 2, y: tg.y + tg.h / 2 };
      if (d.kind === 'leadership') W.log('challenge', a.h.name.given + ' กับ ' + b.h.name.given + ' เข้าสู่ลานดวลตัดสินตำแหน่งเจ้าสำนัก', [a.id, b.id]);
      const serious = d.serious; C.startFight(W, [a.id], [b.id], d.kind, { serious, gather: true, arena, cb: C.duelEnd, ctx: d });
    }
    W.duelQueue = keep;
  };
  C.duelEnd = (W, f, ws, winners, losers) => {
    const a = W.byId[f.A[0]], b = W.byId[f.B[0]]; if (!a || !b) return;
    const w = ws === 'A' ? a : ws === 'B' ? b : null, l = ws === 'A' ? b : ws === 'B' ? a : null;
    if (!w) { W.log('duel', a.h.name.given + ' กับ ' + b.h.name.given + ' ดวลกันไม่มีผู้ชนะ', [a.id, b.id]); return; }
    if (l && !l.dead) { const sev = C.hp(l) < C.hpMax(l) * 0.2 ? 2 : 1; AI.injure(W, l, sev, 'พ่ายแพ้ในการดวล'); }
    const rl = l && !l.dead ? SECT.rel(l, w.id) : null; if (rl) { rl.v += 8; rl.a -= 4; }
    HC.experience(w, 'victory', 0.7); if (l && !l.dead) HC.experience(l, 'defeat', 0.7);
    [a, b].forEach(u => {
      if (u && !u.dead && u.cult && u.cult.path === 'HEART_SOUL') {
        u.h.state.heartDemon = Math.max(0, (u.h.state.heartDemon || 0) - 3.5);
        u.h.state.stress = Math.max(0, (u.h.state.stress || 0) - 4);
        HC.gainWisdom(u, 0.12);
        CULT.gain(u, 1.5);
      }
    });
    if (f.kind === 'leadership') {
      const S = W.sect, ch = a, m = b;
      if (w === ch) {
        // ผู้ท้าชนะ → ขึ้นเป็นเจ้าสำนัก
        if (ch.post) { S.posts[ch.post] = null; ch.post = null; } if (S.deputyId === ch.id) S.deputyId = null;
        ch.rank = 6; S.masterId = ch.id; ch.sat = 88; if (!m.dead) { m.rank = 4; m.sat = Math.max(0, (m.sat || 60) - 30); }
        S.policyShift = W.day; W.fame(3);
        W.log('succession', ch.h.name.given + ' ชนะการท้าชิง ขึ้นเป็นเจ้าสำนักคนใหม่แทน ' + m.h.name.given, [ch.id, m.id]);
        if (m.dead) W.log('succession', 'เจ้าสำนักเดิมเสียชีวิตจากการดวล', [m.id]);
      } else {
        // ผู้ท้าแพ้ → โดนลงโทษตามนิสัยเจ้าสำนัก (เข้มงวดสูง = ขังนานขึ้น)
        W.log('challenge', m.h.name.given + ' ชนะการท้าชิง รักษาตำแหน่งเจ้าสำนักไว้ได้', [m.id, ch.id]);
        if (!ch.dead) { const days = Math.round(2 + S.policy.strictness / 12); ch.jail = W.t + days * 1440; ch.sat = Math.max(0, (ch.sat || 50) - 12); W.log('punish', ch.h.name.given + ' ถูกคุมขัง ' + days + ' วันฐานท้าชิงตำแหน่ง', [ch.id]); if (S.policy.strictness > 70 && S.policy.generosity < 40 && W.rng.chance(0.4)) { SECT.setRank(W, ch, Math.max(0, ch.rank - 1), 'ท้าชิงล้มเหลว'); } }
        m.merit += 20;
      }
    } else if (f.kind === 'grudge') {
      W.log('duel', w.h.name.given + ' ชนะการดวลกับ ' + (l ? l.h.name.given : '?') + (l && l.dead ? ' (อีกฝ่ายเสียชีวิต)' : ''), [w.id, l && l.id]);
      if (l && l.dead) { /* ปัญหาวินัย */ W.sect.suspicion = (W.sect.suspicion || 0) + 3; if (W.sect.policy.strictness > 55) { w.jail = W.t + 3 * 1440; } }
      else if (l) { const r = SECT.rel(w, l.id); r.v = Math.max(0, r.v - 15); r.r += 6; }
    }
  };

  /* ---------- ประลองยุทธ์สำนัก ---------- */
  C.tournamentTick = W => {
    const T = W.sect.tournament; if (!T) return;
    const m = W.byId[W.sect.masterId];
    if (T.state === 'announce' && W.t >= T.start) {
      const pool = W.npcs.filter(n => !n.dead && !n.away && !n.exiled && n.rank >= 1 && n.rank < 6 && !n.sealed && !(n.jail > W.t) && !(n.inj && n.inj.some(i => i.sev >= 2)) && n.h.state.hp > CULT.hpMax(n) * 0.6);
      const ent = pool.filter(n => { const want = (E(n, 'interests.combat') + E(n, 'values.martialPeak') + E(n, 'personality.ambition') + E(n, 'personality.courage') + (E(n, 'values.wealthResource') * T.prize / 200)) / 5 - 38 + (n.rank >= 4 ? -10 : 0) + (n.post === 'martial' ? 10 : 0); return W.rng.next() < clamp(0.1 + want / 40, 0.03, 0.9); });
      if (ent.length < 2) { W.log('tournament', 'ประลองยุทธ์ยกเลิกเพราะมีผู้สมัครน้อยเกินไป', []); W.sect.tournament = null; return; }
      ent.sort((a, b) => W.rng.next() - 0.5);
      T.entrants = ent.map(n => n.id); T.alive = T.entrants.slice(); T.state = 'run'; T.round = 1; T.queue = []; T.cur = null; T.history = [];
      W.log('tournament', 'ประลองยุทธ์สำนักเริ่มขึ้น! มีผู้เข้าร่วม ' + ent.length + ' คน', []);
      W.sect.festival = { until: W.t + 8 * 60 + ent.length * 25, kind: 'tournament', at: 'plaza' };
      T.watchUntil = W.sect.festival.until;
    }
    if (T.state !== 'run') return;
    if (T.cur) { if (T.cur.over) T.cur = null; else return; }
    if (!T.queue.length) {
      T.alive = T.alive.filter(id => W.byId[id] && !W.byId[id].dead);
      if (T.alive.length <= 1) { C.tournamentEnd(W, T); return; }
      const a = T.alive.slice(); const q = []; while (a.length >= 2) q.push([a.shift(), a.shift()]); T.bye = a.length ? a[0] : null; T.queue = q; T.nextAlive = T.bye ? [T.bye] : []; T.round++;
    }
    if (T.cur == null && T.queue.length) {
      const [x, y] = T.queue.shift(); const a = W.byId[x], b = W.byId[y];
      if (!a || !b || a.dead || b.dead) { if (a && !a.dead) T.nextAlive.push(x); else if (b && !b.dead) T.nextAlive.push(y); return; }
      const tg = W.map.byId.training_ground; const arena = { x: tg.x + tg.w / 2, y: tg.y + tg.h / 2 };
      T.cur = C.startFight(W, [x], [y], 'tourney', { serious: false, gather: true, arena, cb: (W2, f, ws) => { const win = ws === 'A' ? x : ws === 'B' ? y : (CULT.power(a) >= CULT.power(b) ? x : y); T.nextAlive.push(win); const lose = win === x ? b : a; if (!W2.byId[win].dead) { W2.byId[win].merit += 4; } AI.injure(W2, lose, 1, 'บาดเจ็บในการประลอง'); T.history.push(win); if (!T.queue.length) { T.alive = T.nextAlive.slice(); T.queue = []; } }, ctx: { t: 1 } });
      if (!T.queue.length) { /* รอบสุดท้ายของรอบนี้: อัปเดต alive หลังจบ (ทำใน cb) */ }
    }
  };
  C.tournamentEnd = (W, T) => {
    const win = W.byId[T.alive[0]]; W.sect.tournament = null; if (!win) return;
    ECO.pay(W, Math.min(T.prize, W.sect.stones), 'รางวัลประลองยุทธ์'); win.inv.stones += T.prize; win.merit += 35; HC.experience(win, 'victory', 1); W.fame(3);
    AI.mem(W, win, 'ชนะเลิศประลองยุทธ์สำนัก', 1);
    W.log('tournament', win.h.name.given + ' ชนะเลิศประลองยุทธ์สำนัก ได้รางวัล ' + T.prize + ' ศิลา', [win.id]);
    const m = W.byId[W.sect.masterId];
    if (SECT && SECT.assembly) {
      SECT.assembly(W, m, { fromTournament: T, primaryWinnerId: win.id });
    }
    if (m && win.rank <= 3 && HC.eff(m, 'interests.teaching') > 45 && W.rng.chance(0.3) && !win.mentor) { win.mentor = m.id; (m.h.life.family.disciples = m.h.life.family.disciples || []).push(win.id); win.h.life.family.master = m.id; W.log('disciple', m.h.name.given + ' รับ ' + win.h.name.given + ' เป็นศิษย์เอก', [m.id, win.id]); }
  };

  
  /* ---------- Party Formation Synergies & Ensemble Auras (v2.0.9) ---------- */
  C.evaluateFormationSynergy = party => {
    if (!Array.isArray(party) || !party.length) {
      return { synergies: [], powerMultiplier: 1.0, damageMitigation: 0, reflectPct: 0, auraNamesTh: [] };
    }
    const alive = party.filter(u => u && !u.dead);
    const synergies = [];
    const auras = [];
    let powerMult = 1.0;
    let mitigation = 0;

    const paths = new Set();
    let hasBodyVanguard = false;
    let hasBeastSovereign = false;
    let hasSageSupport = false;
    let hasMechPuppet = false;
    let hasKarmaSamsara = false;
    let hasXian = false;
    let hasHeartSoul = false;
    let totalBeasts = 0;

    alive.forEach(u => {
      const c = u.cult;
      if (c) {
        paths.add(c.path);
        if (c.path === "BODY") hasBodyVanguard = true;
        if (c.path === "BEAST_SOVEREIGN") {
          hasBeastSovereign = true;
          hasBodyVanguard = true;
        }
        if (c.path === "SAGE_SUPPORT") hasSageSupport = true;
        if (c.path === "MECH_PUPPET") hasMechPuppet = true;
        if (c.path === "KARMA_SAMSARA") hasKarmaSamsara = true;
        if (c.path === "XIAN") hasXian = true;
        if (c.path === "HEART_SOUL") hasHeartSoul = true;
      }
      if (Array.isArray(u.pets)) {
        totalBeasts += u.pets.filter(p => p && p.active).length;
      }
    });

    if (hasBodyVanguard) {
      mitigation += 0.15;
      synergies.push({ id: "IRON_VANGUARD", nameTh: "ปราการเหล็กแนวหน้า", effect: "ลดความเสียหายที่ทั้งกลุ่มได้รับ 15%" });
      auras.push("ปราการเหล็กแนวหน้า");
    }

    if (hasSageSupport) {
      powerMult *= 1.10;
      mitigation += 0.08;
      synergies.push({ id: "HARMONIC_ENSEMBLE", nameTh: "คีตเวทย์หนุนนำสวรรค์", effect: "ฟื้นฟูและเสริมพลังกลุ่ม +10% พลังโจมตี +8% ป้องกัน" });
      auras.push("คีตเวทย์หนุนนำ");
    }

    if (hasMechPuppet) {
      powerMult *= 1.12;
      synergies.push({ id: "CONSTRUCT_BASTION", nameTh: "ค่ายกลจักรกลตรึงสมรภูมิ", effect: "หุ่นเชิดช่วยยิงสนับสนุน +12% ดาเมจยุทธวิธี" });
      auras.push("ค่ายกลจักรกล");
    }

    if (hasKarmaSamsara) {
      synergies.push({ id: "KARMIC_AEGIS", nameTh: "กงล้อสะท้อนกรรมวัฏ", effect: "สะท้อนความเสียหาย 15% กลับสู่ศัตรูตามบัญชีกรรม" });
      auras.push("กงล้อสะท้อนกรรม");
    }

    if (hasXian && hasHeartSoul) {
      powerMult *= 1.10;
      synergies.push({ id: "DAO_MIND_RESONANCE", nameTh: "ปราณเต๋าหลอมดวงจิต", effect: "ผสานกระบี่เซียนและตบะจิต +10% อานุภาพวิชา" });
      auras.push("ปราณเต๋าหลอมจิต");
    }

    if (totalBeasts >= 2 || hasBeastSovereign) {
      powerMult *= 1.08;
      synergies.push({ id: "BEAST_PACK_RUSH", nameTh: "สัญชาตญาณฝูงอสูรศักดิ์สิทธิ์", effect: "ฝูงอสูรวิญญาณโหมกระหน่ำ +8% ความเร็วและคริติคอล" });
      auras.push("สัญชาตญาณฝูงอสูร");
    }

    return {
      synergies,
      powerMultiplier: +powerMult.toFixed(3),
      damageMitigation: +mitigation.toFixed(3),
      reflectPct: hasKarmaSamsara ? 0.15 : 0,
      auraNamesTh: auras
    };
  };

  g.COMBAT = C;
  if (typeof module === 'object' && module.exports) module.exports = C;
})(typeof globalThis !== 'undefined' ? globalThis : this);
