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

  /* ---------- การต่อสู้จริง (Patch v3.0.0: Tactical State & Safe Side Resolution) ---------- */
  C.ensureUnitTac = u => {
    if (!u) return null;
    if (!u.tac || typeof u.tac !== 'object') {
      u.tac = {
        closedOnBy: null,
        gapClosedOn: null,
        procCds: {},
        reactionCharges: 1,
        reactionReadyAt: 0,
        zocReadyAt: 0,
        targetLockUntil: 0,
        lastTargetId: null,
        lastMoveBand: null,
        pacingUntil: 0,
        kiteStepCooldownUntil: 0,
        stuckTicks: 0,
        coveringAllyId: null,
        interceptCount: 0,
        archetype: null
      };
    } else {
      if (!u.tac.procCds || typeof u.tac.procCds !== 'object') u.tac.procCds = {};
      if (u.tac.reactionCharges == null) u.tac.reactionCharges = 1;
      if (u.tac.reactionReadyAt == null) u.tac.reactionReadyAt = 0;
      if (u.tac.zocReadyAt == null) u.tac.zocReadyAt = 0;
      if (u.tac.targetLockUntil == null) u.tac.targetLockUntil = 0;
      if (u.tac.pacingUntil == null) u.tac.pacingUntil = 0;
      if (u.tac.kiteStepCooldownUntil == null) u.tac.kiteStepCooldownUntil = 0;
      if (u.tac.stuckTicks == null) u.tac.stuckTicks = 0;
      if (u.tac.interceptCount == null) u.tac.interceptCount = 0;
    }
    return u.tac;
  };

  C.ensureFightTac = (f, now) => {
    if (!f) return null;
    const tNow = now != null ? now : ((g.STATS && g.STATS.now) || f.t0 || 0);
    if (!f.tac || typeof f.tac !== 'object') {
      f.tac = {
        combatStartedAt: f.state === 'gather' ? null : tNow,
        roundStartFired: !!f._roundStartFired,
        firstStrikeUsed: Object.assign({}, f._firstStrikeUsed || {}),
        unitFirstStrikeDone: Object.assign({}, f._unitFirstStrikeDone || {}),
        phoenixRebirthUsed: Object.assign({}, f._phoenixRebirthUsed || {}),
        mechDecoyUsed: Object.assign({}, f._mechDecoyUsed || {}),
        phoenixClauseUsed: Object.assign({}, f._phoenixClauseUsed || {}),
        breachTicks: 0,
        outcome: null,
        concluded: false,
        highlights: [],
        stats: { intercepts: 0, losBlocks: 0, zocStrikes: 0, interrupts: 0, targetSwitches: 0, reactions: 0 }
      };
    } else {
      if (!f.tac.firstStrikeUsed) f.tac.firstStrikeUsed = {};
      if (!f.tac.unitFirstStrikeDone) f.tac.unitFirstStrikeDone = {};
      if (!f.tac.phoenixRebirthUsed) f.tac.phoenixRebirthUsed = {};
      if (!f.tac.mechDecoyUsed) f.tac.mechDecoyUsed = {};
      if (!f.tac.phoenixClauseUsed) f.tac.phoenixClauseUsed = {};
      if (!Array.isArray(f.tac.highlights)) f.tac.highlights = [];
      if (!f.tac.stats) f.tac.stats = { intercepts: 0, losBlocks: 0, zocStrikes: 0, interrupts: 0, targetSwitches: 0, reactions: 0 };
    }
    return f.tac;
  };

  C.recordTacticalHighlight = (W, f, type, textTh, meta) => {
    if (!f) return;
    const ft = C.ensureFightTac(f, W && W.t);
    const tNow = (W && W.t != null) ? W.t : 0;
    if (ft.highlights.length < 36) {
      ft.highlights.push(Object.assign({ t: tNow, type, kind: type, textTh }, meta || {}));
    }
    if (Array.isArray(f.log) && f.log.length < 60) {
      f.log.push({ t: tNow, relation: type, text: textTh, a: meta && meta.actorId, d: meta && meta.targetId, p: meta && meta.protectorId });
    }
  };

  C.startFight = (W, A, B, kind, opts) => {
    opts = opts || {};
    W.fights = W.fights || []; W.fightSeq = (W.fightSeq || 0) + 1;
    const cbKind = opts.cbKind || (kind === 'raid' ? 'raid' : (kind === 'leadership' || kind === 'grudge' || kind === 'duel') ? 'duel' : kind === 'tourney' ? 'tourney' : kind === 'wild' ? 'wild' : null);
    const f = {
      id: W.fightSeq,
      kind,
      cbKind,
      serious: !!opts.serious,
      A: A.slice(),
      B: B.slice(),
      t0: W.t,
      state: opts.gather ? 'gather' : 'fight',
      arena: opts.arena || null,
      cb: opts.cb || null,
      ctx: opts.ctx || {},
      over: false,
      log: []
    };
    C.ensureFightTac(f, W.t);
    W.fights.push(f);
    [].concat(A, B).forEach(id => C.enter(W, f, id));
    if (C.assignCombatRows) C.assignCombatRows(W, f);
    return f;
  };
  C.isUnitInActiveFight = (W, u) => {
    const curF = C.fightOf(W, u);
    return !!(curF && !curF.over);
  };
  C.isBossUnit = u => !!(u && (u.boss || u.isBoss || u.rank === 'BOSS' || u.anatomyParts || (u.foe && (u.tier || 1) >= 7)));
  C.healMultiplier = (u, tNow) => {
    const ST = STs();
    if (!u || !ST) return 1.0;
    if (ST.has(u, 'stygianFreeze', tNow)) return 0;
    if (ST.has(u, 'healBlock', tNow)) return 0.25;
    if (ST.has(u, 'ashenToxin', tNow)) return 0.50;
    return 1.0;
  };
  C.enter = (W, f, id) => {
    const u = C.unit(W, id); if (!u) return;
    if (W && Array.isArray(W.fights)) {
      for (const oldF of W.fights) {
        if (!oldF || oldF.id === (f && f.id) || oldF.over) continue;
        const inA = Array.isArray(oldF.A) && oldF.A.includes(id);
        const inB = Array.isArray(oldF.B) && oldF.B.includes(id);
        if (inA || inB) {
          if (inA) oldF.A = oldF.A.filter(x => x !== id);
          if (inB) oldF.B = oldF.B.filter(x => x !== id);
          if (!oldF.A.length || !oldF.B.length) oldF.over = true;
        }
      }
    }
    const side = (f && Array.isArray(f.A) && f.A.includes(id)) ? 'A' : (f && Array.isArray(f.B) && f.B.includes(id)) ? 'B' : (u.side || null);
    if (side) u.side = side;
    C.ensureUnitTac(u);
    u.tac.closedOnBy = null;
    u.tac.gapClosedOn = null;
    u.tac.reactionCharges = 1;
    u.tac.reactionReadyAt = 0;
    u.tac.zocReadyAt = 0;
    u.tac.targetLockUntil = 0;
    u.tac.lastTargetId = null;
    u.tac.pacingUntil = 0;
    u.tac.stuckTicks = 0;
    u.tac.archetype = C.resolveCognitiveArchetype ? C.resolveCognitiveArchetype(u) : 'BALANCED';
    if (u.foe && (!u.skl || !u.skl.length)) u.skl = SKs().foeSkills(u);
    if (W && g.SECT && g.SECT.PEAKS) g.SECT.PEAKS._activeWorld = W;
    if (!u.foe && f.serious) STs().preFight(W, u, f.kind === 'raid');
    if (!u.foe && g.ECO && g.ECO.triggerArmedConsumables) {
      g.ECO.triggerArmedConsumables(W, f, u, 'COMBAT_START');
    }
    if (!u.foe && u.cult && u.cult.path === 'BEAST_SOVEREIGN' && (f.serious || f.kind === 'raid' || f.kind === 'duel' || f.kind === 'leadership') && g.CULT && g.CULT.BEAST_SYMBIOSIS && g.CULT.BEAST_SYMBIOSIS.activatePossession) {
      g.CULT.BEAST_SYMBIOSIS.activatePossession(W, u, null, 36);
    }
    if (!u.foe) {
      AI.interruptFor(W, u);
      u.hidden = false;
      u.act = { id: 'fight', stage: 'do', left: 9999, total: 9999, ctx: { fid: f.id, target: null, cd: 0, cds: {} }, why: [['เข้าต่อสู้', 9]] };
      u.why = u.act.why;
      u.path = null;
      u.run = true;
    } else {
      u.act = { id: 'fight', ctx: { fid: f.id, target: null, cd: 0, cds: {} } };
    }
  };
  C.join = (W, f, id, side) => {
    if (!f || (side !== 'A' && side !== 'B')) return;
    const other = side === 'A' ? 'B' : 'A';
    if (Array.isArray(f[other]) && f[other].includes(id)) return;
    if (f[side].includes(id)) return;
    f[side].push(id);
    const u = C.unit(W, id);
    if (u) u.side = side;
    C.enter(W, f, id);
  };
  C.fightOf = (W, u) => u && u.act && u.act.ctx && u.act.ctx.fid ? (W.fights || []).find(f => f.id === u.act.ctx.fid) : null;
  C.sideOf = (f, id) => {
    if (!f || !id) return null;
    if (Array.isArray(f.A) && f.A.includes(id)) return 'A';
    if (Array.isArray(f.B) && f.B.includes(id)) return 'B';
    if (!f.A && !f.B && Array.isArray(f.units) && f.units.includes(id)) return 'A';
    return null;
  };
  C.isAlly = (f, id1, id2) => {
    const s1 = C.sideOf(f, id1), s2 = C.sideOf(f, id2);
    return !!(s1 && s2 && s1 === s2);
  };
  C.isHostile = (f, id1, id2) => {
    const s1 = C.sideOf(f, id1), s2 = C.sideOf(f, id2);
    return !!(s1 && s2 && s1 !== s2);
  };
  C.enemies = (W, f, id) => {
    const s = C.sideOf(f, id);
    if (!s) return [];
    return (s === 'A' ? (f.B || []) : (f.A || [])).map(i => C.unit(W, i)).filter(C.alive);
  };
  C.alliesOf = (W, f, id) => {
    const s = C.sideOf(f, id);
    if (!s) {
      const u = C.unit(W, id);
      return u && C.alive(u) ? [u] : [];
    }
    const list = s === 'A' ? (f.A || f.units || []) : (f.B || []);
    return list.map(i => C.unit(W, i)).filter(C.alive);
  };

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
  /* ---------- Patch v3.0.0: Battlefield Geometry, Safe Displacement, LoS & Zone of Control ---------- */
  C.distSq = (x1, y1, x2, y2) => {
    const dx = (x1 || 0) - (x2 || 0), dy = (y1 || 0) - (y2 || 0);
    return dx * dx + dy * dy;
  };

  C.unitDist = (a, b) => {
    if (!a || !b || !Number.isFinite(a.x) || !Number.isFinite(b.x)) return 2.0;
    return Math.hypot(a.x - b.x, a.y - b.y);
  };

  /* Deterministic hash noise in [0, 1) that NEVER touches W.rng */
  C.tacHash01 = (W, f, uId, tId, salt) => {
    const str = String((W && W.seed) || 'jh') + ':' + String((f && f.id) || 0) + ':' + String(uId || '') + ':' + String(tId || '') + ':' + String(salt || 0);
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return ((h >>> 0) % 10000) / 10000;
  };

  /* ตรวจสอบเส้นทางและการกระแทกสิ่งกีดขวางอย่างปลอดภัย */
  C.projectSafePosition = (W, x0, y0, x1, y1) => {
    const M = W && W.map;
    const minX = 1.0, maxX = (M && M.W ? M.W - 1.5 : 238);
    const minY = 1.0, maxY = (M && M.H ? M.H - 1.5 : 190);
    const dx = x1 - x0, dy = y1 - y0;
    const dist = Math.hypot(dx, dy);
    if (dist < 0.01) return { x: clamp(x0, minX, maxX), y: clamp(y0, minY, maxY), hitObstacle: false };
    const steps = Math.max(2, Math.ceil(dist / 0.35));
    let lastX = clamp(x0, minX, maxX), lastY = clamp(y0, minY, maxY);
    let hitObstacle = false;
    for (let i = 1; i <= steps; i++) {
      const r = i / steps;
      const nx = clamp(x0 + dx * r, minX, maxX);
      const ny = clamp(y0 + dy * r, minY, maxY);
      if (M && MAP && MAP.blocked && MAP.blocked(M, nx, ny)) {
        hitObstacle = true;
        break;
      }
      lastX = nx;
      lastY = ny;
    }
    return { x: +lastX.toFixed(2), y: +lastY.toFixed(2), hitObstacle, wallSlammed: hitObstacle };
  };

  /* ตรวจสอบ Line-of-Sight ระหว่างผู้โจมตีและเป้าหมาย (ทั้งภูมิประเทศ/อาคาร และยูนิตที่ยืนขวาง) */
  C.checkLineOfSight = (W, f, a, d, moveSpec) => {
    if (!a || !d || !Number.isFinite(a.x) || !Number.isFinite(d.x)) {
      return { clear: true, terrainBlocked: false, blockerUnit: null };
    }
    const spec = moveSpec || (SKs() && SKs().resolveMoveSpatialSpec ? SKs().resolveMoveSpatialSpec(null, a) : { requiresLoS: false });
    if (spec.ignoresObstacles) return { clear: true, terrainBlocked: false, blockerUnit: null };
    const dx = d.x - a.x, dy = d.y - a.y;
    const dist = Math.hypot(dx, dy);
    if (dist <= 1.55) return { clear: true, terrainBlocked: false, blockerUnit: null };

    // 1. Check map terrain / building walls along ray if requiresLoS
    const M = W && W.map;
    let terrainBlocked = false;
    if (spec.requiresLoS && M && MAP && MAP.blocked) {
      const steps = Math.max(2, Math.min(12, Math.ceil(dist / 0.65)));
      for (let i = 1; i < steps; i++) {
        const r = i / steps;
        const sx = a.x + dx * r, sy = a.y + dy * r;
        if (MAP.blocked(M, sx, sy)) {
          terrainBlocked = true;
          break;
        }
      }
    }

    // 2. Check if a frontline defender of target's side stands directly in the line of fire
    let blockerUnit = null;
    if (spec.requiresLoS && f && dist >= 2.0) {
      const defenders = C.alliesOf(W, f, d.id).filter(u => u && u.id !== d.id && C.alive(u) && C.canUnitIntercept(W, f, u));
      const lenSq = dx * dx + dy * dy;
      let bestProj = Infinity;
      for (const u of defenders) {
        if (!Number.isFinite(u.x)) continue;
        const ux = u.x - a.x, uy = u.y - a.y;
        const tProj = (ux * dx + uy * dy) / lenSq;
        if (tProj <= 0.12 || tProj >= 0.88) continue;
        const px = a.x + tProj * dx, py = a.y + tProj * dy;
        const perpDist = Math.hypot(u.x - px, u.y - py);
        const blockRad = C.unitZoCRadius(u) * 0.72;
        if (perpDist <= Math.max(0.65, blockRad) && tProj < bestProj) {
          bestProj = tProj;
          blockerUnit = u;
        }
      }
    }
    return {
      clear: !terrainBlocked && !blockerUnit,
      terrainBlocked,
      blockerUnit
    };
  };

  C.unitZoCRadius = (u, W) => {
    if (!u || !C.alive(u)) return 0;
    const ST = STs();
    if (ST && (ST.has(u, 'stun') || ST.has(u, 'paralyze') || ST.has(u, 'fear') || ST.has(u, 'cryoStasis'))) return 0;
    const wp = (SKs() && SKs().weaponTacticalProfile) ? SKs().weaponTacticalProfile(u) : null;
    if (!wp) return 1.1;
    if (wp.reachClass === 'RANGED_KITE') return 0;
    let r = wp.reachClass === 'LONG_POLEARM' ? 1.65 : wp.reachClass === 'HEAVY_BREAKER' ? 1.45 : 1.25;
    if (u._activeStance === 'VAJRA_BASTION_STANCE' || u._activeStance === 'IRON_VAJRA_GUARD' || (ST && ST.has(u, 'guardUp'))) r += 0.30;
    if (!u.foe && u.cult && (u.cult.path === 'BODY' || u.cult.path === 'GOD')) r += 0.15;
    const wRef = W || (g.SECT && g.SECT.PEAKS && g.SECT.PEAKS._activeWorld) || g.W || (g.G && g.G.W);
    if (!u.foe && wRef && wRef.sect && wRef.sect.vanguardPosture === 'SPEAR_ZOC_PHALANX' && (wp.reachClass === 'LONG_POLEARM' || wp.weaponType === 'SPEAR' || wp.weaponType === 'STAFF')) {
      r += 0.35;
    }
    if (u.isGateBeast && (u.fourSymbol === 'BLACK_TORTOISE' || u.bloodlineTrait === 'IRON_CARAPACE')) r += 0.35;
    return +r.toFixed(2);
  };

  C.canUnitIntercept = (W, f, u) => {
    if (!u || !C.alive(u)) return false;
    const ST = STs();
    const tNow = (W && W.t != null) ? W.t : 0;
    if (ST && (ST.has(u, 'stun', tNow) || ST.has(u, 'paralyze', tNow) || ST.has(u, 'root', tNow) || ST.has(u, 'fear', tNow) || ST.has(u, 'cryoStasis', tNow))) return false;
    if (hpFrac(u) < 0.22) return false;
    const tac = C.ensureUnitTac(u);
    if (tac.reactionReadyAt > tNow || (tac.reactionCharges != null && tac.reactionCharges <= 0)) return false;
    if (!u.foe && u.h && u.h.state && (u.h.state.energy || 0) < 6) return false;
    return true;
  };

  function moveToward(W, u, tx, ty, run, fOpt) {
    if (!u || !Number.isFinite(tx) || !Number.isFinite(ty)) return;
    const ST = STs();
    const tNow = (W && W.t != null) ? W.t : 0;
    if (ST && (ST.has(u, 'stun', tNow) || ST.has(u, 'paralyze', tNow) || ST.has(u, 'root', tNow) || ST.has(u, 'grounded', tNow) || ST.has(u, 'cryoStasis', tNow))) {
      u.path = null;
      return;
    }
    const dx = tx - u.x, dy = ty - u.y, d = Math.hypot(dx, dy);
    if (d < 0.01) return;
    const f = fOpt || C.fightOf(W, u);
    const tac = C.ensureUnitTac(u);
    const oldX = u.x, oldY = u.y;

    // Zone of Control (ZoC) check: if moving past a hostile frontline guardian without targeting them
    let zocSlowMult = 1.0;
    if (f && !u.fled && !u.yield && (f.A.length + f.B.length) > 2) {
      const curTargetId = u.act && u.act.ctx && u.act.ctx.target;
      const enemies = C.enemies(W, f, u.id);
      for (const en of enemies) {
        if (!en || en.id === curTargetId || Math.abs(u.x - en.x) > 2.6 || Math.abs(u.y - en.y) > 2.6) continue;
        const zRad = C.unitZoCRadius(en);
        if (zRad <= 0) continue;
        const distNow = C.unitDist(u, en);
        if (distNow <= zRad) {
          zocSlowMult = Math.min(zocSlowMult, 0.52);
          const enTac = C.ensureUnitTac(en);
          if (enTac.zocReadyAt <= tNow && C.canUnitIntercept(W, f, en)) {
            enTac.zocReadyAt = tNow + 10;
            const ft = C.ensureFightTac(f, tNow);
            ft.stats.zocStrikes = (ft.stats.zocStrikes || 0) + 1;
            en.fx = { t: tNow, text: '🛡️ สกัดกั้น!' };
            C.recordTacticalHighlight(W, f, 'ZOC_INTERCEPT', C.name(en) + ' คุมพื้นที่สกัดกั้นการเคลื่อนผ่านของ ' + C.name(u), {
              actorId: en.id, targetId: u.id
            });
            C.strike(W, f, en, u, { M: 0.68, type: 'p', noCounter: true, noReflect: true, silent: true, label: 'สกัดกั้น' });
            if (ST && C.alive(u) && C.tacHash01(W, f, en.id, u.id, tNow) < 0.40) {
              ST.addStatus(u, 'slow', 6, null, tNow);
            }
            break;
          }
        }
      }
    }

    if (u.foe) {
      const sp = (u.speed || 0.6) * (run ? 1.0 : 0.8) * clamp(ST.get(u).move / 100, 0.35, 2.0) * zocSlowMult;
      const s = Math.min(d, sp);
      const nx = u.x + dx / d * s, ny = u.y + dy / d * s;
      if (!MAP.blocked(W.map, nx, ny)) {
        u.x = nx; u.y = ny;
      } else {
        const ax = u.x + (dx > 0 ? s : -s) * (Math.abs(dx) > Math.abs(dy) ? 1 : 0.25);
        const ay = u.y + (dy > 0 ? s : -s) * (Math.abs(dy) >= Math.abs(dx) ? 1 : 0.25);
        if (!MAP.blocked(W.map, ax, ay)) {
          u.x = ax; u.y = ay;
        } else {
          // Deterministic tangential slide without consuming W.rng
          const perpX = u.x + (-dy / d) * s * 0.75;
          const perpY = u.y + (dx / d) * s * 0.75;
          if (!MAP.blocked(W.map, perpX, perpY)) {
            u.x = perpX; u.y = perpY;
          }
        }
      }
      u.face = dx >= 0 ? 1 : -1;
    } else {
      const gx = Math.floor(tx), gy = Math.floor(ty); if (!u.path || (((W.t + (u.n || 0)) % 6 === 0) && (u._pathGx !== gx || u._pathGy !== gy))) { u._pathGx = gx; u._pathGy = gy; AI.goTo(W, u, gx, gy); }
      AI.stepMove(W, u);
      u.face = dx >= 0 ? 1 : -1;
    }

    if (Math.hypot(u.x - oldX, u.y - oldY) < 0.04) {
      tac.stuckTicks = (tac.stuckTicks || 0) + 1;
    } else {
      tac.stuckTicks = 0;
    }
  }
  /* =====================================================================
   * ระบบสู้ใหม่ (v1.4 + v1.10 Overhaul): สเตตัสจริง (STATS) + วิชาหลายกระบวนท่า (SK) + วิชาติดตัว (PASSIVE)
   * ===================================================================== */
  const STs = () => g.STATS, SKs = () => g.SK;
  const FX_PHYS = ['ฟัน', 'แทง', 'ปะทะ', 'ฝ่ามือ'], FX_MAG = ['ปราณพุ่ง', 'คลื่นวิชา', 'แสงปราณ'];
  C.stats = u => STs().get(u);
  function hpFrac(u) { return clamp(C.hp(u) / Math.max(1, C.hpMax(u)), 0, 1); }
  function shieldOf(u) { const x = STs().statusOf(u, 'shield'); if (x && x.amt > 0) return x; if (u && u.shieldBp > 0) return { k: 'shield', isLegacyBp: true, get amt() { return u.shieldBp; }, set amt(v) { u.shieldBp = Math.max(0, v); } }; return null; }

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

    const aTac = C.ensureUnitTac(a), dTac = C.ensureUnitTac(d);
    const fTac = f ? C.ensureFightTac(f) : null;
    const moveSpec = (o.skill && SK.resolveMoveSpatialSpec) ? SK.resolveMoveSpatialSpec(o.skill, a) : null;

    // 0. Technique-driven range & min-range dynamics (v3.0.0)
    if (moveSpec && moveSpec.bandIndex >= 4 && dist >= 2.8) {
      relation = 'FLYING_ART_LONG_RANGE';
      dmgMult *= 1.10;
      accAdd += 6;
      noteTh = C.name(a) + ' ใช้วิชาระยะไกล「' + (o.skill.nameTh || 'กระบี่บิน/ศรปราณ') + '」โจมตีข้ามสมรภูมิ';
    }
    if ((pa.weaponType === 'BOW' || (moveSpec && moveSpec.minRangePenalty > 0)) && dist <= 1.15 && (!moveSpec || moveSpec.max > 1.8)) {
      relation = 'MIN_RANGE_HARASSED';
      dmgMult *= 0.88;
      accAdd -= 18;
      noteTh = C.name(a) + ' ถูกคลุกวงในประชิดตัว เสียเปรียบระยะยิงขั้นต่ำ';
    }

    // 1. Long-reach polearms (SPEAR, STAFF, WHIP) vs short-reach weapons (FIST, BLADE, SWORD)
    if (pa.reachClass === 'LONG_POLEARM' && (pd.reachClass === 'SHORT_SWIFT' || pd.reachClass === 'HEAVY_BREAKER')) {
      const firstStrikeWindow = fTac ? !fTac.firstStrikeUsed[a.id] : (!f || !f._firstStrikeUsed || !f._firstStrikeUsed[a.id]);
      const dClosed = dTac.gapClosedOn === a.id || d._gapClosedOn === a.id;
      if (dHasLightness && ((ST && ST.has(d, 'evadeUp')) || dClosed)) {
        relation = 'POLEARM_COUNTERED_BY_LIGHTNESS';
        dmgMult = 0.96;
        noteTh = 'วิชาตัวเบาของ ' + C.name(d) + ' พุ่งฝ่าระยะ' + (pa.weaponType === 'SPEAR' ? 'หอก' : 'พลอง') + 'สลายความได้เปรียบเปิดศึก';
      } else if (firstStrikeWindow || dist >= 1.85) {
        relation = 'POLEARM_FIRST_STRIKE';
        // In abstract bouts (!f), blend opening first-strike advantage across multi-exchange bout (1.06x) instead of permanent full opening mult unless explicitly testing opening dist
        const rawMult = pa.spec.firstStrikeMult || 1.12;
        dmgMult = (!f && o.abstractBout) ? +(1 + (rawMult - 1) * 0.55).toFixed(3) : rawMult;
        accAdd += pa.spec.firstStrikeAcc || 10;
        if (fTac) fTac.firstStrikeUsed[a.id] = true;
        if (f) { f._firstStrikeUsed = f._firstStrikeUsed || {}; f._firstStrikeUsed[a.id] = true; }
        noteTh = C.name(a) + ' อาศัยระยะ' + (pa.weaponType === 'SPEAR' ? 'ทวนยาว' : pa.weaponType === 'WHIP' ? 'แส้และด้ายปราณ' : 'พลองยาว') + 'ชิงลงมือก่อนอาวุธสั้น';
      }
    }

    // 2. Ranged weapons (BOW, FOCUS, ZITHER, BRUSH) kiting distance advantage vs melee until closed on by dash/leap
    if (pa.reachClass === 'RANGED_KITE') {
      const closedOn = (aTac.closedOnBy === d.id) || (a._closedOnBy === d.id) || (dist < 1.45 && (dHasLightness || pd.reachClass === 'SHORT_SWIFT' || pd.reachClass === 'HEAVY_BREAKER'));
      if (!closedOn && dist >= 1.65) {
        relation = 'RANGED_KITING_ADVANTAGE';
        const rawKite = pa.spec.kiteDmgMult || 1.12;
        dmgMult *= (!f && o.abstractBout) ? +(1 + (rawKite - 1) * 0.60).toFixed(3) : rawKite;
        critAdd += (pa.spec.kiteCritAdd || 5);
        accAdd += (pa.spec.kiteAccAdd || 8);
        noteTh = C.name(a) + ' รักษาระยะห่างยิงสกัดด้วย' + (pa.weaponType === 'BOW' ? 'ธนู' : pa.weaponType === 'ZITHER' ? 'พิณคีตเวทย์' : pa.weaponType === 'BRUSH' ? 'พู่กันอาคม' : 'สื่อปราณ');
      } else if (closedOn) {
        if (moveSpec && moveSpec.max <= 1.55) {
          relation = 'RANGED_CLOSE_DEFENSE_TECH';
          dmgMult *= 1.05;
          noteTh = C.name(a) + ' ใช้วิชาป้องกันตัวระยะประชิดรับมือการบุกคลุกวงใน';
        } else {
          relation = 'RANGED_CLOSED_ON';
          dmgMult *= 0.92;
          accAdd -= 8;
          noteTh = C.name(a) + ' ถูกประชิดตัว เสียเปรียบระยะยิงสกัด';
        }
      }
    }

    // 3. Melee fighter using gap-closer / lightness art to counter RANGED_KITE or LONG_POLEARM
    if ((pa.reachClass === 'SHORT_SWIFT' || pa.reachClass === 'HEAVY_BREAKER') && (pd.reachClass === 'RANGED_KITE' || pd.reachClass === 'LONG_POLEARM')) {
      if (aHasLightness) {
        dTac.closedOnBy = a.id; d._closedOnBy = a.id;
        aTac.gapClosedOn = d.id; a._gapClosedOn = d.id;
        if (relation === 'NEUTRAL' || relation === 'FLYING_ART_LONG_RANGE') {
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
    if (!actor || actor.dead) return;
    if (actor.foe && !actor.cult && !actor.equip) return;
    if (f) f._inProc = true;
    try {
      const SK = SKs(), ST = STs();
      const normTrigger = (SK && SK.normalizeTrigger) ? SK.normalizeTrigger(triggerKind) : triggerKind;
      const aTac = C.ensureUnitTac(actor);
      if (actor.cult && g.MARTIAL && g.MARTIAL.passiveStats) {
        const ps = g.MARTIAL.passiveStats(actor);
        if (ps && Array.isArray(ps.procs) && ps.procs.length) {
          actor._procCds = actor._procCds || aTac.procCds;
          for (const proc of ps.procs) {
            const pKind = (SK && SK.normalizeTrigger) ? SK.normalizeTrigger(proc.kind || proc.trigger) : (proc.kind || proc.trigger);
            if (pKind !== normTrigger) continue;
            const cdUntil = Math.max(aTac.procCds[proc.techId] || 0, actor._procCds[proc.techId] || 0);
            if (cdUntil > W.t) continue;
            if (proc.condition && C.COMPOSABLE_ENGINE && C.COMPOSABLE_ENGINE.evaluateCondition) {
              if (!C.COMPOSABLE_ENGINE.evaluateCondition(proc.condition, actor, target, { W, f, triggerKind: normTrigger, dmgDealt })) continue;
            }
            const nextCd = W.t + Math.max(1, proc.icdTicks || 6);
            aTac.procCds[proc.techId] = nextCd;
            actor._procCds[proc.techId] = nextCd;
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
      if (!actor.foe && actor.cult && CULT && CULT.GRAND_DAO_MECHANICS && CULT.GRAND_DAO_MECHANICS.getActiveTraits) {
        const traitsObj = CULT.GRAND_DAO_MECHANICS.getActiveTraits(actor);
        const traitList = (traitsObj && traitsObj.allTraits) || [];
        actor._traitCds = actor._traitCds || {};
        for (let ti = 0; ti < traitList.length; ti++) {
          const tr = traitList[ti];
          if (!tr) continue;
          const trTrig = (SK && SK.normalizeTrigger) ? SK.normalizeTrigger(tr.trigger) : tr.trigger;
          const trigMatch = (C.COMPOSABLE_ENGINE && C.COMPOSABLE_ENGINE.checkTraitTriggerCondition)
            ? C.COMPOSABLE_ENGINE.checkTraitTriggerCondition(W, f, actor, target, trTrig, normTrigger)
            : (trTrig === normTrigger);
          if (!trigMatch) continue;
          if ((actor._traitCds[tr.id] || 0) > W.t) continue;
          actor._traitCds[tr.id] = W.t + 8;
          if (tr.grantBuff && ST.applyNamedBuff) {
            ST.applyNamedBuff(actor, tr.grantBuff, 18, W.t, { casterId: actor.id });
          }
          let traitTarget = target && C.alive(target) && (!f || C.isHostile(f, actor.id, target.id)) ? target : null;
          if (!traitTarget && (tr.applyDebuff || tr.applyStatus || tr.action) && f) {
            const wProf = (SK && SK.weaponTacticalProfile) ? SK.weaponTacticalProfile(actor) : null;
            const maxR = Math.max(2.5, (wProf && wProf.prefMax) || 2.5, (actor.tac && actor.tac.cachedEngageRange) || 2.5);
            const range = { max: maxR, requiresLoS: false };
            let closest = Infinity;
            for (const enemy of C.enemies(W, f, actor.id)) {
              const distance = C.unitDist(actor, enemy);
              if (enemy.hidden || enemy.away || distance > range.max + 1.5 || distance >= closest) continue;
              if (C.checkLineOfSight && !C.checkLineOfSight(W, f, actor, enemy, range).clear) continue;
              traitTarget = enemy;
              closest = distance;
            }
          }
          if (traitTarget) {
            const statuses = [tr.applyStatus, tr.applyDebuff];
            for (let si = 0; si < statuses.length; si++) {
              const status = statuses[si];
              if (!status || (si && status === statuses[0])) continue;
              const sDef = SK && SK.STATUS && SK.STATUS[status];
              const dur = tr.debuffDur || (sDef && sDef.dur) || 12;
              const isDot = !!(sDef && sDef.dot);
              ST.addStatus(traitTarget, status, dur, isDot ? { per: sDef.per || 0.016, src: actor.id } : { src: actor.id }, W.t);
            }
          }
          const actionTgt = (normTrigger === 'onRoundStart' && tr.action !== 'APPLY_MARK') ? target : (traitTarget || target);
          if (tr.action && C.COMPOSABLE_ENGINE && C.COMPOSABLE_ENGINE.executeAction && !(actor.act && actor.act.ctx && actor.act.ctx.channeling) && (!f || f.kind !== "spar" || !actionTgt || C.hp(actionTgt) > C.hpMax(actionTgt) * 0.55)) {
            C.COMPOSABLE_ENGINE.executeAction(W, f, actor, actionTgt, tr.action, tr, { triggerKind: trTrig, dmgDealt });
          }
          actor.lastRealmTraitProc = { t: W.t, traitId: tr.id, nameTh: tr.nameTh, trigger: trTrig, action: tr.action };
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
    if (dmg > 0 && d && !d.foe && d.equip && d.equip.ARMOR && (!g.MARTIAL || !g.MARTIAL.gearUsable || g.MARTIAL.gearUsable(d, d.equip.ARMOR)) && g.ECO && g.ECO.adaptArmorToElement) {
      const incEl = (f && f._lastAttackElement) || (a && a.element) || (a && a.h && a.h.root && a.h.root.primaryElement) || null;
      if (incEl && incEl !== 'NEUTRAL') {
        const prevElem = d.equip.ARMOR.adaptiveState && d.equip.ARMOR.adaptiveState.lastElement;
        const prevResist = (d.equip.ARMOR.adaptiveState && prevElem === String(incEl).toUpperCase()) ? (d.equip.ARMOR.adaptiveState.resistBonusPct || 0) : 0;
        const adState = g.ECO.adaptArmorToElement(d, d.equip.ARMOR, incEl);
        const resist = Math.max(prevResist, (adState && adState.stacks > 1) ? adState.resistBonusPct : 0);
        if (resist > 0) {
          dmg *= (1 - clamp(resist, 0, 0.30));
        }
      }
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
    // Patch v5.5.0: Mantra Combat Dharma Manifestations & Grand Formation Warfare
    if (dmg > 0 && note !== 'สะท้อนคัมภีร์ปราณ' && CULT && CULT.MANTRA_SYSTEM) {
      // 1. Attacker Mantra Dharma Bonus
      if (a && !a.foe && a.cult && a.mantraState) {
        const amr = CULT.MANTRA_SYSTEM.resolveNpcMantra(W, a);
        if (amr) {
          const stMult = amr.stanceSpec ? (amr.stanceSpec.combatPowerMult || 1.0) : 1.0;
          if (amr.archetypeId === 'PRIMORDIAL_YANG_FURNACE') {
            dmg = Math.round(dmg * (1 + (amr.spec.combatBurnBonusPct || 0.15)) * stMult);
            a.lastMantraCombatProc = { t: W.t, kind: 'SOLAR_FURNACE_BURN', textTh: '🔥 ปราณเตาหลอมสุริยันแผดเผา!', targetX: d ? d.x : a.x, targetY: d ? d.y : a.y, originX: a.x, originY: a.y };
          } else if (amr.archetypeId === 'DEVOURING_NETHER_VORTEX') {
            const ls = Math.max(1, Math.round(dmg * (amr.spec.combatLifestealPct || 0.14)));
            const qs = Math.max(1, Math.round(dmg * (amr.spec.combatQistealPct || 0.18)));
            C.setHp(a, Math.min(C.hpMax(a), C.hp(a) + ls));
            if (a.h && a.h.state) a.h.state.qi = Math.min(CULT.qiMax(a), (a.h.state.qi || 0) + qs);
            a.lastMantraCombatProc = { t: W.t, kind: 'NETHER_VORTEX_SIPHON', textTh: '🩸 วังวนมารสูบปราณ!', healedHp: ls, siphonedQi: qs, targetX: d ? d.x : a.x, targetY: d ? d.y : a.y, originX: a.x, originY: a.y };
          } else if (amr.archetypeId === 'EVERGREEN_LONGEVITY_SPRING') {
            const regenHp = Math.max(1, Math.round(C.hpMax(a) * (amr.spec.combatRegenHpPct || 0.035)));
            C.setHp(a, Math.min(C.hpMax(a), C.hp(a) + regenHp));
            a.lastMantraCombatProc = { t: W.t, kind: 'EVERGREEN_SPRING_HEAL', textTh: '🌿 น้ำพุพฤกษาฟื้นฟูชีพจร!', healedHp: regenHp };
          } else if (amr.archetypeId === 'SWORD_QI_MERIDIAN') {
            dmg = Math.round(dmg * (1 + (amr.spec.combatPenBonusPct || 0.18) * 0.5) * stMult);
          }
          a.mantraState.totalCombatProcs = (a.mantraState.totalCombatProcs || 0) + 1;
        }
      }
      // 2. Defender Mantra Dharma Protection & Counter-Reaction
      if (d && !d.foe && d.cult && d.mantraState) {
        const dmr = CULT.MANTRA_SYSTEM.resolveNpcMantra(W, d);
        if (dmr) {
          if (dmr.archetypeId === 'VAJRA_IMMORTAL_BODY_BELL') {
            const red = dmr.spec.combatDamageRedPct || 0.22;
            const refDmg = Math.max(1, Math.round(dmg * (dmr.spec.combatReflectPct || 0.16)));
            dmg = Math.max(1, Math.round(dmg * (1 - red)));
            d.lastMantraCombatProc = { t: W.t, kind: 'VAJRA_BELL_REFLECT', textTh: '🔔 ระฆังทองวัชระสะท้อนศึก!', reflected: refDmg };
            if (a && C.alive(a)) C.applyDamage(W, f, d, a, refDmg, 'สะท้อนคัมภีร์ปราณ');
          } else if (dmr.archetypeId === 'ABYSSAL_FROST_MIRROR') {
            dmg = Math.max(1, Math.round(dmg * (1 - (dmr.spec.combatDamageRedPct || 0.15))));
            d.lastMantraCombatProc = { t: W.t, kind: 'FROST_MIRROR_SHIELD', textTh: '❄️ เกราะกระจกเหมันต์คุ้มกาย!' };
          } else if (dmr.archetypeId === 'SWORD_QI_MERIDIAN' && a && C.alive(a)) {
            const counterDmg = Math.max(1, Math.round(dmg * (dmr.spec.combatCounterSlashPct || 0.12)));
            d.lastMantraCombatProc = { t: W.t, kind: 'SWORD_QI_COUNTER', textTh: '🗡️ ปราณกระบี่คุ้มกายสวนกลับ!', counterDmg, targetX: a ? a.x : d.x, targetY: a ? a.y : d.y, originX: d.x, originY: d.y };
            C.applyDamage(W, f, d, a, counterDmg, 'สะท้อนคัมภีร์ปราณ');
          } else if (dmr.archetypeId === 'PRIMORDIAL_YANG_FURNACE' && a && C.alive(a)) {
            const burnBack = Math.max(1, Math.round(dmg * (dmr.spec.combatBacklashPct || 0.08)));
            C.applyDamage(W, f, d, a, burnBack, 'สะท้อนคัมภีร์ปราณ');
          }
          d.mantraState.totalCombatProcs = (d.mantraState.totalCombatProcs || 0) + 1;
        }
      }
      // 3. Grand Sect Formation Warfare Stance Bonuses (Sect defenders only: side A or non-hostile)
      if (W && W.sect && W.sect.formationWarfare) {
        const fwStance = W.sect.formationWarfare.activeStance;
        const aIsSectSide = !!(a && !a.foe && (!f || !C.sideOf(f, a.id) || (C.sideOf(f, a.id) === 'A' && f.kind !== 'duel' && f.kind !== 'spar' && f.kind !== 'tourney')));
        const dIsSectSide = !!(d && !d.foe && (!f || !C.sideOf(f, d.id) || (C.sideOf(f, d.id) === 'A' && f.kind !== 'duel' && f.kind !== 'spar' && f.kind !== 'tourney')));
        if (fwStance === 'SWORD_NET_SLAUGHTER' && aIsSectSide) {
          dmg = Math.round(dmg * 1.22);
        }
        if (fwStance === 'IMMORTAL_AEGIS_DOME' && dIsSectSide) {
          dmg = Math.max(1, Math.round(dmg * 0.78));
        }
      }
    }
    // Patch v5.6.0: Defensive Kungfu & Protective Aegis (CULT.DEFENSIVE_ARTS)
    if (dmg > 0 && note !== 'สะท้อนคัมภีร์ปราณ' && note !== 'สะท้อนวิชาคุ้มกาย' && CULT && CULT.DEFENSIVE_ARTS && d && !d.foe) {
      // A. Check if a nearby ally with CELESTIAL_AEGIS_DOME / FORTRESS_BASTION_LOCK intercepts part of the damage
      if (W && W._hasActiveDefSupportAura && Array.isArray(W.npcs)) {
        for (let i = 0; i < W.npcs.length; i++) {
          const guardian = W.npcs[i];
          if (!guardian || !C.alive(guardian) || guardian.away || guardian.id === d.id || !guardian.defensiveArtState || !guardian.cult) continue;
          if (f && (!C.sideOf(f, guardian.id) || !C.isAlly(f, guardian.id, d.id))) continue;
          if (C.hp(guardian) <= Math.max(2, Math.round(C.hpMax(guardian) * 0.15))) continue;
          const gSt = guardian.defensiveArtState;
          if (gSt._lastAegisInterceptTick != null && W.t != null && W.t < gSt._lastAegisInterceptTick + 2) continue;
          const gDef = CULT.DEFENSIVE_ARTS.resolveNpcDefense(W, guardian);
          if (gDef && gDef.allyInterceptActive && gDef.qiSufficient !== false && Math.hypot((guardian.x || 0) - (d.x || 0), (guardian.y || 0) - (d.y || 0)) <= gDef.allyInterceptRadius) {
            const interceptAmt = Math.max(1, Math.round(dmg * gDef.allyInterceptPct));
            const guardianCost = Math.max(1, Math.round(interceptAmt * 0.5));
            if (C.hp(guardian) <= guardianCost) continue;
            dmg = Math.max(1, dmg - interceptAmt);
            C.setHp(guardian, C.hp(guardian) - guardianCost);
            if (guardian.h && guardian.h.state && gDef.qiPerHit > 0) {
              guardian.h.state.qi = Math.max(0, (guardian.h.state.qi || 0) - gDef.qiPerHit);
            }
            gSt._lastAegisInterceptTick = (W && W.t) || 0;
            gSt.totalAllyIntercepts = (gSt.totalAllyIntercepts || 0) + 1;
            guardian.lastDefensiveArtProc = { t: W.t, kind: 'ALLY_AEGIS_INTERCEPT', textTh: '👑 ม่านสวรรค์รับเคราะห์แทนสหาย!', protectedId: d.id, intercepted: interceptAmt, targetX: d.x, targetY: d.y, originX: guardian.x, originY: guardian.y };
            break;
          }
        }
      }
      // B. Defender's Own Defensive Kungfu Mitigation, Redirection, Counter-Slash & Cicada Molt
      if (d.defensiveArtState && d.cult) {
        const df = CULT.DEFENSIVE_ARTS.resolveNpcDefense(W, d);
        if (df && df.qiSufficient) {
          const dSt = d.defensiveArtState;
          const rawBefore = dmg;
          dmg = Math.max(1, Math.round(dmg * (1 - df.effDmgRedPct)));
          const mitigated = Math.max(0, rawBefore - dmg);
          dSt.totalDamageMitigated = (dSt.totalDamageMitigated || 0) + mitigated;

          // Deduct defensive Qi cost per hit
          if (d.h && d.h.state && df.qiPerHit > 0) {
            d.h.state.qi = Math.max(0, (d.h.state.qi || 0) - df.qiPerHit);
          }

          // Taiji Soft Redirection (ยืมแรงสะท้อนกลับ + ฟื้นฟูปราณ)
          if (df.effRedirectPct > 0 && a && C.alive(a)) {
            const redirDmg = Math.max(1, Math.round(rawBefore * df.effRedirectPct));
            dSt.totalDamageRedirected = (dSt.totalDamageRedirected || 0) + redirDmg;
            if (d.h && d.h.state && df.spec.qiRestoreOnHit) {
              d.h.state.qi = Math.min(CULT.qiMax(d), (d.h.state.qi || 0) + df.spec.qiRestoreOnHit);
            }
            d.lastDefensiveArtProc = { t: W.t, kind: 'TAIJI_REDIRECT', textTh: '☯️ ปราณอ่อนยืมแรงสะท้อนกลับ!', redirected: redirDmg, targetX: a ? a.x : d.x, targetY: a ? a.y : d.y, originX: d.x, originY: d.y };
            C.applyDamage(W, f, d, a, redirDmg, 'สะท้อนวิชาคุ้มกาย');
          } else if (df.effCounterPct > 0 && a && C.alive(a)) {
            // Sword Curtain Ward / Elemental Thorn Armor / Iron Vajra Counter
            const cntDmg = Math.max(1, Math.round(rawBefore * df.effCounterPct));
            dSt.totalDamageRedirected = (dSt.totalDamageRedirected || 0) + cntDmg;
            d.lastDefensiveArtProc = { t: W.t, kind: df.archetypeId + '_COUNTER', textTh: df.spec.icon + ' ' + df.spec.shortTh + 'สวนกลับ!', counterDmg: cntDmg, targetX: a ? a.x : d.x, targetY: a ? a.y : d.y, originX: d.x, originY: d.y };
            C.applyDamage(W, f, d, a, cntDmg, 'สะท้อนวิชาคุ้มกาย');
          }

          // Mirage Cicada Shell (จักจั่นลอกคราบเร้นเงา เมื่อเลือดจะลดต่ำกว่า 25%)
          const fightIdNow = (f && f.id) || 1;
          if (df.archetypeId === 'MIRAGE_CICADA_SHELL' && dSt.cicadaMoltUsedFightId !== fightIdNow && (C.hp(d) - dmg) <= C.hpMax(d) * 0.25) {
            dSt.cicadaMoltUsedFightId = fightIdNow;
            dmg = 0;
            const healMolt = Math.max(1, Math.round(C.hpMax(d) * (df.spec.cicadaMoltHealPct || 0.22)));
            C.setHp(d, Math.min(C.hpMax(d), C.hp(d) + healMolt));
            d.lastDefensiveArtProc = { t: W.t, kind: 'CICADA_MOLT_SAVE', textTh: '🦋 จักจั่นทองลอกคราบเร้นเงา!', healedHp: healMolt };
          }
        }
      }
    }
    // Patch v5.7.0: Support & Auxiliary Arts Battlefield Aura (CULT.SUPPORT_ARTS)
    if (dmg > 0 && note !== 'สะท้อนคัมภีร์ปราณ' && note !== 'สะท้อนวิชาคุ้มกาย' && CULT && CULT.SUPPORT_ARTS && W && (W._hasActiveDefSupportAura || (a && a.supportState) || (d && d.supportState)) && Array.isArray(W.npcs)) {
      // 1. Check if attacker `a` is buffed by own or nearby ally's Support Art (Qimen Banner / Zither Melody)
      if (a && !a.foe) {
        for (let i = 0; i < W.npcs.length; i++) {
          const supNpc = W.npcs[i];
          if (!supNpc || supNpc.dead || supNpc.away || !supNpc.supportState || !supNpc.cult) continue;
          if (f && supNpc.id !== a.id && (!C.sideOf(f, supNpc.id) || !C.isAlly(f, supNpc.id, a.id))) continue;
          const sup = CULT.SUPPORT_ARTS.resolveNpcSupport(W, supNpc);
          if (sup && Math.hypot((supNpc.x || 0) - (a.x || 0), (supNpc.y || 0) - (a.y || 0)) <= sup.auraRadius) {
            dmg = Math.round(dmg * (1 + sup.effAtkBonusPct));
            supNpc.supportState.totalCommandBuffs = (supNpc.supportState.totalCommandBuffs || 0) + 1;
            supNpc.lastSupportArtProc = { t: W.t, kind: sup.archetypeId + '_BUFF', textTh: sup.spec.icon + ' ' + sup.spec.shortTh + 'หนุนศึก!' };
            break;
          }
        }
      }
      // 2. Check if defender `d` is protected/healed by own or nearby ally's Support Art (Acupoint Therapy / Bodhi Sanctuary / Alchemical Mist)
      if (d && !d.foe) {
        for (let i = 0; i < W.npcs.length; i++) {
          const supNpc = W.npcs[i];
          if (!supNpc || supNpc.dead || supNpc.away || !supNpc.supportState || !supNpc.cult) continue;
          if (f && supNpc.id !== d.id && (!C.sideOf(f, supNpc.id) || !C.isAlly(f, supNpc.id, d.id))) continue;
          const sup = CULT.SUPPORT_ARTS.resolveNpcSupport(W, supNpc);
          if (sup && Math.hypot((supNpc.x || 0) - (d.x || 0), (supNpc.y || 0) - (d.y || 0)) <= sup.auraRadius) {
            dmg = Math.max(1, Math.round(dmg * (1 - sup.effDefBonusPct)));
            const nowT = (W && W.t) || 0;
            supNpc._supHealIcd = supNpc._supHealIcd || {};
            const canHealNow = (!supNpc._supHealIcd[d.id] || nowT >= supNpc._supHealIcd[d.id]) && (!supNpc.h || !supNpc.h.state || (supNpc.h.state.qi || 0) >= 2 || supNpc.cult.path === 'SHADOW_SAMURAI');
            if (canHealNow) {
              supNpc._supHealIcd[d.id] = nowT + 2;
              if (supNpc.h && supNpc.h.state && supNpc.cult.path !== 'SHADOW_SAMURAI') {
                supNpc.h.state.qi = Math.max(0, (supNpc.h.state.qi || 0) - 2);
              }
              const healAmt = Math.max(1, Math.round(C.hpMax(d) * sup.effHealPct));
              C.setHp(d, Math.min(C.hpMax(d), C.hp(d) + healAmt));
              supNpc.supportState.totalAlliesHealed = (supNpc.supportState.totalAlliesHealed || 0) + healAmt;
              supNpc.lastSupportArtProc = { t: nowT, kind: sup.archetypeId + '_HEAL', textTh: sup.spec.icon + ' ' + sup.spec.shortTh + 'สมานชีพ!', healedHp: healAmt };
            }
            break;
          }
        }
      }
    }
    // Patch v5.8.0 [Pillar 1, 2 & 4]: Forbidden Arts Blood-Sacrifice Surge, Desperation Nova & Passive Constellation Bonuses
    if (dmg > 0 && note !== 'สะท้อนคัมภีร์ปราณ' && note !== 'สะท้อนวิชาคุ้มกาย' && note !== 'ระเบิดมหาวิชาต้องห้าม' && CULT) {
      // 1. Attacker Passive Constellation Bonus
      if (a && !a.foe && a.passiveResonanceState && CULT.PASSIVE_RESONANCE) {
        const pr = CULT.PASSIVE_RESONANCE.resolveNpcConstellation(W, a);
        if (pr && pr.atkBonusPct > 0) dmg = Math.round(dmg * (1 + pr.atkBonusPct));
      }
      // 2. Defender Passive Constellation Mitigation
      if (d && !d.foe && d.passiveResonanceState && CULT.PASSIVE_RESONANCE) {
        const prD = CULT.PASSIVE_RESONANCE.resolveNpcConstellation(W, d);
        if (prD && prD.dmgRedPct > 0) dmg = Math.max(1, Math.round(dmg * (1 - prD.dmgRedPct)));
      }
      // 3. Attacker Unsealed Forbidden Art Surge & Blood Sacrifice
      if (a && !a.foe && a.forbiddenArtState && a.cult && CULT.FORBIDDEN_ARTS) {
        const fb = CULT.FORBIDDEN_ARTS.resolveNpcForbidden(W, a);
        if (fb && fb.isUnsealed) {
          if (a.voluntaryVows && a.voluntaryVows.VOW_ASCETIC_PRECEPT && a.voluntaryVows.VOW_ASCETIC_PRECEPT.active && CULT.VOLUNTARY_VOWS && CULT.VOLUNTARY_VOWS.violateVow) {
            CULT.VOLUNTARY_VOWS.violateVow(W, a, 'VOW_ASCETIC_PRECEPT', 'โคจรปราณวิชาต้องห้ามในการต่อสู้');
          }
          const fSt = a.forbiddenArtState;
          dmg = Math.round(dmg * (1 + fb.effAtkBonusPct));
          const hpCost = Math.max(1, Math.round(C.hpMax(a) * fb.effHpCostPct));
          if (C.hp(a) > hpCost + 5) {
            C.setHp(a, C.hp(a) - hpCost);
            fSt.totalBloodSacrificed = (fSt.totalBloodSacrificed || 0) + hpCost;
          }
          fSt.totalTabooStrikes = (fSt.totalTabooStrikes || 0) + 1;
          fSt.tabooStrain = Math.min(100, +((fSt.tabooStrain || 0) + (fb.sealSpec.strainRate || 0.2)).toFixed(2));
          if (fb.archetypeId === 'SOUL_DEVOURING_ABYSS') {
            const devourHp = Math.max(1, Math.round(dmg * (fb.spec.lifestealPct || 0.24)));
            const devourQi = Math.max(1, Math.round(dmg * (fb.spec.qistealPct || 0.28)));
            C.setHp(a, Math.min(C.hpMax(a), C.hp(a) + devourHp));
            if (a.h && a.h.state) a.h.state.qi = Math.min(CULT.qiMax(a), (a.h.state.qi || 0) + devourQi);
            fSt.totalSoulsDevoured = (fSt.totalSoulsDevoured || 0) + 1;
          }
          a.lastForbiddenArtProc = { t: W.t, kind: fb.archetypeId + '_STRIKE', textTh: fb.spec.icon + ' สำแดง' + fb.spec.shortTh + '!', targetX: d ? d.x : a.x, targetY: d ? d.y : a.y, originX: a.x, originY: a.y };
        }
      }
      // Patch v2.2.0: Shadow Clone 1-HP Decoy Interception, Substitution Log Swap, Samurai Parry Counter & Bone Armor
      if (d && dmg > 0 && note !== 'สะท้อนคมดาบอิไอ') {
        const ST = STs();
        // 1) SHADOW_CLONE (ร่างแยกเงามายา 1 HP รับดาเมจแทนตัวจริงก่อนเสมอ)
        if ((d._shadowClones && d._shadowClones > 0) || (ST.hasBuff && ST.hasBuff(d, 'shadowClone', W.t)) || (ST.has && ST.has(d, 'shadowClone'))) {
          if (d._shadowClones && d._shadowClones > 0) d._shadowClones--;
          if (!d._shadowClones) {
            if (ST.clearBuff) ST.clearBuff(d, 'shadowClone');
            if (ST.clearStatus) ST.clearStatus(d, x => x.k === 'shadowClone');
          }
          d.lastShadowCloneIntercept = { t: W.t, negatedDmg: dmg };
          d.fx = { t: W.t, text: '👥 ร่างแยกเงารับดาเมจแทน!' };
          return 0;
        }
        // 2) BONE_ARMOR (เกราะกระดูกวิญญาณ ดูดซับดาเมจกายภาพ 25% Max HP)
        if ((ST.hasBuff && ST.hasBuff(d, 'boneArmor', W.t)) || (ST.has && ST.has(d, 'boneArmor'))) {
          if (d._boneArmorHp == null) d._boneArmorHp = Math.max(15, Math.round(C.hpMax(d) * 0.25));
          if (d._boneArmorHp > 0) {
            const absorbed = Math.min(dmg, d._boneArmorHp);
            d._boneArmorHp -= absorbed;
            dmg = Math.max(1, dmg - absorbed);
            if (d._boneArmorHp <= 0) {
              if (ST.clearBuff) ST.clearBuff(d, 'boneArmor');
              if (ST.clearStatus) ST.clearStatus(d, x => x.k === 'boneArmor');
            }
          }
        }
        // 3) PARRY_COUNTER (ปัดป้องสะท้อนคม ซามูไรไร้เงาสวนกลับด้วยคริติคอล)
        if (((ST.hasBuff && ST.hasBuff(d, 'parryCounter', W.t)) || (ST.has && ST.has(d, 'parryCounter'))) && a && C.alive(a)) {
          dmg = Math.max(1, Math.round(dmg * 0.50));
          const sd = ST.get(d);
          const counterDmg = Math.max(12, Math.round((sd.atk || 50) * 0.48));
          if (ST.clearBuff) ST.clearBuff(d, 'parryCounter');
          if (ST.clearStatus) ST.clearStatus(d, x => x.k === 'parryCounter');
          d.lastParryCounter = { t: W.t, counterDmg, targetX: a ? a.x : d.x, targetY: a ? a.y : d.y, originX: d.x, originY: d.y };
          d.fx = { t: W.t, text: '⚔️ อิไอปัดป้องสะท้อนคม!' };
          C.applyDamage(W, f, d, a, counterDmg, 'สะท้อนคมดาบอิไอ');
        }
        // 4) SUBSTITUTION (สลับร่างท่อนไม้ เมื่อได้รับความเสียหายถึงตาย)
        if ((C.hp(d) - dmg) <= 0) {
          const fightIdSub = (f && f.id) || 1;
          const hasSubBuff = (ST.hasBuff && ST.hasBuff(d, 'substitutionReady', W.t)) || (ST.has && ST.has(d, 'substitutionReady')) || (d.cult && d.cult.sub === 'SUBSTITUTION_ESCAPE');
          if (hasSubBuff && d._substitutionUsedFightId !== fightIdSub) {
            d._substitutionUsedFightId = fightIdSub;
            dmg = 0;
            const subHeal = Math.max(10, Math.round(C.hpMax(d) * 0.25));
            C.setHp(d, Math.min(C.hpMax(d), Math.max(1, C.hp(d)) + subHeal));
            if (ST.clearBuff) ST.clearBuff(d, 'substitutionReady');
            if (ST.clearStatus) ST.clearStatus(d, x => x.k === 'substitutionReady');
            d.lastSubstitutionSave = { t: W.t, healedHp: subHeal };
            d.fx = { t: W.t, text: '🪵 สลับร่างท่อนไม้หนีตาย!' };
            return 0;
          }
        }
      }
      // 4. Defender Cataclysmic Taboo Desperation Nova (when BLOOD_TABOO_UNLEASHED and HP drops below 30%)
      if (d && !d.foe && d.forbiddenArtState && d.cult && CULT.FORBIDDEN_ARTS) {
        const dfb = CULT.FORBIDDEN_ARTS.resolveNpcForbidden(W, d);
        const fStD = d.forbiddenArtState;
        const fightIdNow = (f && f.id) || 1;
        if (dfb && dfb.isFullTaboo && fStD.desperationNovaUsedFightId !== fightIdNow && (C.hp(d) - dmg) <= C.hpMax(d) * 0.30) {
          fStD.desperationNovaUsedFightId = fightIdNow;
          fStD.totalDesperationNovas = (fStD.totalDesperationNovas || 0) + 1;
          dmg = Math.max(1, Math.round(dmg * 0.35)); // Absorbs 65% of the lethal blow in a blood-void explosion!
          const novaHeal = Math.max(1, Math.round(C.hpMax(d) * 0.25));
          C.setHp(d, Math.min(C.hpMax(d), C.hp(d) + novaHeal));
          const novaDmg = Math.max(15, Math.round(C.hpMax(d) * (dfb.spec.desperationNovaMult || 0.40)));
          d.lastForbiddenArtProc = { t: W.t, kind: 'TABOO_DESPERATION_NOVA', textTh: '🌑 ระเบิดมหาวิชาต้องห้ามฝืนชะตาสวรรค์!', novaDmg, healedHp: novaHeal };
          if (a && C.alive(a)) {
            C.applyDamage(W, f, d, a, novaDmg, 'ระเบิดมหาวิชาต้องห้าม');
          }
        }
      }
    }
    if (f && f.kind === 'raid' && !d.foe && (!C.sideOf(f, d.id) || C.sideOf(f, d.id) === 'A') && W && W.sect && W.sect.elementalBarrier && W.sect.elementalBarrier.active && W.sect.elementalBarrier.barrierHp > 0 && dmg > 0) {
      const bar = W.sect.elementalBarrier;
      const absDmg = Math.min(bar.barrierHp, Math.max(1, Math.round(dmg * (bar.absorbRatio || 0.35))));
      bar.barrierHp = Math.max(0, bar.barrierHp - absDmg);
      bar.totalAbsorbed = (bar.totalAbsorbed || 0) + absDmg;
      dmg = Math.max(1, dmg - absDmg);
      d.lastBarrierAbsorb = { t: W.t, absorbed: absDmg, remainingBarrierHp: bar.barrierHp };
      if (bar.barrierHp <= 0) bar.active = false;
    }
    if (!d.foe && dmg > 0 && g.CULT && g.CULT.gainPathGauge) {
      const pSpec = g.CULT.PATH_GAUGES && d.cult ? g.CULT.PATH_GAUGES[d.cult.path] : null;
      g.CULT.gainPathGauge(d, (pSpec && pSpec.gainOnHurt) || 15);
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
    const fTac = f ? C.ensureFightTac(f, W.t) : null;
    if (hp <= hm * 0.15 && !d.foe && d.pets && d.pets.length && CULT.activePets) {
      f._phoenixRebirthUsed = f._phoenixRebirthUsed || (fTac ? fTac.phoenixRebirthUsed : {});
      const usedMap = fTac ? fTac.phoenixRebirthUsed : f._phoenixRebirthUsed;
      const phoenixPet = !usedMap[d.id] && !f._phoenixRebirthUsed[d.id] && CULT.activePets(d).find(pt => pt && (pt.fourSymbol === 'VERMILION_PHOENIX' || pt.bloodlineTrait === 'VERMILION_PHOENIX'));
      if (phoenixPet) {
        usedMap[d.id] = true; f._phoenixRebirthUsed[d.id] = true;
        hp = Math.max(Math.round(hm * 0.42), hp);
        STs().addStatus(d, 'shield', 12, { amt: Math.round(hm * 0.25) }, W.t);
        STs().clearStatus(d, x => ['burn', 'bleed', 'poison'].includes(x.k));
        d.fx = { t: W.t, text: '🔥 เพลิงนิพพานหงส์ชาดคุ้มชีพ!' };
        d.lastPhoenixRebirth = { t: W.t, petId: phoenixPet.uid || phoenixPet.id, fightId: f ? f.id : 0 };
        STs().dirty(d);
      }
    }
    if (hp <= hm * 0.12 && !d.foe && d.cult && d.cult.path === 'MECH_PUPPET' && CULT.ensureMechState) {
      f._mechDecoyUsed = f._mechDecoyUsed || (fTac ? fTac.mechDecoyUsed : {});
      const usedMap = fTac ? fTac.mechDecoyUsed : f._mechDecoyUsed;
      const ms = CULT.ensureMechState(d);
      if (!usedMap[d.id] && !f._mechDecoyUsed[d.id] && (d.cult.sub === 'SOUL_VESSEL_AVATAR' || ms.decoyAvailable || ms.vesselDecoyReady || (d.cult.techs && (d.cult.techs.includes('ART_MECH_PUPPET_005') || d.cult.techs.includes('ART_MECH_PUP_005')))) && ms.integrity >= 25) {
        usedMap[d.id] = true; f._mechDecoyUsed[d.id] = true;
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
    if (hp <= 0 && (f.serious || d._phoenixClauseReady || STs().has(d, 'phoenixCovenant', W.t)) && (STs().has(d, 'phoenixCovenant', W.t) || (STs().hasBuff && STs().hasBuff(d, 'phoenixCovenant', W.t)) || d._phoenixClauseReady)) {
      f._phoenixClauseUsed = f._phoenixClauseUsed || (fTac ? fTac.phoenixClauseUsed : {});
      const usedMap = fTac ? fTac.phoenixClauseUsed : f._phoenixClauseUsed;
      if (!usedMap[d.id] && !f._phoenixClauseUsed[d.id]) {
        usedMap[d.id] = true; f._phoenixClauseUsed[d.id] = true;
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
      const ch = d.act.ctx.channeling;
      if (ch.isChargedSkill && Number.isFinite(ch.poiseShield)) {
        ch.poiseShield = Math.max(0, ch.poiseShield - Math.max(10, Math.round(dmg)));
        if (ch.poiseShield <= 0) {
          C.interruptChannel(W, f, d, 'เกราะปราณชาร์จวิชาถูกทำลาย', a);
        }
      } else if (dmg >= hm * 0.12) {
        C.interruptChannel(W, f, d, 'ถูกโจมตีหนัก', a);
      }
    }
    if (!d.foe) { d.lastHurtBy = a ? a.id : d.lastHurtBy; d.h.state.stress += 0.8; d.h.state.fear = clamp(d.h.state.fear + 1.5 * (1 - E(d, 'personality.courage') / 130), 0, 100); HC.trainBody(d, 'toughness', 0.15); if (W.rng.chance(0.02 * (dmg / hm * 10))) AI.injure(W, d, hp < hm * .3 ? 2 : 1, 'บาดแผลจากการต่อสู้'); }
    if (hp <= 0 && !d.isSummon) {
      const kwDef = C.keywordsOf ? C.keywordsOf(d) : null;
      const fId = (f && f.id) || 1;
      if (kwDef && kwDef.lastBreath && d._lastBreathUsedFightId !== fId) {
        d._lastBreathUsedFightId = fId;
        hp = 1;
        STs().addStatus(d, 'shield', 10, { amt: Math.max(15, Math.round(hm * 0.22)) }, W.t);
        if (!d.foe && d.h && d.h.state) {
          d.h.state.heartDemon = clamp((d.h.state.heartDemon || 0) + 10, 0, 100);
        }
        d.fx = { t: W.t, text: '🩸 ปราการเฮือกสุดท้ายฝืนชะตา!' };
        d.lastBreathTriggered = { t: W.t, fightId: fId, shieldAmt: Math.max(15, Math.round(hm * 0.22)) };
      }
    }
    if (hp <= 0) {
      if (d.isSummon) {
        C.setHp(d, 0); d.dead = true; d.gone = true;
        d.fx = { t: W.t, text: '💨 สลายร่าง' };
        return true;
      }
      if (nonlethal || (!d.foe && !f.serious)) { hp = Math.max(1, hm * 0.04); d.yield = true; }
      else if (f && f.kind === 'wild' && !d.foe && !(a && a.legendary) && ((d.inj ? d.inj.length : 0) < 3)) {
        hp = Math.max(1, Math.round(hm * 0.06));
        C.setHp(d, hp);
        d.fled = true; d.run = true; f.fled = true;
        d.fx = { t: W.t, text: 'ล่าถอย!' };
        AI.injure(W, d, 2, 'บาดเจ็บสาหัสจากการล่าอสูร');
        AI.mem(W, d, 'บาดเจ็บหนักต้องล่าถอยจากการล่าอสูร', 0.6);
        HC.experience(d, 'near_death', 0.5);
        return false;
      }
      else { C.setHp(d, 0); C.slay(W, f, (a && a !== d) ? a : null, d); return true; }
    }
    C.setHp(d, hp);
    const ratio = hp / hm;
    if (ratio < (nonlethal ? yieldThreshold(d) : fleeThreshold(d)) && !d.yield && !d.fled) {
      if (nonlethal) d.yield = true; else if (W.rng.chance(d.foe ? 0.7 : 0.5)) {
        d.fled = true; d.fx = { t: W.t, text: 'ถอย!' };
        if (!d.foe) {
          d.run = true; AI.mem(W, d, 'ถอยหนีจากการต่อสู้', 0.5); HC.experience(d, 'near_death', 0.4);
          if (d.voluntaryVows && d.voluntaryVows.VOW_NO_RETREAT && g.CULT && g.CULT.VOLUNTARY_VOWS && g.CULT.VOLUNTARY_VOWS.violateVow) {
            g.CULT.VOLUNTARY_VOWS.violateVow(W, d, 'VOW_NO_RETREAT', 'ถอยหนีจากการต่อสู้ขณะถือสัตย์ห้ามถอย');
          }
        }
      }
    }
    return false;
  };
  /* ---------- Patch v3.0.0: Active Defensive Interception (LoS Bodyblock & Bodyguard Cover Dash) ---------- */
  C.resolveDefensiveInterception = (W, f, a, d, o) => {
    if (!W || !f || !a || !d || !C.alive(a) || !C.alive(d)) return null;
    if (o && (o.noIntercept || o.forced || o.isPetAssist || o.noProc)) return null;
    // AoE skills hit multiple targets directly; single-target or line-of-fire skills can be intercepted
    if (o && o.isAoeMultiTarget && (!o.moveSpec || o.moveSpec.shape !== 'LINE')) return null;
    const tNow = (W && W.t != null) ? W.t : 0;
    const moveSpec = (o && o.moveSpec) || ((o && o.skill && SKs() && SKs().resolveMoveSpatialSpec) ? SKs().resolveMoveSpatialSpec(o.skill, a) : { requiresLoS: C.unitDist(a, d) >= 2.2 });

    // 0. Check Row / Bodyblock Grid (C03: FRONT_ROW blocks melee attacks targeting BACK_ROW)
    if (C.resolveRowBodyblock && f && f.rows) {
      const rowBlk = C.resolveRowBodyblock(W, f, a, d, o);
      if (rowBlk && rowBlk.interceptor && C.alive(rowBlk.interceptor)) {
        return rowBlk;
      }
    }
    // 1. Check Line-of-Sight Bodyblock (Tank standing in line of fire for ranged/line attack)
    if (moveSpec.requiresLoS && C.unitDist(a, d) >= 2.0) {
      const los = C.checkLineOfSight(W, f, a, d, moveSpec);
      if (los.blockerUnit && C.alive(los.blockerUnit) && los.blockerUnit.id !== d.id) {
        const blk = los.blockerUnit;
        const bTac = C.ensureUnitTac(blk);
        bTac.reactionReadyAt = tNow + 8;
        bTac.coveringAllyId = d.id;
        bTac.interceptCount = (bTac.interceptCount || 0) + 1;
        if (!blk.foe && C.ACTION_MASTERY_TRAITS) C.ACTION_MASTERY_TRAITS.recordAction(W, blk, 'coverCount', 1);
    if (!blk.foe && g.CULT && g.CULT.EXPERIENCE_TRAITS && g.CULT.EXPERIENCE_TRAITS.recordExperienceEvent) {
      g.CULT.EXPERIENCE_TRAITS.recordExperienceEvent(W, blk, 'PROTECTED_SECLUSION_OR_ALLY', 'tick:' + W.t + ':' + a.id + ':' + d.id);
    }
        const ft = C.ensureFightTac(f, tNow);
        ft.stats.losBlocks = (ft.stats.losBlocks || 0) + 1;
        ft.stats.intercepts = (ft.stats.intercepts || 0) + 1;
        const reasonTh = C.name(blk) + ' ยืนขวางแนวยิง รับการโจมตีแทน ' + C.name(d);
        blk.fx = { t: tNow, text: '🛡️ ขวางแนวยิง!' };
        blk.lastInterceptEvent = { t: tNow, kind: 'LOS_COVER', protectedId: d.id, attackerId: a.id, reasonTh };
        C.recordTacticalHighlight(W, f, 'LOS_COVER', reasonTh, {
          actorId: a.id, targetId: d.id, protectorId: blk.id
        });
        if (hpFrac(d) < 0.25 && !blk.foe && !d.foe && g.SECT && g.SECT.DESTINY_KARMA && g.SECT.DESTINY_KARMA.bindThread) {
          g.SECT.DESTINY_KARMA.bindThread(W, blk, d, 'GOLD_THREAD', C.name(blk) + ' ยืนขวางแนวยิงช่วยชีวิต ' + C.name(d) + ' ยามวิกฤต');
        }
        let losDmgMult = 0.78;
        if (!blk.foe && W.sect && W.sect.vanguardPosture === 'IRON_SHIELD_WALL') {
          losDmgMult = 0.65;
        }
        return { interceptor: blk, kind: 'LOS_COVER', dmgMult: losDmgMult, reasonTh, interceptCap: 0.85, interceptChance: 0.85 };
      }
    }

    // 2. Check Active Bodyguard Dash (Protector dashes in to shield vulnerable/low-HP/bonded ally)
    const dHpFrac = hpFrac(d);
    const dRole = C.inferCombatRole ? C.inferCombatRole(d) : 'FIGHTER';
    const needsCover = dHpFrac <= 0.60 || dRole === 'HEALER' || dRole === 'CASTER' || (d.act && d.act.ctx && d.act.ctx.channeling);
    if (!needsCover) return null;

    const allies = C.alliesOf(W, f, d.id).filter(u => u && u.id !== d.id && C.alive(u) && C.canUnitIntercept(W, f, u));
    if (!allies.length) return null;

    let bestGuard = null, bestScore = 0;
    for (const al of allies) {
      const distToAlly = C.unitDist(al, d);
      if (distToAlly > 2.85) continue;
      if (hpFrac(al) < dHpFrac - 0.05) continue;
      const alRole = C.inferCombatRole ? C.inferCombatRole(al) : 'FIGHTER';
      const wp = (SKs() && SKs().weaponTacticalProfile) ? SKs().weaponTacticalProfile(al) : null;
      let sc = 0;
      if (alRole === 'TANK' || (wp && (wp.reachClass === 'HEAVY_BREAKER' || wp.reachClass === 'LONG_POLEARM' || wp.hasDefenseTech))) sc += 1.8;
      if (al.isGateBeast && (al.fourSymbol === 'BLACK_TORTOISE' || al.bloodlineTrait === 'IRON_CARAPACE')) sc += 2.2;
      if (al.isSwornAlly) sc += 1.6;
      // Check personal bond (companion, mentor/disciple, destiny thread, high loyalty/affection)
      let bondLabel = 'สหายร่วมรบ';
      if (!al.foe && !d.foe) {
        if (W.sect && W.sect.vanguardInterceptBonus) {
          sc += (W.sect.vanguardInterceptBonus || 0) * 5.0;
        }
        if (al.companionId === d.id) { sc += 2.5; bondLabel = 'คู่บำเพ็ญ'; }
        else if (al.mentorId === d.id || al.mentor === d.id) { sc += 2.2; bondLabel = 'อาจารย์'; }
        else if (d.mentorId === al.id || d.mentor === al.id) { sc += 2.2; bondLabel = 'ศิษย์สายตรง'; }
        else if (Array.isArray(al.destinyThreads) && al.destinyThreads.some(th => th && (th.type === 'RED_THREAD' || th.type === 'GOLD_THREAD') && (th.aId === d.id || th.bId === d.id))) {
          sc += 2.0; bondLabel = 'ผู้มีด้ายชะตาผูกพัน';
        }
        const rel = SECT && SECT.rel ? SECT.rel(al, d.id) : null;
        if (rel && ((rel.a || 0) >= 30 || (rel.t || 0) >= 30)) sc += 1.0;
        sc += (E(al, 'personality.loyalty') - 45) / 80 + (E(al, 'personality.courage') - 45) / 90;
      }
      // Awakened Soul Weapon Avatar autonomous guard (Stage >= 3)
      if (!d.foe && d.weaponSoul && d.weaponSoul.stage >= 3) {
        sc += 0.5;
      }
      sc -= distToAlly * 0.35;
      const hasCompGuard = !al.foe && g.CULT && g.CULT.EXPERIENCE_TRAITS && g.CULT.EXPERIENCE_TRAITS.hasTrait && g.CULT.EXPERIENCE_TRAITS.hasTrait(al, 'EXP_TRAIT_COMPANION_GUARDIAN');
      const bbBonus = hasCompGuard ? ((g.CULT.EXPERIENCE_TRAITS.CATALOG && g.CULT.EXPERIENCE_TRAITS.CATALOG.EXP_TRAIT_COMPANION_GUARDIAN && g.CULT.EXPERIENCE_TRAITS.CATALOG.EXP_TRAIT_COMPANION_GUARDIAN.bodyblockBonusChance) || 0.15) : 0;
      if (hasCompGuard) sc += 0.65;
      const cappedChance = Math.min(0.85, clamp(sc / 4.2 + bbBonus, 0.15, 0.85));
      sc = Math.min(sc, 3.85);
      if (sc > bestScore && sc >= 1.35) {
        bestScore = sc;
        bestGuard = { unit: al, bondLabel, dist: distToAlly, interceptChance: cappedChance, sc };
      }
    }

    if (bestGuard) {
      const gUnit = bestGuard.unit;
      const gTac = C.ensureUnitTac(gUnit);
      gTac.reactionCharges = Math.max(0, (gTac.reactionCharges || 1) - 1);
      gTac.reactionReadyAt = tNow + 10;
      gTac.coveringAllyId = d.id;
      gTac.interceptCount = (gTac.interceptCount || 0) + 1;
      if (!gUnit.foe && C.ACTION_MASTERY_TRAITS) C.ACTION_MASTERY_TRAITS.recordAction(W, gUnit, 'coverCount', 1);
      if (!gUnit.foe && gUnit.h && gUnit.h.state) {
        gUnit.h.state.energy = Math.max(0, (gUnit.h.state.energy || 20) - 2.5);
      }
      // Move protector next to protected ally
      if (Number.isFinite(d.x) && Number.isFinite(a.x)) {
        const dx = a.x - d.x, dy = a.y - d.y, distAD = Math.max(0.1, Math.hypot(dx, dy));
        const proj = C.projectSafePosition(W, d.x, d.y, d.x + (dx / distAD) * 0.65, d.y + (dy / distAD) * 0.65);
        gUnit.x = proj.x;
        gUnit.y = proj.y;
      }
      // PROP-12: Bind GOLD_THREAD when rescuing a critically wounded ally (HP < 25%)
      if (dHpFrac < 0.25 && !gUnit.foe && !d.foe && g.SECT && g.SECT.DESTINY_KARMA && g.SECT.DESTINY_KARMA.bindThread) {
        g.SECT.DESTINY_KARMA.bindThread(W, gUnit, d, 'GOLD_THREAD', C.name(gUnit) + ' พุ่งเข้ารับคมศาสตราช่วยชีวิต ' + C.name(d) + ' ยามปางตาย');
      }
      const ft = C.ensureFightTac(f, tNow);
      ft.stats.intercepts = (ft.stats.intercepts || 0) + 1;
      const reasonTh = C.name(gUnit) + ' พุ่งเข้าขวางคมศาสตราคุ้มกัน' + bestGuard.bondLabel + ' ' + C.name(d);
      gUnit.fx = { t: tNow, text: '🛡️ คุ้มกัน ' + C.name(d) + '!' };
      gUnit.lastInterceptEvent = { t: tNow, kind: 'BODYGUARD_INTERCEPT', protectedId: d.id, attackerId: a.id, bondLabel: bestGuard.bondLabel, reasonTh, interceptChance: bestGuard.interceptChance };
      C.recordTacticalHighlight(W, f, 'BODYGUARD_INTERCEPT', reasonTh, {
        actorId: a.id, targetId: d.id, protectorId: gUnit.id, bondLabel: bestGuard.bondLabel
      });
      let dmgMult = 0.82;
      if (!gUnit.foe && W.sect && W.sect.vanguardPosture === 'IRON_SHIELD_WALL') {
        dmgMult = 0.70;
      }
      if (!gUnit.foe && g.CULT && g.CULT.EXPERIENCE_TRAITS && g.CULT.EXPERIENCE_TRAITS.hasTrait && g.CULT.EXPERIENCE_TRAITS.hasTrait(gUnit, 'EXP_TRAIT_COMPANION_GUARDIAN')) {
        dmgMult = +(dmgMult * 1.10).toFixed(3);
      }
      return { interceptor: gUnit, kind: 'BODYGUARD_INTERCEPT', dmgMult, reasonTh, interceptChance: bestGuard.interceptChance, interceptCap: 0.85 };
    }
    return null;
  };

  /* หนึ่งการโจมตี: o = {M, type:'p'|'m', pen, dotHalf, forced, noCounter, noProc, crit+} */
  C.tryTransferStatusOnParry = (W, defender, attacker) => {
    if (!defender || !attacker || defender.dead || !C.alive(attacker) || !Array.isArray(defender.sx)) return false;
    const kwDef = C.keywordsOf ? C.keywordsOf(defender) : EMPTY_KW_PROFILE;
    if (!kwDef.statusTransfer || (defender._statusTransferCd && W.t < defender._statusTransferCd)) return false;
    const ST = STs();
    const debuffIdx = defender.sx.findIndex(x => x && x.until > W.t && ['burn', 'bleed', 'poison', 'slow', 'weaken', 'blind', 'chill', 'curse', 'armorbreak', 'mdefbreak', 'exposed'].includes(x.k));
    if (debuffIdx < 0) return false;
    const moved = defender.sx.splice(debuffIdx, 1)[0];
    ST.dirty(defender);
    ST.addStatus(attacker, moved.k, Math.max(4, moved.until - W.t), { per: moved.per, src: defender.id }, W.t);
    defender._statusTransferCd = W.t + 10;
    defender.lastStatusTransfer = { t: W.t, status: moved.k, targetId: attacker.id, onParry: true };
    return true;
  };
  C.hit = C.strike = (W, f, a, d, o) => {
    o = o || {};
    let originalTarget = d;
    const moveSpecCheck = o.moveSpec || ((o.skill && SKs() && SKs().resolveMoveSpatialSpec) ? SKs().resolveMoveSpatialSpec(o.skill, a) : null);
    if (f && !o.forced && moveSpecCheck && moveSpecCheck.requiresLoS && !moveSpecCheck.ignoresObstacles && a && d && Number.isFinite(a.x) && Number.isFinite(d.x)) {
      const losCheck = C.checkLineOfSight(W, f, a, d, moveSpecCheck);
      if (losCheck.terrainBlocked) {
        a.fx = { t: W.t, text: '🧱 ติดสิ่งกีดขวาง!' };
        return { hit: false, terrainBlocked: true, actualReceiverId: d.id, originalTargetId: d.id };
      }
    }
    let interceptInfo = null;
    if (f && !f._inIntercept && !o.noIntercept && !o.isPetAssist) {
      f._inIntercept = true;
      try {
        interceptInfo = C.resolveDefensiveInterception(W, f, a, d, o);
        if (interceptInfo && interceptInfo.interceptor && C.alive(interceptInfo.interceptor)) {
          d = interceptInfo.interceptor;
          o = Object.assign({}, o, { M: (o.M || 1) * (interceptInfo.dmgMult || 0.82) });
        }
      } finally {
        f._inIntercept = false;
      }
    }
    const ST = STs(), sa = ST.get(a), sd = ST.get(d), nonlethal = !f.serious;
    const kwA = C.keywordsOf ? C.keywordsOf(a) : EMPTY_KW_PROFILE;
    const kwD = C.keywordsOf ? C.keywordsOf(d) : EMPTY_KW_PROFILE;
    const distAD = (Number.isFinite(a.x) && Number.isFinite(d.x)) ? Math.hypot(a.x - d.x, a.y - d.y) : 1.8;
    let mfStacks = 0;
    if (kwA.marksmanFocus && distAD >= 2.2) {
      const prevMf = a._marksmanFocus;
      const movedFar = prevMf && Number.isFinite(a.x) && Number.isFinite(prevMf.lastX) && Math.hypot(a.x - prevMf.lastX, a.y - prevMf.lastY) > 1.2;
      mfStacks = (prevMf && prevMf.targetId === d.id && !movedFar) ? Math.min(5, (prevMf.stacks || 1) + 1) : 1;
      a._marksmanFocus = { targetId: d.id, stacks: mfStacks, lastX: a.x, lastY: a.y, t: W.t };
    } else if (a._marksmanFocus && distAD < 2.2) {
      a._marksmanFocus = null;
    }
    const marksmanBonusAcc = mfStacks > 0 ? (6 + mfStacks * 2) : 0;
    const effectiveAcc = Math.max(1, sa.acc + (Number.isFinite(o.accAdd) ? o.accAdd : 0) + clamp((kwA.accAdd || 0) + marksmanBonusAcc, 0, 60));
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
        if (!d.foe && C.ACTION_MASTERY_TRAITS) C.ACTION_MASTERY_TRAITS.recordAction(W, d, 'parryCount', 1);
        C.tryTransferStatusOnParry(W, d, a);
        runPassiveProcs(W, f, d, a, 'onParry', 0);
        const parryBonusM = (!d.foe && C.ACTION_MASTERY_TRAITS && C.ACTION_MASTERY_TRAITS.hasTrait(d, 'TRAIT_PARRY_COUNTER')) ? 1.15 : 1.0;
        C.strike(W, f, d, a, { M: 1.45 * parryBonusM, type: 'm', pen: 25, forced: true, noCounter: true, noReflect: true, noProc: true });
        return { hit: false, countered: true, astralMirage: true };
      }
      const cs = ST.statusOf(d, 'counter');
      if (cs && !d.dead) {
        ST.clearStatus(d, x => x.k === 'counter');
        d._lastDodgeOrParryAt = W.t;
        d.fx = { t: W.t, text: '↩ ปัดสวน!' };
        if (!d.foe && C.ACTION_MASTERY_TRAITS) C.ACTION_MASTERY_TRAITS.recordAction(W, d, 'parryCount', 1);
        C.tryTransferStatusOnParry(W, d, a);
        runPassiveProcs(W, f, d, a, 'onParry', 0);
        const parryBonusM = (!d.foe && C.ACTION_MASTERY_TRAITS && C.ACTION_MASTERY_TRAITS.hasTrait(d, 'TRAIT_PARRY_COUNTER')) ? 1.15 : 1.0;
        C.strike(W, f, d, a, { M: cs.M * parryBonusM, type: cs.type, pen: cs.pen, forced: true, noCounter: true, noReflect: true, noProc: true });
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
    const rawCritPct = (sa.crit || 0) + (o.critAdd || 0) + (tb ? tb.critAdd : 0) + (tac ? tac.critAdd : 0) + (mfStacks > 0 ? (3 + mfStacks * 2) : 0);
    const critChance = rawCritPct / 100;
    const crit = !o.noCrit && W.rng.chance(clamp(critChance, 0, 0.90));
    const critOverflowBonus = (kwA.critOverflow && rawCritPct > 90) ? Math.min(45, (rawCritPct - 90) * 1.5) : 0;
    const critBreakPen = (crit && kwA.critBreak) ? 14 : 0;
    const armorReadPen = (kwA.armorRead && ((type === 'p' ? sd.def : sd.mdef) >= A0 * 0.85 || C.inferCombatRole(d) === 'TANK')) ? 14 : 0;
    const penTot = clamp((sa.pen || 0) + (o.pen || 0) + (tb ? tb.penAdd : 0) + (tac ? tac.penAdd : 0) + (kwA.penAdd || 0) + critBreakPen + armorReadPen, 0, 82);
    let D = (type === 'p' ? sd.def : sd.mdef) * (o.dotHalf ? 0.5 : 1) * (1 - clamp(penTot / 100, 0, 0.82));
    let kwMult = clamp((kwA.dmgMult || 1.0) * (mfStacks > 0 ? (1 + 0.04 + mfStacks * 0.02) : 1.0), 0.5, 1.60);
    if (a._absorbReleaseStored && a._absorbReleaseStored > 0 && kwA.absorbRelease) {
      const relBonus = clamp(a._absorbReleaseStored / Math.max(1, C.hpMax(a)), 0.05, 0.40);
      kwMult = clamp(kwMult * (1 + relBonus), 0.5, 1.60);
      a.lastAbsorbRelease = { t: W.t, releasedDmg: a._absorbReleaseStored, bonusMult: +(1 + relBonus).toFixed(3) };
      a._absorbReleaseStored = 0;
    }
    const atkElem = (o.skill && o.skill.element) || a.element || (a.h && a.h.root && a.h.root.primaryElement) || 'NEUTRAL';
    if (kwD.adaptiveResist && d._kwAdaptiveUntil != null && W.t > d._kwAdaptiveUntil) {
      d._kwAdaptiveStacks = 0;
      d._kwAdaptiveElem = null;
    }
    const sameAdaptiveElem = !d._kwAdaptiveElem || d._kwAdaptiveElem === atkElem;
    const kwMit = clamp((kwD.dmgMit || 0) + ((kwD.lastBreath && hpFrac(d) <= 0.35) ? 0.18 : 0) + ((kwD.adaptiveResist && d._kwAdaptiveStacks && sameAdaptiveElem) ? Math.min(0.18, d._kwAdaptiveStacks * 0.06) : 0), 0, 0.60);
    if (kwD.adaptiveResist) {
      if (d._kwAdaptiveElem && d._kwAdaptiveElem !== atkElem) {
        d._kwAdaptiveElem = atkElem;
        d._kwAdaptiveStacks = 1;
      } else {
        d._kwAdaptiveElem = atkElem;
        d._kwAdaptiveStacks = Math.min(3, (d._kwAdaptiveStacks || 0) + 1);
      }
      d._kwAdaptiveUntil = W.t + 20;
    }
    let frac = 0.2 * (A0 / (A0 + 0.8 * Math.max(0, D))) * (o.M || 1) * (o.synDmgMult || 1) * (tb ? tb.dmgMult : 1) * (tac ? tac.dmgMult : 1) * resRiderMult * kwMult * (1 - kwMit) * (0.85 + W.rng.next() * 0.3);
    if (crit) frac *= ((sa.critDmg || 150) + (o.critDmgAdd || 0) + (tb ? tb.critDmgAdd : 0) + critOverflowBonus) / 100;
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
      } else if (a.cult.path === 'SHADOW_SAMURAI') {
        frac *= 1.14;
      } else if (a.cult.path === 'NINPO_SHADOW' || a.cult.path === 'NINPO_ELEMENTAL') {
        frac *= 1.12;
      } else if (a.cult.path === 'DIVINE_SUMMONER' || a.cult.path === 'DIVINE_POSSESSION' || a.cult.path === 'DIVINE_CHANNELER') {
        frac *= 1.12;
      } else if (['VOID_HERETIC_PACT', 'OCCULT_MAGE', 'DEVOURING_FLESH', 'NETHER_GRAVE'].includes(a.cult.path)) {
        frac *= 1.11;
      } else if (['ASTRO_DIVINATION', 'DRAGON_VEIN_GEOMANCY', 'LORE_ARCHIVIST', 'MERCANTILE_DAO'].includes(a.cult.path)) {
        frac *= 1 + C.pathFormationMastery(a) * 0.08;
      } else if (CULT && CULT.PATHS && CULT.PATHS[a.cult.path]) {
        frac *= 1.09;
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
      } else if (['GRAVITY_DAO', 'DEVOURING_FLESH', 'PRIMORDIAL_SHIFTER', 'ARENA_GLORY', 'OCCULT_MAGE', 'BUDDHA_DHARMA', 'DIVINE_SUMMONER', 'DIVINE_POSSESSION', 'DIVINE_CHANNELER', 'ANCESTRAL_RITUAL'].includes(d.cult.path)) {
        frac *= 0.91;
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
      } else if (['ASTRO_DIVINATION', 'DRAGON_VEIN_GEOMANCY', 'LORE_ARCHIVIST', 'MERCANTILE_DAO'].includes(d.cult.path)) {
        frac *= 1 - C.pathFormationMastery(d) * 0.06;
      } else if (CULT && CULT.PATHS && CULT.PATHS[d.cult.path]) {
        frac *= 0.93;
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
    if (!a.foe && a.karmicLedger) {
      if (a.karmicLedger.aura === 'ASURA_BLOOD_AURA' || (a.karmicLedger.sinKarma || 0) >= 50) frac *= 1.12;
      else if ((a.karmicLedger.virtueKarma || 0) >= 30 && (d.foe || (d.karmicLedger && (d.karmicLedger.sinKarma || 0) >= 30))) frac *= 1.12;
    }
    if (!d.foe && d.karmicLedger && (d.karmicLedger.aura === 'GOLDEN_BODHI_HALO' || (d.karmicLedger.virtueKarma || 0) >= 50)) {
      frac *= 0.90;
    }
    if (f) {
      f._lastAttackElement = (o.skill && o.skill.element) || (a.equip && a.equip.WEAPON && a.equip.WEAPON.element) || a.element || (a.h && a.h.root && a.h.root.primaryElement) || null;
    }
    if (W && g.SECT && g.SECT.LEYLINE_GRID && g.SECT.LEYLINE_GRID.isTerritoryTriangulated && g.SECT.LEYLINE_GRID.isTerritoryTriangulated(W)) {
      if (!d.foe && a.foe) frac *= 0.88;
      else if (!a.foe && d.foe) frac *= 1.10;
    }
    if (ST.has(d, 'poiseBroken', W.t)) frac *= 1.35;
    let avatarAssisted = false;
    if (!a.foe && ((a._weaponAvatar && a._weaponAvatarFightId === (f && f.id)) || (a.lastWeaponAvatar && f && ((Array.isArray(f.A) && f.A.includes(a.lastWeaponAvatar.id)) || (Array.isArray(f.B) && f.B.includes(a.lastWeaponAvatar.id)))))) {
      frac *= 1.18;
      avatarAssisted = true;
      a.lastAvatarStrike = { t: W.t, targetId: d.id, bonusPct: 0.18 };
    }
    const dEqStage = (!d.foe && d.cult && g.CULT && g.CULT.equivalentStage) ? g.CULT.equivalentStage(d) : (d.stage || d.tier || 1);
    if (dEqStage >= 5 && !o.forced) {
      const highRealmResilience = 1 / (1 + Math.min(0.45, (dEqStage - 4) * 0.075));
      frac *= highRealmResilience;
    }
    // S03: Toxin Synergy Matrix evaluated BEFORE final damage so bonusDmgMult takes effect
    let toxSyn = null;
    if (!o.noProc && CULT && CULT.TOXIN_SYNERGY_MATRIX && C.alive(d)) {
      toxSyn = CULT.TOXIN_SYNERGY_MATRIX.evaluateTargetSynergy(W, f, a, d);
      if (toxSyn && toxSyn.triggered) {
        frac *= clamp(toxSyn.bonusDmgMult || 1.0, 1.0, 1.45);
        a.lastToxinSynergy = { t: W.t, reactions: toxSyn.reactions.map(r => r.id), targetId: d.id, bonusDmgMult: toxSyn.bonusDmgMult };
      }
    }
    const maxSingleHitFrac = (dEqStage >= 5 && !o.forced) ? 0.48 : 1.85;
    frac = clamp(frac, o.forced ? 0.0001 : 0.005, maxSingleHitFrac);
    if (nonlethal) frac *= 0.55;
    const hm = C.hpMax(d), beastGuard = !d.foe && g.MARTIAL && g.MARTIAL.isBeast(a) ? g.MARTIAL.skillEffects(d).beastDamage : 1, dmg = hm * frac * beastGuard;
    a.fx = a.fx || {}; if (!o.silent) { a.fx = { t: W.t, text: o.label || (crit ? 'จุดตาย!' : type === 'p' ? W.rng.pick(FX_PHYS) : W.rng.pick(FX_MAG)) }; }
    d.fx = { t: W.t, text: (avatarAssisted ? '⚡ ร่างจำแลงศาสตราประสานโจมตี! ' : (crit ? '✦' : '')) + '-' + Math.max(1, Math.round(dmg)) };
    if (!a.foe) { a.h.state.energy = Math.max(0, a.h.state.energy - 0.15); (g.MARTIAL && g.MARTIAL.skillPractice ? g.MARTIAL.skillPractice : HC.practice)(a, (g.MARTIAL ? ({ FIST: 'FIST_PALM' }[g.MARTIAL.equippedType(a)] || g.MARTIAL.equippedType(a)) : g.AI.pickTeachSkill(a, a)), 1 / 90, 1.1); HC.trainBody(a, 'reflex', 0.1); a.lastHurt = null; }
    if (!a.foe && g.CULT && g.CULT.gainPathGauge) {
      const pSpec = g.CULT.PATH_GAUGES && a.cult ? g.CULT.PATH_GAUGES[a.cult.path] : null;
      g.CULT.gainPathGauge(a, (pSpec && pSpec.gainOnHit) || 20);
    }
    if (!a.foe && g.CULT && g.CULT.SECONDARY_RESOURCES && g.CULT.SECONDARY_RESOURCES.canUseResource) {
      if (g.CULT.SECONDARY_RESOURCES.canUseResource(a, 'KILLING_INTENT')) g.CULT.SECONDARY_RESOURCES.gain(a, 'KILLING_INTENT', crit ? 16 : 10);
      if (g.CULT.SECONDARY_RESOURCES.canUseResource(a, 'FROST_QI') && (atkElem === 'WATER_ICE' || ST.has(d, 'chill', W.t))) g.CULT.SECONDARY_RESOURCES.gain(a, 'FROST_QI', 14);
      if (g.CULT.SECONDARY_RESOURCES.canUseResource(a, 'MECH_GEARS')) g.CULT.SECONDARY_RESOURCES.gain(a, 'MECH_GEARS', 12);
    }
    const killed = C.applyDamage(W, f, a, d, dmg);
    if (crit && kwA.critBreak && !o.noProc && C.alive(d)) {
      ST.addStatus(d, 'armorbreak', 10, null, W.t);
    }
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
    if (!o.noProc && !a.poisonDisabled && a.isGateBeast && a.bloodlineTrait === 'VENOM_GLAND' && C.alive(d)) {
      ST.addStatus(d, 'poison', 12, { per: 0.012, src: a.id });
      d.lastGateBeastVenom = { t: W.t, sourceId: a.id };
    }
    let lifesteal = 0, reflected = 0;
    const healMultA = C.healMultiplier ? C.healMultiplier(a, W.t) : 1.0;
    if (!a.foe && !a.dead && a.cult && (a.cult.path === 'DEMON' || (a.demonPact && a.demonPact.lifestealBonus > 0)) && dmg > 0) {
      const trA = CULT.trackRealm(a);
      const pactLs = (a.demonPact && a.demonPact.lifestealBonus) ? (a.demonPact.lifestealBonus * 100) : 0;
      const lsPct = clamp(((trA && trA.realmBuffs && trA.realmBuffs.lifestealPct) ? trA.realmBuffs.lifestealPct : (a.cult.path === 'DEMON' ? a.cult.stage * 1.15 : 0)) + pactLs, 1, 22);
      lifesteal = Math.max(0, Math.round(dmg * (lsPct / 100) * healMultA));
      if (lifesteal > 0) C.setHp(a, Math.min(C.hpMax(a), C.hp(a) + lifesteal));
      a.lastLifesteal = lifesteal;
    } else if (!a.foe && !a.dead && a.cult && a.cult.path === 'GOD' && dmg > 0 && o.isSkill) {
      const faithHeal = Math.max(0, Math.round(C.hpMax(a) * 0.028 * healMultA));
      if (faithHeal > 0) C.setHp(a, Math.min(C.hpMax(a), C.hp(a) + faithHeal));
    }
    // KW_LAST_BREATH + EXP_TRAIT_DEFEAT_VETERAN lifesteal when attacker HP <= 35%
    const hasDefeatVet = !a.foe && g.CULT && g.CULT.EXPERIENCE_TRAITS && g.CULT.EXPERIENCE_TRAITS.hasTrait && g.CULT.EXPERIENCE_TRAITS.hasTrait(a, 'EXP_TRAIT_DEFEAT_VETERAN');
    if ((kwA.lastBreath || hasDefeatVet) && hpFrac(a) <= 0.35 && dmg > 0 && !a.dead) {
      const lbHeal = Math.max(0, Math.round(dmg * 0.12 * healMultA));
      if (lbHeal > 0) C.setHp(a, Math.min(C.hpMax(a), C.hp(a) + lbHeal));
      lifesteal += lbHeal;
    }
    // KW_ABSORB_RELEASE store portion of incoming damage on defender (cap 40% MaxHP)
    if (kwD.absorbRelease && dmg > 0 && !d.dead) {
      d._absorbReleaseStored = Math.min(Math.round(C.hpMax(d) * 0.40), (d._absorbReleaseStored || 0) + Math.max(1, Math.round(dmg * 0.25)));
    }
    // KW_TEMPO_STEAL: steal cast speed / action tempo on crit or channeling target
    if (kwA.tempoSteal && dmg > 0 && !a.dead && C.alive(d) && (crit || (d.act && d.act.ctx && d.act.ctx.channeling) || o.isSkill) && (!a._tempoStealCd || W.t >= a._tempoStealCd)) {
      a._tempoStealCd = W.t + 8;
      ST.addStatus(a, 'haste', 8, null, W.t);
      if (d.act && d.act.ctx) {
        if (d.act.ctx.channeling) C.interruptChannel(W, f, d, 'ถูกช่วงชิงจังหวะร่าย', a);
        if (d.act.ctx.cds) {
          for (const ck of Object.keys(d.act.ctx.cds)) {
            if (d.act.ctx.cds[ck] > W.t) d.act.ctx.cds[ck] += 3;
          }
        }
      }
      a.lastTempoSteal = { t: W.t, targetId: d.id };
    }
    // KW_STATUS_TRANSFER: transfer 1 non-mark debuff from attacker to target on hit (or defender on parry)
    if (kwA.statusTransfer && dmg > 0 && !a.dead && C.alive(d) && Array.isArray(a.sx) && (!a._statusTransferCd || W.t >= a._statusTransferCd)) {
      const debuffIdx = a.sx.findIndex(x => x && x.until > W.t && ['burn', 'bleed', 'poison', 'slow', 'weaken', 'blind', 'chill', 'curse'].includes(x.k));
      if (debuffIdx >= 0) {
        const moved = a.sx.splice(debuffIdx, 1)[0];
        ST.dirty(a);
        ST.addStatus(d, moved.k, Math.max(4, moved.until - W.t), { per: moved.per, src: a.id }, W.t);
        a._statusTransferCd = W.t + 10;
        a.lastStatusTransfer = { t: W.t, status: moved.k, targetId: d.id };
      }
    }
    // JHS-011: Boss Anatomy Part-Breaking on skill or heavy hit against boss units
    if (!o.noProc && dmg > 0 && C.isBossUnit(d) && C.ANATOMY_BREAKER && C.alive(d) && (o.isSkill || crit)) {
      const parts = C.ANATOMY_BREAKER.initBossParts(d);
      const unbrokenKey = Object.keys(parts).find(k => parts[k] && !parts[k].broken);
      if (unbrokenKey) {
        const partDmg = Math.max(5, Math.round(dmg * 0.35));
        C.ANATOMY_BREAKER.damageBossPart(W, f, a, d, unbrokenKey, partDmg, { fromStrike: true });
      }
    }
    // Consolidated single-pass reflection (KW_REFLECT_CONSOLIDATE)
    if (!o.noReflect && dmg > 0 && !a.dead) {
      reflected += C.reflectOf(W, f, d, a, dmg, o);
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
          a.lastResonanceTrigger = { t: W.t, setId: resSet.setId, nameTh: resSet.nameTh, status: rd.status, descTh: rd.descTh, targetId: d.id, targetX: (!rd.selfBuff && d && Number.isFinite(d.x)) ? d.x : a.x, targetY: (!rd.selfBuff && d && Number.isFinite(d.y)) ? d.y : a.y, originX: a.x, originY: a.y, selfBuff: !!rd.selfBuff };
        }
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
            const prevFat = pt.fatigue || 0;
            pt.fatigue = clamp(prevFat + 1.2, 0, 100);
            if ((prevFat < 90 && pt.fatigue >= 90) || (prevFat < 95 && pt.fatigue >= 95)) ST.dirty(a);
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

      if (f) {
        const fTac = C.ensureFightTac(f, W.t);
        f._unitFirstStrikeDone = f._unitFirstStrikeDone || fTac.unitFirstStrikeDone;
        if (!fTac.unitFirstStrikeDone[a.id] && !f._unitFirstStrikeDone[a.id]) {
          fTac.unitFirstStrikeDone[a.id] = true;
          f._unitFirstStrikeDone[a.id] = true;
          runPassiveProcs(W, f, a, d, 'onFirstStrike', dmg);
        }
      }
      runPassiveProcs(W, f, a, d, 'onHit', dmg);
      if (crit) runPassiveProcs(W, f, a, d, 'onCrit', dmg);
      if (!o.noReflect && !o.noCounter) runPassiveProcs(W, f, d, a, 'onStruck', dmg);
      if (killed) {
        runPassiveProcs(W, f, a, d, 'onKill', dmg);
        if (C.COMPOSABLE_ENGINE && C.COMPOSABLE_ENGINE.spreadContagionOnDeath) {
          C.COMPOSABLE_ENGINE.spreadContagionOnDeath(W, f, a, d);
        }
      }
      if (C.hp(d) <= C.hpMax(d) * 0.35 && C.alive(d)) runPassiveProcs(W, f, d, a, 'onLowHp', dmg);
    }
    return {
      hit: true, dmg, crit, killed, lifesteal, reflected,
      actualReceiverId: d.id,
      originalTargetId: originalTarget ? originalTarget.id : d.id,
      intercepted: !!interceptInfo,
      interceptKind: interceptInfo ? interceptInfo.kind : null,
      tacticalRelation: tac ? tac.relation : 'NEUTRAL',
      resonanceTriggered
    };
  };
  /* ---------- Patch v3.0.0: Cognitive Role Inference, 5 Archetypes & Tactical Priority Score (TPS) ---------- */
  C.inferCombatRole = u => {
    if (!u) return "FIGHTER";
    const tl = (u.cult && Array.isArray(u.cult.techs)) ? u.cult.techs.length : 0;
    const eqW = u.equip ? u.equip.WEAPON : (u.weaponType || null);
    const pVer = u._passVer || 0;
    if (u._roleCache && u._roleCache.pVer === pVer && u._roleCache.tl === tl && u._roleCache.eqW === eqW && u._roleCache.path === (u.cult && u.cult.path)) return u._roleCache.role;
    const SK = SKs();
    const list = SK && SK.list ? SK.list(u) : (u.skl || []);
    let role = "FIGHTER";
    const hasHeal = list.some(p => p && (p.arch === 'heal' || p.arch === 'harmonize' || p.heal > 0));
    if (hasHeal || (u.cult && u.cult.path === 'SAGE_SUPPORT')) {
      role = 'HEALER';
    } else {
      const wp = SK && SK.weaponTacticalProfile ? SK.weaponTacticalProfile(u) : null;
      const isTankSub = u.cult && ['BODY', 'GOD'].includes(u.cult.path) && (wp && wp.reachClass !== 'RANGED_KITE');
      const hasGuard = list.some(p => p && (p.arch === 'guard' || p.arch === 'shield' || p.taunt || p.action === 'APPLY_TAUNT'));
      if (isTankSub || hasGuard || (u.isGateBeast && (u.fourSymbol === 'BLACK_TORTOISE' || u.bloodlineTrait === 'IRON_CARAPACE'))) role = 'TANK';
      else if (wp && wp.reachClass === 'RANGED_KITE') role = 'CASTER';
      else if (u.cult && ['ASTRAL_STAR', 'ARRAY_TALISMAN', 'HEART_SOUL'].includes(u.cult.path)) role = 'CASTER';
      else if (u.cult && u.cult.path === "DEMON") role = "ASSASSIN";
    }
    u._roleCache = { pVer, tl, eqW, path: u.cult && u.cult.path, role };
    return role;
  };

  C.resolveCognitiveArchetype = u => {
    if (!u) return 'HONORABLE_DUELLIST';
    if (u.kind === 'beast' || u.wild || (u.isGateBeast && !u.fourSymbol)) return 'INSTINCTIVE_BEAST';
    if (u.foe) {
      const nm = String(u.name || u.nameTh || '');
      if (/มือสังหาร|เงา|ลอบ|มาร|โจร/.test(nm)) return 'CUNNING_ASSASSIN';
      if (/คลั่ง|อสูร|โลหิต/.test(nm)) return 'BLOODTHIRSTY_BERSERKER';
      if (u.boss || /หัวหน้า|แม่ทัพ|ผู้อาวุโส|ค่ายกล/.test(nm)) return 'GRAND_TACTICIAN';
      return 'HONORABLE_DUELLIST';
    }
    const aggr = E(u, 'personality.aggression');
    const inte = E(u, 'personality.integrity');
    const tact = (u.h && u.h.intellect && u.h.intellect.tactics) || E(u, 'personality.rationality') || 50;
    const path = u.cult && u.cult.path;
    if (path === 'STRATEGY_GOVERNANCE' || path === 'ARRAY_TALISMAN' || tact >= 72) return 'GRAND_TACTICIAN';
    if (aggr >= 75 || path === 'DEMON') return (tact >= 58 ? 'CUNNING_ASSASSIN' : 'BLOODTHIRSTY_BERSERKER');
    if (inte >= 68 || path === 'GOD' || path === 'XIAN') return 'HONORABLE_DUELLIST';
    return 'CUNNING_ASSASSIN';
  };

  /* คำนวณคะแนนความสำคัญของเป้าหมาย (Tactical Priority Score - TPS) โดยไม่กิน W.rng */
  C.computeTargetPriorityScore = (W, f, a, cand, opts) => {
    if (!a || !cand || !C.alive(cand)) return -9999;
    opts = opts || {};
    const ST = STs(), tNow = (W && W.t != null) ? W.t : 0;
    const aTac = C.ensureUnitTac(a);
    const arch = aTac.archetype || C.resolveCognitiveArchetype(a);
    const role = C.inferCombatRole(cand);
    const dist = Number.isFinite(opts.dist) ? opts.dist : C.unitDist(a, cand);
    const candHpR = hpFrac(cand);
    const candDef = (ST.get(cand).def + ST.get(cand).mdef) * 0.5;
    const isChanneling = !!((cand.act && cand.act.ctx && cand.act.ctx.channeling) || ST.has(cand, 'channeling', tNow));
    const hasBleedOrMark = !!(cand.sx && cand.sx.some(x => x.until > tNow && (['bleed', 'burn', 'poison'].includes(x.k) || (C.COMPOSABLE_ENGINE && C.COMPOSABLE_ENGINE.MARK_KEYS.includes(x.k)))));

    // 1. Active Taunt Check (Forced engagement or heavy priority multiplier)
    const tauntSx = ST.statusOf(a, 'taunted', tNow) || ST.statusOf(a, 'taunt', tNow);
    if (tauntSx && tauntSx.taunterId === cand.id) {
      return 9500 - dist * 10;
    }

    // 2. Role Base Value weighted by Cognitive Archetype
    let roleScore = role === 'HEALER' ? 165 : role === 'CASTER' ? 140 : role === 'ASSASSIN' ? 130 : role === 'FIGHTER' ? 105 : 65;
    if (arch === 'CUNNING_ASSASSIN') {
      if (role === 'HEALER' || role === 'CASTER') roleScore += 55;
      if (role === 'TANK') roleScore -= 25;
    } else if (arch === 'BLOODTHIRSTY_BERSERKER') {
      roleScore = 100 + (1 - candHpR) * 140 + (hasBleedOrMark ? 45 : 0);
    } else if (arch === 'HONORABLE_DUELLIST') {
      const myPow = C.power(a), cPow = C.power(cand);
      const parity = 1 - Math.min(1, Math.abs(myPow - cPow) / Math.max(20, myPow));
      roleScore = 110 + parity * 75;
    } else if (arch === 'GRAND_TACTICIAN') {
      if (isChanneling) roleScore += 110;
      if (hasBleedOrMark || (C.COMPOSABLE_ENGINE && C.COMPOSABLE_ENGINE.getActiveElementalAuras(cand, tNow).length > 0)) roleScore += 55;
    } else if (arch === 'INSTINCTIVE_BEAST') {
      roleScore = 100 + (hasBleedOrMark ? 40 : 0);
    }

    // 3. Current Threat & Channel Interrupt Priority
    let threatScore = isChanneling ? 120 : 0;
    if (cand.lastHurtBy === a.id || a.lastHurtBy === cand.id) threatScore += 28;
    if (!a.foe && Array.isArray(a.destinyThreads) && a.destinyThreads.some(th => th && th.type === 'BLACK_THREAD' && (th.aId === cand.id || th.bId === cand.id))) {
      threatScore += 65; // คู่อาฆาตด้ายดำ
    }

    // 4. Vulnerability Score (Low HP Focus Fire & Low Defense)
    let vulnScore = (1 - candHpR) * 85 + (candHpR < 0.30 ? 75 : 0) + clamp(120 - candDef * 0.4, 0, 50);

    // 5. Obstruction & Pathing Cost (Preserving the Tank Role in Chokepoints)
    // If a Tank with active ZoC stands between attacker and a backline target, bypassing the tank incurs a heavy pathing penalty
    let obstructionPenalty = 0;
    if (f && role !== 'TANK' && dist > 1.85) {
      const los = C.checkLineOfSight(W, f, a, cand, { requiresLoS: true });
      if (los.terrainBlocked) obstructionPenalty += 1.4;
      if (los.blockerUnit) {
        // If attacker only has melee/LoS moves, the tank blocking the corridor makes the backliner much harder to reach
        obstructionPenalty += 1.25;
      }
    }
    // Conversely, if candidate IS the Tank standing right in front of attacker (blocking the way), boost its score so AI clears the blocker!
    if (role === 'TANK' && dist <= 1.85 && C.unitZoCRadius(cand) > 0) {
      roleScore += 55;
    }

    // 6. Hysteresis bonus to prevent erratic every-tick target ping-pong
    const curTargetBonus = (aTac.lastTargetId === cand.id && aTac.targetLockUntil > tNow) ? 42 : 0;
    const distWeight = arch === 'INSTINCTIVE_BEAST' ? 0.65 : arch === 'CUNNING_ASSASSIN' ? 0.22 : 0.35;
    const denom = 1.0 + dist * distWeight + obstructionPenalty;
    const noise = (C.tacHash01(W, f, a.id, cand.id, Math.floor(tNow / 4)) - 0.5) * 6.0;
    return ((roleScore + threatScore + vulnScore + curTargetBonus) / denom) + noise;
  };

  /* ประเมินช่วงระยะของวิชาที่พร้อมใช้ในปัจจุบัน และเลือกเป้าหมายที่ดีที่สุด */
  C.evaluateTacticalEngagement = (W, f, u, ctx) => {
    const SK = SKs(), ST = STs(), tNow = (W && W.t != null) ? W.t : 0;
    if (u && u._sameTickEval && u._sameTickEval.t === tNow && u._sameTickEval.fid === (f && f.id) && u._sameTickEval.out && u._sameTickEval.out.target && C.alive(u._sameTickEval.out.target)) return u._sameTickEval.out;
    const uTac = C.ensureUnitTac(u);
    const enemies = C.enemies(W, f, u.id).filter(x => !x.hidden && !x.away && C.alive(x));
    if (!enemies.length) return { target: null, desiredRange: 1.7, readyMoves: [], canHealAlly: false };

    // Check if unit is forced by active taunt
    const tauntSx = ST.statusOf(u, 'taunted', tNow) || ST.statusOf(u, 'taunt', tNow);
    let taunter = (tauntSx && (tauntSx.taunterId || tauntSx.src)) ? enemies.find(e => e.id === (tauntSx.taunterId || tauntSx.src)) : enemies.find(e => ST.has(e, 'taunt', tNow));

    // Gather ready moves & their spatial ranges
    const list = SK && SK.list ? SK.list(u) : (u.skl || []);
    const qi = u.foe ? 1e9 : (u.h && u.h.state && u.h.state.qi != null ? u.h.state.qi : 1e9);
    const cds = (ctx && ctx.cds) || {};
    const readyMoves = [];
    let canHealAlly = false;
    let maxOffRange = 0, minOffRange = Infinity;

    if (!ST.has(u, 'silence', tNow)) {
      for (const p of list) {
        if ((cds[p.id] || 0) > tNow) continue;
        if (p.tech && p.tech !== p.id && (cds['TECH_GCD:' + p.tech] || 0) > tNow) continue;
        if (!u.foe && g.MARTIAL && g.MARTIAL.skillEfficiency(u, p) <= 0) continue;
        const cost = u.foe ? 0 : SK.qiCost(u, p);
        if (qi < cost) continue;
        const sp = p.range || (SK.resolveMoveSpatialSpec ? SK.resolveMoveSpatialSpec(p, u) : { min: 0, max: 1.8 });
        if (uTac.pacingUntil > tNow && sp.bandIndex >= 4) continue; // AI Tactical Pacing Rhythm
        readyMoves.push({ move: p, spec: sp });
        if (p.arch === 'heal' || p.arch === 'harmonize') {
          const ally = lowestAlly(W, f, u);
          const lowR = ally ? Math.min(hpFrac(u), hpFrac(ally)) : hpFrac(u);
          if (lowR < 0.72) canHealAlly = true;
        } else if (!p.self && !p.team) {
          if (sp.max > maxOffRange) maxOffRange = sp.max;
          if (sp.min < minOffRange) minOffRange = sp.min;
        }
      }
    }

    // Select target: keep locked target unless expired, dead, unreachable/stuck, or critical interrupt/taunt appears
    let chosen = taunter || null;
    if (!chosen && enemies.length === 1) {
      chosen = enemies[0];
    }
    if (!chosen) {
      let bestCand = null, bestTps = -Infinity, curT = null, curTps = -Infinity;
      const curTid = ctx && ctx.target;
      for (const en of enemies) {
        const d = C.unitDist(u, en);
        const tps = C.computeTargetPriorityScore(W, f, u, en, { dist: d });
        if (en.id === curTid) { curT = en; curTps = tps; }
        if (tps > bestTps) {
          bestTps = tps;
          bestCand = en;
        }
      }
      if (curT && uTac.targetLockUntil > tNow && uTac.stuckTicks < 4) {
        // Switch early only if new candidate is significantly higher priority (e.g. channeling ultimate or low HP execute)
        chosen = (bestCand && bestCand.id !== curT.id && bestTps > curTps + 55) ? bestCand : curT;
      } else {
        chosen = bestCand || enemies[0];
      }
    }

    if (chosen && ctx) {
      if (ctx.target && ctx.target !== chosen.id) {
        const ft = C.ensureFightTac(f, tNow);
        ft.stats.targetSwitches = (ft.stats.targetSwitches || 0) + 1;
        const whySwitch = taunter ? 'ถูกยั่วยุดึงความสนใจ'
          : ((chosen.act && chosen.act.ctx && chosen.act.ctx.channeling) ? 'พุ่งเป้าขัดจังหวะการร่ายวิชา'
          : (hpFrac(chosen) < 0.30 ? 'มุ่งปิดฉากเป้าหมายที่บาดเจ็บหนัก' : 'ปรับเป้าหมายตามยุทธวิธี'));
        u.lastTargetSwitch = { t: tNow, fromId: ctx.target, toId: chosen.id, reasonTh: whySwitch };
        if (ft.stats.targetSwitches <= 8) {
          C.recordTacticalHighlight(W, f, 'TARGET_SWITCH', C.name(u) + ' เบนเป้าหมายไปหา ' + C.name(chosen) + ' (' + whySwitch + ')', {
            actorId: u.id, targetId: chosen.id, reasonTh: whySwitch
          });
        }
      }
      ctx.target = chosen.id;
      if (uTac.lastTargetId !== chosen.id || uTac.targetLockUntil <= tNow) {
        if (uTac.lastTargetId !== chosen.id) uTac.stuckTicks = 0;
        uTac.lastTargetId = chosen.id;
        uTac.targetLockUntil = tNow + 8;
      }
    }

    const wp = (SK && SK.weaponTacticalProfile) ? SK.weaponTacticalProfile(u) : null;
    const baseEngage = (wp && uTac.closedOnBy !== (chosen && chosen.id)) ? (wp.engageRange || 1.7) : 1.7;
    const desiredRange = maxOffRange > 0 ? Math.max(baseEngage, maxOffRange) : baseEngage;
    return {
      target: chosen,
      desiredRange,
      minReadyRange: Number.isFinite(minOffRange) ? minOffRange : 0,
      readyMoves,
      canHealAlly
    };
  };

  /* ---------- เลือกท่า ---------- */
  function chooseSkill(W, f, a, d, ctx, opts) {
    opts = opts || {};
    const SK = SKs(), ST = STs(); if (ST.has(a, 'silence')) return null;
    const list = SK.list(a); if (!list.length) return null;
    const sa = ST.get(a), hpR = hpFrac(a), nonlethal = !f.serious, qi = a.foe ? 1e9 : (a.h.state.qi == null ? 1e9 : a.h.state.qi);
    const en = C.enemies(W, f, a.id), near = en.filter(x => d && Math.hypot(x.x - d.x, x.y - d.y) < 2.6).length;
    const aggr = a.foe ? 0.2 : (E(a, 'personality.aggression') - 50) / 200, caut = a.foe ? 0 : (E(a, 'personality.caution') - 50) / 200;
    const basicStat = Math.max(sa.atk, sa.matk), self = C.power(a), td = d ? ST.get(d) : sa, tdp = d ? C.power(d) : self;
    const targetShielded = d ? (!!shieldOf(d) || ST.has(d, 'guardUp')) : false;
    const paTac = SK.weaponTacticalProfile ? SK.weaponTacticalProfile(a) : null;
    const pdTac = (d && SK.weaponTacticalProfile) ? SK.weaponTacticalProfile(d) : null;
    const aTac = C.ensureUnitTac(a);
    const curDist = (d && Number.isFinite(a.x) && Number.isFinite(d.x)) ? Math.hypot(a.x - d.x, a.y - d.y) : 1.5;
    let best = null, bs = 1.15; ctx.cds = ctx.cds || {};
    for (const p of list) {
      if ((ctx.cds[p.id] || 0) > W.t) continue;
      if (p.tech && p.tech !== p.id && (ctx.cds['TECH_GCD:' + p.tech] || 0) > W.t) continue;
      if (!a.foe && g.MARTIAL && g.MARTIAL.skillEfficiency(a, p) <= 0) continue;
      const cost = a.foe ? 0 : SK.qiCost(a, p); if (qi < cost) continue;
      const mSpec = p.range || (SK.resolveMoveSpatialSpec ? SK.resolveMoveSpatialSpec(p, a) : { min: 0, max: 2.0, bandIndex: 1 });
      // AI Tactical Pacing Rhythm: prevent back-to-back Band 4 spam on foes
      if (a.foe && aTac.pacingUntil > W.t && mSpec.bandIndex >= 4) continue;
      // Enforce spatial range boundaries when positions are live on the battlefield
      const isSelfOrTeam = !!(p.self || p.team || ['heal', 'support', 'buff', 'summon', 'guard', 'shield', 'counter', 'evade', 'stanceShift'].includes(p.arch));
      if (!isSelfOrTeam && d && Number.isFinite(a.x) && Number.isFinite(d.x) && !opts.ignoreRange) {
        if (curDist > mSpec.max + 0.45 && !mSpec.isGapCloser) continue;
        if (mSpec.min >= 1.2 && curDist < mSpec.min * 0.75 && list.length > 1) continue;
        if (mSpec.requiresLoS && !mSpec.ignoresObstacles && C.checkLineOfSight(W, f, a, d, mSpec).terrainBlocked) continue;
      }
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
      // v3.0.0 Spatial & Tactical scoring adjustments
      if (mSpec.isGapCloser && curDist > 1.85) sc += 1.65;
      if (mSpec.isRetreat && curDist <= 1.35 && paTac && paTac.reachClass === 'RANGED_KITE') sc += 2.10;
      if (curDist <= 1.30 && paTac && paTac.reachClass === 'RANGED_KITE' && mSpec.max <= 1.65 && (p.knockback || p.ctrl)) sc += 2.25;
      if (d && ((d.act && d.act.ctx && d.act.ctx.channeling) || ST.has(d, 'channeling')) && (p.ctrl === 'stun' || p.ctrl === 'silence' || p.poiseDamage > 0 || p.action === 'POISE_BREAK')) {
        sc += 2.80; // Channel interrupt priority
      }
      // Preserve the existing weapon-type synergy preference for utility/support skills too.
      if (syn && syn.matched) sc += 0.28;
      const noise01 = opts.pureEval ? C.tacHash01(W, f, a.id, p.id, W.t) : (W.rng ? W.rng.next() : 0.5);
      sc *= 0.92 + noise01 * 0.16;
      if (sc > bs) { bs = sc; best = p; }
    }
    return best;
  }
  C.chooseSkill = chooseSkill;
  function lowestAlly(W, f, a, maxRange) {
    const side = C.sideOf(f, a.id) === 'A' ? f.A : f.B;
    let w = null, m = 2;
    const lim = Number.isFinite(maxRange) && maxRange > 0 ? maxRange : Infinity;
    side.forEach(id => {
      const u = C.unit(W, id);
      if (!C.alive(u) || u.id === a.id) return;
      if (Number.isFinite(a.x) && Number.isFinite(u.x) && C.unitDist(a, u) > lim) return;
      const r = hpFrac(u);
      if (r < m) { m = r; w = u; }
    });
    return w;
  }
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
    const tech = p.tech && CULT.tech(p.tech);
    const isOffStrikeArch = ['blink', 'stanceShift', 'tetherLink', 'markPrimer', 'markDetonate', 'elementalFusion'].includes(p.arch) && (p.M || 0) > 0 && !!d;
    const selfAnchoredArch = ['heal', 'support', 'buff', 'summon', 'harmonize', 'guard', 'shield', 'evade', 'counter'].includes(p.arch) || (p.arch === 'blink' && !((p.M || 0) > 0 && d));
    const target = p.arch === 'command' ? (d || a) : (isOffStrikeArch ? d : ((p.self || p.team || selfAnchoredArch) ? a : (d || a)));
    const isForbid = p.arch === 'forbid' || !!(tech && (tech.cat === 'FORBIDDEN_ART' || tech.cat === 'FORBIDDEN_TECHNIQUE' || tech.cat === 'FORBIDDEN_GRAND_DAO'));
    if (isForbid && !a.foe && a.voluntaryVows && a.voluntaryVows.VOW_ASCETIC_PRECEPT && a.voluntaryVows.VOW_ASCETIC_PRECEPT.active && CULT && CULT.VOLUNTARY_VOWS && CULT.VOLUNTARY_VOWS.violateVow) {
      CULT.VOLUNTARY_VOWS.violateVow(W, a, 'VOW_ASCETIC_PRECEPT', 'ร่ายวิชาต้องห้าม「' + (tech ? tech.nameTh : p.nameTh) + '」');
    }
    if (!a.foe && CULT && CULT.SECONDARY_RESOURCES && CULT.SECONDARY_RESOURCES.canUseResource) {
      if (CULT.SECONDARY_RESOURCES.canUseResource(a, 'FORMATION_INK')) CULT.SECONDARY_RESOURCES.gain(a, 'FORMATION_INK', 14);
    }
    const fxMotif = p.fxKind || (tech && tech.fxKind) || (isForbid ? 'forbidden' : 'normal');
    const sigVfx = p.signatureVfx || (tech && tech.signatureVfx) || (SK && SK.resolveSignatureVfx ? SK.resolveSignatureVfx(tech || p, p) : null) || null;
    const equippedWeapon = a.equip && a.equip.WEAPON;
    const usableWeapon = !!(equippedWeapon && (!g.MARTIAL || !g.MARTIAL.gearUsable || g.MARTIAL.gearUsable(a, equippedWeapon)));
    const weaponType = (usableWeapon && g.MARTIAL && g.MARTIAL.gearType ? g.MARTIAL.gearType(equippedWeapon) : null) ||
      ((Array.isArray(p.weaponTypes) && p.weaponTypes[0]) || (tech && Array.isArray(tech.weaponTypes) && tech.weaponTypes[0]) ||
        (g.MARTIAL && g.MARTIAL.equippedType ? g.MARTIAL.equippedType(a) : 'FIST'));
    const mSpecPre = p.range || (SK.resolveMoveSpatialSpec ? SK.resolveMoveSpatialSpec(p, a) : { min: 0, max: 2.0, bandIndex: 1, shape: 'SINGLE', radius: 0 });
    const castShape = mSpecPre.shape || (p.aoe ? 'CIRCLE' : 'SINGLE');
    const isRangedCast = !!(mSpecPre.bandIndex >= 2 || (mSpecPre.max || 0) >= 2.6 || ['BOW', 'ZITHER', 'NEEDLE', 'FAN', 'ASTROLABE', 'ABACUS', 'ROSARY', 'BRUSH', 'TALISMAN'].includes(weaponType));
    const isGapCloserCast = !!(mSpecPre.isGapCloser || p.arch === 'charge' || p.arch === 'blink');
    const castRole = (p.arch === 'heal') ? 'HEAL'
      : (['support', 'buff', 'command', 'harmonize'].includes(p.arch) && (p.M || 0) <= 0) ? 'SUPPORT'
      : (['guard', 'shield', 'counter', 'evade'].includes(p.arch)) ? 'DEFENSE'
      : (p.arch === 'summon') ? 'SUMMON'
      : (p.arch === 'harmonize' && (p.M || 0) > 0) ? 'HYBRID_HARMONIZE'
      : (p.aoe || ['CIRCLE', 'CONE', 'LINE', 'RING', 'CHAIN'].includes(castShape)) ? 'AOE_OFFENSE'
      : 'SINGLE_OFFENSE';
    a.castFx = {
      t: W.t,
      kind: isForbid ? 'forbidden' : 'normal',
      motif: fxMotif,
      fxKind: p.fxKind || (tech && tech.fxKind) || null,
      signatureVfx: sigVfx,
      legendary: !!(p.legendary || (tech && tech.legendary)),
      weaponType,
      tier: p.tier || (tech && tech.tier) || 1,
      arch: p.arch || (tech && (tech.combatArch || tech.role)) || null,
      techId: tech ? tech.id : p.id,
      moveId: p.moveId || p.id,
      element: p.element || (tech && tech.element) || (a.cult && a.cult.element) || null,
      path: p.path || (tech && tech.path) || (a.cult && a.cult.path) || null,
      subpath: p.sub || (tech && tech.sub) || (a.cult && a.cult.sub) || null,
      cat: (tech && tech.cat) || p.cat || null,
      bandIndex: mSpecPre.bandIndex || 1,
      rangeShape: castShape,
      isRanged: isRangedCast,
      isGapCloser: isGapCloserCast,
      castRole,
      fromEquipmentGrant: !!p.fromEquipmentGrant,
      originX: a.x,
      originY: a.y,
      x: target.x,
      y: target.y,
      targetPoints: [],
      seq: ((a.castFx && a.castFx.seq) || 0) + 1
    };
    const snapshotCastTargets = (units, merge = false) => {
      const points = (units || []).filter(unit => unit && C.alive(unit) && Number.isFinite(unit.x) && Number.isFinite(unit.y))
        .map(unit => ({ id: unit.id || null, x: unit.x, y: unit.y, team: C.isAlly(f, a.id, unit.id) || unit.id === a.id }));
      a.castFx.targetPoints = (merge ? a.castFx.targetPoints.concat(points) : points)
        .filter((point, index, all) => all.findIndex(other => (point.id && other.id) ? point.id === other.id : point.x === other.x && point.y === other.y) === index)
        .slice(0, 8).map(({ x, y, team }) => ({ x, y, team }));
    };
    snapshotCastTargets([target]);
    if ((p.chargeRelease || p.action === 'CHARGE_RELEASE' || (p.composable && p.composable.action === 'CHARGE_RELEASE')) && !p.channel && C.startChargedSkill) {
      const kwA = C.keywordsOf ? C.keywordsOf(a) : null;
      runPassiveProcs(W, f, a, d, 'onCast', 0);
      C.startChargedSkill(W, f, a, d, p, { ticks: 2, poiseShield: Math.max(40, Math.round(C.hpMax(a) * 0.18)), releaseMult: kwA && kwA.chargeRelease ? 1.85 : 1.65 });
      return;
    }
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
      const hSpec = p.range || (SK.resolveMoveSpatialSpec ? SK.resolveMoveSpatialSpec(p, a) : { max: 4.5 });
      const maxHealR = p.globalRange ? 999 : Math.max(6.5, (hSpec.max || 4.5) * 1.8);
      const inRangeAllies = C.alliesOf(W, f, a.id).filter(u => C.alive(u) && (!Number.isFinite(a.x) || !Number.isFinite(u.x) || C.unitDist(a, u) <= maxHealR));
      const healTargets = p.aoe ? (inRangeAllies.length ? inRangeAllies : [a]) : [(() => { const ally = lowestAlly(W, f, a); return (ally && hpFrac(ally) < hpFrac(a) - 0.05) ? ally : a; })()];
      snapshotCastTargets(healTargets);
      const sageBonus = ((!a.foe && a.cult && a.cult.path === 'SAGE_SUPPORT') ? 1.18 : 1.0) * stanceHealMult;
      healTargets.forEach((tgt, idx) => {
        if (!tgt || !C.alive(tgt)) return;
        if (idx === 0) { a.castFx.x = tgt.x; a.castFx.y = tgt.y; }
        const thm = C.hpMax(tgt);
        const beforeFrac = C.hp(tgt) / Math.max(1, thm);
        if (beforeFrac < 0.25 && !a.foe && C.ACTION_MASTERY_TRAITS) {
          C.ACTION_MASTERY_TRAITS.recordAction(W, a, 'clutchHealCount', 1);
        }
        const medicMult = (!a.foe && C.ACTION_MASTERY_TRAITS && C.ACTION_MASTERY_TRAITS.hasTrait(a, 'TRAIT_COMBAT_MEDIC')) ? 1.20 : 1.0;
        const ashenMult = C.healMultiplier ? C.healMultiplier(tgt, W.t) : (ST.has(tgt, 'ashenToxin', W.t) ? 0.5 : (ST.has(tgt, 'stygianFreeze', W.t) ? 0 : 1.0));
        const healAmt = Math.max(0, Math.round(thm * (p.heal || 0.22) * sageBonus * medicMult * ashenMult));
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
      const sSpec = p.range || (SK.resolveMoveSpatialSpec ? SK.resolveMoveSpatialSpec(p, a) : { max: 4.5 });
      const maxSupR = p.globalRange ? 999 : Math.max(7.5, (sSpec.max || 4.5) * 2.0);
      const rawAllies = C.alliesOf(W, f, a.id).filter(u => C.alive(u) && (!Number.isFinite(a.x) || !Number.isFinite(u.x) || C.unitDist(a, u) <= maxSupR));
      const allies = rawAllies.length ? rawAllies : [a];
      snapshotCastTargets(allies);
      const buffKind = p.grantBuff || (p.support && p.support.kind) || 'morale';
      const dur = buffDur;
      allies.forEach(ally => {
        if (!C.alive(ally)) return;
        const ahm = C.hpMax(ally);
        const hMult = C.healMultiplier ? C.healMultiplier(ally, W.t) : 1.0;
        if (p.heal > 0 && hMult > 0) C.setHp(ally, Math.min(ahm, C.hp(ally) + Math.max(1, Math.round(ahm * p.heal * hMult))));
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
      snapshotCastTargets(allies);
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
      snapshotCastTargets(allies);
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
      snapshotCastTargets([a, d].filter(Boolean));
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
    const mSpec = p.range || (SK.resolveMoveSpatialSpec ? SK.resolveMoveSpatialSpec(p, a) : { min: 0, max: 2.0, bandIndex: 1, shape: 'SINGLE', radius: 0 });
    const aTac = C.ensureUnitTac(a);
    aTac.lastMoveBand = mSpec.band;
    if (mSpec.bandIndex >= 4 || p.arch === 'burst' || p.arch === 'forbid') {
      aTac.pacingUntil = W.t + (a.foe ? 3 : 2); // AI Tactical Pacing Rhythm
    }
    // Gap-closer movement execution: dash into melee range of target
    if ((mSpec.isGapCloser || p.arch === 'charge' || p.arch === 'blink') && d && Number.isFinite(a.x) && Number.isFinite(d.x)) {
      const dx = d.x - a.x, dy = d.y - a.y, dist = Math.hypot(dx, dy);
      if (dist > 1.2) {
        const destX = d.x - (dx / dist) * 0.9, destY = d.y - (dy / dist) * 0.9;
        const proj = mSpec.ignoresObstacles
          ? { x: +destX.toFixed(2), y: +destY.toFixed(2) }
          : C.projectSafePosition(W, a.x, a.y, destX, destY);
        a.x = proj.x; a.y = proj.y;
      }
      const dTac = C.ensureUnitTac(d);
      dTac.closedOnBy = a.id; d._closedOnBy = a.id;
      aTac.gapClosedOn = d.id; a._gapClosedOn = d.id;
    }
    // Disengage / Retreat movement execution
    if (mSpec.isRetreat && d && Number.isFinite(a.x) && Number.isFinite(d.x)) {
      const dx = a.x - d.x, dy = a.y - d.y, dist = Math.max(0.1, Math.hypot(dx, dy));
      const proj = C.projectSafePosition(W, a.x, a.y, a.x + (dx / dist) * 1.6, a.y + (dy / dist) * 1.6);
      a.x = proj.x; a.y = proj.y;
      aTac.closedOnBy = null; a._closedOnBy = null;
    }

    // Composable pre-strike execution (stanceShift, tetherLink, sacrificeOverdrive, comboReady consumption)
    let comboMult = 1.0;
    if (C.COMPOSABLE_ENGINE) {
      const preRes = C.COMPOSABLE_ENGINE.preExecuteSkill(W, f, a, d, p, ctx);
      if (preRes && preRes.comboMult) comboMult = preRes.comboMult;
      if (preRes && preRes.handledCompletely) return;
    }
    if (p.arch === 'channel') {
      const ch = p.channel || { ticks: 3, tickM: 0.5, finishM: 1.0, interruptForce: 15 };
      ctx.channeling = {
        skillId: p.id,
        skill: p,
        targetId: d ? d.id : null,
        lockType: mSpec.lockType || (p.aoe ? 'POINT' : 'UNIT'),
        lockX: d && Number.isFinite(d.x) ? d.x : a.x,
        lockY: d && Number.isFinite(d.y) ? d.y : a.y,
        maxRange: mSpec.max || 4.2,
        startDist: (d && Number.isFinite(a.x) && Number.isFinite(d.x)) ? Math.hypot(a.x - d.x, a.y - d.y) : 0,
        ticksLeft: ch.ticks,
        totalTicks: ch.ticks,
        tickM: +(ch.tickM * comboMult).toFixed(3),
        finishM: +(ch.finishM * comboMult).toFixed(3),
        interruptForce: ch.interruptForce
      };
      ST.addStatus(a, 'channeling', ch.ticks * 4 + 2);
      a.fx = { t: W.t, text: '🌀 เริ่มร่าย ' + p.nameTh };
      return;
    }
    // ท่าโจมตี (รองรับ Target Selector แบบยืดหยุ่น + เคารพผลของ Taunt โดยไม่ยัดเป้าเก่ากลับเข้าหน้าผู้ยั่วยุ)
    const targets = (C.COMPOSABLE_ENGINE && C.COMPOSABLE_ENGINE.selectTargets)
      ? C.COMPOSABLE_ENGINE.selectTargets(W, f, a, d, p)
      : (p.aoe ? C.enemies(W, f, a.id).filter(x => !d || Math.hypot(x.x - d.x, x.y - d.y) < 2.6) : (d ? [d] : []));
    const tauntActive = ST.statusOf(a, 'taunted', W.t) || ST.statusOf(a, 'taunt', W.t);
    const selKind = (p.composable && p.composable.targetSelector) || p.targetSelector || null;
    const isExplicitRedirectSelector = ['ALL_ENEMIES', 'LOWEST_HP_ENEMY', 'HIGHEST_ATK_ENEMY', 'MOST_DEBUFFED_ENEMY', 'ROW_BACK', 'MARKED_ENEMIES'].includes(selKind);
    if (!tauntActive && d && !targets.includes(d) && C.alive(d) && !p.self && !p.team && !isExplicitRedirectSelector) {
      const dInRange = !Number.isFinite(a.x) || !Number.isFinite(d.x) || (C.unitDist(a, d) <= (mSpec.max || 2.0) + 0.45 && (!mSpec.requiresLoS || C.checkLineOfSight(W, f, a, d, mSpec).clear));
      if (dInRange) targets.unshift(d);
    }
    if (targets.length > 0 && targets[0] && C.alive(targets[0]) && !selfAnchoredArch && (!p.self || isOffStrikeArch) && !p.team && p.arch !== 'harmonize' && Number.isFinite(targets[0].x) && Number.isFinite(targets[0].y)) {
      a.castFx.x = targets[0].x;
      a.castFx.y = targets[0].y;
    }
    snapshotCastTargets(targets.slice(0, 6), p.arch === 'command' || p.arch === 'harmonize' || p.arch === 'karmaReversal');
    const isAoeMulti = !!(p.aoe || targets.length > 1);
    const mas = masBase * comboMult; let dealt = 0;
    targets.slice(0, 6).forEach((t, tIdx) => {
      if (!C.alive(t)) return;
      for (let i = 0; i < (p.hits || 1); i++) {
        if (!C.alive(t)) break;
        const wpnAcc = (!a.foe && g.MARTIAL && g.MARTIAL.weaponCompatibility) ? (g.MARTIAL.weaponCompatibility(a, p.tech || p.id).accDelta || 0) : 0;
        const ricochetScale = p.arch === 'chainRicochet' ? Math.pow(0.92, tIdx) * (t.sx && t.sx.length ? 1.18 : 1.0) : (p.aoe && t !== d ? 0.8 : 1);
        const r = C.strike(W, f, a, t, { M: p.M * mas * ricochetScale, synDmgMult: p.synDmgMult || 1, accAdd: (p.elementAccAdd || 0) + wpnAcc, type: p.type, pen: p.pen, forced: p.arch === 'blink', label: i === 0 ? label : null, silent: i > 0, critAdd: p.critAdd || 0, critDmgAdd: p.critDmgAdd || 0, isSkill: true, isAoeMultiTarget: isAoeMulti, moveSpec: mSpec, arch: p.arch, skill: p });
        if (r.hit) {
          dealt += r.dmg;
          const actualT = (r.actualReceiverId && C.unit(W, r.actualReceiverId)) || t;
          if (tIdx === 0 && i === 0 && actualT && actualT !== t && !isAoeMulti && p.arch !== 'harmonize' && Number.isFinite(actualT.x) && Number.isFinite(actualT.y)) {
            a.castFx.x = actualT.x;
            a.castFx.y = actualT.y;
            snapshotCastTargets([actualT], false);
          }
          applyRiders(W, f, a, actualT, p, r);
          if (C.COMPOSABLE_ENGINE) {
            dealt += C.COMPOSABLE_ENGINE.postHitSkill(W, f, a, actualT, p, r) || 0;
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
    if (u.sx && u.sx.length) {
      for (let i = 0; i < u.sx.length; i++) {
        const x = u.sx[i];
        if (x && x.until <= W.t && (x.stacks || 1) > 1 && (x.stackDecayMode === 'LAYERED' || (COMPOSABLE_ENGINE && COMPOSABLE_ENGINE.MARK_KEYS && COMPOSABLE_ENGINE.MARK_KEYS.includes(x.k)) || ['chill', 'poison', 'bleed', 'burn'].includes(x.k))) {
          x.stacks -= 1;
          x.until = W.t + Math.max(4, Math.round((x.dur || 8) * 0.5));
        }
      }
    }
    if (ST.purgeExpired) ST.purgeExpired(u, W.t);
    if (!u.sx || !u.sx.length) return;
    const SK = SKs(); const keep = [];
    u.sx.forEach(x => {
      if (x.until <= W.t) {
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
        const hMult = C.healMultiplier ? C.healMultiplier(u, W.t) : 1.0;
        const hotAmt = Math.max(0, Math.round(C.hpMax(u) * (x.per || 0.035) * hMult));
        if (hotAmt > 0) {
          C.setHp(u, Math.min(C.hpMax(u), C.hp(u) + hotAmt));
          u.fx = { t: W.t, text: S.icon + ' +' + hotAmt };
        }
      }
    });
    if (keep.length !== u.sx.length) { u.sx = keep; ST.dirty(u); }
  };
  C.interruptChannel = (W, f, u, reason, interrupter) => {
    if (!u || !u.act || !u.act.ctx || !u.act.ctx.channeling) return false;
    const ch = u.act.ctx.channeling;
    STs().clearStatus(u, x => x.k === 'channeling');
    u.act.ctx.cds = u.act.ctx.cds || {};
    u.act.ctx.cds[ch.skillId] = W.t + Math.round(((ch.skill && ch.skill.cd) || 16) * 0.65);
    const skName = (ch.skill && ch.skill.nameTh) || 'วิชาร่ายต่อเนื่อง';
    const wasCharged = !!ch.isChargedSkill;
    delete u.act.ctx.channeling;
    if (wasCharged) {
      STs().addStatus(u, 'weaken', 8, null, W.t);
      u.lastChannelBacklash = { t: W.t, skillId: ch.skillId, skillNameTh: skName, reason: reason || 'ปราณชาร์จตีกลับ' };
    }
    u.fx = { t: W.t, text: '⚡ เสียสมาธิ!' };
    u.lastInterrupted = { t: W.t, skillId: ch.skillId, skillNameTh: skName, reason: reason || 'ถูกขัดจังหวะ', byId: interrupter ? interrupter.id : null };
    if (f) {
      const ft = C.ensureFightTac(f, W.t);
      ft.stats.interrupts = (ft.stats.interrupts || 0) + 1;
      C.recordTacticalHighlight(W, f, 'CHANNEL_INTERRUPT', C.name(u) + ' ถูกขัดจังหวะขณะร่าย「' + skName + '」(' + (reason || 'เสียสมาธิ') + ')', {
        actorId: interrupter ? interrupter.id : null, targetId: u.id, skillNameTh: skName, reasonTh: reason
      });
    }
    return true;
  };
  C.resolveChannelTick = (W, f, a, ctx) => {
    if (!ctx.channeling) return;
    const ch = ctx.channeling;
    let t = C.unit(W, ch.targetId);
    // Support point-locked AoE channeling if target died or moved outside locked point radius
    if (ch.lockType === 'POINT') {
      const rad = (ch.skill && ch.skill.range && ch.skill.range.radius) || 2.8;
      const cx = Number.isFinite(ch.lockX) ? ch.lockX : a.x;
      const cy = Number.isFinite(ch.lockY) ? ch.lockY : a.y;
      const en = C.enemies(W, f, a.id).filter(x => !Number.isFinite(x.x) || Math.hypot(x.x - cx, x.y - cy) <= rad);
      if (!C.alive(t) || !en.includes(t)) t = en[0] || null;
      if (!t) {
        ch.ticksLeft--;
        if (ch.ticksLeft <= 0) {
          STs().clearStatus(a, x => x.k === 'channeling');
          delete ctx.channeling;
        }
        return;
      }
    }
    if (!C.alive(t)) {
      STs().clearStatus(a, x => x.k === 'channeling');
      delete ctx.channeling;
      return;
    }
    // Check leashed range for unit-locked channeling
    if (ch.lockType !== 'POINT' && Number.isFinite(ch.maxRange) && Number.isFinite(a.x) && Number.isFinite(t.x)) {
      const dist = Math.hypot(a.x - t.x, a.y - t.y);
      const leash = Math.max(ch.maxRange || 4.2, ch.startDist || 0) + 1.65;
      if (dist > leash) {
        C.interruptChannel(W, f, a, 'เป้าหมายฉากหลบพ้นรัศมีร่าย');
        return;
      }
    }
    const isFinal = ch.ticksLeft <= 1;
    const mult = isFinal ? ch.finishM : ch.tickM;
    const r = C.strike(W, f, a, t, {
      M: mult,
      accAdd: (ch.skill && ch.skill.elementAccAdd) || 0,
      type: (ch.skill && ch.skill.type) || 'm',
      pen: (ch.skill && ch.skill.pen) || 0,
      skill: ch.skill,
      isSkill: true,
      label: isFinal ? '💥 ' + ch.skill.nameTh + ' ปะทุ!' : '🌀 คลื่นพลัง (' + (ch.totalTicks - ch.ticksLeft + 1) + '/' + ch.totalTicks + ')'
    });
    if (r.hit && ch.skill) {
      const actualT = (r.actualReceiverId && C.unit(W, r.actualReceiverId)) || t;
      applyRiders(W, f, a, actualT, ch.skill, r);
      if (isFinal && C.COMPOSABLE_ENGINE && C.COMPOSABLE_ENGINE.postHitSkill) {
        C.COMPOSABLE_ENGINE.postHitSkill(W, f, a, actualT, ch.skill, r);
      }
    }
    if (isFinal && ch.isChargedSkill) {
      a.lastChargedRelease = { t: W.t, skillId: ch.skillId, mult: mult, releaseMult: ch.releaseMult || 1.65, targetId: t.id, targetX: t.x, targetY: t.y, originX: a.x, originY: a.y };
    }
    ch.ticksLeft--;
    if (ch.ticksLeft <= 0 || !C.alive(t)) {
      STs().clearStatus(a, x => x.k === 'channeling');
      delete ctx.channeling;
      a.fx = { t: W.t, text: '✨ ปลดปล่อยสมบูรณ์' };
    }
  };
  C.tickChargedSkill = C.resolveChannelTick;
  C.attack = (W, f, a, d) => {
    const ST = STs(); a.fx = a.fx || {};
    const ctx = a.act && a.act.ctx ? a.act.ctx : {};
    if (ST.has(a, 'stun') || ST.has(a, 'paralyze') || ST.has(a, 'cryoStasis')) {
      if (ctx.channeling) C.interruptChannel(W, f, a, 'ติดสถานะมึนงง/สะกดร่าง');
      a.fx = { t: W.t, text: '💫' };
      return 3;
    }
    if (ctx.channeling) {
      if (ST.has(a, 'silence') || ST.has(a, 'acupointSealed')) {
        C.interruptChannel(W, f, a, 'ถูกผนึกวิชา/สกัดจุด');
        return 3;
      }
      C.resolveChannelTick(W, f, a, ctx);
      const sa = ST.get(a);
      return clamp(Math.round(250 / sa.cast), 2, 6);
    }
    const sa = ST.get(a), p = chooseSkill(W, f, a, d, ctx);
    if (p) { useSkill(W, f, a, d, p, ctx); return clamp(Math.round(p.wind * 100 / sa.cast), 2, 18); }
    // Basic attack range check: if out of basic weapon reach, step closer instead of hitting across map with basic attack
    const wp = (SKs() && SKs().weaponTacticalProfile) ? SKs().weaponTacticalProfile(a) : null;
    const basicReach = (wp && wp.engageRange) || 1.7;
    if (d && Number.isFinite(a.x) && Number.isFinite(d.x) && Math.hypot(a.x - d.x, a.y - d.y) > basicReach + 0.65) {
      moveToward(W, a, d.x, d.y, true, f);
      return 2;
    }
    C.strike(W, f, a, d, { M: 1 });
    return clamp(Math.round(400 / sa.cast), 2, 9);
  };
  C.slay = (W, f, killer, victim) => {
    if (!victim || victim._slaying || victim.dead) return;
    if (killer === victim) killer = null;
    victim._slaying = true;
    try {
      if (victim.isSummon) {
        victim.dead = true;
        if (victim.fx) victim.fx = { t: W.t, text: '💨 สลายร่าง' };
        return;
      }
      if (!victim.foe && victim.equip && victim.equip.WEAPON && ((victim.rank || 0) >= 4 || (victim.cult && (victim.cult.stage || 0) >= 4)) && (victim.equip.WEAPON.tier || 1) >= 3 && g.SECT && g.SECT.SOUL_FORGE && g.SECT.SOUL_FORGE.imbueElderSoulIntoWeapon) {
        g.SECT.SOUL_FORGE.imbueElderSoulIntoWeapon(W, victim, victim.equip.WEAPON);
      }
      if (!victim.foe && AI && AI.kill) {
        const deathReason = killer ? (killer.foe ? 'ถูก' + killer.name + 'สังหาร' : 'ถูก' + killer.h.name.given + 'สังหารในการดวล') : 'สิ้นชีพจากพิษหรือบาดแผลในการต่อสู้';
        AI.kill(W, victim, deathReason);
      }
      victim.dead = true;
      if (killer && !killer.foe && g.ECO && g.ECO.recordWeaponKill) {
        g.ECO.recordWeaponKill(W, killer, null, victim);
      }
      if (killer && !killer.foe && killer.daoOath && killer.daoOath.upheld && (killer.daoOath.id === 'VOW_NO_KILL' || killer.daoOath.id === 'VEGETARIAN_PACIFIST') && g.CULT && g.CULT.breakOathVow) {
        g.CULT.breakOathVow(W, killer, 'สังหารศัตรูละเมิดสัตย์สาบานเมตตาธรรม');
      }
      if (f) {
        const vAllies = C.alliesOf(W, f, victim.id).filter(u => u && u.id !== victim.id && C.alive(u));
        const vEnemies = C.enemies(W, f, victim.id).filter(u => u && C.alive(u));
        for (const al of vAllies) runPassiveProcs(W, f, al, killer || victim, 'onAllyFall', 0);
        for (const en of vEnemies) runPassiveProcs(W, f, en, victim, 'onEnemyFall', 0);
      }
      // PROP-12: Bind BLACK_THREAD on bereaved mentor, disciple, companion, or close friend
      if (W && Array.isArray(W.npcs) && !victim.foe && killer && g.SECT && g.SECT.DESTINY_KARMA && g.SECT.DESTINY_KARMA.bindThread) {
        W.npcs.forEach(n => {
          if (!n || n.dead || n.id === victim.id || n.id === killer.id) return;
          const isClose = n.companionId === victim.id || n.mentorId === victim.id || victim.mentorId === n.id || (SECT && SECT.rel && (SECT.rel(n, victim.id).a || 0) >= 45);
          if (isClose) {
            g.SECT.DESTINY_KARMA.bindThread(W, n, killer, 'BLACK_THREAD', 'หนี้แค้นสังหาร「' + C.name(victim) + '」');
          }
        });
      }
      if (killer && !killer.foe && !killer.dead && killer.cult && killer.cult.path === 'DEMON') {
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
        if (killer) {
          W.log('combat', C.name(killer) + ' สังหาร' + victim.name, killer.foe ? [] : [killer.id]);
          if (!killer.foe) { killer.stats = killer.stats || {}; killer.stats.kills = (killer.stats.kills || 0) + 1; HC.experience(killer, 'duel_win', 0.6); killer.merit += 3 + victim.tier * 2; }
        }
        return;
      }
      if (killer && !killer.foe) { HC.experience(killer, 'killed_foe', 0.8); const r = SECT.rel(killer, victim.id); AI.mem(W, killer, 'ปลิดชีพ ' + victim.h.name.given, 1, victim.id); killer.stats = killer.stats || {}; killer.stats.kills = (killer.stats.kills || 0) + 1; }
      if (W && W.sect && victim.id === W.sect.masterId && g.SECT && g.SECT.resolvePlayerSuccessionCrisis && (!f || f.kind !== 'leadership')) {
        g.SECT.resolvePlayerSuccessionCrisis(W, 'เจ้าสำนักเดิมสิ้นชีพในการต่อสู้');
      }
    } finally {
      delete victim._slaying;
    }
  };

  /* พฤติกรรมต่อนาทีของผู้ต่อสู้ที่เป็น NPC (Patch v3.0.0: Joint Tactical Engagement & Range-Aware Positioning) */
  C.fightStep = (W, n) => {
    const f = C.fightOf(W, n);
    if (!f || f.over) { C.leave(W, n); return; }
    if (n.dead) return;
    const ST = STs();
    if (n.yield || n.fled) { // ยอมแพ้/หนี: ถอยออกจากวงและพักรักษา
      if (n.fled && !n.fleeTo) { const b = W.map.byId.infirmary; n.fleeTo = { x: b.door.x, y: b.door.y }; AI.goTo(W, n, n.fleeTo.x, n.fleeTo.y); }
      if (n.path) AI.stepMove(W, n);
      return;
    }
    const ctx = n.act.ctx;
    C.statusTick(W, f, n);
    if (n.dead || n.yield || n.fled) return;
    const nTac = C.ensureUnitTac(n);
    if (nTac.reactionReadyAt <= W.t && nTac.reactionCharges < 1) nTac.reactionCharges = 1;
    if (!n.foe && n.equip && n.equip.WEAPON && ((n.equip.WEAPON.weaponSpirit && n.equip.WEAPON.weaponSpirit.stage >= 5) || (n.equip.WEAPON.weaponSpirit && n.equip.WEAPON.weaponSpirit.imbuedElderSoul) || n.equip.WEAPON.isAncestralSoulRelic) && n._weaponAvatarFightId !== f.id && g.SECT && g.SECT.SOUL_FORGE && g.SECT.SOUL_FORGE.manifestWeaponAvatar) {
      const avRes = g.SECT.SOUL_FORGE.manifestWeaponAvatar(W, f, n);
      if (avRes && avRes.ok) {
        n._weaponAvatarFightId = f.id;
        n._weaponAvatar = avRes.avatar;
      }
    }
    if (n.meridians && n.meridians.openedCount > 0 && !n.meridians.overdriveUsedInFight && hpFrac(n) < 0.25 && g.CULT && g.CULT.MERIDIANS && g.CULT.MERIDIANS.triggerOverdrive) {
      if (E(n, 'personality.courage') >= 55 || E(n, 'personality.aggression') >= 55 || n.meridians.autoOverdrive !== false) {
        g.CULT.MERIDIANS.triggerOverdrive(W, n, 36);
        n.fx = { t: W.t, text: '⚡ ระเบิดชีพจรพิสดาร!' };
      }
    }
    runPassiveProcs(W, f, n, null, 'combatTick', 0);
    if (n.h.state.qi != null && n.cult && !ST.has(n, 'stygianFreeze', W.t)) {
      const qm = CULT.qiMax(n);
      const hasConduit = ST.hasBuff && ST.hasBuff(n, 'qiConduit', W.t);
      const stSpec = ST.getActiveStanceSpec ? ST.getActiveStanceSpec(n) : null;
      const stQiMult = (stSpec && stSpec.qiRegenBonus) ? (1 + stSpec.qiRegenBonus) : 1.0;
      const qRegen = ((n.cult.path === 'XIAN' ? 0.0075 : 0.006) + (hasConduit ? 0.015 : 0)) * stQiMult;
      n.h.state.qi = Math.min(qm, n.h.state.qi + qm * qRegen);
    }
    // Check stun/paralyze BEFORE any movement so stunned disciples cannot walk (Fixes F5)
    if (ST.has(n, 'stun', W.t) || ST.has(n, 'paralyze', W.t) || ST.has(n, 'cryoStasis', W.t)) {
      if (ctx.channeling) C.interruptChannel(W, f, n, 'ติดมึนงง');
      n.path = null;
      n.fx = { t: W.t, text: '💫' };
      return;
    }
    if (f.state === 'gather') {
      const ar = f.arena;
      if (Math.hypot(n.x - ar.x, n.y - ar.y) > 5 + (f.A.indexOf(n.id) + f.B.indexOf(n.id) + 1) % 3) {
        if (!n.path) AI.goTo(W, n, Math.floor(ar.x + (C.sideOf(f, n.id) === 'A' ? -3 : 3)), Math.floor(ar.y));
        AI.stepMove(W, n);
      } else n.path = null;
      return;
    }

    // Fast-path when on attack cooldown in range, or walking between 4-tick re-evaluations
    if (ctx.target && !ctx.channeling) {
      const fastT = C.unit(W, ctx.target);
      if (fastT && C.alive(fastT) && !fastT.hidden && !fastT.away) {
        const fastD = Math.hypot(fastT.x - n.x, fastT.y - n.y);
        const engR = nTac.cachedEngageRange || 1.7;
        if (fastD <= engR && ctx.cd > 1) {
          n.face = fastT.x >= n.x ? 1 : -1;
          n.path = null;
          ctx.cd--;
          return;
        }
        if (fastD > engR && (W.t + (n.n || 0)) % 4 !== 0 && nTac.stuckTicks < 4) {
          moveToward(W, n, fastT.x, fastT.y, true, f);
          n.face = fastT.x >= n.x ? 1 : -1;
          return;
        }
      }
    }
    // Joint evaluation of target & ready technique ranges
    const eng = C.evaluateTacticalEngagement(W, f, n, ctx);
    nTac.cachedEngageRange = eng.desiredRange || 1.7;
    const t = eng.target;
    if (!t) return;
    const d = Math.hypot(t.x - n.x, t.y - n.y);

    if (!ctx.channeling && (ctx.cd || 0) <= 1 && n.pathGauge && n.pathGauge.ready && CULT.triggerPathGaugeFinisher) {
      const finisher = CULT.triggerPathGaugeFinisher(W, f, n, t);
      if (finisher && finisher.ok) { ctx.cd = 4; return; }
    }

    // Support / Healer with ready heal does not need to walk into enemy melee before casting heal
    if (!eng.canHealAlly && !ctx.channeling) {
      const engageLim = eng.desiredRange || 1.7;
      if (d > engageLim) {
        moveToward(W, n, t.x, t.y, true, f);
        n.face = t.x >= n.x ? 1 : -1;
        return;
      }
      // Ranged kiting step-back when closed on and minReadyRange > d (bounded by kiteStepCooldownUntil to prevent infinite kiting loop)
      const wProf = (SKs() && SKs().weaponTacticalProfile) ? SKs().weaponTacticalProfile(n) : null;
      if (wProf && wProf.reachClass === 'RANGED_KITE' && d < 1.15 && eng.minReadyRange >= 1.2 && nTac.kiteStepCooldownUntil <= W.t) {
        nTac.kiteStepCooldownUntil = W.t + 10;
        const dx = n.x - t.x, dy = n.y - t.y, dist = Math.max(0.1, Math.hypot(dx, dy));
        const proj = C.projectSafePosition(W, n.x, n.y, n.x + (dx / dist) * 1.4, n.y + (dy / dist) * 1.4);
        if (Math.hypot(proj.x - n.x, proj.y - n.y) >= 0.4) {
          n.x = proj.x; n.y = proj.y;
          nTac.closedOnBy = null; n._closedOnBy = null;
        }
      }
    }

    n.face = t.x >= n.x ? 1 : -1;
    n.path = null;
    if (--ctx.cd > 0) return;
    if (g.CPE && g.CPE.fightUse(W, n, ctx)) { ctx.cd = 2; return; }
    if (!n.foe && C.tryExecuteDuetSkill && (!n._duetCdUntil || W.t >= n._duetCdUntil) && C.alive(t)) {
      const allies = C.alliesOf(W, f, n.id).filter(al => al && al.id !== n.id && !al.foe && C.alive(al) && (!al._duetCdUntil || W.t >= al._duetCdUntil));
      for (let ai = 0; ai < allies.length; ai++) {
        const duetRes = C.tryExecuteDuetSkill(W, f, n, allies[ai], t);
        if (duetRes && duetRes.ok) {
          ctx.cd = 4;
          return;
        }
      }
    }
    ctx.cd = C.attack(W, f, n, t);
  };
  C.leave = (W, n) => {
    if (n.act && n.act.ctx && n.act.ctx.channeling) delete n.act.ctx.channeling;
    if (n.sx && n.sx.length) { n.sx = n.sx.filter(x => x && x.fromBuffCatalog && x.until > W.t); STs().dirty(n); }
    n.run = false; n.fleeTo = null; n.yield = false; n.fled = false; n.path = null; n.lastHurtBy = null; n._closedOnBy = null; n._gapClosedOn = null;
    n._kwAdaptiveStacks = 0; n._kwAdaptiveElem = null; n._absorbReleaseStored = 0; n._marksmanFocus = null;
    if (n.tac) { n.tac.closedOnBy = null; n.tac.gapClosedOn = null; n.tac.coveringAllyId = null; n.tac.stuckTicks = 0; }
    n.act = { id: 'idle', stage: 'do', left: 15, total: 15, ctx: {}, why: [] }; n.why = [];
  };

  /* พฤติกรรมศัตรูและผู้ช่วยรบ (foe / gateBeast / swornAlly / summon) */
  C.foeStep = (W, u) => {
    if (u.dead || u.gone || u.yield) {
      if (u.yield && u.act && u.act.ctx && u.act.ctx.channeling) delete u.act.ctx.channeling;
      return;
    }
    u.px = u.x; u.py = u.y;
    if (u.isSummon) {
      if (u.dur != null && --u.dur <= 0) {
        u.dead = true; u.gone = true;
        u.fx = { t: W.t, text: '💨 หมดเวลา' };
        return;
      }
    }
    if (u.fled) {
      moveToward(W, u, MAP.EXIT.x, MAP.EXIT.y, true);
      if (Math.hypot(u.x - MAP.EXIT.x, u.y - MAP.EXIT.y) < 3) { u.gone = true; }
      return;
    }
    const f = u.act && u.act.ctx && u.act.ctx.fid ? (W.fights || []).find(q => q.id === u.act.ctx.fid) : null;
    if (!f || f.over) { if (!u.isGateBeast && !u.isSwornAlly && !u.wild) u.gone = true; return; }
    const ctx = u.act.ctx;
    C.statusTick(W, f, u);
    if (u.dead || u.yield || u.fled) return;
    const ST = STs();
    if (ST.has(u, 'stun', W.t) || ST.has(u, 'paralyze', W.t) || ST.has(u, 'cryoStasis', W.t)) {
      if (ctx.channeling) C.interruptChannel(W, f, u, 'ติดมึนงง');
      return;
    }
    const uTac = C.ensureUnitTac(u);
    if (uTac.reactionReadyAt <= W.t && uTac.reactionCharges < 1) uTac.reactionCharges = 1;

    if (ctx.target && !ctx.channeling) {
      const fastT = C.unit(W, ctx.target);
      if (fastT && C.alive(fastT) && !fastT.hidden && !fastT.away) {
        const fastD = Math.hypot(fastT.x - u.x, fastT.y - u.y);
        const engR = uTac.cachedEngageRange || 1.7;
        if (fastD <= engR && ctx.cd > 1) {
          u.reachedCore = false;
          u.face = fastT.x >= u.x ? 1 : -1;
          ctx.cd--;
          return;
        }
        if (fastD > engR && (W.t + (u.n || 0)) % 4 !== 0 && uTac.stuckTicks < 4) {
          u.reachedCore = false;
          moveToward(W, u, fastT.x, fastT.y, false, f);
          return;
        }
      }
    }
    const eng = C.evaluateTacticalEngagement(W, f, u, ctx);
    uTac.cachedEngageRange = eng.desiredRange || 1.7;
    const t = eng.target;
    if (!t) {
      // If attacker is on raiding side B and no defenders are currently visible, advance toward Main Hall
      if (C.sideOf(f, u.id) === 'B' && f.kind === 'raid') {
        const mh = W.map && W.map.byId && W.map.byId.main_hall;
        if (mh) {
          const coreX = mh.x + mh.w / 2, coreY = mh.y + mh.h + 2;
          moveToward(W, u, coreX, coreY, false, f);
          u.reachedCore = Math.hypot(u.x - coreX, u.y - coreY) < 3.2;
        }
      }
      return;
    }
    u.reachedCore = false;
    const d = Math.hypot(t.x - u.x, t.y - u.y);
    const engageLim = eng.desiredRange || 1.7;
    if (d > engageLim && !ctx.channeling) {
      moveToward(W, u, t.x, t.y, false, f);
      return;
    }
    u.face = t.x >= u.x ? 1 : -1;
    if (--ctx.cd > 0) return;
    ctx.cd = C.attack(W, f, u, t);
  };

  /* สร้างสรุปเหตุการณ์ศึกสำหรับเชื่อมเข้าพงศาวดาร (Unified Combat Chronicle Payload — JS2-v2.6.0) */
  C.buildFightChroniclePayload = (W, f) => {
    if (!f) return null;
    const fTac = C.ensureFightTac(f, W && W.t);
    const durTicks = Math.max(1, ((W && W.t) || f.t0 || 0) - (fTac.combatStartedAt || f.t0 || 0));
    const highlights = (fTac.highlights || []).slice(0, 6);
    const st = fTac.stats || {};
    const parts = [];
    if (st.intercepts > 0) parts.push('เข้าคุ้มกัน/ขวางแนวยิง ' + st.intercepts + ' ครั้ง');
    if (st.losBlocks > 0) parts.push('ใช้สิ่งกีดขวางบังวิถี ' + st.losBlocks + ' ครั้ง');
    if (st.zocStrikes > 0) parts.push('สกัดกั้นเขตคุกคาม ' + st.zocStrikes + ' ครั้ง');
    if (st.interrupts > 0) parts.push('ขัดจังหวะร่ายวิชา ' + st.interrupts + ' ครั้ง');
    if (st.targetSwitches > 0) parts.push('เปลี่ยนเป้าหมายเชิงยุทธวิธี ' + st.targetSwitches + ' ครั้ง');
    const highlightText = highlights.map(h => h.textTh).filter(Boolean).slice(0, 3).join(' · ');
    const tacticalSummaryTh = parts.length ? parts.join(' · ') : 'ปะทะแลกเปลี่ยนกระบวนท่าตามระยะ';

    const unitsA = (f.A || []).map(id => C.unit(W, id)).filter(Boolean);
    const unitsB = (f.B || []).map(id => C.unit(W, id)).filter(Boolean);
    const allUnits = unitsA.concat(unitsB);
    const casualties = [];
    const injuredIds = [];
    const overdriveBacklashIds = [];
    let mvp = null, bestScore = -1;

    for (let i = 0; i < allUnits.length; i++) {
      const u = allUnits[i];
      if (!u || u.isSummon) continue;
      const side = (f.A || []).includes(u.id) ? 'A' : 'B';
      const uName = (u.h && u.h.name && g.HC && g.HC.fullName) ? g.HC.fullName(u) : C.name(u);
      if (u.dead) {
        casualties.push({ id: u.id, nameTh: uName, side, foe: !!u.foe });
      } else {
        const hpRatio = C.hp(u) / Math.max(1, C.hpMax(u));
        if (hpRatio < 0.45 || (Array.isArray(u.inj) && u.inj.length > 0)) {
          injuredIds.push(u.id);
        }
      }
      if (u.meridians && u.meridians.overdriveUsedInFight) {
        overdriveBacklashIds.push(u.id);
      }
      if (!u.foe) {
        const ic = (u.tac && u.tac.interceptCount) || 0;
        const kills = (u.stats && u.stats.kills) || 0;
        const wonBonus = (f.winner && f.winner === side) ? 3 : 0;
        const aliveBonus = u.dead ? 0 : 2;
        const sc = wonBonus + aliveBonus + ic * 2.5 + (kills > 0 ? Math.min(4, kills * 0.5) : 0);
        if (sc > bestScore) {
          bestScore = sc;
          mvp = { id: u.id, nameTh: uName, intercepts: ic, side, dead: !!u.dead };
        }
      }
    }

    const outcome = fTac.outcome || (f.winner === 'A' ? 'VICTORY_A' : f.winner === 'B' ? 'VICTORY_B' : 'DRAW');
    const outcomeLabelTh = {
      RAID_WIPED: 'กวาดล้างผู้บุกรุกสิ้นซาก',
      PYRRHIC_DEFENSE: 'ต้านศึกสำเร็จแม้สูญเสียหนัก',
      REPELLED_TIMEOUT: 'ตรึงแนวรับจนข้าศึกหมดกำลังล่าถอย',
      CORE_BREACHED: 'แนวรับหน้าด่านแตกพ่าย',
      VICTORY_A: 'ฝ่ายแรกคว้าชัย',
      VICTORY_B: 'ฝ่ายหลังคว้าชัย',
      MUTUAL_DOWN: 'สิ้นกำลังทั้งสองฝ่าย',
      TIMEOUT_DRAW: 'ประลองครบกำหนดโดยไม่รู้ผลแพ้ชนะ',
      DRAW: 'เสมอกัน'
    }[outcome] || 'ยุติการปะทะ';

    const summaryParts = [outcomeLabelTh + ' (' + durTicks + ' นาที)', tacticalSummaryTh];
    if (mvp && mvp.nameTh) summaryParts.push('ผู้โดดเด่น: ' + mvp.nameTh);
    if (casualties.length > 0) summaryParts.push('ผู้เสียชีวิต ' + casualties.length + ' ราย');
    const summaryLineTh = summaryParts.filter(Boolean).join(' · ');

    return {
      fightId: f.id,
      kind: f.kind,
      winner: f.winner,
      outcome,
      outcomeLabelTh,
      durationTicks: durTicks,
      stats: Object.assign({}, st),
      highlights,
      tacticalSummaryTh,
      narrativeHighlightTh: highlightText || '',
      summaryLineTh,
      mvp,
      casualties: casualties.slice(0, 6),
      injuredIds: injuredIds.slice(0, 8),
      overdriveBacklashIds: overdriveBacklashIds.slice(0, 4),
      countA: unitsA.length,
      countB: unitsB.length
    };
  };

  C.resolveFightCallback = (W, f, ws, winners, losers) => {
    if (typeof f.cb === 'function') {
      f.cb(W, f, ws, winners, losers);
      return;
    }
    const kind = f.cbKind || f.kind;
    if (kind === 'raid' && g.EXPED && g.EXPED.raidEnd) {
      g.EXPED.raidEnd(W, f, ws, winners, losers);
    } else if ((kind === 'duel' || kind === 'leadership' || kind === 'grudge') && C.duelEnd) {
      C.duelEnd(W, f, ws, winners, losers);
    } else if (kind === 'tourney' && W.sect && W.sect.tournament) {
      const T = W.sect.tournament;
      const x = f.A && f.A[0], y = f.B && f.B[0];
      const a = W.byId[x], b = W.byId[y];
      if (a && b) {
        const win = ws === 'A' ? x : ws === 'B' ? y : (CULT.power(a) >= CULT.power(b) ? x : y);
        T.nextAlive = T.nextAlive || [];
        if (!T.nextAlive.includes(win)) T.nextAlive.push(win);
        const lose = win === x ? b : a;
        if (W.byId[win] && !W.byId[win].dead) W.byId[win].merit += 4;
        if (lose && !lose.dead) AI.injure(W, lose, 1, 'บาดเจ็บในการประลอง');
        T.history = T.history || [];
        T.history.push(win);
        if (!T.queue || !T.queue.length) { T.alive = T.nextAlive.slice(); T.queue = []; }
      }
    }
  };

  /* ---------- วนรอบการต่อสู้ทุกนาที: ตัดสินผล ---------- */
  C.tick = W => {
    const fl = W.fights; if (!fl || !fl.length) { C.processQueue(W); C.tournamentTick(W); return; }
    for (const f of fl) {
      if (f.over) continue;
      const fTac = C.ensureFightTac(f, W.t);
      if (f.state === 'gather') {
        const all = [].concat(f.A, f.B).map(id => C.unit(W, id)).filter(Boolean);
        const near = all.every(u => Math.hypot(u.x - f.arena.x, u.y - f.arena.y) < 8);
        if (near || W.t - f.t0 > 240) {
          f.state = 'fight';
          fTac.combatStartedAt = W.t;
          all.forEach(u => { u.path = null; });
        }
        continue;
      }
      if (fTac.combatStartedAt == null) fTac.combatStartedAt = W.t;
      if (!f._roundStartFired && !fTac.roundStartFired) {
        f._roundStartFired = true;
        fTac.roundStartFired = true;
        [].concat(f.A, f.B).map(i => C.unit(W, i)).filter(C.alive).forEach(u => runPassiveProcs(W, f, u, null, 'onRoundStart', 0));
      }
      if (C.COMPOSABLE_ENGINE) {
        if (C.COMPOSABLE_ENGINE.tickDomain && f.activeDomain) C.COMPOSABLE_ENGINE.tickDomain(W, f);
        if (C.COMPOSABLE_ENGINE.tickDelayedEchoes && f.delayedEchoes && f.delayedEchoes.length) C.COMPOSABLE_ENGINE.tickDelayedEchoes(W, f);
        if (C.COMPOSABLE_ENGINE.decayElementalAuras) C.COMPOSABLE_ENGINE.decayElementalAuras(W, f);
      }
      const a = f.A.map(i => C.unit(W, i)).filter(C.alive), b = f.B.map(i => C.unit(W, i)).filter(C.alive);
      const elapsedFight = W.t - (fTac.combatStartedAt || f.t0);
      const timeout = elapsedFight > (f.kind === 'raid' ? 900 : 300);

      // Raid Inner Sanctum Breach check when no defenders are left or raiders hold the Main Hall
      if (f.kind === 'raid') {
        const mh = W.map && W.map.byId && W.map.byId.main_hall;
        const coreX = mh ? (mh.x + mh.w / 2) : 120, coreY = mh ? (mh.y + mh.h + 2) : 96;
        const raidersAtCore = b.some(u => u.reachedCore || (Number.isFinite(u.x) && Math.hypot(u.x - coreX, u.y - coreY) < 4.0));
        const defendersNearCore = a.some(u => Number.isFinite(u.x) && Math.hypot(u.x - coreX, u.y - coreY) < 6.5);
        if (raidersAtCore && !defendersNearCore) {
          fTac.breachTicks = (fTac.breachTicks || 0) + 1;
        } else {
          fTac.breachTicks = Math.max(0, (fTac.breachTicks || 0) - 1);
        }
      }

      const coreBreached = f.kind === 'raid' && (fTac.breachTicks >= 35 || (!a.length && b.length > 0));
      if (!a.length || !b.length || timeout || coreBreached) {
        [].concat(a, b).forEach(u => runPassiveProcs(W, f, u, null, 'onRoundEnd', 0));
        f.over = true;
        if (f.kind === 'raid') {
          if (!b.length) {
            f.winner = 'A';
            fTac.outcome = a.length ? 'RAID_WIPED' : 'PYRRHIC_DEFENSE';
          } else if (coreBreached || !a.length) {
            f.winner = 'B';
            fTac.outcome = 'CORE_BREACHED';
          } else if (timeout) {
            // Defenders held the sect gates until raiders' stamina/time expired!
            f.winner = 'A';
            fTac.outcome = 'REPELLED_TIMEOUT';
          }
        } else {
          if (!b.length && a.length) { f.winner = 'A'; fTac.outcome = 'VICTORY_A'; }
          else if (!a.length && b.length) { f.winner = 'B'; fTac.outcome = 'VICTORY_B'; }
          else if (!a.length && !b.length) { f.winner = null; fTac.outcome = 'MUTUAL_DOWN'; }
          else { f.winner = null; fTac.outcome = 'TIMEOUT_DRAW'; }
        }
        C.conclude(W, f);
      }
    }
    W.fights = fl.filter(f => !f.over || W.t - f.t0 < 5);
    C.processQueue(W); C.tournamentTick(W);
  };
  C.conclude = (W, f) => {
    if (!f) return;
    const fTac = C.ensureFightTac(f, W && W.t);
    if (fTac.concluded) return; // Strict idempotency guard: never pay rewards or record twice
    fTac.concluded = true;
    f.chroniclePayload = C.buildFightChroniclePayload(W, f);
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
          u.inj.push({
            id: 'MERIDIAN_OVERDRIVE_BACKLASH',
            part: 'ชีพจรปกครองร้าว',
            why: 'ผลสะท้อนหลังเร่งชีพจรพิสดารเกินขีดจำกัด (อัตราฝึกปราณ -30%)',
            sev: 2,
            cultPenaltyPct: 0.30,
            until: ((W && W.t) || 0) + 1440
          });
          u._cultRateBase = null;
          if (u.h && u.h.state) u.h.state.energy = Math.max(10, (u.h.state.energy || 50) - 20);
          STs().dirty(u);
        }
        if (C.hp(u) < C.hpMax(u) * 0.35 && g.CULT && g.CULT.EXPERIENCE_TRAITS && g.CULT.EXPERIENCE_TRAITS.recordExperienceEvent) {
          g.CULT.EXPERIENCE_TRAITS.recordExperienceEvent(W, u, 'SURVIVED_HEAVY_DEFEAT', 'fight:' + (f.id || W.t));
        }
        C.leave(W, u); u.yield = false; u.fled = false;
        if (!u.act || u.act.id === 'fight') u.act = { id: 'idle', stage: 'do', left: 20, total: 20, ctx: {}, why: [] };
      }
    });
    if (W.foes && W.foes.length) {
      W.foes = W.foes.filter(x => !x.isSummon || !x.dead);
    }
    if (f.kind === 'wild' && g.WILD) g.WILD.finish(W, f, ws);
    C.resolveFightCallback(W, f, ws, winners, losers);
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
    const cPayload = f.chroniclePayload || C.buildFightChroniclePayload(W, f);
    if (f.kind === "leadership") {
      const S = W.sect, ch = a, m = b;
      if (w === ch) {
        if (ch.post) { S.posts[ch.post] = null; ch.post = null; } if (S.deputyId === ch.id) S.deputyId = null;
        ch.rank = 6; S.masterId = ch.id; ch.sat = 88; if (!m.dead) { m.rank = 4; m.sat = Math.max(0, (m.sat || 60) - 30); }
        S.policyShift = W.day; W.fame(3);
        W.log("succession", ch.h.name.given + " ชนะการท้าชิง ขึ้นเป็นเจ้าสำนักคนใหม่แทน " + m.h.name.given, [ch.id, m.id], { combatSummary: cPayload, eventKey: "leadership_duel:" + f.id });
        if (m.dead) W.log("succession", "เจ้าสำนักเดิมเสียชีวิตจากการดวล", [m.id]);
        if (g.EXPED && g.EXPED.recordChronicle) {
          g.EXPED.recordChronicle(W, {
            category: "SUCCESSION",
            reportFormat: "ANCESTRAL_INSCRIPTION",
            icon: "👑",
            titleTh: "ศึกชิงบัลลังก์เจ้าสำนัก: " + HC.fullName(ch) + " โค่น " + HC.fullName(m),
            storyTh: HC.fullName(ch) + " เปิดศึกท้าชิงตำแหน่งเจ้าสำนักและเอาชนะ " + HC.fullName(m) + " กลางลานประลอง (" + (cPayload.summaryLineTh || "") + ")",
            combatBreakdownTh: cPayload.summaryLineTh || "",
            combatSummary: cPayload,
            consequenceTh: "ขึ้นดำรงตำแหน่งเจ้าสำนักคนใหม่ · ชื่อเสียงสำนัก +3",
            involvedSects: [S.name || "สำนักเมฆาหยก"],
            involvedFigures: [HC.fullName(ch), HC.fullName(m)],
            npcIds: [ch.id, m.id],
            quiet: true
          });
        }
      } else {
        W.log("challenge", m.h.name.given + " ชนะการท้าชิง รักษาตำแหน่งเจ้าสำนักไว้ได้", [m.id, ch.id], { combatSummary: cPayload, eventKey: "leadership_duel:" + f.id });
        if (!ch.dead) { const days = Math.round(2 + S.policy.strictness / 12); ch.jail = W.t + days * 1440; ch.sat = Math.max(0, (ch.sat || 50) - 12); W.log("punish", ch.h.name.given + " ถูกคุมขัง " + days + " วันฐานท้าชิงตำแหน่ง", [ch.id]); if (S.policy.strictness > 70 && S.policy.generosity < 40 && W.rng.chance(0.4)) { SECT.setRank(W, ch, Math.max(0, ch.rank - 1), "ท้าชิงล้มเหลว"); } }
        m.merit += 20;
      }
    } else if (f.kind === "grudge") {
      W.log("duel", w.h.name.given + " ชนะการดวลกับ " + (l ? l.h.name.given : "?") + (l && l.dead ? " (อีกฝ่ายเสียชีวิต)" : ""), [w.id, l && l.id], { combatSummary: cPayload, eventKey: "grudge_duel:" + f.id });
      if (l && l.dead) { W.sect.suspicion = (W.sect.suspicion || 0) + 3; if (W.sect.policy.strictness > 55) { w.jail = W.t + 3 * 1440; } }
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
      const finalizeRoundIfQueueEmpty = () => {
        if (!T.queue || !T.queue.length) {
          T.alive = Array.from(new Set((T.nextAlive || []).filter(id => W.byId[id] && !W.byId[id].dead)));
          T.queue = [];
          if (T.alive.length <= 1) C.tournamentEnd(W, T);
        }
      };
      const [x, y] = T.queue.shift(); const a = W.byId[x], b = W.byId[y];
      if (!a || !b || a.dead || b.dead) {
        T.nextAlive = T.nextAlive || [];
        if (a && !a.dead && !T.nextAlive.includes(x)) T.nextAlive.push(x);
        else if (b && !b.dead && !T.nextAlive.includes(y)) T.nextAlive.push(y);
        finalizeRoundIfQueueEmpty();
        return;
      }
      const busy = u => u.sealed || C.isUnitInActiveFight(W, u) || (u.act && (u.act.id === 'breakthrough' || u.act.id === 'fight')) || u.jail > W.t;
      if (busy(a) || busy(b)) {
        T.waitTicks = (T.waitTicks || 0) + 1;
        if (T.waitTicks <= 120) {
          T.queue.unshift([x, y]);
          return;
        }
        T.waitTicks = 0;
        T.nextAlive = T.nextAlive || [];
        if (!busy(a) && !a.dead && !T.nextAlive.includes(x)) T.nextAlive.push(x);
        else if (!busy(b) && !b.dead && !T.nextAlive.includes(y)) T.nextAlive.push(y);
        finalizeRoundIfQueueEmpty();
        return;
      }
      T.waitTicks = 0;
      const tg = W.map.byId.training_ground; const arena = { x: tg.x + tg.w / 2, y: tg.y + tg.h / 2 };
      T.cur = C.startFight(W, [x], [y], 'tourney', { serious: false, gather: true, arena, cb: (W2, f, ws) => { const win = ws === 'A' ? x : ws === 'B' ? y : (CULT.power(a) >= CULT.power(b) ? x : y); T.nextAlive = T.nextAlive || []; if (!T.nextAlive.includes(win)) T.nextAlive.push(win); const lose = win === x ? b : a; if (W2.byId[win] && !W2.byId[win].dead) { W2.byId[win].merit += 4; } if (lose && !lose.dead) AI.injure(W2, lose, 1, 'บาดเจ็บในการประลอง'); T.history = T.history || []; T.history.push(win); finalizeRoundIfQueueEmpty(); }, ctx: { t: 1 } });
    }
  };
  C.tournamentEnd = (W, T) => {
    const win = W.byId[T.alive[0]]; W.sect.tournament = null; if (!win) return;
    const avail = Math.max(0, (W.sect && W.sect.stones) || 0);
    const actualPrize = Math.min(T.prize || 0, avail);
    if (actualPrize > 0) {
      ECO.pay(W, actualPrize, 'รางวัลประลองยุทธ์');
    }
    if (win.inv) win.inv.stones = (win.inv.stones || 0) + actualPrize;
    win.merit += 35; HC.experience(win, 'duel_win', 1); W.fame(3);
    AI.mem(W, win, 'ชนะเลิศประลองยุทธ์สำนัก', 1);
    W.log('tournament', win.h.name.given + ' ชนะเลิศประลองยุทธ์สำนัก ได้รางวัล ' + actualPrize + ' ศิลา', [win.id]);
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
    if (!unit || unit.dead || unit.fled || unit.yield || (unit.h && unit.h.state && unit.h.state.hp <= 0) || !['ARRAY_TALISMAN', 'STRATEGY_GOVERNANCE', 'ASTRO_DIVINATION', 'DRAGON_VEIN_GEOMANCY', 'LORE_ARCHIVIST', 'MERCANTILE_DAO', 'ANCESTRAL_RITUAL'].includes(path)) return 0;
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

    if (typeof C.evaluateCrossPathSynergies === "function") {
      const cpSyn = C.evaluateCrossPathSynergies(alive);
      if (cpSyn && Array.isArray(cpSyn.matchedSynergies) && cpSyn.matchedSynergies.length) {
        for (const ms of cpSyn.matchedSynergies) {
          if (!synergies.some(s => s.id === ms.id)) {
            powerMult *= (1 + (ms.powerBonus || 0.10));
            mitigation += (ms.mitigationBonus || 0.04);
            synergies.push({ id: ms.id, nameTh: ms.nameTh, effect: ms.descTh });
            auras.push(ms.nameTh);
          }
        }
      }
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
      'sovereignPlague', 'stygianFreeze', 'weaponMelt', 'acupointSealed', 'disarmed',
      'meridianSeal', 'tempoBreak', 'guLeech', 'gravityCrush', 'contractDefault', 'voidRiftTear', 'entropyDecay'
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

  COMPOSABLE_ENGINE.checkTraitTriggerCondition = (W, f, actor, target, trTrig, normTrigger) => {
    if (trTrig === normTrigger) return true;
    const gd = (actor && actor.grandDaoState) || {};
    if (normTrigger === 'onRoundStart') {
      switch (trTrig) {
        case 'onWeatherSync': return !!(gd.skyQiSync || (W && W.sect && W.sect.activeWeatherMelody && W.sect.activeWeatherMelody.active) || (actor.cult && actor.cult.path === 'CELESTIAL_WEATHER'));
        case 'onStarAlign': return (gd.starDestinyStacks || 0) > 0 || (actor.cult && actor.cult.path === 'ASTRO_DIVINATION');
        case 'onMeritLotus': return (gd.bodhiMeritStacks || 0) > 0 || (actor.cult && actor.cult.path === 'BUDDHA_DHARMA');
        case 'onLeylinePulse': return !!(gd.anchoredVeinId || (W && W.sect && W.sect.geomancyState && Object.keys(W.sect.geomancyState.anchoredNodes || {}).length > 0) || (actor.cult && actor.cult.path === 'DRAGON_VEIN_GEOMANCY'));
        case 'onWayfarerStep': return (gd.routeInsightPoints || 0) > 0 || !!actor.aerialFlightActive || (actor.cult && actor.cult.path === 'WANDERING_DAO');
        case 'onTemporalRewind': return !!(gd.temporalSnapshot || actor.lastTemporalSandRewind || (actor.cult && actor.cult.path === 'CHRONO_EPOCH'));
        case 'onDeitySummon': return !!(actor.deityPact || actor.lastSummonDeityProjection || (actor.cult && actor.cult.path === 'DIVINE_SUMMONER'));
        case 'onAvatarDescent': return !!(actor.deityPact || actor.lastEnterAvatarTrance || (actor.cult && actor.cult.path === 'DIVINE_POSSESSION'));
        case 'onVowInvoke': return !!(actor.voluntaryVows && Object.values(actor.voluntaryVows).some(v => v && v.active)) || (actor.cult && actor.cult.path === 'OCCULT_MAGE');
        case 'onGraveResonance': return (gd.graveEchoStacks || 0) > 0 || !!(W && Array.isArray(W.graveyard) && W.graveyard.length > 0) || (actor.cult && actor.cult.path === 'NETHER_GRAVE');
        case 'onAuraPulse': return true;
        default: return false;
      }
    }
    if (normTrigger === 'onHit') {
      switch (trTrig) {
        case 'onContractBreach': return !!(target && (target.contractDefault || (target.sx && target.sx.some(x => x.k === 'contractDefault')))) || !!(W && W.sect && W.sect.contractLedger && (W.sect.contractLedger.activeCount > 0 || W.sect.contractLedger.breachedCount > 0)) || (actor.cult && actor.cult.path === 'MERCANTILE_DAO');
        case 'onGravityShift': return !!(actor._gravityFieldCdUntil || (target && target.sx && target.sx.some(x => x.k === 'gravityCrush' || x.k === 'slow')) || (actor.cult && actor.cult.path === 'GRAVITY_DAO'));
        case 'onBeastShift': return !!(actor._beastFusedUntil || gd.atavismForm || (actor.cult && actor.cult.path === 'PRIMORDIAL_SHIFTER'));
        case 'onVoidBlink': return (gd.voidPocketCharges || 0) > 0 || !!(actor.prevBlinkX != null || (actor.cult && actor.cult.path === 'VOID_SPACE'));
        case 'onGuIncubate': return (gd.symbioticGuTier || 0) >= 1 || (actor.cult && (actor.cult.path === 'VENOM_GU' || actor.cult.sub === 'VENOM_GU_SOVEREIGN'));
        case 'onLiteratiEdict': return !!(gd.imperialEdictActive || (actor.cult && actor.cult.path === 'INK_LITERATI'));
        case 'onMarionetteTether': return (gd.marionetteLinks || 0) >= 1 || (actor.cult && actor.cult.path === 'SOUL_PUPPETRY');
        case 'onChaosTransmute': return (gd.chaosEntropyStacks || 0) > 0 || (actor.cult && actor.cult.path === 'PRIMORDIAL_CHAOS');
        case 'onIaiDraw': return !!(CULT.isZeroQiSamurai && CULT.isZeroQiSamurai(actor));
        case 'onShadowCloneHit': return (actor._shadowClones || 0) > 0 || (actor.cult && actor.cult.path === 'NINPO_SHADOW');
        case 'onMudraComplete': return !!(actor.lastMudraExplosiveSeal || (actor.cult && actor.cult.path === 'NINPO_ELEMENTAL'));
        case 'onCosmicBorrow': return !!(actor.deityPact || (actor.cult && actor.cult.path === 'DIVINE_CHANNELER'));
        case 'onSanitySacrifice': return !!(actor.demonPact || (actor.h && actor.h.state && actor.h.state.heartDemon >= 15) || (actor.cult && actor.cult.path === 'VOID_HERETIC_PACT'));
        case 'onOrganDevour': return (gd.devouredOrgansCount || 0) > 0 || (actor.cult && actor.cult.path === 'DEVOURING_FLESH');
        default: return false;
      }
    }
    return false;
  };

  COMPOSABLE_ENGINE._evalSingleCondition = (kind, params, caster, target, W, f, tNow, ST, ctx) => {
    if (!kind || kind === 'ALWAYS') return true;
    params = Object.assign({}, params || {});
    if (typeof kind === 'string' && kind.includes(':')) {
      const parts = kind.split(':');
      kind = parts[0];
      const rawP = parts.slice(1).join(':');
      const numP = Number(rawP);
      if (Number.isFinite(numP)) {
        if (params.pct == null) params.pct = numP > 1 ? numP / 100 : numP;
        if (params.threshold == null) params.threshold = numP;
        if (params.minCount == null) params.minCount = numP;
      } else {
        params.value = rawP;
      }
    }
    const store = val => !!val;

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
        const kl = caster && caster.karmicLedger;
        return store((ks && (ks.debtPool || ks.karmicDebt || 0) > 0) || (caster && (caster.karmicDebt || 0) > 0) || !!(kl && ((kl.virtueKarma || 0) > 0 || (kl.netKarma || 0) > 0)));
      }
      case 'SIN_KARMA_HIGH': {
        const kills = (target && target.stats && target.stats.kills) || (target && target.killCount) || (caster && caster.stats && caster.stats.kills) || 0;
        const hd = (target && target.h && target.h.state && target.h.state.heartDemon) || 0;
        const tKl = target && target.karmicLedger;
        const cKl = caster && caster.karmicLedger;
        return store(kills >= 3 || hd >= 35 || !!(target && target.cult && target.cult.path === 'DEMON') || !!(tKl && ((tKl.sinKarma || 0) >= 25 || (tKl.netKarma || 0) <= -25)) || !!(cKl && (cKl.sinKarma || 0) >= 25));
      }
      case 'TARGET_HAS_BUFF':
        return store(target && Array.isArray(target.sx) && target.sx.some(x => x && x.until > tNow && SKs().STATUS[x.k] && SKs().STATUS[x.k].isBuff));
      case 'SELF_HAS_BUFF':
        return store(caster && ((Array.isArray(caster.sx) && caster.sx.some(x => x && x.until > tNow && SKs().STATUS[x.k] && SKs().STATUS[x.k].isBuff)) || (Array.isArray(caster.buffs) && caster.buffs.some(b => b && b.until > tNow))));
      case 'SELF_HAS_COMBO_READY':
        return store(caster && (ST.has(caster, 'comboReady', tNow) || (ST.hasBuff && ST.hasBuff(caster, 'comboReady', tNow))));
      case 'SELF_HAS_TOXICITY':
      case 'SELF_TOXICITY_ABOVE_PCT':
        return store(caster && !caster.foe && caster.cult && (caster.cult.toxic || 0) >= (params.threshold || 15));
      case 'SELF_HEART_DEMON_ABOVE_PCT':
        return store(caster && !caster.foe && caster.h && caster.h.state && (caster.h.state.heartDemon || 0) >= (params.threshold || 20));
      case 'SAME_PEAK_ALLY_PRESENT': {
        if (!caster || !caster.peakId || !f) return store(false);
        const allies = C.alliesOf(W, f, caster.id).filter(u => u && u.id !== caster.id && C.alive(u) && u.peakId === caster.peakId);
        return store(allies.length > 0);
      }
      case 'COMPANION_PRESENT': {
        if (!caster || !caster.companionId || !f) return store(false);
        const allies = C.alliesOf(W, f, caster.id).filter(u => u && u.id === caster.companionId && C.alive(u));
        return store(allies.length > 0);
      }
      case 'MENTOR_OR_DISCIPLE_PRESENT': {
        if (!caster || !f) return store(false);
        const allies = C.alliesOf(W, f, caster.id).filter(u => u && u.id !== caster.id && C.alive(u) && (u.id === caster.mentorId || u.id === caster.mentor || u.mentorId === caster.id || u.mentor === caster.id));
        return store(allies.length > 0);
      }
      case 'ELEMENT_RESONANCE_ACTIVE':
        return store(caster && !caster.foe && g.MARTIAL && g.MARTIAL.evaluateResonanceSet && g.MARTIAL.evaluateResonanceSet(caster).active);
      case 'TARGET_IS_ELEMENT': {
        const tEl = (target && (target.element || (target.h && target.h.root && target.h.root.primaryElement))) || '';
        return store(!params.value || String(tEl).toUpperCase() === String(params.value).toUpperCase());
      }
      case 'TARGET_HAS_STATUS_COUNT_GTE':
        return store(target && Array.isArray(target.sx) && target.sx.filter(x => x && x.until > tNow).length >= (params.minCount || 2));
      case 'ALLY_COUNT_ALIVE_GTE': {
        const allies = (f && caster && C.alliesOf) ? C.alliesOf(W, f, caster.id).filter(C.alive) : (caster ? [caster] : []);
        return store(allies.length >= (params.minCount || 2));
      }
      case 'ENEMY_COUNT_ALIVE_GTE': {
        const enemies = (f && caster && C.enemies) ? C.enemies(W, f, caster.id).filter(C.alive) : (target ? [target] : []);
        return store(enemies.length >= (params.minCount || 2));
      }
      case 'ROUND_NUMBER_GTE': {
        const elapsed = f ? Math.max(0, tNow - (f.t0 || 0)) : 0;
        return store(elapsed >= (params.minCount || 3) * 4);
      }
      case 'WEATHER_IS': {
        const rawWth = (ctx && ctx.weather) || (W && W.weather && (W.weather.kind || W.weather)) || '';
        return store(!params.value || String(rawWth).toUpperCase() === String(params.value).toUpperCase());
      }
      case 'TIME_OF_DAY_IS': {
        const tod = (W && W.timeOfDay != null) ? W.timeOfDay : ((tNow % 1440) / 60);
        const isNight = tod >= 19 || tod <= 5;
        return store(params.value === 'DAY' ? !isNight : isNight);
      }
      case 'LOCATION_TAG_IS':
        return store(true);
      case 'WIELDING_WEAPON_TYPE': {
        const wType = (!caster || caster.foe) ? (caster && caster.weaponType) : (g.MARTIAL && g.MARTIAL.equippedType ? g.MARTIAL.equippedType(caster) : 'FIST');
        return store(!params.value || String(wType).toUpperCase() === String(params.value).toUpperCase());
      }
      case 'FIRST_STRIKE_IN_FIGHT':
        return store(caster && (!f || !caster._firstStrikeFightId || caster._firstStrikeFightId !== f.id));
      case 'TARGET_IS_BOSS_OR_ELITE':
        return store(target && (C.isBossUnit(target) || (target.tier || (target.cult && target.cult.stage) || 1) >= 5));
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

  COMPOSABLE_ENGINE.REACTION_ID_ALIASES = Object.freeze({
    INFERNO_VORTEX: 'INFERNO_CYCLONE',
    OVERLOAD_BLAST: 'PLASMA_OVERLOAD',
    MIASMA_DETONATION: 'ASHEN_BLIGHT',
    GU_FIRE_ERUPTION: 'ASHEN_BLIGHT',
    BLOOD_BOIL_RUPTURE: 'BLOOD_BOIL_DETONATION',
    STARFALL_COLLAPSE: 'SOLAR_FLARE_NOVA',
    KARMIC_PURIFICATION_SMITE: 'TAIJI_ANNIHILATION'
  });

  COMPOSABLE_ENGINE.resolveElementalReactionSpec = (activeElements, catalystEl, explicitId) => {
    if (explicitId) {
      const targetId = COMPOSABLE_ENGINE.REACTION_ID_ALIASES[explicitId] || explicitId;
      const available = new Set((activeElements || []).map(e => String(e).toUpperCase()));
      if (catalystEl) available.add(String(catalystEl).toUpperCase());
      for (const tbl of [COMPOSABLE_ENGINE.TETRA_REACTIONS, COMPOSABLE_ENGINE.TRI_REACTIONS, COMPOSABLE_ENGINE.DUAL_REACTIONS]) {
        for (const spec of Object.values(tbl)) {
          if (spec.id === explicitId || spec.id === targetId || spec.code === explicitId) {
            if (!Array.isArray(spec.elements) || !spec.elements.every(el => available.has(String(el).toUpperCase()))) return null;
            return spec.id === explicitId ? spec : Object.assign({}, spec, { id: explicitId, canonicalId: spec.id });
          }
        }
      }
      return null;
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
          elements: spec.elements, tier: (spec.elements || []).length, targetId: t.id, dmg: reactDmg, targetX: t.x, targetY: t.y, originX: a.x, originY: a.y
        };
      }
    } finally {
      if (f) f._composableDepth = Math.max(0, (f._composableDepth || 1) - 1);
    }
    return { code: spec.code, id: spec.id, nameTh: spec.nameTh, dmg: reactDmg, tier: (spec.elements || []).length, spec };
  };

  /* ---------- Section 12.1: Acupoint Strikes & Meridian Overdrive ---------- */
  COMPOSABLE_ENGINE.ACUPOINT_STRIKES = Object.freeze({
    QI_BLOCK: {
      id: 'QI_BLOCK', nameTh: 'สกัดจุดตันเถียนปิดกั้นปราณ', dur: 12,
      status: 'acupointSealed', secondaryStatus: 'silence', qiDrainPct: 0.18,
      descTh: 'สกัดจุดตันเถียนของศัตรู ปิดกั้นการใช้ปราณ 2 เทิร์น พร้อมสลายปราณ 18%'
    },
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
    BLOOD_HALT: {
      id: 'BLOOD_HALT', nameTh: 'สกัดจุดชะลอโลหิตและห้ามเลือด', dur: 10,
      status: 'BLOOD_HALT', secondaryStatus: 'healBlock', allyHealPct: 0.18,
      descTh: 'ลดความเร็วเคลื่อนที่และระงับการฟื้นฟูเลือดของศัตรู หรือใช้ห้ามเลือดฟื้นฟูพันธมิตร'
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
    if (caster) caster.lastAcupointStrike = { t: tNow, pointId: spec.id, targetId: target.id, targetX: target.x, targetY: target.y, originX: caster.x, originY: caster.y };
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
          if (shVal <= 0) break;
          ST.clearStatus(t, x => x.k === 'shield' || x.k === 'guardUp');
          if (t.shieldBp) t.shieldBp = 0;
          ST.addStatus(t, 'armorbreak', 12, null, tNow);
          const shatterBurst = Math.max(8, Math.round(shVal * 0.65));
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
      case 'DISPLACE_VACUUM':
      case 'KNOCKBACK_TARGET':
      case 'PULL_VACUUM': {
        if (t && Number.isFinite(t.x) && Number.isFinite(a.x)) {
          const dx = t.x - a.x, dy = t.y - a.y, dist = Math.max(0.1, Math.hypot(dx, dy));
          const isKnockback = actionId === 'DISPLACE_KNOCKBACK' || actionId === 'KNOCKBACK_TARGET';
          const step = isKnockback ? (params.dist || 1.8) : -(params.dist || 1.4);
          const rawX = t.x + (dx / dist) * step;
          const rawY = t.y + (dy / dist) * step;
          const proj = C.projectSafePosition(W, t.x, t.y, rawX, rawY);
          t.x = proj.x;
          t.y = proj.y;
          const tTac = C.ensureUnitTac(t);
          if (isKnockback) { tTac.closedOnBy = null; t._closedOnBy = null; }
          if (t.act && t.act.ctx && t.act.ctx.channeling && Math.abs(step) >= 1.0) {
            C.interruptChannel(W, f, t, isKnockback ? 'ถูกซัดกระเด็นเสียหลัก' : 'ถูกแรงดึงปราณกระชาก', a);
          }
          if (proj.hitObstacle && isKnockback && C.alive(t)) {
            const wallDmg = Math.max(6, Math.round(C.hpMax(t) * 0.06));
            C.applyDamage(W, f, a, t, wallDmg, 'กระแทกสิ่งกีดขวาง');
            bonusDmg += wallDmg;
          }
          a.lastDisplacement = { t: tNow, kind: actionId, targetId: t.id, hitObstacle: proj.hitObstacle };
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
      case 'MASS_ABSORPTION': {
        const shAmt = Math.max(12, Math.round(C.hpMax(a) * 0.22));
        ST.addStatus(a, 'shield', 16, { amt: shAmt }, tNow);
        if (ST.applyNamedBuff && !a.foe) ST.applyNamedBuff(a, 'massGuard', 20, tNow, { casterId: a.id });
        if (CULT && CULT.GRAND_DAO_MECHANICS && CULT.GRAND_DAO_MECHANICS.applyGravityField) {
          CULT.GRAND_DAO_MECHANICS.applyGravityField(W, f, a, t, { free: true, ignoreCooldown: true });
        }
        if (t && C.alive(t)) {
          const isBoss = !!(t.isBoss || t.boss || t.rank === 'BOSS' || (t.tier && t.tier >= 7 && t.foe));
          if (!isBoss) ST.addStatus(t, 'gravityCrush', 10, null, tNow);
          else ST.addStatus(t, 'slow', 8, null, tNow);
          const sa = ST.get(a);
          const mDmg = Math.max(8, Math.round(Math.max(sa.atk || 40, sa.def || 40) * 0.30));
          C.applyDamage(W, f, a, t, mDmg, 'ดูดกลืนแรงกระแทกสะท้อนมวล');
          bonusDmg += mDmg;
        }
        a.lastMassAbsorption = { t: tNow, shield: shAmt, bonusDmg };
        break;
      }
      case 'SONIC_TEMPO_BREAK': {
        if (ST.applyNamedBuff && !a.foe) ST.applyNamedBuff(a, 'sonicHarmonyAura', 20, tNow, { casterId: a.id });
        if (t && C.alive(t)) {
          ST.addStatus(t, 'tempoBreak', 12, null, tNow);
          if (t.act && t.act.ctx && t.act.ctx.cds) {
            for (const skId of Object.keys(t.act.ctx.cds)) {
              t.act.ctx.cds[skId] = (t.act.ctx.cds[skId] || tNow) + 4;
            }
          }
          if (t.act && t.act.ctx && t.act.ctx.channeling) {
            C.interruptChannel(W, f, t, 'คลื่นเสียงสลายจังหวะร่าย', a);
          }
          const sa = ST.get(a);
          const sDmg = Math.max(8, Math.round((sa.matk || 45) * 0.32));
          C.applyDamage(W, f, a, t, sDmg, 'คลื่นเสียงสลายคูลดาวน์');
          bonusDmg += sDmg;
        }
        a.lastSonicTempoBreak = { t: tNow, targetId: t ? t.id : null, bonusDmg };
        break;
      }
      case 'MERIDIAN_SEAL': {
        if (t && C.alive(t)) {
          ST.addStatus(t, 'meridianSeal', 12, null, tNow);
          ST.addStatus(t, 'acupointSealed', 10, null, tNow);
          if (!t.foe && t.cult && t.h && t.h.state) {
            const qm = CULT.qiMax(t);
            t.h.state.qi = Math.max(0, (t.h.state.qi || 0) - Math.round(qm * 0.18));
          }
          const sa = ST.get(a);
          const nDmg = Math.max(8, Math.round(Math.max(sa.atk || 40, sa.matk || 40) * 0.32));
          C.applyDamage(W, f, a, t, nDmg, 'เข็มปิดชีพจรสะกดลมปราณ');
          bonusDmg += nDmg;
          t.fx = { t: tNow, text: '🪡 ผนึกชีพจรปราณ!' };
        }
        a.lastMeridianSeal = { t: tNow, targetId: t ? t.id : null, bonusDmg };
        break;
      }
      case 'VOID_POCKET_DEFENSE': {
        const shAmt = Math.max(12, Math.round(C.hpMax(a) * 0.20));
        ST.addStatus(a, 'shield', 16, { amt: shAmt }, tNow);
        if (ST.applyNamedBuff && !a.foe) ST.applyNamedBuff(a, 'astralMirage', 18, tNow, { casterId: a.id });
        if (t && C.alive(t)) {
          ST.addStatus(t, 'voidRiftTear', 12, { per: 0.018, src: a.id }, tNow);
          const sa = ST.get(a);
          const vDmg = Math.max(8, Math.round((sa.matk || 45) * 0.35));
          C.applyDamage(W, f, a, t, vDmg, 'ม่านมิติสะท้อนรอยแยกสุญญากาศ');
          bonusDmg += vDmg;
        }
        a.lastVoidPocketDefense = { t: tNow, shield: shAmt, bonusDmg };
        break;
      }
      case 'GU_SOUL_LEECH': {
        if (t && C.alive(t)) {
          ST.addStatus(t, 'guLeech', 14, { per: 0.022, src: a.id }, tNow);
          COMPOSABLE_ENGINE.applyMark(W, f, a, t, 'venomSeed', 1, 14);
          const sa = ST.get(a);
          const gDmg = Math.max(8, Math.round(Math.max(sa.atk || 40, sa.matk || 45) * 0.34));
          C.applyDamage(W, f, a, t, gDmg, 'หนอนกู่สูบวิญญาณ');
          bonusDmg += gDmg;
          const heal = Math.max(4, Math.round(gDmg * 0.45));
          C.setHp(a, Math.min(C.hpMax(a), C.hp(a) + heal));
          if (!a.foe && a.cult && a.h && a.h.state) {
            const qm = CULT.qiMax(a);
            a.h.state.qi = Math.min(qm, (a.h.state.qi || 0) + Math.round(qm * 0.14));
          }
        }
        a.lastGuSoulLeech = { t: tNow, targetId: t ? t.id : null, bonusDmg };
        break;
      }
      case 'STAR_FATE_REVERSAL': {
        if (ST.applyNamedBuff && !a.foe) ST.applyNamedBuff(a, 'starDestinyWard', 20, tNow, { casterId: a.id });
        ST.clearStatus(a, x => ['blind', 'weaken', 'slow', 'exposed'].includes(x.k));
        mult = 1.25;
        if (t && C.alive(t)) {
          COMPOSABLE_ENGINE.applyMark(W, f, a, t, 'starSeal', 2, 16);
          const sa = ST.get(a);
          const stDmg = Math.max(8, Math.round((sa.matk || 45) * 0.34));
          C.applyDamage(W, f, a, t, stDmg, 'พลิกชะตาดาราพยากรณ์');
          bonusDmg += stDmg;
        }
        a.lastStarFateReversal = { t: tNow, mult, bonusDmg };
        break;
      }
      case 'BODHI_KARMA_AEGIS': {
        const allies = f ? C.alliesOf(W, f, a.id).filter(C.alive) : [a];
        allies.forEach(al => {
          const ahm = C.hpMax(al);
          ST.addStatus(al, 'shield', 16, { amt: Math.round(ahm * 0.18) }, tNow);
          if (ST.applyNamedBuff && !al.foe) ST.applyNamedBuff(al, 'bodhiGrace', 20, tNow, { casterId: a.id });
          ST.clearStatus(al, x => ['curse', 'fear', 'poison', 'bleed'].includes(x.k));
        });
        if (t && C.alive(t)) {
          const sa = ST.get(a);
          const bDmg = Math.max(8, Math.round((sa.matk || 45) * 0.30));
          C.applyDamage(W, f, a, t, bDmg, 'เกราะบัวทองสะท้อนวิบาก');
          bonusDmg += bDmg;
        }
        a.lastBodhiKarmaAegis = { t: tNow, bonusDmg };
        break;
      }
      case 'WEATHER_THUNDER_CALL': {
        if (ST.applyNamedBuff && !a.foe) ST.applyNamedBuff(a, 'weatherConduct', 20, tNow, { casterId: a.id });
        const wKind = (W && W.weather && (W.weather.kind || W.weather)) || 'clear';
        const wBonus = ['storm', 'thunder_tempest', 'rain', 'snow'].includes(wKind) ? 1.35 : 1.12;
        if (t && C.alive(t)) {
          const sa = ST.get(a);
          const wDmg = Math.max(10, Math.round((sa.matk || 45) * 0.38 * wBonus));
          C.applyDamage(W, f, a, t, wDmg, 'อัญเชิญสายฟ้าสวรรค์ผสานดินฟ้า');
          ST.addStatus(t, 'paralyze', 8, null, tNow);
          bonusDmg += wDmg;
        }
        a.lastWeatherThunderCall = { t: tNow, weather: wKind, bonusDmg };
        break;
      }
      case 'CONTRACT_FORECLOSURE': {
        if (t && C.alive(t)) {
          ST.addStatus(t, 'contractDefault', 14, null, tNow);
          ST.addStatus(t, 'exposed', 12, null, tNow);
          const sa = ST.get(a);
          const cDmg = Math.max(10, Math.round(Math.max(sa.atk || 40, sa.matk || 45) * 0.38));
          C.applyDamage(W, f, a, t, cDmg, 'บังคับคดีริบปราณผิดสัญญา');
          bonusDmg += cDmg;
        }
        a.lastContractForeclosure = { t: tNow, targetId: t ? t.id : null, bonusDmg };
        break;
      }
      case 'LEYLINE_EARTH_SPIKE': {
        if (ST.applyNamedBuff && !a.foe) ST.applyNamedBuff(a, 'leylineBastion', 20, tNow, { casterId: a.id });
        if (t && C.alive(t)) {
          ST.addStatus(t, 'armorbreak', 12, null, tNow);
          ST.addStatus(t, 'slow', 10, null, tNow);
          const sa = ST.get(a);
          const lDmg = Math.max(10, Math.round(Math.max(sa.atk || 40, sa.matk || 45) * 0.36));
          C.applyDamage(W, f, a, t, lDmg, 'หนามปฐพีชีพจรมังกร');
          bonusDmg += lDmg;
        }
        a.lastLeylineEarthSpike = { t: tNow, bonusDmg };
        break;
      }
      case 'ATAVISM_FRENZY_BITE': {
        if (ST.applyNamedBuff && !a.foe) ST.applyNamedBuff(a, 'atavismFrenzy', 20, tNow, { casterId: a.id });
        mult = 1.24;
        if (t && C.alive(t)) {
          ST.addStatus(t, 'bleed', 12, { per: 0.020, src: a.id }, tNow);
          const sa = ST.get(a);
          const bDmg = Math.max(10, Math.round((sa.atk || 45) * 0.40));
          C.applyDamage(W, f, a, t, bDmg, 'เขี้ยวเทพอสูรบรรพกาลขย้ำ');
          bonusDmg += bDmg;
          C.setHp(a, Math.min(C.hpMax(a), C.hp(a) + Math.max(4, Math.round(bDmg * 0.30))));
        }
        a.lastAtavismFrenzyBite = { t: tNow, mult, bonusDmg };
        break;
      }
      case 'TEMPORAL_SAND_REWIND': {
        if (ST.applyNamedBuff && !a.foe) ST.applyNamedBuff(a, 'temporalHaste', 20, tNow, { casterId: a.id });
        if (a.act && a.act.ctx && a.act.ctx.cds) {
          for (const skId of Object.keys(a.act.ctx.cds)) {
            a.act.ctx.cds[skId] = Math.max(0, (a.act.ctx.cds[skId] || 0) - 4);
          }
        }
        const hm = C.hpMax(a);
        C.setHp(a, Math.min(hm, C.hp(a) + Math.max(5, Math.round(hm * 0.14))));
        if (!a.foe && a.cult && a.h && a.h.state) {
          const qm = CULT.qiMax(a);
          a.h.state.qi = Math.min(qm, (a.h.state.qi || 0) + Math.round(qm * 0.14));
        }
        if (t && C.alive(t)) {
          const sa = ST.get(a);
          const tmDmg = Math.max(8, Math.round((sa.matk || 45) * 0.32));
          C.applyDamage(W, f, a, t, tmDmg, 'ย้อนทรายกาลเวลาสะบั้น');
          bonusDmg += tmDmg;
        }
        a.lastTemporalSandRewind = { t: tNow, bonusDmg };
        break;
      }
      case 'IMPERIAL_INK_DECREE': {
        if (ST.applyNamedBuff && !a.foe) ST.applyNamedBuff(a, 'literatiDecree', 20, tNow, { casterId: a.id });
        if (t && C.alive(t)) {
          ST.addStatus(t, 'silence', 8, null, tNow);
          ST.addStatus(t, 'mdefbreak', 12, null, tNow);
          const sa = ST.get(a);
          const iDmg = Math.max(8, Math.round((sa.matk || 45) * 0.35));
          C.applyDamage(W, f, a, t, iDmg, 'อักษรราชโองการสวรรค์สะกด');
          bonusDmg += iDmg;
        }
        a.lastImperialInkDecree = { t: tNow, bonusDmg };
        break;
      }
      case 'MARIONETTE_SOUL_SWAP': {
        if (ST.applyNamedBuff && !a.foe) ST.applyNamedBuff(a, 'marionetteLink', 22, tNow, { casterId: a.id });
        if (t && C.alive(t)) {
          ST.addStatus(t, 'tetheredEnemy', 16, { linkedToId: t.id, shareRatio: 0.30 }, tNow);
          ST.addStatus(t, 'weaken', 12, null, tNow);
          const sa = ST.get(a);
          const mDmg = Math.max(8, Math.round((sa.matk || 45) * 0.34));
          C.applyDamage(W, f, a, t, mDmg, 'เชิดหุ่นสลับวิญญาณ');
          bonusDmg += mDmg;
        }
        a.lastMarionetteSoulSwap = { t: tNow, bonusDmg };
        break;
      }
      case 'CHAOS_ELEMENT_SHATTER': {
        if (ST.applyNamedBuff && !a.foe) ST.applyNamedBuff(a, 'chaosEntropyShield', 20, tNow, { casterId: a.id });
        if (t && C.alive(t)) {
          ST.addStatus(t, 'entropyDecay', 14, { per: 0.022, src: a.id }, tNow);
          ST.clearStatus(t, x => SKs().STATUS[x.k] && SKs().STATUS[x.k].isBuff);
          const sa = ST.get(a);
          const chDmg = Math.max(10, Math.round(Math.max(sa.atk || 45, sa.matk || 45) * 0.38));
          C.setHp(t, Math.max(1, C.hp(t) - Math.round(chDmg * 0.45)));
          C.applyDamage(W, f, a, t, Math.round(chDmg * 0.55), 'ปราณโกลาหลทลายเบญจธาตุ');
          bonusDmg += chDmg;
        }
        a.lastChaosElementShatter = { t: tNow, bonusDmg };
        break;
      }
      case 'IAI_ZERO_QI_SLASH': {
        if (ST.applyNamedBuff && !a.foe) ST.applyNamedBuff(a, 'parryCounter', 20, tNow, { casterId: a.id });
        if (a.cult && a.cult.path === 'SHADOW_SAMURAI' && a.h && a.h.state) a.h.state.qi = 0;
        if (t && C.alive(t)) {
          ST.clearStatus(t, x => x.k === 'shield');
          ST.addStatus(t, 'bleed', 12, { per: 0.020, src: a.id }, tNow);
          const sa = ST.get(a);
          const iaiDmg = Math.max(14, Math.round((sa.atk || 55) * 0.46));
          C.setHp(t, Math.max(1, C.hp(t) - Math.round(iaiDmg * 0.50)));
          C.applyDamage(W, f, a, t, Math.round(iaiDmg * 0.50), 'เพลงดาบอิไอไร้เงาผ่าเกราะ');
          bonusDmg += iaiDmg;
        }
        a.lastIaiZeroQiSlash = { t: tNow, bonusDmg };
        break;
      }
      case 'SPAWN_SHADOW_CLONE': {
        a._shadowClones = Math.min(3, (a._shadowClones || 0) + 1);
        if (ST.applyNamedBuff && !a.foe) ST.applyNamedBuff(a, 'shadowClone', 24, tNow, { casterId: a.id });
        else ST.addStatus(a, 'shadowClone', 24, null, tNow);
        if (t && C.alive(t)) {
          ST.addStatus(t, 'blind', 8, null, tNow);
          const sa = ST.get(a);
          const shDmg = Math.max(8, Math.round((sa.atk || 45) * 0.28));
          C.applyDamage(W, f, a, t, shDmg, 'ร่างแยกเงาลอบสังหาร');
          bonusDmg += shDmg;
        }
        a.lastSpawnShadowClone = { t: tNow, clones: a._shadowClones, bonusDmg };
        break;
      }
      case 'MUDRA_EXPLOSIVE_SEAL': {
        if (ST.applyNamedBuff && !a.foe) ST.applyNamedBuff(a, 'substitutionReady', 28, tNow, { casterId: a.id });
        else ST.addStatus(a, 'substitutionReady', 28, null, tNow);
        if (t && C.alive(t)) {
          ST.addStatus(t, 'burn', 12, { per: 0.018, src: a.id }, tNow);
          const sa = ST.get(a);
          const mDmg = Math.max(10, Math.round(Math.max(sa.matk || 48, sa.atk || 42) * 0.36));
          C.applyDamage(W, f, a, t, mDmg, 'ค่ายกลยันต์ระเบิดประสานมุทรา');
          bonusDmg += mDmg;
        }
        a.lastMudraExplosiveSeal = { t: tNow, bonusDmg };
        break;
      }
      case 'SUMMON_DEITY_PROJECTION': {
        let scaleMult = 1.25;
        if (CULT && CULT.HIGHER_REALMS_PANTHEON) {
          const inv = CULT.HIGHER_REALMS_PANTHEON.invokeDivineManifestation(W, f, a, t, 'SUMMON');
          if (inv && inv.combatPowerMult) scaleMult = inv.combatPowerMult;
        }
        if (ST.applyNamedBuff && !a.foe) ST.applyNamedBuff(a, 'divineResonance', 24, tNow, { casterId: a.id });
        if (t && C.alive(t)) {
          const sa = ST.get(a);
          const dDmg = Math.max(12, Math.round(Math.max(sa.matk || 50, sa.atk || 45) * 0.34 * scaleMult));
          C.applyDamage(W, f, a, t, dDmg, 'อัญเชิญเงาทวยเทพเบื้องบน');
          bonusDmg += dDmg;
        }
        a.lastSummonDeityProjection = { t: tNow, scaleMult, bonusDmg };
        break;
      }
      case 'ENTER_AVATAR_TRANCE': {
        let scaleMult = 1.30;
        if (CULT && CULT.HIGHER_REALMS_PANTHEON) {
          const inv = CULT.HIGHER_REALMS_PANTHEON.invokeDivineManifestation(W, f, a, t, 'POSSESSION');
          if (inv && inv.combatPowerMult) scaleMult = inv.combatPowerMult;
        }
        if (ST.applyNamedBuff && !a.foe) ST.applyNamedBuff(a, 'divineResonance', 26, tNow, { casterId: a.id });
        const hm = C.hpMax(a);
        const hAmt = Math.max(6, Math.round(hm * 0.12));
        C.setHp(a, Math.min(hm, C.hp(a) + hAmt));
        if (t && C.alive(t)) {
          const sa = ST.get(a);
          const avDmg = Math.max(12, Math.round(Math.max(sa.atk || 50, sa.matk || 50) * 0.36 * scaleMult));
          C.applyDamage(W, f, a, t, avDmg, 'เทวะประทับร่างจำแลงอวตาร');
          bonusDmg += avDmg;
        }
        a.lastEnterAvatarTrance = { t: tNow, scaleMult, bonusDmg, healAmt: hAmt };
        break;
      }
      case 'BORROW_COSMIC_LAW': {
        if (CULT && CULT.HIGHER_REALMS_PANTHEON) {
          CULT.HIGHER_REALMS_PANTHEON.invokeDivineManifestation(W, f, a, t, 'CHANNEL');
        }
        if (ST.applyNamedBuff && !a.foe) ST.applyNamedBuff(a, 'divineResonance', 22, tNow, { casterId: a.id });
        if (t && C.alive(t)) {
          ST.addStatus(t, 'meridianSeal', 10, null, tNow);
          const sa = ST.get(a);
          const bwDmg = Math.max(11, Math.round(Math.max(sa.atk || 48, sa.matk || 48) * 0.35));
          C.applyDamage(W, f, a, t, bwDmg, 'ยืมกฎฟ้าพิพากษาชีพจร');
          bonusDmg += bwDmg;
        }
        a.lastBorrowCosmicLaw = { t: tNow, bonusDmg };
        break;
      }
      case 'ELDRITCH_SANITY_BLAST': {
        if (ST.applyNamedBuff && !a.foe) ST.applyNamedBuff(a, 'sanityStrain', 22, tNow, { casterId: a.id });
        if (t && C.alive(t)) {
          ST.addStatus(t, 'fear', 8, null, tNow);
          ST.addStatus(t, 'voidRiftTear', 12, { per: 0.020, src: a.id }, tNow);
          const sa = ST.get(a);
          const elDmg = Math.max(12, Math.round((sa.matk || 52) * 0.42));
          C.setHp(t, Math.max(1, C.hp(t) - Math.round(elDmg * 0.50)));
          C.applyDamage(W, f, a, t, Math.round(elDmg * 0.50), 'คลื่นวิปลาสนอกมิติทะลุเกราะ');
          bonusDmg += elDmg;
        }
        a.lastEldritchSanityBlast = { t: tNow, bonusDmg };
        break;
      }
      case 'KHMER_YANTRA_WARD': {
        const yShield = Math.max(14, Math.round(C.hpMax(a) * 0.24));
        ST.addStatus(a, 'shield', 18, { amt: yShield }, tNow);
        if (ST.applyNamedBuff && !a.foe) ST.applyNamedBuff(a, 'ironSkin', 22, tNow, { casterId: a.id });
        if (t && C.alive(t)) {
          ST.addStatus(t, 'guLeech', 12, { per: 0.018, src: a.id }, tNow);
          const sa = ST.get(a);
          const yDmg = Math.max(9, Math.round(Math.max(sa.matk || 45, sa.atk || 45) * 0.30));
          C.applyDamage(W, f, a, t, yDmg, 'มหาเวทย์อาคมคงกระพัน');
          bonusDmg += yDmg;
        }
        a.lastKhmerYantraWard = { t: tNow, shield: yShield, bonusDmg };
        break;
      }
      case 'DEVOUR_ESSENCE_BITE': {
        let healAmt = 0;
        a._boneArmorHp = Math.max(18, Math.round(C.hpMax(a) * 0.25));
        if (ST.applyNamedBuff && !a.foe) ST.applyNamedBuff(a, 'boneArmor', 24, tNow, { casterId: a.id });
        if (t && C.alive(t)) {
          ST.addStatus(t, 'armorbreak', 12, null, tNow);
          const sa = ST.get(a);
          const dvDmg = Math.max(11, Math.round((sa.atk || 50) * 0.36));
          C.applyDamage(W, f, a, t, dvDmg, 'กลืนกินสรีระหลอมอวัยวะเร้นลับ');
          bonusDmg += dvDmg;
          const dvHeal = Math.max(5, Math.round(dvDmg * 0.45));
          C.setHp(a, Math.min(C.hpMax(a), C.hp(a) + dvHeal));
          healAmt += dvHeal;
        }
        a.lastDevourEssenceBite = { t: tNow, bonusDmg, healAmt };
        break;
      }
      case 'GRAVE_CORPSE_DETONATE': {
        const graveBonus = (W && Array.isArray(W.graveyard)) ? Math.min(0.35, W.graveyard.length * 0.02) : 0.10;
        a._boneArmorHp = Math.max(18, Math.round(C.hpMax(a) * (0.25 + graveBonus * 0.5)));
        if (ST.applyNamedBuff && !a.foe) ST.applyNamedBuff(a, 'boneArmor', 24, tNow, { casterId: a.id });
        if (t && C.alive(t)) {
          ST.addStatus(t, 'fear', 8, null, tNow);
          const sa = ST.get(a);
          const grDmg = Math.max(11, Math.round((sa.matk || 48) * (0.35 + graveBonus)));
          C.applyDamage(W, f, a, t, grDmg, 'ระเบิดซากศพเพลิงวิญญาณสุสาน');
          bonusDmg += grDmg;
        }
        a.lastGraveCorpseDetonate = { t: tNow, bonusDmg };
        break;
      }
      case 'TRUE_PIERCE_DMG': {
        if (t && C.alive(t)) {
          const sa = ST.get(a);
          const pierceMult = (params.bonusStats && params.bonusStats.atkPct) ? (0.28 + params.bonusStats.atkPct) : (params.trueDmgMult || 0.32);
          const pDmg = Math.max(8, Math.round(Math.max(sa.atk || 40, sa.matk || 40) * pierceMult));
          C.applyDamage(W, f, a, t, pDmg, 'ปราณเจาะเกราะแท้จริง');
          bonusDmg += pDmg;
          a.lastTruePierceDmg = { t: tNow, targetId: t.id, bonusDmg: pDmg };
        }
        break;
      }
      case 'GRANT_BARRIER': {
        const shPct = (params.bonusStats && params.bonusStats.defPct) ? (0.16 + params.bonusStats.defPct) : (params.shieldPct || 0.20);
        const shAmt = Math.max(12, Math.round(C.hpMax(a) * shPct));
        ST.addStatus(a, 'shield', params.dur || 16, { amt: shAmt }, tNow);
        a.lastGrantBarrier = { t: tNow, shield: shAmt };
        break;
      }
      case 'APPLY_MARK': {
        if (t && C.alive(t)) {
          const mKind = params.markKind || (a.cult && a.cult.path === 'ASTRO_DIVINATION' ? 'starSeal' : 'daoMark');
          COMPOSABLE_ENGINE.applyMark(W, f, a, t, mKind, params.markStacks || 1, params.dur || 14);
          a.lastApplyMark = { t: tNow, targetId: t.id, markKind: mKind };
        }
        break;
      }
      case 'CHAIN_FOLLOWUP': {
        mult = params.followupMult || 1.18;
        if (t && C.alive(t)) {
          const sa = ST.get(a);
          const fDmg = Math.max(6, Math.round(Math.max(sa.atk || 40, sa.matk || 40) * 0.26));
          C.applyDamage(W, f, a, t, fDmg, 'กระบวนท่าต่อเนื่อง');
          bonusDmg += fDmg;
          a.lastChainFollowup = { t: tNow, targetId: t.id, bonusDmg: fDmg, mult };
        }
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
      // statusTick applies the stack multiplier; store the per-stack rate only.
      per: kind === 'venomSeed' ? 0.008 : 0
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
      caster.lastMarkDetonation = { t: W.t, targetId: target.id, stacks, bonusDmg: rawBonus, targetX: target.x, targetY: target.y, originX: caster.x, originY: caster.y };
    } finally {
      if (f) f._composableDepth = Math.max(0, (f._composableDepth || 1) - 1);
    }
    return { detonatedStacks: stacks, bonusDmg: rawBonus };
  };

  COMPOSABLE_ENGINE.selectTargets = (W, f, a, d, p, opts) => {
    if (typeof p === "string") {
      p = Object.assign({ targetSelector: p, aoe: true, range: opts ? { shape: opts.shape || (p === "ENEMIES_CONE_3" ? "CONE" : "LINE"), max: opts.maxRange || opts.max || 4.5, radius: opts.lineWidth || opts.radius || 1.2 } : null }, opts || {});
    }
    const comp = (p && p.composable) || {};
    const sel = comp.targetSelector || (p && p.targetSelector) || null;
    const enemies = C.enemies(W, f, a.id).filter(u => C.alive(u));
    const allies = C.alliesOf(W, f, a.id).filter(u => C.alive(u));
    const mSpec = (p && p.range) || ((p && SKs() && SKs().resolveMoveSpatialSpec) ? SKs().resolveMoveSpatialSpec(p, a) : null);
    // Taunt override for single-target enemy selectors
    const tauntStatus = STs().statusOf(a, 'taunted', W.t) || STs().statusOf(a, 'taunt', W.t);
    if (tauntStatus && tauntStatus.taunterId) {
      const taunter = enemies.find(u => u.id === tauntStatus.taunterId);
      if (taunter && !p.aoe && (!sel || sel === 'SINGLE_ENEMY' || sel === 'SINGLE_PRIMARY' || sel === 'LOWEST_HP_ENEMY' || sel === 'HIGHEST_ATK_ENEMY')) {
        return [taunter];
      }
    }
    const ox = (d && Number.isFinite(d.x)) ? d.x : (a && Number.isFinite(a.x) ? a.x : 0);
    const oy = (d && Number.isFinite(d.y)) ? d.y : (a && Number.isFinite(a.y) ? a.y : 0);
    const sortByDistToOrigin = (list, cx, cy) => list.slice().sort((x, y) => Math.hypot((x.x || 0) - cx, (x.y || 0) - cy) - Math.hypot((y.x || 0) - cx, (y.y || 0) - cy));

    if (!sel || sel === 'ENEMIES_CONE_3') {
      if (sel === 'ENEMIES_CONE_3') { p = Object.assign({}, p, { aoe: true }); }
      if (p && p.arch === 'chainRicochet') {
        return sortByDistToOrigin(enemies, ox, oy).slice(0, 4);
      }
      if (p && p.aoe) {
        const rad = (mSpec && mSpec.radius > 0) ? mSpec.radius : 2.8;
        if (mSpec && mSpec.shape === 'CIRCLE_SELF' && Number.isFinite(a.x)) {
          const hitSelfCircle = enemies.filter(x => !Number.isFinite(x.x) || Math.hypot(x.x - a.x, x.y - a.y) <= rad);
          return hitSelfCircle.length ? hitSelfCircle : (d ? [d] : enemies.slice(0, 1));
        }
        if (mSpec && mSpec.shape === 'CONE' && d && Number.isFinite(a.x) && Number.isFinite(d.x)) {
          const dirX = d.x - a.x, dirY = d.y - a.y, dirLen = Math.max(0.01, Math.hypot(dirX, dirY));
          const coneHits = enemies.filter(x => {
            if (!Number.isFinite(x.x)) return true;
            const vx = x.x - a.x, vy = x.y - a.y, vLen = Math.hypot(vx, vy);
            if (vLen > Math.max(rad, mSpec.max || 3.6)) return false;
            if (vLen < 0.2) return true;
            const cos = (vx * dirX + vy * dirY) / (vLen * dirLen);
            return cos >= 0.35; // ~70 deg half-angle fan
          });
          return coneHits.length ? coneHits : [d];
        }
        const hitTargetCircle = enemies.filter(x => !d || !Number.isFinite(x.x) || Math.hypot(x.x - ox, x.y - oy) <= rad);
        return hitTargetCircle.length ? hitTargetCircle : (d ? [d] : enemies.slice(0, 1));
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
    if (sel === 'SUMMON_OR_PUPPET' || sel === 'SUMMON_UNITS') {
      const sums = allies.filter(u => u.isSummon || (u.cult && u.cult.path === 'MECH_PUPPET'));
      return sums.length ? sums : [a];
    }
    if (!enemies.length) return d ? [d] : [];
    if (sel === 'ALL_ENEMIES') {
      const maxRange = mSpec && Number.isFinite(mSpec.max) ? mSpec.max : 2.0;
      const inRange = enemies.filter(u => !u.hidden && !u.away && (!Number.isFinite(a.x) || !Number.isFinite(a.y) || !Number.isFinite(u.x) || !Number.isFinite(u.y) || (C.unitDist(a, u) <= maxRange + 0.45 && (!mSpec || !mSpec.requiresLoS || C.checkLineOfSight(W, f, a, u, mSpec).clear))));
      return sortByDistToOrigin(inRange, a.x || 0, a.y || 0);
    }
    if (sel === 'ROW_FRONT') {
      return sortByDistToOrigin(enemies, a.x || 0, a.y || 0).slice(0, 2);
    }
    if (sel === 'ROW_BACK') {
      return sortByDistToOrigin(enemies, a.x || 0, a.y || 0).reverse().slice(0, 2);
    }
    if (sel === 'LOWEST_HP_ENEMY') {
      return enemies.slice().sort((x, y) => (C.hp(x) / Math.max(1, C.hpMax(x))) - (C.hp(y) / Math.max(1, C.hpMax(y)))).slice(0, 1);
    }
    if (sel === 'HIGHEST_ATK_ENEMY') {
      const ST = STs();
      return enemies.slice().sort((x, y) => Math.max(ST.get(y).atk, ST.get(y).matk) - Math.max(ST.get(x).atk, ST.get(x).matk)).slice(0, 1);
    }
    if (sel === 'MOST_DEBUFFED_ENEMY') {
      return enemies.slice().sort((x, y) => ((y.sx ? y.sx.length : 0) - (x.sx ? x.sx.length : 0))).slice(0, 1);
    }
    if (sel === 'MARKED_ENEMIES') {
      const marked = enemies.filter(u => COMPOSABLE_ENGINE.totalMarksOn(u, W.t) > 0 || (u.sx && u.sx.some(s => s.until > W.t && ['burn', 'bleed', 'poison', 'curse'].includes(s.k))));
      return marked.length ? marked : (d ? [d] : enemies.slice(0, 1));
    }
    if (sel === 'PIERCE_LINE' && d && Number.isFinite(a.x) && Number.isFinite(d.x)) {
      const dx = d.x - a.x, dy = d.y - a.y, len = Math.max(0.1, Math.hypot(dx, dy));
      const maxLen = Math.max(len + 1.2, (mSpec && mSpec.max) || 3.4);
      const lineTargets = enemies.filter(u => {
        if (!Number.isFinite(u.x)) return true;
        const ux = u.x - a.x, uy = u.y - a.y;
        const proj = (ux * dx + uy * dy) / len;
        if (proj < -0.2 || proj > maxLen) return false;
        const perp = Math.abs(ux * dy - uy * dx) / len;
        return perp <= ((mSpec && mSpec.radius) || 0.95);
      });
      return (lineTargets.length ? sortByDistToOrigin(lineTargets, a.x, a.y) : sortByDistToOrigin(enemies, ox, oy)).slice(0, 3);
    }
    if (sel === 'RICOCHET_CHAIN' || sel === 'SPLASH_NEIGHBORS' || sel === 'PIERCE_LINE' || sel === 'RANDOM_BOUNCE_3') {
      const limit = sel === 'RICOCHET_CHAIN' ? 4 : 3;
      return sortByDistToOrigin(enemies, ox, oy).slice(0, limit);
    }
    return d ? [d] : enemies.slice(0, 1);
  };

  COMPOSABLE_ENGINE.preExecuteSkill = (W, f, a, d, p, ctx) => {
    const ST = STs();
    let comboMult = 1.0;
    const techDef = (p && p.tech && CULT && CULT.tech) ? CULT.tech(p.tech) : null;
    const comp = p.composable || p.keywordSpec || (techDef && (techDef.composable || techDef.keywordSpec)) || {};
    const cond = p.condition || comp.condition || null;
    if (cond && !COMPOSABLE_ENGINE.evaluateCondition(cond, a, d, { W, f, skill: p, ctx })) {
      return { comboMult: 1.0, handledCompletely: false, conditionFailed: true };
    }

    if (p.comboFinisher || p.action === 'COMBO_FINISHER' || comp.action === 'COMBO_FINISHER') {
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
    const preActions = new Set([].concat(p.actions || [], p.action ? [p.action] : [], comp.actions || [], comp.action ? [comp.action] : []));
    for (const act of preActions) {
      if (['HEART_DEMON_EDGE_SCALING', 'OVERHEAT_COOLDOWN_TRADE', 'RESTORE_QI_PCT', 'CLEANSE_TO_POWER', 'MERIDIAN_OVERDRIVE', 'STAR_FATE_REVERSAL', 'BODHI_KARMA_AEGIS', 'TEMPORAL_SAND_REWIND', 'ATAVISM_FRENZY_BITE', 'SPAWN_SHADOW_CLONE', 'SUMMON_DEITY_PROJECTION', 'ENTER_AVATAR_TRANCE', 'BORROW_COSMIC_LAW', 'KHMER_YANTRA_WARD', 'GRANT_BARRIER'].includes(act)) {
        const res = COMPOSABLE_ENGINE.executeAction(W, f, a, d, act, Object.assign({ skillId: p.id }, p, comp), ctx);
        if (res && res.mult) comboMult *= res.mult;
      }
    }

    return { comboMult, handledCompletely: false };
  };

  COMPOSABLE_ENGINE.postHitSkill = (W, f, a, t, p, r) => {
    if (!t || !C.alive(t)) return 0;
    const ST = STs();
    const techDef = (p && p.tech && CULT && CULT.tech) ? CULT.tech(p.tech) : null;
    const comp = p.composable || p.keywordSpec || (techDef && (techDef.composable || techDef.keywordSpec)) || {};
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
      } else if (!explicitId && Array.isArray(t.sx)) {
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
              a.lastElementalReaction = { t: W.t, reactionId: reactSpec.id, nameTh: reactSpec.nameTh, targetId: t.id, dmg: reactDmg, targetX: t.x, targetY: t.y, originX: a.x, originY: a.y };
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
    if (stAction === 'STEAL_BUFF' && Array.isArray(t.sx)) {
        const stolen = t.sx.find(x => x && x.until > W.t && SKs().STATUS[x.k] && SKs().STATUS[x.k].isBuff);
        if (stolen) {
          ST.clearStatus(t, x => x.k === stolen.k);
          ST.applyNamedBuff(a, stolen.k, 20, W.t, { casterId: a.id });
          ST.addStatus(t, 'exposed', 12, null, W.t);
          a.fx = { t: W.t, text: '🔄 ช่วงชิงบัฟ「' + (SKs().STATUS[stolen.k]?.nameTh || stolen.k) + '」' };
        }
    } else if (stAction === 'EXTEND_DEBUFF' && Array.isArray(t.sx)) {
      for (const x of t.sx) {
        if (x && x.until > W.t && COMPOSABLE_ENGINE.DEBUFF_KEYS.includes(x.k)) {
          x.until = Math.min(W.t + 2880, x.until + 6);
        }
      }
    } else if (stAction === 'ABSORB_DOT_TO_SHIELD' && Array.isArray(a.sx)) {
      const myDots = a.sx.filter(x => x && x.until > W.t && ['burn', 'bleed', 'poison', 'curse'].includes(x.k));
      if (myDots.length > 0) {
        ST.clearStatus(a, x => ['burn', 'bleed', 'poison', 'curse'].includes(x.k));
        ST.addStatus(a, 'shield', 16, { amt: Math.round(C.hpMax(a) * 0.12 * myDots.length) }, W.t);
      }
    } else if ((stAction === 'TRANSFER_DEBUFF' || stAction === 'TRANSFER_DEBUFF_TO_ENEMY') && Array.isArray(a.sx)) {
      const myDebuff = a.sx.find(x => x && x.until > W.t && COMPOSABLE_ENGINE.DEBUFF_KEYS.includes(x.k));
      if (myDebuff) {
        ST.clearStatus(a, x => x.k === myDebuff.k);
        ST.addStatus(t, myDebuff.k, Math.max(6, myDebuff.until - W.t), { per: myDebuff.per, src: a.id }, W.t);
      }
    } else if (stAction === 'CONVERT_BUFF_TO_DEBUFF' && Array.isArray(t.sx)) {
      const tBuff = t.sx.find(x => x && x.until > W.t && SKs().STATUS[x.k] && SKs().STATUS[x.k].isBuff);
      if (tBuff) {
        ST.clearStatus(t, x => x.k === tBuff.k);
        ST.addStatus(t, 'weaken', 12, null, W.t);
        ST.addStatus(t, 'exposed', 12, null, W.t);
      }
    }

    // 5. Acupoint Strike
    if (p.acupointStrike || comp.action === 'ACUPOINT_SEAL') {
      COMPOSABLE_ENGINE.executeAcupointStrike(W, f, a, t, p.acupointStrike || comp.acupointId || 'QI_BLOCK_POINT');
    }

    // 6. Execute Post-Hit Composable Actions
    const postActions = new Set([].concat(
      p.delayedEcho ? ['DELAYED_ECHO'] : [],
      p.actions || [],
      p.action ? [p.action] : [],
      comp.actions || [],
      comp.action ? [comp.action] : []
    ));
    for (const act of postActions) {
      if (['DELAYED_ECHO', 'SHATTER_SHIELD', 'BONUS_TRUE_DMG', 'PUPPET_SYMBIOSIS_PULSE', 'APPLY_TAUNT', 'DISPLACE_KNOCKBACK', 'DISPLACE_PULL', 'DISPLACE_VACUUM', 'POISE_BREAK', 'CONTAGION_SPREAD', 'MASS_ABSORPTION', 'SONIC_TEMPO_BREAK', 'MERIDIAN_SEAL', 'VOID_POCKET_DEFENSE', 'GU_SOUL_LEECH', 'WEATHER_THUNDER_CALL', 'CONTRACT_FORECLOSURE', 'LEYLINE_EARTH_SPIKE', 'IMPERIAL_INK_DECREE', 'MARIONETTE_SOUL_SWAP', 'CHAOS_ELEMENT_SHATTER', 'IAI_ZERO_QI_SLASH', 'MUDRA_EXPLOSIVE_SEAL', 'ELDRITCH_SANITY_BLAST', 'DEVOUR_ESSENCE_BITE', 'GRAVE_CORPSE_DETONATE', 'CHAIN_FOLLOWUP', 'TRUE_PIERCE_DMG'].includes(act)) {
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

        // A missing chance means a guaranteed effect. Explicit chances use the
        // world's seeded RNG and a failed roll must not consume the cooldown.
        if (Number.isFinite(p.chance)) {
          const probability = clamp(p.chance, 0, 1);
          if (probability <= 0 || (probability < 1 && (!W.rng || typeof W.rng.next !== 'function' || W.rng.next() >= probability))) continue;
        }

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
              const drainAmt = Math.round(qm * (p.qiDrainPct || 0.06));
              if (target && !target.foe && target.h && target.h.state && typeof target.h.state.qi === 'number') {
                target.h.state.qi = Math.max(0, target.h.state.qi - drainAmt);
              }
              actor.h.state.qi = Math.min(qm, (actor.h.state.qi || 0) + drainAmt);
            }
            triggered = true;
          } else if (eid === 'EFX_V200_BODHI_MERIT_PULSE') {
            ST.applyNamedBuff(actor, 'bodhiGrace', p.dur || 12, W.t, { casterId: actor.id }); triggered = true;
          } else if (eid === 'EFX_V200_ATAVISM_CLAW_REND') {
            ST.applyNamedBuff(actor, 'atavismFrenzy', p.dur || 12, W.t, { casterId: actor.id });
            ST.addStatus(target, 'bleed', p.dur || 10, { per: 0.015, src: actor.id }, W.t); triggered = true;
          } else if (eid === 'EFX_V200_MERIDIAN_VENOM_NEEDLE') {
            ST.applyNamedBuff(actor, 'marionetteLink', p.dur || 12, W.t, { casterId: actor.id });
            ST.addStatus(target, 'meridianSeal', p.dur || 10, null, W.t); triggered = true;
          } else if (eid === 'EFX_V200_TEMPEST_FAN_GALE') {
            ST.applyNamedBuff(actor, 'weatherConduct', p.dur || 12, W.t, { casterId: actor.id });
            ST.addStatus(target, 'slow', p.dur || 10, null, W.t); triggered = true;
          } else if (eid === 'EFX_V200_ASTROLABE_STAR_LOCK') {
            ST.applyNamedBuff(actor, 'starDestinyWard', p.dur || 12, W.t, { casterId: actor.id });
            COMPOSABLE_ENGINE.applyMark(W, f, actor, target, 'starSeal', 1, p.dur || 12); triggered = true;
          } else if (eid === 'EFX_V200_ABACUS_LEDGER_SETTLE') {
            ST.applyNamedBuff(actor, 'tacticalCommand', p.dur || 12, W.t, { casterId: actor.id });
            ST.addStatus(target, 'contractDefault', p.dur || 10, null, W.t); triggered = true;
          } else if (eid === 'EFX_BLOOD_SACRIFICE_OVERDRIVE') {
            const hpCost = p.healthCost || 18;
            if (C.hp(actor) > hpCost + 5) C.setHp(actor, C.hp(actor) - hpCost);
            ST.applyNamedBuff(actor, 'bloodFrenzy', p.duration || 16, W.t, { casterId: actor.id }); triggered = true;
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
          } else if (eid === 'EFX_PURIFY_HOSTILE_STATUS' || eid === 'EFX_MERIDIAN_TOXIN_PURGE') {
            ST.clearStatus(actor, x => ['burn', 'bleed', 'poison', 'chill', 'slow', 'curse', 'weaken'].includes(x.k));
            if (eid === 'EFX_MERIDIAN_TOXIN_PURGE' && actor.cult) actor.cult.toxic = Math.max(0, (actor.cult.toxic || 0) - (p.toxinPurge || 20));
            triggered = true;
          } else if (eid === 'EFX_MASS_VITAL_HEAL') {
            const hm = C.hpMax(actor);
            C.setHp(actor, Math.min(hm, C.hp(actor) + (p.healAmount || 48)));
            triggered = true;
          } else if (eid === 'EFX_SCENT_TRACE_BREAK' || eid === 'EFX_BEAST_BOND_CHANNEL' || eid === 'EFX_CULTIVATION_ACCELERATOR' || eid === 'EFX_QI_PURITY_REFINEMENT' || eid === 'EFX_HEART_DEMON_WARD' || eid === 'EFX_LEARNING_INSIGHT') {
            if (eid === 'EFX_SCENT_TRACE_BREAK') ST.applyNamedBuff(actor, 'shadowVeil', p.duration || 16, W.t, { casterId: actor.id });
            if (eid === 'EFX_BEAST_BOND_CHANNEL') ST.applyNamedBuff(actor, 'beastPackFury', p.duration || 16, W.t, { casterId: actor.id });
            if (eid === 'EFX_HEART_DEMON_WARD' && actor.h && actor.h.state) actor.h.state.heartDemon = Math.max(0, (actor.h.state.heartDemon || 0) - 4);
            triggered = true;
          }
        }
        if (triggered) {
          if (normTrigger === 'onHit' && eid !== 'EFX_V234_STANCE_FLOW') {
            if (p.lifestealPct && actor.h && actor.h.state) {
              const heal = Math.max(1, Math.round((dmgDealt || 20) * p.lifestealPct));
              C.setHp(actor, Math.min(C.hpMax(actor), C.hp(actor) + heal));
            }
            if (p.qiDrainPct && actor.cult && actor.h && actor.h.state && (!CULT.isZeroQiSamurai || !CULT.isZeroQiSamurai(actor))) {
              const qm = CULT.qiMax(actor);
              const drainAmt = Math.max(1, Math.round(qm * p.qiDrainPct));
              if (target && !target.foe && target.h && target.h.state && typeof target.h.state.qi === 'number') {
                target.h.state.qi = Math.max(0, target.h.state.qi - drainAmt);
              }
              actor.h.state.qi = Math.min(qm, (actor.h.state.qi || 0) + drainAmt);
            }
          }
          actor._itemEfxCds[cdKey] = W.t + (p.icdTicks || 8);
          actor.lastItemEffectProc = { t: W.t, itemId: it.id, effectId: eid, kind: normTrigger, targetX: (normTrigger === 'onHit' && target && Number.isFinite(target.x)) ? target.x : actor.x, targetY: (normTrigger === 'onHit' && target && Number.isFinite(target.y)) ? target.y : actor.y, originX: actor.x, originY: actor.y };
        }
      }
    }
  };

  /* ---------- Patch v3.0.0: Bounded Deterministic Spatial Heuristic (DSH) for Off-Map / Abstract Combats ---------- */
  C.evaluateTacticalBoutSummary = (partyA, partyB, opts, maybeOpts) => {
    if (partyA && partyA.sect && !Array.isArray(partyA)) {
      partyA = partyB;
      partyB = opts;
      opts = maybeOpts || {};
    } else {
      opts = opts || {};
    }
    const listA = (Array.isArray(partyA) ? partyA : [partyA]).filter(Boolean);
    const listB = (Array.isArray(partyB) ? partyB : [partyB]).filter(Boolean);
    if (!listA.length || !listB.length) {
      return { multA: 1.0, multB: 1.0, tacticalMultiplier: 1.0, advantageDelta: 0, summaryTh: "ปะทะตามระดับพลังตบะ", highlights: ["ปะทะตามระดับพลังตบะ"], frontlineA: 0, backlineA: 0 };
    }
    const SK = SKs();
    const analyzeParty = list => {
      let frontline = 0, backline = 0, support = 0, avgMaxRange = 0, gapClosers = 0;
      for (const u of list) {
        const wp = SK && SK.weaponTacticalProfile ? SK.weaponTacticalProfile(u) : { reachClass: 'SHORT_SWIFT', engageRange: 1.7 };
        const role = C.inferCombatRole ? C.inferCombatRole(u) : 'FIGHTER';
        const moves = SK && SK.list ? SK.list(u) : (u.skl || []);
        let uMaxR = wp.engageRange || 1.7;
        for (const m of moves) {
          const sp = m.range || (SK && SK.resolveMoveSpatialSpec ? SK.resolveMoveSpatialSpec(m, u) : null);
          if (sp && sp.max > uMaxR) uMaxR = sp.max;
          if (sp && sp.isGapCloser) gapClosers++;
        }
        avgMaxRange += uMaxR;
        if (role === 'TANK' || wp.reachClass === 'HEAVY_BREAKER' || wp.reachClass === 'LONG_POLEARM' || wp.hasDefenseTech) frontline++;
        if (role === 'CASTER' || wp.reachClass === 'RANGED_KITE' || uMaxR >= 3.5) backline++;
        if (role === 'HEALER') support++;
      }
      const n = Math.max(1, list.length);
      return {
        count: list.length,
        frontlineRatio: clamp(frontline / n, 0, 1),
        backlineRatio: clamp(backline / n, 0, 1),
        supportRatio: clamp(support / n, 0, 1),
        avgRange: +(avgMaxRange / n).toFixed(2),
        hasBalancedFormation: frontline >= 1 && (backline >= 1 || support >= 1),
        gapClosers
      };
    };

    const stA = analyzeParty(listA);
    const stB = analyzeParty(listB);
    const leadA = listA[0], leadB = listB[0];
    const tacAB = C.resolveWeaponTactics(leadA, leadB, { dist: 2.0, abstractBout: true });
    const tacBA = C.resolveWeaponTactics(leadB, leadA, { dist: 2.0, abstractBout: true });

    let delta = (stA.frontlineRatio - stB.frontlineRatio) * 0.08 +
                (stA.backlineRatio - stB.backlineRatio) * 0.07 +
                (stA.supportRatio - stB.supportRatio) * 0.06 +
                (stA.hasBalancedFormation ? 0.05 : 0) - (stB.hasBalancedFormation ? 0.05 : 0);
    delta = clamp(delta, -0.20, 0.20);
    const multA = clamp((tacAB.dmgMult || 1) * (1 + Math.max(0, delta)), 0.80, 1.20);
    const multB = clamp((tacBA.dmgMult || 1) * (1 + Math.max(0, -delta)), 0.80, 1.20);
    const notes = [];
    if (tacAB.noteTh) notes.push(tacAB.noteTh);
    if (stA.hasBalancedFormation) notes.push("ขบวนทัพประสานแนวหน้าคุ้มกันแนวหลัง");
    const summaryTh = notes.join(" · ") || "ปะทะแลกกระบวนท่าตามระยะ";
    return {
      multA: +multA.toFixed(3),
      multB: +multB.toFixed(3),
      tacticalMultiplier: +multA.toFixed(3),
      advantageDelta: +delta.toFixed(3),
      tacticalRelation: tacAB.relation || "NEUTRAL",
      tacticalNoteTh: tacAB.noteTh || "",
      summaryTh,
      highlights: notes.length ? notes : [summaryTh],
      partyStatsA: stA,
      partyStatsB: stB
    };
  };

  COMPOSABLE_ENGINE.IMPLEMENTED_EFFECT_IDS = new Set((g.ECO && g.ECO.ALL_RUNTIME_EFFECT_IDS) || []);
  C.COMPOSABLE_ENGINE = COMPOSABLE_ENGINE;
  C.ELEMENTAL_FUSION = COMPOSABLE_ENGINE;


  /* ---------- Patch v3.4.0 [PROP-06]: Dual-Caster Duet Resonance Skills ---------- */
  C.DUET_CATALOG = Object.freeze({
    DUET_TWIN_LOTUS_SWORD: { id: 'DUET_TWIN_LOTUS_SWORD', nameTh: 'กระบี่คู่บัวสวรรค์ผสานใจ', bondType: 'TAOIST_COMPANION', mult: 1.75, shieldPct: 0.15 },
    DUET_MASTER_DISCIPLE_INHERITANCE: { id: 'DUET_MASTER_DISCIPLE_INHERITANCE', nameTh: 'ค่ายกลสืบทอดเจตจำนงอาจารย์ศิษย์', bondType: 'MENTOR_DISCIPLE', mult: 1.65, shieldPct: 0.12 },
    DUET_FATED_THREADS_RESONANCE: { id: 'DUET_FATED_THREADS_RESONANCE', nameTh: 'วัฏจักรด้ายชะตาประสานฟ้าดิน', bondType: 'DESTINY_THREAD', mult: 1.60, shieldPct: 0.12 },
    DUET_BUSHIDO_SHINOBI_ECLIPSE: { id: 'DUET_BUSHIDO_SHINOBI_ECLIPSE', nameTh: 'ดาบอิไอผสานเงาเร้นผ่าจันทรา', bondType: 'BUSHIDO_SHINOBI', paths: ['SHADOW_SAMURAI', 'NINPO_SHADOW', 'NINPO_ELEMENTAL'], mult: 1.82, shieldPct: 0.14 },
    DUET_PANTHEON_TWIN_AVATAR: { id: 'DUET_PANTHEON_TWIN_AVATAR', nameTh: 'มหาเทวาลัยเบื้องบนจุติคู่สวรรค์', bondType: 'PANTHEON_CONDUIT', paths: ['DIVINE_SUMMONER', 'DIVINE_POSSESSION', 'DIVINE_CHANNELER', 'GOD'], mult: 1.85, shieldPct: 0.18 },
    DUET_OCCULT_GRAVE_REQUIEM: { id: 'DUET_OCCULT_GRAVE_REQUIEM', nameTh: 'อาคมขอมผสานสุสานยมโลกสะกดวิญญาณ', bondType: 'OCCULT_NECROPOLIS', paths: ['OCCULT_MAGE', 'DEVOURING_FLESH', 'NETHER_GRAVE', 'VOID_HERETIC_PACT'], mult: 1.78, shieldPct: 0.16 },
    DUET_ASTRAL_CHRONO_CONVERGENCE: { id: 'DUET_ASTRAL_CHRONO_CONVERGENCE', nameTh: 'ดาราพยากรณ์ย้อนรอยกาลเวลา', bondType: 'ASTRAL_CHRONO', paths: ['ASTRO_DIVINATION', 'CHRONO_EPOCH', 'VOID_SPACE', 'GRAVITY_DAO', 'PRIMORDIAL_CHAOS'], mult: 1.80, shieldPct: 0.15 },
    DUET_DRAGON_TIDE_HARMONY: { id: 'DUET_DRAGON_TIDE_HARMONY', nameTh: 'ชีพจรมังกรสมุทรและคีตเวทย์สะท้านภพ', bondType: 'WORLD_HARMONY', paths: ['DRAGON_VEIN_GEOMANCY', 'TIDE_VOYAGER', 'SONIC_HARMONY', 'CELESTIAL_WEATHER', 'LORE_ARCHIVIST'], mult: 1.74, shieldPct: 0.15 }
  });

  C.tryExecuteDuetSkill = (W, f, caster, partner, target, opts) => {
    opts = opts || {};
    if (!caster || !partner || caster.id === partner.id || !C.alive(caster) || !C.alive(partner) || !target || !C.alive(target)) {
      return { ok: false, reason: 'invalid-participants' };
    }
    const tNow = (W && W.t) || 0;
    if (!opts.ignoreCooldown && ((caster._duetCdUntil && caster._duetCdUntil > tNow) || (partner._duetCdUntil && partner._duetCdUntil > tNow))) {
      return { ok: false, reason: 'cooldown-active' };
    }
    const dist = (Number.isFinite(caster.x) && Number.isFinite(partner.x)) ? Math.hypot(caster.x - partner.x, caster.y - partner.y) : 1.5;
    if (!opts.ignoreDistance && dist > 3.0) {
      return { ok: false, reason: 'out-of-range', dist };
    }
    const cPath = caster.cult && caster.cult.path;
    const pPath = partner.cult && partner.cult.path;
    let pathDuetSpec = null;
    if (cPath && pPath) {
      for (const ds of Object.values(C.DUET_CATALOG)) {
        if (Array.isArray(ds.paths) && ds.paths.includes(cPath) && ds.paths.includes(pPath)) {
          pathDuetSpec = ds;
          break;
        }
      }
    }
    const isCompanion = caster.companionId === partner.id || partner.companionId === caster.id;
    const isMentorDisciple = caster.mentorId === partner.id || partner.mentorId === caster.id || caster.mentor === partner.id || partner.mentor === caster.id;
    const isThreadBonded = Array.isArray(caster.destinyThreads) && caster.destinyThreads.some(th => th && (th.type === 'RED_THREAD' || th.type === 'GOLD_THREAD') && (th.aId === partner.id || th.bId === partner.id));
    const hasPersonalBond = isCompanion || isMentorDisciple || isThreadBonded || !!opts.forceBond || !!opts.allowUnbondedPathDuet;
    if (!hasPersonalBond) {
      return { ok: false, reason: 'no-resonance-bond' };
    }
    const spec = (opts.duetId && C.DUET_CATALOG[opts.duetId])
      ? C.DUET_CATALOG[opts.duetId]
      : pathDuetSpec || (isCompanion ? C.DUET_CATALOG.DUET_TWIN_LOTUS_SWORD : isMentorDisciple ? C.DUET_CATALOG.DUET_MASTER_DISCIPLE_INHERITANCE : C.DUET_CATALOG.DUET_FATED_THREADS_RESONANCE);
    const ST = STs();
    const cSt = ST ? ST.get(caster) : { atk: 50, matk: 50, pen: 10 };
    const pSt = ST ? ST.get(partner) : { atk: 50, matk: 50, pen: 10 };
    const tSt = ST ? ST.get(target) : { def: 30, mdef: 30 };
    const combAtk = Math.max(cSt.atk || 0, cSt.matk || 0) + Math.max(pSt.atk || 0, pSt.matk || 0) * 0.65;
    const defVal = Math.min(tSt.def || 0, tSt.mdef || 0) * (1 - clamp(((cSt.pen || 0) + (pSt.pen || 0)) / 160, 0, 0.75));
    const mit = 100 / (100 + Math.max(0, defVal * 0.55));
    const hpBonusCap = Math.min(combAtk * 0.55, C.hpMax(target) * (C.isBossUnit(target) ? 0.03 : 0.06));
    const dmg = Math.max(18, Math.round(Math.min(C.hpMax(target) * (C.isBossUnit(target) ? 0.16 : 0.28), (combAtk * 1.35 + hpBonusCap) * mit) * spec.mult));
    C.applyDamage(W, f, caster, target, dmg, spec.nameTh);
    if (ST) {
      ST.addStatus(caster, 'shield', 14, { amt: Math.round(C.hpMax(caster) * spec.shieldPct) }, tNow);
      ST.addStatus(partner, 'shield', 14, { amt: Math.round(C.hpMax(partner) * spec.shieldPct) }, tNow);
    }
    caster._duetCdUntil = tNow + 16;
    partner._duetCdUntil = tNow + 16;
    caster.fx = { t: tNow, text: '☯️ ' + spec.nameTh + '!' };
    partner.fx = { t: tNow, text: '☯️ ประสานวิชาคู่!' };
    caster.lastDuetSkill = { t: tNow, duetId: spec.id, nameTh: spec.nameTh, partnerId: partner.id, targetId: target.id, dmg, targetX: target.x, targetY: target.y, originX: caster.x, originY: caster.y, partnerX: partner.x, partnerY: partner.y };
    return { ok: true, duet: spec, dmg, partnerId: partner.id, targetId: target.id };
  };

  /* ---------- Patch v3.4.0 [PROP-09]: Multi-Turn Charged Skills & Poise Shield ---------- */
  C.startChargedSkill = (W, f, caster, target, skillSpec, opts) => {
    opts = opts || {};
    if (!caster || !C.alive(caster)) return { ok: false, reason: 'invalid-caster' };
    const sk = skillSpec || { id: 'CHARGED_HEAVEN_SLASH', nameTh: 'เพลงกระบี่ชาร์จพลังผ่าสวรรค์', M: 1.4, type: 'p', cd: 16 };
    const ticks = Math.max(1, opts.ticks || 2);
    const poiseShield = opts.poiseShield != null ? opts.poiseShield : 80;
    const releaseMult = opts.releaseMult || 1.65;
    caster.act = caster.act || { id: 'fight', ctx: {} };
    caster.act.ctx = caster.act.ctx || {};
    caster.act.ctx.channeling = {
      skillId: sk.id,
      skill: sk,
      targetId: target ? target.id : null,
      totalTicks: ticks,
      ticksLeft: ticks,
      tickM: 0.35,
      finishM: +((sk.M || 1.0) * releaseMult).toFixed(3),
      releaseMult,
      isChargedSkill: true,
      poiseShield,
      maxPoiseShield: poiseShield
    };
    const ST = STs();
    if (ST) ST.addStatus(caster, 'channeling', ticks * 4 + 4, null, (W && W.t) || 0);
    caster.fx = { t: (W && W.t) || 0, text: '⚡ ชาร์จพลัง「' + sk.nameTh + '」' };
    return { ok: true, channeling: caster.act.ctx.channeling };
  };

  /* ---------- Patch v3.4.0 [PROP-10]: Boss Beast Anatomy Part-Breaking & Targeted Drops ---------- */
  const ANATOMY_BREAKER = {};
  ANATOMY_BREAKER.PART_CATALOG = Object.freeze({
    HORN_CROWN: { id: 'HORN_CROWN', nameTh: 'เขามงกุฎราชันอสูร', hpRatio: 0.25, debuffStatus: 'weaken', dropItemId: 'MAT_BOSS_HORN_CROWN', dropNameTh: 'เขาราชันอสูรบรรพกาล' },
    VENOM_SAC: { id: 'VENOM_SAC', nameTh: 'ถุงพิษมรกตอสูร', hpRatio: 0.20, debuffStatus: 'silence', disablePoison: true, dropItemId: 'MAT_BOSS_VENOM_SAC', dropNameTh: 'ถุงพิษอสูรพันปี' },
    WING_MEMBRANE: { id: 'WING_MEMBRANE', nameTh: 'พังผืดปีกวายุอสูร', hpRatio: 0.20, debuffStatus: 'slow', dropItemId: 'MAT_BOSS_WING', dropNameTh: 'ปีกวายุราชันอสูร' },
    CORE_SHELL: { id: 'CORE_SHELL', nameTh: 'เกราะอกแก่นอสูร', hpRatio: 0.30, debuffStatus: 'armorbreak', dropItemId: 'MAT_BOSS_CORE_SHELL', dropNameTh: 'เกล็ดเกราะอกราชันอสูร' }
  });

  ANATOMY_BREAKER.initBossParts = bossUnit => {
    if (!bossUnit) return null;
    if (!bossUnit.anatomyParts || typeof bossUnit.anatomyParts !== 'object') {
      const hm = Math.max(100, C.hpMax(bossUnit));
      bossUnit.anatomyParts = {};
      for (const [pid, spec] of Object.entries(ANATOMY_BREAKER.PART_CATALOG)) {
        const pMax = Math.max(25, Math.round(hm * spec.hpRatio));
        bossUnit.anatomyParts[pid] = {
          id: pid,
          nameTh: spec.nameTh,
          hp: pMax,
          maxHp: pMax,
          broken: false,
          dropItemId: spec.dropItemId,
          dropNameTh: spec.dropNameTh
        };
      }
      bossUnit.brokenParts = [];
      bossUnit.guaranteedOrganDrops = [];
    }
    return bossUnit.anatomyParts;
  };

  ANATOMY_BREAKER.damageBossPart = (W, f, attacker, bossUnit, partId, dmg, opts) => {
    opts = opts || {};
    if (!bossUnit) return { ok: false, reason: 'no-boss' };
    const parts = ANATOMY_BREAKER.initBossParts(bossUnit);
    const pKey = partId && parts[partId] ? partId : 'HORN_CROWN';
    const part = parts[pKey];
    const spec = ANATOMY_BREAKER.PART_CATALOG[pKey];
    if (!part) return { ok: false, reason: 'invalid-part' };
    const dealt = Math.max(1, Math.round(Number(dmg) || 25));
    part.hp = Math.max(0, part.hp - dealt);
    let newlyBroken = false;
    if (part.hp === 0 && !part.broken) {
      part.broken = true;
      newlyBroken = true;
      bossUnit.brokenParts = bossUnit.brokenParts || [];
      if (!bossUnit.brokenParts.includes(pKey)) bossUnit.brokenParts.push(pKey);
      bossUnit.guaranteedOrganDrops = bossUnit.guaranteedOrganDrops || [];
      if (!bossUnit.guaranteedOrganDrops.includes(spec.dropItemId)) {
        bossUnit.guaranteedOrganDrops.push(spec.dropItemId);
      }
      if (W && W.sect && (!attacker || !attacker.foe)) {
        W.sect.stock = W.sect.stock || {};
        W.sect.stock[spec.dropItemId] = (W.sect.stock[spec.dropItemId] || 0) + 1;
      }
      if (spec.disablePoison) bossUnit.poisonDisabled = true;
      const ST = STs();
      if (ST && spec.debuffStatus) ST.addStatus(bossUnit, spec.debuffStatus, 20, null, (W && W.t) || 0);
      bossUnit.fx = { t: (W && W.t) || 0, text: '💥 ทำลาย' + spec.nameTh + '!' };
    }
    if (!opts.fromStrike || newlyBroken) {
      C.applyDamage(W, f, attacker, bossUnit, Math.round(dealt * (opts.fromStrike ? 0.25 : 0.5)), 'เล็งทำลาย' + spec.nameTh);
    }
    return {
      ok: true,
      partId: pKey,
      part,
      newlyBroken,
      dropItemId: newlyBroken ? spec.dropItemId : null
    };
  };
  C.ANATOMY_BREAKER = ANATOMY_BREAKER;

  /* ---------- Patch v4.0.0 [Pillar 2]: Action-Derived Behavioral Mastery Traits (COMBAT.ACTION_MASTERY_TRAITS) ---------- */
  const ACTION_MASTERY_TRAITS = {};
  ACTION_MASTERY_TRAITS.TRAIT_DEFS = Object.freeze({
    TRAIT_PARRY_COUNTER: {
      id: 'TRAIT_PARRY_COUNTER',
      nameTh: 'กระบี่ตอบโต้',
      icon: '⚔️',
      statKey: 'parryCount',
      threshold: 15,
      reflectDmgBonus: 0.15,
      descTh: 'ปัดป้องครบ 15 ครั้ง: ความเสียหายสะท้อนกลับ +15%'
    },
    TRAIT_VANGUARD_GUARD: {
      id: 'TRAIT_VANGUARD_GUARD',
      nameTh: 'ทวนพิทักษ์',
      icon: '🛡️',
      statKey: 'coverCount',
      threshold: 20,
      defBonusPct: 0.12,
      allyDefAuraPct: 0.12,
      descTh: 'เข้าขวางรับดาเมจแทนเพื่อนครบ 20 ครั้ง: ป้องกันตนเองและเพื่อนข้างเคียง +12%'
    },
    TRAIT_COMBAT_MEDIC: {
      id: 'TRAIT_COMBAT_MEDIC',
      nameTh: 'หมอสนาม',
      icon: '⚕️',
      statKey: 'clutchHealCount',
      threshold: 10,
      clutchHealBonusPct: 0.20,
      descTh: 'ฮีลช่วยเพื่อนที่ HP < 25% ครบ 10 ครั้ง: ผลฮีลฉุกเฉิน +20%'
    },
    TRAIT_FORMATION_STRATEGIST: {
      id: 'TRAIT_FORMATION_STRATEGIST',
      nameTh: 'ผู้วางหมาก',
      icon: '☯️',
      statKey: 'formationTicks',
      threshold: 30,
      qiRegenBonusPct: 0.15,
      descTh: 'เปิดใช้ค่ายกลในสนามรบสะสมครบ 30 เทิร์น: ฟื้นฟูปราณ +15%'
    }
  });
  ACTION_MASTERY_TRAITS.TRAITS = ACTION_MASTERY_TRAITS.TRAIT_DEFS;

  ACTION_MASTERY_TRAITS.ensureHistory = npc => {
    if (!npc) return null;
    if (!npc.combatHistory || typeof npc.combatHistory !== 'object') {
      npc.combatHistory = {
        parryCount: 0,
        coverCount: 0,
        clutchHealCount: 0,
        formationTicks: 0,
        unlockedTraits: []
      };
    }
    if (typeof npc.combatHistory.parryCount !== 'number') npc.combatHistory.parryCount = 0;
    if (typeof npc.combatHistory.coverCount !== 'number') npc.combatHistory.coverCount = 0;
    if (typeof npc.combatHistory.clutchHealCount !== 'number') npc.combatHistory.clutchHealCount = 0;
    if (typeof npc.combatHistory.formationTicks !== 'number') npc.combatHistory.formationTicks = 0;
    if (!Array.isArray(npc.combatHistory.unlockedTraits)) npc.combatHistory.unlockedTraits = [];
    if (!Array.isArray(npc.actionMasteryTraits)) npc.actionMasteryTraits = npc.combatHistory.unlockedTraits.slice();
    return npc.combatHistory;
  };

  ACTION_MASTERY_TRAITS.hasTrait = (npc, traitId) => {
    if (!npc || !traitId) return false;
    const ch = npc.combatHistory;
    if (ch && Array.isArray(ch.unlockedTraits) && ch.unlockedTraits.includes(traitId)) return true;
    if (Array.isArray(npc.actionMasteryTraits) && npc.actionMasteryTraits.includes(traitId)) return true;
    return false;
  };

  ACTION_MASTERY_TRAITS.checkAndUnlockTraits = (W, npc, opts) => {
    opts = opts || {};
    const ch = ACTION_MASTERY_TRAITS.ensureHistory(npc);
    if (!ch) return { ok: false, newlyUnlocked: [] };
    const newlyUnlocked = [];
    const wRef = W || (g.W || (g.G && g.G.W)) || (g.SECT && g.SECT.PEAKS && g.SECT.PEAKS._activeWorld);

    for (const spec of Object.values(ACTION_MASTERY_TRAITS.TRAIT_DEFS)) {
      const count = Number(ch[spec.statKey]) || 0;
      if (count >= spec.threshold && !ch.unlockedTraits.includes(spec.id)) {
        ch.unlockedTraits.push(spec.id);
        if (!Array.isArray(npc.actionMasteryTraits)) npc.actionMasteryTraits = [];
        if (!npc.actionMasteryTraits.includes(spec.id)) npc.actionMasteryTraits.push(spec.id);
        newlyUnlocked.push(spec);
        npc._ver = (npc._ver || 1) + 1;
        if (g.STATS && g.STATS.dirty) g.STATS.dirty(npc);

        if (wRef) {
          if (!Array.isArray(wRef.chronicle)) wRef.chronicle = [];
          const actorName = (g.HC && g.HC.fullName) ? g.HC.fullName(npc) : (npc.nameTh || npc.id);
          const entry = {
            category: 'BATTLE',
            icon: spec.icon,
            titleTh: actorName + ' บรรลุรอยชำนาญสนามรบ「' + spec.nameTh + '」!',
            storyTh: actorName + ' สั่งสมประสบการณ์จริงในสมรภูมิจนตื่นรู้เทรตถาวร ' + spec.nameTh + ' (' + spec.descTh + ')',
            consequenceTh: spec.descTh,
            npcIds: [npc.id],
            traitId: spec.id
          };
          let rec = null;
          if (g.EXPED && g.EXPED.recordChronicle && !opts.quiet) {
            rec = g.EXPED.recordChronicle(wRef, Object.assign({ allowDuplicate: true }, entry));
          }
          wRef.chronicle.unshift(rec || Object.assign({ id: 'CHRON_TRAIT_' + spec.id + '_' + (wRef.t || 0), day: wRef.day || 1, t: wRef.t || 0 }, entry));
          if (wRef.log && !opts.quiet) {
            wRef.log('combat', spec.icon + ' ' + actorName + ' ตื่นรู้รอยชำนาญ「' + spec.nameTh + '」(' + spec.descTh + ')!', [npc.id]);
          }
        }
      }
    }
    return {
      ok: true,
      newlyUnlocked,
      unlockedTraits: ch.unlockedTraits.slice(),
      combatHistory: ch
    };
  };

  ACTION_MASTERY_TRAITS.recordAction = (W, npc, actionKey, amount, opts) => {
    if (!npc || npc.foe) return { ok: false, reason: 'invalid-npc' };
    const ch = ACTION_MASTERY_TRAITS.ensureHistory(npc);
    const keyMap = {
      PARRY: 'parryCount',
      parry: 'parryCount',
      parryCount: 'parryCount',
      TRAIT_PARRY_COUNTER: 'parryCount',
      COVER: 'coverCount',
      cover: 'coverCount',
      coverCount: 'coverCount',
      TRAIT_VANGUARD_GUARD: 'coverCount',
      CLUTCH_HEAL: 'clutchHealCount',
      clutchHeal: 'clutchHealCount',
      clutchHealCount: 'clutchHealCount',
      TRAIT_COMBAT_MEDIC: 'clutchHealCount',
      FORMATION: 'formationTicks',
      formation: 'formationTicks',
      formationTicks: 'formationTicks',
      TRAIT_FORMATION_STRATEGIST: 'formationTicks'
    };
    const statKey = keyMap[actionKey] || actionKey;
    if (!(statKey in ch)) return { ok: false, reason: 'unknown-action-key' };
    const inc = Math.max(1, Math.round(Number(amount != null ? amount : 1)));
    ch[statKey] = (ch[statKey] || 0) + inc;
    const res = ACTION_MASTERY_TRAITS.checkAndUnlockTraits(W, npc, opts);
    return {
      ok: true,
      statKey,
      newValue: ch[statKey],
      newlyUnlocked: res.newlyUnlocked,
      unlockedTraits: res.unlockedTraits
    };
  };

  ACTION_MASTERY_TRAITS.getTraitModifiers = npc => {
    const ch = ACTION_MASTERY_TRAITS.ensureHistory(npc);
    const unlocked = (ch && ch.unlockedTraits) || [];
    return {
      hasParryCounter: unlocked.includes('TRAIT_PARRY_COUNTER'),
      hasVanguardGuard: unlocked.includes('TRAIT_VANGUARD_GUARD'),
      hasCombatMedic: unlocked.includes('TRAIT_COMBAT_MEDIC'),
      hasFormationStrategist: unlocked.includes('TRAIT_FORMATION_STRATEGIST'),
      reflectDmgBonus: unlocked.includes('TRAIT_PARRY_COUNTER') ? 0.15 : 0,
      defBonusPct: unlocked.includes('TRAIT_VANGUARD_GUARD') ? 0.12 : 0,
      allyDefAuraPct: unlocked.includes('TRAIT_VANGUARD_GUARD') ? 0.12 : 0,
      clutchHealBonusPct: unlocked.includes('TRAIT_COMBAT_MEDIC') ? 0.20 : 0,
      qiRegenBonusPct: unlocked.includes('TRAIT_FORMATION_STRATEGIST') ? 0.15 : 0,
      unlockedTraits: unlocked.slice()
    };
  };

  C.ACTION_MASTERY_TRAITS = ACTION_MASTERY_TRAITS;


  C.invokeAncestralPhantom = (W, f, opts) => {
    if (g.SECT && g.SECT.ANCESTRAL_PAVILION && g.SECT.ANCESTRAL_PAVILION.invokeFounderPhantom) {
      return g.SECT.ANCESTRAL_PAVILION.invokeFounderPhantom(W, f, opts);
    }
    return { ok: false, reason: 'no-ancestral-pavilion' };
  };


  /* =========================================================================
   * PATCH v2.0.0: PILLAR 5 — 27 GRAND DAO CROSS-PATH SYNERGIES
   * (ระบบความเข้ากันได้ข้ามมหาวิถีทั้ง 27 สายในปาร์ตี้และสมรภูมิ)
   * ========================================================================= */
  C.CROSS_PATH_SYNERGIES = Object.freeze([
    { id: 'SYN_IMPERIAL_CHARTER', paths: ['MERCANTILE_DAO', 'STRATEGY_GOVERNANCE'], nameTh: 'พันธสัญญาจักรพรรดิและพิชัยยุทธ์การคลัง', powerBonus: 0.14, mitigationBonus: 0.06, descTh: 'ผสานลูกคิดการค้าและตราอาญาสิทธิ์ เพิ่มพลังรบทั้งทีม +14% และลดดาเมจ 6%' },
    { id: 'SYN_HEAVENLY_TEMPEST_SWORD', paths: ['CELESTIAL_WEATHER', 'XIAN'], nameTh: 'กระบี่อัสนีบัญชาฟ้าดิน', powerBonus: 0.15, mitigationBonus: 0.04, descTh: 'ปราณฟ้าดินหนุนคมกระบี่เซียน เพิ่มความแรงวิชาธาตุลม/สายฟ้าและกระบี่ +15%' },
    { id: 'SYN_HEAVY_GRAVITY_FORTRESS', paths: ['GRAVITY_DAO', 'MECH_PUPPET'], nameTh: 'ป้อมปราการกลจักรแรงโน้มถ่วงดารา', powerBonus: 0.12, mitigationBonus: 0.10, descTh: 'สนามแรงโน้มถ่วงเสริมเกราะหุ่นเชิดกลไก ลดดาเมจที่ได้รับ 10% และเพิ่มพลังโจมตี +12%' },
    { id: 'SYN_DRAGON_VEIN_TRIGRAM', paths: ['DRAGON_VEIN_GEOMANCY', 'ARRAY_TALISMAN'], nameTh: 'ค่ายกลแปดทิศผูกชีพจรมังกร', powerBonus: 0.13, mitigationBonus: 0.09, descTh: 'ยึดโยงค่ายกลเข้ากับชีพจรปฐพี เพิ่มความแข็งแกร่งม่านพลังและพลังวิชา +13%' },
    { id: 'SYN_LOTUS_SAMSARA_NIRVANA', paths: ['BUDDHA_DHARMA', 'KARMA_SAMSARA'], nameTh: 'กงล้อโพธิญาณวัฏสงสารนิพพาน', powerBonus: 0.12, mitigationBonus: 0.10, descTh: 'บารมีพุทธะผสานกงล้อกรรม สะท้อนวิบากกรรมและลดความเสียหายขาเข้า 10%' },
    { id: 'SYN_SPACETIME_CONTINUUM', paths: ['VOID_SPACE', 'CHRONO_EPOCH'], nameTh: 'มหาค่ายกลมิติ-กาลเวลานิรันดร์', powerBonus: 0.16, mitigationBonus: 0.08, descTh: 'ผสานรอยแยกมิติและทรายกาลเวลา เพิ่มความเร็วร่าย หลบหลีก และพลังทำลาย +16%' },
    { id: 'SYN_SOUL_ZITHER_REQUIEM', paths: ['SONIC_HARMONY', 'HEART_SOUL'], nameTh: 'คีตมายาสะกดวิญญาณเจ็ดสาย', powerBonus: 0.14, mitigationBonus: 0.06, descTh: 'คลื่นเสียงประสานจิตตานุภาพ ทะลวงป้องกันจิตและสลายคูลดาวน์ศัตรู' },
    { id: 'SYN_BLOOD_GU_APOCALYPSE', paths: ['VENOM_GU', 'DEMON'], nameTh: 'เพลิงมารกู่โลหิตกลืนสวรรค์', powerBonus: 0.16, mitigationBonus: 0.04, descTh: 'หนอนกู่ปรสิตผสานปราณมาร สูบเลือดและปราณศัตรูอย่างรุนแรง (+16% พลังทำลาย)' },
    { id: 'SYN_ATAVISM_BEAST_PACK', paths: ['PRIMORDIAL_SHIFTER', 'BEAST_SOVEREIGN'], nameTh: 'ราชันย์อสูรสายเลือดบรรพกาลคำราม', powerBonus: 0.15, mitigationBonus: 0.07, descTh: 'ร่างแปลงเทพอสูรนำทัพฝูงสัตว์วิญญาณ เพิ่มพลังโจมตีกายภาพและความอึดทั้งทีม' },
    { id: 'SYN_STAR_LITERATI_MANDATE', paths: ['ASTRO_DIVINATION', 'INK_LITERATI'], nameTh: 'โองการสวรรค์จารึกดาราพยากรณ์', powerBonus: 0.14, mitigationBonus: 0.06, descTh: 'คำนวณชะตาดาราพร้อมจารึกอักษรศักดิ์สิทธิ์ เพิ่มความแม่นยำและคริติคอลสูงสุด' },
    { id: 'SYN_SILK_AUTOMATON_THEATER', paths: ['SOUL_PUPPETRY', 'MECH_PUPPET'], nameTh: 'โรงละครหมื่นหุ่นเชิดวิญญาณกลไก', powerBonus: 0.14, mitigationBonus: 0.08, descTh: 'ผสานไหมเชิดวิญญาณและแกนกลจักร ควบคุมสมรภูมิและแบ่งรับความเสียหาย' },
    { id: 'SYN_CHAOS_GENESIS_FORGE', paths: ['PRIMORDIAL_CHAOS', 'CRAFT_CREATION'], nameTh: 'เตาหลอมหงเหมิงรังสรรค์จักรวาล', powerBonus: 0.16, mitigationBonus: 0.07, descTh: 'ปราณโกลาหลบรรพกาลหลอมรวมเพลิงสวรรค์ ทลายเกราะธาตุทุกชนิด' },
    { id: 'SYN_WAYFARER_BENEVOLENT_HERB', paths: ['WANDERING_DAO', 'SAGE_SUPPORT'], nameTh: 'หมอเทวดาพเนจรหมื่นลี้', powerBonus: 0.12, mitigationBonus: 0.09, descTh: 'ก้าวพเนจรผสานโอสถคีตเวทย์ ฟื้นฟูพลังชีวิตและคลายสถานะร้ายอย่างรวดเร็ว' },
    { id: 'SYN_BUSHIDO_SHINOBI_ECLIPSE', paths: ['SHADOW_SAMURAI', 'NINPO_SHADOW'], nameTh: 'ดาบไร้เงาและนินจาเร้นสังหาร', powerBonus: 0.16, mitigationBonus: 0.06, descTh: 'ร่างแยกเงาดึงความสนใจให้คมดาบอิไอฟันสังหารจุดตาย เพิ่มดาเมจคริติคอล +16%' },
    { id: 'SYN_HIGHER_REALM_THEOPHANY', paths: ['DIVINE_SUMMONER', 'DIVINE_POSSESSION'], nameTh: 'มหาเทวสภาจุติประทับภพ', powerBonus: 0.18, mitigationBonus: 0.08, descTh: 'ผสานร่างอัญเชิญและร่างทรงเทวะเบื้องบน เพิ่มอานุภาพพลังเทวะ +18% และลดความเสียหาย +8%' },
    { id: 'SYN_KHMER_NECRO_SANCTUARY', paths: ['OCCULT_MAGE', 'NETHER_GRAVE'], nameTh: 'บรมครูอาคมสะกดสุสานยมโลก', powerBonus: 0.14, mitigationBonus: 0.10, descTh: 'ผสานแรงครูคงกระพันและเกราะกระดูกสุสาน เพิ่มความถึกทนของกองทัพสูงสุด' }
  ]);

  C.evaluateCrossPathSynergies = party => {
    const list = Array.isArray(party) ? party.filter(u => u && !u.dead) : [];
    const activePaths = new Set();
    list.forEach(u => { if (u.cult && u.cult.path) activePaths.add(u.cult.path); });
    const matched = [];
    let totalPowerBonus = 0;
    let totalMitigationBonus = 0;
    for (let i = 0; i < C.CROSS_PATH_SYNERGIES.length; i++) {
      const syn = C.CROSS_PATH_SYNERGIES[i];
      if (syn.paths.every(p => activePaths.has(p))) {
        matched.push(syn);
        totalPowerBonus += syn.powerBonus;
        totalMitigationBonus += syn.mitigationBonus;
      }
    }
    return {
      activePaths: Array.from(activePaths),
      matchedSynergies: matched,
      powerMultiplier: +(1 + Math.min(0.45, totalPowerBonus)).toFixed(3),
      mitigationBonus: +Math.min(0.30, totalMitigationBonus).toFixed(3)
    };
  };


  /* =========================================================================
   * PATCH v2.4.0: 16 COMPOSABLE COMBAT KEYWORDS (COMBAT.keywordsOf & COMBAT.reflectOf)
   * AND ROW / BODYBLOCK GRID FORMATION (C03: FRONT_ROW / BACK_ROW)
   * ========================================================================= */
  C.KEYWORDS_CATALOG = Object.freeze({
    KW_ACCURACY: { id: 'KW_ACCURACY', group: 'OFFENSE', nameTh: 'เนตรแม่นยำ (Accuracy)', cap: 60 },
    KW_MARKSMAN_FOCUS: { id: 'KW_MARKSMAN_FOCUS', group: 'OFFENSE', nameTh: 'เพ่งเล็งจุดตายระยะไกล (Marksman Focus)', minDist: 2.2 },
    KW_CRIT_OVERFLOW: { id: 'KW_CRIT_OVERFLOW', group: 'CRIT', nameTh: 'คริติคอลล้นทะลัก (Crit Overflow)', convRatio: 1.5 },
    KW_CRIT_BREAK: { id: 'KW_CRIT_BREAK', group: 'CRIT', nameTh: 'คริทลายเกราะ (Crit Break)', penAddOnCrit: 14 },
    KW_PIERCE: { id: 'KW_PIERCE', group: 'PIERCE', nameTh: 'เจาะเกราะปราณ (Pierce)', cap: 82 },
    KW_ARMOR_READ: { id: 'KW_ARMOR_READ', group: 'PIERCE', nameTh: 'อ่านจุดอ่อนเกราะหนัก (Armor Read)', bonusPenVsTank: 14 },
    KW_REFLECT: { id: 'KW_REFLECT', group: 'DEFENSE', nameTh: 'สะท้อนความเสียหาย (Reflect)', capPct: 0.35 },
    KW_REFLECT_CONSOLIDATE: { id: 'KW_REFLECT_CONSOLIDATE', group: 'DEFENSE', nameTh: 'รวมศูนย์สะท้อนปราณ (Consolidated Reflect)', capHpMaxPct: 0.22 },
    KW_ABSORB_RELEASE: { id: 'KW_ABSORB_RELEASE', group: 'DEFENSE', nameTh: 'ดูดซับแล้วปลดปล่อย (Absorb & Release)', storeRatio: 0.25 },
    KW_ADAPTIVE_RESIST: { id: 'KW_ADAPTIVE_RESIST', group: 'DEFENSE', nameTh: 'เกราะปรับตัวต้านธาตุ (Adaptive Resist)', maxStacks: 3, perStackMit: 0.06 },
    KW_LAST_BREATH: { id: 'KW_LAST_BREATH', group: 'SURVIVAL', nameTh: 'ปราการเฮือกสุดท้าย (Last Breath)', hpThreshold: 0.35, mitBonus: 0.18, lifestealBonus: 0.12 },
    KW_TEMPO_STEAL: { id: 'KW_TEMPO_STEAL', group: 'CONTROL', nameTh: 'ช่วงชิงจังหวะร่าย (Tempo Steal)', castSteal: 12 },
    KW_STATUS_TRANSFER: { id: 'KW_STATUS_TRANSFER', group: 'CONTROL', nameTh: 'ถ่ายโอนสถานะร้าย (Status Transfer)', icdTicks: 10 },
    KW_CHARGE_RELEASE: { id: 'KW_CHARGE_RELEASE', group: 'TACTICAL', nameTh: 'ชาร์จปราณปลดปล่อย (Charge & Release)', releaseBonusMult: 1.25 },
    KW_CRAFT_PRECISION: { id: 'KW_CRAFT_PRECISION', group: 'CRAFT_CULT', nameTh: 'ความประณีตช่างเทวะ (Craft Precision)', maxQualityBonus: 0.12 },
    KW_FOCUS_WINDOW: { id: 'KW_FOCUS_WINDOW', group: 'CRAFT_CULT', nameTh: 'หน้าต่างสมาธิ (Focus Window)', earlyMult: 1.15, lateMult: 0.90 }
  });

  const EMPTY_KW_PROFILE = Object.freeze({
    accAdd: 0, marksmanFocus: false, critOverflow: false, critBreak: false,
    penAdd: 0, armorRead: false, reflectPct: 0, reflectConsolidate: true,
    absorbRelease: false, adaptiveResist: false, lastBreath: false,
    tempoSteal: false, statusTransfer: false, chargeRelease: false,
    craftPrecision: 0, focusWindow: false, dmgMult: 1.0, dmgMit: 0, activeKeywords: []
  });

  C.keywordsOf = u => {
    if (!u) return EMPTY_KW_PROFILE;
    const c = u.cult;
    const eq = u.equip || {};
    const ver = (u._ver || 0) + (u._passVer || 0) * 31 + (u._kwVer || 0) * 131;
    const keywordSignature = list => {
      if (!Array.isArray(list)) return '';
      let signature = '';
      for (const kw of list) signature += '|' + (typeof kw === 'string' ? kw : (kw && kw.id) || '') + ':' + (kw && kw.value != null ? kw.value : '');
      return signature;
    };
    let eqSig = keywordSignature(u.combatKeywords);
    for (const slot of ['WEAPON', 'ARMOR', 'ACCESSORY']) {
      const it = eq[slot];
      const usable = !!it && (!g.MARTIAL || !g.MARTIAL.gearUsable || g.MARTIAL.gearUsable(u, it));
      eqSig += ';' + slot + ':' + (it ? (it.uid || it.id || '') : '') + ':' + (it ? it.dur : '') + ':' + usable + keywordSignature(it && it.combatKeywords);
    }
    const stc = u._activeStance || u._combatStance || '';
    const craftPath = c && ['CRAFT_CREATION', 'MECH_PUPPET', 'SPIRIT_HUSBANDRY'].includes(c.path);
    const craftSkills = (u.h && u.h.skills) || {};
    const bestCraft = craftPath ? Math.max(craftSkills.ALCHEMY || 0, craftSkills.FORGING || 0, craftSkills.ARRAY || 0, craftSkills.TALISMAN || 0) : 0;
    if (u._kwCache && u._kwCache.ver === ver && u._kwCache.path === (c && c.path) && u._kwCache.sub === (c && c.sub) && u._kwCache.eqSig === eqSig && u._kwCache.stc === stc && u._kwCache.bestCraft === bestCraft) {
      return u._kwCache.out;
    }

    let accAdd = 0, penAdd = 0, reflectPct = 0, dmgMult = 1.0, dmgMit = 0, craftPrecision = 0;
    let marksmanFocus = false, critOverflow = false, critBreak = false, armorRead = false;
    let absorbRelease = false, adaptiveResist = false, lastBreath = false;
    let tempoSteal = false, statusTransfer = false, chargeRelease = false, focusWindow = false;
    const activeSet = new Set();

    const pKey = c ? c.path : '';
    const subKey = c ? c.sub : '';
    const wType = (!u.foe && g.MARTIAL && g.MARTIAL.equippedType) ? g.MARTIAL.equippedType(u) : (u.weaponType || 'FIST');

    // Weapon & Path intrinsic keyword bindings
    if (wType === 'BOW' || wType === 'NEEDLE' || wType === 'ASTROLABE' || pKey === 'ASTRO_DIVINATION') {
      accAdd += 12; marksmanFocus = true; activeSet.add('KW_ACCURACY'); activeSet.add('KW_MARKSMAN_FOCUS');
    }
    if (wType === 'SWORD' || wType === 'CLAW' || pKey === 'SHADOW_SAMURAI' || pKey === 'NINPO_SHADOW' || pKey === 'FORTUNE_GAMBLER') {
      critOverflow = true; critBreak = true; activeSet.add('KW_CRIT_OVERFLOW'); activeSet.add('KW_CRIT_BREAK');
    }
    if (wType === 'SPEAR' || wType === 'ABACUS' || pKey === 'LORE_ARCHIVIST' || pKey === 'STRATEGY_GOVERNANCE') {
      penAdd += 10; armorRead = true; activeSet.add('KW_PIERCE'); activeSet.add('KW_ARMOR_READ');
    }
    if (wType === 'STAFF' || wType === 'ROSARY' || pKey === 'KARMA_SAMSARA' || pKey === 'BUDDHA_DHARMA' || pKey === 'HEART_SOUL') {
      reflectPct += 0.12; activeSet.add('KW_REFLECT'); activeSet.add('KW_REFLECT_CONSOLIDATE');
    }
    if (pKey === 'GRAVITY_DAO' || pKey === 'BODY' || pKey === 'DEVOURING_FLESH' || subKey === 'VAJRA_BODHI') {
      absorbRelease = true; adaptiveResist = true; activeSet.add('KW_ABSORB_RELEASE'); activeSet.add('KW_ADAPTIVE_RESIST');
    }
    if (pKey === 'DEMON' || pKey === 'ARENA_GLORY' || pKey === 'PRIMORDIAL_SHIFTER' || (Array.isArray(u.experienceTraits) && u.experienceTraits.some(t => t && t.id === 'EXP_TRAIT_DEFEAT_VETERAN'))) {
      lastBreath = true; activeSet.add('KW_LAST_BREATH');
    }
    if (wType === 'ZITHER' || wType === 'FAN' || pKey === 'SONIC_HARMONY' || pKey === 'CHRONO_EPOCH') {
      tempoSteal = true; activeSet.add('KW_TEMPO_STEAL');
    }
    if (pKey === 'VENOM_GU' || pKey === 'OCCULT_MAGE' || pKey === 'VOID_HERETIC_PACT' || pKey === 'KARMA_SAMSARA') {
      statusTransfer = true; activeSet.add('KW_STATUS_TRANSFER');
    }
    if (wType === 'BLADE' || wType === 'BRUSH' || pKey === 'ARRAY_TALISMAN' || pKey === 'CELESTIAL_WEATHER') {
      chargeRelease = true; activeSet.add('KW_CHARGE_RELEASE');
    }
    if (craftPath) {
      craftPrecision = clamp(0.03 + (bestCraft / 100) * 0.09, 0.02, 0.12);
      activeSet.add('KW_CRAFT_PRECISION');
    }
    if (pKey === 'XIAN' || pKey === 'LORE_ARCHIVIST' || pKey === 'INK_LITERATI' || (u.mantraState && u.mantraState.stance === 'SERENE_PURIFICATION')) {
      focusWindow = true; activeSet.add('KW_FOCUS_WINDOW');
    }

    // Explicit unit.keywords or equipment keywords overrides
    const explicitList = Array.isArray(u.combatKeywords) ? u.combatKeywords.slice() : [];
    for (const slot of ['WEAPON', 'ARMOR', 'ACCESSORY']) {
      const it = eq[slot];
      if (it && (!g.MARTIAL || !g.MARTIAL.gearUsable || g.MARTIAL.gearUsable(u, it)) && Array.isArray(it.combatKeywords)) explicitList.push(...it.combatKeywords);
    }
    for (const kw of explicitList) {
      const id = typeof kw === 'string' ? kw : (kw && kw.id);
      if (!id || !C.KEYWORDS_CATALOG[id]) continue;
      activeSet.add(id);
      if (id === 'KW_ACCURACY') accAdd += (kw.value || 15);
      else if (id === 'KW_MARKSMAN_FOCUS') marksmanFocus = true;
      else if (id === 'KW_CRIT_OVERFLOW') critOverflow = true;
      else if (id === 'KW_CRIT_BREAK') critBreak = true;
      else if (id === 'KW_PIERCE') penAdd += (kw.value || 12);
      else if (id === 'KW_ARMOR_READ') armorRead = true;
      else if (id === 'KW_REFLECT') reflectPct += (kw.value || 0.14);
      else if (id === 'KW_ABSORB_RELEASE') absorbRelease = true;
      else if (id === 'KW_ADAPTIVE_RESIST') adaptiveResist = true;
      else if (id === 'KW_LAST_BREATH') lastBreath = true;
      else if (id === 'KW_TEMPO_STEAL') tempoSteal = true;
      else if (id === 'KW_STATUS_TRANSFER') statusTransfer = true;
      else if (id === 'KW_CHARGE_RELEASE') chargeRelease = true;
      else if (id === 'KW_CRAFT_PRECISION') craftPrecision = Math.max(craftPrecision, kw.value || 0.08);
      else if (id === 'KW_FOCUS_WINDOW') focusWindow = true;
    }

    // Enforce global hard caps from Section 2.1
    accAdd = clamp(accAdd, 0, 60);
    penAdd = clamp(penAdd, 0, 82);
    reflectPct = clamp(reflectPct, 0, 0.35);
    dmgMult = clamp(dmgMult, 0.5, 1.60);
    dmgMit = clamp(dmgMit, 0, 0.60);

    const out = Object.freeze({
      accAdd, marksmanFocus, critOverflow, critBreak,
      penAdd, armorRead, reflectPct, reflectConsolidate: true,
      absorbRelease, adaptiveResist, lastBreath,
      tempoSteal, statusTransfer, chargeRelease,
      craftPrecision, focusWindow, dmgMult, dmgMit,
      activeKeywords: Array.from(activeSet)
    });
    u._kwCache = { ver, path: c && c.path, sub: c && c.sub, eqSig, stc, bestCraft, out };
    return out;
  };

  // Consolidated Single-Pass Reflection Helper (KW_REFLECT_CONSOLIDATE)
  C.reflectOf = (W, f, d, a, dmg, o) => {
    if (!d || !a || d.dead || a.dead || dmg <= 0 || (o && o.noReflect)) return 0;
    const ST = STs();
    let totalPct = 0;
    const kwD = C.keywordsOf(d);
    if (kwD && kwD.reflectPct > 0) totalPct += kwD.reflectPct;
    if (!d.foe && d.deityPact && d.deityPact.reflectPct > 0) totalPct += d.deityPact.reflectPct;
    if (!d.foe && C.ACTION_MASTERY_TRAITS && C.ACTION_MASTERY_TRAITS.hasTrait(d, 'TRAIT_PARRY_COUNTER')) totalPct += 0.15;
    if (!d.foe && (ST.has(d, 'karmicAegis', W && W.t) || (ST.hasBuff && ST.hasBuff(d, 'karmicAegis', W && W.t)))) totalPct += 0.22;
    if (!d.foe && d.cult && d.cult.path === 'HEART_SOUL') {
      const trD = CULT.trackRealm(d);
      const refPct = clamp((trD && trD.realmBuffs && trD.realmBuffs.reflectPct) ? trD.realmBuffs.reflectPct : (d.cult.stage * 1.3), 1, 15) / 100;
      totalPct += refPct;
    }
    if (!d.foe && d.cult && d.cult.path === 'KARMA_SAMSARA' && ['REVERSED_RETRIBUTION', 'FATE_SEVERING_THREAD', 'RED_THREAD_ARBITER'].includes(d.cult.sub)) {
      totalPct += 0.14;
    }
    const dStance = ST.getActiveStanceSpec ? ST.getActiveStanceSpec(d) : null;
    if (dStance && dStance.reflectPct) totalPct += dStance.reflectPct;
    if (ST.has(d, 'cryoMirror', W && W.t) || (ST.hasBuff && ST.hasBuff(d, 'cryoMirror', W && W.t))) {
      totalPct += 0.25;
      if (ST.clearBuff) ST.clearBuff(d, 'cryoMirror');
    }
    if (totalPct <= 0) return 0;
    const cappedPct = clamp(totalPct, 0, 0.35);
    const maxByAttackerHp = Math.max(1, Math.round(C.hpMax(a) * 0.22));
    const reflected = Math.max(1, Math.min(maxByAttackerHp, Math.round(dmg * cappedPct)));
    d.lastReflect = reflected;
    C.applyDamage(W, f, d, a, reflected, 'สะท้อนปราณรวมศูนย์');
    return reflected;
  };

  // C03: Row / Bodyblock Grid Combat (FRONT_ROW / BACK_ROW)
  C.inferDefaultRow = u => {
    if (!u) return 'FRONT_ROW';
    if (u.combatRow === 'FRONT_ROW' || u.combatRow === 'BACK_ROW') return u.combatRow;
    const role = C.inferCombatRole ? C.inferCombatRole(u) : 'FIGHTER';
    if (role === 'HEALER' || role === 'CASTER') return 'BACK_ROW';
    const SK = SKs();
    const wp = (SK && SK.weaponTacticalProfile) ? SK.weaponTacticalProfile(u) : null;
    if (wp && wp.reachClass === 'RANGED_KITE') return 'BACK_ROW';
    return 'FRONT_ROW';
  };

  C.assignCombatRows = (W, f) => {
    if (!f) return { A: {}, B: {} };
    f.rows = f.rows || { A: {}, B: {} };
    for (const side of ['A', 'B']) {
      const ids = f[side] || [];
      let hasFront = false;
      for (const id of ids) {
        const u = C.unit(W, id);
        if (!u) continue;
        const r = C.inferDefaultRow(u);
        f.rows[side][id] = r;
        if (r === 'FRONT_ROW' && C.alive(u)) hasFront = true;
      }
      // If all alive units defaulted to BACK_ROW, promote the highest-HP unit to FRONT_ROW for this fight only
      if (!hasFront && ids.length > 0) {
        const firstAlive = ids.map(id => C.unit(W, id)).filter(C.alive).sort((a, b) => C.hpMax(b) - C.hpMax(a))[0];
        if (firstAlive) {
          f.rows[side][firstAlive.id] = 'FRONT_ROW';
        }
      }
    }
    return f.rows;
  };

  C.getUnitRow = (f, uOrId) => {
    const id = typeof uOrId === 'string' ? uOrId : (uOrId && uOrId.id);
    const u = typeof uOrId === 'object' ? uOrId : null;
    if (f && f.rows) {
      const s = C.sideOf(f, id);
      if (s && f.rows[s] && f.rows[s][id]) return f.rows[s][id];
    }
    if (u && (u.combatRow === 'FRONT_ROW' || u.combatRow === 'BACK_ROW')) return u.combatRow;
    return u ? C.inferDefaultRow(u) : 'FRONT_ROW';
  };

  C.resolveRowBodyblock = (W, f, a, d, o) => {
    if (!W || !f || !a || !d || !C.alive(a) || !C.alive(d)) return null;
    if (o && (o.noIntercept || o.forced || o.isPetAssist || o.noProc || o.ignoresRowBlock)) return null;
    const moveArch = (o && (o.arch || (o.skill && o.skill.arch))) || 'strike';
    // Flying/blink/snipe/soul/aoe/ranged attacks bypass melee row bodyblock
    if (['blink', 'snipe', 'soul', 'barrage', 'blast', 'wave'].includes(moveArch) || (o && o.isAoeMultiTarget)) return null;
    const moveSpec = (o && o.moveSpec) || ((o && o.skill && SKs() && SKs().resolveMoveSpatialSpec) ? SKs().resolveMoveSpatialSpec(o.skill, a) : null);
    if (moveSpec && (moveSpec.ignoresObstacles || moveSpec.bandIndex >= 4 || moveSpec.requiresLoS || moveSpec.max > 2.6)) return null;

    if (!f.rows) C.assignCombatRows(W, f);
    const dRow = C.getUnitRow(f, d);
    if (dRow !== 'BACK_ROW') return null;

    const allies = C.alliesOf(W, f, d.id).filter(u => {
      if (!u || u.id === d.id || !C.alive(u) || C.getUnitRow(f, u) !== 'FRONT_ROW') return false;
      if (!C.canUnitIntercept(W, f, u)) return false;
      if (Number.isFinite(u.x) && Number.isFinite(d.x) && C.unitDist(u, d) > 24.0) return false;
      if (Number.isFinite(u.x) && Number.isFinite(a.x) && C.unitDist(u, a) > 24.0) return false;
      return true;
    });
    if (!allies.length) return null;

    // Pick frontline blocker with highest HP fraction / tank role
    allies.sort((x, y) => {
      const rx = C.inferCombatRole(x) === 'TANK' ? 1 : 0;
      const ry = C.inferCombatRole(y) === 'TANK' ? 1 : 0;
      return (ry - rx) || (hpFrac(y) - hpFrac(x));
    });
    const blk = allies[0];
    const tNow = (W && W.t) || 0;
    const bTac = C.ensureUnitTac(blk);
    bTac.reactionCharges = Math.max(0, (bTac.reactionCharges == null ? 1 : bTac.reactionCharges) - 1);
    bTac.reactionReadyAt = tNow + 6;
    bTac.interceptCount = (bTac.interceptCount || 0) + 1;
    bTac.coveringAllyId = d.id;
    if (!blk.foe && C.ACTION_MASTERY_TRAITS) C.ACTION_MASTERY_TRAITS.recordAction(W, blk, 'coverCount', 1);
    const ft = C.ensureFightTac(f, tNow);
    ft.stats.intercepts = (ft.stats.intercepts || 0) + 1;
    const reasonTh = C.name(blk) + ' ยืนแถวหน้าขวางการโจมตีประชิดแทนแถวหลัง ' + C.name(d);
    blk.fx = { t: tNow, text: '🛡️ แถวหน้าขวางศึก!' };
    blk.lastInterceptEvent = { t: tNow, kind: 'ROW_BODYBLOCK', protectedId: d.id, attackerId: a.id, reasonTh };
    return { interceptor: blk, kind: 'ROW_BODYBLOCK', dmgMult: 0.80, reasonTh, interceptCap: 0.85 };
  };

  g.COMBAT = C;
  if (typeof module === 'object' && module.exports) module.exports = C;
})(typeof globalThis !== 'undefined' ? globalThis : this);
