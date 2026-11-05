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
    HC.experience(w, 'duel_win', 0.25); HC.experience(l, 'duel_lose', 0.2);
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
    if (!u.foe) { AI.interruptFor(W, u); u.hidden = false; u.act = { id: 'fight', stage: 'do', left: 9999, total: 9999, ctx: { fid: f.id, target: null, cd: 0 }, why: [['เข้าต่อสู้', 9]] }; u.why = u.act.why; u.path = null; u.run = true; }
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
    const isGapCloserMove = ['charge', 'evade', 'blink', 'flurry', 'pierce'].includes(moveArch) || !!(o.isGapCloser);
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
        noteTh = C.name(a) + ' อาศัยระยะ' + (pa.weaponType === 'SPEAR' ? 'ทวนยาว' : pa.weaponType === 'WHIP' ? 'แส้และด้ายปราณ' : 'พลองยาว') + 'ชิงลงมือก่อนอาวุธสั้น';
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
        noteTh = C.name(a) + ' รักษาระยะห่างยิงสกัดด้วย' + (pa.weaponType === 'BOW' ? 'ธนู' : pa.weaponType === 'ZITHER' ? 'พิณคีตเวทย์' : pa.weaponType === 'BRUSH' ? 'พู่กันอาคม' : 'สื่อปราณ');
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

  /* Bounded Passive Procs (with strict internal cooldown, trigger normalization, and condition evaluator) */
  function runPassiveProcs(W, f, actor, target, triggerKind, dmgDealt) {
    if (f && f._inProc) return;
    if (!actor || actor.foe || actor.dead) return;
    if (f) f._inProc = true;
    try {
      const SK = SKs(), ST = STs();
      const normTrigger = (SK && SK.normalizeTrigger) ? SK.normalizeTrigger(triggerKind) : triggerKind;
      if (actor.cult && g.MARTIAL && g.MARTIAL.passiveStats) {
        const ps = g.MARTIAL.passiveStats(actor);
        if (ps && Array.isArray(ps.procs) && ps.procs.length) {
          actor._procCds = actor._procCds || {};
          for (const proc of ps.procs) {
            const pKind = (SK && SK.normalizeTrigger) ? SK.normalizeTrigger(proc.kind || proc.trigger) : (proc.kind || proc.trigger);
            if (pKind !== normTrigger) continue;
            if ((actor._procCds[proc.techId] || 0) > W.t) continue;
            if (proc.condition && C.COMPOSABLE_ENGINE && C.COMPOSABLE_ENGINE.evaluateCondition) {
              if (!C.COMPOSABLE_ENGINE.evaluateCondition(proc.condition, actor, target, { W, f, triggerKind: normTrigger, dmgDealt })) continue;
            }
            actor._procCds[proc.techId] = W.t + Math.max(1, proc.icdTicks || 6);
            if (proc.qiRestorePct && actor.cult && actor.h && actor.h.state) {
              const qm = CULT.qiMax(actor);
              actor.h.state.qi = Math.min(qm, (actor.h.state.qi == null ? qm : actor.h.state.qi) + qm * proc.qiRestorePct);
            }
            if (proc.hpRestorePct && !actor.dead) {
              const hm = C.hpMax(actor);
              C.setHp(actor, Math.min(hm, C.hp(actor) + Math.max(1, Math.round(hm * proc.hpRestorePct))));
            }
            if (proc.addStatus && !actor.dead) {
              if (ST.BUFF_CATALOG && ST.BUFF_CATALOG[proc.addStatus] && ST.applyNamedBuff) {
                ST.applyNamedBuff(actor, proc.addStatus, proc.dur || 12, W.t, { casterId: actor.id });
              } else {
                ST.addStatus(actor, proc.addStatus, proc.dur || 6, null, W.t);
              }
            }
            if (proc.counterStatus && target && C.alive(target)) {
              ST.addStatus(target, proc.counterStatus, proc.dur || 8, null, W.t);
            }
            if (proc.bonusPen && target && C.alive(target)) {
              ST.addStatus(target, 'armorbreak', 8, null, W.t);
            }
            if (proc.applyMark && target && C.alive(target)) {
              C.COMPOSABLE_ENGINE.applyMark(W, f, actor, target, proc.applyMark, proc.markStacks || 1, proc.dur || 14);
            }
            if (proc.detonateMarks && target && C.alive(target)) {
              C.COMPOSABLE_ENGINE.detonateMarks(W, f, actor, target, { bonusPerStack: proc.detonateBonus || 0.28 });
            }
            if (proc.grantBuff && ST.applyNamedBuff && !actor.foe) {
              ST.applyNamedBuff(actor, proc.grantBuff, proc.dur || 16, W.t, { casterId: actor.id });
            }
            if (proc.cleanseDebuff && !actor.dead) {
              ST.clearStatus(actor, x => ['burn', 'bleed', 'poison', 'slow', 'weaken', 'blind', 'chill', 'fear', 'paralyze', 'root', 'curse'].includes(x.k));
            }
            if (proc.shieldPct && !actor.dead) {
              ST.addStatus(actor, 'shield', proc.dur || 10, { amt: Math.round(C.hpMax(actor) * proc.shieldPct) }, W.t);
            }
            if (proc.action && C.COMPOSABLE_ENGINE && C.COMPOSABLE_ENGINE.executeAction) {
              C.COMPOSABLE_ENGINE.executeAction(W, f, actor, target, proc.action, proc, { triggerKind: normTrigger, dmgDealt });
            }
            actor.lastPassiveProc = { t: W.t, techId: proc.techId, kind: normTrigger };
          }
        }
      }
      if (C.runItemEffectProcs) {
        C.runItemEffectProcs(W, f, actor, target, normTrigger, dmgDealt);
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
    if (dmg > 0 && C.COMPOSABLE_ENGINE && f && (f._composableDepth || 0) < 3) {
      dmg = C.COMPOSABLE_ENGINE.interceptPreDamage(W, f, a, d, dmg, note);
    }
    const sh = shieldOf(d);
    if (sh) {
      const ab = Math.min(sh.amt, dmg);
      sh.amt -= ab;
      dmg -= ab;
      if (sh.amt <= 0) {
        STs().clearStatus(d, x => x.k === 'shield');
        if (a && !a.dead) runPassiveProcs(W, f, a, d, 'onShieldBreak', ab);
      }
    }
    if (dmg > 0 && !d.foe && d.pets && d.pets.length && CULT.activePets) {
      const actPets = CULT.activePets(d);
      const guardPet = actPets.find(pt => (pt.fourSymbol === 'BLACK_TORTOISE' || pt.bloodlineTrait === 'BLACK_TORTOISE' || pt.role === 'IRON_GUARDIAN' || (d.cult && d.cult.sub === 'COLOSSUS_SHIELD_TAMER')) && (pt.hp == null || pt.hp > 15) && (pt.fatigue || 0) < 90);
      if (guardPet) {
        const isBlackTortoise = guardPet.fourSymbol === 'BLACK_TORTOISE' || guardPet.bloodlineTrait === 'BLACK_TORTOISE';
        const share = isBlackTortoise ? 0.45 : ((d.cult && d.cult.sub === 'COLOSSUS_SHIELD_TAMER') ? 0.38 : 0.28);
        const curPetHp = guardPet.hp != null ? guardPet.hp : (guardPet.hpMax || 100);
        const intercepted = Math.min(dmg * share, Math.max(0, curPetHp - 10));
        if (intercepted >= 1) {
          dmg -= intercepted;
          guardPet.hp = Math.max(5, Math.round(curPetHp - intercepted * (isBlackTortoise ? 0.28 : 0.45)));
          guardPet.fatigue = clamp((guardPet.fatigue || 0) + (isBlackTortoise ? 2.0 : 3.5), 0, 100);
          d.lastPetIntercept = { t: W.t, petId: guardPet.uid || guardPet.petId, petName: guardPet.nameTh, fourSymbol: guardPet.fourSymbol || null, intercepted: Math.round(intercepted) };
          if (isBlackTortoise && a && !a.dead && note !== 'สะท้อนเกราะเสวียนอู่') {
            const btRef = Math.max(1, Math.round(intercepted * 0.22));
            C.applyDamage(W, f, d, a, btRef, 'สะท้อนเกราะเสวียนอู่');
          }
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
    if (hp <= 0 && d.isGateBeast && (d.fourSymbol === 'VERMILION_PHOENIX' || d.fourSymbol === 'BLACK_TORTOISE' || d.bloodlineTrait === 'SOVEREIGN_AWAKENED' || d.bloodlineTrait === 'VERMILION_PHOENIX' || d.bloodlineTrait === 'BLACK_TORTOISE') && !d.sovereignGuardUsed) {
      d.sovereignGuardUsed = true;
      const isPhoenix = d.fourSymbol === 'VERMILION_PHOENIX' || d.bloodlineTrait === 'VERMILION_PHOENIX';
      hp = Math.max(1, Math.round(hm * (isPhoenix ? 0.42 : 0.28)));
      d.fx = { t: W.t, text: isPhoenix ? '🔥 เพลิงนิพพานหงส์อมตะ!' : '👑 สายเลือดราชันย์คุ้มชีพ' };
    }
    if (hp <= hm * 0.15 && !d.foe && d.pets && d.pets.length && CULT.activePets) {
      f._phoenixRebirthUsed = f._phoenixRebirthUsed || {};
      const phoenixPet = !f._phoenixRebirthUsed[d.id] && CULT.activePets(d).find(pt => pt && (pt.fourSymbol === 'VERMILION_PHOENIX' || pt.bloodlineTrait === 'VERMILION_PHOENIX'));
      if (phoenixPet) {
        f._phoenixRebirthUsed[d.id] = true;
        hp = Math.max(Math.round(hm * 0.42), hp);
        STs().addStatus(d, 'shield', 12, { amt: Math.round(hm * 0.25) }, W.t);
        STs().clearStatus(d, x => ['burn', 'bleed', 'poison'].includes(x.k));
        d.fx = { t: W.t, text: '🔥 เพลิงนิพพานหงส์ชาดคุ้มชีพ!' };
        d.lastPhoenixRebirth = { t: W.t, petId: phoenixPet.uid || phoenixPet.id, fightId: f ? f.id : 0 };
        STs().dirty(d);
      }
    }
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
    if (hp <= 0 && (STs().has(d, 'phoenixCovenant', W.t) || (STs().hasBuff && STs().hasBuff(d, 'phoenixCovenant', W.t)) || d._phoenixClauseReady)) {
      f._phoenixClauseUsed = f._phoenixClauseUsed || {};
      if (!f._phoenixClauseUsed[d.id]) {
        f._phoenixClauseUsed[d.id] = true;
        d._phoenixClauseReady = false;
        STs().clearBuff(d, 'phoenixCovenant');
        hp = Math.max(1, Math.round(hm * 0.48));
        STs().addStatus(d, 'shield', 12, { amt: Math.round(hm * 0.22) }, W.t);
        STs().clearStatus(d, x => ['burn', 'bleed', 'poison', 'chill', 'curse'].includes(x.k));
        d.fx = { t: W.t, text: '🔥 เพลิงนิพพานหงส์คืนชีพ!' };
        d.lastPhoenixClause = { t: W.t, fightId: f ? f.id : 0, restoredHp: hp };
        if (a && C.alive(a) && note !== 'ระเบิดเพลิงนิพพาน') {
          const novaDmg = Math.max(10, Math.round(hm * 0.18));
          C.applyDamage(W, f, d, a, novaDmg, 'ระเบิดเพลิงนิพพาน');
          STs().addStatus(a, 'burn', 12, { per: 0.018, src: d.id }, W.t);
        }
        STs().dirty(d);
      }
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
      if (nonlethal) d.yield = true; else if (W.rng.chance(d.foe ? 0.7 : 0.5)) { d.fled = true; d.fx = { t: W.t, text: 'ถอย!' }; if (!d.foe) { d.run = true; AI.mem(W, d, 'ถอยหนีจากการต่อสู้', 0.5); HC.experience(d, 'near_death', 0.4); } }
    }
    return false;
  };
  /* หนึ่งการโจมตี: o = {M, type:'p'|'m', pen, dotHalf, forced, noCounter, noProc, crit+} */
  C.strike = (W, f, a, d, o) => {
    const ST = STs(), sa = ST.get(a), sd = ST.get(d), nonlethal = !f.serious;
    const effectiveAcc = Math.max(1, sa.acc + (Number.isFinite(o.accAdd) ? o.accAdd : 0));
    const hitP = o.forced ? 1 : clamp(effectiveAcc / (effectiveAcc + 0.55 * sd.eva), 0.12, 0.97);
    if (W.rng.next() > hitP) {
      d.fx = { t: W.t, text: 'หลบ' };
      d._lastDodgeOrParryAt = W.t;
      if (!d.foe) HC.trainBody(d, 'reflex', 0.3);
      runPassiveProcs(W, f, d, a, 'onDodge', 0);
      return { hit: false };
    }
    // ท่าสวนกลับ & เงาดาราซ้อนมิติ (astralMirage): ปัดทิ้ง/หลบมิติแล้วสวน (ป้องกันลูปสะท้อน/สวนซ้ำ)
    if (!o.noCounter) {
      const am = ST.statusOf(d, 'astralMirage') || (ST.hasBuff && ST.hasBuff(d, 'astralMirage', W.t));
      if (am && !d.dead && (!d._astralMirageUsedAt || W.t - d._astralMirageUsedAt >= 6)) {
        d._astralMirageUsedAt = W.t;
        d._lastDodgeOrParryAt = W.t;
        d.fx = { t: W.t, text: '🌌 เงาดาราหลบสวน!' };
        runPassiveProcs(W, f, d, a, 'onParry', 0);
        C.strike(W, f, d, a, { M: 1.45, type: 'm', pen: 25, forced: true, noCounter: true, noReflect: true, noProc: true });
        return { hit: false, countered: true, astralMirage: true };
      }
      const cs = ST.statusOf(d, 'counter');
      if (cs && !d.dead) {
        ST.clearStatus(d, x => x.k === 'counter');
        d._lastDodgeOrParryAt = W.t;
        d.fx = { t: W.t, text: '↩ ปัดสวน!' };
        runPassiveProcs(W, f, d, a, 'onParry', 0);
        C.strike(W, f, d, a, { M: cs.M, type: cs.type, pen: cs.pen, forced: true, noCounter: true, noReflect: true, noProc: true });
        return { hit: false, countered: true };
      }
    }
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
    if (a.isGateBeast) {
      if (a.fourSymbol === 'WHITE_TIGER' || a.bloodlineTrait === 'WHITE_TIGER') frac *= 1.35;
      else if (a.fourSymbol === 'AZURE_DRAGON' || a.bloodlineTrait === 'AZURE_DRAGON') frac *= 1.28;
      else if (a.fourSymbol === 'VERMILION_PHOENIX' || a.bloodlineTrait === 'VERMILION_PHOENIX') frac *= 1.25;
      else if (a.fourSymbol === 'BLACK_TORTOISE' || a.bloodlineTrait === 'BLACK_TORTOISE') frac *= 1.18;
      else if (a.bloodlineTrait === 'ALPHA_FANG') frac *= 1.18;
      else if (a.bloodlineTrait === 'SOVEREIGN_AWAKENED') frac *= 1.10;
    }
    if (d.isGateBeast) {
      if (d.fourSymbol === 'BLACK_TORTOISE' || d.bloodlineTrait === 'BLACK_TORTOISE') frac *= 0.62;
      else if (d.fourSymbol) frac *= 0.82;
      else if (d.bloodlineTrait === 'IRON_CARAPACE') frac *= 0.72;
      else if (d.bloodlineTrait === 'SOVEREIGN_AWAKENED') frac *= 0.90;
    }
    if (!a.foe && a.pets && a.pets.length && CULT.activePets) {
      const aPets = CULT.activePets(a);
      if (aPets.some(pt => pt.fourSymbol === 'WHITE_TIGER' || pt.bloodlineTrait === 'WHITE_TIGER')) frac *= 1.15;
      else if (aPets.some(pt => pt.fourSymbol === 'AZURE_DRAGON' || pt.bloodlineTrait === 'AZURE_DRAGON')) frac *= 1.10;
    }
    if (!d.foe && d.pets && d.pets.length && CULT.activePets) {
      const dPets = CULT.activePets(d);
      if (dPets.some(pt => pt.fourSymbol === 'BLACK_TORTOISE' || pt.bloodlineTrait === 'BLACK_TORTOISE')) frac *= 0.82;
    }
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
      } else if (a.cult.path === 'ARRAY_TALISMAN' || a.cult.path === 'STRATEGY_GOVERNANCE') {
        frac *= 1 + C.pathFormationMastery(a) * 0.08;
      } else if (a.cult.path === 'CRAFT_CREATION') {
        const sk = a.h && a.h.skills ? a.h.skills : {};
        const craftMastery = Math.max(sk.ALCHEMY || 0, sk.FORGING || 0, sk.ARRAY || 0, sk.TALISMAN || 0) + Math.min(sk.ALCHEMY || 0, sk.FORGING || 0) * 0.5;
        frac *= 1 + clamp(0.06 + craftMastery / 900, 0.06, 0.22);
      }
    }
    if (!d.foe && d.cult) {
      if (d.cult.path === 'BODY') {
        const dHpf = hpFrac(d);
        if (dHpf <= 0.65) frac *= (1 - 0.08 * (1 - dHpf)); // Blood-Qi Flesh Crucible unyielding mitigation
      } else if (d.cult.path === 'GOD') {
        frac *= 0.91; // Divine Aegis Faith Ward
      } else if (d.cult.path === 'ARRAY_TALISMAN' || d.cult.path === 'STRATEGY_GOVERNANCE') {
        frac *= 1 - C.pathFormationMastery(d) * 0.06;
      } else if (d.cult.path === 'CRAFT_CREATION') {
        frac *= 0.90; // Tempered Crucible & Artifact Ward
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
    if (!d.foe && (ST.has(d, 'karmicAegis', W.t) || (ST.hasBuff && ST.hasBuff(d, 'karmicAegis', W.t)))) {
      frac *= 0.85; // วัฏจักรสะท้อนกรรมลดความเสียหายขาเข้า 15%
    }
    if (W && W.celestialEvent && Array.isArray(W.celestialEvent.boostElements)) {
      const skEl = (o.skill && o.skill.element) || (a.element) || (a.h && a.h.root && a.h.root.primaryElement);
      if (skEl && W.celestialEvent.boostElements.includes(skEl)) {
        frac *= (1 + (W.celestialEvent.dmgBoostPct || 0.30));
      }
    }
    if (!a.foe && Array.isArray(a.destinyThreads) && a.destinyThreads.length) {
      if (a.destinyThreads.some(th => th && th.type === 'BLACK_THREAD' && (th.aId === d.id || th.bId === d.id))) {
        frac *= 1.25;
      }
      if (f && a.destinyThreads.some(th => th && th.type === 'RED_THREAD' && (f.A.includes(th.aId) && f.A.includes(th.bId) || f.B.includes(th.aId) && f.B.includes(th.bId)))) {
        frac *= 1.15;
      }
    }
    if (W && g.SECT && g.SECT.LEYLINE_GRID && g.SECT.LEYLINE_GRID.isTerritoryTriangulated && g.SECT.LEYLINE_GRID.isTerritoryTriangulated(W)) {
      if (!d.foe && a.foe) frac *= 0.88;
      else if (!a.foe && d.foe) frac *= 1.10;
    }
    if (ST.has(d, 'poiseBroken', W.t)) frac *= 1.35;
    frac = clamp(frac, 0.005, 1.85);
    if (nonlethal) frac *= 0.55;
    const hm = C.hpMax(d), beastGuard = !d.foe && g.MARTIAL && g.MARTIAL.isBeast(a) ? g.MARTIAL.skillEffects(d).beastDamage : 1, dmg = hm * frac * beastGuard;
    a.fx = a.fx || {}; if (!o.silent) { a.fx = { t: W.t, text: o.label || (crit ? 'จุดตาย!' : type === 'p' ? W.rng.pick(FX_PHYS) : W.rng.pick(FX_MAG)) }; }
    d.fx = { t: W.t, text: (crit ? '✦' : '') + '-' + Math.max(1, Math.round(dmg)) };
    if (!a.foe) { a.h.state.energy = Math.max(0, a.h.state.energy - 0.15); (g.MARTIAL && g.MARTIAL.skillPractice ? g.MARTIAL.skillPractice : HC.practice)(a, (g.MARTIAL ? ({ FIST: 'FIST_PALM' }[g.MARTIAL.equippedType(a)] || g.MARTIAL.equippedType(a)) : g.AI.pickTeachSkill(a, a)), 1 / 90, 1.1); HC.trainBody(a, 'reflex', 0.1); a.lastHurt = null; }
    const killed = C.applyDamage(W, f, a, d, dmg);
    if (!o.isPetAssist && g.ECO && g.ECO.wearGear) {
      const seriousMult = (f && f.serious) ? 1.0 : 0.35;
      const aWearMult = (!a.foe && a.cult && a.cult.path === 'CRAFT_CREATION') ? 0.6 : 1.0;
      const dWearMult = (!d.foe && d.cult && d.cult.path === 'CRAFT_CREATION') ? 0.6 : 1.0;
      if (!a.foe && a.equip && a.equip.WEAPON && a.equip.WEAPON.procedural && !a.equip.WEAPON.broken) {
        g.ECO.wearGear(a.equip.WEAPON, 0.28 * seriousMult * aWearMult, W, a);
      }
      if (!d.foe && d.equip) {
        if (d.equip.ARMOR && d.equip.ARMOR.procedural && !d.equip.ARMOR.broken) {
          g.ECO.wearGear(d.equip.ARMOR, 0.24 * seriousMult * dWearMult, W, d);
        }
        if (d.equip.ACCESSORY && d.equip.ACCESSORY.procedural && !d.equip.ACCESSORY.broken) {
          g.ECO.wearGear(d.equip.ACCESSORY, 0.12 * seriousMult * dWearMult, W, d);
        }
      }
    }
    if (!o.noProc && a.isGateBeast && a.bloodlineTrait === 'VENOM_GLAND' && C.alive(d)) {
      ST.addStatus(d, 'poison', 12, { per: 0.012, src: a.id });
      d.lastGateBeastVenom = { t: W.t, sourceId: a.id };
    }
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
    if (!o.noReflect && !d.foe && (ST.has(d, 'karmicAegis', W.t) || (ST.hasBuff && ST.hasBuff(d, 'karmicAegis', W.t))) && dmg > 0 && !a.dead) {
      const kaRef = Math.max(1, Math.min(Math.round(C.hpMax(a) * 0.22), Math.round(dmg * 0.22)));
      reflected += kaRef;
      d.lastReflect = reflected;
      C.applyDamage(W, f, d, a, kaRef, 'กงล้อกรรมสะท้อน');
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
          let hasWhiteTiger = false, hasPhoenix = false, hasAzureDragon = false;
          for (let pi = 0; pi < allocs.length; pi++) {
            const pt = allocs[pi].pet, sh = allocs[pi].share || (1 / actPets.length);
            const fs = pt.fourSymbol || (CULT.FOUR_SYMBOL_BLOODLINES && CULT.FOUR_SYMBOL_BLOODLINES[pt.bloodlineTrait] ? pt.bloodlineTrait : null);
            const awkMult = fs ? 1.45 : (pt.sovereignAwakened ? 1.25 : 1.0);
            const pMult = (0.18 + 0.035 * (pt.tier || 1) + 0.012 * (pt.level || 1)) * awkMult * sh;
            assistM += pMult;
            if (pt.role === 'VENOM_SWARM' || pt.role === 'VENOM_STALKER') hasVenom = true;
            if (fs === 'WHITE_TIGER') hasWhiteTiger = true;
            if (fs === 'VERMILION_PHOENIX') hasPhoenix = true;
            if (fs === 'AZURE_DRAGON') hasAzureDragon = true;
            pt.exp = (pt.exp || pt.bondXp || 0) + 4;
            pt.bondXp = pt.exp;
            pt.fatigue = clamp((pt.fatigue || 0) + 1.2, 0, 100);
            if (pt.exp >= (pt.level || 1) * 25 && (pt.level || 1) < 9) {
              pt.level = (pt.level || 1) + 1;
              if (!pt.sovereignAwakened && !pt.fourSymbol) pt.growthStage = Math.min(3, Math.max(1, Math.ceil(pt.level / 3)));
              ST.dirty(a);
            }
          }
          if (a.cult && a.cult.path === 'BEAST_SOVEREIGN') assistM *= (a.cult.sub === 'MYRIAD_BEAST_PACK' ? 1.38 : 1.22);
          assistM = clamp(assistM, 0.12, 0.95);
          const pRes = C.strike(W, f, a, d, { M: assistM, type: 'p', pen: hasWhiteTiger ? 22 : 0, forced: true, noCounter: true, noReflect: true, noProc: true, isPetAssist: true, silent: true });
          if (hasVenom && C.alive(d)) {
            ST.addStatus(d, 'poison', 10, { per: 0.012, src: a.id });
          }
          if (hasWhiteTiger && C.alive(d)) {
            ST.addStatus(d, 'bleed', 10, { per: 0.015, src: a.id });
            ST.addStatus(d, 'armorbreak', 10);
          }
          if (hasPhoenix && C.alive(d)) {
            ST.addStatus(d, 'burn', 10, { per: 0.015, src: a.id });
          }
          if (hasAzureDragon && a.cult && a.h && a.h.state) {
            const qm = CULT.qiMax(a);
            a.h.state.qi = Math.min(qm, (a.h.state.qi || 0) + qm * 0.04);
          }
          a.lastPetAssist = { t: W.t, count: actPets.length, petNames: actPets.map(x => x.nameTh), dmg: pRes.dmg || 0 };
        }
      }
      const aStance = ST.getActiveStanceSpec ? ST.getActiveStanceSpec(a) : null;
      if (aStance && aStance.lifestealBonus && dmg > 0 && !a.dead && !ST.has(a, 'stygianFreeze', W.t)) {
        const stMult = (ST.hasStanceFlowAmplifier && ST.hasStanceFlowAmplifier(a)) ? 1.15 : 1.0;
        const stLs = Math.max(1, Math.round(dmg * aStance.lifestealBonus * stMult));
        C.setHp(a, Math.min(C.hpMax(a), C.hp(a) + stLs));
        lifesteal += stLs;
      }
      const dStance = ST.getActiveStanceSpec ? ST.getActiveStanceSpec(d) : null;
      if (!o.noReflect && dStance && dStance.reflectPct && dmg > 0 && !a.dead) {
        const stRef = Math.max(1, Math.min(Math.round(C.hpMax(a) * 0.20), Math.round(dmg * dStance.reflectPct)));
        reflected += stRef;
        C.applyDamage(W, f, d, a, stRef, 'สะท้อนปราการวัชระ');
      }
      if (!o.noReflect && (ST.has(d, 'cryoMirror', W.t) || (ST.hasBuff && ST.hasBuff(d, 'cryoMirror', W.t))) && dmg > 0 && !a.dead) {
        const cmRef = Math.max(1, Math.min(Math.round(C.hpMax(a) * 0.25), Math.round(dmg * 0.25)));
        reflected += cmRef;
        C.applyDamage(W, f, d, a, cmRef, 'กระจกเงาดาราเหมันต์สะท้อน');
        ST.clearBuff(d, 'cryoMirror');
      }
      if (f) {
        f._unitFirstStrikeDone = f._unitFirstStrikeDone || {};
        if (!f._unitFirstStrikeDone[a.id]) {
          f._unitFirstStrikeDone[a.id] = true;
          runPassiveProcs(W, f, a, d, 'onFirstStrike', dmg);
        }
      }
      runPassiveProcs(W, f, a, d, 'onHit', dmg);
      if (crit) runPassiveProcs(W, f, a, d, 'onCrit', dmg);
      runPassiveProcs(W, f, d, a, 'onStruck', dmg);
      if (killed) {
        runPassiveProcs(W, f, a, d, 'onKill', dmg);
        if (C.COMPOSABLE_ENGINE && C.COMPOSABLE_ENGINE.spreadContagionOnDeath) {
          C.COMPOSABLE_ENGINE.spreadContagionOnDeath(W, f, a, d);
        }
      }
      if (C.hp(d) <= C.hpMax(d) * 0.35 && C.alive(d)) runPassiveProcs(W, f, d, a, 'onLowHp', dmg);
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
      if (p.arch === 'blink') sc += (ST.has(a, 'astralMirage') ? 0.4 : 1.8) + (hpR < 0.65 ? 1.2 : 0.5) + aggr * 0.5;
      if (p.arch === 'command') {
        const allies = C.alliesOf(W, f, a.id);
        sc += 1.4 + Math.min(2.2, allies.length * 0.55) + (targetShielded && p.shatterShield ? 1.8 : 0);
      }
      if (p.arch === 'harmonize') {
        const ally = lowestAlly(W, f, a);
        const lowestRatio = ally ? Math.min(hpR, hpFrac(ally)) : hpR;
        sc += 1.5 + (lowestRatio < 0.85 ? (0.85 - lowestRatio) * 6.5 : 0.6);
      }
      if (p.arch === 'karmaReversal') {
        const hasDebuff = a.sx && a.sx.some(x => ['burn', 'bleed', 'poison', 'slow', 'weaken', 'blind', 'armorbreak', 'mdefbreak', 'exposed'].includes(x.k) && x.until > W.t);
        sc += (hasDebuff ? 2.6 : 1.2) + (1 - hpR) * 2.2 + aggr * 0.6;
      }
      if (p.arch === 'forbid' || p.arch === 'sacrificeOverdrive') sc += (hpR < 0.45 ? 2.2 : 0.65) + aggr + (tdp > self * 1.3 ? 1.1 : 0);
      if (p.arch === 'markPrimer') {
        const curMarks = C.COMPOSABLE_ENGINE ? C.COMPOSABLE_ENGINE.totalMarksOn(d, W.t) : 0;
        sc += curMarks < 3 ? (1.85 - curMarks * 0.35) : 0.25;
      }
      if (p.arch === 'markDetonate') {
        const curMarks = C.COMPOSABLE_ENGINE ? C.COMPOSABLE_ENGINE.totalMarksOn(d, W.t) : 0;
        const hasDots = d.sx && d.sx.some(x => ['burn', 'bleed', 'poison', 'curse', 'venomSeed'].includes(x.k) && x.until > W.t);
        sc += curMarks >= 2 ? (1.4 + curMarks * 0.65) : (hasDots ? 1.55 : -0.4);
      }
      if (p.arch === 'elementalFusion') {
        const hasReactable = d.sx && d.sx.some(x => ['burn', 'chill', 'slow', 'poison', 'bleed', 'mdefbreak', 'armorbreak', 'paralyze'].includes(x.k) && x.until > W.t);
        sc += hasReactable ? 2.15 : 0.55;
      }
      if (p.arch === 'stanceShift') {
        sc += (ST.has(a, 'comboReady') ? -0.8 : 1.75) + aggr * 0.4;
      }
      if (p.arch === 'chainRicochet' || p.arch === 'wave') {
        sc += Math.min(2.2, Math.max(0.5, near * 0.65));
      }
      if (p.arch === 'tetherLink') {
        const allies = C.alliesOf(W, f, a.id);
        sc += (allies.length > 1 || en.length > 1) ? 1.85 : 0.75;
      }
      if (p.arch === 'statusTransmute') {
        const enemyHasBuff = d.sx && d.sx.some(x => SK.STATUS[x.k] && SK.STATUS[x.k].isBuff && x.until > W.t);
        const selfHasDebuff = a.sx && a.sx.some(x => ['burn', 'bleed', 'poison', 'slow', 'weaken', 'curse'].includes(x.k) && x.until > W.t);
        sc += (enemyHasBuff ? 1.8 : 0.4) + (selfHasDebuff ? 1.6 : 0.3);
      }
      if (ST.has(a, 'comboReady') && (p.M || 0) > 0 && p.arch !== 'stanceShift') {
        sc += 1.25;
      }
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
    runPassiveProcs(W, f, a, d, 'onCast', 0);
    const aStanceCast = ST.getActiveStanceSpec ? ST.getActiveStanceSpec(a) : null;
    const stanceHealMult = (aStanceCast && aStanceCast.healDoneMult) ? (1 + aStanceCast.healDoneMult) : 1.0;
    const stanceShieldMult = (aStanceCast && aStanceCast.shieldBonus) ? (1 + aStanceCast.shieldBonus) : 1.0;
    if (p.arch === 'heal') {
      const healTargets = p.aoe ? C.alliesOf(W, f, a.id) : [(() => { const ally = lowestAlly(W, f, a); return (ally && hpFrac(ally) < hpFrac(a) - 0.05) ? ally : a; })()];
      const sageBonus = ((!a.foe && a.cult && a.cult.path === 'SAGE_SUPPORT') ? 1.18 : 1.0) * stanceHealMult;
      healTargets.forEach((tgt, idx) => {
        if (!tgt || !C.alive(tgt)) return;
        if (idx === 0) { a.castFx.x = tgt.x; a.castFx.y = tgt.y; }
        const thm = C.hpMax(tgt);
        const ashenMult = ST.has(tgt, 'ashenToxin', W.t) ? 0.5 : (ST.has(tgt, 'stygianFreeze', W.t) ? 0 : 1.0);
        const healAmt = Math.max(0, Math.round(thm * (p.heal || 0.22) * sageBonus * ashenMult));
        if (healAmt > 0) C.setHp(tgt, Math.min(thm, C.hp(tgt) + healAmt));
        if (p.shield > 0) ST.addStatus(tgt, 'shield', 12, { amt: Math.round(thm * p.shield * stanceShieldMult) }, W.t);
        const beforeSx = tgt.sx ? tgt.sx.length : 0;
        ST.clearStatus(tgt, x => { const S = SK.STATUS[x.k]; return S && (S.dot || ['slow', 'weaken', 'blind', 'armorbreak', 'mdefbreak', 'silence', 'stun'].includes(x.k)); });
        const cleansedCount = Math.max(0, beforeSx - (tgt.sx ? tgt.sx.length : 0));
        if (cleansedCount > 0 && p.cleanseToPower) {
          ST.addStatus(tgt, 'shield', 12, { amt: Math.round(thm * 0.10 * cleansedCount) }, W.t);
        }
        const bKind = p.grantBuff || ((!a.foe && a.cult && a.cult.path === 'SAGE_SUPPORT') ? 'vitalRegen' : null);
        if (bKind && ST.applyNamedBuff) ST.applyNamedBuff(tgt, bKind, buffDur, W.t, { casterId: a.id });
        tgt.fx = { t: W.t, text: '💚 +' + healAmt };
        runPassiveProcs(W, f, a, tgt, 'onHeal', healAmt);
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
    if (p.secondaryBuff && ST.applyNamedBuff && !a.foe) {
      ST.applyNamedBuff(a, p.secondaryBuff, buffDur, W.t, { casterId: a.id });
    }
    if (p.arch === 'command') {
      const allies = C.alliesOf(W, f, a.id);
      const bKind = p.grantBuff || 'tacticalCommand';
      allies.forEach(ally => {
        if (!C.alive(ally)) return;
        const ahm = C.hpMax(ally);
        if (p.heal > 0) C.setHp(ally, Math.min(ahm, C.hp(ally) + Math.max(1, Math.round(ahm * p.heal))));
        if (p.shield > 0) ST.addStatus(ally, 'shield', buffDur, { amt: Math.round(ahm * p.shield) }, W.t);
        ST.addStatus(ally, bKind, buffDur, null, W.t);
        if (ST.applyNamedBuff && !ally.foe) {
          ST.applyNamedBuff(ally, bKind, buffDur, W.t, { casterId: a.id });
          if (p.secondaryBuff) ST.applyNamedBuff(ally, p.secondaryBuff, buffDur, W.t, { casterId: a.id });
        }
        ally.fx = { t: W.t, text: '🚩 บัญชาทัพ' };
      });
      if ((p.M || 0) <= 0) return;
    }
    if (p.arch === 'harmonize') {
      const allies = C.alliesOf(W, f, a.id);
      const sageBonus = (!a.foe && a.cult && a.cult.path === 'SAGE_SUPPORT') ? 1.20 : 1.0;
      const bKind = p.grantBuff || 'vitalRegen';
      allies.forEach(ally => {
        if (!C.alive(ally)) return;
        const ahm = C.hpMax(ally);
        if (p.heal > 0) {
          const healAmt = Math.max(1, Math.round(ahm * p.heal * sageBonus));
          C.setHp(ally, Math.min(ahm, C.hp(ally) + healAmt));
        }
        if (p.shield > 0) ST.addStatus(ally, 'shield', buffDur, { amt: Math.round(ahm * p.shield * sageBonus) }, W.t);
        if (p.cleanseDebuffs) {
          ST.clearStatus(ally, x => { const S = SK.STATUS[x.k]; return S && (S.dot || ['slow', 'weaken', 'blind', 'armorbreak', 'mdefbreak', 'silence', 'stun', 'exposed'].includes(x.k)); });
        }
        if (ally.h && ally.h.state) {
          ally.h.state.heartDemon = Math.max(0, (ally.h.state.heartDemon || 0) - Math.max(4, p.cleanseHeartDemon || 0));
        }
        if (p.cureInjury && Array.isArray(ally.inj) && ally.inj.length) {
          ally.inj.shift();
        }
        ST.addStatus(ally, bKind, buffDur, null, W.t);
        if (ST.applyNamedBuff && !ally.foe) {
          ST.applyNamedBuff(ally, bKind, buffDur, W.t, { casterId: a.id });
          if (p.secondaryBuff) ST.applyNamedBuff(ally, p.secondaryBuff, buffDur, W.t, { casterId: a.id });
        }
        ally.fx = { t: W.t, text: '🎶 คีตโอสถหนุนนำ' };
      });
      if ((p.M || 0) <= 0) return;
    }
    if (p.arch === 'blink') {
      const bKind = p.grantBuff || 'astralMirage';
      ST.addStatus(a, bKind, buffDur, null, W.t);
      if (ST.applyNamedBuff && !a.foe) ST.applyNamedBuff(a, bKind, buffDur, W.t, { casterId: a.id });
      if (p.shield > 0) ST.addStatus(a, 'shield', buffDur, { amt: Math.round(hm * p.shield) }, W.t);
      if (d) { d._closedOnBy = a.id; a._gapClosedOn = d.id; }
      if ((p.M || 0) <= 0) return;
    }
    if (p.arch === 'karmaReversal') {
      const bKind = p.grantBuff || 'karmicAegis';
      ST.addStatus(a, bKind, buffDur, null, W.t);
      if (ST.applyNamedBuff && !a.foe) ST.applyNamedBuff(a, bKind, buffDur, W.t, { casterId: a.id });
      if (p.heal > 0) C.setHp(a, Math.min(hm, C.hp(a) + Math.max(1, Math.round(hm * p.heal))));
      if (p.shield > 0) ST.addStatus(a, 'shield', buffDur, { amt: Math.round(hm * p.shield) }, W.t);
      {
        const debuffKeys = ['burn', 'bleed', 'poison', 'slow', 'weaken', 'blind', 'armorbreak', 'mdefbreak', 'exposed', 'silence', 'stun'];
        const removed = (a.sx || []).filter(x => debuffKeys.includes(x.k));
        ST.clearStatus(a, x => debuffKeys.includes(x.k));
        if (d && C.alive(d)) {
          for (const rem of removed) {
            ST.addStatus(d, rem.k, 12, { per: rem.per || 0.015, src: a.id }, W.t);
          }
          ST.addStatus(d, 'exposed', 12, null, W.t);
          ST.addStatus(d, 'armorbreak', 12, null, W.t);
        }
      }
      if ((p.M || 0) <= 0) return;
    }
    if (p.arch === 'summon') {
      const side = C.sideOf(f, a.id);
      const sConf = p.summon || { dur: 18, hpPct: 0.4, statPct: 0.55, nameSuffix: 'ร่างอวตาร' };
      const sId = 'SUM_' + a.id + '_' + W.t;
      const statPct = Number.isFinite(sConf.statPct) ? clamp(sConf.statPct, 0, 1) : 0.55;
      const hpPct = Number.isFinite(sConf.hpPct) ? clamp(sConf.hpPct, 0.05, 1) : 0.4;
      const sHp = Math.max(10, Math.round(C.hpMax(a) * hpPct));
      // Snapshot final caster stats once. The summon receives only its own
      // later statuses/condition modifiers, never the caster's bonuses twice.
      const summonStats = { hp: sHp };
      for (const key of ST.KEYS) {
        if (key === 'hp') continue;
        const neutral = key === 'critDmg' ? 150 : (key === 'cast' || key === 'move') ? 100 : 0;
        const value = Number.isFinite(sa[key]) ? sa[key] : neutral;
        summonStats[key] = neutral + (value - neutral) * statPct;
      }
      const sName = sConf.nameSuffix + 'ของ' + C.name(a);
      const summonUnit = {
        id: sId,
        name: sName,
        isSummon: true,
        summonerId: a.id,
        side,
        foe: true,
        tier: a.cult ? Math.max(1, Math.round(CULT.equivalentStage(a))) : (a.tier || 1),
        power: Math.max(1, Math.round(Math.max(summonStats.atk, summonStats.matk) / 0.55)),
        summonStats,
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
    // Composable pre-strike execution (stanceShift, tetherLink, sacrificeOverdrive, comboReady consumption)
    let comboMult = 1.0;
    if (C.COMPOSABLE_ENGINE) {
      const preRes = C.COMPOSABLE_ENGINE.preExecuteSkill(W, f, a, d, p, ctx);
      if (preRes && preRes.comboMult) comboMult = preRes.comboMult;
      if (preRes && preRes.handledCompletely) return;
    }
    // ท่าโจมตี (รองรับ Target Selector แบบยืดหยุ่น)
    const targets = (C.COMPOSABLE_ENGINE && C.COMPOSABLE_ENGINE.selectTargets)
      ? C.COMPOSABLE_ENGINE.selectTargets(W, f, a, d, p)
      : (p.aoe ? C.enemies(W, f, a.id).filter(x => Math.hypot(x.x - d.x, x.y - d.y) < 2.6) : [d]);
    if (d && !targets.includes(d) && C.alive(d)) targets.unshift(d);
    const mas = masBase * comboMult; let dealt = 0;
    targets.slice(0, 6).forEach((t, tIdx) => {
      if (!C.alive(t)) return;
      for (let i = 0; i < (p.hits || 1); i++) {
        if (!C.alive(t)) break;
        const wpnAcc = (!a.foe && g.MARTIAL && g.MARTIAL.weaponCompatibility) ? (g.MARTIAL.weaponCompatibility(a, p.tech || p.id).accDelta || 0) : 0;
        const ricochetScale = p.arch === 'chainRicochet' ? Math.pow(0.92, tIdx) * (t.sx && t.sx.length ? 1.18 : 1.0) : (p.aoe && t !== d ? 0.8 : 1);
        const r = C.strike(W, f, a, t, { M: p.M * mas * ricochetScale, synDmgMult: p.synDmgMult || 1, accAdd: (p.elementAccAdd || 0) + wpnAcc, type: p.type, pen: p.pen, forced: p.arch === 'blink', label: i === 0 ? label : null, silent: i > 0, critAdd: p.critAdd || 0, critDmgAdd: p.critDmgAdd || 0, isSkill: true, arch: p.arch, skill: p });
        if (r.hit) {
          dealt += r.dmg;
          applyRiders(W, f, a, t, p, r);
          if (C.COMPOSABLE_ENGINE) {
            dealt += C.COMPOSABLE_ENGINE.postHitSkill(W, f, a, t, p, r) || 0;
          }
        }
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
      if (t._ccImmuneUntil && W.t < t._ccImmuneUntil) {
        t.fx = { t: W.t, text: '🛡️ ต้านทานสะกดสมบูรณ์' };
        runPassiveProcs(W, f, t, a, 'onDebuffResisted', 0);
        return;
      }
      const hasClarity = !t.foe && ST.hasBuff && ST.hasBuff(t, 'clarityLotus', W.t);
      const tStance = ST.getActiveStanceSpec ? ST.getActiveStanceSpec(t) : null;
      const drStacks = (t._ccDrUntil && W.t < t._ccDrUntil) ? (t._ccDrStacks || 0) : 0;
      const ctrlResistMult = (hasClarity ? 0.72 : 1.0) * ((tStance && tStance.ctrlResist) ? (1 - tStance.ctrlResist) : 1.0) * Math.max(0.1, 1 - drStacks * 0.30);
      const ok = W.rng.next() < clamp(0.78 * Math.pow(ratio, 0.7) * elementProcMult * ctrlResistMult, 0.08, 0.95);
      if (!ok) {
        t.fx = { t: W.t, text: 'ต้านทาน' };
        runPassiveProcs(W, f, t, a, 'onDebuffResisted', 0);
        return;
      }
      if (['stun', 'paralyze', 'silence', 'root', 'fear'].includes(p.ctrl)) {
        t._ccDrStacks = drStacks + 1;
        t._ccDrUntil = W.t + 18;
        if (t._ccDrStacks >= 3) {
          t._ccImmuneUntil = W.t + 12;
          t._ccDrStacks = 0;
        }
      }
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
      if (x.until <= W.t) {
        if ((x.stacks || 1) > 1 && (x.stackDecayMode === 'LAYERED' || COMPOSABLE_ENGINE.MARK_KEYS.includes(x.k) || ['chill', 'poison', 'bleed', 'burn'].includes(x.k))) {
          x.stacks -= 1;
          x.until = W.t + Math.max(4, Math.round((x.dur || 8) * 0.5));
          keep.push(x);
        }
        return;
      }
      keep.push(x);
      const S = SK.STATUS[x.k];
      if (!S || u.dead) return;
      if (S.dot && x.per) {
        const src = x.src ? C.unit(W, x.src) : null;
        const toxMult = (src && !src.foe && src.cult && ['poison', 'venomSeed', 'sovereignPlague'].includes(x.k))
          ? (1 + clamp((src.cult.toxic || 0) * 0.008, 0, 0.50))
          : 1.0;
        const stackMult = clamp(x.stacks || 1, 1, 5);
        C.applyDamage(W, f, src && !src.dead ? src : null, u, C.hpMax(u) * x.per * stackMult * toxMult * (f.serious ? 1 : 0.55) * (src && !src.foe && g.MARTIAL && ['poison','bleed'].includes(x.k) ? g.MARTIAL.skillEffects(src).poisonPower : 1));
        u.fx = { t: W.t, text: S.icon };
      } else if (S.hot && !ST.has(u, 'stygianFreeze', W.t)) {
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
    if (f) {
      const vAllies = C.alliesOf(W, f, victim.id).filter(u => u && u.id !== victim.id && C.alive(u));
      const vEnemies = C.enemies(W, f, victim.id).filter(u => u && C.alive(u));
      for (const al of vAllies) runPassiveProcs(W, f, al, killer || victim, 'onAllyFall', 0);
      for (const en of vEnemies) runPassiveProcs(W, f, en, victim, 'onEnemyFall', 0);
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
      if (!killer.foe) { killer.stats = killer.stats || {}; killer.stats.kills = (killer.stats.kills || 0) + 1; HC.experience(killer, 'duel_win', 0.6); killer.merit += 3 + victim.tier * 2; }
      return;
    }
    AI.kill(W, victim, killer.foe ? 'ถูก' + killer.name + 'สังหาร' : 'ถูก' + killer.h.name.given + 'สังหารในการดวล');
    if (!killer.foe) { HC.experience(killer, 'killed_foe', 0.8); const r = SECT.rel(killer, victim.id); AI.mem(W, killer, 'ปลิดชีพ ' + victim.h.name.given, 1, victim.id); killer.stats = killer.stats || {}; killer.stats.kills = (killer.stats.kills || 0) + 1; }
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
    if (n.h.state.qi != null && n.cult && !STs().has(n, 'stygianFreeze', W.t)) {
      const qm = CULT.qiMax(n);
      const hasConduit = STs().hasBuff && STs().hasBuff(n, 'qiConduit', W.t);
      const stSpec = STs().getActiveStanceSpec ? STs().getActiveStanceSpec(n) : null;
      const stQiMult = (stSpec && stSpec.qiRegenBonus) ? (1 + stSpec.qiRegenBonus) : 1.0;
      const qRegen = ((n.cult.path === 'XIAN' ? 0.0075 : 0.006) + (hasConduit ? 0.015 : 0)) * stQiMult;
      n.h.state.qi = Math.min(qm, n.h.state.qi + qm * qRegen);
    }
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
    n.act = { id: 'idle', stage: 'do', left: 15, total: 15, ctx: {}, why: [] }; n.why = [];
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
      if (!f._roundStartFired) {
        f._roundStartFired = true;
        [].concat(f.A, f.B).map(i => C.unit(W, i)).filter(C.alive).forEach(u => runPassiveProcs(W, f, u, null, 'onRoundStart', 0));
      }
      if (C.COMPOSABLE_ENGINE) {
        if (C.COMPOSABLE_ENGINE.tickDomain && f.activeDomain) C.COMPOSABLE_ENGINE.tickDomain(W, f);
        if (C.COMPOSABLE_ENGINE.tickDelayedEchoes && f.delayedEchoes && f.delayedEchoes.length) C.COMPOSABLE_ENGINE.tickDelayedEchoes(W, f);
        if (C.COMPOSABLE_ENGINE.decayElementalAuras) C.COMPOSABLE_ENGINE.decayElementalAuras(W, f);
      }
      const a = f.A.map(i => C.unit(W, i)).filter(C.alive), b = f.B.map(i => C.unit(W, i)).filter(C.alive);
      const timeout = W.t - f.t0 > (f.kind === 'raid' ? 900 : 300);
      if (!a.length || !b.length || timeout) {
        [].concat(a, b).forEach(u => runPassiveProcs(W, f, u, null, 'onRoundEnd', 0));
        f.over = true; f.winner = timeout ? (f.kind === 'raid' ? 'B' : null) : (a.length ? 'A' : 'B'); C.conclude(W, f);
      }
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
        if (u.meridians && u.meridians.overdriveUsedInFight) {
          u.meridians.overdriveUsedInFight = false;
          u.meridians.overdriveUntil = 0;
          u.inj = Array.isArray(u.inj) ? u.inj : [];
          if (u.inj.length < 3) {
            u.inj.push({ part: 'เส้นลมปราณพิสดาร', why: 'ผลสะท้อนหลังเร่งชีพจรพิสดารเกินขีดจำกัด', sev: 1, until: W.t + 1440 });
          }
          if (u.h && u.h.state) u.h.state.energy = Math.max(10, (u.h.state.energy || 50) - 20);
          STs().dirty(u);
        }
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
    HC.experience(w, 'duel_win', 0.7); if (l && !l.dead) HC.experience(l, 'duel_lose', 0.7);
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
    ECO.pay(W, Math.min(T.prize, W.sect.stones), 'รางวัลประลองยุทธ์'); win.inv.stones += T.prize; win.merit += 35; HC.experience(win, 'duel_win', 1); W.fame(3);
    AI.mem(W, win, 'ชนะเลิศประลองยุทธ์สำนัก', 1);
    W.log('tournament', win.h.name.given + ' ชนะเลิศประลองยุทธ์สำนัก ได้รางวัล ' + T.prize + ' ศิลา', [win.id]);
    const m = W.byId[W.sect.masterId];
    if (SECT && SECT.assembly) {
      SECT.assembly(W, m, { fromTournament: T, primaryWinnerId: win.id });
    }
    if (m && win.rank <= 3 && HC.eff(m, 'interests.teaching') > 45 && W.rng.chance(0.3) && !win.mentor) { win.mentor = m.id; (m.h.life.family.disciples = m.h.life.family.disciples || []).push(win.id); win.h.life.family.master = m.id; W.log('disciple', m.h.name.given + ' รับ ' + win.h.name.given + ' เป็นศิษย์เอก', [m.id, win.id]); }
  };

  
  /* ---------- Party Formation Synergies & Ensemble Auras (v2.0.9) ---------- */
  // Read-only strength: one specialist leads each aura; headcount cannot stack it.
  C.pathFormationMastery = unit => {
    const path = unit && unit.cult && unit.cult.path;
    if (!unit || unit.dead || unit.fled || unit.yield || (unit.h && unit.h.state && unit.h.state.hp <= 0) || (path !== 'ARRAY_TALISMAN' && path !== 'STRATEGY_GOVERNANCE')) return 0;
    const sk = (unit.h && unit.h.skills) || {};
    const sub = CULT.subInfo(path, unit.cult.sub);
    const primary = sub.primarySkill || (path === 'ARRAY_TALISMAN' ? 'ARRAY' : 'administration');
    const secondary = (sub.secondarySkills || [])[0] || (path === 'ARRAY_TALISMAN' ? 'TALISMAN' : 'SCRIPTURE');
    const read = key => Number.isFinite(sk[key]) ? clamp(sk[key], 0, 100) : 0;
    return clamp(0.25 + (read(primary) * 0.7 + read(secondary) * 0.3) * 0.0075, 0.25, 1);
  };

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
        if (c.path === "MECH_PUPPET" || c.path === "CRAFT_CREATION") hasMechPuppet = true;
        if (c.path === "KARMA_SAMSARA") hasKarmaSamsara = true;
        if (c.path === "XIAN") hasXian = true;
        if (c.path === "HEART_SOUL") hasHeartSoul = true;
      }
      if (Array.isArray(u.pets)) {
        totalBeasts += u.pets.filter(p => p && p.active).length;
      }
    });

    const specialistAura = (path, id, nameTh, powerCap, wardCap) => {
      let mastery = 0;
      alive.forEach(u => {
        if (!u.cult || u.cult.path !== path) return;
        const sub = CULT.subInfo(path, u.cult.sub);
        const roleScale = path === 'STRATEGY_GOVERNANCE' && sub.governanceRole !== 'command' ? 0.70 : 1;
        mastery = Math.max(mastery, C.pathFormationMastery(u) * roleScale);
      });
      if (!mastery) return;
      const power = powerCap * mastery, ward = wardCap * mastery;
      powerMult *= 1 + power;
      mitigation += ward;
      synergies.push({ id, nameTh, effect: 'เสริมอานุภาพ ' + (power * 100).toFixed(1) + '% ลดความเสียหาย ' + (ward * 100).toFixed(1) + '%', mastery: +mastery.toFixed(3) });
      auras.push(nameTh);
    };
    specialistAura('ARRAY_TALISMAN', 'TALISMAN_ARRAY_WARD', 'ค่ายกลยันต์คุ้มทัพ', 0.10, 0.08);
    specialistAura('STRATEGY_GOVERNANCE', 'STRATEGIC_COMMAND', 'กลยุทธ์บัญชาการประสานทัพ', 0.08, 0.04);

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
      powerMultiplier: +Math.min(1.85, powerMult).toFixed(3),
      damageMitigation: +Math.min(0.40, mitigation).toFixed(3),
      reflectPct: hasKarmaSamsara ? 0.15 : 0,
      auraNamesTh: auras
    };
  };

  /* =========================================================================
   * Patch v2.0.34 + v2.0.35: Unified Composable Effect Engine, Central Condition
   * Evaluator, Active Stances, Battlefield Domains, Multi-Tier Elemental Fusion
   * (2E / 3E / 4E), Acupoint Strikes & 100% Item Effect Runtime Engine
   * ========================================================================= */
  const COMPOSABLE_ENGINE = {
    MAX_TRIGGER_DEPTH: 3,
    MARK_KEYS: ['daoMark', 'starSeal', 'venomSeed', 'bloodBrand', 'sporeSeed'],
    DEBUFF_KEYS: [
      'burn', 'bleed', 'poison', 'slow', 'stun', 'silence', 'weaken', 'blind',
      'armorbreak', 'mdefbreak', 'exposed', 'chill', 'fear', 'paralyze', 'root',
      'curse', 'daoMark', 'starSeal', 'venomSeed', 'bloodBrand', 'taunted',
      'poiseBroken', 'ashenToxin', 'radiationBurn', 'crimsonGuSwarm',
      'sovereignPlague', 'stygianFreeze', 'weaponMelt', 'acupointSealed', 'disarmed'
    ],
    REACTIONS: {
      'burn+WIND': { id: 'INFERNO_VORTEX', code: '2E-02', nameTh: 'พายุเพลิงกัลป์ผลาญศึก', mult: 0.42, applyStatus: 'exposed', dur: 12, aoeSplash: true },
      'burn+LIGHTNING': { id: 'OVERLOAD_BLAST', code: '2E-03', nameTh: 'อัสนีเพลิงปะทุ', mult: 0.45, applyStatus: 'stun', dur: 4, aoeSplash: true },
      'chill+LIGHTNING': { id: 'SUPERCONDUCT_SHATTER', code: '2E-05', nameTh: 'อสนีผ่าเหมันต์ทลายเกราะ', mult: 0.44, applyStatus: 'armorbreak', dur: 14, penBonus: 25 },
      'slow+LIGHTNING': { id: 'SUPERCONDUCT_SHATTER', code: '2E-05', nameTh: 'อสนีผ่าเหมันต์ทลายเกราะ', mult: 0.38, applyStatus: 'armorbreak', dur: 12, penBonus: 20 },
      'chill+EARTH_METAL': { id: 'GLACIAL_SHATTER', code: '2E-07', nameTh: 'ศิลาบดน้ำแข็งแหลกสลาย', mult: 0.46, applyStatus: 'bleed', dur: 12 },
      'poison+FIRE': { id: 'MIASMA_DETONATION', code: '2E-04', nameTh: 'ระเบิดหมอกพิษอัคคี', mult: 0.48, applyStatus: 'burn', dur: 12, aoeSplash: true },
      'venomSeed+FIRE': { id: 'GU_FIRE_ERUPTION', code: '2E-04', nameTh: 'เพลิงจุดระเบิดกู่พิษ', mult: 0.52, applyStatus: 'weaken', dur: 14, aoeSplash: true },
      'bleed+BLOOD_DEMON': { id: 'BLOOD_BOIL_RUPTURE', code: '2E-14', nameTh: 'โลหิตเดือดสูบวิญญาณ', mult: 0.46, applyStatus: 'fear', dur: 10, leechPct: 0.35 },
      'mdefbreak+ASTRAL': { id: 'STARFALL_COLLAPSE', code: '2E-12', nameTh: 'ดาราถล่มทะเลจิต', mult: 0.45, applyStatus: 'silence', dur: 10 },
      'curse+LIGHT_YANG': { id: 'KARMIC_PURIFICATION_SMITE', code: '2E-11', nameTh: 'แสงธรรมชำระคำสาป', mult: 0.48, applyStatus: 'blind', dur: 12, selfBuff: 'clarityLotus' }
    }
  };

  /* ---------- Section 11: Multi-Tier Elemental Fusion Lookup Tables ---------- */
  const pairKey = (e1, e2) => [String(e1 || '').toUpperCase(), String(e2 || '').toUpperCase()].sort().join('+');
  const triKey = (e1, e2, e3) => [String(e1 || '').toUpperCase(), String(e2 || '').toUpperCase(), String(e3 || '').toUpperCase()].sort().join('+');
  const tetraKey = (e1, e2, e3, e4) => [String(e1 || '').toUpperCase(), String(e2 || '').toUpperCase(), String(e3 || '').toUpperCase(), String(e4 || '').toUpperCase()].sort().join('+');

  COMPOSABLE_ENGINE.DUAL_REACTIONS = Object.freeze({
    [pairKey('FIRE', 'WATER_ICE')]: {
      code: '2E-01', id: 'THERMAL_VAPORIZE', nameTh: 'ไอน้ำระเบิดปราณ', elements: ['FIRE', 'WATER_ICE'],
      mult: 1.75, applyStatus: 'blind', dur: 8, stripArmorBuff: true, aoeSplash: true,
      descTh: 'ขยายความเสียหายระเบิดไอน้ำ 1.75 เท่า สลายบัฟเกราะ และทำให้ตาพร่ามัว 2 รอบ'
    },
    [pairKey('FIRE', 'WIND')]: {
      code: '2E-02', id: 'INFERNO_CYCLONE', nameTh: 'พายุเพลิงกัลป์', elements: ['FIRE', 'WIND'],
      mult: 1.48, applyStatus: 'burn', dur: 12, spreadBurn: true, pullTowardCenter: true, aoeSplash: true,
      descTh: 'พายุเพลิงดูดรวบศัตรู แพร่กระจายสถานะเผาไหม้ไปยังศัตรูข้างเคียง'
    },
    [pairKey('FIRE', 'LIGHTNING')]: {
      code: '2E-03', id: 'PLASMA_OVERLOAD', nameTh: 'อสนีเพลิงคลั่ง', elements: ['FIRE', 'LIGHTNING'],
      mult: 1.55, applyStatus: 'stun', dur: 4, shieldBreakRatio: 0.40, knockback: true, aoeSplash: true,
      descTh: 'ระเบิดคลื่นพลาสมาทำลายโล่ 40% ซัดกระเด็นและทำให้มึนงง'
    },
    [pairKey('FIRE', 'WOOD_LIFE')]: {
      code: '2E-04', id: 'ASHEN_BLIGHT', nameTh: 'ไฟป่าผลาญชีพจร', elements: ['FIRE', 'WOOD_LIFE'],
      mult: 1.52, applyStatus: 'ashenToxin', secondaryStatus: 'burn', dur: 14, consumeHot: true,
      descTh: 'เผาผลาญบัฟฟื้นฟูทั้งหมดและฝังพิษเถ้าถ่านลดการรักษาลง 50% นาน 3 รอบ'
    },
    [pairKey('WATER_ICE', 'LIGHTNING')]: {
      code: '2E-05', id: 'SUPERCONDUCT_SHATTER', nameTh: 'เหมันต์อสนีทลายเกราะ', elements: ['WATER_ICE', 'LIGHTNING'],
      mult: 1.46, applyStatus: 'armorbreak', secondaryStatus: 'slow', dur: 14, chainTargets: 3, penBonus: 35,
      descTh: 'ชิ่งกระแสไฟฟ้าเหมันต์ 3 เป้าหมาย ลดป้องกันกายภาพ -35% และลดความเร็วร่าย -20%'
    },
    [pairKey('WATER_ICE', 'WIND')]: {
      code: '2E-06', id: 'BLIZZARD_WHITE_OUT', nameTh: 'พายุหิมะมืดบอด', elements: ['WATER_ICE', 'WIND'],
      mult: 1.42, applyStatus: 'chill', secondaryStatus: 'blind', dur: 12, chillStacks: 2, aoeSplash: true,
      descTh: 'พายุหิมะลดหลบหลีกและแม่นยำศัตรู -30% พร้อมสะสมความหนาวเหน็บ 2 ชั้น'
    },
    [pairKey('WATER_ICE', 'EARTH_METAL')]: {
      code: '2E-07', id: 'GLACIAL_SHATTER', nameTh: 'ภูผาบดน้ำแข็ง', elements: ['WATER_ICE', 'EARTH_METAL'],
      mult: 1.60, applyStatus: 'bleed', secondaryStatus: 'armorbreak', dur: 12, forceCrit: true,
      descTh: 'ทุบทำลายน้ำแข็งสร้างความเสียหายคริติคอลกายภาพ +60% และทำให้เลือดไหล'
    },
    [pairKey('LIGHTNING', 'EARTH_METAL')]: {
      code: '2E-08', id: 'MAGNETIC_POLARITY', nameTh: 'สนามแม่เหล็กดูดศาสตรา', elements: ['LIGHTNING', 'EARTH_METAL'],
      mult: 1.45, applyStatus: 'disarmed', secondaryStatus: 'paralyze', dur: 10, pullTowardCenter: true,
      descTh: 'สนามแม่เหล็กดูดรวบศัตรูที่ถือศาสตราโลหะและลดพลังโจมตีอาวุธลง -25%'
    },
    [pairKey('WOOD_LIFE', 'WATER_ICE')]: {
      code: '2E-09', id: 'PARASITIC_BLOOM', nameTh: 'บุปผากาฝากดูดปราณ', elements: ['WOOD_LIFE', 'WATER_ICE'],
      mult: 1.40, applyStatus: 'sporeSeed', dur: 14, leechPct: 0.28, qiLeechPct: 0.12,
      descTh: 'ฝังเมล็ดกาฝากดูดเลือดและปราณคืนสู่ผู้ร่าย และระเบิดซ้ำเมื่อถูกธาตุไฟ'
    },
    [pairKey('WOOD_LIFE', 'EARTH_METAL')]: {
      code: '2E-10', id: 'THORN_BASTION', nameTh: 'ปราการหนามพันธนาการ', elements: ['WOOD_LIFE', 'EARTH_METAL'],
      mult: 1.38, applyStatus: 'root', dur: 10, casterShieldPct: 0.20, selfBuff: 'karmicAegis',
      descTh: 'รากไม้ศิลาพันธนาการศัตรู 2 รอบ พร้อมสร้างเกราะหนาม 20% Max HP ให้ผู้ร่าย'
    },
    [pairKey('LIGHT_YANG', 'DARK_YIN')]: {
      code: '2E-11', id: 'TAIJI_ANNIHILATION', nameTh: 'ไท่จี๋สะท้านภพ', elements: ['LIGHT_YANG', 'DARK_YIN'],
      mult: 1.62, applyStatus: 'exposed', dur: 12, trueDmgRatio: 0.50, cleanseSelf: true, stripTargetBuff: true,
      descTh: 'แปรเปลี่ยนความเสียหาย 50% เป็นความเสียหายแท้จริง ชำระดีบัฟตนเองและสลายบัฟศัตรู'
    },
    [pairKey('ASTRAL', 'FIRE')]: {
      code: '2E-12', id: 'SOLAR_FLARE_NOVA', nameTh: 'สุริยคราสเผาผลาญ', elements: ['ASTRAL', 'FIRE'],
      mult: 1.58, applyStatus: 'radiationBurn', secondaryStatus: 'mdefbreak', dur: 14, ignoreMdefRatio: 0.40,
      descTh: 'เพลิงสุริยะดาราละเลยป้องกันวิชา 40% และเผาผลาญเพดานพลังชีวิตศัตรู -10%'
    },
    [pairKey('ASTRAL', 'WATER_ICE')]: {
      code: '2E-13', id: 'CRYO_STAR_MIRROR', nameTh: 'กระจกเงาดาราเหมันต์', elements: ['ASTRAL', 'WATER_ICE'],
      mult: 1.44, applyStatus: 'chill', dur: 10, selfBuff: 'cryoMirror', casterShieldPct: 0.16,
      descTh: 'สร้างกระจกน้ำแข็งดาราสะท้อนความเสียหายวิชาถัดไปของศัตรูคืน 25%'
    },
    [pairKey('BLOOD_DEMON', 'FIRE')]: {
      code: '2E-14', id: 'BLOOD_BOIL_DETONATION', nameTh: 'โลหิตเดือดระเบิดชีพจร', elements: ['BLOOD_DEMON', 'FIRE'],
      mult: 1.68, applyStatus: 'fear', secondaryStatus: 'bleed', dur: 10, detonateBleedMult: 2.0, leechPct: 0.30,
      descTh: 'จุดระเบิดสถานะเลือดไหลทั้งหมดเป็นความเสียหายฉับพลัน 200% และทำให้หวาดกลัว'
    },
    [pairKey('BLOOD_DEMON', 'WOOD_LIFE')]: {
      code: '2E-15', id: 'CRIMSON_GU_SWARM', nameTh: 'ฝูงกู่โลหิตกลืนกิน', elements: ['BLOOD_DEMON', 'WOOD_LIFE'],
      mult: 1.50, applyStatus: 'crimsonGuSwarm', dur: 14, leechPct: 0.35,
      descTh: 'ปล่อยฝูงแมลงกู่โลหิตสูบพลังชีวิตศัตรู 5%/รอบ ส่งกลับมารักษาผู้ร่าย'
    },
    [pairKey('BLOOD_DEMON', 'WATER_ICE')]: {
      code: '2E-16', id: 'BLOODFROST_SHARD', nameTh: 'ผลึกโลหิตเยือกแข็ง', elements: ['BLOOD_DEMON', 'WATER_ICE'],
      mult: 1.64, applyStatus: 'paralyze', secondaryStatus: 'exposed', dur: 10, selfHpSacrificePct: 0.05,
      descTh: 'สละเลือดตนเอง 5% หลอมหอกน้ำแข็งโลหิตตรึงร่างศัตรูและเพิ่มความแรงคริที่ได้รับ +25%'
    }
  });

  COMPOSABLE_ENGINE.TRI_REACTIONS = Object.freeze({
    [triKey('FIRE', 'WATER_ICE', 'WIND')]: {
      code: '3E-01', id: 'PRIMORDIAL_STORM', nameTh: 'มหาพายุไอน้ำบรรพกาล', elements: ['FIRE', 'WATER_ICE', 'WIND'],
      mult: 2.20, applyStatus: 'blind', secondaryStatus: 'exposed', dur: 14, stripTargetBuff: true, qiRestorePct: 0.15, aoeSplash: true,
      descTh: 'มหาพายุไอน้ำล้างบัฟเกราะศัตรูทั้งหมดและฟื้นฟูปราณให้ฝ่ายเดียวกัน 15% Max Qi'
    },
    [triKey('FIRE', 'LIGHTNING', 'WIND')]: {
      code: '3E-02', id: 'HEAVENLY_TRIBULATION_TEMPEST', nameTh: 'พายุทัณฑ์สวรรค์เก้าอสนี', elements: ['FIRE', 'LIGHTNING', 'WIND'],
      mult: 2.50, applyStatus: 'paralyze', secondaryStatus: 'stun', dur: 8, strikes: 3, aoeSplash: true,
      descTh: 'ฟาดสายฟ้าทัณฑ์สวรรค์ 3 สายต่อเนื่อง สร้างความเสียหายรุนแรงและสะกดอัมพาต'
    },
    [triKey('WATER_ICE', 'LIGHTNING', 'EARTH_METAL')]: {
      code: '3E-03', id: 'ABSOLUTE_ZERO_RAILGUN', nameTh: 'ศรแม่เหล็กศูนย์องศาสมบูรณ์', elements: ['WATER_ICE', 'LIGHTNING', 'EARTH_METAL'],
      mult: 2.40, applyStatus: 'stun', secondaryStatus: 'armorbreak', dur: 10, shieldBreakRatio: 1.0, penBonus: 60,
      descTh: 'ยิงลำแสงแม่เหล็กเหมันต์ทะลวงแนวเส้นตรง ละเลยป้องกัน 60% และทำลายโล่ทั้งหมด'
    },
    [triKey('FIRE', 'WOOD_LIFE', 'EARTH_METAL')]: {
      code: '3E-04', id: 'VOLCANIC_CALDERA_ERUPTION', nameTh: 'ภูเขาไฟปะทุหลอมพิภพ', elements: ['FIRE', 'WOOD_LIFE', 'EARTH_METAL'],
      mult: 2.30, applyStatus: 'burn', secondaryStatus: 'slow', dur: 16, aoeSplash: true,
      descTh: 'ระเบิดปากปล่องภูเขาไฟสร้างพื้นที่ลาวาเผาผลาญต่อเนื่องและลดความเร็วเคลื่อนที่ -40%'
    },
    [triKey('WOOD_LIFE', 'WATER_ICE', 'LIGHT_YANG')]: {
      code: '3E-05', id: 'IMMORTAL_NECTAR_SANCTUARY', nameTh: 'แดนทิพย์น้ำอมฤตบัวสวรรค์', elements: ['WOOD_LIFE', 'WATER_ICE', 'LIGHT_YANG'],
      mult: 1.85, applyStatus: 'blind', dur: 10, teamHealPct: 0.25, cleanseTeam: true, selfBuff: 'clarityLotus', secondaryBuff: 'vitalRegen',
      descTh: 'กลั่นน้ำอมฤตฟื้นฟูเลือดทั้งทีม 25% ชำระล้างพิษและดีบัฟทั้งหมด พร้อมมอบบัฟบัวทิพย์'
    },
    [triKey('BLOOD_DEMON', 'DARK_YIN', 'FIRE')]: {
      code: '3E-06', id: 'HELLFIRE_ASURA_APOTHEOSIS', nameTh: 'อวตารอสูรเพลิงอเวจี', elements: ['BLOOD_DEMON', 'DARK_YIN', 'FIRE'],
      mult: 2.45, applyStatus: 'fear', secondaryStatus: 'burn', dur: 12, selfBuff: 'asuraBloodFrenzy', leechPct: 0.35,
      descTh: 'ปลุกร่างอวตารอสูรเพลิงอเวจี เพิ่มพลังโจมตี +24% และดูดเลือด 35%'
    },
    [triKey('ASTRAL', 'LIGHT_YANG', 'DARK_YIN')]: {
      code: '3E-07', id: 'COSMIC_ECLIPSE_SINGULARITY', nameTh: 'หลุมดำสุริยุปราคาดาราจักร', elements: ['ASTRAL', 'LIGHT_YANG', 'DARK_YIN'],
      mult: 2.50, applyStatus: 'silence', secondaryStatus: 'exposed', dur: 12, trueDmgRatio: 0.50, pullTowardCenter: true, aoeSplash: true,
      descTh: 'สร้างหลุมดำสุริยุปราคาดูดรวบศัตรูทั้งหมด สร้างความเสียหายแท้จริงและผนึกวิชา 2 รอบ'
    },
    [triKey('LIGHTNING', 'WIND', 'ASTRAL')]: {
      code: '3E-08', id: 'VOID_THUNDER_STEP_MIRAGE', nameTh: 'ย่างก้าวอสนีทะลวงสุญตา', elements: ['LIGHTNING', 'WIND', 'ASTRAL'],
      mult: 2.35, applyStatus: 'exposed', dur: 10, selfBuff: 'astralMirage', secondaryBuff: 'thunderStep',
      descTh: 'ทะลวงมิติฟัน 5 กระบวนท่าพริบตา พร้อมเข้าสู่สภาวะเงาดาราซ้อนมิติหลบสวนอัตโนมัติ'
    },
    [triKey('WOOD_LIFE', 'BLOOD_DEMON', 'DARK_YIN')]: {
      code: '3E-09', id: 'MYRIAD_VENOM_SOVEREIGN_PLAGUE', nameTh: 'โรคระบาดราชันย์หมื่นพิษ', elements: ['WOOD_LIFE', 'BLOOD_DEMON', 'DARK_YIN'],
      mult: 2.25, applyStatus: 'sovereignPlague', secondaryStatus: 'poison', dur: 16, aoeSplash: true,
      descTh: 'แพร่เชื้อโรคระบาดราชันย์หมื่นพิษสร้างความเสียหาย 8% Max HP ต่อรอบและติดต่อเมื่อตาย'
    },
    [triKey('EARTH_METAL', 'FIRE', 'LIGHTNING')]: {
      code: '3E-10', id: 'DIVINE_FORGE_MOLTEN_HAMMER', nameTh: 'ค้อนเทพหลอมสวรรค์ทลายศาสตรา', elements: ['EARTH_METAL', 'FIRE', 'LIGHTNING'],
      mult: 2.40, applyStatus: 'weaponMelt', secondaryStatus: 'armorbreak', dur: 16, selfBuff: 'artisanFocus',
      descTh: 'ค้อนเพลิงอัสนีทุบหลอมศาสตราและเกราะของศัตรู ลดประสิทธิภาพอุปกรณ์ลง -30%'
    },
    [triKey('WATER_ICE', 'DARK_YIN', 'ASTRAL')]: {
      code: '3E-11', id: 'STYGIAN_ABYSS_FREEZE', nameTh: 'ยมโลกเยือกแข็งสะกดวิญญาณ', elements: ['WATER_ICE', 'DARK_YIN', 'ASTRAL'],
      mult: 2.30, applyStatus: 'stygianFreeze', secondaryStatus: 'chill', dur: 12,
      descTh: 'แช่แข็งวิญญาณด้วยไอเย็นยมโลก ปิดกั้นการฟื้นฟูเลือดและปราณของศัตรูอย่างสมบูรณ์ 2 รอบ'
    },
    [triKey('BLOOD_DEMON', 'LIGHT_YANG', 'FIRE')]: {
      code: '3E-12', id: 'KARMIC_SIN_INCINERATION', nameTh: 'เพลิงกรรมชำระบาปโลหิต', elements: ['BLOOD_DEMON', 'LIGHT_YANG', 'FIRE'],
      mult: 2.45, applyStatus: 'burn', secondaryStatus: 'exposed', dur: 12, trueDmgRatio: 0.45, karmaScale: true,
      descTh: 'จุดเพลิงกรรมเผาผลาญบาปในตัวศัตรู สร้างโบนัสความเสียหายแท้จริงตามบัญชีกรรมและจำนวนสังหาร'
    }
  });

  COMPOSABLE_ENGINE.TETRA_REACTIONS = Object.freeze({
    [tetraKey('FIRE', 'WATER_ICE', 'WIND', 'EARTH_METAL')]: {
      code: '4E-01', id: 'FOUR_HEAVENLY_SYMBOLS_DOMAIN', nameTh: 'ค่ายกลจตุรเทพพิทักษ์สวรรค์', elements: ['FIRE', 'WATER_ICE', 'WIND', 'EARTH_METAL'],
      mult: 3.10, deployDomain: 'DOMAIN_FOUR_HEAVENLY_SYMBOLS', teamBuff: 'tacticalCommand', casterShieldPct: 0.30, aoeSplash: true,
      descTh: 'อัญเชิญจตุรเทพมังกรคราม พยัคฆ์ขาว หงส์ชาด และเต่าดำ กางอาณาเขตสวรรค์ 5 รอบ'
    },
    [tetraKey('FIRE', 'WATER_ICE', 'WOOD_LIFE', 'EARTH_METAL')]: {
      code: '4E-02', id: 'CHAOS_WUXING_GENESIS', nameTh: 'ปฐมกำเนิดเบญจธาตุโกลาหล', elements: ['FIRE', 'WATER_ICE', 'WOOD_LIFE', 'EARTH_METAL'],
      mult: 3.50, applyStatus: 'exposed', dur: 16, trueDmgRatio: 0.60, resetCooldowns: true, restoreHpPct: 0.50, restoreQiPct: 0.50, aoeSplash: true,
      descTh: 'หลอมรวมวัฏจักรเบญจธาตุเป็นปราณโกลาหลบรรพกาล 350% รีเซ็ตคูลดาวน์และฟื้นฟูเลือด/ปราณ 50%'
    },
    [tetraKey('LIGHT_YANG', 'DARK_YIN', 'ASTRAL', 'BLOOD_DEMON')]: {
      code: '4E-03', id: 'SAMSARA_TWILIGHT_VERDICT', nameTh: 'พิพากษาวัฏสงสารสนธยา', elements: ['LIGHT_YANG', 'DARK_YIN', 'ASTRAL', 'BLOOD_DEMON'],
      mult: 3.60, applyStatus: 'curse', secondaryStatus: 'weaken', dur: 18, executeBelowPct: 0.25, selfBuff: 'karmicAegis', deployDomain: 'DOMAIN_SAMSARA_KARMA_WHEEL',
      descTh: 'เปิดประตูวัฏสงสารพิพากษาสังหารศัตรูที่เลือดต่ำกว่า 25% ทันที หรือช่วงชิงสเตตัส 20%'
    },
    [tetraKey('FIRE', 'LIGHTNING', 'LIGHT_YANG', 'ASTRAL')]: {
      code: '4E-04', id: 'NINE_SUNS_APOCALYPSE', nameTh: 'เก้าสุริยันล้างพิภพ', elements: ['FIRE', 'LIGHTNING', 'LIGHT_YANG', 'ASTRAL'],
      mult: 3.40, applyStatus: 'radiationBurn', secondaryStatus: 'blind', dur: 18, shieldBreakRatio: 1.0, destroySummons: true, aoeSplash: true,
      descTh: 'อัญเชิญดวงอาทิตย์จำลองเก้าดวงแผดเผาโล่และร่างอัญเชิญทั้งหมด พร้อมทำให้ศัตรูตาบอด 3 รอบ'
    },
    [tetraKey('WOOD_LIFE', 'BLOOD_DEMON', 'DARK_YIN', 'WATER_ICE')]: {
      code: '4E-05', id: 'NETHERWORLD_YGGDRASIL_ROOT', nameTh: 'รากพฤกษายมโลกกลืนวิญญาณ', elements: ['WOOD_LIFE', 'BLOOD_DEMON', 'DARK_YIN', 'WATER_ICE'],
      mult: 3.25, applyStatus: 'root', secondaryStatus: 'sovereignPlague', dur: 16, leechPct: 0.45, casterShieldPct: 0.35, aoeSplash: true,
      descTh: 'รากพฤกษายมโลกพันธนาการศัตรูทั้งหมดและสูบพลังชีวิตมาสร้างโล่คุ้มกันทั้งทีม'
    },
    [tetraKey('EARTH_METAL', 'LIGHTNING', 'FIRE', 'ASTRAL')]: {
      code: '4E-06', id: 'COSMIC_SINGULARITY_AUTOMATON', nameTh: 'จักรกลดาราจักรผ่ามิติ', elements: ['EARTH_METAL', 'LIGHTNING', 'FIRE', 'ASTRAL'],
      mult: 3.35, applyStatus: 'armorbreak', secondaryStatus: 'stun', dur: 10, deployDomain: 'DOMAIN_THOUSAND_PUPPET_MATRIX', selfBuff: 'puppetOverclock', aoeSplash: true,
      descTh: 'ประกอบร่างหุ่นเชิดกลืนดาราระดับ 7 ยิงลำแสงโคจรทำลายล้างและเปิดค่ายกลหมื่นหุ่นเชิด'
    }
  });

  /* ---------- Pillar 6: Battlefield Domains Catalog & Runtime Engine ---------- */
  COMPOSABLE_ENGINE.DOMAIN_CATALOG = Object.freeze({
    DOMAIN_ASTRAL_STARFIELD: {
      id: 'DOMAIN_ASTRAL_STARFIELD', nameTh: 'อาณาเขตดาราจักรสุญตา', element: 'ASTRAL', defaultDur: 24,
      allyBuff: 'starlightAegis', enemyStatus: 'starSeal', tickMult: 0.28,
      descTh: 'เพิ่มความแรงวิชาธาตุดารา/สุญตา +25% และโปรยฝนดาวตกใส่ศัตรูทุกต้นรอบ'
    },
    DOMAIN_PURGATORY_BLOOD_SEA: {
      id: 'DOMAIN_PURGATORY_BLOOD_SEA', nameTh: 'อาณาเขตทะเลโลหิตอเวจี', element: 'BLOOD_DEMON', defaultDur: 24,
      allyBuff: 'bloodFrenzy', enemyStatus: 'bleed', tickMult: 0.30, leechPct: 0.25,
      descTh: 'สูบเลือดศัตรูที่มีสถานะเลือดไหลทุกต้นรอบมารักษาผู้ร่ายและพันธมิตรสายมาร/โลหิต'
    },
    DOMAIN_GOLDEN_LOTUS_SANCTUARY: {
      id: 'DOMAIN_GOLDEN_LOTUS_SANCTUARY', nameTh: 'อาณาเขตแดนบัวทองคำบริสุทธิ์', element: 'LIGHT_YANG', defaultDur: 24,
      allyBuff: 'clarityLotus', healPct: 0.06, cleanseEachTick: true,
      descTh: 'ฟื้นฟูเลือดพันธมิตร 6% ทุกต้นรอบ ชำระล้างพิษ/คำสาป และลดความเสียหายขาเข้า 20%'
    },
    DOMAIN_THOUSAND_PUPPET_MATRIX: {
      id: 'DOMAIN_THOUSAND_PUPPET_MATRIX', nameTh: 'อาณาเขตค่ายกลหมื่นหุ่นเชิด', element: 'EARTH_METAL', defaultDur: 24,
      allyBuff: 'puppetOverclock', enemyStatus: 'armorbreak', tickMult: 0.32, restoreIntegrity: 12,
      descTh: 'เร่งความเร็วหุ่นเชิดและซ่อมแซมความสมบูรณ์ +12 ทุกต้นรอบ พร้อมยิงปืนกลปราณสนับสนุน'
    },
    DOMAIN_SAMSARA_KARMA_WHEEL: {
      id: 'DOMAIN_SAMSARA_KARMA_WHEEL', nameTh: 'อาณาเขตกงล้อวัฏสงสารหกภูมิ', element: 'DARK_YIN', defaultDur: 24,
      allyBuff: 'karmicAegis', enemyStatus: 'curse', tickMult: 0.26, reflectPct: 0.22,
      descTh: 'สะท้อนความเสียหายตามวิบากกรรม 22% และฝังคำสาปวัฏสงสารใส่ศัตรูทุกต้นรอบ'
    },
    DOMAIN_EIGHT_TRIGRAM_LABYRINTH: {
      id: 'DOMAIN_EIGHT_TRIGRAM_LABYRINTH', nameTh: 'อาณาเขตค่ายกลแปดทิศฉีเหมิน', element: 'WIND', defaultDur: 24,
      allyBuff: 'aegisWard', enemyStatus: 'slow', tickMult: 0.25,
      descTh: 'บิดเบือนทิศทางในค่ายกลแปดทิศ ลดความแม่นยำและความเร็วศัตรู พร้อมเพิ่มป้องกันให้ทีม'
    },
    DOMAIN_FOUR_HEAVENLY_SYMBOLS: {
      id: 'DOMAIN_FOUR_HEAVENLY_SYMBOLS', nameTh: 'อาณาเขตจตุรเทพพิทักษ์สวรรค์', element: 'ASTRAL', defaultDur: 30,
      allyBuff: 'tacticalCommand', enemyStatus: 'exposed', tickMult: 0.36, healPct: 0.05,
      descTh: 'อาณาเขตจตุรเทพสูงสุด มอบพรโจมตี/ป้องกัน/ฟื้นฟูครบสี่ทิศและถล่มศัตรูทุกต้นรอบ'
    },
    DOMAIN_NINE_HELLS_ABYSS: {
      id: 'DOMAIN_NINE_HELLS_ABYSS', nameTh: 'อาณาเขตนรกเก้าขุมอเวจี', element: 'DARK_YIN', defaultDur: 24,
      allyBuff: 'asuraBloodFrenzy', enemyStatus: 'stygianFreeze', tickMult: 0.32,
      descTh: 'แผ่ไอเย็นและเพลิงอเวจีเก้าขุม ปิดกั้นการรักษาของศัตรูและเพิ่มพลังทำลายล้างสูงสุด'
    }
  });

  COMPOSABLE_ENGINE.deployDomain = (W, f, caster, domainId, dur) => {
    if (!f || !caster) return null;
    const spec = COMPOSABLE_ENGINE.DOMAIN_CATALOG[domainId] || COMPOSABLE_ENGINE.DOMAIN_CATALOG.DOMAIN_ASTRAL_STARFIELD;
    const tNow = (W && W.t != null) ? W.t : (STs().now || 0);
    const casterRank = caster.cult ? (CULT.equivalentStage ? CULT.equivalentStage(caster) : (caster.cult.stage || 1)) : (caster.tier || 1);
    const casterSide = C.sideOf ? C.sideOf(f, caster.id) : 'A';
    // Domain Clash check
    if (f.activeDomain && f.activeDomain.until > tNow && f.activeDomain.side !== casterSide) {
      const prevRank = f.activeDomain.casterRank || 1;
      if (casterRank < prevRank) {
        caster.fx = { t: tNow, text: '⚠️ อาณาเขตถูกข่ม!' };
        return f.activeDomain;
      }
      if (casterRank === prevRank) {
        const allUnits = [].concat(f.A || [], f.B || []).map(id => C.unit(W, id)).filter(C.alive);
        for (const u of allUnits) {
          const shatterDmg = Math.max(10, Math.round(C.hpMax(u) * 0.12));
          C.setHp(u, Math.max(1, C.hp(u) - shatterDmg));
          u.fx = { t: tNow, text: '💥 อาณาเขตปะทะแตกสลาย! (-' + shatterDmg + ')' };
        }
        f.lastDomainClash = { t: tNow, domainA: f.activeDomain.id, domainB: spec.id, outcome: 'DOMAIN_SHATTER' };
        f.activeDomain = null;
        return null;
      }
    }
    const cleanDur = clamp(Number(dur) || spec.defaultDur || 24, 6, 120);
    f.activeDomain = {
      id: spec.id,
      nameTh: spec.nameTh,
      element: spec.element,
      casterId: caster.id,
      casterRank,
      side: casterSide,
      startedAt: tNow,
      until: tNow + cleanDur,
      lastTickAt: tNow - 4,
      spec
    };
    caster.fx = { t: tNow, text: '🌐 กาง' + spec.nameTh + '!' };
    caster.lastDomainDeployed = { t: tNow, domainId: spec.id, nameTh: spec.nameTh };
    COMPOSABLE_ENGINE.tickDomain(W, f, true);
    return f.activeDomain;
  };

  COMPOSABLE_ENGINE.tickDomain = (W, f, immediate) => {
    if (!f || !f.activeDomain) return false;
    const tNow = (W && W.t != null) ? W.t : (STs().now || 0);
    const dom = f.activeDomain;
    if (dom.until <= tNow) {
      f.activeDomain = null;
      return false;
    }
    if (!immediate && tNow - (dom.lastTickAt || 0) < 4) return false;
    dom.lastTickAt = tNow;
    const spec = dom.spec || COMPOSABLE_ENGINE.DOMAIN_CATALOG[dom.id];
    if (!spec) return false;
    const ST = STs();
    const caster = C.unit(W, dom.casterId);
    const allyIds = dom.side === 'A' ? (f.A || []) : (f.B || []);
    const enemyIds = dom.side === 'A' ? (f.B || []) : (f.A || []);
    const allies = allyIds.map(id => C.unit(W, id)).filter(C.alive);
    const enemies = enemyIds.map(id => C.unit(W, id)).filter(C.alive);

    for (const al of allies) {
      if (spec.allyBuff && ST.applyNamedBuff && !al.foe) {
        ST.applyNamedBuff(al, spec.allyBuff, 12, tNow, { casterId: dom.casterId });
      }
      if (spec.healPct && !ST.has(al, 'stygianFreeze', tNow)) {
        const hm = C.hpMax(al);
        C.setHp(al, Math.min(hm, C.hp(al) + Math.max(1, Math.round(hm * spec.healPct))));
      }
      if (spec.cleanseEachTick) {
        ST.clearStatus(al, x => ['poison', 'burn', 'bleed', 'curse', 'slow', 'weaken'].includes(x.k));
      }
      if (spec.restoreIntegrity && al.cult && al.cult.path === 'MECH_PUPPET' && CULT.ensureMechState) {
        const ms = CULT.ensureMechState(al);
        ms.integrity = clamp((ms.integrity || 50) + spec.restoreIntegrity, 0, 100);
        ms.constructReadiness = ms.integrity;
      }
    }
    const baseAtk = caster ? Math.max(ST.get(caster).atk || 40, ST.get(caster).matk || 40) : 50;
    for (const en of enemies) {
      if (spec.enemyStatus) {
        if (COMPOSABLE_ENGINE.MARK_KEYS.includes(spec.enemyStatus)) {
          COMPOSABLE_ENGINE.applyMark(W, f, caster || allies[0], en, spec.enemyStatus, 1, 12);
        } else {
          ST.addStatus(en, spec.enemyStatus, 10, { per: 0.015, src: dom.casterId }, tNow);
        }
      }
      if (spec.tickMult && C.alive(en)) {
        const dDmg = Math.max(4, Math.round(baseAtk * spec.tickMult * (f.serious ? 0.35 : 0.22)));
        f._composableDepth = (f._composableDepth || 0) + 1;
        try {
          C.applyDamage(W, f, caster || allies[0] || en, en, dDmg, spec.nameTh);
          if (spec.leechPct && caster && !caster.dead) {
            C.setHp(caster, Math.min(C.hpMax(caster), C.hp(caster) + Math.max(1, Math.round(dDmg * spec.leechPct))));
          }
        } finally {
          f._composableDepth = Math.max(0, (f._composableDepth || 1) - 1);
        }
      }
    }
    return true;
  };

  /* ---------- Pillar 1: Central Condition Evaluator (13 Original + 16 Section 10.2 Conditions) ---------- */
  COMPOSABLE_ENGINE.evaluateCondition = (cond, caster, target, ctx) => {
    if (!cond || cond === 'ALWAYS') return true;
    ctx = ctx || {};
    const W = ctx.W || { t: (STs() && STs().now) || 0 };
    const f = ctx.f || (caster && C.fightOf ? C.fightOf(W, caster) : null);
    const tNow = (W && W.t != null) ? W.t : ((STs() && STs().now) || 0);
    const ST = STs();

    if (Array.isArray(cond)) {
      return cond.every(c => COMPOSABLE_ENGINE.evaluateCondition(c, caster, target, ctx));
    }
    if (typeof cond === 'object') {
      if (Array.isArray(cond.all)) return cond.all.every(c => COMPOSABLE_ENGINE.evaluateCondition(c, caster, target, ctx));
      if (Array.isArray(cond.any)) return cond.any.some(c => COMPOSABLE_ENGINE.evaluateCondition(c, caster, target, ctx));
      const kind = cond.kind || cond.id || cond.condition || 'ALWAYS';
      return COMPOSABLE_ENGINE._evalSingleCondition(kind, cond, caster, target, W, f, tNow, ST, ctx);
    }
    return COMPOSABLE_ENGINE._evalSingleCondition(String(cond), {}, caster, target, W, f, tNow, ST, ctx);
  };

  COMPOSABLE_ENGINE._evalSingleCondition = (kind, params, caster, target, W, f, tNow, ST, ctx) => {
    if (!kind || kind === 'ALWAYS') return true;
    // Fast per-tick cache check for parameterless string conditions
    const hasCtxOverride = ctx && (ctx.dist != null || ctx.weather != null || ctx.terrain != null || ctx.isNight != null);
    const cacheKey = f && !hasCtxOverride && (!params || Object.keys(params).length === 0)
      ? (tNow + ':' + kind + ':' + (caster ? caster.id : '') + ':' + (target ? target.id : ''))
      : null;
    if (cacheKey && f._condCache && f._condCache.t === tNow && cacheKey in f._condCache.map) {
      return f._condCache.map[cacheKey];
    }
    const store = val => {
      if (cacheKey && f) {
        if (!f._condCache || f._condCache.t !== tNow) f._condCache = { t: tNow, map: {} };
        f._condCache.map[cacheKey] = !!val;
      }
      return !!val;
    };

    const cHpFrac = caster ? hpFrac(caster) : 1;
    const tHpFrac = target ? hpFrac(target) : 1;
    const cQiFrac = (!caster || caster.foe || !caster.cult || !caster.h || !caster.h.state)
      ? 1
      : clamp((caster.h.state.qi == null ? CULT.qiMax(caster) : caster.h.state.qi) / Math.max(1, CULT.qiMax(caster)), 0, 1);

    switch (kind) {
      case 'TARGET_HP_BELOW_40':
      case 'TARGET_HP_BELOW_PCT':
        return store(target && tHpFrac <= (params.thresholdPct || params.pct || 0.40));
      case 'TARGET_HP_ABOVE_70':
      case 'TARGET_HP_ABOVE_PCT':
        return store(target && tHpFrac >= (params.thresholdPct || params.pct || 0.70));
      case 'SELF_HP_BELOW_50':
      case 'SELF_HP_BELOW_PCT':
        return store(caster && cHpFrac <= (params.thresholdPct || params.pct || 0.50));
      case 'SELF_QI_ABOVE_60':
      case 'SELF_QI_ABOVE_PCT':
        return store(caster && cQiFrac >= (params.thresholdPct || params.pct || 0.60));
      case 'TARGET_HAS_DEBUFF':
        return store(target && Array.isArray(target.sx) && target.sx.some(x => x && x.until > tNow && COMPOSABLE_ENGINE.DEBUFF_KEYS.includes(x.k)));
      case 'TARGET_HAS_SHIELD':
        return store(target && (!!shieldOf(target) || ST.has(target, 'guardUp', tNow)));
      case 'TARGET_HAS_MARK':
        return store(target && COMPOSABLE_ENGINE.totalMarksOn(target, tNow) >= (params.minStacks || 1));
      case 'TARGET_MARK_STACKS_AT_LEAST_2':
        return store(target && COMPOSABLE_ENGINE.totalMarksOn(target, tNow) >= (params.minStacks || 2));
      case 'SELF_HAS_STANCE': {
        const curSt = caster && (caster._activeStance || caster._combatStance);
        return store(!!curSt && (!params.stanceId || curSt === params.stanceId));
      }
      case 'TARGET_IS_CONTROLLED':
        return store(target && Array.isArray(target.sx) && target.sx.some(x => x && x.until > tNow && ['stun', 'silence', 'paralyze', 'root', 'fear', 'taunted', 'acupointSealed', 'stygianFreeze'].includes(x.k)));
      case 'SELF_HAS_COMBO_PRIMER':
        return store(caster && (ST.has(caster, 'comboReady', tNow) || (ST.hasBuff && ST.hasBuff(caster, 'comboReady', tNow))));
      case 'SELF_TOXICITY_ABOVE_25':
        return store(caster && !caster.foe && caster.cult && (caster.cult.toxic || 0) >= (params.threshold || 25));
      case 'SELF_HEART_DEMON_ABOVE_20':
        return store(caster && !caster.foe && caster.h && caster.h.state && (caster.h.state.heartDemon || 0) >= (params.threshold || 20));
      case 'PARTY_SIZE_AT_LEAST_2':
      case 'ALLY_COUNT_ALIVE': {
        const minAllies = params.minAllies || 2;
        const allies = (f && caster && C.alliesOf) ? C.alliesOf(W, f, caster.id).filter(C.alive) : (caster ? [caster] : []);
        return store(allies.length >= minAllies);
      }
      case 'LONE_WOLF_SOLO': {
        const allies = (f && caster && C.alliesOf) ? C.alliesOf(W, f, caster.id).filter(C.alive) : (caster ? [caster] : []);
        return store(allies.length <= 1);
      }
      case 'TIME_OF_DAY_NIGHT': {
        const tod = (W && W.timeOfDay != null) ? W.timeOfDay : ((tNow % 1440) / 60);
        const isEclipse = !!(W && W.celestialEvent && W.celestialEvent.id === 'BLOOD_MOON_ECLIPSE');
        return store(isEclipse || tod >= 19 || tod <= 5 || !!(ctx && ctx.isNight));
      }
      case 'WEATHER_STORM': {
        const rawWth = (ctx && ctx.weather) || (W && W.weather && (W.weather.kind || W.weather)) || (W && W.sect && W.sect.weather) || '';
        return store(['STORM', 'THUNDER', 'RAIN', 'BLIZZARD', 'SNOW'].includes(String(rawWth).toUpperCase()) || !!(f && f.activeDomain && f.activeDomain.element === 'LIGHTNING'));
      }
      case 'TERRAIN_WATER_OR_ICE': {
        const ter = (f && f.terrain) || (W && W.terrain) || (ctx && ctx.terrain) || '';
        return store(['WATER', 'ICE', 'SNOW', 'RIVER', 'LAKE'].includes(String(ter).toUpperCase()) || (target && ST.has(target, 'chill', tNow)));
      }
      case 'TERRAIN_HIGH_GROUND': {
        const ter = (f && f.terrain) || (ctx && ctx.terrain) || '';
        return store(['HIGH_GROUND', 'MOUNTAIN', 'PEAK', 'CLIFF'].includes(String(ter).toUpperCase()) || !!(caster && caster.highGround));
      }
      case 'DISTANCE_FAR': {
        const dist = (ctx && Number.isFinite(ctx.dist)) ? ctx.dist : ((caster && target && Number.isFinite(caster.x) && Number.isFinite(target.x)) ? Math.hypot(caster.x - target.x, caster.y - target.y) : 2.5);
        return store(dist >= (params.minDist || 2.1));
      }
      case 'DISTANCE_MELEE': {
        const dist = (ctx && Number.isFinite(ctx.dist)) ? ctx.dist : ((caster && target && Number.isFinite(caster.x) && Number.isFinite(target.x)) ? Math.hypot(caster.x - target.x, caster.y - target.y) : 1.4);
        return store(dist <= (params.maxDist || 1.85));
      }
      case 'ENEMY_CASTING_SKILL':
        return store(target && ((target.act && target.act.ctx && target.act.ctx.channeling) || ST.has(target, 'channeling', tNow)));
      case 'COMBO_CHAIN_COUNT_3_PLUS':
        return store(caster && (caster._comboChainCount || 0) >= (params.minChain || 3));
      case 'WEAPON_DURABILITY_HIGH': {
        const wpn = caster && caster.equip && caster.equip.WEAPON;
        return store(wpn && !wpn.broken && (wpn.dur == null || wpn.dur >= (params.minDur || 80)));
      }
      case 'WEAPON_BROKEN_UNARMED': {
        const wpn = caster && caster.equip && caster.equip.WEAPON;
        return store(!wpn || !!wpn.broken || (wpn.dur != null && wpn.dur <= 0));
      }
      case 'TARGET_REALM_HIGHER': {
        const cSt = caster && caster.cult ? (CULT.equivalentStage ? CULT.equivalentStage(caster) : caster.cult.stage) : (caster && caster.tier) || 1;
        const tSt = target && target.cult ? (CULT.equivalentStage ? CULT.equivalentStage(target) : target.cult.stage) : (target && target.tier) || 1;
        return store(tSt > cSt);
      }
      case 'TARGET_REALM_LOWER': {
        const cSt = caster && caster.cult ? (CULT.equivalentStage ? CULT.equivalentStage(caster) : caster.cult.stage) : (caster && caster.tier) || 1;
        const tSt = target && target.cult ? (CULT.equivalentStage ? CULT.equivalentStage(target) : target.cult.stage) : (target && target.tier) || 1;
        return store(tSt < cSt);
      }
      case 'RECENTLY_DODGED_OR_PARRIED':
        return store(caster && caster._lastDodgeOrParryAt != null && (tNow - caster._lastDodgeOrParryAt) <= (params.windowTicks || 8));
      case 'KARMIC_DEBT_POSITIVE': {
        const ks = caster && caster.karmaState;
        return store((ks && (ks.debtPool || ks.karmicDebt || 0) > 0) || (caster && (caster.karmicDebt || 0) > 0));
      }
      case 'SIN_KARMA_HIGH': {
        const kills = (target && target.stats && target.stats.kills) || (target && target.killCount) || (caster && caster.stats && caster.stats.kills) || 0;
        const hd = (target && target.h && target.h.state && target.h.state.heartDemon) || 0;
        return store(kills >= 3 || hd >= 35 || !!(target && target.cult && target.cult.path === 'DEMON'));
      }
      default:
        return store(true);
    }
  };

  /* ---------- Elemental Gauge & Multi-Tier Fusion Engine (Section 11) ---------- */
  COMPOSABLE_ENGINE.STATUS_TO_ELEMENT = Object.freeze({
    burn: 'FIRE', radiationBurn: 'FIRE',
    chill: 'WATER_ICE', stygianFreeze: 'WATER_ICE',
    paralyze: 'LIGHTNING',
    slow: 'WIND',
    armorbreak: 'EARTH_METAL', weaponMelt: 'EARTH_METAL',
    poison: 'WOOD_LIFE', venomSeed: 'WOOD_LIFE', sporeSeed: 'WOOD_LIFE', sovereignPlague: 'WOOD_LIFE',
    blind: 'LIGHT_YANG',
    curse: 'DARK_YIN', fear: 'DARK_YIN',
    starSeal: 'ASTRAL', mdefbreak: 'ASTRAL',
    bleed: 'BLOOD_DEMON', bloodBrand: 'BLOOD_DEMON', crimsonGuSwarm: 'BLOOD_DEMON'
  });

  COMPOSABLE_ENGINE.applyElementalAura = (target, element, gaugeUnits, now, sourceId) => {
    if (!target || !element) return null;
    const tNow = now != null ? now : (STs().now || 0);
    target._elemAuras = target._elemAuras || {};
    const el = String(element).toUpperCase();
    const u = clamp(Number(gaugeUnits) || 1.5, 0.5, 3.0);
    const cur = target._elemAuras[el];
    target._elemAuras[el] = {
      element: el,
      gauge: clamp((cur && cur.until > tNow ? cur.gauge * 0.5 : 0) + u, 0.5, 3.0),
      appliedAt: tNow,
      until: tNow + Math.round(u * 10) + 6,
      sourceId: sourceId || null
    };
    return target._elemAuras[el];
  };

  COMPOSABLE_ENGINE.getActiveElementalAuras = (target, now) => {
    if (!target) return [];
    const tNow = now != null ? now : (STs().now || 0);
    const auras = new Set();
    if (target._elemAuras) {
      for (const [el, entry] of Object.entries(target._elemAuras)) {
        if (entry && entry.gauge > 0.05 && entry.until > tNow) auras.add(el);
        else delete target._elemAuras[el];
      }
    }
    if (Array.isArray(target.sx)) {
      for (const sx of target.sx) {
        if (sx && sx.until > tNow && COMPOSABLE_ENGINE.STATUS_TO_ELEMENT[sx.k]) {
          auras.add(COMPOSABLE_ENGINE.STATUS_TO_ELEMENT[sx.k]);
        }
      }
    }
    return Array.from(auras);
  };

  COMPOSABLE_ENGINE.decayElementalAuras = (W, f) => {
    if (!f) return;
    const tNow = (W && W.t != null) ? W.t : (STs().now || 0);
    const units = [].concat(f.A || [], f.B || []).map(id => C.unit(W, id)).filter(Boolean);
    for (const u of units) {
      if (!u._elemAuras) continue;
      for (const el of Object.keys(u._elemAuras)) {
        const a = u._elemAuras[el];
        if (!a || a.until <= tNow) { delete u._elemAuras[el]; continue; }
        a.gauge = Math.max(0, +(a.gauge - 0.2).toFixed(2));
        if (a.gauge <= 0.05) delete u._elemAuras[el];
      }
    }
  };

  COMPOSABLE_ENGINE.resolveElementalReactionSpec = (activeElements, catalystEl, explicitId) => {
    if (explicitId) {
      for (const tbl of [COMPOSABLE_ENGINE.TETRA_REACTIONS, COMPOSABLE_ENGINE.TRI_REACTIONS, COMPOSABLE_ENGINE.DUAL_REACTIONS]) {
        for (const spec of Object.values(tbl)) {
          if (spec.id === explicitId || spec.code === explicitId) return spec;
        }
      }
    }
    const cat = String(catalystEl || 'FIRE').toUpperCase();
    const others = (activeElements || []).map(e => String(e).toUpperCase()).filter(e => e && e !== cat);
    // 1. Check 4-Element Primordial Reaction first
    if (others.length >= 3) {
      for (let i = 0; i < others.length; i++) {
        for (let j = i + 1; j < others.length; j++) {
          for (let k = j + 1; k < others.length; k++) {
            const tk = tetraKey(cat, others[i], others[j], others[k]);
            if (COMPOSABLE_ENGINE.TETRA_REACTIONS[tk]) return COMPOSABLE_ENGINE.TETRA_REACTIONS[tk];
          }
        }
      }
    }
    // 2. Check 3-Element Tri-Harmonic Reaction
    if (others.length >= 2) {
      for (let i = 0; i < others.length; i++) {
        for (let j = i + 1; j < others.length; j++) {
          const trk = triKey(cat, others[i], others[j]);
          if (COMPOSABLE_ENGINE.TRI_REACTIONS[trk]) return COMPOSABLE_ENGINE.TRI_REACTIONS[trk];
        }
      }
    }
    // 3. Check 2-Element Dual Reaction
    for (let i = 0; i < others.length; i++) {
      const pk = pairKey(cat, others[i]);
      if (COMPOSABLE_ENGINE.DUAL_REACTIONS[pk]) return COMPOSABLE_ENGINE.DUAL_REACTIONS[pk];
    }
    return null;
  };

  COMPOSABLE_ENGINE.triggerElementalReaction = (W, f, a, t, catalystEl, baseDmg, opts) => {
    if (!t || !C.alive(t)) return null;
    opts = opts || {};
    const ST = STs();
    const tNow = (W && W.t != null) ? W.t : (ST.now || 0);
    t._elemReactionIcd = t._elemReactionIcd || {};
    const icdKey = (opts.skillId || catalystEl || 'EL') + ':' + tNow;
    if (opts.enforceIcd && t._elemReactionIcd[icdKey]) return null;
    t._elemReactionIcd[icdKey] = true;
    const activeAuras = COMPOSABLE_ENGINE.getActiveElementalAuras(t, tNow);
    const spec = COMPOSABLE_ENGINE.resolveElementalReactionSpec(activeAuras, catalystEl, opts.explicitReactionId);
    if (!spec) {
      COMPOSABLE_ENGINE.applyElementalAura(t, catalystEl, opts.gaugeUnits || 1.5, tNow, a ? a.id : null);
      return null;
    }
    // Consume elemental gauges involved in the reaction
    if (t._elemAuras) {
      for (const el of (spec.elements || [])) {
        if (t._elemAuras[el]) {
          t._elemAuras[el].gauge = Math.max(0, t._elemAuras[el].gauge - 1.0);
          if (t._elemAuras[el].gauge <= 0.1) delete t._elemAuras[el];
        }
      }
    }
    const reactorBonus = (a && a._hasElementalReactor) ? 1.22 : 1.0;
    let mult = (spec.mult || 1.45) * reactorBonus;
    if (spec.karmaScale) {
      const debt = (a && a.karmaState && a.karmaState.debtPool) || (t && t.stats && t.stats.kills * 15) || 20;
      mult *= (1 + clamp(debt / 150, 0.15, 1.20));
    }
    const rawBase = Math.max(12, Number(baseDmg) || (a ? Math.max(ST.get(a).atk || 40, ST.get(a).matk || 40) * 0.45 : 35));
    const reactDmg = Math.max(8, Math.round(rawBase * (mult - 0.55)));
    if (f) f._composableDepth = (f._composableDepth || 0) + 1;
    try {
      if (spec.stripArmorBuff || spec.stripTargetBuff) {
        ST.clearStatus(t, x => x.k === 'guardUp' || (SKs().STATUS[x.k] && SKs().STATUS[x.k].isBuff));
      }
      if (spec.shieldBreakRatio) {
        const sh = shieldOf(t);
        if (sh) {
          sh.amt = Math.max(0, Math.round(sh.amt * (1 - spec.shieldBreakRatio)));
          if (sh.amt <= 0) ST.clearStatus(t, x => x.k === 'shield');
        }
      }
      if (spec.consumeHot && Array.isArray(t.sx)) {
        ST.clearStatus(t, x => SKs().STATUS[x.k] && SKs().STATUS[x.k].hot);
      }
      if (spec.selfHpSacrificePct && a && !a.dead) {
        C.setHp(a, Math.max(1, C.hp(a) - Math.round(C.hpMax(a) * spec.selfHpSacrificePct)));
      }
      if (spec.trueDmgRatio) {
        const truePortion = Math.max(4, Math.round(reactDmg * spec.trueDmgRatio));
        const normalPortion = Math.max(2, reactDmg - truePortion);
        C.setHp(t, Math.max(1, C.hp(t) - truePortion));
        C.applyDamage(W, f, a, t, normalPortion, spec.nameTh);
      } else {
        C.applyDamage(W, f, a, t, reactDmg, spec.nameTh);
      }
      if (spec.executeBelowPct && C.alive(t) && !t.isBoss && hpFrac(t) <= spec.executeBelowPct) {
        C.applyDamage(W, f, a, t, C.hp(t) + 10, spec.nameTh + ' (พิพากษา)');
      }
      if (spec.applyStatus && C.alive(t)) {
        const isDot = ['burn', 'bleed', 'poison', 'radiationBurn', 'crimsonGuSwarm', 'sovereignPlague'].includes(spec.applyStatus);
        ST.addStatus(t, spec.applyStatus, spec.dur || 12, isDot ? { per: 0.018, src: a ? a.id : null } : null, tNow);
      }
      if (spec.secondaryStatus && C.alive(t)) {
        const isDot2 = ['burn', 'bleed', 'poison'].includes(spec.secondaryStatus);
        ST.addStatus(t, spec.secondaryStatus, spec.dur || 10, isDot2 ? { per: 0.015, src: a ? a.id : null } : null, tNow);
      }
      if (spec.leechPct && a && !a.dead && !ST.has(a, 'stygianFreeze', tNow)) {
        C.setHp(a, Math.min(C.hpMax(a), C.hp(a) + Math.max(1, Math.round(reactDmg * spec.leechPct))));
      }
      if (spec.casterShieldPct && a && !a.dead) {
        ST.addStatus(a, 'shield', 16, { amt: Math.round(C.hpMax(a) * spec.casterShieldPct) }, tNow);
      }
      if (spec.selfBuff && a && ST.applyNamedBuff && !a.foe) {
        ST.applyNamedBuff(a, spec.selfBuff, 28, tNow, { casterId: a.id });
      }
      if (spec.secondaryBuff && a && ST.applyNamedBuff && !a.foe) {
        ST.applyNamedBuff(a, spec.secondaryBuff, 28, tNow, { casterId: a.id });
      }
      if (spec.cleanseSelf && a) {
        ST.clearStatus(a, x => ['burn', 'bleed', 'poison', 'slow', 'weaken', 'blind', 'chill', 'curse'].includes(x.k));
      }
      if (spec.teamHealPct && f && a) {
        const allies = C.alliesOf(W, f, a.id).filter(C.alive);
        for (const al of allies) {
          const hm = C.hpMax(al);
          C.setHp(al, Math.min(hm, C.hp(al) + Math.round(hm * spec.teamHealPct)));
          if (spec.cleanseTeam) ST.clearStatus(al, x => COMPOSABLE_ENGINE.DEBUFF_KEYS.includes(x.k));
        }
      }
      if (spec.qiRestorePct && a && !a.foe && a.cult && a.h && a.h.state) {
        const qm = CULT.qiMax(a);
        a.h.state.qi = Math.min(qm, (a.h.state.qi || 0) + qm * spec.qiRestorePct);
      }
      if (spec.restoreHpPct && a && !a.dead) {
        const hm = C.hpMax(a);
        C.setHp(a, Math.min(hm, C.hp(a) + Math.round(hm * spec.restoreHpPct)));
      }
      if (spec.restoreQiPct && a && !a.foe && a.cult && a.h && a.h.state) {
        const qm = CULT.qiMax(a);
        a.h.state.qi = Math.min(qm, (a.h.state.qi || 0) + qm * spec.restoreQiPct);
      }
      if (spec.resetCooldowns && a && a.act && a.act.ctx) {
        a.act.ctx.cds = {};
      }
      if (spec.deployDomain && f && a) {
        COMPOSABLE_ENGINE.deployDomain(W, f, a, spec.deployDomain, 24);
      }
      if (a && ST.applyNamedBuff && !a.foe) {
        ST.applyNamedBuff(a, 'elementalOvercharge', 24, tNow, { casterId: a.id });
      }
      t.fx = { t: tNow, text: '🌈 ' + spec.nameTh + '!' };
      if (a) {
        a.lastElementalReaction = {
          t: tNow, code: spec.code, reactionId: spec.id, nameTh: spec.nameTh,
          elements: spec.elements, tier: (spec.elements || []).length, targetId: t.id, dmg: reactDmg
        };
      }
    } finally {
      if (f) f._composableDepth = Math.max(0, (f._composableDepth || 1) - 1);
    }
    return { code: spec.code, id: spec.id, nameTh: spec.nameTh, dmg: reactDmg, tier: (spec.elements || []).length, spec };
  };

  /* ---------- Section 12.1: Acupoint Strikes & Meridian Overdrive ---------- */
  COMPOSABLE_ENGINE.ACUPOINT_STRIKES = Object.freeze({
    QI_BLOCK_POINT: {
      id: 'QI_BLOCK_POINT', nameTh: 'สกัดจุดตันเถียนปิดกั้นปราณ', dur: 12,
      status: 'acupointSealed', secondaryStatus: 'silence', qiDrainPct: 0.18,
      descTh: 'สกัดจุดตันเถียนของศัตรู ผนึกการโคจรปราณและการใช้เคล็ดวิชา 2 รอบ พร้อมสลายปราณ 18%'
    },
    WEAKENING_POINT: {
      id: 'WEAKENING_POINT', nameTh: 'สกัดจุด曲池คลายกำลัง', dur: 16,
      status: 'weaken', secondaryStatus: 'exposed',
      descTh: 'สกัดจุดคลายพละกำลัง ลดพลังโจมตีกายภาพและวิชาของศัตรูลงอย่างหนักนาน 3 รอบ'
    },
    BLOOD_HALTING_POINT: {
      id: 'BLOOD_HALTING_POINT', nameTh: 'สกัดจุดห้ามเลือดและสะกดกาย', dur: 8,
      status: 'paralyze', secondaryStatus: 'acupointSealed', allyHealPct: 0.18,
      descTh: 'เมื่อใช้ใส่ศัตรูจะสะกดร่างให้เป็นอัมพาต 1 รอบ เมื่อใช้ใส่พันธมิตรจะห้ามเลือดทันทีและฟื้นฟูเลือด 18%'
    }
  });

  COMPOSABLE_ENGINE.executeAcupointStrike = (W, f, caster, target, pointId) => {
    if (!target || !C.alive(target)) return null;
    const ST = STs();
    const tNow = (W && W.t != null) ? W.t : (ST.now || 0);
    const spec = COMPOSABLE_ENGINE.ACUPOINT_STRIKES[pointId] || COMPOSABLE_ENGINE.ACUPOINT_STRIKES.QI_BLOCK_POINT;
    const sameSide = f && caster && C.sideOf && C.sideOf(f, caster.id) === C.sideOf(f, target.id);
    if (spec.id === 'BLOOD_HALTING_POINT' && sameSide) {
      ST.clearStatus(target, x => x.k === 'bleed' || x.k === 'poison');
      const hm = C.hpMax(target);
      const heal = Math.max(1, Math.round(hm * (spec.allyHealPct || 0.18)));
      C.setHp(target, Math.min(hm, C.hp(target) + heal));
      target.fx = { t: tNow, text: '🪡 ห้ามเลือด +' + heal };
      return { pointId: spec.id, mode: 'ALLY_HEAL', heal };
    }
    ST.addStatus(target, spec.status, spec.dur || 10, null, tNow);
    if (spec.secondaryStatus) ST.addStatus(target, spec.secondaryStatus, spec.dur || 10, null, tNow);
    if (spec.qiDrainPct && !target.foe && target.cult && target.h && target.h.state) {
      const qm = CULT.qiMax(target);
      target.h.state.qi = Math.max(0, (target.h.state.qi || 0) - qm * spec.qiDrainPct);
    }
    target.fx = { t: tNow, text: '🪡 ' + spec.nameTh + '!' };
    if (caster) caster.lastAcupointStrike = { t: tNow, pointId: spec.id, targetId: target.id };
    return { pointId: spec.id, mode: 'ENEMY_SEAL', status: spec.status };
  };

  COMPOSABLE_ENGINE.triggerMeridianOverdrive = (W, f, caster, dur) => {
    if (!caster || caster.dead) return null;
    const ST = STs();
    const tNow = (W && W.t != null) ? W.t : (ST.now || 0);
    const cleanDur = clamp(Number(dur) || 36, 8, 120);
    caster.meridians = caster.meridians || { opened: {}, openedCount: 0, overdriveUntil: 0 };
    caster.meridians.overdriveUntil = tNow + cleanDur;
    caster.meridians.overdriveUsedInFight = true;
    if (ST.applyNamedBuff && !caster.foe) {
      ST.applyNamedBuff(caster, 'meridianOverdrive', cleanDur, tNow, { casterId: caster.id });
    } else {
      ST.addStatus(caster, 'meridianOverdrive', cleanDur, null, tNow);
    }
    ST.dirty(caster);
    caster.fx = { t: tNow, text: '⚡ ชีพจรแปดพิสดารปะทุ!' };
    return caster.meridians;
  };

  /* ---------- Pillar 4: Universal Composable Action Executor & Section 10.1 C01-C12 ---------- */
  COMPOSABLE_ENGINE.executeAction = (W, f, a, t, actionId, params, ctx) => {
    if (!a || !actionId) return { ok: false, bonusDmg: 0, mult: 1.0 };
    params = params || {};
    ctx = ctx || {};
    const ST = STs();
    const tNow = (W && W.t != null) ? W.t : (ST.now || 0);
    let bonusDmg = 0;
    let mult = 1.0;

    switch (actionId) {
      case 'DELAYED_ECHO': {
        if (t && C.alive(t)) {
          const sa = ST.get(a);
          const echoM = params.echoMult || 0.45;
          const echoDmg = Math.max(6, Math.round(Math.max(sa.atk || 40, sa.matk || 40) * echoM * (f && f.serious ? 0.38 : 0.25)));
          ST.addStatus(t, 'delayedEcho', params.delayTicks || 6, { echoDmg, casterId: a.id }, tNow);
          if (f) {
            f.delayedEchoes = f.delayedEchoes || [];
            f.delayedEchoes.push({ triggerAt: tNow + (params.delayTicks || 4), casterId: a.id, targetId: t.id, dmg: echoDmg, label: 'คลื่นสะท้อนเงาอดีต' });
          }
          // Immediate resonance pulse + queued echo
          const immDmg = Math.max(4, Math.round(echoDmg * 0.55));
          C.applyDamage(W, f, a, t, immDmg, 'คลื่นสะท้อนเงา');
          bonusDmg += immDmg;
          a.lastDelayedEcho = { t: tNow, targetId: t.id, dmg: immDmg, queuedDmg: echoDmg };
        }
        break;
      }
      case 'HEART_DEMON_EDGE_SCALING': {
        const hd = (!a.foe && a.h && a.h.state) ? (a.h.state.heartDemon || 0) : 25;
        const missingHp = 1 - hpFrac(a);
        mult = 1 + clamp(hd * 0.008 + missingHp * 0.28, 0.12, 0.65);
        if (hd >= 20 && ST.applyNamedBuff && !a.foe) {
          ST.applyNamedBuff(a, 'asuraBloodFrenzy', 24, tNow, { casterId: a.id });
        }
        a.lastHeartDemonScaling = { t: tNow, heartDemon: hd, mult: +mult.toFixed(3) };
        break;
      }
      case 'SHATTER_SHIELD': {
        if (t && C.alive(t)) {
          const sh = shieldOf(t);
          const shVal = sh ? sh.amt : 0;
          ST.clearStatus(t, x => x.k === 'shield' || x.k === 'guardUp');
          if (t.shieldBp) t.shieldBp = 0;
          ST.addStatus(t, 'armorbreak', 12, null, tNow);
          const shatterBurst = Math.max(8, Math.round(shVal > 0 ? shVal * 0.65 : C.hpMax(t) * 0.12));
          C.applyDamage(W, f, a, t, shatterBurst, 'ทลายโล่คุ้มกาย');
          bonusDmg += shatterBurst;
          a.lastShieldShatter = { t: tNow, targetId: t.id, shatteredShield: shVal, bonusDmg: shatterBurst };
        }
        break;
      }
      case 'BONUS_TRUE_DMG': {
        if (t && C.alive(t)) {
          const sa = ST.get(a);
          const trueMult = params.trueDmgMult || 0.28;
          const trueDmg = Math.max(8, Math.round(Math.max(sa.atk || 40, sa.matk || 40) * trueMult));
          C.setHp(t, Math.max(1, C.hp(t) - trueDmg));
          t.fx = { t: tNow, text: '⚡ ดาเมจแท้จริง -' + trueDmg };
          bonusDmg += trueDmg;
          a.lastTrueDmg = { t: tNow, targetId: t.id, trueDmg };
        }
        break;
      }
      case 'OVERHEAT_COOLDOWN_TRADE': {
        mult = params.overheatMult || 1.32;
        if (!a.foe && a.cult && a.cult.path === 'MECH_PUPPET' && CULT.ensureMechState) {
          const ms = CULT.ensureMechState(a);
          ms.heat = clamp((ms.heat || 0) + 18, 0, 100);
          ms.charge = clamp((ms.charge || 0) + 25, 0, 100);
        }
        if (a.act && a.act.ctx && a.act.ctx.cds && params.skillId) {
          a.act.ctx.cds[params.skillId] = (a.act.ctx.cds[params.skillId] || tNow) + (params.extraCd || 4);
        }
        if (ST.applyNamedBuff && !a.foe) ST.applyNamedBuff(a, 'puppetOverclock', 24, tNow, { casterId: a.id });
        a.lastOverheatTrade = { t: tNow, mult };
        break;
      }
      case 'PUPPET_SYMBIOSIS_PULSE': {
        if (!a.foe && a.cult && CULT.ensureMechState) {
          const ms = CULT.ensureMechState(a);
          ms.integrity = clamp((ms.integrity || 50) + 15, 0, 100);
          ms.constructReadiness = ms.integrity;
        }
        if (ST.applyNamedBuff && !a.foe) ST.applyNamedBuff(a, 'puppetOverclock', 28, tNow, { casterId: a.id });
        if (t && C.alive(t)) {
          const sa = ST.get(a);
          const pulseDmg = Math.max(8, Math.round(Math.max(sa.atk || 40, sa.matk || 40) * 0.38));
          C.applyDamage(W, f, a, t, pulseDmg, 'คลื่นประสานจักรกล');
          bonusDmg += pulseDmg;
        }
        a.lastPuppetPulse = { t: tNow, bonusDmg };
        break;
      }
      case 'RESTORE_QI_PCT': {
        if (!a.foe && a.cult && a.h && a.h.state && !ST.has(a, 'stygianFreeze', tNow)) {
          const qm = CULT.qiMax(a);
          const pct = params.qiRestorePct || params.qiPct || 0.22;
          const gain = Math.round(qm * pct);
          a.h.state.qi = Math.min(qm, (a.h.state.qi || 0) + gain);
          a.lastQiRestore = { t: tNow, gain, pct };
        }
        break;
      }
      case 'COMBO_FINISHER': {
        const hadPrimer = ST.has(a, 'comboReady', tNow) || (ST.hasBuff && ST.hasBuff(a, 'comboReady', tNow));
        const chain = Math.min(4, (a._comboChainCount || 0) + (hadPrimer ? 1 : 0));
        mult = 1 + (hadPrimer ? 0.28 : 0.14) + chain * 0.08;
        if (hadPrimer) ST.clearBuff(a, 'comboReady');
        a._comboChainCount = 0;
        if (t && C.alive(t) && COMPOSABLE_ENGINE.totalMarksOn(t, tNow) > 0) {
          const det = COMPOSABLE_ENGINE.detonateMarks(W, f, a, t, { bonusPerStack: 0.34 });
          bonusDmg += det.bonusDmg || 0;
        }
        a.lastComboFinisher = { t: tNow, chain, mult: +mult.toFixed(3), bonusDmg };
        break;
      }
      case 'APPLY_TAUNT': {
        if (t && C.alive(t)) {
          ST.addStatus(t, 'taunted', params.dur || 10, { taunterId: a.id }, tNow);
          if (t.act && t.act.ctx) t.act.ctx.target = a.id;
          t.fx = { t: tNow, text: '💢 ถูกยั่วยุ!' };
        }
        break;
      }
      case 'DISPLACE_KNOCKBACK':
      case 'DISPLACE_PULL':
      case 'DISPLACE_VACUUM': {
        if (t && Number.isFinite(t.x) && Number.isFinite(a.x)) {
          const dx = t.x - a.x, dy = t.y - a.y, dist = Math.max(0.1, Math.hypot(dx, dy));
          const step = actionId === 'DISPLACE_KNOCKBACK' ? (params.dist || 1.8) : -(params.dist || 1.4);
          t.x = +(t.x + (dx / dist) * step).toFixed(2);
          t.y = +(t.y + (dy / dist) * step).toFixed(2);
          a.lastDisplacement = { t: tNow, kind: actionId, targetId: t.id };
        }
        break;
      }
      case 'POISE_BREAK': {
        if (t && C.alive(t)) {
          t._poiseGauge = Math.max(0, (t._poiseGauge == null ? 100 : t._poiseGauge) - (params.poiseDmg || 55));
          if (t._poiseGauge <= 0) {
            t._poiseGauge = 100;
            ST.addStatus(t, 'poiseBroken', 10, null, tNow);
            ST.addStatus(t, 'stun', 4, null, tNow);
            t.fx = { t: tNow, text: '💥 เสียหลักเกราะแตก!' };
          }
        }
        break;
      }
      case 'CLEANSE_TO_POWER': {
        const allies = f ? C.alliesOf(W, f, a.id).filter(C.alive) : [a];
        let totalCleansed = 0;
        for (const al of allies) {
          const before = al.sx ? al.sx.length : 0;
          ST.clearStatus(al, x => COMPOSABLE_ENGINE.DEBUFF_KEYS.includes(x.k));
          totalCleansed += Math.max(0, before - (al.sx ? al.sx.length : 0));
        }
        const stacks = clamp(Math.max(1, totalCleansed), 1, 5);
        ST.addStatus(a, 'shield', 16, { amt: Math.round(C.hpMax(a) * 0.10 * stacks) }, tNow);
        if (ST.applyNamedBuff && !a.foe) ST.applyNamedBuff(a, 'fervorMight', 20, tNow, { casterId: a.id });
        mult = 1 + Math.min(0.40, stacks * 0.08);
        break;
      }
      case 'CONTAGION_SPREAD': {
        if (t && f) COMPOSABLE_ENGINE.spreadContagionOnDeath(W, f, a, t);
        break;
      }
      case 'DEPLOY_DOMAIN': {
        if (f) COMPOSABLE_ENGINE.deployDomain(W, f, a, params.domainId || 'DOMAIN_ASTRAL_STARFIELD', params.dur || 24);
        break;
      }
      case 'ACUPOINT_SEAL': {
        if (t) COMPOSABLE_ENGINE.executeAcupointStrike(W, f, a, t, params.acupointId || 'QI_BLOCK_POINT');
        break;
      }
      case 'MERIDIAN_OVERDRIVE': {
        COMPOSABLE_ENGINE.triggerMeridianOverdrive(W, f, a, params.dur || 36);
        break;
      }
      default:
        break;
    }
    return { ok: true, actionId, bonusDmg, mult };
  };

  COMPOSABLE_ENGINE.tickDelayedEchoes = (W, f) => {
    if (!f || !Array.isArray(f.delayedEchoes) || !f.delayedEchoes.length) return;
    const keep = [];
    for (const ec of f.delayedEchoes) {
      if (W.t < ec.triggerAt) { keep.push(ec); continue; }
      const caster = C.unit(W, ec.casterId);
      const target = C.unit(W, ec.targetId);
      if (target && C.alive(target)) {
        C.applyDamage(W, f, caster || target, target, ec.dmg || 15, ec.label || 'คลื่นสะท้อนเงาอดีต');
        target.fx = { t: W.t, text: '⏳ ' + (ec.label || 'คลื่นสะท้อน') + ' -' + (ec.dmg || 15) };
      }
    }
    f.delayedEchoes = keep;
  };

  COMPOSABLE_ENGINE.spreadContagionOnDeath = (W, f, killer, victim) => {
    if (!f || !victim || !Array.isArray(victim.sx)) return 0;
    const ST = STs();
    const tNow = (W && W.t != null) ? W.t : (ST.now || 0);
    const contagious = victim.sx.filter(x => x && x.until > tNow && ['poison', 'burn', 'bleed', 'curse', 'venomSeed', 'sovereignPlague', 'crimsonGuSwarm'].includes(x.k));
    if (!contagious.length) return 0;
    const alliesOfVictim = C.alliesOf(W, f, victim.id).filter(u => u && u.id !== victim.id && C.alive(u));
    let spreadCount = 0;
    for (const nb of alliesOfVictim.slice(0, 3)) {
      for (const c of contagious) {
        ST.addStatus(nb, c.k, 12, { per: c.per || 0.015, stacks: c.stacks || 1, src: killer ? killer.id : c.src }, tNow);
        spreadCount++;
      }
      nb.fx = { t: tNow, text: '☣️ พิษระบาดติดต่อ!' };
    }
    return spreadCount;
  };

  COMPOSABLE_ENGINE.totalMarksOn = (u, now) => {
    if (!u || !Array.isArray(u.sx)) return 0;
    const tNow = now != null ? now : (STs().now || 0);
    let tot = 0;
    for (const x of u.sx) {
      if (x && x.until > tNow && COMPOSABLE_ENGINE.MARK_KEYS.includes(x.k)) {
        tot += (x.stacks || 1);
      }
    }
    return tot;
  };

  COMPOSABLE_ENGINE.applyMark = (W, f, caster, target, markKind, addStacks, dur) => {
    if (!target || !C.alive(target)) return null;
    const ST = STs();
    const kind = COMPOSABLE_ENGINE.MARK_KEYS.includes(markKind) ? markKind : 'daoMark';
    const dTicks = clamp(Number(dur) || 16, 4, 120);
    const cur = ST.statusOf(target, kind, W.t);
    const prevStacks = cur ? (cur.stacks || 1) : 0;
    const ampBonus = (caster && caster._hasMarkAmplifier) ? 1 : 0;
    const nextStacks = clamp(prevStacks + (Number(addStacks) || 1) + ampBonus, 1, 5);
    const entry = ST.addStatus(target, kind, dTicks, {
      stacks: nextStacks,
      src: caster ? caster.id : null,
      per: kind === 'venomSeed' ? 0.008 * nextStacks : 0
    }, W.t);
    target.fx = { t: W.t, text: (SKs().STATUS[kind]?.icon || '🎯') + ' ×' + nextStacks };
    if (nextStacks >= 5 && caster && C.alive(caster) && (!f || (f._composableDepth || 0) < 2)) {
      COMPOSABLE_ENGINE.detonateMarks(W, f, caster, target, { bonusPerStack: 0.30, thresholdBurst: true });
    }
    return entry;
  };

  COMPOSABLE_ENGINE.detonateMarks = (W, f, caster, target, opts) => {
    if (!target || !C.alive(target) || !Array.isArray(target.sx)) return { detonatedStacks: 0, bonusDmg: 0 };
    opts = opts || {};
    const ST = STs();
    let stacks = 0;
    let hadBlood = false, hadStar = false, hadVenom = false;
    const toRemove = [];
    for (const x of target.sx) {
      if (x && x.until > W.t && (COMPOSABLE_ENGINE.MARK_KEYS.includes(x.k) || (opts.includeDots && ['burn', 'bleed', 'poison', 'curse'].includes(x.k)))) {
        stacks += (x.stacks || 1);
        if (x.k === 'bloodBrand') hadBlood = true;
        if (x.k === 'starSeal') hadStar = true;
        if (x.k === 'venomSeed') hadVenom = true;
        toRemove.push(x.k);
      }
    }
    if (stacks <= 0) return { detonatedStacks: 0, bonusDmg: 0 };
    ST.clearStatus(target, x => toRemove.includes(x.k));
    const sa = ST.get(caster);
    const baseRef = Math.max(sa.atk || 50, sa.matk || 50);
    const perStack = (Number.isFinite(opts.bonusPerStack) ? opts.bonusPerStack : 0.32) * ((caster && caster._hasMarkAmplifier) ? 1.14 : 1.0);
    const rawBonus = Math.max(8, Math.round(baseRef * perStack * stacks * (f && f.serious ? 0.45 : 0.28)));
    if (f) f._composableDepth = (f._composableDepth || 0) + 1;
    try {
      C.applyDamage(W, f, caster, target, rawBonus, 'ระเบิดตราประทับ');
      if (hadBlood && !caster.dead) {
        C.setHp(caster, Math.min(C.hpMax(caster), C.hp(caster) + Math.round(rawBonus * 0.35)));
      }
      if (hadStar && !caster.foe && caster.cult && caster.h && caster.h.state) {
        const qm = CULT.qiMax(caster);
        caster.h.state.qi = Math.min(qm, (caster.h.state.qi || 0) + qm * 0.08 * Math.min(3, stacks));
      }
      if (hadVenom && C.alive(target)) {
        ST.addStatus(target, 'weaken', 12, null, W.t);
        ST.addStatus(target, 'armorbreak', 12, null, W.t);
      }
      target.fx = { t: W.t, text: '💥 ระเบิดตรา ×' + stacks + ' (-' + rawBonus + ')' };
      caster.lastMarkDetonation = { t: W.t, targetId: target.id, stacks, bonusDmg: rawBonus };
    } finally {
      if (f) f._composableDepth = Math.max(0, (f._composableDepth || 1) - 1);
    }
    return { detonatedStacks: stacks, bonusDmg: rawBonus };
  };

  COMPOSABLE_ENGINE.selectTargets = (W, f, a, d, p) => {
    const comp = (p && p.composable) || {};
    const sel = comp.targetSelector || (p && p.targetSelector) || null;
    const enemies = C.enemies(W, f, a.id).filter(u => C.alive(u));
    const allies = C.alliesOf(W, f, a.id).filter(u => C.alive(u));
    // Taunt override for single-target enemy selectors
    const tauntStatus = STs().statusOf(a, 'taunted', W.t);
    if (tauntStatus && tauntStatus.taunterId) {
      const taunter = enemies.find(u => u.id === tauntStatus.taunterId);
      if (taunter && (!sel || sel === 'SINGLE_ENEMY' || sel === 'LOWEST_HP_ENEMY' || sel === 'HIGHEST_ATK_ENEMY')) {
        return [taunter];
      }
    }
    if (!sel) {
      if (p.arch === 'chainRicochet') {
        return enemies.slice().sort((x, y) => Math.hypot(x.x - (d ? d.x : a.x), y.y - (d ? d.y : a.y)) - Math.hypot(y.x - (d ? d.x : a.x), y.y - (d ? d.y : a.y))).slice(0, 4);
      }
      if (p.aoe) {
        return enemies.filter(x => !d || Math.hypot(x.x - d.x, x.y - d.y) < 2.8);
      }
      return d ? [d] : enemies.slice(0, 1);
    }
    if (sel === 'SELF') return [a];
    if (sel === 'ALL_ALLIES') return allies;
    if (sel === 'LOWEST_HP_ALLY') {
      return allies.slice().sort((x, y) => (C.hp(x) / Math.max(1, C.hpMax(x))) - (C.hp(y) / Math.max(1, C.hpMax(y)))).slice(0, 1);
    }
    if (sel === 'SAME_PATH_ALLIES') {
      const path = a.cult && a.cult.path;
      const matched = allies.filter(u => u.cult && u.cult.path === path);
      return matched.length ? matched : [a];
    }
    if (sel === 'SUMMON_OR_PUPPET') {
      const sums = allies.filter(u => u.isSummon || (u.cult && u.cult.path === 'MECH_PUPPET'));
      return sums.length ? sums : [a];
    }
    if (!enemies.length) return d ? [d] : [];
    if (sel === 'ALL_ENEMIES') return enemies;
    if (sel === 'LOWEST_HP_ENEMY') {
      return enemies.slice().sort((x, y) => (C.hp(x) / Math.max(1, C.hpMax(x))) - (C.hp(y) / Math.max(1, C.hpMax(y)))).slice(0, 1);
    }
    if (sel === 'HIGHEST_ATK_ENEMY') {
      const ST = STs();
      return enemies.slice().sort((x, y) => Math.max(ST.get(y).atk, ST.get(y).matk) - Math.max(ST.get(x).atk, ST.get(x).matk)).slice(0, 1);
    }
    if (sel === 'MARKED_ENEMIES') {
      const marked = enemies.filter(u => COMPOSABLE_ENGINE.totalMarksOn(u, W.t) > 0 || (u.sx && u.sx.some(s => s.until > W.t && ['burn', 'bleed', 'poison', 'curse'].includes(s.k))));
      return marked.length ? marked : (d ? [d] : enemies.slice(0, 1));
    }
    if (sel === 'RICOCHET_CHAIN' || sel === 'SPLASH_NEIGHBORS' || sel === 'PIERCE_LINE') {
      const limit = sel === 'RICOCHET_CHAIN' ? 4 : 3;
      return enemies.slice().sort((x, y) => Math.hypot(x.x - (d ? d.x : a.x), y.y - (d ? d.y : a.y)) - Math.hypot(y.x - (d ? d.x : a.x), y.y - (d ? d.y : a.y))).slice(0, limit);
    }
    return d ? [d] : enemies.slice(0, 1);
  };

  COMPOSABLE_ENGINE.preExecuteSkill = (W, f, a, d, p, ctx) => {
    const ST = STs();
    let comboMult = 1.0;
    const comp = p.composable || {};
    const cond = p.condition || comp.condition || null;
    if (cond && !COMPOSABLE_ENGINE.evaluateCondition(cond, a, d, { W, f, skill: p, ctx })) {
      return { comboMult: 1.0, handledCompletely: false, conditionFailed: true };
    }

    if (p.comboFinisher || comp.action === 'COMBO_FINISHER') {
      const finRes = COMPOSABLE_ENGINE.executeAction(W, f, a, d, 'COMBO_FINISHER', { skillId: p.id }, ctx);
      comboMult *= finRes.mult || 1.28;
    } else if (ST.has(a, 'comboReady', W.t) && (p.M || 0) > 0 && p.arch !== 'stanceShift') {
      comboMult = 1.28;
      a._comboChainCount = Math.min(5, (a._comboChainCount || 0) + 1);
      ST.clearBuff(a, 'comboReady');
      a.lastComboFinisher = { t: W.t, skillId: p.id, mult: comboMult };
    }

    if (p.stanceShift || p.comboPrimer || p.arch === 'stanceShift' || comp.action === 'STANCE_ENTER' || comp.action === 'COMBO_PRIMER') {
      const stanceId = p.stanceShift || comp.stanceId || p.grantBuff || 'STAR_SWORD_STANCE';
      const prevStance = a._activeStance;
      a._combatStance = stanceId;
      a._activeStance = stanceId;
      a._comboChainCount = Math.min(5, (a._comboChainCount || 0) + 1);
      ST.dirty(a);
      ST.applyNamedBuff(a, 'comboReady', 24, W.t, { casterId: a.id });
      if (p.grantBuff && p.grantBuff !== 'comboReady' && ST.applyNamedBuff) {
        ST.applyNamedBuff(a, p.grantBuff, 36, W.t, { casterId: a.id });
      }
      if (p.shield > 0) {
        ST.addStatus(a, 'shield', 14, { amt: Math.round(C.hpMax(a) * p.shield) }, W.t);
      }
      if (prevStance !== stanceId) {
        runPassiveProcs(W, f, a, d, 'onStanceSwitch', 0);
      }
      if ((p.M || 0) <= 0) return { comboMult, handledCompletely: true };
    }

    if (p.domain || comp.action === 'DEPLOY_DOMAIN') {
      COMPOSABLE_ENGINE.deployDomain(W, f, a, p.domain || comp.domainId || 'DOMAIN_ASTRAL_STARFIELD', 24);
    }

    if (p.tetherLink || p.arch === 'tetherLink' || comp.action === 'SOUL_LINK_SHARE_DMG' || comp.action === 'CHAIN_TETHER_ENEMY') {
      const allies = C.alliesOf(W, f, a.id).filter(u => C.alive(u) && u.id !== a.id);
      if (allies.length > 0) {
        const partner = allies.slice().sort((x, y) => (C.hp(x) / Math.max(1, C.hpMax(x))) - (C.hp(y) / Math.max(1, C.hpMax(y))))[0];
        ST.addStatus(partner, 'soulLinkGuard', 28, { guardianId: a.id, shareRatio: 0.30 }, W.t);
        ST.applyNamedBuff(a, 'soulLinkGuard', 28, W.t, { casterId: a.id });
        partner.fx = { t: W.t, text: '🤝 เชื่อมสายใยคุ้มชีพ' };
      }
      const enemies = C.enemies(W, f, a.id).filter(u => C.alive(u));
      if (enemies.length >= 2 && d) {
        const other = enemies.find(u => u.id !== d.id) || enemies[1];
        if (other) {
          ST.addStatus(d, 'tetheredEnemy', 20, { linkedToId: other.id, shareRatio: 0.35 }, W.t);
          ST.addStatus(other, 'tetheredEnemy', 20, { linkedToId: d.id, shareRatio: 0.35 }, W.t);
          other.fx = { t: W.t, text: '🔗 โซ่ชะตาพ่วง' };
        }
      }
      if ((p.M || 0) <= 0) return { comboMult, handledCompletely: true };
    }

    const odAction = p.sacrificeOverdrive || p.action || comp.action;
    if (p.arch === 'sacrificeOverdrive' || odAction === 'HP_TO_QI_OVERDRIVE' || odAction === 'TOXICITY_TO_VENOM_POWER' || odAction === 'QI_TO_SHIELD_BARRIER') {
      if (!a.foe && a.cult && a.h && a.h.state) {
        if (odAction === 'TOXICITY_TO_VENOM_POWER' || (a.cult.toxic || 0) >= 8) {
          const spentTox = Math.min(25, a.cult.toxic || 10);
          a.cult.toxic = Math.max(0, (a.cult.toxic || 0) - spentTox);
          ST.applyNamedBuff(a, 'toxinOverdrive', 35, W.t, { casterId: a.id });
          comboMult *= 1.18;
        } else if (odAction === 'QI_TO_SHIELD_BARRIER') {
          const qm = CULT.qiMax(a);
          const spendQi = Math.round(qm * 0.12);
          if ((a.h.state.qi || 0) >= spendQi) {
            a.h.state.qi -= spendQi;
            ST.addStatus(a, 'shield', 18, { amt: Math.round(C.hpMax(a) * 0.26) }, W.t);
            ST.applyNamedBuff(a, 'qiBarrierShell', 35, W.t, { casterId: a.id });
          }
        } else {
          const qm = CULT.qiMax(a);
          a.h.state.qi = Math.min(qm, (a.h.state.qi || 0) + qm * 0.18);
          ST.applyNamedBuff(a, 'bloodFrenzy', 30, W.t, { casterId: a.id });
          comboMult *= 1.15;
        }
      }
    }

    // Execute any pre-hit composable actions (HEART_DEMON_EDGE_SCALING, OVERHEAT_COOLDOWN_TRADE, RESTORE_QI_PCT, MERIDIAN_OVERDRIVE)
    const preActions = [].concat(p.actions || [], p.action ? [p.action] : [], comp.actions || [], comp.action ? [comp.action] : []);
    for (const act of preActions) {
      if (['HEART_DEMON_EDGE_SCALING', 'OVERHEAT_COOLDOWN_TRADE', 'RESTORE_QI_PCT', 'CLEANSE_TO_POWER', 'MERIDIAN_OVERDRIVE'].includes(act)) {
        const res = COMPOSABLE_ENGINE.executeAction(W, f, a, d, act, Object.assign({ skillId: p.id }, p, comp), ctx);
        if (res && res.mult) comboMult *= res.mult;
      }
    }

    return { comboMult, handledCompletely: false };
  };

  COMPOSABLE_ENGINE.postHitSkill = (W, f, a, t, p, r) => {
    if (!t || !C.alive(t)) return 0;
    const ST = STs();
    const comp = p.composable || {};
    const cond = p.condition || comp.condition || null;
    if (cond && !COMPOSABLE_ENGINE.evaluateCondition(cond, a, t, { W, f, skill: p, hitResult: r })) {
      return 0;
    }
    let extraDmg = 0;

    // Apply Elemental Gauge Primer on every elemental skill hit
    if (p.element) {
      const gaugeU = (p.tier || 1) >= 5 ? 3.0 : ((p.tier || 1) >= 3 ? 2.0 : 1.0);
      COMPOSABLE_ENGINE.applyElementalAura(t, p.element, gaugeU, W.t, a ? a.id : null);
    }

    // 1. Mark Primer
    if (p.markPrimer || p.arch === 'markPrimer' || comp.action === 'APPLY_MARK' || comp.markKind) {
      const mp = p.markPrimer || {};
      const mKind = mp.k || comp.markKind || (p.element === 'ASTRAL' ? 'starSeal' : (p.element === 'WOOD_LIFE' ? 'venomSeed' : (p.element === 'BLOOD_DEMON' ? 'bloodBrand' : 'daoMark')));
      COMPOSABLE_ENGINE.applyMark(W, f, a, t, mKind, mp.stacks || comp.markStacks || 1, mp.dur || comp.markDur || 18);
    }

    // 2. Mark Detonate
    if (p.markDetonate || p.arch === 'markDetonate' || comp.action === 'DETONATE_MARK') {
      const md = p.markDetonate || {};
      const det = COMPOSABLE_ENGINE.detonateMarks(W, f, a, t, {
        bonusPerStack: md.perStackMult || comp.detonateBonusPerStack || 0.34,
        includeDots: comp.includeDots !== false
      });
      extraDmg += det.bonusDmg || 0;
    }

    // 3. Multi-Tier Elemental Fusion Reaction (2E, 3E, 4E + legacy status reactions)
    if (p.elementalFusion || p.arch === 'elementalFusion' || comp.action === 'ELEMENTAL_FUSION_REACTION') {
      const el = p.element || 'FIRE';
      const explicitId = typeof p.elementalFusion === 'string' ? p.elementalFusion : null;
      const multiRes = COMPOSABLE_ENGINE.triggerElementalReaction(W, f, a, t, el, r.dmg || 25, { explicitReactionId: explicitId });
      if (multiRes && multiRes.dmg) {
        extraDmg += multiRes.dmg;
      } else if (Array.isArray(t.sx)) {
        for (const sx of t.sx.slice()) {
          if (!sx || sx.until <= W.t) continue;
          const reactSpec = COMPOSABLE_ENGINE.REACTIONS[sx.k + '+' + el];
          if (reactSpec) {
            const reactDmg = Math.max(6, Math.round((r.dmg || 25) * reactSpec.mult));
            if (f) f._composableDepth = (f._composableDepth || 0) + 1;
            try {
              ST.clearStatus(t, x => x.k === sx.k);
              C.applyDamage(W, f, a, t, reactDmg, reactSpec.nameTh);
              extraDmg += reactDmg;
              if (reactSpec.applyStatus && C.alive(t)) {
                ST.addStatus(t, reactSpec.applyStatus, reactSpec.dur || 10, null, W.t);
              }
              if (reactSpec.leechPct && !a.dead) {
                C.setHp(a, Math.min(C.hpMax(a), C.hp(a) + Math.round(reactDmg * reactSpec.leechPct)));
              }
              if (reactSpec.selfBuff && ST.applyNamedBuff && !a.foe) {
                ST.applyNamedBuff(a, reactSpec.selfBuff, 28, W.t, { casterId: a.id });
              }
              ST.applyNamedBuff(a, 'elementalOvercharge', 24, W.t, { casterId: a.id });
              t.fx = { t: W.t, text: '🌈 ' + reactSpec.nameTh + '!' };
              a.lastElementalReaction = { t: W.t, reactionId: reactSpec.id, nameTh: reactSpec.nameTh, targetId: t.id, dmg: reactDmg };
            } finally {
              if (f) f._composableDepth = Math.max(0, (f._composableDepth || 1) - 1);
            }
            break;
          }
        }
      }
    }

    // 4. Status Transmute (Steal Buff / Extend Debuff / Absorb DoT to Shield)
    const stAction = p.statusTransmute || comp.action;
    if (p.arch === 'statusTransmute' || ['EXTEND_DEBUFF', 'TRANSFER_DEBUFF', 'STEAL_BUFF', 'CONVERT_BUFF_TO_DEBUFF', 'ABSORB_DOT_TO_SHIELD'].includes(stAction)) {
      if (Array.isArray(t.sx)) {
        const stolen = t.sx.find(x => x && x.until > W.t && SKs().STATUS[x.k] && SKs().STATUS[x.k].isBuff);
        if (stolen) {
          ST.clearStatus(t, x => x.k === stolen.k);
          ST.applyNamedBuff(a, stolen.k, 20, W.t, { casterId: a.id });
          ST.addStatus(t, 'exposed', 12, null, W.t);
          a.fx = { t: W.t, text: '🔄 ช่วงชิงบัฟ「' + (SKs().STATUS[stolen.k]?.nameTh || stolen.k) + '」' };
        }
        for (const x of t.sx) {
          if (x && x.until > W.t && COMPOSABLE_ENGINE.DEBUFF_KEYS.includes(x.k)) {
            x.until = Math.min(W.t + 2880, x.until + 6);
          }
        }
      }
      if (Array.isArray(a.sx)) {
        const myDots = a.sx.filter(x => x && x.until > W.t && ['burn', 'bleed', 'poison', 'curse'].includes(x.k));
        if (myDots.length > 0) {
          ST.clearStatus(a, x => ['burn', 'bleed', 'poison', 'curse'].includes(x.k));
          ST.addStatus(a, 'shield', 16, { amt: Math.round(C.hpMax(a) * 0.12 * myDots.length) }, W.t);
        }
      }
    }

    // 5. Acupoint Strike
    if (p.acupointStrike || comp.action === 'ACUPOINT_SEAL') {
      COMPOSABLE_ENGINE.executeAcupointStrike(W, f, a, t, p.acupointStrike || comp.acupointId || 'QI_BLOCK_POINT');
    }

    // 6. Execute Post-Hit Composable Actions (DELAYED_ECHO, SHATTER_SHIELD, BONUS_TRUE_DMG, PUPPET_SYMBIOSIS_PULSE, APPLY_TAUNT, DISPLACE_*, POISE_BREAK, CONTAGION_SPREAD)
    const postActions = [].concat(
      p.delayedEcho ? ['DELAYED_ECHO'] : [],
      p.actions || [],
      p.action ? [p.action] : [],
      comp.actions || [],
      comp.action ? [comp.action] : []
    );
    for (const act of postActions) {
      if (['DELAYED_ECHO', 'SHATTER_SHIELD', 'BONUS_TRUE_DMG', 'PUPPET_SYMBIOSIS_PULSE', 'APPLY_TAUNT', 'DISPLACE_KNOCKBACK', 'DISPLACE_PULL', 'DISPLACE_VACUUM', 'POISE_BREAK', 'CONTAGION_SPREAD'].includes(act)) {
        const actRes = COMPOSABLE_ENGINE.executeAction(W, f, a, t, act, Object.assign({ skillId: p.id }, p, comp), { W, f, hitResult: r });
        if (actRes && actRes.bonusDmg) extraDmg += actRes.bonusDmg;
      }
    }

    // 7. Soul archetype mental pressure
    if (p.arch === 'soul' && C.alive(t)) {
      ST.addStatus(t, 'mdefbreak', 10, null, W.t);
      if (!t.foe && t.h && t.h.state) {
        t.h.state.heartDemon = clamp((t.h.state.heartDemon || 0) + 2.5, 0, 100);
      }
    }

    return extraDmg;
  };

  COMPOSABLE_ENGINE.interceptPreDamage = (W, f, a, d, dmg, note) => {
    if (!d || dmg <= 0 || !f || (f._composableDepth || 0) >= 2) return dmg;
    const ST = STs();
    // 1. Soul Link Ally damage sharing
    const link = ST.statusOf(d, 'soulLinkGuard', W.t);
    if (link && link.guardianId && link.guardianId !== d.id && note !== 'แบ่งรับสายใยคุ้มชีพ') {
      const guardian = C.unit(W, link.guardianId);
      if (guardian && C.alive(guardian) && C.hp(guardian) > C.hpMax(guardian) * 0.25) {
        const share = Math.round(dmg * (link.shareRatio || 0.30));
        if (share >= 2) {
          dmg -= share;
          f._composableDepth = (f._composableDepth || 0) + 1;
          try {
            C.applyDamage(W, f, a, guardian, share, 'แบ่งรับสายใยคุ้มชีพ');
          } finally {
            f._composableDepth = Math.max(0, (f._composableDepth || 1) - 1);
          }
        }
      }
    }
    // 2. Tethered Enemy damage mirroring
    const tether = ST.statusOf(d, 'tetheredEnemy', W.t);
    if (tether && tether.linkedToId && tether.linkedToId !== d.id && note !== 'โซ่ชะตาพ่วง') {
      const partner = C.unit(W, tether.linkedToId);
      if (partner && C.alive(partner)) {
        const mirror = Math.max(1, Math.round(dmg * (tether.shareRatio || 0.35)));
        f._composableDepth = (f._composableDepth || 0) + 1;
        try {
          C.applyDamage(W, f, a, partner, mirror, 'โซ่ชะตาพ่วง');
        } finally {
          f._composableDepth = Math.max(0, (f._composableDepth || 1) - 1);
        }
      }
    }
    return dmg;
  };

  /* ---------- Pillar 5: Runtime Processor for All Equipment & Combat Item Effect IDs ---------- */
  C.runItemEffectProcs = (W, f, actor, target, triggerKind, dmgDealt) => {
    if (!actor || actor.foe || actor.dead || !actor.equip) return;
    if (f && (f._composableDepth || 0) >= 2) return;
    const ST = STs(), SK = SKs();
    const normTrigger = (SK && SK.normalizeTrigger) ? SK.normalizeTrigger(triggerKind) : triggerKind;
    actor._itemEfxCds = actor._itemEfxCds || {};
    actor._hasMarkAmplifier = false;
    actor._hasElementalReactor = false;

    for (const slot of ['WEAPON', 'ARMOR', 'ACCESSORY']) {
      const it = actor.equip[slot];
      if (!it || (g.MARTIAL && g.MARTIAL.gearUsable && !g.MARTIAL.gearUsable(actor, it))) continue;
      if (it.charges !== undefined && it.charges !== null && it.charges <= 0) continue;
      const src = (it.id && g.ECO && ((g.ECO.getItem && g.ECO.getItem(it.id)) || (g.ECO.itemById && g.ECO.itemById[it.id]))) || it;
      const efxList = it.effects || it.fx || (src && src.effects) || [];
      if (!Array.isArray(efxList) || !efxList.length) continue;

      for (const efx of efxList) {
        if (!efx || !efx.effectId) continue;
        const eid = efx.effectId;
        const p = efx.params || {};
        if (eid === 'EFX_V234_MARK_AMPLIFIER') actor._hasMarkAmplifier = true;
        if (eid === 'EFX_V234_ELEMENTAL_REACTOR') actor._hasElementalReactor = true;
        const cdKey = (it.uid || it.id || slot) + ':' + eid + ':' + normTrigger;
        if ((actor._itemEfxCds[cdKey] || 0) > W.t) continue;

        let triggered = false;
        if (normTrigger === 'onHit' && target && C.alive(target)) {
          if (eid === 'EFX_ARMOR_FRACTURE' || eid === 'EFX_ARMOR_SHATTER') {
            ST.addStatus(target, 'armorbreak', 10, null, W.t); triggered = true;
          } else if (eid === 'EFX_BLEEDING') {
            ST.addStatus(target, 'bleed', 10, { per: 0.014, src: actor.id }, W.t); triggered = true;
          } else if (eid === 'EFX_BURNING' || eid === 'EFX_BURNING_DOT') {
            ST.addStatus(target, 'burn', 10, { per: 0.015, src: actor.id }, W.t); triggered = true;
          } else if (eid === 'EFX_CHILL_FREEZE' || eid === 'EFX_GRAVITY_QI_SEAL') {
            ST.addStatus(target, 'chill', 10, null, W.t); ST.addStatus(target, 'slow', 10, null, W.t); triggered = true;
          } else if (eid === 'EFX_SHOCK_CONDUCTION' || eid === 'EFX_PARALYSIS_ARC' || eid === 'EFX_HEAVENLY_THUNDER_SMITE') {
            ST.addStatus(target, 'paralyze', 6, null, W.t); triggered = true;
          } else if (eid === 'EFX_TOXIN_INFECTION' || eid === 'EFX_POISON_COAT') {
            ST.addStatus(target, 'poison', 12, { per: 0.015, src: actor.id }, W.t); triggered = true;
          } else if (eid === 'EFX_VITALITY_STEAL') {
            const heal = Math.max(1, Math.round((dmgDealt || 20) * (p.vitalityStealRatio || 0.18)));
            C.setHp(actor, Math.min(C.hpMax(actor), C.hp(actor) + heal)); triggered = true;
          } else if (eid === 'EFX_QI_SIPHON') {
            if (actor.cult && actor.h && actor.h.state) {
              const qm = CULT.qiMax(actor);
              actor.h.state.qi = Math.min(qm, (actor.h.state.qi || 0) + Math.min(qm * 0.08, p.siphonAmount || 35));
            }
            triggered = true;
          } else if (eid === 'EFX_SOUL_MENTAL_ATTACK' || eid === 'EFX_SOUL_SHOCK' || eid === 'EFX_MIND_CORROSION') {
            ST.addStatus(target, 'mdefbreak', 10, null, W.t);
            if (!target.foe && target.h && target.h.state) target.h.state.heartDemon = clamp((target.h.state.heartDemon || 0) + 3, 0, 100);
            triggered = true;
          } else if (eid === 'EFX_SILENCE_CAST' || eid === 'EFX_INTERRUPT_CHANNEL') {
            C.interruptChannel(W, f, target, 'ยันต์สกัดจุด');
            ST.addStatus(target, 'silence', 6, null, W.t); triggered = true;
          } else if (eid === 'EFX_SUPPRESS_POSITIVE_BUFF') {
            ST.clearStatus(target, x => SK.STATUS[x.k] && SK.STATUS[x.k].isBuff); triggered = true;
          } else if (eid === 'EFX_SPATIAL_LOCK' || eid === 'EFX_TERRAIN_BIND_TRAP') {
            ST.addStatus(target, 'root', 8, null, W.t); triggered = true;
          } else if (eid === 'EFX_WEAPON_MAGNET_DISARM' || eid === 'EFX_FORMATION_DISRUPTION') {
            ST.addStatus(target, 'weaken', 10, null, W.t); triggered = true;
          } else if (eid === 'EFX_SWORD_STORM_STRIKE' || eid === 'EFX_ELEMENTAL_ANNIHILATION') {
            ST.addStatus(target, 'exposed', 10, null, W.t); triggered = true;
          } else if (eid === 'EFX_V234_MARK_IMPRINT' || eid === 'EFX_V234_MARK_AMPLIFIER') {
            COMPOSABLE_ENGINE.applyMark(W, f, actor, target, p.markKind || 'daoMark', p.stacks || 1, p.dur || 16);
            triggered = true;
          } else if (eid === 'EFX_V234_MARK_EXECUTIONER') {
            if (COMPOSABLE_ENGINE.totalMarksOn(target, W.t) >= 2) {
              COMPOSABLE_ENGINE.detonateMarks(W, f, actor, target, { bonusPerStack: p.detonateBonus || 0.30 });
              triggered = true;
            }
          } else if (eid === 'EFX_V234_ELEMENTAL_CATALYST' || eid === 'EFX_V234_ELEMENTAL_REACTOR') {
            const itemEl = it.element || (src && src.element) || 'FIRE';
            COMPOSABLE_ENGINE.applyElementalAura(target, itemEl, 1.5, W.t, actor.id);
            ST.applyNamedBuff(actor, 'elementalOvercharge', 20, W.t, { casterId: actor.id });
            triggered = true;
          } else if (eid === 'EFX_V234_COMBO_MOMENTUM') {
            actor._comboChainCount = Math.min(5, (actor._comboChainCount || 0) + 1);
            ST.applyNamedBuff(actor, 'comboReady', 18, W.t, { casterId: actor.id });
            if (actor.cult && actor.h && actor.h.state) {
              const qm = CULT.qiMax(actor);
              actor.h.state.qi = Math.min(qm, (actor.h.state.qi || 0) + qm * (p.qiRestorePct || 0.06));
            }
            triggered = true;
          } else if (eid === 'EFX_V234_STANCE_FLOW') {
            if (!actor._activeStance) actor._activeStance = 'STAR_SWORD_STANCE';
            ST.addStatus(actor, 'haste', 12, null, W.t);
            if (actor.cult && actor.h && actor.h.state) {
              const qm = CULT.qiMax(actor);
              actor.h.state.qi = Math.min(qm, (actor.h.state.qi || 0) + qm * (p.qiDrainPct || 0.06));
            }
            triggered = true;
          } else if (eid === 'EFX_V234_RICOCHET_CONDUCTOR' || eid === 'EFX_V234_CHAIN_LIGHTNING_ARC' || eid === 'EFX_V234_SONIC_RESONANCE_WAVE') {
            ST.addStatus(target, 'exposed', 8, null, W.t);
            if (f) {
              const others = C.enemies(W, f, actor.id).filter(u => C.alive(u) && u.id !== target.id);
              if (others.length > 0) {
                const arcDmg = Math.max(4, Math.round((dmgDealt || 20) * (p.arcRatio || 0.32)));
                f._composableDepth = (f._composableDepth || 0) + 1;
                try { C.applyDamage(W, f, actor, others[0], arcDmg, 'สายฟ้าชิ่งสะท้อน'); } finally { f._composableDepth = Math.max(0, (f._composableDepth || 1) - 1); }
              }
            }
            triggered = true;
          } else if (eid === 'EFX_V234_EXECUTE_REAPER') {
            if (hpFrac(target) <= (p.executeThreshold || 0.45)) {
              const exDmg = Math.max(6, Math.round((dmgDealt || 24) * (p.bonusMult || 0.28)));
              C.setHp(target, Math.max(1, C.hp(target) - exDmg));
              target.fx = { t: W.t, text: '💀 เคียวปลิดวิญญาณ -' + exDmg };
            } else {
              COMPOSABLE_ENGINE.applyMark(W, f, actor, target, 'bloodBrand', 1, 14);
            }
            triggered = true;
          } else if (eid === 'EFX_V234_BUFF_STEALER') {
            if (Array.isArray(target.sx)) {
              const stolen = target.sx.find(x => x && x.until > W.t && SK.STATUS[x.k] && SK.STATUS[x.k].isBuff);
              if (stolen) {
                ST.clearStatus(target, x => x.k === stolen.k);
                ST.applyNamedBuff(actor, stolen.k, 20, W.t, { casterId: actor.id });
              }
            }
            ST.addStatus(target, 'exposed', 10, null, W.t);
            triggered = true;
          } else if (eid === 'EFX_V234_DEBUFF_EXTENDER') {
            if (Array.isArray(target.sx)) {
              for (const x of target.sx) {
                if (x && x.until > W.t && COMPOSABLE_ENGINE.DEBUFF_KEYS.includes(x.k)) {
                  x.until = Math.min(W.t + 2880, x.until + (p.extendDur || 6));
                }
              }
            }
            ST.addStatus(target, 'weaken', 10, null, W.t);
            triggered = true;
          } else if (eid === 'EFX_V234_DOT_TRANSMUTER') {
            ST.clearStatus(actor, x => ['burn', 'bleed', 'poison', 'curse'].includes(x.k));
            ST.addStatus(actor, 'shield', 12, { amt: Math.round(C.hpMax(actor) * 0.14) }, W.t);
            ST.addStatus(target, 'poison', 12, { per: 0.015, src: actor.id }, W.t);
            triggered = true;
          } else if (eid === 'EFX_V234_OVERDRIVE_SURGE') {
            ST.applyNamedBuff(actor, 'fervorMight', 20, W.t, { casterId: actor.id });
            triggered = true;
          } else if (eid === 'EFX_V234_KARMIC_THREAD_BIND') {
            ST.addStatus(target, 'curse', 10, { per: 0.012, src: actor.id }, W.t); triggered = true;
          } else if (eid === 'EFX_RECON_SIGNAL_JAM') {
            ST.addStatus(target, 'blind', 10, null, W.t);
            ST.addStatus(target, 'silence', 6, null, W.t);
            triggered = true;
          } else if (eid === 'EFX_VEIN_ANCHORED' || eid === 'EFX_REGEN_AURA') {
            const hm = C.hpMax(actor);
            C.setHp(actor, Math.min(hm, C.hp(actor) + Math.max(1, Math.round(hm * 0.04))));
            ST.applyNamedBuff(actor, 'vitalRegen', 18, W.t, { casterId: actor.id });
            triggered = true;
          }
        } else if (normTrigger === 'onStruck' || normTrigger === 'onLowHp' || normTrigger === 'combatTick' || normTrigger === 'onStanceSwitch') {
          if (eid === 'EFX_BARRIER_SHIELD' || eid === 'EFX_TIMED_PARRY' || eid === 'EFX_STRUCTURAL_IMMUNITY_FLOOR' || eid === 'EFX_REALM_SUPPRESSION_GUARD' || eid === 'EFX_V234_AEGIS_COUNTER_PULSE' || eid === 'EFX_V234_EMERGENCY_AEGIS' || eid === 'EFX_FINAL_STAND_SHIELD') {
            const shPct = p.shieldPct || 0.18;
            ST.addStatus(actor, 'shield', 12, { amt: Math.round(C.hpMax(actor) * shPct) }, W.t);
            if (eid === 'EFX_V234_EMERGENCY_AEGIS' && target && C.alive(target) && dmgDealt > 0) {
              const ref = Math.max(1, Math.min(200, Math.round(dmgDealt * (p.reflectPct || 0.14))));
              if (f) f._composableDepth = (f._composableDepth || 0) + 1;
              try { C.applyDamage(W, f, actor, target, ref, 'เกราะฉุกเฉินสะท้อน'); } finally { if (f) f._composableDepth = Math.max(0, (f._composableDepth || 1) - 1); }
            }
            triggered = true;
          } else if (eid === 'EFX_DAMAGE_REFLECT' && target && C.alive(target)) {
            const ref = Math.max(1, Math.min(240, Math.round((dmgDealt || 20) * (p.reflectRatio || 0.22))));
            if (f) f._composableDepth = (f._composableDepth || 0) + 1;
            try { C.applyDamage(W, f, actor, target, ref, 'สะท้อนจากอุปกรณ์'); } finally { if (f) f._composableDepth = Math.max(0, (f._composableDepth || 1) - 1); }
            triggered = true;
          } else if (eid === 'EFX_ILLUSION_DECOY' || eid === 'EFX_STEALTH_CONCEALMENT' || eid === 'EFX_SIDESTEP_EVASION' || eid === 'EFX_ILLUSION_MIST_MAZE' || eid === 'EFX_V234_VOID_BLINK_ESCAPE') {
            ST.applyNamedBuff(actor, 'shadowVeil', 18, W.t, { casterId: actor.id });
            triggered = true;
          } else if (eid === 'EFX_GUARDED_DAMAGE_SHARE' || eid === 'EFX_V234_SOUL_TETHER_WARD' || eid === 'EFX_V234_TETHER_GUARD') {
            ST.applyNamedBuff(actor, 'soulLinkGuard', 20, W.t, { casterId: actor.id });
            ST.addStatus(actor, 'shield', 12, { amt: Math.round(C.hpMax(actor) * (p.shieldPct || 0.14)) }, W.t);
            triggered = true;
          } else if (eid === 'EFX_V234_STATUS_ABSORB_ARMOR' || eid === 'EFX_V234_DOT_TRANSMUTER') {
            ST.clearStatus(actor, x => ['burn', 'bleed', 'poison', 'chill', 'slow'].includes(x.k));
            ST.addStatus(actor, 'shield', 12, { amt: Math.round(C.hpMax(actor) * 0.14) }, W.t);
            triggered = true;
          } else if (eid === 'EFX_V234_OVERDRIVE_SURGE') {
            ST.applyNamedBuff(actor, 'fervorMight', 20, W.t, { casterId: actor.id });
            ST.addStatus(actor, 'haste', 12, null, W.t);
            triggered = true;
          } else if (eid === 'EFX_EMERGENCY_BEACON') {
            ST.addStatus(actor, 'shield', 14, { amt: Math.round(C.hpMax(actor) * 0.22) }, W.t);
            ST.applyNamedBuff(actor, 'tacticalCommand', 24, W.t, { casterId: actor.id });
            triggered = true;
          } else if (eid === 'EFX_VEIN_ANCHORED' || eid === 'EFX_REGEN_AURA') {
            const hm = C.hpMax(actor);
            C.setHp(actor, Math.min(hm, C.hp(actor) + Math.max(1, Math.round(hm * 0.04))));
            if (actor.cult && actor.h && actor.h.state) {
              const qm = CULT.qiMax(actor);
              actor.h.state.qi = Math.min(qm, (actor.h.state.qi || 0) + qm * 0.05);
            }
            ST.applyNamedBuff(actor, 'vitalRegen', 18, W.t, { casterId: actor.id });
            triggered = true;
          } else if (eid === 'EFX_V234_STANCE_FLOW') {
            ST.addStatus(actor, 'haste', 10, null, W.t);
            triggered = true;
          }
        }
        if (triggered) {
          actor._itemEfxCds[cdKey] = W.t + (p.icdTicks || 8);
          actor.lastItemEffectProc = { t: W.t, itemId: it.id, effectId: eid, kind: normTrigger };
        }
      }
    }
  };

  COMPOSABLE_ENGINE.IMPLEMENTED_EFFECT_IDS = new Set((g.ECO && g.ECO.ALL_RUNTIME_EFFECT_IDS) || []);
  C.COMPOSABLE_ENGINE = COMPOSABLE_ENGINE;

  g.COMBAT = C;
  if (typeof module === 'object' && module.exports) module.exports = C;
})(typeof globalThis !== 'undefined' ? globalThis : this);
