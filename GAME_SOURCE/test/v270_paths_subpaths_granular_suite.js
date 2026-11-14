'use strict';

const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const g = require('./load.js');
const { SIM, SECT, COMBAT, CULT, ECO, AI, HC, JD, STATS, SK: SKILLS, EXPLORE, FISHING, EXPED, EXT } = g;

function check(cond, msg) {
  if (!cond) throw new Error('FAIL: ' + msg);
}

function makeNpc(W, opts) {
  opts = opts || { stage: 3, rank: 2 };
  const n = SIM.addNpc(W, opts);
  if (n.cult && (opts.path || opts.sub)) {
    if (opts.path) n.cult.path = opts.path;
    const foundSub = Array.isArray(CULT && CULT.subList) ? CULT.subList.find(x => x && x.path === n.cult.path && x.sub && x.sub.id) : null;
    n.cult.sub = opts.sub || (foundSub && foundSub.sub.id) || 'NONE';
    if (opts.stage != null) n.cult.stage = opts.stage;
    if (CULT && CULT.initTrack && n.cult.sub && n.cult.sub !== 'NONE') {
      n.cult.track = CULT.initTrack(n.cult.sub, Math.max(1, n.cult.stage || 1), (W && W.day) || 1);
    }
  }
  if (g.MARTIAL && g.MARTIAL.reconcileInnate && n.cult) g.MARTIAL.reconcileInnate(n, W);
  if (CULT && CULT.reconcilePassives) CULT.reconcilePassives(n);
  if (g.ELEM && g.ELEM.syncSpecialAccess && n.cult) g.ELEM.syncSpecialAccess(n);
  if (CULT && CULT.ensurePathGauge) CULT.ensurePathGauge(n);
  if (CULT && CULT.SECONDARY_RESOURCES && CULT.SECONDARY_RESOURCES.ensureState) CULT.SECONDARY_RESOURCES.ensureState(n);
  if (CULT && CULT.GRAND_DAO_MECHANICS && CULT.GRAND_DAO_MECHANICS.ensureNpcState) CULT.GRAND_DAO_MECHANICS.ensureNpcState(W, n);
  if (STATS && STATS.dirty) STATS.dirty(n);
  if (n.cult && CULT && CULT.isZeroQiSamurai && CULT.isZeroQiSamurai(n) && n.h && n.h.state) {
    n.h.state.qi = 0;
    n.h.state.maxQi = 0;
  } else if (n.cult && CULT && CULT.qiMax && n.h && n.h.state) {
    n.h.state.qi = CULT.qiMax(n);
  }
  if (n.cult && CULT && CULT.hpMax && n.h && n.h.state) n.h.state.hp = CULT.hpMax(n);
  n.x = opts.x != null ? opts.x : 10;
  n.y = opts.y != null ? opts.y : 10;
  return n;
}

function makeFoe(id, x, y, opts) {
  const o = opts || {};
  const maxHp = o.hpMax != null ? o.hpMax : 500;
  return Object.assign({
    id: id || 'FOE_1',
    name: 'ศัตรูทดสอบ',
    foe: true,
    tier: 3,
    hpMax: maxHp,
    hp: maxHp,
    x: x != null ? x : 12,
    y: y != null ? y : 10,
    px: x != null ? x : 12,
    py: y != null ? y : 10,
    atk: 45,
    matk: 45,
    def: 20,
    mdef: 20,
    acc: 95,
    eva: 5,
    crit: 5,
    critDmg: 150,
    cast: 100,
    move: 100,
    h: { state: { hp: 500, qi: 200, energy: 100 }, skills: {} },
    sx: [],
    buffs: [],
    act: { id: 'fight', ctx: {} }
  }, opts || {});
}

