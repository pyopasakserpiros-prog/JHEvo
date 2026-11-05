/* ai.js — สมองของ NPC: ความต้องการ → คะแนนความอยาก (utility) จากตัวตนจริง → เลือกกิจกรรม → เดินไปสถานี → ทำ → ผลลัพธ์
 * ทุกกิจกรรมมี "เหตุผล" บันทึกไว้ให้ UI แสดง (npc.why) ไม่มีการสุ่มลอย ๆ — สุ่มได้เพียงเล็กน้อยตามนิสัย (sensationSeeking/discipline) */
(function (g) {
  'use strict';
  const U = g.U || require('./util.js'), HC = g.HC, MAP = g.MAP, CULT = g.CULT, ECO = g.ECO, SECT = g.SECT, JD = g.JD;
  const clamp = U.clamp;
  const AI = {};

  /* ---------- ตัวช่วย ---------- */
  const hourOf = W => (W.t % 1440) / 60;
  AI.hour = hourOf;
  const isNight = h => h >= 21 || h < 5;
  const E = (n, p) => HC.eff(n, p);
  function ScoreAcc() { this.u = 0; this.why = []; } ScoreAcc.prototype.add = function(l, v) { this.u += v; if (Math.abs(v) > 0.06) this.why.push([l, Math.round(v * 100) / 100]); return this; }; function Sc() { return new ScoreAcc(); }
  if (!HC._fastTrainWrapped) {
    HC._fastTrainWrapped = true;
    const _tb = HC.trainBody, _tm = HC.trainMind, _gw = HC.gainWisdom;
    const _syncVer = (npc, id) => {
      const v = npc._ver;
      if (npc._pspCache) npc._pspCache.ver = v;
      if (npc._skRateCache) npc._skRateCache.ver = v;
      if (npc._gsc) npc._gsc.ver = v;
      if (npc._topInt) npc._topInt.ver = v;
      if (npc._bnInspectCache) npc._bnInspectCache.ver = v;
      if (npc._retrainPickCache) npc._retrainPickCache.ver = v;
      if (npc._cogModCtx) npc._cogModCtx.ver = v;
      if (npc._mcCache) npc._mcCache.ver = v;
      if (npc._dwVer !== undefined) npc._dwVer = v;
      if (npc._qiMaxCache && id !== 'meridianCapacity' && id !== 'spiritualFoundation') npc._qiMaxCache.ver = v;
      if (npc._cultRateBase && npc.cult && npc.cult.path !== 'BODY' && npc.cult.path !== 'BEAST_SOVEREIGN' && id !== 'dexterity' && id !== 'meridianCapacity' && id !== 'spiritualFoundation' && id !== 'meridianIntegrity') npc._cultRateBase.ver = v;
    };
    HC.trainBody = (npc, id, load) => {
      const isHp = id === 'vitality' || id === 'toughness' || id === 'strength';
      const hp0 = isHp ? Math.round(70 + HC.eff(npc, 'physiology.vitality') * 1.1 + HC.eff(npc, 'physiology.toughness') * 0.5 + HC.eff(npc, 'physiology.strength') * 0.2) : 0;
      const vit0 = id === 'vitality' ? (HC.eff(npc, 'physiology.vitality') | 0) : 0;
      const tuf0 = id === 'toughness' ? (npc.h.physiology.toughness | 0) : 0;
      const str0 = id === 'strength' ? (npc.h.physiology.strength | 0) : 0;
      const v0 = npc._ver || 0, c0 = npc._c, d0 = npc._d, cs0 = npc._cs, csb0 = npc._csBase, nd0 = npc._nd, hpCache0 = npc._hpMaxCache, mDer0 = npc._mDer, x0 = npc.h.physiology[id];
      const g2 = _tb(npc, id, load);
      if (c0 && c0.day === HC.nowDay) { c0.ver = npc._ver; delete c0.v['physiology.' + id]; npc._c = c0; }
      const nhp = isHp ? Math.round(70 + HC.eff(npc, 'physiology.vitality') * 1.1 + HC.eff(npc, 'physiology.toughness') * 0.5 + HC.eff(npc, 'physiology.strength') * 0.2) : 0;
      const hpSame = !isHp || (nhp === hp0);
      if ((x0 | 0) === (npc.h.physiology[id] | 0) && hpSame) {
        npc._ver = v0;
        if (npc._c) npc._c.ver = v0;
        if (d0 && d0.ver === v0) npc._d = d0;
        if (cs0 && cs0.ver === v0) npc._cs = cs0;
        if (csb0 && csb0.ver === v0) npc._csBase = csb0;
        if (hpCache0 && hpCache0.ver === v0) npc._hpMaxCache = hpCache0;
        if (mDer0 && mDer0.ver === v0 && id !== 'speed' && id !== 'agility') npc._mDer = mDer0;
        if (nd0 && nd0.ver === v0 && id !== 'recoveryRate') npc._nd = nd0;
      } else {
        _syncVer(npc, id);
        if (d0 && d0.day === HC.nowDay && d0.ver === v0 && id !== 'meridianCapacity' && id !== 'spiritualFoundation' && id !== 'meridianIntegrity') {
          if (isHp) { d0.hpMax = nhp; if (id === 'strength') d0.carry = 20 + HC.eff(npc, 'physiology.strength') * 0.8; }
          if (id === 'speed' || id === 'agility') d0.walkSpeed = 0.75 + (HC.eff(npc, 'physiology.speed') * 0.7 + HC.eff(npc, 'physiology.agility') * 0.3) / 100 * 0.9;
          if (id === 'strength' || id === 'speed' || id === 'agility' || id === 'endurance' || id === 'toughness' || id === 'reflex') {
            d0.physicalIndex = (HC.eff(npc, 'physiology.strength') + HC.eff(npc, 'physiology.speed') + HC.eff(npc, 'physiology.agility') + HC.eff(npc, 'physiology.endurance') + HC.eff(npc, 'physiology.toughness') + HC.eff(npc, 'physiology.reflex')) / 6;
          }
          d0.ver = npc._ver; npc._d = d0;
        }
        if (hpSame && hpCache0 && hpCache0.day === HC.nowDay && hpCache0.ver === v0) { hpCache0.ver = npc._ver; npc._hpMaxCache = hpCache0; }
        else npc._hpMaxCache = null;
        if (csb0 && csb0.day === HC.nowDay && csb0.ver === v0 && (id === 'dexterity' || id === 'immunity' || id === 'recoveryRate' || id === 'balance' || id === 'flexibility' || id === 'painTolerance' || id === 'thermalTolerance')) { csb0.ver = npc._ver; npc._csBase = csb0; if (cs0 && cs0.ver === v0) { cs0.ver = npc._ver; npc._cs = cs0; } }
        if (hpSame && mDer0 && mDer0.day === HC.nowDay && mDer0.ver === v0 && id !== 'speed' && id !== 'agility') mDer0.ver = npc._ver;
        else npc._mDer = null;
        if (nd0 && nd0.day === HC.nowDay && nd0.ver === v0 && id !== 'recoveryRate') {
          const vitSame = id !== 'vitality' || ((HC.eff(npc, 'physiology.vitality') | 0) === vit0);
          const tufSame = id !== 'toughness' || ((npc.h.physiology.toughness | 0) === tuf0);
          const strSame = id !== 'strength' || ((npc.h.physiology.strength | 0) === str0);
          if (hpSame && vitSame && tufSame && strSame) nd0.ver = npc._ver;
          else npc._nd = null;
        } else {
          npc._nd = null;
        }
      }
      return g2;
    };
    HC.trainMind = (npc, id, load) => {
      const v0 = npc._ver || 0, c0 = npc._c, d0 = npc._d, cs0 = npc._cs, csb0 = npc._csBase, nd0 = npc._nd, x0 = npc.h.intellect[id];
      const g2 = _tm(npc, id, load);
      if ((x0 | 0) === (npc.h.intellect[id] | 0)) {
        npc._ver = v0;
        if (c0) { c0.ver = v0; npc._c = c0; delete c0.v['intellect.' + id]; }
        if (d0) npc._d = d0; if (cs0) npc._cs = cs0; if (csb0) npc._csBase = csb0;
      } else {
        if (c0 && c0.day === HC.nowDay) { c0.ver = npc._ver; delete c0.v['intellect.' + id]; npc._c = c0; }
        _syncVer(npc, id);
        if (nd0 && nd0.day === HC.nowDay && nd0.ver === v0) nd0.ver = npc._ver;
        if (npc._hpMaxCache && npc._hpMaxCache.ver === v0) npc._hpMaxCache.ver = npc._ver;
        if (npc._mDer && npc._mDer.ver === v0) npc._mDer.ver = npc._ver;
        if (csb0 && csb0.day === HC.nowDay && csb0.ver === v0 && id !== 'comprehension' && id !== 'willpower' && id !== 'perceptiveness' && id !== 'focus' && id !== 'intuition') { csb0.ver = npc._ver; npc._csBase = csb0; if (cs0 && cs0.ver === v0) { cs0.ver = npc._ver; npc._cs = cs0; } }
      }
      return g2;
    };
    HC.gainWisdom = (npc, amt) => {
      const v0 = npc._ver || 0, c0 = npc._c, d0 = npc._d, cs0 = npc._cs, csb0 = npc._csBase, nd0 = npc._nd, x0 = npc.h.intellect.wisdom;
      _gw(npc, amt);
      if ((x0 | 0) === (npc.h.intellect.wisdom | 0)) {
        npc._ver = v0;
        if (c0) { c0.ver = v0; npc._c = c0; delete c0.v['intellect.wisdom']; }
        if (d0) npc._d = d0; if (cs0) npc._cs = cs0; if (csb0) npc._csBase = csb0;
      } else {
        if (c0 && c0.day === HC.nowDay) { c0.ver = npc._ver; delete c0.v['intellect.wisdom']; npc._c = c0; }
        if (d0 && d0.day === HC.nowDay) { d0.ver = npc._ver; npc._d = d0; }
        _syncVer(npc, 'wisdom');
        if (nd0 && nd0.day === HC.nowDay && nd0.ver === v0) nd0.ver = npc._ver;
        if (npc._hpMaxCache && npc._hpMaxCache.ver === v0) npc._hpMaxCache.ver = npc._ver;
        if (npc._mDer && npc._mDer.ver === v0) npc._mDer.ver = npc._ver;
        if (csb0 && csb0.day === HC.nowDay && csb0.ver === v0) { csb0.ver = npc._ver; npc._csBase = csb0; if (cs0 && cs0.ver === v0) { cs0.ver = npc._ver; npc._cs = cs0; } }
      }
    };
  }
  const VALUE_TH = { familyClan: 'พวกพ้อง', sectDuty: 'หน้าที่ต่อสำนัก', martialPeak: 'วิถียุทธ์', knowledgeCraft: 'ความรู้', freedom: 'อิสรภาพ', wealthResource: 'ทรัพย์', powerStatus: 'อำนาจ', honorLegacy: 'เกียรติยศ' };
  AI.VALUE_TH = VALUE_TH;
  function valueTerm(n, vf, S) {
    if (!vf) return;
    if (S._fast) {
      let tot = 0, has = false;
      for (const k in vf) {
        const imp = E(n, VAL_PATHS[k] || ('values.' + k)) / 100, def = (100 - n.h.fulfil[k]) / 100;
        const v = vf[k] * (0.15 + imp) * def * 0.95;
        tot += v; if (v > 0) has = true;
      }
      if (has) S.u += tot;
      return;
    }
    let tot = 0, best = null, bv = 0;
    for (const k in vf) {
      const imp = E(n, VAL_PATHS[k] || ('values.' + k)) / 100, def = (100 - n.h.fulfil[k]) / 100;
      const v = vf[k] * (0.15 + imp) * def * 0.95;
      tot += v; if (v > bv) { bv = v; best = k; }
    }
    if (best) S.add('คุณค่า:' + VALUE_TH[best], tot);
  }
  const VAL_IDS = HC.layerIds('values'), INT_IDS = HC.layerIds('interests'), INT_LABEL = {}, VAL_PATHS = {}, INT_PATHS = {};
  VAL_IDS.forEach(id => { VAL_PATHS[id] = 'values.' + id; });
  INT_IDS.forEach(id => { INT_PATHS[id] = 'interests.' + id; });
  INT_IDS.forEach(id => { INT_LABEL[id] = 'ชอบ' + HC.nameOf('interests.' + id); });
  function interestTerm(n, id, S, w) { if (!id) return; const v = E(n, INT_PATHS[id] || ('interests.' + id)); if (S._fast) { S.u += (v - 48) / 100 * (w || 1.15); return; } S.add(INT_LABEL[id] || ('ชอบ' + HC.nameOf('interests.' + id)), (v - 48) / 100 * (w || 1.15)); }
  function dutyWeight(n) { if (n._dw !== undefined && n._dwVer === n._ver && n._dwDay === HC.nowDay) return n._dw; const v = clamp(0.3 + E(n, 'personality.discipline') / 160 + E(n, 'personality.loyalty') / 220 + E(n, 'values.sectDuty') / 260, 0.2, 1.4); n._dw = v; n._dwVer = n._ver; n._dwDay = HC.nowDay; return v; }
  AI.dutyWeight = dutyWeight;

  /* ---------- สถานี ---------- */
  AI.freeStation = (W, n, kind, bkeys, opts) => {
    const owner = opts && opts.owner != null ? opts.owner : null;
    let best = null, bd = 1e9;
    const stations = W.map.stations;
    if (typeof bkeys === 'string') {
      const b = W.map.byId[bkeys];
      if (!b) return null;
      const stIds = b.stations;
      for (let i = 0; i < stIds.length; i++) {
        const s = stations[stIds[i]]; if (s.kind !== kind || s.occ) continue;
        if (owner != null && s.owner != null && s.owner !== owner) continue;
        const d = Math.abs(s.x - n.x) + Math.abs(s.y - n.y);
        if (d < bd) { bd = d; best = s; }
      }
      return best;
    }
    const list = bkeys ? bkeys : W.map.buildings;
    for (let j = 0; j < list.length; j++) {
      const b = typeof list[j] === 'string' ? W.map.byId[list[j]] : list[j];
      if (!b) continue;
      const stIds = b.stations;
      for (let i = 0; i < stIds.length; i++) {
        const s = stations[stIds[i]]; if (s.kind !== kind || s.occ) continue;
        if (owner != null && s.owner != null && s.owner !== owner) continue;
        const d = Math.abs(s.x - n.x) + Math.abs(s.y - n.y);
        if (d < bd) { bd = d; best = s; }
      }
    }
    return best;
  };
  AI.reserve = (W, n, s) => { s.occ = n.id; n.act.st = s.id; if (s.inside) { const b = W.map.buildings[s.bid]; if (!b.inside.includes(n.id)) b.inside.push(n.id); } };
  AI.release = (W, n) => {
    if (n.act && n.act.st != null) {
      const s = W.map.stations[n.act.st];
      if (s && s.occ === n.id) { s.occ = null; if (s.inside) { const b = W.map.buildings[s.bid]; const i = b.inside.indexOf(n.id); if (i >= 0) b.inside.splice(i, 1); } }
      n.act.st = null;
    }
    n.hidden = false;
  };
  AI.assignBed = (W, n) => {
    if (n.bed != null) { const s = W.map.stations[n.bed]; if (s && s.owner === n.id) return; }
    const pref = SECT.RANKS[n.rank].dorm;
    const order = n.rank >= 4 ? ['elder_quarters', 'dorm_core', 'dorm_inner', 'dorm_outer'] : [pref, 'dorm_inner', 'dorm_outer', 'dorm_core'];
    // เลือกที่พักตามลำดับ ถ้าเต็มให้ลงต่ำกว่า
    for (const k of order) {
      const b = W.map.byId[k]; const cap = Math.round(b.stations.length * (1 + 0.0));
      for (const sid of b.stations) { const s = W.map.stations[sid]; if (s.kind === 'bed' && s.owner == null) { s.owner = n.id; n.bed = s.id; return; } }
    }
    n.bed = null;
    if (g.SECT && g.SECT.recordFacilityDemand) g.SECT.recordFacilityDemand(W, 'dorm_outer', 'no_bed', n);
  };
  AI.freeBed = (W, n) => { if (n.bed != null) { const s = W.map.stations[n.bed]; if (s) s.owner = null; n.bed = null; } };

  /* ---------- การเคลื่อนที่ ---------- */
  AI.goTo = (W, n, tx, ty) => {
    const p = MAP.findPath(W.map, n.x, n.y, tx, ty);
    if (!p) { n.path = null; return false; }
    n.path = p; n.pi = (p.length > 1 && Math.abs(p[0][0] + 0.5 - n.x) + Math.abs(p[0][1] + 0.5 - n.y) < 0.6) ? 1 : 0;
    if (n.pi >= p.length) n.pi = p.length - 1;
    return true;
  };
  AI.walkSpeed = (W, n) => {
    const injLen = n.inj ? n.inj.length : 0, bLen = n.buffs ? n.buffs.length : 0, sxLen = n.sx ? n.sx.length : 0, cSt = n.cult ? n.cult.stage : 0, pVer = n._passVer || 0, bLast = bLen ? n.buffs[bLen - 1] : null, sxLast = sxLen ? n.sx[sxLen - 1] : null;
    const p0 = n.h.physiology, spd0 = p0.speed | 0, agi0 = p0.agility | 0, mLen0 = n.mods ? n.mods.length : 0, eqW0 = n.equip && n.equip.WEAPON, eqA0 = n.equip && n.equip.ARMOR, eqX0 = n.equip && n.equip.ACCESSORY;
    let wb = n._wsBase;
    if (!wb || wb.spd !== spd0 || wb.agi !== agi0 || wb.mLen !== mLen0 || wb.eqW !== eqW0 || wb.eqA !== eqA0 || wb.eqX !== eqX0 || wb.day !== HC.nowDay || wb.cSt !== cSt || wb.pVer !== pVer || wb.injLen !== injLen || wb.bLen !== bLen || wb.bLast !== bLast || wb.sxLen !== sxLen || wb.sxLast !== sxLast || (sxLen > 0 && W.t >= (wb.sxExp || 0))) {
      const progB = (g.MARTIAL && g.MARTIAL.progression) ? g.MARTIAL.progression(n).body : {};
      const baseWs = (0.75 + (E(n, "physiology.speed") * 0.7 + E(n, "physiology.agility") * 0.3) / 100 * 0.9) + ((progB.speed || 0) * 0.7 + (progB.agility || 0) * 0.3) / 100 * 0.9;
      let sxExp = Infinity;
      if (sxLen > 0) { for (let i = 0; i < sxLen; i++) { const u = n.sx[i] && n.sx[i].until; if (u > W.t && u < sxExp) sxExp = u; } }
      wb = n._wsBase = { spd: spd0, agi: agi0, mLen: mLen0, eqW: eqW0, eqA: eqA0, eqX: eqX0, ver: n._ver, day: HC.nowDay, cSt, pVer, injLen, bLen, bLast, sxLen, sxLast, sxExp, v: baseWs * CULT.speedMult(n) };
    }
    let v = wb.v * MAP.speedAt(W.map, n.x, n.y);
    if (injLen) v *= 0.75; if (n.h.state.energy < 20) v *= 0.8; if (n.run) v *= 1.5;
    if (W.weather && W.weather.kind === 'snow') v *= 0.9; if (W.weather && W.weather.kind === 'rain') v *= 0.95;
    return v;
  };
  AI.stepMove = (W, n) => {
    const p = n.path; if (!p) return true;
    let budget = AI.walkSpeed(W, n);
    while (budget > 1e-4 && n.pi < p.length) {
      const tx = p[n.pi][0] + 0.5, ty = p[n.pi][1] + 0.5, dx = tx - n.x, dy = ty - n.y, d = Math.hypot(dx, dy);
      if (d <= budget) { n.x = tx; n.y = ty; budget -= d; n.pi++; }
      else { n.x += dx / d * budget; n.y += dy / d * budget; budget = 0; }
      if (d > 0.02) { if (Math.abs(dx) > 0.02) n.face = dx >= 0 ? 1 : -1; n.dir = Math.atan2(dy, dx); }
    }
    if (n.pi >= p.length) { n.path = null; return true; }
    return false;
  };

  /* ---------- นิยามกิจกรรม ---------- */
  const A = {}; AI.ACTS = A;
  const idleOk = n => !n.act || n.act.id === 'idle';
  const MC_AFF_MAP = { BOW: 'SWORD', STAFF: 'SPEAR', FOCUS: 'SOUL_DIVINE', ZITHER: 'SOUL_DIVINE', BRUSH: 'TALISMAN', WHIP: 'SPEAR' };
  const MC_IDS = ['SWORD', 'BLADE', 'SPEAR', 'FIST_PALM', 'BOW', 'STAFF', 'FOCUS', 'ZITHER', 'BRUSH', 'WHIP', 'MOVEMENT', 'BODY_REFINING', 'SOUL_DIVINE', 'POISON', 'ARRAY', 'TALISMAN'];
  function martialChoice(n, W) {
    if (g.MARTIAL && g.MARTIAL.activeBottleneckSkills) {
      const bn = g.MARTIAL.activeBottleneckSkills(W || null, n);
      for (let i = 0; i < bn.length; i++) {
        if (MC_IDS.includes(bn[i].skill) || ['WATER_ICE', 'WOOD_LIFE', 'stealth', 'survival'].includes(bn[i].skill)) return bn[i].skill;
      }
    }
    const cSub = n.cult ? n.cult.sub : '', cPath = n.cult ? n.cult.path : '';
    const mcc = n._mcCache;
    if (mcc && mcc.ver === n._ver && mcc.sub === cSub && mcc.path === cPath) return mcc.best;
    const profWpn = (n.cult && g.MARTIAL && g.MARTIAL.PROFILES && g.MARTIAL.PROFILES[cSub] && g.MARTIAL.PROFILES[cSub][3]) ? g.MARTIAL.PROFILES[cSub][3] : [];
    let best = MC_IDS[0], bs = -1;
    for (let i = 0; i < MC_IDS.length; i++) {
      const k = MC_IDS[i];
      const wKey = k === 'FIST_PALM' ? 'FIST' : k;
      const affKey = MC_AFF_MAP[k] || k;
      const s = (E(n, 'affinities.' + affKey) || 0) * 0.9 + ((n.h && n.h.skills && n.h.skills[k]) || 0) * 0.6 + (profWpn.includes(wKey) ? 24 : 0) + (cSub && /SWORD/.test(cSub) && k === 'SWORD' ? 25 : 0) + (cPath === 'BODY' && k === 'BODY_REFINING' ? 30 : 0) + (cPath === 'HEART_SOUL' && k === 'SOUL_DIVINE' ? 25 : 0) + ((cSub === 'VENOM_GU_SOVEREIGN' || cSub === 'SWARM_GU_HIVE_MASTER') && k === 'POISON' ? 28 : 0);
      if (s > bs) { bs = s; best = k; }
    }
    n._mcCache = { ver: n._ver, sub: cSub, path: cPath, best };
    return best;
  }

  A.sleep = {
    nameTh: 'นอนหลับ', icon: '😴', color: '#6a7bd1',
    can: (n, W) => {
      const eqStage = n._nd ? n._nd.eqStage : ((g.CULT && g.CULT.equivalentStage) ? g.CULT.equivalentStage(n) : 0);
      if (eqStage >= 2 && n.h.state.rest >= 85 && !(n.inj && n.inj.length)) return false;
      return true;
    },
    score(n, W, S) {
      const s = n.h.state, h = hourOf(W);
      const eqStage = n._nd ? n._nd.eqStage : ((g.CULT && g.CULT.equivalentStage) ? g.CULT.equivalentStage(n) : 0);

      // ผู้ฝึกตนระดับเทียบเคียงยิ่งสูง ยิ่งควบคุมสมาธิและวิญญาณได้ดี ไม่ง่วงง่าย
      const sleepUrgeMult = 1 / (1 + eqStage * 0.7);
      const drowsinessPower = 1.5 + eqStage * 0.12;
      S.add('ง่วง', Math.pow((100 - s.rest) / 100, drowsinessPower) * 2.6 * sleepUrgeMult);

      if (isNight(h)) {
        // ปุถุชนนอนตามเวลา แต่ผู้ฝึกตนยิ่งระดับสูงยิ่งไม่ผูกติดกับเวลานอนของปุถุชน
        const nightPull = Math.max(0, 1.1 - eqStage * 0.28);
        if (nightPull > 0) {
          S.add('ดึกแล้ว', nightPull + (E(n, 'personality.discipline') - 50) / 200 * (1 - Math.min(1, eqStage / 4)));
        }
      }

      // หากยังมีพลังพักผ่อนเพียงพอ ไม่รู้สึกง่วง (ทั้งกลางวันและกลางคืน)
      const alertThresh = Math.max(25, 55 - eqStage * 3.5);
      if (s.rest > alertThresh) {
        S.add('ยังไม่ง่วง', -1.6 * (1 + eqStage * 0.25));
      }

      if (s.hp < CULT.hpMax(n) * 0.5) S.add('บาดเจ็บ', 0.5);
      if (s.satiety < 35 && ECO.count(W, 'meal') > 0) S.add('หิวเกินกว่าจะนอน', -1.5);
    },
    where(W, n) {
      if (n.bed != null) { const s = W.map.stations[n.bed]; if (s && (!s.occ || s.occ === n.id)) return { st: s }; }
      AI.assignBed(W, n);
      if (n.bed != null) return { st: W.map.stations[n.bed] };
      const s = AI.freeStation(W, n, 'relax', 'spirit_pond'); return s ? { st: s, out: true } : { pos: { x: n.x, y: n.y }, out: true };
    },
    dur: n => {
      const eqStage = (g.CULT && g.CULT.equivalentStage) ? g.CULT.equivalentStage(n) : 0;
      const base = 300 / (1 + eqStage * 0.15);
      return Math.round(base + (100 - n.h.state.rest) * 3.2 / (1 + eqStage * 0.2));
    },
    tick(n, W, ctx) {
      const s = n.h.state; const mult = ctx.out ? 0.6 : 1;
      const eqStage = n._nd ? n._nd.eqStage : ((g.CULT && g.CULT.equivalentStage) ? g.CULT.equivalentStage(n) : 0);
      const recMult = 1 + eqStage * 0.22;
      s.rest = Math.min(100, s.rest + 0.2 * mult * (0.8 + E(n, 'physiology.recoveryRate') / 250) * recMult);
      s.energy = Math.min(100, s.energy + 0.14 * (1 + eqStage * 0.15));
      s.stress = Math.max(0, s.stress - 0.02); s.heartDemon = Math.max(0, s.heartDemon - 0.004);
      const hm = n._nd ? n._nd.hpMax : CULT.hpMax(n); s.hp = Math.min(hm, s.hp + hm * 0.00012 * 1.8 * (0.6 + E(n, 'physiology.recoveryRate') / 100));

      // เมื่อพักผ่อนเต็มแล้ว ผู้ฝึกตนตื่นทันที ไม่ต้องนอนแช่รอจนเช้า
      if (eqStage >= 1 && s.rest >= 96) return 'done';
      if (s.rest >= 99 && !isNight(hourOf(W))) return 'done';
      if (s.rest >= 98 && W.t % 1440 > 330 && W.t % 1440 < 700) return 'done';
    },
    inside: true
  };
  A.eat = {
    nameTh: 'กินอาหาร', icon: '🍚', color: '#e0a35a',
    can: (n, W) => ECO.count(W, 'meal') >= 1,
    score(n, W, S) {
      const s = n.h.state, h = hourOf(W);
      S.add('หิว', Math.pow((100 - s.satiety) / 100, 1.5) * 3.0);
      const meal = (h >= 6.3 && h < 8.7) || (h >= 11.5 && h < 13.8) || (h >= 17.3 && h < 19.7);
      if (meal && s.satiety < 78) S.add('ถึงเวลาอาหาร', 0.9);
      if (s.satiety > 85) S.add('อิ่มอยู่', -2);
      S.add('ชอบอาหาร', (E(n, 'interests.cuisine') - 50) / 400);
    },
    where: (W, n) => { const s = AI.freeStation(W, n, 'eat', 'canteen'); return s ? { st: s } : null; },
    dur: () => 18,
    start(n, W, ctx) { if (!ECO.reserveMeal(W, ctx)) return false; W.sect.meals = (W.sect.meals || 0) + 1; return true; },
    done(n, W, ctx) { ECO.finishMeal(W, n, ctx); },
    tick(n, W) { const s = n.h.state; s.satiety = Math.min(100, s.satiety + 4.6); s.mood = Math.min(100, s.mood + 0.12); s.hp = Math.min(CULT.hpMax(n), s.hp + 0.1); if (s.satiety >= 98) return 'done'; },
    vf: { familyClan: 0.1 }
  };
  A.cultivate = {
    nameTh: 'บำเพ็ญ', icon: '🧘', color: '#38bdf8',
    can: (n, W) => !!n.cult && !(n.inj && n.inj.some(i => i.sev >= 2)),
    score(n, W, S) {
      const c = n.cult, st = n.h.state; if (!c) return;
      interestTerm(n, 'meditation', S, 0.9);
      S.add('ใฝ่ตบะ', (E(n, 'values.martialPeak') - 40) / 160 + (E(n, 'personality.ambition') - 40) / 220);
      S.add('วินัย', (E(n, 'personality.discipline') - 45) / 200);
      valueTerm(n, { martialPeak: 1.2 }, S);
      const eqStage = n._nd ? n._nd.eqStage : ((g.CULT && g.CULT.equivalentStage) ? g.CULT.equivalentStage(n) : 0);
      if (c.stage >= CULT.maxStage(n)) S.add('ถึงขั้นสุดยอดแล้ว', -1);
      else if (c.prog >= CULT.threshold(n)) S.add('รอทะลวง', -0.8);
      const restLowThresh = Math.max(12, 28 - eqStage * 2);
      if (st.rest < restLowThresh) S.add('เหนื่อยล้า', -0.8 / (1 + eqStage * 0.3));
      if (st.energy < 30) S.add('หมดแรง', -0.7);
      S.add('พื้นฐานบำเพ็ญ', 0.35 * clamp(CULT.rate(n, 1) / 1.2, 0.2, 1.4));
      if (isNight(hourOf(W))) S.add('ยามดึกเงียบสงบ', 0.25 + eqStage * 0.15);
    },
    where(W, n) {
      const c = n.cult;
      if (c.path === 'DEMON') {
        const sRuin = AI.freeStation(W, n, 'explore', 'ruin');
        if (sRuin) return { st: sRuin, mult: 1.45 };
        const sMed = AI.freeStation(W, n, 'meditate', 'meditation_hall');
        if (sMed) return { st: sMed, mult: 1.4 + 0.18 * (W.map.byId.meditation_hall.level - 1) };
        const sDum = AI.freeStation(W, n, 'dummy', 'training_ground');
        if (sDum) return { st: sDum, mult: 1.15 };
        if (n.bed != null) return { st: W.map.stations[n.bed], mult: 0.75, room: true };
        return null;
      }
      if (c.path === 'HEART_SOUL') {
        const sMed = AI.freeStation(W, n, 'meditate', 'meditation_hall');
        if (sMed) return { st: sMed, mult: 1.55 + 0.2 * (W.map.byId.meditation_hall.level - 1) };
        const sPond = AI.freeStation(W, n, 'relax', 'spirit_pond');
        if (sPond) return { st: sPond, mult: 1.35 };
        const sTea = AI.freeStation(W, n, 'music', 'tea_garden') || AI.freeStation(W, n, 'pray', 'ancestral');
        if (sTea) return { st: sTea, mult: 1.28 };
        if (n.bed != null) return { st: W.map.stations[n.bed], mult: 0.75, room: true };
        return null;
      }
      if (c.path === 'MECH_PUPPET') {
        const sFrg = AI.freeStation(W, n, 'anvil', 'forge') || AI.freeStation(W, n, 'array', 'forge') || AI.freeStation(W, n, 'dummy', 'training_ground');
        if (sFrg) return { st: sFrg, mult: 1.42 };
        if (n.bed != null) return { st: W.map.stations[n.bed], mult: 0.72, room: true };
        return null;
      }
      if (c.path === 'KARMA_SAMSARA') {
        const sKm = AI.freeStation(W, n, 'meditate', 'meditation_hall') || AI.freeStation(W, n, 'worship', 'shrine') || AI.freeStation(W, n, 'pray', 'ancestral');
        if (sKm) return { st: sKm, mult: 1.48 };
        if (n.bed != null) return { st: W.map.stations[n.bed], mult: 0.75, room: true };
        return null;
      }
      if (c.path === 'BEAST_SOVEREIGN') {
        const sBs = AI.freeStation(W, n, 'relax', 'spirit_pond') || AI.freeStation(W, n, 'farm', 'herb_garden') || AI.freeStation(W, n, 'dummy', 'training_ground');
        if (sBs) return { st: sBs, mult: 1.42 };
        if (n.bed != null) return { st: W.map.stations[n.bed], mult: 0.72, room: true };
        return null;
      }
      if (c.path === 'SAGE_SUPPORT') {
        const sSg = AI.freeStation(W, n, 'music', 'tea_garden') || AI.freeStation(W, n, 'farm', 'herb_garden') || AI.freeStation(W, n, 'meditate', 'meditation_hall');
        if (sSg) return { st: sSg, mult: 1.48 };
        if (n.bed != null) return { st: W.map.stations[n.bed], mult: 0.75, room: true };
        return null;
      }
      if (c.path === 'CRAFT_CREATION') {
        const preferAlc = (n.h.skills.ALCHEMY || 0) >= (n.h.skills.FORGING || 0) || c.sub === 'PILL_FURNACE_IMMORTAL' || c.sub === 'POISON_VENOM_CAULDRON';
        const sCr = (preferAlc ? (AI.freeStation(W, n, 'cauldron', 'alchemy') || AI.freeStation(W, n, 'anvil', 'forge')) : (AI.freeStation(W, n, 'anvil', 'forge') || AI.freeStation(W, n, 'cauldron', 'alchemy'))) || AI.freeStation(W, n, 'array', 'forge') || AI.freeStation(W, n, 'meditate', 'meditation_hall');
        if (sCr) return { st: sCr, mult: 1.52 };
        if (n.bed != null) return { st: W.map.stations[n.bed], mult: 0.75, room: true };
        return null;
      }
      if (c.path === 'ARRAY_TALISMAN') {
        const sAr = AI.freeStation(W, n, 'array', 'forge') || AI.freeStation(W, n, 'meditate', 'meditation_hall') || AI.freeStation(W, n, 'read', 'scripture');
        if (sAr) return { st: sAr, mult: 1.50 };
        if (n.bed != null) return { st: W.map.stations[n.bed], mult: 0.75, room: true };
        return null;
      }
      if (c.path === 'STRATEGY_GOVERNANCE') {
        const sSt = AI.freeStation(W, n, 'read', 'scripture') || AI.freeStation(W, n, 'work', 'main_hall') || AI.freeStation(W, n, 'meditate', 'meditation_hall');
        if (sSt) return { st: sSt, mult: 1.50 };
        if (n.bed != null) return { st: W.map.stations[n.bed], mult: 0.75, room: true };
        return null;
      }
      const kind = c.path === 'XIAN' ? 'meditate' : c.path === 'BODY' ? 'lift' : 'worship';
      const bk = c.path === 'XIAN' ? 'meditation_hall' : c.path === 'BODY' ? 'training_ground' : 'shrine';
      const s = AI.freeStation(W, n, kind, bk);
      if (s) return { st: s, mult: kind === 'meditate' ? 1.55 + 0.2 * (W.map.byId.meditation_hall.level - 1) : kind === 'lift' ? 1.1 + 0.1 * (W.map.byId.training_ground.level - 1) : 1.25 };
      if (c.path === 'XIAN' && n.bed != null) return { st: W.map.stations[n.bed], mult: 0.6, room: true };
      if (c.path === 'BODY') { const d = AI.freeStation(W, n, 'dummy', 'training_ground'); if (d) return { st: d, mult: 0.8 }; }
      return null;
    },
    dur: n => Math.round(100 + E(n, 'personality.discipline') * 1.4 + E(n, 'intellect.focus') * 0.6),
    start(n, W, ctx) {
      // ใช้โอสถที่มี (ถ้าเหมาะ)
      const c = n.cult;
      const maxTox = c.path === 'DEMON' ? 52 : 35;
      if (n.inv.pills) for (const k of Object.keys(n.inv.pills)) {
        const info = ECO.pillInfo(k); if (!info || n.inv.pills[k] <= 0 || (info.effect.compatiblePath && info.effect.compatiblePath !== c.path)) continue;
        if (info.effect.cultivationProgress && c.pillT <= 0 && CULT.equivalentStage(n) <= info.tier + 1 && c.toxic < maxTox) { n.inv.pills[k]--; if (n.inv.pills[k] <= 0) delete n.inv.pills[k]; const r = ECO.applyPill(W, n, k); if (r) AI.mem(W, n, 'ใช้ ' + info.name, 0.3); break; }
      }
      return true;
    },
    tick(n, W, ctx) {
      const c = n.cult, s = n.h.state;
      const r = CULT.rate(n, ctx.mult || 1) / 60;
      CULT.gain(n, r); if (c.pillT > 0) c.pillT--;
      const eqStage = n._nd ? n._nd.eqStage : ((g.CULT && g.CULT.equivalentStage) ? g.CULT.equivalentStage(n) : (c.stage || 1));
      const eDrain = Math.max(0, (c.path === 'BODY' ? 0.13 : c.path === 'DEMON' ? 0.045 : c.path === 'HEART_SOUL' ? 0.02 : 0.015) - eqStage * 0.01);
      const rDrain = Math.max(0, (c.path === 'HEART_SOUL' ? 0.032 : c.path === 'DEMON' ? 0.025 : 0.02) - eqStage * 0.015);
      s.energy = Math.max(0, s.energy - eDrain);
      if (rDrain > 0) s.rest = Math.max(0, s.rest - rDrain);
      if (c.path === 'BODY') {
        if (W.t % 20 === 0) { HC.trainBody(n, 'strength', 1.2); HC.trainBody(n, 'toughness', 1.2); HC.trainBody(n, 'endurance', 1.0); }
      } else if (c.path === 'DEMON') {
        if (W.t % 25 === 0) {
          const dSkill = c.sub === 'VENOM_GU_SOVEREIGN' ? 'POISON' : c.sub === 'SHADOW_ASSASSIN' ? 'stealth' : 'SOUL_DIVINE';
          (g.MARTIAL && g.MARTIAL.skillPractice ? g.MARTIAL.skillPractice : HC.practice)(n, dSkill, 0.08, 1.1);
          HC.trainMind(n, 'willpower', 0.6);
          HC.trainBody(n, 'explosiveness', 0.6);
        }
        if (W.t % 60 === 0) {
          s.heartDemon = clamp((s.heartDemon || 0) + 0.35, 0, 100);
          if (s.heartDemon >= 78 && W.rng.chance(0.06)) {
            s.hp = Math.max(1, s.hp - CULT.hpMax(n) * 0.08);
            s.stress = Math.min(100, (s.stress || 0) + 8);
            AI.mem(W, n, 'ปราณมารตีกลับขณะเร่งบำเพ็ญ', 0.6);
          }
        }
      } else if (c.path === 'HEART_SOUL') {
        s.heartDemon = Math.max(0, (s.heartDemon || 0) - 0.035);
        s.stress = Math.max(0, (s.stress || 0) - 0.012);
        if (W.t % 25 === 0) {
          const hsSkill = c.sub === 'CALLIGRAPHY_PAINTING_SAGE' ? 'arts' : 'SOUL_DIVINE';
          (g.MARTIAL && g.MARTIAL.skillPractice ? g.MARTIAL.skillPractice : HC.practice)(n, hsSkill, 0.08, 1.15);
          HC.trainMind(n, 'focus', 1.2);
          HC.trainMind(n, 'comprehension', 1.0);
          HC.gainWisdom(n, 0.006);
        }
      } else if (c.path === 'MECH_PUPPET') {
        if (n.mechState) {
          const mwLv = (W.sect && W.sect.specialistFacilities && W.sect.specialistFacilities.mech_workshop) ? W.sect.specialistFacilities.mech_workshop.level : 1;
          n.mechState.heat = Math.max(0, (n.mechState.heat || 0) - (0.5 + mwLv * 0.2));
          n.mechState.charge = Math.min(100, (n.mechState.charge || 0) + (0.4 + mwLv * 0.15));
          if (n.mechState.integrity < 100) {
            n.mechState.integrity = Math.min(100, (n.mechState.integrity || 100) + (0.25 + mwLv * 0.15));
            n.mechState.constructReadiness = Math.round(n.mechState.integrity);
          }
          n.mechState.overclockReady = n.mechState.charge >= 50;
        }
        if (W.t % 25 === 0) {
          (g.MARTIAL && g.MARTIAL.skillPractice ? g.MARTIAL.skillPractice : HC.practice)(n, 'FORGING', 0.06, 1.1);
          HC.trainBody(n, 'dexterity', 0.8);
        }
      } else if (c.path === 'KARMA_SAMSARA') {
        s.heartDemon = Math.max(0, (s.heartDemon || 0) - 0.03);
        if (W.t % 25 === 0) {
          (g.MARTIAL && g.MARTIAL.skillPractice ? g.MARTIAL.skillPractice : HC.practice)(n, 'SCRIPTURE', 0.07, 1.1);
          HC.gainWisdom(n, 0.006);
        }
      } else if (c.path === 'BEAST_SOVEREIGN') {
        if (W.t % 25 === 0) {
          (g.MARTIAL && g.MARTIAL.skillPractice ? g.MARTIAL.skillPractice : HC.practice)(n, 'BEAST_TAMING', 0.08, 1.15);
          if (Array.isArray(n.pets)) n.pets.forEach(pt => { if (pt) { pt.fatigue = Math.max(0, (pt.fatigue || 0) - 1.5); pt.bond = Math.min(100, (pt.bond || 60) + 0.2); pt.loyalty = Math.round(pt.bond); if (pt.hpMax) pt.hp = pt.hpMax; } });
        }
      } else if (c.path === 'SAGE_SUPPORT') {
        s.heartDemon = Math.max(0, (s.heartDemon || 0) - 0.04);
        s.stress = Math.max(0, (s.stress || 0) - 0.02);
        if (W.t % 25 === 0) {
          (g.MARTIAL && g.MARTIAL.skillPractice ? g.MARTIAL.skillPractice : HC.practice)(n, 'MEDICINE', 0.08, 1.15);
          HC.gainWisdom(n, 0.005);
        }
      } else if (c.path === 'CRAFT_CREATION') {
        s.heartDemon = Math.max(0, (s.heartDemon || 0) - 0.035);
        if (W.t % 25 === 0) {
          const crSk = (c.sub === 'PILL_FURNACE_IMMORTAL' || c.sub === 'POISON_VENOM_CAULDRON' || (n.h.skills.ALCHEMY || 0) > (n.h.skills.FORGING || 0)) ? 'ALCHEMY' : (c.sub === 'RUNE_ARRAY_ENGRAVER' ? 'ARRAY' : 'FORGING');
          (g.MARTIAL && g.MARTIAL.skillPractice ? g.MARTIAL.skillPractice : HC.practice)(n, crSk, 0.08, 1.18);
          HC.trainBody(n, 'dexterity', 0.8);
          HC.gainWisdom(n, 0.005);
        }
      } else if (c.path === 'ARRAY_TALISMAN') {
        s.heartDemon = Math.max(0, (s.heartDemon || 0) - 0.035);
        if (W.t % 25 === 0) {
          const arSk = (n.h.skills.TALISMAN || 0) > (n.h.skills.ARRAY || 0) ? 'TALISMAN' : 'ARRAY';
          (g.MARTIAL && g.MARTIAL.skillPractice ? g.MARTIAL.skillPractice : HC.practice)(n, arSk, 0.08, 1.18);
          HC.trainMind(n, 'comprehension', 0.9);
          HC.gainWisdom(n, 0.005);
        }
      } else if (c.path === 'STRATEGY_GOVERNANCE') {
        s.heartDemon = Math.max(0, (s.heartDemon || 0) - 0.04);
        if (W.t % 25 === 0) {
          (g.MARTIAL && g.MARTIAL.skillPractice ? g.MARTIAL.skillPractice : HC.practice)(n, 'SCRIPTURE', 0.06, 1.15);
          (g.MARTIAL && g.MARTIAL.skillPractice ? g.MARTIAL.skillPractice : HC.practice)(n, 'administration', 0.06, 1.15);
          HC.trainMind(n, 'planning', 0.9);
          HC.gainWisdom(n, 0.006);
        }
      } else if (W.t % 30 === 0) {
        HC.trainMind(n, 'focus', 1); HC.gainWisdom(n, 0.004);
      }
      s.stress = Math.max(0, s.stress - 0.012);
      if (W.t % 15 === 0) { s.mp = (s.mp || 0); }
      // อาจเกิดจิตมาร/ตื่นรู้เล็กน้อย
      if (W.t % 60 === 0) { if (W.rng.chance(0.0016 * (1 + s.heartDemon / 30))) { AI.insight(W, n); } }
      if (s.energy < 12 || s.rest < 12) return 'done';
      { const qm = (n._nd && n._nd.qiMax) ? n._nd.qiMax : CULT.qiMax(n); s.qi = Math.min(qm, (s.qi || 0) + 0.4); }
      AI.vf(n, { martialPeak: 0.045 });
    },
    done(n, W) {
      n.merit += 0.4;
      if (n.cult && SECT && SECT.PEAKS) {
        const pkMult = n.peakId ? 1.14 : (n.isIndependentFromPeak ? (n.independentPenaltyMult || 0.88) : 1.0);
        if (pkMult !== 1.0) CULT.gain(n, (pkMult - 1.0) * 0.45, W, 'peak_aura');
      }
      if (SECT && SECT.FENG_SHUI && SECT.FENG_SHUI.buildingMultiplierForNpc && n.cult) {
        const fsMult = SECT.FENG_SHUI.buildingMultiplierForNpc(W, n);
        if (fsMult > 1.02) CULT.gain(n, Math.round((fsMult - 1) * 22 * 100) / 100, W, "feng_shui_leyline");
      }
      if (g.ELEM && n.cult) {
        const m = (n.cult.mantra && CULT.tech(n.cult.mantra)) || CULT.subInfo(n.cult.path, n.cult.sub) || CULT.PATHS[n.cult.path];
        if (m) g.ELEM.gainMastery(n, m, 'cultivate_session', W, { sourceId: m.id || n.cult.path });
      }
      if (n.cult && n.cult.track && CULT.trackReady && CULT.trackReady(n) && CULT.checkTrackGates && CULT.checkTrackGates(W, n).ok && CULT.trackBreakthrough) {
        CULT.trackBreakthrough(W, n);
      }
    }
  };
  AI.insight = (W, n) => {
    const kind = W.rng.next();
    if (kind < 0.8) { CULT.gain(n, 6 + W.rng.int(0, 8)); HC.experience(n, 'insight', 0.6); AI.mem(W, n, 'เกิดความกระจ่างขณะบำเพ็ญ', 0.8); W.log('insight', n.h.name.given + ' เกิดความกระจ่างขณะบำเพ็ญ ปราณก้าวหน้า', [n.id]); }
    else { n.h.state.heartDemon = clamp(n.h.state.heartDemon + 8, 0, 100); HC.feel(n, { stress: 10, mood: -8 }); AI.mem(W, n, 'จิตมารรบกวนขณะบำเพ็ญ', 0.8); }
  };
  A.breakthrough = {
    nameTh: 'ปิดด่านทะลวงขั้น', icon: '⚡', color: '#f6d44a',
    can: (n, W) => CULT.ready(n) && n.h.state.hp > CULT.hpMax(n) * 0.65 && n.h.state.rest > 30 && n.h.state.satiety > 25 && !(n.inj && n.inj.length) && (n.cult.attempts === 0 || W.day - (n.cult.lastTry || -99) > 8),
    score(n, W, S) {
      const p = CULT.breakthroughChance(n, { env: 0.05, pill: n.cult.btBonus || 0 });
      S.add('ตบะเต็มพร้อมทะลวง', 1.8);
      S.add('โอกาสสำเร็จ ' + Math.round(p * 100) + '%', (p - 0.45) * 2.2 * (0.6 + (E(n, 'personality.courage') - 30) / 120) - (E(n, 'personality.caution') - 50) / 90 * (1 - p));
      S.add('ทะเยอทะยาน', (E(n, 'personality.ambition') - 50) / 120);
    },
    where(W, n) { const c = n.cult; const isMed = ['XIAN', 'HEART_SOUL', 'KARMA_SAMSARA', 'SAGE_SUPPORT'].includes(c.path); const isCraft = c.path === 'CRAFT_CREATION'; const preferAlc = isCraft && ((n.h.skills.ALCHEMY || 0) >= (n.h.skills.FORGING || 0) || c.sub === 'PILL_FURNACE_IMMORTAL' || c.sub === 'POISON_VENOM_CAULDRON'); const kind = isMed ? 'meditate' : (c.path === 'BODY' || c.path === 'BEAST_SOVEREIGN') ? 'lift' : (c.path === 'MECH_PUPPET' || (isCraft && !preferAlc)) ? 'anvil' : (isCraft && preferAlc) ? 'cauldron' : c.path === 'DEMON' ? 'explore' : 'worship'; const bk = isMed ? 'meditation_hall' : (c.path === 'BODY' || c.path === 'BEAST_SOVEREIGN') ? 'training_ground' : (c.path === 'MECH_PUPPET' || (isCraft && !preferAlc)) ? 'forge' : (isCraft && preferAlc) ? 'alchemy' : c.path === 'DEMON' ? 'ruin' : 'shrine'; let s = AI.freeStation(W, n, kind, bk); if (!s) s = AI.freeStation(W, n, 'meditate', 'meditation_hall') || AI.freeStation(W, n, 'relax', 'spirit_pond'); return s ? { st: s } : (n.bed != null ? { st: W.map.stations[n.bed], room: true } : null); },
    dur: n => 180 + n.cult.stage * 40,
    start(n, W, ctx) {
      // ขอโอสถทะลวงจากคลังตามสิทธิ (ขึ้นกับเจ้าสำนัก/ความสัมพันธ์)
      const c = n.cult; c.btBonus = c.btBonus || 0;
      if (c.btBonus < 0.1) {
        for (const k of Object.keys(W.sect.stock)) {
          const info = ECO.isPill(k) ? ECO.pillInfo(k) : null;
          if (info && info.effect.breakthroughBonus && !info.effect.btFor && info.tier <= CULT.equivalentStage(n) + 1 && W.sect.stock[k] > 0 && (n.rank >= 2)) { ECO.usePill(W, n, k); AI.mem(W, n, 'ได้รับ' + info.name + 'จากคลังสำนักก่อนทะลวงขั้น', 0.6); break; }
        }
      }
      n.cult.lastTry = W.day; n.sealedBt = true; return true;
    },
    tick(n, W) { n.h.state.energy = Math.max(10, n.h.state.energy - 0.01); n.h.state.stress += 0.01; },
    done(n, W, ctx) {
      const c = n.cult; const env = ctx.room ? 0 : 0.05; const pill = c.btBonus || 0; c.btBonus = 0;
      const mId = n.mentorId || n.mentor; const guide = (mId && W.byId[mId] && !W.byId[mId].dead ? 0.05 : 0) + (n.mentorImprint ? 0.04 : 0);
      const res = CULT.breakthrough(W, n, { env, pill, guide });
      n.sealedBt = false;
      if (res.ok) { W.log('breakthrough', n.h.name.given + ' ทะลวงสู่ ' + CULT.stageName(n) + ' สำเร็จ!', [n.id]); AI.mem(W, n, 'ทะลวงสู่ ' + CULT.stageName(n), 1); n.merit += 40; W.fame(1 + c.stage); }
      else { W.log('breakthrough', n.h.name.given + ' ทะลวงขั้นล้มเหลว (โอกาส ' + Math.round(res.p * 100) + '%) บาดเจ็บ' + (res.died ? ' ถึงแก่ชีวิต' : ''), [n.id]); AI.mem(W, n, 'ทะลวงขั้นล้มเหลว', 1); if (res.died) AI.kill(W, n, 'ตบะแตกระหว่างทะลวงขั้น'); else AI.injure(W, n, res.sev || 1, 'ตบะย้อนกลับ'); }
    },
    inside: false, important: true
  };
  A.practice = {
    nameTh: 'ฝึกวิชายุทธ์', icon: '⚔️', color: '#ef6b57',
    can: (n, W) => !(n.inj && n.inj.some(i => i.sev >= 2)) && n.h.state.energy > 25,
    score(n, W, S) {
      interestTerm(n, 'combat', S, 1.1);
      S.add('สัญชาตญาณนักสู้', (E(n, 'aptitudes.combat') - 50) / 200);
      valueTerm(n, { martialPeak: 1, honorLegacy: .15 }, S);
      if (n.rank <= 1) S.add('ศิษย์ใหม่ต้องฝึก', 0.35 * dutyWeight(n));
      const cl = SECT.holder(W, 'martial'); if (cl && hourOf(W) > 8 && hourOf(W) < 12) S.add('หลักสูตรหอยุทธ์ช่วงเช้า', 0.35);
      if (n.h.state.energy < 45) S.add('เหนื่อย', -0.5);
      S.add('ความกล้า', (E(n, 'personality.courage') - 50) / 300);
      if (g.MARTIAL && g.MARTIAL.activeBottleneckSkills) {
        const bnSk = g.MARTIAL.activeBottleneckSkills(W, n);
        if (bnSk.length) {
          const ms = bnSk[0];
          if ((!W || !W.map || AI.freeStation(W, n, 'dummy', 'training_ground')) && ((g.MARTIAL.SKILL_GROUPS && g.MARTIAL.SKILL_GROUPS.weapon.includes(ms.skill)) || ['MOVEMENT', 'BODY_REFINING', 'SOUL_DIVINE', 'POISON', 'WATER_ICE', 'WOOD_LIFE', 'stealth', 'survival'].includes(ms.skill))) {
            const drive = g.MARTIAL.bottleneckSkillDrive ? g.MARTIAL.bottleneckSkillDrive(n) : 1;
            const gObj = n.cognition && n.cognition.goal;
            const isComp = !!(gObj && ((gObj.id === 'crisis' && W && W.sect && (W.sect.shortageDirectives || []).some(d => d.id === gObj.targetId && d.deficit > 0)) || (gObj.id === 'help_friend' && W && W.byId && W.byId[gObj.targetId] && W.byId[gObj.targetId].h.state.hp < CULT.hpMax(W.byId[gObj.targetId]) * 0.72) || (gObj.id === 'recovery' && (n.h.state.hp < CULT.hpMax(n) * 0.75 || n.h.state.satiety < 25 || n.h.state.rest < 20))));
            const compMult = isComp ? 0.25 : 1;
            const nf = clamp(Math.min(n.h.state.satiety / 35, n.h.state.rest / 25, n.h.state.energy / 30), 0.2, 1) * compMult;
            S.add('ฝึก ' + ms.nameTh + ' แก้คอขวดสายเฉพาะทาง (' + ms.skill + ' ' + Math.floor(ms.current) + '/' + ms.required + ')', (CULT.trackReady(n) ? 1.15 : 0.78) * drive * nf);
          }
        }
      }
    },
    where: (W, n) => { const s = AI.freeStation(W, n, 'dummy', 'training_ground'); return s ? { st: s, skill: martialChoice(n, W) } : null; },
    dur: n => 90 + Math.round(E(n, 'personality.discipline') * 0.6),
    tick(n, W, ctx) {
      const s = n.h.state; const head = SECT.holder(W, 'martial'); const q = 1 + (head && !head.dead ? 0.25 + E(head, 'social.teaching') / 300 : 0) + 0.1 * (W.map.byId.training_ground.level - 1);
      (g.MARTIAL && g.MARTIAL.skillPractice ? g.MARTIAL.skillPractice : HC.practice)(n, ctx.skill, 1 / 60, q);
      if (W.t % 25 === 0) { HC.trainBody(n, 'strength', 1); HC.trainBody(n, 'reflex', 1); HC.trainBody(n, 'agility', 1); HC.trainBody(n, 'explosiveness', 0.8); }
      if (W.t % 45 === 0 && n.cult && Array.isArray(n.cult.techs) && n.cult.techs.length && g.SK && g.SK.gainMastery) {
        const activeIds = (g.MARTIAL && g.MARTIAL.activeTechs) ? g.MARTIAL.activeTechs(n) : n.cult.techs;
        const multiTech = activeIds.map(id => CULT.tech(id)).find(t => t && !t.passive && t.cat !== 'PASSIVE' && ((Array.isArray(t.moveDefs) && t.moveDefs.length > 1) || (Array.isArray(t.stages) && t.stages.length > 1)));
        if (multiTech) g.SK.gainMastery(W, n, multiTech.id, 0.5);
      }
      const restMult = (n._nd && n._nd.restDrainMult != null) ? n._nd.restDrainMult : 1;
      s.energy = Math.max(0, s.energy - 0.1); s.rest = Math.max(0, s.rest - 0.02 * restMult); s.stress = Math.max(0, s.stress - 0.01);
      AI.vf(n, { martialPeak: 0.05 });
      if (s.energy < 14) return 'done';
    },
    done(n, W) {
      n.merit += 0.5;
      if (n.cult && n.cult.track && CULT.trackReady && CULT.trackReady(n) && CULT.checkTrackGates && CULT.checkTrackGates(W, n).ok && CULT.trackBreakthrough) {
        CULT.trackBreakthrough(W, n);
      }
      if (g.ELEM && n.cult && Array.isArray(n.cult.techs) && n.cult.techs.length) {
        const activeIds = (g.MARTIAL && g.MARTIAL.activeTechs) ? g.MARTIAL.activeTechs(n) : n.cult.techs;
        const t = activeIds.map(id => CULT.tech(id)).find(x => x && x.element && x.element !== 'NEUTRAL') || (n.cult.mantra && CULT.tech(n.cult.mantra));
        if (t) g.ELEM.gainMastery(n, t, 'practice', W, { sourceId: t.id });
      }
    }
  };
  A.study = {
    nameTh: 'ศึกษาคัมภีร์', icon: '📖', color: '#a78bfa',
    can: (n, W) => true,
    score(n, W, S) {
      interestTerm(n, 'scholarship', S, 1.1);
      S.add('ใฝ่รู้', (E(n, 'personality.curiosity') - 50) / 150);
      valueTerm(n, { knowledgeCraft: 1.1 }, S);
      if (n.cult && SECT.holder(W, 'scripture')) {
        const nt = AI.nextTechToStudy(W, n);
        if (nt) {
          const isSub = nt.sub === n.cult.sub || (Array.isArray(nt.compatibleSubs) && nt.compatibleSubs.includes(n.cult.sub));
          S.add(isSub ? 'มีวิชาตรงสายย่อยให้ศึกษา' : 'มีวิชาให้ศึกษา', 0.35);
        }
      }
      if (n.cult && n.cult.learning) S.add('กำลังศึกษาวิชาค้างอยู่', 0.4);
      if (n.rank <= 0) S.add('ศิษย์ใหม่ถูกจำกัดการเข้าหอคัมภีร์', -0.5);
    },
    where: (W, n) => { const s = AI.freeStation(W, n, 'read', 'scripture'); return s ? { st: s } : null; },
    dur: n => 100 + Math.round(E(n, 'intellect.focus') * 0.5),
    start(n, W, ctx) { if (n.cult && !n.cult.learning) { const t = AI.nextTechToStudy(W, n); if (t) n.cult.learning = { id: t.id, need: CULT.studyCost(t, n), got: 0 }; } return true; },
    tick(n, W) {
      const s = n.h.state; (g.MARTIAL && g.MARTIAL.skillPractice ? g.MARTIAL.skillPractice : HC.practice)(n, 'SCRIPTURE', 1 / 60, 1); if (W.t % 5 === 0) { if (E(n, 'affinities.ARRAY') >= 55) (g.MARTIAL && g.MARTIAL.skillPractice ? g.MARTIAL.skillPractice : HC.practice)(n, 'ARRAY', 5 / 90, 1); if (E(n, 'affinities.TALISMAN') >= 55) (g.MARTIAL && g.MARTIAL.skillPractice ? g.MARTIAL.skillPractice : HC.practice)(n, 'TALISMAN', 5 / 90, 1); }
      if (W.t % 40 === 0) { HC.trainMind(n, 'comprehension', 1); HC.trainMind(n, 'memory', 0.8); HC.gainWisdom(n, 0.003); }
      const c = n.cult;
      if (c && c.learning) {
        const learnT = CULT.tech(c.learning.id);
        if (c.learning._elemMult == null) {
          c.learning._elemMult = (learnT && g.ELEM) ? g.ELEM.resolveCompatibility(n, learnT, 'learning').studySpeedMult : 1;
        }
        const elemLearnMult = c.learning._elemMult;
        const ancMult = (CULT.isAncestralBlessingActive ? CULT.isAncestralBlessingActive(n, W ? W.t : null) : (n.ancestralBlessing && (!n.ancestralBlessing.until || n.ancestralBlessing.until >= W.t))) && n.ancestralBlessing.studySpeedMult ? n.ancestralBlessing.studySpeedMult : 1;
        const sutraEdMult = (learnT && learnT.editionTier && learnT.editionTier > 1) ? (1 + Math.min(0.35, (learnT.editionTier - 1) * 0.10)) : 1;
        c.learning.got += (0.7 + E(n, 'intellect.learningSpeed') / 100 + E(n, 'intellect.comprehension') / 250) * elemLearnMult * ancMult * sutraEdMult * (n.insightT > 0 ? 1.45 : 1) * (g.MARTIAL ? g.MARTIAL.lifeMult(n, 'SCRIPTURE') * g.MARTIAL.skillEffects(n).study : 1);
        if (c.learning.got >= c.learning.need) { const oldHp = n.h && n.h.state ? n.h.state.hp : null, oldQi = n.h && n.h.state ? n.h.state.qi : null; const t = CULT.tech(c.learning.id); if (!c.techs.includes(c.learning.id)) c.techs.push(c.learning.id); c.learning = null; if (CULT.pruneExcessActiveTechs) CULT.pruneExcessActiveTechs(n); if (g.ELEM && g.ELEM.syncSpecialAccess) g.ELEM.syncSpecialAccess(n); if (g.MARTIAL && g.MARTIAL.reconcilePassives) g.MARTIAL.reconcilePassives(n); if (g.MARTIAL && g.MARTIAL.syncResourceCaps) g.MARTIAL.syncResourceCaps(n, oldHp, oldQi); const tName = t ? t.nameTh : ''; W.log('learn', n.h.name.given + ' เรียนรู้วิชา「' + tName + '」สำเร็จ', [n.id]); AI.mem(W, n, 'เรียนรู้ ' + tName, 0.6); HC.experience(n, 'craft_success', 0.6); return 'done'; }
      }
      const restMult = (n._nd && n._nd.restDrainMult != null) ? n._nd.restDrainMult : 1;
      s.energy = Math.max(0, s.energy - 0.025); s.rest = Math.max(0, s.rest - 0.03 * restMult); AI.vf(n, { knowledgeCraft: 0.05 });
      if (n.insightT > 0) n.insightT--;
    },
    done(n, W) {
      n.merit += 0.3;
      if (g.ELEM && n.cult) {
        const t = (n.cult.learning && CULT.tech(n.cult.learning.id)) || (n.cult.techs.length && CULT.tech(n.cult.techs[n.cult.techs.length - 1]));
        if (t) g.ELEM.gainMastery(n, t, 'study', W, { sourceId: t.id });
      }
    }
  };
  AI.nextTechToStudy = (W, n) => {
    const c = n.cult; if (!c) return null;
    const cap = Math.min(CULT.effectiveTechStage ? CULT.effectiveTechStage(n) : c.stage, SECT.canLearnTier(W, n));
    const lib = (W && W.sect && W.sect.library) || [];
    const sig = lib.length + ':' + (lib[lib.length - 1] || '') + ':' + cap + ':' + c.sub + ':' + c.techs.length + ':' + (n.equip && n.equip.WEAPON ? n.equip.WEAPON.id : '');
    if (n._nextTechSig === sig) return n._nextTechVal;
    const activeKnown = c.techs.map(id => CULT.tech(id)).filter(x => x && !x.passive && x.cat !== 'PASSIVE' && !x.innateOnly);
    const maxAct = CULT.maxTechs(n);
    let minReplaceScore = -1e9;
    if (activeKnown.length >= maxAct && CULT.techRetentionScore) {
      const repl = activeKnown.filter(x => !x.legendary && !x.isSectHeritage);
      if (!repl.length) minReplaceScore = 1e9;
      else minReplaceScore = Math.min(...repl.map(x => CULT.techRetentionScore(n, x)));
    }
    const ids = CULT.learnable(n, lib).map(id => CULT.tech(id)).filter(t => {
      if (!t || (t.reqTier || t.tier) > cap) return false;
      if (t.passive || t.cat === 'PASSIVE' || t.legendary || t.isSectHeritage) return true;
      if (activeKnown.length >= maxAct && CULT.techRetentionScore) {
        return CULT.techRetentionScore(n, t) > minReplaceScore + 15;
      }
      return true;
    });
    if (!ids.length) { n._nextTechSig = sig; n._nextTechVal = null; return null; }
    let best = ids[0], bestP = g.COG && g.COG.techPreference ? g.COG.techPreference(n, best) : (best.power * (best.sub === c.sub ? 1.4 : 1));
    for (let i = 1; i < ids.length; i++) {
      const cand = ids[i];
      const p = g.COG && g.COG.techPreference ? g.COG.techPreference(n, cand) : (cand.power * (cand.sub === c.sub ? 1.4 : 1));
      if (p > bestP) { bestP = p; best = cand; }
    }
    n._nextTechSig = sig;
    n._nextTechVal = best;
    return best;
  };

  function craftAct(hall, stKind, crafts, interestId, title, icon) {
    const canOrder = (n, W) => {
      const o = W.sect.orders && W.sect.orders[hall];
      if (!o) return false;
      const r = ECO.recipeById[o.rid];
      if (!r || !ECO.craftEligible(W, n, r, hall) || !ECO.inputsOk(W, r)) return false;
      return (n.h.skills[r.craft] || 0) + 20 >= r.minMastery;
    };
    return {
      nameTh: title, icon, color: '#7fb069',
      can: (n, W) => canOrder(n, W) || (hall === 'forge' && W.sect && W.sect._hasCatalysts && n.h.state.energy > 28 && !(n.inj && n.inj.some(i => i.sev >= 2)) && !!(ECO.findCatalystRefinementCandidate && ECO.findCatalystRefinementCandidate(W, n))),
      score(n, W, S) {
        const o = W.sect.orders && W.sect.orders[hall];
        const r0 = o && canOrder(n, W) ? ECO.recipeById[o.rid] : null;
        const r = (r0 && (n.h.skills[r0.craft] || 0) + 20 >= r0.minMastery) ? r0 : null;
        const rc = (hall === 'forge' && ECO.findCatalystRefinementCandidate) ? ECO.findCatalystRefinementCandidate(W, n) : null;
        if (rc && (!r || rc.source === 'equipped')) {
          S.add('ขัดเกลาศาสตรา「' + rc.gear.nameTh + '」ด้วย' + rc.cat.nameTh, 0.92 + (E(n, 'values.martialPeak') - 45) / 180 + (E(n, 'interests.forging') - 45) / 200);
        } else if (r) {
          interestTerm(n, interestId, S, 1.1);
          S.add('ฝีมือ', (n.h.skills[r.craft] || 0) / 220);
          valueTerm(n, { knowledgeCraft: .9, sectDuty: .4 }, S);
          if (SECT.holder(W, hall === 'alchemy' ? 'alchemy' : 'forge') === n) S.add('หน้าที่หัวหน้าหอ', 0.9 * dutyWeight(n));
          else if (n.assist === (hall === 'alchemy' ? 'alchemy' : 'forge')) S.add('หน้าที่ผู้ช่วยหอ', 0.7 * dutyWeight(n));
          S.add('คำสั่งผลิต: ' + (o.why || 'ตามแผนหอ'), 0.25);
          S.add('พรสวรรค์ผลิต', (E(n, 'aptitudes.crafting') - 50) / 220);
          if (n.cult && n.cult.path === 'CRAFT_CREATION') S.add('วิถีรังสรรค์บำเพ็ญผ่านการผลิต', 0.72);
          const profession = ECO.profession(n), item = r.outItemId && ECO.itemById[r.outItemId];
          if (profession && profession.role === 'ARMOR' && (r.proceduralSlot === 'ARMOR' || r.slot === 'ARMOR' || item && item.slot === 'ARMOR')) S.add('ฝึกช่างเกราะตามสายเฉพาะทาง', 0.5);
        }
      },
      where: (W, n) => {
        const o = W.sect.orders && W.sect.orders[hall];
        const r0 = o && canOrder(n, W) ? ECO.recipeById[o.rid] : null;
        const r = (r0 && (n.h.skills[r0.craft] || 0) + 20 >= r0.minMastery) ? r0 : null;
        const rc = (hall === 'forge' && ECO.findCatalystRefinementCandidate) ? ECO.findCatalystRefinementCandidate(W, n) : null;
        if (rc && (!r || rc.source === 'equipped')) {
          const s = AI.freeStation(W, n, stKind, hall);
          if (s) return { st: s, catalystRefine: true, gearUid: rc.gearUid, catalystId: rc.catalystId };
        }
        if (r) {
          const kind = (hall === 'forge' && (r.craft === 'ARRAY' || r.craft === 'TALISMAN')) ? 'array' : stKind;
          const s = AI.freeStation(W, n, kind, hall);
          return s ? { st: s, rid: o.rid } : null;
        }
        return null;
      },
      dur: (n, W, ctx) => {
        if (ctx && ctx.catalystRefine) return 45;
        const r = ECO.recipeById[ctx.rid];
        return r ? Math.round(ECO.craftHours(r, n.h.skills[r.craft] || 0) * 60 * (1 - 0.06 * ((W.map.byId[hall].level) - 1))) : 45;
      },
      start(n, W, ctx) {
        if (ctx && ctx.catalystRefine) return !!(ECO.findCatalystRefinementCandidate && ECO.findCatalystRefinementCandidate(W, n));
        const r = ECO.recipeById[ctx.rid];
        return !!r && ECO.craftEligible(W, n, r, hall) && (n.h.skills[r.craft] || 0) + 20 >= r.minMastery && ECO.reserveInputs(W, r, ctx, n);
      },
      tick(n, W, ctx) { n.h.state.energy = Math.max(0, n.h.state.energy - 0.04); n.h.state.rest -= 0.02; AI.vf(n, { knowledgeCraft: 0.05, sectDuty: 0.02 }); if (W.t % 45 === 0) HC.trainBody(n, 'dexterity', 0.8); if (n.cult && (n.cult.path === 'CRAFT_CREATION' || (Array.isArray(n.cult.techs) && n.cult.techs.includes('PASS_CROSS_CRAFT_004')))) { const cMult = n.cult.path === 'CRAFT_CREATION' ? 1.35 : 0.65; CULT.gain(n, CULT.rate(n, cMult) / 60, W, 'craft_tick'); } },
      done(n, W, ctx) {
        if (ctx && ctx.catalystRefine) {
          const refRes = ECO.refineGearWithCatalyst ? ECO.refineGearWithCatalyst(W, ctx.gearUid, ctx.catalystId, n) : null;
          if (refRes && refRes.ok) {
            n.merit = (n.merit || 0) + 2.5;
            AI.mem(W, n, 'ขัดเกลาศาสตรา ' + refRes.gear.nameTh + ' ด้วยผลึกโบราณ', 0.5);
          }
          return;
        }
        const r = ECO.recipeById[ctx.rid]; const res = ECO.finishCraft(W, n, r, ctx); if (res.rejected) return;
        if (res.ok) {
          const craftVerb = hall === 'alchemy' ? 'หลอมโอสถบรรลุผลยอดเยี่ยม' : 'หลอมศาสตราบรรลุผลยอดเยี่ยม';
          if (r.tier >= 2 && res.q >= 1.15) {
            W.log('craft', n.h.name.given + ' ' + craftVerb + ' กำเนิด「' + res.text + '」คุณภาพชั้นเลิศ', [n.id]);
            AI.mem(W, n, 'ผลิต ' + res.text + ' ได้คุณภาพยอดเยี่ยม', 0.5);
          } else {
            W.log('craft', n.h.name.given + ' ผลิต ' + res.text + ' สำเร็จ นำเข้าคลังสำนัก', [n.id]);
          }
          HC.experience(n, 'craft_success', 0.4);
          n.merit += 1.5 * r.tier;
          W.sect.produced = (W.sect.produced || 0) + 1;
        } else {
          W.log('craft', n.h.name.given + ' ควบคุมเพลิงผิดจังหวะ การผลิต' + (r ? '「' + r.outNameTh + '」' : '') + ' ล้มเหลว สูญเสียวัตถุดิบบางส่วน', [n.id]);
          HC.feel(n, { mood: -5 });
        }
      },
      important: false
    };
  }
  A.brew = craftAct('alchemy', 'cauldron', ['ALCHEMY'], 'alchemy', 'ปรุงโอสถ', '⚗️');
  A.forge = craftAct('forge', 'anvil', ['FORGING', 'ARRAY', 'TALISMAN'], 'forging', 'หลอมศาสตรา', '🔨');

  A.farm = {
    nameTh: 'ทำไร่/ปลูกสมุนไพร', icon: '🌾', color: '#8ab04a',
    can: () => true,
    score(n, W, S) {
      const rk = n.rank; const labor = [1, .85, .35, .08, 0, 0, 0][rk];
      const meals = ECO.count(W, 'meal') + ECO.count(W, 'grain') * 3;
      const pop = W._alivePop || Math.max(1, W.npcs.filter(x => x && !x.dead && !x.exiled).length);
      const food = clamp(1 - meals / (pop * 16), 0, 1);
      S.add('งานประจำศิษย์', labor * 0.9 * dutyWeight(n) * 0.9 * (0.15 + 0.85 * food));
      S.add('เสบียงร่อยหรอ', food * 1.2 * (0.4 + dutyWeight(n) * 0.6) * (rk >= 4 ? 0.2 : 1));
      interestTerm(n, 'herbs', S, 0.9);
      S.add('ฝีมือเพาะปลูก', (n.h.skills.herbalism || 0) / 300);
      if (n.h.state.energy < 40) S.add('เหนื่อย', -0.6);
      if (W.weather && W.weather.kind !== 'clear' && W.weather.kind !== 'cloud') S.add('อากาศไม่เป็นใจ', -0.4);
    },
    where(W, n) {
      const needGrain = (ECO.count(W, 'grain') * 3 + ECO.count(W, 'meal')) / (W.npcs.length * 3) < 4;
      const herbWanted = !needGrain && (E(n, 'interests.herbs') > 55 || (n.h.skills.herbalism || 0) > 30);
      const bk = herbWanted ? 'herb_garden' : 'farm'; const s = AI.freeStation(W, n, 'farm', bk) || AI.freeStation(W, n, 'farm', herbWanted ? 'farm' : 'herb_garden');
      return s ? { st: s, herb: W.map.buildings[s.bid].id === 'herb_garden' } : null;
    },
    dur: n => 150 + Math.round(E(n, 'personality.discipline') * 0.8),
    tick(n, W, ctx) {
      n.h.state.energy = Math.max(0, n.h.state.energy - 0.06); n.h.state.rest -= 0.03; (g.MARTIAL && g.MARTIAL.skillPractice ? g.MARTIAL.skillPractice : HC.practice)(n, 'herbalism', 1 / 60, 1);
      if (W.t % 60 === 0) {
        if (ctx.herb) {
          const got = ECO.harvestHerb(W, n, 1);
          ctx.got = (ctx.got || 0) + got.length;
          if (got.length && (W.t + n.n) % 3 === 0) {
            W.log('craft', n.h.name.given + ' เก็บเกี่ยวสมุนไพรวิญญาณ ' + ECO.name(got[0]) + ' จากแปลงสมุนไพร', [n.id]);
          }
        } else {
          ctx.got = (ctx.got || 0) + ECO.harvestGrain(W, n, 1);
        }
        HC.trainBody(n, 'endurance', 0.8);
      }
      AI.vf(n, { sectDuty: 0.03, freedom: 0.01 });
      if (n.h.state.energy < 12) return 'done';
    },
    done(n, W, ctx) { n.merit += 0.4 + (ctx.got || 0) * 0.04; }
  };
  A.mine = {
    nameTh: 'ขุดแร่', icon: '⛏️', color: '#9aa0a6',
    can: (n, W) => n.h.state.energy > 30 && !(n.inj && n.inj.length),
    score(n, W, S) {
      const labor = [.8, 0.65, .25, .05, 0, 0, 0][n.rank];
      S.add('งานประจำศิษย์', labor * 0.75 * dutyWeight(n));
      let need = 0; const sw = W.sect.want; if (sw) { for (const _k in sw) need++; } S.add('คลังขาดแร่/วัตถุดิบ', Math.min(0.5, need * .05));
      S.add('ความอึด', (E(n, 'physiology.endurance') - 50) / 250);
      interestTerm(n, 'labor', S, 0.9); S.add('อยากได้ทรัพย์', (E(n, 'values.wealthResource') - 50) / 250);
      if (W.sect.policy.focus.commerce > 0.28) S.add('นโยบายเน้นการค้า', 0.2);
      S.add('อันตราย', -0.3 * (1 - E(n, 'personality.courage') / 100));
    },
    where: (W, n) => { const s = AI.freeStation(W, n, 'mine', 'mine'); return s ? { st: s } : null; },
    dur: () => 200,
    tick(n, W, ctx) {
      n.h.state.energy = Math.max(0, n.h.state.energy - 0.09); n.h.state.rest -= 0.03; (g.MARTIAL && g.MARTIAL.skillPractice ? g.MARTIAL.skillPractice : HC.practice)(n, 'mining', 1 / 60, 1);
      if (W.t % 60 === 0) { const r = ECO.mineYield(W, n, 1); ctx.got = (ctx.got || 0) + r.out.length; if (W.rng.chance(0.012 * (1 - E(n, 'intellect.perceptiveness') / 160))) AI.injure(W, n, 1, 'ถ้ำถล่มเล็กน้อย'); HC.trainBody(n, 'strength', 0.9); }
      AI.vf(n, { sectDuty: 0.02, wealthResource: 0.05 });
      if (n.h.state.energy < 14) return 'done';
    },
    done(n, W, ctx) { n.merit += 0.5 + (ctx.got || 0) * 0.05; if (n.cult && n.cult.track && CULT.checkTrackGates && !CULT.checkTrackGates(W, n).resourceOk) { n.inv.stones = (n.inv.stones || 0) + Math.min(18, Math.max(5, (ctx.got || 1) * 6)); } }
  };
  A.cook = {
    nameTh: 'ทำอาหาร', icon: '🍳', color: '#e07a5f',
    can: (n, W) => ECO.count(W, 'grain') >= 3,
    score(n, W, S) {
      const pop = W.npcs.length, meals = ECO.count(W, 'meal'); const low = clamp(1 - meals / (pop * 3), 0, 1);
      S.add('อาหารใกล้หมด', low * 1.8 * (0.4 + 0.6 * dutyWeight(n)));
      interestTerm(n, 'cuisine', S, 0.9); if (n.rank <= 1) S.add('งานครัวของศิษย์', 0.3 * dutyWeight(n));
      S.add('ฝีมือครัว', (n.h.skills.cooking || 0) / 250);
      const profession = ECO.profession(n);
      if (profession && profession.skill === 'cooking') S.add('บำเพ็ญมรรคาผ่านสำรับอาหาร', 0.65 * (0.25 + 0.75 * low));
    },
    where: (W, n) => { const s = AI.freeStation(W, n, 'cook', 'canteen'); return s ? { st: s } : null; },
    dur: () => 150,
    start(n, W, ctx) { return ECO.reserveCooking(W, n, ctx); },
    tick(n, W, ctx) { n.h.state.energy = Math.max(0, n.h.state.energy - 0.045); (g.MARTIAL && g.MARTIAL.skillPractice ? g.MARTIAL.skillPractice : HC.practice)(n, 'cooking', 1 / 60, 1); AI.vf(n, { sectDuty: 0.04, familyClan: 0.02 }); },
    done(n, W, ctx) { const res = ECO.finishCooking(W, n, ctx); if (!res.ok) return; ctx.m = res.meals; n.merit += 0.6; },
    inside: true
  };
  A.duty = {
    nameTh: 'ทำงานตามตำแหน่ง', icon: '📋', color: '#c9a227',
    can: (n, W) => (g.COG ? g.COG.role(W,n).id !== 'member' : !!(n.post || n.assist || n.rank >= 5)) && !n.sealed && (hourOf(W) >= 7.5 && hourOf(W) < 18.5),
    score(n, W, S) {
      S.add('หน้าที่ตำแหน่ง', 1.25 * dutyWeight(n));
      if (n.rank >= 5) S.add('ผู้นำสำนัก', 0.3);
      valueTerm(n, { sectDuty: 1, powerStatus: .7 }, S);
      if (n.post && (W.sect.lastDuty[n.id] || -9999) > W.t - 150) S.add('เพิ่งทำเสร็จ', -1.4);
    },
    where(W, n) {
      const role=g.COG?g.COG.role(W,n).id:null;
      const hall = role ? (['master','deputy'].includes(role)?'main_hall':SECT.POSTS[role]?.hall) : n.rank >= 5 ? 'main_hall' : SECT.POSTS[n.post || n.assist]?.hall;
      if(!hall)return null;
      const bk = hall === 'training_ground' || hall === 'gate' || hall === 'infirmary' || hall === 'alchemy' || hall === 'forge' ? null : hall;
      if (bk) { const s = AI.freeStation(W, n, 'work', bk); return s ? { st: s } : null; }
      if (hall === 'training_ground') { const s = AI.freeStation(W, n, 'spar', 'training_ground'); return s ? { st: s, kind: 'class' } : null; }
      if (hall === 'gate') { const s = AI.freeStation(W, n, 'guard', 'gate'); return s ? { st: s, kind: 'guard' } : null; }
      if (hall === 'infirmary') { const s = AI.freeStation(W, n, 'treat', 'infirmary'); return s ? { st: s, kind: 'heal' } : null; }
      const s = AI.freeStation(W, n, hall === 'alchemy' ? 'herbtable' : 'array', hall); return s ? { st: s, kind: 'craftmgmt' } : null;
    },
    dur: () => 150,
    tick(n, W, ctx) {
      (g.MARTIAL && g.MARTIAL.skillPractice ? g.MARTIAL.skillPractice : HC.practice)(n, 'administration', 1 / 60, 1); n.h.state.stress += 0.004; AI.vf(n, { sectDuty: 0.06, powerStatus: 0.05 });
      if (ctx.kind === 'heal') (g.MARTIAL && g.MARTIAL.skillPractice ? g.MARTIAL.skillPractice : HC.practice)(n, 'MEDICINE', 1 / 60, 1);
      if (ctx.kind === 'guard') { n.h.state.energy = Math.max(0, n.h.state.energy - 0.02); (g.MARTIAL && g.MARTIAL.skillPractice ? g.MARTIAL.skillPractice : HC.practice)(n, 'survival', 1 / 90, 1); }
      if (ctx.kind === 'class') { (g.MARTIAL && g.MARTIAL.skillPractice ? g.MARTIAL.skillPractice : HC.practice)(n, 'administration', 1 / 120, 1); AI.teachClass(W, n); }
      if (ctx.kind === 'craftmgmt') { const h = n.post || n.assist; if (h === 'alchemy') (g.MARTIAL && g.MARTIAL.skillPractice ? g.MARTIAL.skillPractice : HC.practice)(n, 'ALCHEMY', 1 / 60, 1.1); else { (g.MARTIAL && g.MARTIAL.skillPractice ? g.MARTIAL.skillPractice : HC.practice)(n, 'FORGING', 1 / 60, 1.1); (g.MARTIAL && g.MARTIAL.skillPractice ? g.MARTIAL.skillPractice : HC.practice)(n, 'ARRAY', 1 / 60, 1.1); (g.MARTIAL && g.MARTIAL.skillPractice ? g.MARTIAL.skillPractice : HC.practice)(n, 'TALISMAN', 1 / 60, 1.1); } }
    },
    done(n, W) { if(g.COG)g.COG.performDuty(W,n); W.sect.lastDuty[n.id] = W.t; n.merit += 2; W.sect.efficiency = (W.sect.efficiency || 0) + 1; }
  };
  AI.teachClass = (W, n) => { /* หัวหน้าหอยุทธ์ได้ทักษะสอน + ฝึกลูกศิษย์ใกล้ ๆ ผ่าน q ใน practice */ if (W.t % 30 === 0) (g.MARTIAL && g.MARTIAL.skillPractice ? g.MARTIAL.skillPractice : HC.practice)(n, 'diplomacy', 0.2, 0.5); };

  A.guard = {
    nameTh: 'เฝ้ายาม', icon: '🛡️', color: '#6b9ac4',
    can: (n, W) => n.rank >= 1 && n.h.state.energy > 35 && (n.rank <= 3 || ['guard', 'wildwarden', 'commander'].includes(n.post) || !!(W.sect && W.sect.guardRoster && W.sect.guardRoster.includes(n.id)) || !!(W.threat && (W.threat.raid || W.threat.alert > 0))),
    score(n, W, S) {
      const gcOrder = W.sect.guardRoster && W.sect.guardRoster.includes(n.id);
      const isDefPost = ['guard', 'wildwarden', 'commander'].includes(n.post);
      if (gcOrder) S.add('ได้รับมอบหมายเข้าเวร', 1.7 * dutyWeight(n));
      else if (W.threat && (W.threat.raid || W.threat.alert > 0)) S.add('สำนักอยู่ในภาวะเฝ้าระวังภัยคุกคาม', (W.threat.raid ? 1.55 : 1.05) * (isDefPost ? 1.3 : 1) * dutyWeight(n));
      else if (isDefPost) S.add('ตรวจเวรยามตามตำแหน่ง', 0.55 * dutyWeight(n));
      else return S.add('ไม่ถึงเวร', -3);
      S.add('ความกล้า', (E(n, 'personality.courage') - 50) / 250);
    },
    where: (W, n) => { const s = AI.freeStation(W, n, 'guard', ['gate', 'tower0', 'tower1', 'tower2', 'tower3', 'discipline']); return s ? { st: s } : null; },
    dur: () => 240,
    tick(n, W, ctx) { n.h.state.energy = Math.max(0, n.h.state.energy - 0.025); (g.MARTIAL && g.MARTIAL.skillPractice ? g.MARTIAL.skillPractice : HC.practice)(n, 'survival', 1 / 80, 0.8); AI.vf(n, { sectDuty: 0.05, honorLegacy: .02 }); if (W.t % 30 === 0) HC.trainMind(n, 'perceptiveness', 0.8); },
    done(n, W) { n.merit += 1.8; }
  };
  A.heal = {
    nameTh: 'พักรักษาตัว', icon: '🩹', color: '#53c68c',
    can: (n, W) => true,
    score(n, W, S) {
      const hpR = n.h.state.hp / (n._nd ? n._nd.hpMax : CULT.hpMax(n));
      const hasInj = !!(n.inj && n.inj.length);
      if (hpR > 0.8 && !hasInj) return S.add('แข็งแรงดี', -3);
      const sevMax = hasInj ? Math.max(...n.inj.map(i => i.sev || 1)) : 0;
      S.add('บาดเจ็บ', (1 - hpR) * 2.6 + (hasInj ? n.inj.length * 0.65 + (sevMax >= 2 ? 1.35 : 0.35) : 0));
      S.add('ทนเจ็บ', -(E(n, 'physiology.painTolerance') - 50) / 300);
    },
    where: (W, n) => { const s = AI.freeStation(W, n, 'patient', 'infirmary'); return s ? { st: s } : null; },
    dur: () => 360,
    tick(n, W) {
      const s = n.h.state, hm = CULT.hpMax(n); const healer = SECT.holder(W, 'healer'); const k = 3 + (healer && !healer.dead ? E(healer, 'intellect.comprehension') / 60 : 0) + W.map.byId.infirmary.level * 0.3;
      s.hp = Math.min(hm, s.hp + hm * 0.00012 * k * (0.6 + E(n, 'physiology.recoveryRate') / 100) * (g.MARTIAL && healer ? g.MARTIAL.lifeMult(healer, 'MEDICINE') * g.MARTIAL.skillEffects(healer).medicine : 1)); s.rest = Math.min(100, s.rest + 0.05);
      if (n.inj) n.inj.forEach(i => { i.until -= 3.2; });
      if (healer && !healer.dead && W.t % 120 === 0) (g.MARTIAL && g.MARTIAL.skillPractice ? g.MARTIAL.skillPractice : HC.practice)(healer, 'MEDICINE', 0.5, 1.2);
      if (s.hp >= hm * 0.97 && (!n.inj || !n.inj.length)) return 'done';
    },
    done(n, W) {
      const hm = (n._nd && n._nd.day === HC.nowDay) ? n._nd.hpMax : CULT.hpMax(n);
      if (n.h.state.hp >= hm * 0.95 && (!n.inj || !n.inj.length)) {
        W.log('heal', n.h.name.given + ' พักรักษาตัวที่หอหมอยาจนร่างกายและลมปราณฟื้นคืนสมบูรณ์', [n.id]);
      }
    },
    inside: true
  };
  AI.findSupportBlessTarget = (W, n) => {
    if (!W || !n || !n.cult) return null;
    const tNow = W.t || 0;
    const isSage = n.cult.path === 'SAGE_SUPPORT';
    const doctrine = (g.SECT && g.SECT.ensureSupportDoctrine) ? g.SECT.ensureSupportDoctrine(W) : null;
    const priority = doctrine ? doctrine.triagePriority : 'BALANCED';
    const minHpThresh = doctrine ? (doctrine.minHpThreshold / 100) : 0.85;
    const hasKin = !!(n.companionId || (n.parentIds && n.parentIds.length) || (n.h && n.h.life && n.h.life.family && n.h.life.family.children && n.h.life.family.children.length));
    const cacheSlot = isSage ? '_supportBlessCache1' : '_supportBlessCache0';
    const cacheKey = tNow + ':' + priority + ':' + minHpThresh + (hasKin ? (':' + n.id) : '');
    if (W[cacheSlot] && W[cacheSlot].key === cacheKey) return W[cacheSlot].val;
    let best = null, bestScore = 0;
    for (let i = 0; i < W.npcs.length; i++) {
      const o = W.npcs[i];
      if (!o || o.dead || o.away || o.exiled || !o.h || !o.h.state) continue;
      const hm = (o._nd && o._nd.hpMax) || CULT.hpMax(o);
      const hpRatio = o.h.state.hp / Math.max(1, hm);
      const hasInj = Array.isArray(o.inj) && o.inj.length > 0;
      const needBt = !!(o.cult && (o.cult.bn || CULT.ready(o)));
      const hasBuff = !!(o.buffs && o.buffs.length > 0 && o.buffs[0].until > tNow);
      let sc = 0;
      if (hpRatio < minHpThresh) sc += (minHpThresh - hpRatio) * 4.0;
      if (hasInj) sc += 1.8 + o.inj.length * 0.8;
      if (needBt && !hasBuff) sc += 1.5;
      if ((o.h.state.stress || 0) > 45 || (o.h.state.heartDemon || 0) > 35) sc += 1.0;
      if (!hasBuff && (n.cult.path === 'SAGE_SUPPORT')) sc += 0.8;

      if (priority === 'ELDER_FIRST' && o.rank >= 4) {
        sc += 3.5;
      } else if (priority === 'SEVEREST_FIRST') {
        if (hpRatio < 0.5) sc += (0.5 - hpRatio) * 6.0;
        if (hasInj) sc += o.inj.length * 2.5;
      } else if (priority === 'VANGUARD_FIRST') {
        const isVanguard = o.post === 'commander' || o.post === 'guard' || o.post === 'wildwarden' || (o.cult && o.cult.path === 'BODY');
        if (isVanguard) sc += 3.2;
      }

      if (hasKin && sc > 0 && (o.id === n.companionId || (Array.isArray(n.parentIds) && n.parentIds.includes(o.id)) || (Array.isArray(o.parentIds) && o.parentIds.includes(n.id)))) {
        sc += 4.5;
      }
      if (sc > bestScore) { bestScore = sc; best = o; }
    }
    W[cacheSlot] = { key: cacheKey, val: best };
    return best;
  };
  A.supportBless = {
    u(n, W) { if (!this.can(n, W)) return 0; let tot = 0; this.score(n, W, { add: (_, v) => { tot += v; } }); return tot; },
    nameTh: 'เดินปราณเยียวยาและหนุนพลัง', icon: '🪷', color: '#6ddfb5', cooldown: 180,
    can: (n, W) => !!(n.cult && (n.cult.path === 'SAGE_SUPPORT' || n.post === 'healer' || ['LOTUS_MERCY_PURIFIER', 'MERCY_DEITY', 'ELIXIR_DAO', 'MEDICINE_BODHI_GOD', 'CELESTIAL_ASTRAL_FAIRY_TAMER'].includes(n.cult.sub)) && n.h.state.energy > 30 && (!n._lastSupportBlessAt || W.t - n._lastSupportBlessAt >= 180) && AI.findSupportBlessTarget(W, n)),
    score(n, W, S) {
      const tgt = AI.findSupportBlessTarget(W, n);
      if (!tgt) return;
      const isSage = n.cult && n.cult.path === 'SAGE_SUPPORT';
      S.add('เมตตาเยียวยาและหนุนพลัง (' + tgt.h.name.given + ')', (isSage ? 1.15 : 0.75) + (E(n, 'personality.empathy') - 45) / 140);
      if (n.post === 'healer') S.add('หน้าที่หมอประจำสำนัก', 0.55);
    },
    where(W, n) {
      const tgt = AI.findSupportBlessTarget(W, n);
      if (!tgt) return null;
      const s = AI.freeStation(W, n, 'treat', 'infirmary') || AI.freeStation(W, n, 'music', 'tea_garden') || AI.freeStation(W, n, 'meditate', 'meditation_hall') || AI.freeStation(W, n, 'stroll', 'plaza');
      return s ? { st: s, targetId: tgt.id } : null;
    },
    dur: () => 35,
    tick(n) { n.h.state.energy = Math.max(0, n.h.state.energy - 0.04); },
    done(n, W, ctx) {
      n._lastSupportBlessAt = W.t;
      const tgt = (ctx && ctx.targetId && W.byId[ctx.targetId]) || AI.findSupportBlessTarget(W, n) || n;
      if (CULT.castHealOrBuff) {
        const res = CULT.castHealOrBuff(W, n, tgt, { now: W.t });
        if (res && res.ok) n.merit = (n.merit || 0) + 0.8;
      }
    }
  };
  A.pray = {
    nameTh: 'สักการะบรรพชน', icon: '🕯️', color: '#d9c7a0',
    can: () => true,
    score(n, W, S) {
      S.add('กตัญญู', (E(n, 'personality.loyalty') - 52) / 180);
      valueTerm(n, { honorLegacy: 1, familyClan: .4 }, S);
      S.add('จิตใจว้าวุ่น', (n.h.state.stress - 40) / 150);
      if ((n.h.state.heartDemon || 0) >= 35 && (!n.cult || n.cult.path !== 'DEMON' || n.h.state.heartDemon >= 65)) {
        S.add('สงบจิตมารในใจ', clamp((n.h.state.heartDemon - 30) / 90, 0.15, 0.65));
      }
      interestTerm(n, 'worship', S, .6);
      if (n.ancestralBlessing && n.ancestralBlessing.until != null && W.t > n.ancestralBlessing.until) {
        n.ancestralBlessing = null;
      }
      if (W.sect && Array.isArray(W.sect.legacyTablets) && W.sect.legacyTablets.length && n.cult && !(CULT.isAncestralBlessingActive ? CULT.isAncestralBlessingActive(n, W.t) : (n.ancestralBlessing && n.ancestralBlessing.untilDay >= W.day)) && (!Number.isFinite(n.ancestralPrayerCooldownUntil) || W.t >= n.ancestralPrayerCooldownUntil)) {
        const aware = !g.COG || !g.COG.isAwareOf || g.COG.isAwareOf(W, n, 'tablet');
        if (aware) {
          const tabs = W.sect.legacyTablets;
          const subMatch = tabs.some(t => t.sub && t.sub !== 'NONE' && t.sub === n.cult.sub);
          const pathMatch = subMatch || tabs.some(t => t.path === n.cult.path);
          const mentorMatch = tabs.some(t => t.npcId && (t.npcId === n.mentor || (n.h.mind.relations && n.h.mind.relations[t.npcId] && n.h.mind.relations[t.npcId].a >= 45)));
          const needBt = !!(n.cult.bn || CULT.ready(n) || (n.cult.track && CULT.trackReady && CULT.trackReady(n)));
          const needStudy = !!(n.cult.learning || (n.cognition && n.cognition.goal && n.cognition.goal.id === 'scripture'));
          const highHd = (n.h.state.heartDemon || 0) >= 35;
          const devout = E(n, 'values.honorLegacy') >= 62 || E(n, 'personality.loyalty') >= 65;
          if (needBt || needStudy || highHd || mentorMatch || (subMatch && devout)) {
            const matchMult = subMatch ? 1.35 : pathMatch ? 1.05 : 0.65;
            const baseUrgency = needBt ? 0.58 : needStudy ? 0.42 : mentorMatch ? 0.38 : 0.25;
            S.add('ขอพรป้ายวิญญาณบรรพชน' + (subMatch ? ' (ตรงสายย่อย)' : pathMatch ? ' (ตรงวิถี)' : ''), +(baseUrgency * matchMult).toFixed(2));
          }
        }
      }
    },
    where: (W, n) => { const s = AI.freeStation(W, n, 'pray', 'ancestral') || AI.freeStation(W, n, 'worship', 'shrine'); return s ? { st: s } : null; },
    dur: () => 40,
    tick(n) { n.h.state.stress = Math.max(0, n.h.state.stress - 0.12); n.h.state.heartDemon = Math.max(0, n.h.state.heartDemon - 0.05); AI.vf(n, { honorLegacy: 0.18 }); },
    done(n, W) { if (SECT && SECT.prayAtAncestralShrine) SECT.prayAtAncestralShrine(W, n); }
  };
  A.leisure = {
    nameTh: 'พักผ่อนสำราญ', icon: '🍵', color: '#f2b5d4',
    can: () => true,
    score(n, W, S) {
      const s = n.h.state;
      S.add('เครียด', (s.stress - 30) / 90); S.add('เบื่อ', (60 - s.novelty) / 120);
      interestTerm(n, 'arts', S, .5); interestTerm(n, 'solitude', S, .45); interestTerm(n, 'cuisine', S, .3);
      valueTerm(n, { freedom: .9 }, S);
      S.add('อารมณ์ขุ่นมัว', (-s.mood - 10) / 160);
      if (isNight(hourOf(W))) S.add('ดึก', -0.35);
      S.add('พักบ้างก็ดี', 0.12);
    },
    where(W, n) {
      const solo = E(n, 'temperament.sociability') < 45;
      const opts = [];
      const fish = AI.freeStation(W, n, 'fish', 'spirit_pond'); if (fish && (E(n, 'interests.solitude') > 48 || E(n, 'interests.herbs') > 55)) opts.push({ st: fish, mode: 'fish', w: 1 + E(n, 'interests.solitude') / 100 });
      const rel = AI.freeStation(W, n, 'relax', 'spirit_pond'); if (rel) opts.push({ st: rel, mode: 'view', w: 0.8 + (solo ? .5 : 0) });
      const mus = AI.freeStation(W, n, 'music', 'tea_garden'); if (mus && E(n, 'interests.arts') > 50) opts.push({ st: mus, mode: 'music', w: 0.5 + E(n, 'interests.arts') / 60 });
      const tea = AI.freeStation(W, n, 'chat', 'tea_garden'); if (tea) opts.push({ st: tea, mode: 'tea', w: 1 + (solo ? 0 : .5) + E(n, 'interests.cuisine') / 150 });
      const str = AI.freeStation(W, n, 'stroll', 'plaza'); if (str) opts.push({ st: str, mode: 'stroll', w: 0.6 });
      if (!opts.length) return null;
      return W.rng.weighted(opts, o => o.w);
    },
    dur: () => 70,
    tick(n, W, ctx) {
      const s = n.h.state; s.stress = Math.max(0, s.stress - 0.1 * (ctx.mode === 'music' && g.MARTIAL ? g.MARTIAL.skillEffects(n).music : 1)); s.mood = Math.min(100, s.mood + 0.09 * (ctx.mode === 'music' && g.MARTIAL ? g.MARTIAL.skillEffects(n).music : 1)); s.novelty = Math.min(100, s.novelty + 0.08);
      if (ctx.mode === 'music') { (g.MARTIAL && g.MARTIAL.skillPractice ? g.MARTIAL.skillPractice : HC.practice)(n, 'arts', 1 / 60, 1); AI.vf(n, { freedom: .03 }); }
      if (ctx.mode === 'fish' && W.t % 90 === 0 && W.rng.chance(0.4)) ECO.add(W, 'meal', 2);
      AI.vf(n, { freedom: 0.035 }); s.energy = Math.min(100, s.energy + 0.05);
    }
  };
  A.shop = {
    nameTh: 'ซื้อของตลาด', icon: '🛒', color: '#e0b84a',
    can: (n, W) => n.inv.stones >= 20 && !!n.cult,
    score(n, W, S) {
      const want = AI.wantedPill(W, n); if (!want) return S.add('ไม่มีของที่อยากได้', -3);
      S.add('อยากได้ ' + want.name, 0.65 + (E(n, 'values.wealthResource') - 50) / 250 + (n.inv.stones > want.price * 3 ? 0.3 : 0));
    },
    where: (W, n) => { const s = AI.freeStation(W, n, 'browse', 'market'); return s ? { st: s } : null; },
    dur: () => 25,
    done(n, W) {
      const want = AI.wantedPill(W, n); if (!want) return;
      if (n.inv.stones >= want.price && ECO.take(W, want.key, 1)) { n.inv.stones -= want.price; ECO.earn(W, want.price, 'ขายยาให้ศิษย์'); n.inv.pills = n.inv.pills || {}; n.inv.pills[want.key] = (n.inv.pills[want.key] || 0) + 1; AI.mem(W, n, 'ซื้อ' + want.name, 0.2); }
    }
  };
  AI.wantedPill = (W, n) => {
    const c = n.cult; if (!c) return null;
    let best = null, bs = -1;
    for (const k of Object.keys(W.sect.stock)) {
      if (!ECO.isPill(k) || W.sect.stock[k] <= 0) continue; const info = ECO.pillInfo(k); if (!info) continue;
      const e = info.effect; if (!(e.cultivationProgress || e.breakthroughBonus)) continue;
      if (e.btFor) { if (e.btFor.path !== c.path || e.btFor.stage !== c.stage || !c.bn) continue; } else if (info.tier > CULT.equivalentStage(n) + 1) continue;
      const price = Math.round(ECO.price(W, k) * (0.85 - W.sect.policy.generosity / 500));
      if (n.inv.stones < price) continue;
      const s = (e.cultivationProgress || 0) / price + (e.breakthroughBonus ? 2 : 0) + (c.prog >= CULT.threshold(n) * 0.8 && e.breakthroughBonus ? 4 : 0);
      if (s > bs) { bs = s; best = { key: k, price, name: info.name }; }
    }
    return best;
  };
  A.errand = {
    nameTh: 'ติดต่อหอภารกิจ', icon: '📯', color: '#4aa3d9',
    can: (n, W) => !n.wantTrip && n.rank >= 1 && !n.away && n.h.state.energy > 40 && n.h.state.satiety > 40 && (W.day - (n.lastTrip || -99)) > 12 && !(n.inj && n.inj.length),
    score(n, W, S) {
      interestTerm(n, 'exploring', S, 1.0); S.add('ชอบความตื่นเต้น', (E(n, 'temperament.sensationSeeking') - 50) / 110);
      valueTerm(n, { freedom: .9, powerStatus: .3, wealthResource: .5 }, S);
      S.add('ทะเยอทะยาน', (E(n, 'personality.ambition') - 55) / 200);
      if (E(n, 'destiny.luck') > 70) S.add('เชื่อในโชค', 0.1);
      S.add('นโยบายขยายอิทธิพล', (W.sect.policy.expansion - 50) / 150);
      S.add('ความกลัว', -(E(n, 'personality.caution') - 45) / 150);
      if (!SECT.holder(W, 'mission')) S.add('ไม่มีผู้อาวุโสหอภารกิจ', -0.5);
    },
    where: (W, n) => { const s = AI.freeStation(W, n, 'board', 'mission_hall'); return s ? { st: s } : null; },
    dur: () => 20,
    done(n, W) { g.EXPED.volunteer(W, n); }
  };
  A.festival = {
    nameTh: 'ร่วมงานเลี้ยง', icon: '🎎', color: '#ff7aa2',
    can: (n, W) => !!(W.sect.festival && W.sect.festival.until > W.t),
    score(n, W, S) { S.add('งานเลี้ยงสำนัก', 1.4 + (E(n, 'temperament.sociability') - 50) / 100 + (E(n, 'interests.socializing') - 50) / 120 - (E(n, 'interests.solitude') - 50) / 200); },
    where: (W, n) => { const s = AI.freeStation(W, n, 'stroll', 'plaza'); return s ? { st: s } : { pos: { x: W.map.byId.plaza.x + 8 + (n.id.charCodeAt(1) % 14), y: W.map.byId.plaza.y + 4 + (n.id.charCodeAt(2) % 8) } }; },
    dur: () => 120,
    tick(n, W) { const s = n.h.state; s.mood = Math.min(100, s.mood + 0.12); s.social = Math.min(100, s.social + 0.18); s.novelty = Math.min(100, s.novelty + 0.08); s.stress = Math.max(0, s.stress - 0.1); s.satiety = Math.min(100, s.satiety + 0.1); AI.vf(n, { familyClan: .08, freedom: .02 }); if (W.t % 20 === 0) { const o = AI.nearbyOther(W, n, 3); if (o) AI.interact(W, n, o, 'chat', 0.6); } }
  };
  A.idle = {
    nameTh: 'เดินเล่น', icon: '🚶', color: '#9aa',
    can: () => true,
    score(n, W, S) { S.add('ว่าง', 0.05); },
    where: (W, n) => { const s = AI.freeStation(W, n, 'stroll', 'plaza'); return s ? { st: s } : { pos: { x: n.x, y: n.y } }; },
    dur: () => 40,
    tick(n) { n.h.state.novelty = Math.min(100, n.h.state.novelty + 0.03); n.h.state.energy = Math.min(100, n.h.state.energy + 0.06); }
  };
  A.sentence = { // ชดใช้โทษ: ทำงานเบ็ดเตล็ด/จำคุก
    nameTh: 'รับโทษ', icon: '⛓️', color: '#7a7a7a',
    can: (n, W) => n.jail && n.jail > W.t,
    score: (n, W, S) => S.add('ถูกคุมขัง', 9),
    where: (W, n) => { const s = AI.freeStation(W, n, 'cell', 'discipline'); return s ? { st: s } : null; },
    dur: () => 240,
    tick(n) { n.h.state.stress += 0.01; n.h.state.mood -= 0.02; n.h.state.novelty -= 0.02; },
    inside: true
  };
  A.hide = { nameTh: 'หลบภัย', icon: '🫣', color: '#aaa', can: () => false, score: (n, W, S) => S.add('ภัย', -9), where: (W, n) => { const s = n.bed != null ? W.map.stations[n.bed] : null; return s ? { st: s } : null; }, dur: () => 60, tick() { }, inside: true };

  /* ---------- กิจกรรมคู่: คุย ประลอง สอน เดท ---------- */
  A.pair = {
    nameTh: 'พบปะ', icon: '💬', color: '#f2a65a',
    can: (n, W) => true, // ตัดสินใจเลือกคู่ใน AI.socialStart
    score(n, W, S) {
      const s = n.h.state;
      S.add('อยากพบผู้คน', (55 - s.social) / 70 + (E(n, 'temperament.sociability') - 50) / 130);
      interestTerm(n, 'socializing', S, .65);
      valueTerm(n, { familyClan: .9, honorLegacy: .15 }, S);
      S.add('ความเหงา', s.loneliness / 150);
      if (isNight(hourOf(W)) && s.rest < 50) S.add('ดึก', -0.6);
      if (n.rank >= 1 && E(n, 'interests.combat') > 60 && E(n, 'personality.aggression') > 50) S.add('คันไม้คันมืออยากประลอง', 0.25);
      if (n.rank >= 4 && E(n, 'interests.teaching') > 50) S.add('ใจรักการสอน', 0.3);
      if ((n.h.life.family.disciples || []).length) S.add('มีศิษย์ในปกครอง', 0.25);
      if (g.MARTIAL && g.MARTIAL.activeBottleneckSkills && CULT.findQualifiedSkillTeacher) {
        const bnSk = g.MARTIAL.activeBottleneckSkills(W, n);
        if (bnSk.length && (!W || !W.map || AI.freeStation(W, n, 'dummy', 'training_ground')) && CULT.findQualifiedSkillTeacher(W, n, bnSk[0].skill)) {
          const drive = g.MARTIAL.bottleneckSkillDrive ? g.MARTIAL.bottleneckSkillDrive(n) : 1;
          const nf = clamp(Math.min(s.satiety / 35, s.rest / 25, s.energy / 30), 0.2, 1);
          S.add('ขอรับการชี้แนะ ' + bnSk[0].nameTh + ' แก้คอขวดสายเฉพาะทาง', (CULT.trackReady(n) ? 0.92 : 0.62) * drive * nf);
        }
      }
    }
  };

  AI.nearbyOther = (W, n, r) => {
    let best = null, bd = r * r;
    for (const o of W.npcs) { if (o === n || o.dead || o.away || o.hidden) continue; const d = (o.x - n.x) ** 2 + (o.y - n.y) ** 2; if (d < bd) { bd = d; best = o; } }
    return best;
  };

  /* ---------- ความสัมพันธ์ ---------- */
  function topInterests(x) {
    const ti = x._topInt;
    if (ti && ti.day === HC.nowDay && ti.ver === x._ver) return ti.list;
    const list = INT_IDS.map(k => [k, E(x, 'interests.' + k)]).sort((p, q) => q[1] - p[1]).slice(0, 4).map(p => p[0]);
    x._topInt = { day: HC.nowDay, ver: x._ver, list };
    return list;
  }
  AI.compat = (a, b) => {
    let cm = a._compat;
    const day = HC.nowDay, pa = a.h.personality, pb = b.h.personality, va = (a.mods ? a.mods.length : 0) + ((pa.integrity + pa.empathy + pa.trustfulness + pa.aggression + pa.pride) * 1000 | 0), vb = (b.mods ? b.mods.length : 0) + ((pb.integrity + pb.empathy + pb.trustfulness + pb.aggression + pb.pride) * 1000 | 0);
    if (cm && b.id) {
      const hit = cm[b.id];
      if (hit && hit.day === day && hit.va === va && hit.vb === vb) return hit.v;
    }
    let dot = 0, na = 0, nb = 0;
    for (let i = 0; i < VAL_IDS.length; i++) {
      const k = VAL_IDS[i], x = E(a, 'values.' + k) - 50, y = E(b, 'values.' + k) - 50;
      dot += x * y; na += x * x; nb += y * y;
    }
    const vcos = dot / (Math.sqrt(na * nb) + 40);
    const ip = ((100 - Math.abs(E(a, 'personality.integrity') - E(b, 'personality.integrity'))) / 100 +
                (100 - Math.abs(E(a, 'personality.empathy') - E(b, 'personality.empathy'))) / 100 +
                (100 - Math.abs(E(a, 'personality.trustfulness') - E(b, 'personality.trustfulness'))) / 100) / 3 - 0.55;
    const clash = (E(a, 'personality.aggression') + E(b, 'personality.aggression') > 125 ? -0.25 : 0) + (E(a, 'personality.pride') + E(b, 'personality.pride') > 130 ? -0.2 : 0);
    const ta = topInterests(a), tb = topInterests(b);
    let sc = 0; for (let i = 0; i < ta.length; i++) if (tb.includes(ta[i])) sc++;
    const shared = sc * 0.12;
    const fun = (E(a, 'temperament.humor') + E(b, 'temperament.humor') - 100) / 300 + (E(a, 'temperament.affection') + E(b, 'temperament.affection') - 100) / 400;
    const res = clamp(vcos * 0.45 + ip * 0.6 + clash + shared + fun, -1, 1);
    if (b.id) {
      if (!cm) cm = a._compat = {};
      cm[b.id] = { day, va, vb, v: res };
    }
    return res;
  };
  AI.interact = (W, a, b, type, k) => {
    k = k == null ? 1 : k;
    const ra = SECT.rel(a, b.id), rb = SECT.rel(b, a.id);
    const c = AI.compat(a, b);
    let da = 0, dt = 0, dr = 0, dl = 0, dv = 0;
    if (type === 'chat') { da = (c * 1.1 + 0.25 + W.rng.gauss(0, 0.25)) * k; dt = c * 0.4 * k; HC.feel(a, { mood: 1.5 * c + 0.5 }); HC.feel(b, { mood: 1.5 * c + 0.5 }); a.h.state.social = Math.min(100, a.h.state.social + 3 * k); b.h.state.social = Math.min(100, b.h.state.social + 3 * k); a.h.state.loneliness = Math.max(0, a.h.state.loneliness - 1.5); b.h.state.loneliness = Math.max(0, b.h.state.loneliness - 1.5); if (c < -0.2) dv = 0.5 * k; }
    else if (type === 'spar') { da = 0.3 * k * (1 + c * 0.6); dr = 0.6; dv = (E(a, 'personality.pride') + E(b, 'personality.pride') > 110) ? 0.6 : 0.1; }
    else if (type === 'teach') { dr = 1.4 * k; da = (0.5 + c * 0.6) * k; dt = 0.8 * k; }
    else if (type === 'date') { dl = (c * 2.2 + 0.7) * k * (E(a, 'temperament.affection') + E(b, 'temperament.affection')) / 120; da = 1.0 * k + c; HC.feel(a, { mood: 2.5 }); HC.feel(b, { mood: 2.5 }); }
    else if (type === 'argue') { da = -2.5 * k; dv = 2.5 * k; dt = -1.2 * k; HC.feel(a, { anger: 6, mood: -4, stress: 3 }); HC.feel(b, { anger: 6, mood: -4, stress: 3 }); }
    else if (type === 'gift') { da = 4 * k; dt = 2 * k; HC.feel(b, { mood: 6 }); }
    const upd = (r, x, y, other) => {
      r.a = clamp(r.a + da * (1 + (HC.eff(x, 'personality.empathy') - 50) / 200), -100, 100); r.t = clamp(r.t + dt, 0, 100);
      r.r = clamp(r.r + dr, 0, 100); r.l = clamp(r.l + dl + (type === 'date' ? 0 : -0.01), 0, 100); r.v = clamp(r.v + dv - 0.03, 0, 100); r.n++; r.last = W.t;
      AI.updateBond(W, x, other, r);
    };
    upd(ra, a, a, b); upd(rb, b, b, a);
  };
  AI.updateBond = (W, x, other, r) => {
    const old = r.bond; let nb = old;
    if (r.l > 62 && r.a > 40) nb = r.l > 85 && r.a > 70 ? 'คู่ครอง' : 'คนรัก';
    else if (r.a > 52 && r.n > 8) nb = 'สหาย';
    else if (r.a < -35 && r.v > 40) nb = 'ศัตรู';
    else if (r.v > 45 && r.r > 40) nb = 'คู่แข่ง';
    else if (r.a < 40 && r.l < 55 && (old === 'สหาย' || old === 'คนรัก')) nb = '';
    if (x.companionId === other.id || old === 'TAOIST_COMPANION') nb = 'TAOIST_COMPANION';
    else if (x.mentorId === other.id || x.mentor === other.id || x.h.life.family.master === other.id) nb = x.mentorId === other.id ? 'อาจารย์สายตรง' : 'อาจารย์'; else if ((Array.isArray(x.apprenticeIds) && x.apprenticeIds.includes(other.id)) || (x.h.life.family.disciples || []).includes(other.id)) nb = (Array.isArray(x.apprenticeIds) && x.apprenticeIds.includes(other.id)) ? 'ศิษย์สายตรง' : 'ศิษย์';
    if (nb !== old) {
      r.bond = nb;
      if (nb === 'สหาย' || nb === 'คนรัก' || nb === 'ศัตรู' || nb === 'คู่แข่ง' || nb === 'คู่ครอง') {
        AI.mem(W, x, (nb === 'ศัตรู' ? 'เริ่มเป็นศัตรูกับ ' : nb === 'คนรัก' ? 'ตกหลุมรัก ' : nb === 'คู่ครอง' ? 'ผูกพันเป็นคู่ครองกับ ' : nb === 'คู่แข่ง' ? 'กลายเป็นคู่แข่งกับ ' : 'สนิทสนมเป็นสหายกับ ') + other.h.name.given, 0.7, other.id);
        if (x.id < other.id) { W.log('relation', x.h.name.given + ' กับ ' + other.h.name.given + (nb === 'ศัตรู' ? ' เป็นศัตรูกัน' : nb === 'คนรัก' ? ' เริ่มเป็นคนรักกัน' : nb === 'คู่ครอง' ? ' ผูกพันเป็นคู่ครอง' : nb === 'คู่แข่ง' ? ' เป็นคู่แข่งกัน' : ' กลายเป็นสหายสนิท'), [x.id, other.id]); }
        HC.experience(x, nb === 'ศัตรู' ? 'betrayed' : nb === 'คนรัก' || nb === 'คู่ครอง' ? 'fell_in_love' : 'friendship', nb === 'ศัตรู' ? 0.2 : 0.6);
        if (nb === 'คู่ครอง' && !x.h.life.family.spouse && !other.h.life.family.spouse) { const b = W.byId[other.id]; if (b && SECT.rel(b, x.id).bond === 'คู่ครอง') { x.h.life.family.spouse = other.id; b.h.life.family.spouse = x.id; W.log('marriage', x.h.name.given + ' และ ' + b.h.name.given + ' ประกอบพิธีแต่งงานในสำนัก', [x.id, b.id]); W.fame(1); } }
      }
    }
  };
  AI.mem = (W, n, text, w, withId) => {
    const m = n.h.mind.memories; m.push({ t: W.t, text, w: w || 0.3, who: withId || null });
    if (m.length > 40) { m.sort((a, b) => b.w - a.w * 0.99); m.length = 32; m.sort((a, b) => a.t - b.t); }
  };
  AI.vf = (n, d) => { const f = n.h.fulfil; for (const k in d) f[k] = Math.min(100, f[k] + d[k]); };

  /* การปกป้องงานสำคัญจากการถูกรบกวนโดยคำชวนทั่วไป */
  AI.PROTECTED_ACTS = new Set(['sleep', 'eat', 'heal', 'supportBless', 'breakthrough', 'fight', 'sentence', 'hide', 'pair', 'brew', 'forge', 'cook', 'brewBasic', 'personalBrew', 'paidTraining', 'guidedStudy', 'retrain', 'specialize', 'wildHunt', 'guard']);
  AI.isProtectedAction = (W, n, inviteType) => {
    if (!n || !n.act || !n.act.id || n.act.id === 'idle') return false;
    const id = n.act.id;
    if (AI.PROTECTED_ACTS.has(id)) return true;
    if (id === 'duty' && inviteType !== 'official_order') return true;
    if (id === 'study' && n.cult && n.cult.learning && (n.cult.learning.got / Math.max(1, n.cult.learning.need)) >= 0.65) return true;
    return false;
  };

  /* เลือกคู่สนทนา/ประลอง/สอน/เดท */
  AI.socialStart = (W, n) => {
    if (n.act && n.act.id === 'pair') return false;
    const cands = [];
    const rel = n.h.mind.relations;
    const goal = n.cognition?.goal;
    const bnSkSeek = (g.MARTIAL && g.MARTIAL.activeBottleneckSkills) ? g.MARTIAL.activeBottleneckSkills(W, n) : [];
    for (const o of W.npcs) {
      if (o === n || o.dead || o.away || o.exiled || o.sealed || o.jail > W.t) continue;
      if (AI.isProtectedAction(W, o, 'pair')) continue;
      const r = rel[o.id]; const c = AI.compat(n, o);
      let w = 0.3 + (r ? Math.max(0, r.a) / 60 + r.n / 40 + (r.g || 0) / 80 : 0) + c * 0.7;
      if (n.companionId && n.companionId === o.id) w += 2.6;
      if (r && (r.bond === 'LIFE_SAVIOR' || (r.lifeAndDeathCount || 0) > 0)) w += 2.4;
      if (n.peakId && o.peakId && n.peakId === o.peakId) w *= 1.45;
      if (goal && goal.targetId === o.id && ['mentor_disciple', 'social_bond', 'rival'].includes(goal.id)) w += 1.6;
      const canTeachBn = bnSkSeek.length && o.rank >= 2 && o.rank > n.rank && (g.MARTIAL ? g.MARTIAL.skillRead(o, bnSkSeek[0].skill) : (o.h.skills[bnSkSeek[0].skill] || 0)) > bnSkSeek[0].current + 2;
      if (canTeachBn) w += 3.5;
      const d = Math.abs(o.x - n.x) + Math.abs(o.y - n.y); w *= 1 / (1 + d / 90);
      if (Math.abs(o.rank - n.rank) > 2 && !canTeachBn && !(goal && goal.targetId === o.id)) w *= 0.35;
      cands.push({ o, w: Math.max(0.02, w), c, r });
    }
    if (!cands.length) return false;
    const pick = W.rng.weighted(cands, x => x.w);
    const o = pick.o, r = pick.r || {};
    // เลือกชนิดการพบปะตามตัวตนและเป้าหมาย
    let type = 'chat'; const opts = [];
    opts.push({ t: 'chat', w: 1.2 + (goal && goal.id === 'social_bond' && goal.targetId === o.id ? 1.2 : 0) });
    if (E(n, 'interests.combat') > 52 && o.rank >= 1 && n.rank >= 1 && !(n.inj && n.inj.length)) opts.push({ t: 'spar', w: (E(n, 'interests.combat') - 40) / 25 * (1 + (r.v || 0) / 40) + (E(n, 'personality.aggression') - 40) / 50 + (goal && goal.id === 'rival' && goal.targetId === o.id ? 1.5 : 0) });
    if (n.rank >= 3 && o.rank < n.rank && E(n, 'social.teaching') > 40 && n.cult && o.cult && (o.cult.path === n.cult.path || o.mentorId === n.id || (Array.isArray(n.apprenticeIds) && n.apprenticeIds.includes(o.id)))) opts.push({ t: 'teach', w: (E(n, 'interests.teaching') - 30) / 25 + (o.id === (n.h.life.family.disciples || [])[0] ? 1.5 : 0) + (goal && goal.id === 'mentor_disciple' && goal.targetId === o.id ? 1.8 : 0) });
    if (bnSkSeek.length && o.rank >= 2 && o.rank > n.rank && (g.MARTIAL ? g.MARTIAL.skillRead(o, bnSkSeek[0].skill) : (o.h.skills[bnSkSeek[0].skill] || 0)) > bnSkSeek[0].current + 2) {
      opts.push({ t: 'seek_teach', w: 2.2 * (g.MARTIAL.bottleneckSkillDrive ? g.MARTIAL.bottleneckSkillDrive(n) : 1), skill: bnSkSeek[0].skill });
    }
    if (n.companionId === o.id || (r.l || 0) > 25 && E(n, 'interests.romance') > 45 || ((r.a || 0) > 45 && E(n, 'interests.romance') > 60 && E(o, 'interests.romance') > 45 && Math.abs(n.h.birthDay - o.h.birthDay) < 360 * 14)) opts.push({ t: 'date', w: (n.companionId === o.id ? 2.2 : 0.8) + (r.l || 0) / 40 });
    const defToO = g.COG && g.COG.deferenceToward ? g.COG.deferenceToward(W, n, o) : { fear: 0, deference: 0 };
    if ((r.v || 0) > 35 && (r.a || 0) < -10 && E(n, 'personality.aggression') > 45 && defToO.fear < 45) opts.push({ t: 'argue', w: 0.5 + (r.v - 30) / 30 + (E(n, 'personality.aggression') - 45) / 40 });
    const chosenOpt = W.rng.weighted(opts, x => x.w);
    type = chosenOpt.t;
    if (type === 'seek_teach') return AI.proposePair(W, o, n, 'teach', chosenOpt.skill);
    return AI.proposePair(W, n, o, type);
  };
  AI.acceptProb = (W, b, a, type) => {
    if (AI.isProtectedAction(W, b, type)) return 0;
    const r = b.h.mind.relations[a.id], c = AI.compat(b, a);
    const ri = (g.COG && g.COG.relInfo) ? g.COG.relInfo(W, b, a) : { affection: r ? r.a : 0, trust: r ? (r.t ?? 40) : 40, gratitude: r ? (r.g || 0) : 0, respect: r ? (r.r ?? 30) : 30 };
    const def = (g.COG && g.COG.deferenceToward) ? g.COG.deferenceToward(W, b, a) : { deference: 0, fear: 0, resentment: 0 };
    let p = 0.52 + c * 0.32 + ri.affection / 200 + (ri.trust - 40) / 220 + ri.gratitude / 190 + def.deference / 260 - def.resentment / 280;
    if (type === 'spar') p = 0.3 + (E(b, 'interests.combat') - 40) / 100 + (E(b, 'personality.aggression') - 40) / 160 + (E(b, 'personality.pride') - 50) / 220 + (ri.trust - 40) / 250 - (b.inj && b.inj.length ? 0.6 : 0) - (b.h.state.hp < CULT.hpMax(b) * 0.7 ? 0.4 : 0);
    if (type === 'teach') p = 0.6 + (E(b, 'personality.curiosity') - 40) / 150 + (E(b, 'personality.loyalty') - 50) / 250 + def.deference / 220 + (b.mentor === a.id ? 0.3 : 0);
    if (type === 'date') p = 0.1 + (r ? r.l / 60 + r.a / 150 : 0) + ri.gratitude / 220 + (E(b, 'interests.romance') - 40) / 120;
    if (type === 'argue') p = def.fear >= 50 ? 0.25 : 0.85;
    if (type === 'chat') p -= (E(b, 'interests.solitude') - 55) / 250 + ((b.h.state.stress > 60) ? 0.2 : 0);
    if (b.act && b.act.id === 'duty') p -= 0.35 * dutyWeight(b); if (b.act && b.act.id === 'cultivate') p -= 0.35;
    return clamp(p, 0.02, 0.97);
  };
  AI.proposePair = (W, a, b, type, forcedSkill) => {
    const responder = forcedSkill ? a : b;
    const requester = forcedSkill ? b : a;
    if (AI.isProtectedAction(W, responder, type) || W.rng.next() > AI.acceptProb(W, responder, requester, type)) {
      const r = SECT.rel(requester, responder.id); if (type === 'date') { r.l = Math.max(0, r.l - 3); HC.feel(requester, { mood: -6 }); AI.mem(W, requester, responder.h.name.given + ' ปฏิเสธคำชวน', 0.35, responder.id); } else if (type === 'spar') { r.a -= 0.5; }
      requester.cool.pair = W.t + 40; return false;
    }
    let bk, kind;
    if (type === 'spar') { bk = 'training_ground'; kind = 'spar'; }
    else if (type === 'teach') { bk = 'training_ground'; kind = 'dummy'; }
    else if (type === 'date') { bk = 'spirit_pond'; kind = 'relax'; }
    else { bk = W.rng.chance(0.6) ? 'tea_garden' : 'plaza'; kind = bk === 'tea_garden' ? 'chat' : 'stroll'; }
    const s1 = AI.freeStation(W, a, kind, bk);
    let s2 = null;
    if (s1) {
      const prevOcc = s1.occ;
      s1.occ = a.id;
      s2 = AI.freeStation(W, b, kind, bk);
      if ((!s2 || s1.id === s2.id) && type === 'teach') {
        s2 = AI.freeStation(W, b, 'spar', 'training_ground');
      }
      s1.occ = prevOcc;
    }
    if (!s1 || !s2 || s1.id === s2.id) { requester.cool.pair = W.t + 30; return false; }
    const dur = type === 'spar' ? 26 : type === 'teach' ? 100 : type === 'date' ? 70 : type === 'argue' ? 14 : 30 + Math.round(W.rng.next() * 30);
    const data = { type, partner: b.id, role: 'a', ready: false, left: dur, rounds: 0 };
    if (g.COG && g.COG.startCommitment) g.COG.startCommitment(W, a, b, type, dur);
    AI.interruptFor(W, a);
    AI.interruptFor(W, b);
    const skTgt = forcedSkill || (type === 'teach' && b.cult ? AI.pickTeachSkill(a, b) : null);
    AI.begin(W, a, 'pair', { st: s1, pair: data, skillTgt: skTgt });
    AI.begin(W, b, 'pair', { st: s2, pair: { type, partner: a.id, role: 'b', ready: false, left: dur, rounds: 0 }, skillTgt: skTgt, skill: skTgt });
    return true;
  };
  AI.pairTick = (W, n) => {
    const d = n.act.ctx.pair; const o = W.byId[d.partner];
    if (!o || o.dead || !o.act || o.act.id !== 'pair' || o.act.ctx.pair.partner !== n.id) {
      if (g.COG && g.COG.resolveCommitment) g.COG.resolveCommitment(W, n, o, 'aborted', d);
      return 'done';
    }
    const od = o.act.ctx.pair;
    if (n.act.stage !== 'do' || o.act.stage !== 'do') {
      n.act.waited = (n.act.waited || 0) + 1;
      if (n.act.waited > 120) {
        if (g.COG && g.COG.resolveCommitment) g.COG.resolveCommitment(W, n, o, 'aborted', d);
        return 'abort';
      }
      return;
    }
    d.ready = true;
    const type = d.type;
    // หันหน้าเข้าหากัน
    n.face = o.x >= n.x ? 1 : -1;
    if (d.role === 'a') {
      d.left--; od.left = d.left;
      if (type === 'chat' || type === 'date' || type === 'argue') {
        if (d.left % 8 === 0) AI.interact(W, n, o, type, 0.5);
        if (n.companionId === o.id && d.left % 10 === 0) {
          if (n.cult) CULT.gain(n, 1.2, W, 'companion_pair');
          if (o.cult) CULT.gain(o, 1.2, W, 'companion_pair');
          if (n.h && n.h.state) n.h.state.heartDemon = Math.max(0, (n.h.state.heartDemon || 0) - 0.5);
          if (o.h && o.h.state) o.h.state.heartDemon = Math.max(0, (o.h.state.heartDemon || 0) - 0.5);
        }
      }
      else if (type === 'teach') {
        if (n.act.ctx.skillTgt == null) { n.act.ctx.skillTgt = o.cult ? AI.pickTeachSkill(n, o) : 'SCRIPTURE'; }
        const sub = n.cult && CULT.sub(n), mentorBonus = sub && sub.governanceRole === 'teaching' ? clamp(n.h.skills.SCRIPTURE || 0, 0, 100) * 0.0015 : 0;
        (g.MARTIAL && g.MARTIAL.skillPractice ? g.MARTIAL.skillPractice : HC.practice)(o, n.act.ctx.skillTgt, 1 / 60, 1.7 + E(n, 'social.teaching') / 100 + mentorBonus); (g.MARTIAL && g.MARTIAL.skillPractice ? g.MARTIAL.skillPractice : HC.practice)(n, 'diplomacy', 1 / 120, 1);
        if (d.left % 10 === 0) { AI.interact(W, n, o, 'teach', 0.5); CULT.gain(o, 0.8); }
        n.merit += 0.01;
      } else if (type === 'spar') {
        if (d.left % 3 === 0) { const r = g.COMBAT.sparRound(W, n, o, d); if (r === 'end') d.left = 0; }
      }
      if (d.left <= 0) { AI.pairEnd(W, n, o, d); return 'done'; }
    } else { if (od.left <= 0) return 'done'; }
    return;
  };
  AI.pickTeachSkill = (t, s) => { const ids = ['SWORD', 'BLADE', 'SPEAR', 'FIST_PALM', 'BOW', 'STAFF', 'FOCUS', 'ZITHER', 'BRUSH', 'WHIP', 'MOVEMENT', 'BODY_REFINING', 'SOUL_DIVINE', 'POISON', 'ARRAY', 'TALISMAN', 'ALCHEMY', 'FORGING', 'SCRIPTURE', 'MEDICINE']; ids.sort((a, b) => (((t.h && t.h.skills && t.h.skills[b]) || 0) - ((s.h && s.h.skills && s.h.skills[b]) || 0) + (E(s, 'affinities.' + b) || 0) * .3) - (((t.h && t.h.skills && t.h.skills[a]) || 0) - ((s.h && s.h.skills && s.h.skills[a]) || 0) + (E(s, 'affinities.' + a) || 0) * .3)); return ids[0]; };
  AI.pairEnd = (W, a, b, d) => {
    if (g.COG && g.COG.resolveCommitment) g.COG.resolveCommitment(W, a, b, 'completed', d);
    if (b && b.cult && b.cult.track && CULT.trackReady && CULT.trackReady(b) && CULT.checkTrackGates && CULT.checkTrackGates(W, b).ok && CULT.trackBreakthrough) {
      CULT.trackBreakthrough(W, b);
    }
    if (d.type === 'spar') {
      g.COMBAT.sparEnd(W, a, b, d);
      if (g.SECT && g.SECT.SOUL_FORGE && g.SECT.SOUL_FORGE.recordWeaponFeat) {
        g.SECT.SOUL_FORGE.recordWeaponFeat(W, a, 'ประลองยุทธ์แลกเปลี่ยนกระบวนท่ากับ ' + HC.fullName(b), 12);
        g.SECT.SOUL_FORGE.recordWeaponFeat(W, b, 'ประลองยุทธ์แลกเปลี่ยนกระบวนท่ากับ ' + HC.fullName(a), 12);
      }
    }
    if (d.type === 'argue') { if (W.rng.chance(0.25 + (E(a, 'personality.aggression') + E(b, 'personality.aggression') - 90) / 300)) { W.duelQueue = W.duelQueue || []; W.duelQueue.push({ a: a.id, b: b.id, kind: 'grudge', serious: false }); W.log('conflict', a.h.name.given + ' กับ ' + b.h.name.given + ' ทะเลาะกันรุนแรงจนต้องดวลกัน', [a.id, b.id]); } else AI.mem(W, a, 'ทะเลาะกับ ' + b.h.name.given, 0.4, b.id); }
    if (d.type === 'date') { AI.mem(W, a, 'ใช้เวลาอันอบอุ่นกับ ' + b.h.name.given, 0.5, b.id); AI.mem(W, b, 'ใช้เวลาอันอบอุ่นกับ ' + a.h.name.given, 0.5, a.id); }
    if (d.type === 'teach') {
      AI.mem(W, b, 'ได้รับการสั่งสอนจาก ' + a.h.name.given, 0.4, a.id);
      if (g.SECT && g.SECT.MENTORSHIP && g.SECT.MENTORSHIP.coachDisciple) {
        g.SECT.MENTORSHIP.coachDisciple(W, a, b);
      }
    }
  };

  /* ---------- บาดเจ็บ/ตาย ---------- */
  AI.injure = (W, n, sev, why) => {
    n.inj = n.inj || [];
    const parts = ['แขน', 'ขา', 'ซี่โครง', 'ไหล่', 'ศีรษะ', 'ลำตัว'];
    const p = W.rng.pick(parts); const heal = (sev === 1 ? 3 : sev === 2 ? 9 : 24) * 1440 / (0.6 + E(n, 'physiology.recoveryRate') / 100);
    n.inj.push({ part: p, sev, why, until: heal, t: W.t });
    if (n.inj.length > 5) n.inj.shift();
    HC.feel(n, { stress: 5 * sev, mood: -6 * sev });
    if (sev >= 3 && W.rng.chance(0.3)) n.h.body.marks.push('รอยแผลที่' + p);
    HC.bump(n);
    const sevTxt = sev === 1 ? 'บาดเจ็บเล็กน้อย' : sev === 2 ? 'บาดเจ็บปานกลาง' : 'บาดเจ็บสาหัส';
    W.log('injury', n.h.name.given + ' ได้รับ' + sevTxt + ' (แผลที่' + p + (why ? ' — ' + why : '') + ')', [n.id]);
  };
  AI.healTick = (W, n) => { // ทุกชั่วโมง
    if (n.inj && n.inj.length) {
      const had = n.inj.length;
      n.inj.forEach(i => { i.until -= 60 * (0.8 + E(n, 'physiology.recoveryRate') / 100 * 0.4); });
      n.inj = n.inj.filter(i => i.until > 0);
      if (had > 0 && n.inj.length === 0 && !n.dead) {
        W.log('heal', n.h.name.given + ' ฟื้นฟูสภาพร่างกายจนหายดีจากอาการบาดเจ็บ', [n.id]);
      }
    }
  };
  AI.kill = (W, n, why) => {
    if (n.dead) return;
    if (n.cult && !n.qiTransmitted && Array.isArray(n.apprenticeIds) && n.apprenticeIds.length > 0 && g.SECT && g.SECT.MENTORSHIP && g.SECT.MENTORSHIP.transmitQi) {
      const appId = n.apprenticeIds.find(id => W.byId && W.byId[id] && !W.byId[id].dead);
      if (appId) g.SECT.MENTORSHIP.transmitQi(W, n, appId, { dyingWish: true, force: true });
    }
    AI.cancelAct(W, n);
    n.dead = true; n.deathDay = W.day; n.deathWhy = why; n.hidden = false; n.path = null;
    if (n.post) { W.sect.posts[n.post] = null; n.post = null; }
    AI.freeBed(W, n);
    const dPhrases = [
      n.h.name.given + ' เสียชีวิตลง (' + why + ') ท่ามกลางความอาลัยของศิษย์ร่วมสำนัก',
      n.h.name.given + ' สิ้นใจอย่างสงบในสำนัก (' + why + ') ละสังขารคืนสู่ฟ้าดิน',
      n.h.name.given + ' ดับขันธ์ลาโลก (' + why + ') ดวงวิญญาณหวนคืนสู่ห้วงวัฏสงสาร'
    ];
    const dTxt = dPhrases[Math.abs(((n.n || 0) + (W.t || 0)) % dPhrases.length)];
    W.log('death', dTxt, [n.id]);
    W.deaths = (W.deaths || 0) + 1;
    // ผลกระทบต่อคนใกล้ชิด
    W.npcs.forEach(o => {
      if (o.dead || o === n) return;
      const r = o.h.mind.relations[n.id];
      const isComp = o.companionId === n.id || (r && r.bond === 'TAOIST_COMPANION');
      if (isComp || (r && (r.a > 40 || r.bond === 'สหาย' || r.bond === 'คนรัก' || r.bond === 'คู่ครอง' || r.bond === 'อาจารย์' || r.bond === 'ศิษย์'))) {
        HC.experience(o, 'lost_loved', isComp ? 1.8 : clamp((r ? r.a : 50) / 70, 0.3, 1.5));
        AI.mem(W, o, (isComp ? 'คู่บำเพ็ญร่วมสาบาน ' : '') + n.h.name.given + ' เสียชีวิต (' + why + ')', 1, n.id);
        o.grief = (o.grief || 0) + (isComp ? 8 : 4);
        if (isComp && o.h && o.h.state) {
          o.h.state.heartDemon = clamp((o.h.state.heartDemon || 0) + 15, 0, 100);
        }
        if (g.SECT && g.SECT.HEART_DEMON && g.SECT.HEART_DEMON.spawnFromCause && (isComp || (r && (r.a >= 65 || r.bond === 'อาจารย์' || r.bond === 'อาจารย์สายตรง' || r.bond === 'ศิษย์สายตรง')))) {
          g.SECT.HEART_DEMON.spawnFromCause(W, o, 'BEREAVEMENT_GRIEF', {
            sourceNpc: n,
            why
          });
        }
      } else if (o.rank >= 1) {
        HC.experience(o, 'saw_death', 0.2);
      }
    });
    if (g.SECT && g.SECT.SOUL_FORGE && g.SECT.SOUL_FORGE.inheritSentientWeaponOnDeath && n.equip && n.equip.WEAPON && n.equip.WEAPON.weaponSpirit) {
      g.SECT.SOUL_FORGE.inheritSentientWeaponOnDeath(W, n);
    }
    if (n.id === W.sect.masterId) { SECT.succession(W, 'เจ้าสำนักเสียชีวิต'); }
    if (n.id === W.sect.deputyId) W.sect.deputyId = null;
    if (g.WILD_RES) g.WILD_RES.releaseClaim(W, n);
    if (g.CPE && g.CPE.retireNpc) g.CPE.retireNpc(W, n, 'เสียชีวิต');
    // ทรัพย์สินกลับสำนัก
    ECO.earn(W, Math.round((n.inv.stones || 0) * 0.5), 'มรดกของ ' + n.h.name.given); n.inv.stones = 0;
    for (const k in (n.inv.pills || {})) ECO.add(W, k, n.inv.pills[k]); n.inv.pills = {};
    for (const p of (n.inv.craftedPills || [])) if (p && p.key && p.qty > 0) ECO.add(W, p.key, p.qty); n.inv.craftedPills = [];
    for (const k in (n.inv.mats || {})) ECO.add(W, k, n.inv.mats[k]); n.inv.mats = {};
    for (const id of (n.inv.techs || [])) if (CULT.tech(id) && !W.sect.library.includes(id)) W.sect.library.push(id); n.inv.techs = [];
    for (const id of (n.inv.recipes || [])) if (ECO.recipeById[id] && !W.sect.knownRecipes.includes(id)) { W.sect.knownRecipes.push(id); if (W.world && W.world.contentMetrics) W.world.contentMetrics.formulas++; } n.inv.recipes = [];
    if (g.MARTIAL) g.MARTIAL.returnKnowledge(W, n);
    for (const k in n.equip) { if (n.equip[k]) W.sect.gear.push(n.equip[k]); } n.equip = {};
    if (n.inv && Array.isArray(n.inv.gear)) { for (const g2 of n.inv.gear) { if (g2) W.sect.gear.push(g2); } n.inv.gear = []; }
    if (g.VC && g.VC.syncUniqueArtifacts) g.VC.syncUniqueArtifacts(W);
    W.sect.fallen = (W.sect.fallen || []); W.sect.fallen.push({ id: n.id, name: n.h.name.family + n.h.name.given, day: W.day, why, rank: n.rank, path: n.cult ? n.cult.path : null, sub: n.cult ? n.cult.sub : null, stage: n.cult ? n.cult.stage : 0 });
    if (SECT && SECT.inscribeLegacyTablet) SECT.inscribeLegacyTablet(W, n, why);
  };

  /* ---------- วงจรกิจกรรม ---------- */
  AI.cancelAct = (W, n) => { AI.release(W, n); if (g.WILD_RES) g.WILD_RES.releaseClaim(W, n); n.act = { id: 'idle', stage: 'do', left: 0, total: 0, ctx: {}, why: [] }; n.path = null; };
  AI.interruptFor = (W, n) => { if (g.WILD_RES) g.WILD_RES.releaseClaim(W, n); if (n.act && n.act.id !== 'idle') { const a = A[n.act.id]; if (a && a.cleanup) a.cleanup(n, W); AI.release(W, n); } n.path = null; };

  AI.begin = (W, n, id, w, why) => {
    const a = A[id];
    AI.release(W, n);
    const ctx = Object.assign({}, w);
    n.act = { id, stage: 'move', left: 0, total: 0, ctx, why: why || [], started: W.t, st: null, waited: 0 };
    if (w.st) AI.reserve(W, n, w.st);
    const tx = w.st ? w.st.x : (w.pos ? w.pos.x : n.x), ty = w.st ? w.st.y : (w.pos ? w.pos.y : n.y);
    if (w.st && w.st.inside) { const b = W.map.buildings[w.st.bid]; ctx.tx = b.door.x; ctx.ty = b.door.y; } else { ctx.tx = tx; ctx.ty = ty; }
    ctx.inside = !!(w.st && w.st.inside);
    const dist = Math.hypot(ctx.tx + 0.5 - n.x, ctx.ty + 0.5 - n.y);
    if (dist < 0.9) { n.path = null; AI.arrive(W, n); }
    else if (!AI.goTo(W, n, ctx.tx, ctx.ty)) { AI.cancelAct(W, n); n.cool[id] = W.t + 60; return false; }
    n.recent.push(id); if (n.recent.length > 6) n.recent.shift();
    return true;
  };
  AI.arrive = (W, n) => {
    const ac = n.act, a = A[ac.id], ctx = ac.ctx;
    ac.stage = 'do';
    if (ctx.inside) { n.hidden = true; }
    if (ac.id !== 'pair' && a.start && !ac.started2) { ac.started2 = true; if (a.start(n, W, ctx) === false) { AI.cancelAct(W, n); n.cool[ac.id] = W.t + 45; return; } }
    ac.total = ac.id === 'pair' ? 9999 : (a.dur ? a.dur(n, W, ctx) : 60); ac.left = ac.total;
  };

  const _FastS = { u: 0, _fast: true, add(_, v) { this.u += v; return this; } };
  function _buildWhy(W, n, id, recLen, lastRec, repPenBase) {
    const S = Sc();
    A[id].score(n, W, S);
    if (g.COG) g.COG.modifiers(W, n, id, S);
    if (recLen && id !== 'pair') {
      const rec = n.recent;
      let rep = 0; for (let ri = 0; ri < recLen; ri++) if (rec[ri] === id) rep++;
      if (rep) {
        if (lastRec === id && g.COG && g.COG.isContinuingProductiveWork && g.COG.isContinuingProductiveWork(W, n, id)) {
          S.add('ทำต่อเนื่องให้สำเร็จ', 0.24);
        } else {
          S.add('ทำบ่อยแล้ว', repPenBase * rep);
        }
      }
    }
    return S.why.sort((p, q) => Math.abs(q[1]) - Math.abs(p[1])).slice(0, 4);
  }
  AI.decide = (W, n) => {
    if (g.COG) g.COG.prepare(W, n);
    const cands = [];
    const rec = n.recent, recLen = rec ? rec.length : 0, lastRec = recLen ? rec[recLen - 1] : null;
    const repPenBase = recLen ? (-0.16 * (1 - E(n, 'personality.discipline') / 200)) : 0;
    for (const id in A) {
      if (id === 'hide' || id === 'pair') continue;
      const a = A[id];
      if (n.cool[id] && n.cool[id] > W.t) continue;
      if (a.can && !a.can(n, W)) continue;
      _FastS.u = 0;
      a.score(n, W, _FastS);
      if (g.COG) g.COG.modifiers(W, n, id, _FastS);
      if (recLen) {
        let rep = 0; for (let ri = 0; ri < recLen; ri++) if (rec[ri] === id) rep++;
        if (rep) {
          if (lastRec === id && g.COG && g.COG.isContinuingProductiveWork && g.COG.isContinuingProductiveWork(W, n, id)) {
            _FastS.u += 0.24;
          } else {
            _FastS.u += repPenBase * rep;
          }
        }
      }
      cands.push({ id, u: _FastS.u });
    }
    // กิจกรรมคู่ (พบปะ)
    if (!(n.cool.pair > W.t)) { _FastS.u = 0; A.pair.score(n, W, _FastS); if (g.COG) g.COG.modifiers(W, n, 'pair', _FastS); cands.push({ id: 'pair', u: _FastS.u }); }
    // ผู้ตัดสินเลือก: softmax ตามนิสัย
    const temp = g.COG ? g.COG.choiceTemperature(n) : clamp(0.12 + E(n, 'temperament.sensationSeeking') / 600 + E(n, 'personality.creativity') / 900 - E(n, 'personality.discipline') / 700 + E(n, 'temperament.emotionalReactivity') / 1000, 0.05, 0.4);
    cands.sort((x, y) => y.u - x.u);
    const top = cands.slice(0, 6);
    const mx = top[0].u;
    const order = []; const pool = top.slice();
    while (pool.length) { const pick = W.rng.weighted(pool, c => Math.exp((c.u - mx) / temp)); order.push(pick); pool.splice(pool.indexOf(pick), 1); }
    // Defect #2 Fix: If all top-6 stations are occupied, allow up to 2 valid fallbacks from remaining candidates
    if (cands.length > 6) {
      const rest = cands.slice(6).filter(c => c.u > -0.5);
      for (let i = 0; i < Math.min(2, rest.length); i++) order.push(rest[i]);
    }
    n.lastScores = cands.slice(0, 7).map(x => ({ id: x.id, u: Math.round(x.u * 100) / 100 }));
    for (const c of order) {
      if (c.id === 'pair') {
        const why = _buildWhy(W, n, 'pair', recLen, lastRec, repPenBase);
        if (AI.socialStart(W, n)) { n.why = why; if(g.COG)g.COG.chosen(W,n,'pair',why); return true; }
        n.cool.pair = W.t + 45; continue;
      }
      const a = A[c.id]; const w = a.where ? a.where(W, n) : { pos: { x: n.x, y: n.y } };
      if (!w) {
        if(g.COG)g.COG.blocked(W,n,c.id);
        if (g.SECT && g.SECT.recordFacilityDemand) g.SECT.recordFacilityDemand(W, c.id, 'failed_station', n);
        n.cool[c.id] = W.t + 25;
        continue;
      }
      const why = _buildWhy(W, n, c.id, recLen, lastRec, repPenBase);
      if (AI.begin(W, n, c.id, w, why)) { n.why = why; if(g.COG)g.COG.chosen(W,n,c.id,why); return true; }
    }
    n.act = { id: 'idle', stage: 'do', left: 20, total: 20, ctx: {}, why: [] };
    n.why = [];
    return false;
  };

  /* ความต้องการ + ผลคงที่ของร่างกายทุกนาที */
  function getNeedsRates(n) {
    const nd = n._nd, c = n.cult, p = n.h.physiology;
    const cStage = c ? c.stage : 0, cTr = c && c.track ? c.track.ordinal : 0, passVer = (n._passVer || 0) + (c && c.techs ? c.techs.length * 1024 : 0), skVer = n._cbSkillVer || 0, eqA = n.equip ? n.equip.ARMOR : null, bLen = n.buffs ? n.buffs.length : 0, bLast = bLen ? n.buffs[bLen - 1] : null;
    if (nd && nd.ver === n._ver && nd.skVer === skVer && nd.day === HC.nowDay && nd.cStage === cStage && nd.cTr === cTr && nd.passVer === passVer && nd.eqA === eqA && nd.bLen === bLen && nd.bLast === bLast) return nd;
    const vit = E(n, 'physiology.vitality') | 0, tuf = p.toughness | 0, str = p.strength | 0, mLen = n.mods ? n.mods.length : 0;
    const eqStage = (g.CULT && g.CULT.equivalentStage) ? g.CULT.equivalentStage(n) : (cStage || 0);
    const next = {
      day: HC.nowDay,
      ver: n._ver,
      skVer,
      cStage,
      cTr,
      eqStage,
      passVer,
      eqA,
      bLen,
      bLast,
      mLen,
      vit,
      tuf,
      str,
      met: 0.82 + (100 - (E(n, 'physiology.vitality') | 0)) / 300 + (cStage ? 0.06 * cStage : 0),
      socD: 0.016 * (0.5 + E(n, 'temperament.sociability') / 100),
      novD: 0.008 * (0.5 + E(n, 'temperament.sensationSeeking') / 100),
      optBase: 8 + (E(n, 'temperament.optimism') - 50) * 0.35,
      strD: 0.004 * (0.5 + E(n, 'personality.composure') / 100),
      recK: 0.00012 * (0.5 + E(n, 'physiology.recoveryRate') / 100),
      qiMax: cStage ? CULT.qiMax(n) : 0,
      hpMax: CULT.hpMax(n),
      restDrainMult: eqStage > 0 ? (1 / (1 + eqStage * 0.75 + Math.pow(Math.max(0, eqStage - 3), 1.5) * 0.45)) : 1.0
    };
    n._nd = next;
    return next;
  }
  AI.needs = (W, n) => {
    const s = n.h.state, f = n.h.fulfil, id = n.act.id, nr = getNeedsRates(n);
    s.satiety = Math.max(0, s.satiety - 0.075 * nr.met * (id === 'sleep' ? 0.5 : 1));
    if (id !== 'sleep') {
      if (id === 'cultivate' && nr.eqStage > 0) {
        // บำเพ็ญภาวนาคือการพักผ่อนขัดเกลาจิตวิญญาณ ไม่สูญเสียการพักผ่อน ยิ่งระดับสูงยิ่งฟื้นฟูสมาธิและการพักผ่อน
        const focusVal = (n.h && n.h.intellect && Number.isFinite(n.h.intellect.focus)) ? n.h.intellect.focus : 50;
        const medRestRecovery = (0.025 + nr.eqStage * 0.02) * (0.8 + focusVal / 250);
        s.rest = Math.min(100, s.rest + medRestRecovery);
        s.energy = Math.min(100, s.energy + 0.02 + nr.eqStage * 0.01);
      } else {
        const drainMult = nr.restDrainMult != null ? nr.restDrainMult : 1.0;
        s.rest = Math.max(0, s.rest - 0.085 * drainMult * (1 + (id === 'practice' || id === 'mine' || id === 'farm' ? 0.35 : 0)));
        s.energy = Math.min(100, s.energy + (id === 'idle' || id === 'leisure' || id === 'eat' ? 0.07 : 0.015));
      }
    }
    if (id !== 'pair' && id !== 'festival') { s.social = Math.max(0, s.social - nr.socD); s.loneliness = clamp(s.loneliness + (s.social < 35 ? 0.012 : -0.004), 0, 100); }
    s.novelty = Math.max(0, s.novelty - nr.novD);
    if (f.familyClan > 0) f.familyClan = Math.max(0, f.familyClan - 0.0042);
    if (f.sectDuty > 0) f.sectDuty = Math.max(0, f.sectDuty - 0.0042);
    if (f.martialPeak > 0) f.martialPeak = Math.max(0, f.martialPeak - 0.0042);
    if (f.knowledgeCraft > 0) f.knowledgeCraft = Math.max(0, f.knowledgeCraft - 0.0042);
    if (f.freedom > 0) f.freedom = Math.max(0, f.freedom - 0.0042);
    if (f.wealthResource > 0) f.wealthResource = Math.max(0, f.wealthResource - 0.0042);
    if (f.powerStatus > 0) f.powerStatus = Math.max(0, f.powerStatus - 0.0042);
    if (f.honorLegacy > 0) f.honorLegacy = Math.max(0, f.honorLegacy - 0.0042);
    // อารมณ์เลื่อนเข้าหาพื้นฐาน
    const base = nr.optBase - s.stress * 0.25 - Math.max(0, 30 - s.satiety) * 0.3 - Math.max(0, 30 - s.rest) * 0.2 + (n.sat != null ? (n.sat - 55) * 0.12 : 0);
    s.mood += (base - s.mood) * 0.002;
    s.stress = Math.max(0, s.stress - nr.strD);
    s.anger = Math.max(0, s.anger - 0.03); s.fear = Math.max(0, s.fear - 0.05);
    if (n.jail && n.jail > W.t && s.satiety < 40 && ECO.take(W, 'meal', 1)) s.satiety = Math.min(100, s.satiety + 60);
    // หิวจัด/ขาดการพักผ่อนทำลายสุขภาพ
    if (s.satiety <= 2) { s.hp -= 0.12; s.stress += 0.02; if (W.t % 720 === 0 && s.hp < 5) AI.kill(W, n, 'อดอยาก'); }
    if (s.rest <= 1) { s.energy = Math.max(0, s.energy - 0.05); }
    // ฟื้นฟูทั่วไป
    if (id !== 'sleep' && id !== 'heal') { const hm = nr.hpMax; if (s.hp < hm && s.satiety > 15) s.hp = Math.min(hm, s.hp + hm * nr.recK); }
    if (s.hp <= 0 && !n.dead) { AI.kill(W, n, n.lastHurtBy ? 'บาดเจ็บสาหัส' : 'อาการทรุด'); }
    // ปราณฟื้น
    if (n.cult && id !== 'cultivate' && s.qi < nr.qiMax) s.qi = Math.min(nr.qiMax, s.qi + ((n.buffs && n.buffs.length && g.STATS && g.STATS.hasBuff && g.STATS.hasBuff(n, 'qiConduit', W.t)) ? 0.22 : 0.12));
    if (n.foodBuff && g.FISHING) g.FISHING.tickFoodBuff(W, n);
  };

  AI.interrupt = (W, n) => { // ตรวจเหตุขัดจังหวะ (ทุก 5 นาที)
    const s = n.h.state, id = n.act.id, cool = n.cool;
    if (n.jail && n.jail > W.t && id !== 'sentence') { AI.interruptFor(W, n); n.act = { id: 'idle', stage: 'do', left: 0, total: 0, ctx: {}, why: [['ถูกคุมขัง', 9]] }; return true; }
    if (id === 'breakthrough' || id === 'fight' || id === 'sentence') return false;
    const hm = n._nd ? n._nd.hpMax : CULT.hpMax(n);
    if (s.satiety < (id === 'sleep' ? 8 : 24) && id !== 'eat' && !(cool && cool.eat > W.t) && ECO.count(W, 'meal') > 0) { if (AI.freeStation(W, n, 'eat', 'canteen')) return true; if (g.SECT && g.SECT.recordFacilityDemand) g.SECT.recordFacilityDemand(W, 'eat', 'failed_station', n); if (cool) cool.eat = W.t + 25; }
    const eqStage = n._nd ? n._nd.eqStage : ((g.CULT && g.CULT.equivalentStage) ? g.CULT.equivalentStage(n) : 0);
    if (id === 'sleep' && s.rest < (eqStage >= 1 ? 50 : 70) && isNight(hourOf(W))) return false;
    if (s.hp < hm * 0.35 && id !== 'heal' && id !== 'sleep' && id !== 'eat' && !(cool && cool.heal > W.t)) { if (AI.freeStation(W, n, 'patient', 'infirmary')) return true; if (g.SECT && g.SECT.recordFacilityDemand) g.SECT.recordFacilityDemand(W, 'heal', 'failed_station', n); if (cool) cool.heal = W.t + 25; }
    if (s.rest < 6 && id !== 'sleep' && id !== 'eat' && id !== 'heal' && !(cool && cool.sleep > W.t)) return true;
    if (W.sect.festival && W.sect.festival.until > W.t && id !== 'festival' && id !== 'eat' && id !== 'sleep' && W.sect.festival.startAt === W.t) return true;
    return false;
  };

  /* ---------- ขั้นประมวลผลต่อนาทีของ NPC ---------- */
  AI.step = (W, n) => {
    if (n.dead || n.away || n.exiled) return;
    n.px = n.x; n.py = n.y;
    AI.needs(W, n);
    if (n.dead) return;
    const ac = n.act;
    if (!ac) { n.act = { id: 'idle', stage: 'do', left: 0, total: 0, ctx: {}, why: [] }; n.why = []; return; }
    if (ac.id === 'fight') { g.COMBAT.fightStep(W, n); return; }
    if ((W.t + n.n) % 5 === 0 && ac.id !== 'idle' && AI.interrupt(W, n)) { AI.interruptFor(W, n); n.act = { id: 'idle', stage: 'do', left: 0, total: 0, ctx: {}, why: [] }; n.why = []; return; }
    if (ac.id === 'idle') {
      if (ac.left > 0) { ac.left--; if (n.path) AI.stepMove(W, n); return; }
      AI.decide(W, n); return;
    }
    if (ac.stage === 'move') {
      if (AI.stepMove(W, n)) AI.arrive(W, n);
      else if (++ac.waited > 600) { AI.cancelAct(W, n); }
      return;
    }
    // stage 'do'
    const a = A[ac.id];
    let res;
    if (ac.id === 'pair') res = AI.pairTick(W, n);
    else { ac.left--; if (a.tick) res = a.tick(n, W, ac.ctx); }
    if (res === 'abort') { AI.release(W, n); n.cool.pair = W.t + 60; n.act = { id: 'idle', stage: 'do', left: 0, total: 0, ctx: {}, why: [] }; n.why = []; return; }
    if (res === 'done' || (ac.id !== 'pair' && ac.left <= 0)) {
      if (a.done) a.done(n, W, ac.ctx);
      if(g.COG)g.COG.finished(W,n,ac.id);
      if (ac.id !== 'pair') n.cool[ac.id] = W.t + (a.cooldown || 0);
      AI.release(W, n); n.hidden = false;
      n.act = { id: 'idle', stage: 'do', left: 0, total: 0, ctx: {}, why: [] };
      n.why = [];
      if (ac.id === 'pair') n.cool.pair = W.t + 60;
    }
  };

  g.AI = AI;
  if (typeof module === 'object' && module.exports) module.exports = AI;
})(typeof globalThis !== 'undefined' ? globalThis : this);
