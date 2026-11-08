'use strict';

/**
 * v2.3.0 combat cascade audit reproducers.
 *
 * These assertions intentionally confirm the current bug signatures. A passing
 * run means the findings still reproduce; after a fix, invert/update the
 * assertions and keep the scenarios as regression coverage.
 */
const assert = require('assert');
const G = require('./load.js');
const { SIM, CULT, STATS, COMBAT } = G;

function petFatigueInvalidatesOwnerStats() {
  const W = SIM.create('combat-cascade-pet-audit', { masterIdx: 0 });
  STATS.now = W.t;
  const owner = W.npcs[0];
  owner.cult.path = 'BEAST_SOVEREIGN';
  owner.cult.sub = 'MYRIAD_BEAST_PACK';
  owner.pets = [CULT.createPetRecord(W, owner, 'BEAST_MIST_WOLF', {
    uid: 'AUDIT_PET', role: 'FEROCIOUS_ASSAULT', fatigue: 94,
    level: 5, tier: 4, bond: 90
  })];

  STATS.dirty(owner);
  const before = STATS.get(owner).atk;
  owner.pets[0].fatigue = 95;
  const cached = STATS.get(owner).atk;
  STATS.dirty(owner);
  const fresh = STATS.get(owner).atk;
  const result = {
    fatigue: owner.pets[0].fatigue,
    activePets: CULT.activePets(owner).length,
    before, cached, fresh,
    staleBonus: cached - fresh
  };

  assert.strictEqual(result.activePets, 0, 'pet should have left the active roster');
  assert(result.staleBonus > 0, 'owner should retain cached pet stats after fatigue threshold');
  console.log('CC-01 pet-stat cache:', JSON.stringify(result));
}

function prepareInterceptFight(seed, time) {
  const W = SIM.create(seed, { masterIdx: 0 });
  W.t = time;
  STATS.now = time;
  const guard = W.npcs[0];
  const target = W.npcs[1];
  for (const unit of [guard, target]) {
    unit.dead = false;
    unit.fled = false;
    unit.yield = false;
    unit.equip = {};
    unit.sx = [];
    unit.x = unit === guard ? 13 : 14;
    unit.y = 10;
    unit.h.state.hp = COMBAT.hpMax(unit);
    STATS.dirty(unit);
  }
  guard.cult.path = 'BODY';
  guard.h.state.energy = 100;
  target.h.state.hp = Math.round(COMBAT.hpMax(target) * 0.5);

  const enemy = {
    id: 'audit_boss', foe: true, name: 'Audit boss', tier: 5,
    power: 1000000, hp: 99999, hpMax: 99999, x: 10, y: 10,
    act: { id: 'fight', ctx: { fid: 902, target: target.id, cd: 0, cds: {} } },
    skl: []
  };
  W.foeById = { [enemy.id]: enemy };
  W.foes = [enemy];
  const fight = {
    id: 902, kind: 'duel', serious: true,
    A: [guard.id, target.id], B: [enemy.id], state: 'fight', log: []
  };
  const tac = COMBAT.ensureUnitTac(guard);
  tac.reactionReadyAt = 0;
  tac.reactionCharges = 1;
  return { W, guard, target, enemy, fight };
}

function withInterceptCapture(run) {
  let receiverId = null;
  const original = COMBAT.resolveDefensiveInterception;
  COMBAT.resolveDefensiveInterception = (...args) => {
    const result = original(...args);
    if (result && result.interceptor) receiverId = result.interceptor.id;
    return result;
  };
  try {
    return { receiverId: () => receiverId, value: run() };
  } finally {
    COMBAT.resolveDefensiveInterception = original;
  }
}

function dotSkill() {
  return {
    id: 'audit_dot', tech: 'audit_dot', nameTh: 'audit', icon: 'x',
    type: 'm', arch: 'dot', M: 0.15, dot: 1, dotKind: 'poison',
    cd: 1, wind: 1, tier: 3, hits: 1,
    range: { min: 0, max: 30, shape: 'SINGLE', radius: 0, requiresLoS: false }
  };
}