// =========================================================================
// GROUP 1: Autonomy Lock, Core Lock & Stats Unmet Condition Leak
// =========================================================================
{
  check(HC.FINGERPRINT === '155:2f9c9dd7', 'HC.FINGERPRINT must stay 155:2f9c9dd7');
  const hcBytes = fs.readFileSync(path.resolve(__dirname, '../js/human_core.js'));
  const hcSha = crypto.createHash('sha256').update(hcBytes).digest('hex');
  check(hcSha === 'a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542', 'human_core.js SHA-256 must stay byte-identical');

  const uiSrc = fs.readFileSync(path.resolve(__dirname, '../js/ui.js'), 'utf8');
  check(!uiSrc.includes('data-do="demo-mantra-resonance"'), 'ui.js must not render data-do="demo-mantra-resonance" button');

  const W = SIM.create('v270-granular-g1');
  const gatedTech = (JD.TECH && JD.TECH.techniques || []).find(t =>
    t && t.cat === 'COMBAT_TECHNIQUE' && (t.tier || 0) >= 2 && Array.isArray(t.weaponTypes) && t.weaponTypes.length > 0 && !t.weaponTypes.includes('FIST') && (!t.legendary || t.requiresWeapon)
  );
  check(!!gatedTech, 'Must find a weapon-conditioned COMBAT_TECHNIQUE in catalog');

  const nLocked = makeNpc(W, { stage: 5, rank: 2, path: (gatedTech.path && gatedTech.path !== 'ANY') ? gatedTech.path : 'XIAN' });
  nLocked.equip = { WEAPON: null, ARMOR: null, ACCESSORY: null };
  nLocked.cult.tm = {};
  nLocked.cult.techs = [];
  STATS.dirty(nLocked);
  check(!g.MARTIAL.conditionMatches(nLocked, gatedTech), `Unarmed NPC must fail conditionMatches for ${gatedTech.id}`);
  const stWithoutTech = Object.assign({}, STATS.get(nLocked));

  nLocked.cult.tm[gatedTech.id] = 5;
  nLocked.cult.techs = [gatedTech.id];
  STATS.dirty(nLocked);
  const stWithLockedTech = Object.assign({}, STATS.get(nLocked));
  check(
    Math.abs((stWithLockedTech.atk || 0) - (stWithoutTech.atk || 0)) < 1e-6 &&
    Math.abs((stWithLockedTech.matk || 0) - (stWithoutTech.matk || 0)) < 1e-6 &&
    Math.abs((stWithLockedTech.def || 0) - (stWithoutTech.def || 0)) < 1e-6,
    `Unmet COMBAT_TECHNIQUE condition (${gatedTech.id}) must NOT leak atk/matk/def bonuses`
  );

  const reqWpnType = gatedTech.weaponTypes[0];
  const matchWpn = Object.values(ECO.itemById || {}).find(eq => eq && eq.slot === 'WEAPON' && (eq.gearType === reqWpnType || g.MARTIAL.gearType(eq) === reqWpnType) && (eq.minStage || 1) <= 5);
  check(!!matchWpn, `Must find matching ${reqWpnType} equipment for ${gatedTech.id}`);
  nLocked.equip.WEAPON = matchWpn;
  delete nLocked.cult.tm[gatedTech.id];
  nLocked.cult.techs = [];
  STATS.dirty(nLocked);
  const stMatchedNoTech = Object.assign({}, STATS.get(nLocked));

  nLocked.cult.tm[gatedTech.id] = 5;
  nLocked.cult.techs = [gatedTech.id];
  STATS.dirty(nLocked);
  const stMatchedWithTech = Object.assign({}, STATS.get(nLocked));
  const matchedGain = ((stMatchedWithTech.atk || 0) - (stMatchedNoTech.atk || 0))
    + ((stMatchedWithTech.matk || 0) - (stMatchedNoTech.matk || 0))
    + ((stMatchedWithTech.def || 0) - (stMatchedNoTech.def || 0));
  check(matchedGain > 0, `Matched COMBAT_TECHNIQUE (${gatedTech.id}) must grant positive stats (gain=${matchedGain})`);
}

// =========================================================================
// GROUP 2: Meridians, Chrono Rewind, Ancestral Rite & Dungeon Recruitment
// =========================================================================
{
  const W = SIM.create('v270-granular-g2');

  // 2.1 Meridian breakthrough post-init (MORTAL_INITIATION)
  const mNpc = makeNpc(W, { stage: 0, rank: 0 });
  mNpc.cult = null;
  mNpc.secondaryResources = null;
  const mRes = CULT.MORTAL_INITIATION.triggerMeridianBreakthrough(W, mNpc, { path: 'SWORD', force: true, ignoreLibraryLock: true, quiet: true });
  check(mRes && (mRes.ok || mNpc.cult), 'Meridian breakthrough must execute cleanly');
  check(!!mNpc.secondaryResources, 'triggerMeridianBreakthrough must initialize SECONDARY_RESOURCES state');
  check(
    !!CULT.MANTRA_SYSTEM.ensureState(mNpc).whyTh &&
    !!CULT.DEFENSIVE_ARTS.ensureState(mNpc).whyTh &&
    !!CULT.SUPPORT_ARTS.ensureState(mNpc).whyTh,
    'triggerMeridianBreakthrough must evaluate autonomous postures'
  );

  // 2.2 CHRONO_EPOCH snapshot & cooldown-gated temporal rewind
  const cNpc = makeNpc(W, { stage: 4, rank: 2, path: 'CHRONO_EPOCH' });
  const cMax = CULT.hpMax(cNpc);
  cNpc.h.state.hp = cMax;
  const enemy = makeFoe('F_CHRONO', 11, 10);
  const fightC = COMBAT.startFight(W, [cNpc.id], [enemy.id], 'duel', { serious: true });
  W.foes = [enemy];
  COMBAT.applyDamage(W, fightC, enemy, cNpc, Math.round(cMax * 0.35), 'test-hit');
  const stGd = cNpc.grandDaoState;
  check(stGd && Array.isArray(stGd.hpSnapshots) && stGd.hpSnapshots.length >= 1, 'CHRONO_EPOCH taking damage must record pre-damage HP snapshot');
  const hpAfterHit = cNpc.h.state.hp;
  W.t = 100;
  if (cNpc.pathGauge) cNpc.pathGauge.value = Math.max(cNpc.pathGauge.value || 0, 40);
  if (stGd._lastHpRewindAt != null) delete stGd._lastHpRewindAt;
  delete cNpc._temporalRewindCdUntil;
  delete cNpc._temporalRewindLastTick;
  const rw1 = CULT.GRAND_DAO_MECHANICS.triggerTemporalRewind(W, cNpc, { quiet: true });
  check(rw1 && rw1.ok !== false && cNpc.h.state.hp > hpAfterHit, 'triggerTemporalRewind must restore bounded recent HP');
  check((cNpc.h.state.hp - hpAfterHit) <= Math.ceil(cMax * 0.21) + 2, 'triggerTemporalRewind HP restore must stay bounded <= ~20% hpMax');
  const hpAfterRw1 = cNpc.h.state.hp;
  cNpc.h.state.hp = Math.max(10, hpAfterRw1 - 20);
  W.t = 105; // inside 12-tick cooldown
  const hpPreRw2 = cNpc.h.state.hp;
  CULT.GRAND_DAO_MECHANICS.triggerTemporalRewind(W, cNpc, { quiet: true });
  check(cNpc.h.state.hp === hpPreRw2, 'triggerTemporalRewind must enforce 12-tick HP rewind cooldown');

  // 2.3 ANCESTRAL_RITUAL ancestor factor
  const aNpc0 = makeNpc(W, { stage: 4, rank: 2, path: 'ANCESTRAL_RITUAL' });
  const aNpc3 = makeNpc(W, { stage: 4, rank: 2, path: 'ANCESTRAL_RITUAL' });
  W.sect.ancestors = [];
  if (aNpc0.pathGauge) aNpc0.pathGauge.value = 0;
  const rite0 = CULT.GRAND_DAO_MECHANICS.invokeAncestralRite(W, aNpc0);
  W.sect.ancestors = [{ id: 'ANC_1', nameTh: 'บรรพชน 1' }, { id: 'ANC_2', nameTh: 'บรรพชน 2' }, { id: 'ANC_3', nameTh: 'บรรพชน 3' }];
  if (aNpc3.pathGauge) aNpc3.pathGauge.value = 0;
  const rite3 = CULT.GRAND_DAO_MECHANICS.invokeAncestralRite(W, aNpc3);
  check(rite3 && rite3.ancestorCount === 3, `invokeAncestralRite must report ancestorCount=3 (got ${rite3 && rite3.ancestorCount})`);
  check(rite3.riteFervor > rite0.riteFervor, 'W.sect.ancestors must increase riteFervor');
  check(
    rite3.blessing.breakthroughBonus > rite0.blessing.breakthroughBonus && rite3.blessing.breakthroughBonus <= 0.22,
    'blessing.breakthroughBonus must scale with ancestors and stay capped <= 0.22'
  );
  const g0 = aNpc0.pathGauge ? aNpc0.pathGauge.value : 0;
  const g3 = aNpc3.pathGauge ? aNpc3.pathGauge.value : 0;
  check(g3 > g0, `invokeAncestralRite with ancestors must gain extra pathGauge (g3=${g3} > g0=${g0})`);

  // 2.4 SECT.handleDungeonPrisoner RECRUIT_DEFECTOR full init + zero-Qi SHADOW_SAMURAI parity
  const pris = SECT.capturePrisoner(W, { name: 'ยอดซามูไรเชลย', sectId: 'S0', stage: 4, path: 'SHADOW_SAMURAI', sub: 'SHADOW_SAMURAI' });
  const beforeCount = W.npcs.length;
  const recRes = SECT.handleDungeonPrisoner(W, pris.id, 'RECRUIT_DEFECTOR', { quiet: true });
  check(recRes && recRes.ok, 'RECRUIT_DEFECTOR must succeed');
  check(W.npcs.length === beforeCount + 1, 'RECRUIT_DEFECTOR must add recruited NPC to W.npcs');
  const recruited = W.npcs[W.npcs.length - 1];
  check(recruited && recruited.cult && recruited.cult.stage === 4, `Recruited prisoner must keep stage=4 via proper CULT.initTrack arg order (got ${recruited && recruited.cult && recruited.cult.stage})`);
  check(
    !!recruited.secondaryResources &&
    !!CULT.MANTRA_SYSTEM.ensureState(recruited).whyTh &&
    !!CULT.DEFENSIVE_ARTS.ensureState(recruited).whyTh,
    'Recruited prisoner must get secondaryResources & autonomous postures initialized'
  );
  if (recruited.cult.path === 'SHADOW_SAMURAI') {
    check(recruited.h.state.qi === 0 && (recruited.h.state.maxQi === 0 || CULT.qiMax(recruited) === 0), 'Recruited SHADOW_SAMURAI must preserve zero-Qi state');
  }
}

// =========================================================================
// GROUP 3: Combat Fixes (GravityCrush, ApplyDamage, Marionette, Fortune, Samurai, Slay, Leave)
// =========================================================================
{
  const W = SIM.create('v270-granular-g3');
  W.t = 50;
  W.foeById = W.foeById || {};
  W.foes = W.foes || [];
  const regFoe = (id, x, y, o) => {
    const z = makeFoe(id, x, y, o);
    W.foes.push(z);
    W.foeById[z.id] = z;
    return z;
  };

  // 3.1 gravityCrush in moveToward (foeStep) and blink suppression
  const runnerFast = regFoe('FOE_FAST', 30, 10, { move: 100 });
  const runnerSlow = regFoe('FOE_SLOW', 30, 10, { move: 100 });
  const targetA = makeNpc(W, { stage: 3, rank: 2, x: 10, y: 10 });
  const fMove = COMBAT.startFight(W, [targetA.id], [runnerFast.id, runnerSlow.id], 'duel', {});
  runnerFast.act = { id: 'fight', ctx: { fid: fMove.id, target: targetA.id, cd: 99 } };
  runnerSlow.act = { id: 'fight', ctx: { fid: fMove.id, target: targetA.id, cd: 99 } };
  STATS.addStatus(runnerSlow, 'gravityCrush', 30, null, W.t);
  runnerSlow.gravityCrush = W.t + 30;
  for (let tick = 0; tick < 4; tick++) {
    W.t = 51 + tick;
    COMBAT.foeStep(W, runnerFast);
    COMBAT.foeStep(W, runnerSlow);
  }
  const distMovedFast = Math.hypot(30 - runnerFast.x, 10 - runnerFast.y);
  const distMovedSlow = Math.hypot(30 - runnerSlow.x, 10 - runnerSlow.y);
  check(distMovedFast > 0 && distMovedSlow < distMovedFast * 0.65, `gravityCrush must slow foe moveToward to ~0.45x (fast=${distMovedFast.toFixed(3)}, slow=${distMovedSlow.toFixed(3)})`);

  // blink under gravityCrush must not set gap-close markers
  const blinker = makeNpc(W, { stage: 4, rank: 2, path: 'NINPO_SHADOW', x: 10, y: 10 });
  const blinkTarget = regFoe('FOE_BLINK_T', 15, 10);
  const fBlink = COMBAT.startFight(W, [blinker.id], [blinkTarget.id], 'duel', {});
  STATS.addStatus(blinker, 'gravityCrush', 30, null, W.t);
  blinker.gravityCrush = 1;
  // Find any blink profile to force-cast via attack if needed, or verify blink move profile exists
  const blinkProf = (JD.TECH && JD.TECH.techniques || []).map(t => SKILLS.profile(t)).find(p => p && p.arch === 'blink');
  if (blinkProf) {
    blinker.cult.tm = blinker.cult.tm || {};
    blinker.cult.tm[blinkProf.tech || blinkProf.id] = 5;
    if (!blinker.cult.equipped) blinker.cult.equipped = [];
    blinker.cult.equipped.unshift(blinkProf.id);
    blinker.h.state.qi = CULT.qiMax(blinker);
    blinker.act = { id: 'fight', ctx: { fid: fBlink.id, target: blinkTarget.id, cd: 0, cds: {} } };
    // Run attack with chooseSkill forced to consider blink by narrowing list temporarily if needed
    const origList = SKILLS.list;
    SKILLS.list = () => [Object.assign({}, blinkProf, { self: false, wind: 2 })];
    try {
      COMBAT.attack(W, fBlink, blinker, blinkTarget);
    } finally {
      SKILLS.list = origList;
    }
    check(blinkTarget._closedOnBy !== blinker.id && blinker._gapClosedOn !== blinkTarget.id, 'blink under gravityCrush must NOT set _closedOnBy / _gapClosedOn');
  }

  // 3.2 applyDamage: shadowClone (single vs AoE), parryCounter (melee vs ranged), substitutionReady
  const scDef = makeNpc(W, { stage: 4, rank: 2, path: 'NINPO_SHADOW', x: 10, y: 10 });
  const scAtt = makeFoe('FOE_SC', 11, 10, { x: 11, y: 10 });
  const fSc = COMBAT.startFight(W, [scDef.id], [scAtt.id], 'duel', {});
  scDef._shadowClones = 2;
  STATS.applyNamedBuff(scDef, 'shadowClone', 30, W.t, { casterId: scDef.id });
  const scHp0 = COMBAT.hp(scDef);
  COMBAT.applyDamage(W, fSc, scAtt, scDef, 100, 'single');
  check(COMBAT.hp(scDef) === scHp0 && scDef._shadowClones === 1, 'shadowClone must negate single-target hit and pop 1 clone');
  COMBAT.applyDamage(W, fSc, scAtt, scDef, 100, 'aoe', { isAoeMultiTarget: true });
  const aoeLost = scHp0 - COMBAT.hp(scDef);
  check(aoeLost > 0 && aoeLost < 65 && scDef._shadowClones === 0, `shadowClone AoE hit must deal ~45% bleedthrough and pop last clone (lost=${aoeLost}, clones=${scDef._shadowClones})`);
  check(STATS.has(scDef, 'exposed', W.t), 'Popping last shadowClone must apply exposed status');

  // parryCounter melee vs ranged
  const pDef = makeNpc(W, { stage: 4, rank: 2, path: 'SHADOW_SAMURAI', sub: 'SHADOW_SAMURAI', x: 10, y: 10 });
  const pMeleeAtt = makeFoe('FOE_PM', 11.5, 10);
  const pRangedAtt = makeFoe('FOE_PR', 16, 10);
  const fParry = COMBAT.startFight(W, [pDef.id], [pMeleeAtt.id, pRangedAtt.id], 'duel', {});
  STATS.applyNamedBuff(pDef, 'parryCounter', 30, W.t, { casterId: pDef.id });
  const meleeHpBefore = COMBAT.hp(pMeleeAtt);
  COMBAT.applyDamage(W, fParry, pMeleeAtt, pDef, 80, 'melee-hit');
  check(COMBAT.hp(pMeleeAtt) < meleeHpBefore, `parryCounter in melee range <= 2.5 must slash attacker (before=${meleeHpBefore}, after=${COMBAT.hp(pMeleeAtt)})`);

  STATS.applyNamedBuff(pDef, 'parryCounter', 30, W.t, { casterId: pDef.id });
  const rangedHpBefore = COMBAT.hp(pRangedAtt);
  const pDefHpBefore = COMBAT.hp(pDef);
  COMBAT.applyDamage(W, fParry, pRangedAtt, pDef, 100, 'ranged-hit');
  const dmgTakenRanged = pDefHpBefore - COMBAT.hp(pDef);
  check(COMBAT.hp(pRangedAtt) === rangedHpBefore, 'parryCounter against > 2.5 ranged attacker must NOT perform impossible melee slash');
  check(dmgTakenRanged > 0 && dmgTakenRanged <= 75, `parryCounter against ranged hit must reduce damage by ~30% (took=${dmgTakenRanged})`);

  // substitutionReady clears closedOnBy/gapClosedOn and repositions via projectSafePosition
  const subDef = makeNpc(W, { stage: 4, rank: 2, path: 'XIAN', x: 12, y: 12 });
  subDef.defensiveArtState = null; subDef.mantraState = null; subDef.passiveResonanceState = null; subDef.pets = [];
  const subAtt = regFoe('FOE_SUB', 13, 12);
  const fSub = COMBAT.startFight(W, [subDef.id], [subAtt.id], 'duel', { serious: true });
  subDef._closedOnBy = subAtt.id;
  subAtt._gapClosedOn = subDef.id;
  STATS.applyNamedBuff(subDef, 'substitutionReady', 30, W.t, { casterId: subDef.id });
  const startDist = Math.hypot(subDef.x - subAtt.x, subDef.y - subAtt.y);
  COMBAT.applyDamage(W, fSub, subAtt, subDef, COMBAT.hp(subDef) * 5 + 2000, 'sub-hit');
  const endDist = Math.hypot(subDef.x - subAtt.x, subDef.y - subAtt.y);
  check(endDist > startDist + 1.0, `substitutionReady must teleport defender away safely (start=${startDist.toFixed(2)}, end=${endDist.toFixed(2)})`);
  check(subDef._closedOnBy === null && subAtt._gapClosedOn === null, 'substitutionReady must clear _closedOnBy and _gapClosedOn on both combatants');

  // 3.3 MARIONETTE_SOUL_SWAP multi-enemy & 1v1
  const mar = makeNpc(W, { stage: 4, rank: 2, path: 'SOUL_PUPPETRY', x: 10, y: 10 });
  const mE1 = regFoe('FOE_M1', 12, 10);
  const mE2 = regFoe('FOE_M2', 13, 11);
  const fMarMulti = COMBAT.startFight(W, [mar.id], [mE1.id, mE2.id], 'duel', {});
  COMBAT.COMPOSABLE_ENGINE.executeAction(W, fMarMulti, mar, mE1, 'MARIONETTE_SOUL_SWAP', {});
  const t1 = STATS.statusOf(mE1, 'tetheredEnemy', W.t);
  const t2 = STATS.statusOf(mE2, 'tetheredEnemy', W.t);
  check(t1 && t1.linkedToId !== mE1.id && t1.linkedToId === mE2.id && t2 && t2.linkedToId === mE1.id, 'MARIONETTE_SOUL_SWAP with 2+ foes must mutually tether two distinct enemies (never self)');

  const mSolo = regFoe('FOE_MSOLO', 12, 10);
  const fMarSolo = COMBAT.startFight(W, [mar.id], [mSolo.id], 'duel', {});
  COMBAT.COMPOSABLE_ENGINE.executeAction(W, fMarSolo, mar, mSolo, 'MARIONETTE_SOUL_SWAP', {});
  const tSolo = STATS.statusOf(mSolo, 'tetheredEnemy', W.t);
  const tMar = STATS.statusOf(mar, 'tetheredEnemy', W.t);
  check((!tSolo || tSolo.linkedToId !== mSolo.id) && tMar && tMar.linkedToId === mSolo.id && tMar.shareRatio === 0.30, 'MARIONETTE_SOUL_SWAP in 1v1 must set caster tetheredEnemy (0.30) without self-tether');

  // 3.4 FORTUNE_GAMBLER critVarianceBonus in strike
  const fgHigh = makeNpc(W, { stage: 4, rank: 2, path: 'FORTUNE_GAMBLER', x: 10, y: 10 });
  const fgLow = makeNpc(W, { stage: 4, rank: 2, path: 'FORTUNE_GAMBLER', x: 10, y: 10 });
  fgHigh.grandDaoState.critVarianceBonus = 0.22;
  fgLow.grandDaoState.critVarianceBonus = -0.05;
  const dummyFoe = regFoe('FOE_CRIT', 11, 10, { hpMax: 999999, hp: 999999, h: { state: { hp: 999999, qi: 100, energy: 100 }, skills: {} } });
  const fCrit = COMBAT.startFight(W, [fgHigh.id, fgLow.id], [dummyFoe.id], 'duel', {});
  let highCrits = 0, lowCrits = 0;
  for (let i = 0; i < 300; i++) {
    dummyFoe.hp = 999999; dummyFoe.h.state.hp = 999999;
    const r1 = COMBAT.strike(W, fCrit, fgHigh, dummyFoe, { M: 1, noProc: true, silent: true });
    if (r1 && r1.crit) highCrits++;
    dummyFoe.hp = 999999; dummyFoe.h.state.hp = 999999;
    const r2 = COMBAT.strike(W, fCrit, fgLow, dummyFoe, { M: 1, noProc: true, silent: true });
    if (r2 && r2.crit) lowCrits++;
  }
  check(highCrits > lowCrits + 20, `FORTUNE_GAMBLER critVarianceBonus (+22% vs -5%) must raise crit frequency (high=${highCrits}, low=${lowCrits})`);

  // 3.5 SHADOW_SAMURAI zero-Qi stamina spend & qi===0 preservation even with qiRestorePct
  const sam = makeNpc(W, { stage: 5, rank: 3, path: 'SHADOW_SAMURAI', sub: 'SHADOW_SAMURAI', x: 10, y: 10 });
  sam.h.state.qi = 0;
  sam.h.state.energy = 80;
  const samFoe = regFoe('FOE_SAM', 11, 10, { hpMax: 5000, hp: 5000, h: { state: { hp: 5000, qi: 100, energy: 100 }, skills: {} } });
  const fSam = COMBAT.startFight(W, [sam.id], [samFoe.id], 'duel', {});
  sam.act = { id: 'fight', ctx: { fid: fSam.id, target: samFoe.id, cd: 0, cds: {} } };
  const fakeSamSkill = {
    id: 'TEST_SAM_SKILL',
    nameTh: 'ดาบไร้ปราณทดสอบ',
    icon: '⚔️',
    arch: 'strike',
    type: 'p',
    M: 1.4,
    costPct: 12,
    qiRestorePct: 0.25,
    wind: 3,
    range: { min: 0, max: 3, bandIndex: 1 }
  };
  const origList2 = SKILLS.list;
  SKILLS.list = () => [fakeSamSkill];
  try {
    COMBAT.attack(W, fSam, sam, samFoe);
  } finally {
    SKILLS.list = origList2;
  }
  check(sam.h.state.qi === 0, `SHADOW_SAMURAI must preserve qi===0 even on qiRestorePct skill (got qi=${sam.h.state.qi})`);
  check(sam.h.state.energy < 80 && sam.h.state.energy >= 75, `SHADOW_SAMURAI must spend 1..4 bounded stamina for active skill (energy left=${sam.h.state.energy})`);

  // 3.6 C.slay corpses -> GRAVE_CORPSE_DETONATE, BLOOD_DEMON harvest, BUDDHA_DHARMA precept
  const necro = makeNpc(W, { stage: 4, rank: 2, path: 'NETHER_GRAVE', x: 10, y: 10 });
  const graveTgt = regFoe('FOE_GRAVE_T', 12, 10, { hpMax: 5000, hp: 5000, h: { state: { hp: 5000, qi: 100, energy: 100 }, skills: {} } });
  const sumVictim = makeFoe('FOE_SUMMON', 12, 11, { isSummon: true });
  const fGrave = COMBAT.startFight(W, [necro.id], [graveTgt.id], 'duel', { serious: true });
  COMBAT.slay(W, fGrave, necro, sumVictim);
  check(!fGrave._unconsumedCorpses, 'Summon death must NOT add _unconsumedCorpses');
  const corpse1 = makeFoe('FOE_C1', 12, 11);
  const corpse2 = makeFoe('FOE_C2', 12, 11);
  const corpse3 = makeFoe('FOE_C3', 12, 11);
  COMBAT.slay(W, fGrave, necro, corpse1);
  COMBAT.slay(W, fGrave, necro, corpse2);
  COMBAT.slay(W, fGrave, necro, corpse3);
  check(fGrave._unconsumedCorpses === 3, `Non-summon deaths must accumulate _unconsumedCorpses=3 (got ${fGrave._unconsumedCorpses})`);
  COMBAT.COMPOSABLE_ENGINE.executeAction(W, fGrave, necro, graveTgt, 'GRAVE_CORPSE_DETONATE', {});
  check(fGrave._unconsumedCorpses === 1 && necro.lastGraveCorpseDetonate && necro.lastGraveCorpseDetonate.usedCorpses === 2, 'GRAVE_CORPSE_DETONATE must consume up to 2 corpses');
  const dmgWithCorpses = necro.lastGraveCorpseDetonate.bonusDmg;
  fGrave._unconsumedCorpses = 0;
  COMBAT.COMPOSABLE_ENGINE.executeAction(W, fGrave, necro, graveTgt, 'GRAVE_CORPSE_DETONATE', {});
  check(dmgWithCorpses > necro.lastGraveCorpseDetonate.bonusDmg, 'GRAVE_CORPSE_DETONATE with corpses must deal more damage than with 0 corpses');

  // BLOOD_DEMON harvest on C.slay
  const bdNpc = makeNpc(W, { stage: 3, rank: 2, path: 'XIAN', sub: 'BLOOD_DEMON' });
  bdNpc.h.state.qi = 10;
  bdNpc.h.state.heartDemon = 0;
  bdNpc.cult.prog = 0;
  const progBeforeBd = bdNpc.cult.prog || 0;
  const bdVictim = makeFoe('FOE_BD', 12, 10, { tier: 3 });
  COMBAT.slay(W, fGrave, bdNpc, bdVictim);
  check((bdNpc.cult.prog || 0) > progBeforeBd && bdNpc.h.state.qi > 10 && bdNpc.stats.demonHarvest > 0, 'XIAN/BLOOD_DEMON must harvest prog, qi, and demonHarvest on slay');

  // BUDDHA_DHARMA slay precept
  const monk = makeNpc(W, { stage: 3, rank: 2, path: 'BUDDHA_DHARMA' });
  monk.h.state.heartDemon = 10;
  const fDefend = COMBAT.startFight(W, [monk.id], ['FOE_RAIDER'], 'raid', { serious: true });
  COMBAT.slay(W, fDefend, monk, makeFoe('FOE_RAIDER', 12, 10));
  check(monk.h.state.heartDemon === 10, 'BUDDHA_DHARMA defending against uninitiated foe must NOT gain +5 heartDemon');
  fDefend.initiatedBy = monk.id;
  COMBAT.slay(W, fDefend, monk, makeFoe('FOE_INITIATED', 12, 10));
  check(monk.h.state.heartDemon === 15, `BUDDHA_DHARMA initiated lethal slay must add +5 heartDemon (got ${monk.h.state.heartDemon})`);
  const fellow = makeNpc(W, { stage: 2, rank: 1 });
  fDefend.initiatedBy = null;
  COMBAT.slay(W, fDefend, monk, fellow);
  check(monk.h.state.heartDemon >= 20 && monk.h.state.heartDemon < 22, `BUDDHA_DHARMA slaying non-foe NPC must add +5 heartDemon (+ grief delta, got ${monk.h.state.heartDemon})`);

  // 3.7 C.leave keeps vowBacklash and persistent statuses while clearing transient ones
  const lvNpc = makeNpc(W, { stage: 3, rank: 2 });
  STATS.addStatus(lvNpc, 'burn', 20, null, W.t);
  STATS.addStatus(lvNpc, 'vowBacklash', 50, null, W.t);
  lvNpc.sx.push({ k: 'customPersistent', startedAt: W.t, dur: 60, until: W.t + 60, persistent: true });
  COMBAT.leave(W, lvNpc);
  check(!STATS.has(lvNpc, 'burn', W.t), 'C.leave must clear transient combat burn');
  check(lvNpc.sx.some(x => x.k === 'vowBacklash') && lvNpc.sx.some(x => x.k === 'customPersistent'), 'C.leave must preserve vowBacklash and persistent statuses');
}