function skillRiderFollowsWrongTarget() {
  const { W, guard, target, enemy, fight } = prepareInterceptFight('combat-cascade-skill-rider', 500);
  const guardHp = COMBAT.hp(guard);
  const targetHp = COMBAT.hp(target);
  const capture = withInterceptCapture(() => COMBAT.useSkill(
    W, fight, enemy, target, dotSkill(), enemy.act.ctx
  ));
  const result = {
    guardId: guard.id,
    targetId: target.id,
    receiverId: capture.receiverId(),
    guardHpLost: guardHp - COMBAT.hp(guard),
    targetHpLost: targetHp - COMBAT.hp(target),
    guardPoison: (guard.sx || []).filter(status => status.k === 'poison'),
    targetPoison: (target.sx || []).filter(status => status.k === 'poison')
  };

  assert.strictEqual(result.receiverId, guard.id, 'bodyguard should receive the hit');
  assert(result.guardHpLost > 0, 'bodyguard should lose HP');
  assert.strictEqual(result.targetHpLost, 0, 'protected target should take no direct HP damage');
  assert(result.targetPoison.length > 0, 'DOT rider should incorrectly remain on selected target');
  assert.strictEqual(result.guardPoison.length, 0, 'interceptor should not receive the DOT rider');
  console.log('CC-02 skill rider after interception:', JSON.stringify(result));
}

function channelRiderFollowsWrongTarget() {
  const { W, guard, target, enemy, fight } = prepareInterceptFight('combat-cascade-channel-rider', 700);
  const guardHp = COMBAT.hp(guard);
  const targetHp = COMBAT.hp(target);
  const skill = dotSkill();
  const ctx = { channeling: {
    targetId: target.id, lockType: 'UNIT', maxRange: 30, startDist: 4,
    ticksLeft: 1, totalTicks: 1, tickM: 0.15, finishM: 0.15,
    skill, skillId: skill.id
  } };
  const capture = withInterceptCapture(() => COMBAT.resolveChannelTick(W, fight, enemy, ctx));
  const result = {
    guardId: guard.id,
    targetId: target.id,
    receiverId: capture.receiverId(),
    guardHpLost: guardHp - COMBAT.hp(guard),
    targetHpLost: targetHp - COMBAT.hp(target),
    guardPoison: (guard.sx || []).filter(status => status.k === 'poison'),
    targetPoison: (target.sx || []).filter(status => status.k === 'poison')
  };

  assert.strictEqual(result.receiverId, guard.id, 'bodyguard should receive the channel tick');
  assert(result.guardHpLost > 0, 'bodyguard should lose HP from channel tick');
  assert.strictEqual(result.targetHpLost, 0, 'protected target should take no direct HP damage');
  assert(result.targetPoison.length > 0, 'channel DOT rider should incorrectly remain on selected target');
  assert.strictEqual(result.guardPoison.length, 0, 'interceptor should not receive the channel DOT rider');
  console.log('CC-03 channel rider after interception:', JSON.stringify(result));
}

function deadDotSourceGetsVictimKillCredit() {
  const W = SIM.create('combat-cascade-orphan-dot', { masterIdx: 0 });
  W.t = 900;
  STATS.now = 900;
  const victim = W.npcs[0];
  const source = W.npcs[1];
  victim.dead = false;
  victim.fled = false;
  victim.yield = false;
  victim.h.state.hp = 1;
  victim.sx = [{ k: 'poison', startedAt: 890, dur: 20, until: 910, per: 0.10, src: source.id }];
  victim.stats = victim.stats || {};
  victim.stats.kills = 0;
  source.dead = true;
  const deathsBefore = W.deaths;
  const fight = { id: 903, kind: 'duel', serious: true, A: [victim.id], B: [source.id] };

  COMBAT.statusTick(W, fight, victim);
  const result = {
    sourceDead: source.dead,
    victimDead: victim.dead,
    victimKillCredit: victim.stats.kills,
    worldDeathsDelta: W.deaths - deathsBefore,
    statusSourceId: victim.sx[0] && victim.sx[0].src
  };

  assert(result.victimDead, 'active poison should kill the low-HP victim');
  assert.strictEqual(result.victimKillCredit, 1, 'dead/missing source should not credit victim as killer');
  console.log('CC-04 orphan DOT kill attribution:', JSON.stringify(result));
}

petFatigueInvalidatesOwnerStats();
skillRiderFollowsWrongTarget();
channelRiderFollowsWrongTarget();
deadDotSourceGetsVictimKillCredit();
console.log('Current cascade signatures reproduced (these are audit findings, not a clean regression pass).');