// =========================================================================
// GROUP 4: AI Meditation/Farming + Fishing, Expedition, Market, Explore
// =========================================================================
{
  const W = SIM.create('v270-granular-g4');
  W.t = 61;

  // 4.1 AI.step (cultivate) safe without ctx & BUDDHA_DHARMA faster heartDemon cleansing
  const meditatorBase = makeNpc(W, { stage: 3, rank: 2, path: 'XIAN', sub: 'SWORD_IMMORTAL' });
  const meditatorBuddha = makeNpc(W, { stage: 3, rank: 2, path: 'BUDDHA_DHARMA' });
  meditatorBase.mantraState = null; meditatorBuddha.mantraState = null;
  for (const m of [meditatorBase, meditatorBuddha]) {
    m.h.state.heartDemon = 20; m.h.state.stress = 20; m.h.state.energy = 90; m.h.state.rest = 90; m.h.state.hunger = 95; m.h.state.mood = 80;
    m.act = { id: 'cultivate', stage: 'do', left: 50, total: 50 }; // no ctx passed!
  }
  AI.step(W, meditatorBase);
  AI.step(W, meditatorBuddha);
  check(meditatorBuddha.h.state.heartDemon < meditatorBase.h.state.heartDemon, `BUDDHA_DHARMA meditation must cleanse heartDemon faster than baseline (bud=${meditatorBuddha.h.state.heartDemon}, base=${meditatorBase.h.state.heartDemon})`);
  check(meditatorBuddha.h.state.stress < meditatorBase.h.state.stress, `BUDDHA_DHARMA meditation must calm stress faster than baseline (bud=${meditatorBuddha.h.state.stress}, base=${meditatorBase.h.state.stress})`);

  // 4.2 AI.step (farm) SPIRIT_HUSBANDRY bonus harvest & prog
  const farmerBase = makeNpc(W, { stage: 3, rank: 1, path: 'XIAN', sub: 'SWORD_IMMORTAL' });
  const farmerHus = makeNpc(W, { stage: 3, rank: 1, path: 'SPIRIT_HUSBANDRY', sub: 'SPIRIT_GRAIN_SOVEREIGN' });
  farmerBase.cult.prog = 0;
  farmerHus.cult.prog = 0;
  const fBaseProg = farmerBase.cult.prog || 0;
  const fHusProg = farmerHus.cult.prog || 0;
  farmerBase.h.state.energy = 90; farmerBase.h.state.rest = 90; farmerBase.h.state.hunger = 95;
  farmerHus.h.state.energy = 90; farmerHus.h.state.rest = 90; farmerHus.h.state.hunger = 95;
  farmerBase.act = { id: 'farm', stage: 'do', left: 50, total: 50, ctx: { herb: false, got: 0 } };
  farmerHus.act = { id: 'farm', stage: 'do', left: 50, total: 50, ctx: { herb: false, got: 0 } };
  W.t = 120;
  AI.step(W, farmerBase);
  AI.step(W, farmerHus);
  check(farmerHus.act.ctx.got >= farmerBase.act.ctx.got, `SPIRIT_HUSBANDRY farm harvest must be >= baseline (hus=${farmerHus.act.ctx.got}, base=${farmerBase.act.ctx.got})`);
  check((farmerHus.cult.prog || 0) > fHusProg && (farmerBase.cult.prog || 0) === fBaseProg, 'SPIRIT_HUSBANDRY farm tick must grant cultivation prog');

  // 4.3 FISHING.resolveSuccessfulCatch TIDE_VOYAGER bonus catches & quality
  const fisherBase = makeNpc(W, { stage: 4, rank: 2, path: 'XIAN' });
  const fisherTide = makeNpc(W, { stage: 4, rank: 2, path: 'TIDE_VOYAGER' });
  fisherBase.h.skills.fishing = 40;
  fisherTide.h.skills.fishing = 40;
  let baseQty = 0, tideQty = 0;
  for (let i = 0; i < 40; i++) {
    const rb = FISHING.resolveSuccessfulCatch(W, fisherBase, 'river_central');
    const rt = FISHING.resolveSuccessfulCatch(W, fisherTide, 'river_central');
    baseQty += (rb && rb.qty) || 1;
    tideQty += (rt && rt.qty) || 1;
  }
  check(tideQty > baseQty, `TIDE_VOYAGER must yield more total fish catches via bonus catch mechanic (tide=${tideQty}, base=${baseQty})`);

  // 4.4 EXPED.createParty DRAGON_SHIP_NAVIGATOR + POCKET_REALM_ARCHITECT
  const nav = makeNpc(W, { stage: 4, rank: 2, path: 'TIDE_VOYAGER', sub: 'DRAGON_SHIP_NAVIGATOR' });
  const poc = makeNpc(W, { stage: 4, rank: 2, path: 'VOID_SPACE', sub: 'POCKET_REALM_ARCHITECT' });
  const regNpc = makeNpc(W, { stage: 4, rank: 2, path: 'XIAN', sub: 'SWORD_IMMORTAL' });
  nav.pets = []; poc.pets = []; regNpc.pets = [];
  const tripWaterReg = EXPED.createParty(W, [regNpc], { baseDays: 10, baseCapacity: 10, terrain: 'water', useQinggong: false });
  const tripWaterNav = EXPED.createParty(W, [nav], { baseDays: 10, baseCapacity: 10, terrain: 'water', useQinggong: false });
  const tripCapPoc = EXPED.createParty(W, [poc], { baseDays: 10, baseCapacity: 10, useQinggong: false });
  check(tripWaterNav.durationMultiplier < tripWaterReg.durationMultiplier, `DRAGON_SHIP_NAVIGATOR must reduce water expedition durationMultiplier (nav=${tripWaterNav.durationMultiplier}, reg=${tripWaterReg.durationMultiplier})`);
  check(tripCapPoc.capacityMultiplier > tripWaterReg.capacityMultiplier * 1.15, `POCKET_REALM_ARCHITECT must boost capacityMultiplier by ~1.25x (poc=${tripCapPoc.capacityMultiplier}, reg=${tripWaterReg.capacityMultiplier})`);

  // 4.5 EXT.quotePrice TREASURE_APPRAISER_SAGE & MERCANTILE_DAO
  const appNpc = makeNpc(W, { stage: 4, rank: 2, path: 'MERCANTILE_DAO', sub: 'TREASURE_APPRAISER_SAGE' });
  const merNpc = makeNpc(W, { stage: 4, rank: 2, path: 'MERCANTILE_DAO', sub: 'MERCHANT_MAGNATE' });
  const normNpc = makeNpc(W, { stage: 4, rank: 2, path: 'XIAN', sub: 'SWORD_IMMORTAL' });
  appNpc.h.skills.trading = 50; merNpc.h.skills.trading = 50; normNpc.h.skills.trading = 50;
  const sampleItemId =
    Object.keys(ECO.itemById || {}).find(id => EXT.isTradable(id) && EXT.basePrice(W, id) >= 50) ||
    Object.keys(ECO.matById || {}).find(id => EXT.isTradable(id) && EXT.basePrice(W, id) >= 20) ||
    Object.keys(ECO.recipeById || {}).map(r => 'P:' + r).find(id => EXT.isTradable(id) && EXT.basePrice(W, id) >= 30);
  check(!!sampleItemId, 'Must resolve sample tradable item ID with basePrice >= 20 for quotePrice test');
  const buyApp = EXT.quotePrice(W, sampleItemId, 'member-buy', appNpc);
  const buyMer = EXT.quotePrice(W, sampleItemId, 'member-buy', merNpc);
  const buyNorm = EXT.quotePrice(W, sampleItemId, 'member-buy', normNpc);
  check(buyApp < buyMer && buyMer < buyNorm, `member-buy quotes must satisfy TREASURE_APPRAISER_SAGE < MERCANTILE_DAO < baseline (${buyApp} < ${buyMer} < ${buyNorm})`);
  const sellApp = EXT.quotePrice(W, sampleItemId, 'member-sell', appNpc);
  const sellMer = EXT.quotePrice(W, sampleItemId, 'member-sell', merNpc);
  const sellNorm = EXT.quotePrice(W, sampleItemId, 'member-sell', normNpc);
  check(sellApp > sellMer && sellMer > sellNorm, `member-sell quotes must satisfy TREASURE_APPRAISER_SAGE > MERCANTILE_DAO > baseline (${sellApp} > ${sellMer} > ${sellNorm})`);

  // 4.6 EXPLORE POCKET_REALM_ARCHITECT & PHRAY_SPIRIT_WHISPER
  const exPoc = EXPLORE.departSanctum(W, [poc], 'SANCTUM_SWORD_ABYSS');
  exPoc.forceClear = true;
  const outPoc = EXPLORE.resolveSanctum(W, exPoc, [poc], { bonusRoll: 0.99, tierRoll: 0.1 });
  check((outPoc._pocketArchitectBonus || 0) > 0 && outPoc.stones >= outPoc._pocketArchitectBonus, 'POCKET_REALM_ARCHITECT must receive extra sanctum storage bonus');

  const whisCopy = makeNpc(W, { stage: 4, rank: 2, path: 'OCCULT_MAGE', sub: 'PHRAY_SPIRIT_WHISPER' });
  const baseCopy = makeNpc(W, { stage: 4, rank: 2, path: 'XIAN', sub: 'SWORD_IMMORTAL' });
  whisCopy.pets = []; baseCopy.pets = [];
  whisCopy.defensiveArtState = null; baseCopy.defensiveArtState = null;
  whisCopy.h.state.hp = CULT.hpMax(whisCopy);
  baseCopy.h.state.hp = CULT.hpMax(baseCopy);
  const hpBeforeWhis = whisCopy.h.state.hp / CULT.hpMax(whisCopy);
  const hpBeforeBase = baseCopy.h.state.hp / CULT.hpMax(baseCopy);
  const exWhisFail = EXPLORE.departSanctum(W, [whisCopy], 'SANCTUM_SWORD_ABYSS');
  exWhisFail.forceFailFloor = 1;
  EXPLORE.resolveSanctum(W, exWhisFail, [whisCopy], { bonusRoll: 0.99 });
  const exBaseFail = EXPLORE.departSanctum(W, [baseCopy], 'SANCTUM_SWORD_ABYSS');
  exBaseFail.forceFailFloor = 1;
  EXPLORE.resolveSanctum(W, exBaseFail, [baseCopy], { bonusRoll: 0.99 });
  const fracLostWhis = hpBeforeWhis - (whisCopy.h.state.hp / CULT.hpMax(whisCopy));
  const fracLostBase = hpBeforeBase - (baseCopy.h.state.hp / CULT.hpMax(baseCopy));
  check(fracLostWhis < fracLostBase, `PHRAY_SPIRIT_WHISPER must reduce sanctum hazard damage fraction (whisLost=${fracLostWhis.toFixed(4)} < baseLost=${fracLostBase.toFixed(4)})`);
}

console.log('PASS v270_paths_subpaths_granular_suite (all 4 test groups)');
