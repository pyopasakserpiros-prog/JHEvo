'use strict';
const assert = require('node:assert/strict');
const g = require('./load.js');
const { SIM, CULT, COMBAT, SECT, MARTIAL, ECO, AI, COG } = g;
const newPaths = ['ARRAY_TALISMAN', 'STRATEGY_GOVERNANCE'];

// Exercise real major progression, technique eligibility and all specialization gates.
{
  const W = SIM.create('v214_progression');
  const n = W.byId[W.sect.masterId];
  for (const path of newPaths) {
    n.cult.path = path;
    n.cult.sub = 'NONE';
    delete n.cult.track;
    let previous = 0;
    for (let stage = 1; stage <= CULT.maxStage(n); stage++) {
      n.cult.stage = stage;
      const eq = CULT.equivalentStage(n);
      assert(eq > previous && eq <= 9, path + ' monotonic equivalent stages');
      previous = eq;
      assert(CULT.effectiveTechStage(n) >= stage, 'arts remain accessible');
      if (stage < CULT.maxStage(n)) {
        assert(Number.isFinite(CULT.threshold(n)) && CULT.threshold(n) > 0);
        n.cult.prog = CULT.threshold(n);
        assert(CULT.ready(n));
      } else {
        assert.equal(eq, 9);
        assert.equal(CULT.threshold(n), Infinity);
        assert.equal(CULT.ready(n), false);
      }
    }
    for (const sub of CULT.PATHS[path].subPaths) {
      n.cult.sub = sub.id;
      const def = CULT.trackDef(sub.id);
      assert(def && def.realms.length > 0, sub.id + ' has specialization progression');
      assert.equal(def.realms[1].skillGate.primarySkill, sub.primarySkill);
      assert.equal(def.realms[1].skillGate.secondarySkill, sub.secondarySkills[0]);
      assert(MARTIAL.SKILL_INFO[sub.primarySkill], sub.id + ' uses a real primary skill');
      assert(MARTIAL.SKILL_INFO[sub.secondarySkills[0]], sub.id + ' uses a real secondary skill');
    }
    n.cult.stage = 2;
    n.cult.sub = 'NONE';
    n.cult.mantra = CULT.bestMantra(path, 2, n).id;
    const skills = path === 'ARRAY_TALISMAN' ? ['ARRAY', 'TALISMAN'] : ['administration', 'diplomacy', 'trading'];
    skills.forEach(key => { n.h.skills[key] = 0; });
    const untrained = CULT.rate(n);
    skills.forEach(key => { n.h.skills[key] = 100; });
    const trained = CULT.rate(n);
    assert(Number.isFinite(untrained) && untrained > 0 && trained > untrained, path + ' uses actual skill progress without stale rate caches');
  }
}

const civicWorld = seed => {
  const W = SIM.create(seed);
  W.sect.posts = {};
  W.sect.deputyId = null;
  W.npcs.forEach(n => { Object.keys(n.h.skills).forEach(k => { n.h.skills[k] = 0; }); });
  return W;
};
const qualify = (W, n, role, path = 'STRATEGY_GOVERNANCE', sub = 'SECT_STEWARD') => {
  n.dead = false; n.away = false; n.sealed = false; n.sealedBt = false; n.exiled = false; n.jail = 0; n.punished = 0;
  n.cult.path = path; n.cult.sub = sub; n.cult.stage = 3;
  n.post = role; W.sect.posts[role] = n.id;
  ['administration', 'trading', 'construction', 'survival', 'cooking'].forEach(k => { n.h.skills[k] = 100; });
};

// Governance cultivation is a personal expertise path, independent of office authority.
{
  const W = SIM.create('v214_member_governance');
  const member = W.npcs.find(n => n.id !== W.sect.masterId && n.id !== W.sect.deputyId);
  member.rank = 1; member.post = null; member.assist = null;
  Object.keys(W.sect.posts).forEach(role => { if (W.sect.posts[role] === member.id) delete W.sect.posts[role]; });
  member.away = false; member.sealed = false; member.sealedBt = false; member.jail = 0; member.punished = 0;
  member.h.state.energy = member.h.state.rest = member.h.state.satiety = 95;
  member.inj = [];
  member.cult.path = 'STRATEGY_GOVERNANCE'; member.cult.stage = 2;
  assert.equal(COG.role(W, member).id, 'member');
  for (const sub of CULT.PATHS.STRATEGY_GOVERNANCE.subPaths) {
    member.cult.sub = sub.id;
    member.cult.track = CULT.initTrack(sub.id, 1, W.day);
    member.cult.track.prog = CULT.trackThreshold(member);
    member.inv.stones = 100000;
    MARTIAL.skillSet(member, sub.primarySkill, 10);
    MARTIAL.skillSet(member, sub.secondarySkills[0], 100);
    member.h.personality.ambition = member.h.values.martialPeak = member.h.personality.discipline = 95;
    g.HC.bump(member);
    const drill = AI.ACTS.skillDrill;
    assert(drill.can(member, W), sub.id + ' member can train without office');
    const ctx = drill.where(W, member);
    assert(ctx && ctx.skill === sub.primarySkill, sub.id + ' missing expertise has an ordinary training route');
    const before = MARTIAL.skillRead(member, ctx.skill);
    drill.tick(member, W, ctx);
    assert(MARTIAL.skillRead(member, ctx.skill) > before, 'member training grants real expertise');
    assert(AI.ACTS.cultivate.can(member, W));
    const place = AI.ACTS.cultivate.where(W, member);
    assert(place, 'ordinary members can find a cultivation station');
    const progress = member.cult.prog;
    AI.ACTS.cultivate.tick(member, W, place);
    assert(member.cult.prog > progress, sub.id + ' cultivates without an appointment');
    assert.equal(SECT.governancePractice(W, member, 'treasury'), false, 'personal expertise grants no office authority');
  }
  const officer = W.npcs.find(n => n !== member && n.id !== W.sect.masterId && n.id !== W.sect.deputyId);
  officer.cult.path = 'XIAN'; officer.cult.sub = 'SWORD_IMMORTAL'; officer.rank = 2; officer.post = null;
  officer.away = false; officer.sealed = false; officer.sealedBt = false; officer.jail = 0; officer.punished = 0;
  assert(SECT.eligible(W, 'treasury', officer), 'non-governance cultivators remain eligible for office');
  SECT.appoint(W, 'treasury', officer, 'ทดสอบความสามารถโดยไม่จำกัดวิถี');
  assert.equal(COG.role(W, officer).id, 'treasury');
  officer.h.skills.administration = 40;
  const skill = officer.h.skills.administration;
  COG.performDuty(W, officer);
  assert(officer.h.skills.administration > skill, 'non-governance officeholders carry out genuine duties');
  assert.equal(officer.cult.path, 'XIAN', 'office appointment never changes cultivation path');
}

// Inspecting governance is pure, uses living qualified authority, and all paths work.
{
  const W = civicWorld('v214_governance_purity');
  const n = W.npcs.find(x => x.id !== W.sect.masterId);
  const empty = SECT.governanceSummary(W);
  assert.equal(empty.upkeepReduction, 0);
  qualify(W, n, 'treasury');
  const state = () => JSON.stringify({ sect: W.sect, npcs: W.npcs, rng: W.rng.getState() });
  const before = state();
  const summary = SECT.governanceSummary(W);
  for (let i = 0; i < 20; i++) assert.deepEqual(SECT.governanceSummary(W), summary);
  assert.equal(state(), before, 'governance inspection must not hydrate, cache, practice or advance RNG');
  assert(summary.upkeepReduction > 0 && summary.upkeepReduction <= .08);
  assert(summary.constructionSpeedBonus <= .12 && summary.logisticsEfficiency <= .20);
  n.cult.path = 'XIAN';
  assert(SECT.governanceSummary(W).upkeepReduction > 0, 'existing paths retain civic competence');
  for (const key of ['dead', 'away', 'sealed', 'sealedBt', 'exiled']) {
    n[key] = true;
    assert.equal(SECT.governanceSummary(W).upkeepReduction, 0, key + ' officer gives no phantom bonus');
    n[key] = false;
  }
  n.h.skills.administration = 24;
  assert.equal(SECT.governanceSummary(W).upkeepReduction, 0, 'unqualified officeholders cannot give a bonus');
  n.h.skills.administration = 1e6;
  n.h.skills.trading = Infinity;
  assert(SECT.governanceSummary(W).upkeepReduction <= .08, 'corrupt skill values cannot remove upkeep');
}

// Real authority delegation works; expired and stale delegation cannot produce bonuses.
{
  const W = civicWorld('v214_delegation');
  const [holder, delegate] = W.npcs.filter(n => n.id !== W.sect.masterId);
  qualify(W, holder, 'steward');
  holder.away = true;
  qualify(W, delegate, 'mission');
  W.sect.delegations = { steward: { holderId: holder.id, delegateId: delegate.id, until: W.t + 60 } };
  assert(SECT.governanceSummary(W).constructionSpeedBonus > 0);
  W.sect.delegations.steward.until = W.t;
  assert.equal(SECT.governanceSummary(W).constructionSpeedBonus, 0);
}

// Practice requires a real duty and authorized holder; repeat calls cannot farm skills.
{
  const W = civicWorld('v214_duty');
  const n = W.npcs.find(x => x.id !== W.sect.masterId);
  qualify(W, n, 'treasury');
  n.h.skills.administration = n.h.skills.trading = 40;
  const before = n.h.skills.administration;
  assert(SECT.governancePractice(W, n, 'treasury'));
  assert(n.h.skills.administration > before);
  assert.equal(SECT.governancePractice(W, n, 'treasury'), false);
  assert.equal(SECT.governancePractice(W, n, 'steward'), false);
  const loaded = SIM.deserialize(SIM.serialize(W));
  assert.equal(SECT.governancePractice(loaded, loaded.byId[n.id], 'treasury'), false, 'practice cooldown survives save/load');
  loaded.t += 120;
  assert(SECT.governancePractice(loaded, loaded.byId[n.id], 'treasury'));
}

// A genuine monthly upkeep charge uses the bounded summary and preserves a sink.
{
  const W = civicWorld('v214_monthly_sink');
  const n = W.npcs.find(x => x.id !== W.sect.masterId);
  qualify(W, n, 'treasury');
  W.sect.stones = 100000;
  const summary = SECT.governanceSummary(W), pop = W.npcs.filter(x => !x.dead).length;
  const base = pop * 7 + W.map.buildings.reduce((sum, b) => sum + b.level * 15, 0) * Math.max(.3, Math.min(1, (pop + 8) / 45));
  const expected = Math.round(.9 * (1 - summary.upkeepReduction) * base);
  let upkeep = 0;
  const pay = ECO.pay;
  ECO.pay = (world, amount, reason) => { if (reason === 'ค่าบำรุงรักษาสำนัก') upkeep = amount; return pay(world, amount, reason); };
  try { SECT.monthly(W); } finally { ECO.pay = pay; }
  assert.equal(upkeep, expected);
  assert(upkeep >= base * .80 && upkeep > 0, 'management never erases the upkeep sink');
}

// Real construction approval uses the bounded speed benefit after existing skills.
{
  const W = civicWorld('v214_construction');
  const master = W.byId[W.sect.masterId], n = W.npcs.find(x => x !== master);
  qualify(W, n, 'steward');
  W.sect.stones = 100000;
  W.day = 60; W.t = W.day * 1440;
  W.map.buildings.forEach(b => { b.level = SECT.maxBuildingLevel(b); });
  const hall = W.map.byId.meditation_hall;
  hall.level = 1;
  SECT.ensureFacilityDemand(W);
  W.sect.facilityDemand[hall.id] = { failedAttempts: 20, unmetDemands: 10, congestedHours: 10, lastCongestionHour: W.t };
  const summary = SECT.governanceSummary(W), stones = W.sect.stones;
  const cost = SECT.upgradeCost(hall);
  SECT.upgradeBuilding(W, master);
  assert(hall.building, 'genuine demand and available money approve construction');
  assert.equal(W.sect.stones, stones - cost, 'planning improves time without refunding construction costs');
  assert.equal(hall.building.until - W.t, Math.round(8 * 1440 / ((1 + 100 * .004 + 100 * .0015) * (1 + summary.constructionSpeedBonus))));
}

// New paths execute actual solo strikes and survive the existing combat pipeline.
{
  for (const path of newPaths) {
    const W = SIM.create('v214_solo_' + path), n = W.byId[W.sect.masterId];
    n.cult.path = path; n.cult.sub = CULT.PATHS[path].subPaths[0].id;
    const foe = { id: 'v214_training_foe', foe: true, nameTh: 'หุ่นฝึกยุทธ์', hp: 10000, hpMax: 10000, power: 20, tier: 1, x: n.x + 1, y: n.y, sx: [] };
    W.foeById[foe.id] = foe;
    const f = { id: 214, serious: false, A: [n.id], B: [foe.id], log: [] };
    const before = foe.hp;
    const result = COMBAT.strike(W, f, n, foe, { M: 1.1, type: 'm', isSkill: true, forced: true, noCrit: true, noCounter: true, noProc: true });
    assert(result.hit && foe.hp < before && Number.isFinite(foe.hp), path + ' has real solo offense');
  }
}

// Strongest specialist leads each aura, including solo; duplicate bodies cannot stack.
{
  const W = SIM.create('v214_formations');
  const n = W.byId[W.sect.masterId];
  for (const path of newPaths) {
    n.cult.path = path; n.cult.sub = CULT.PATHS[path].subPaths[0].id;
    n.fled = false; n.yield = false; n.h.state.hp = 100;
    const sub = CULT.subInfo(path, n.cult.sub);
    n.h.skills[sub.primarySkill] = n.h.skills[sub.secondarySkills[0]] = 0;
    const weak = COMBAT.evaluateFormationSynergy([n]);
    n.h.skills[sub.primarySkill] = n.h.skills[sub.secondarySkills[0]] = 100;
    const strong = COMBAT.evaluateFormationSynergy([n]);
    assert(weak.powerMultiplier > 1 && strong.powerMultiplier > weak.powerMultiplier, 'solo aura scales with practiced skills');
    const repeated = COMBAT.evaluateFormationSynergy(Array(200).fill(n));
    assert.equal(repeated.powerMultiplier, strong.powerMultiplier);
    assert.equal(repeated.damageMitigation, strong.damageMitigation);
    n.dead = true;
    assert.equal(COMBAT.evaluateFormationSynergy([n]).powerMultiplier, 1);
    n.dead = false;
  }
  const all = Object.keys(CULT.PATHS).map(path => ({ cult: { path, sub: CULT.PATHS[path].subPaths[0].id }, h: { skills: { ARRAY: 100, TALISMAN: 100, administration: 100, SCRIPTURE: 100 }, state: { hp: 100 } } }));
  const result = COMBAT.evaluateFormationSynergy(all);
  assert(result.powerMultiplier <= 1.85 && result.damageMitigation <= .40, 'mixed-path stacking remains bounded');
}

// Authoritative paths, office skill state and summaries round-trip; old worlds need no fields.
{
  const W = civicWorld('v214_roundtrip');
  const n = W.npcs.find(x => x.id !== W.sect.masterId);
  qualify(W, n, 'steward');
  const ward = W.byId[W.sect.masterId];
  ward.cult.path = 'ARRAY_TALISMAN'; ward.cult.sub = 'EARTH_VEIN_WARDEN'; ward.cult.stage = 4;
  const before = SECT.governanceSummary(W);
  const loaded = SIM.deserialize(SIM.serialize(W));
  assert.deepEqual(SECT.governanceSummary(loaded), before);
  assert.equal(loaded.byId[ward.id].cult.path, 'ARRAY_TALISMAN');
  assert.equal(loaded.byId[n.id].cult.path, 'STRATEGY_GOVERNANCE');
  const legacy = SIM.create('v214_legacy');
  assert(!Object.hasOwn(legacy.sect, 'governance'));
  const resumed = SIM.deserialize(SIM.serialize(legacy));
  assert.doesNotThrow(() => SECT.governanceSummary(resumed));
  assert(!Object.hasOwn(resumed.sect, 'governance'), 'reading old saves does not add persistent summary state');
  SIM.tick(resumed);
}
// Older paths use one realm scale for independent tracks, movement and office merit.
{
  const W = SIM.create('v214_legacy_equity'), n = W.byId[W.sect.masterId];
  const reference = {};
  for (const [path, def] of Object.entries(CULT.PATHS)) {
    n.cult.path = path; n.cult.sub = 'NONE'; n.cult.stage = def.maxStage; n.cult.track = null;
    assert.equal(CULT.equivalentStage(n), 9, path + ' native cap is canonical realm 9');
    for (const role of ['commander', 'martial', 'scripture', 'mission', 'guard', 'registry']) {
      const score = SECT.relevance(role, n);
      if (path === 'XIAN') reference[role] = score;
      else assert.equal(score, reference[role], path + ' realm contribution to ' + role + ' uses equivalent stage');
    }
    assert.equal(CULT.getFunctionalMetrics({ path, stage: def.maxStage }).band, 9, path + ' comparison band is canonical');
    for (const sub of def.subPaths) {
      n.cult.stage = 1; n.cult.sub = sub.id;
      const track = CULT.trackDef(sub.id);
      let previous = 0;
      for (let ordinal = 1; ordinal <= track.realms.length; ordinal++) {
        n.cult.track = CULT.initTrack(sub.id, ordinal, W.day);
        const eq = CULT.equivalentStage(n);
        assert(eq >= previous && eq <= 9, sub.id + ' independent track is monotonic and bounded');
        previous = eq;
      }
      assert.equal(previous, 9, sub.id + ' completed independent track reaches canonical realm 9');
      assert.equal(CULT.getFunctionalMetrics({ subPath: sub.id, ordinal: track.realms.length }).band, 9, sub.id + ' independent comparison band is canonical');
    }
  }
}

// Legacy cultivation rates respond to genuine skill changes without HC trait changes.
{
  const W = SIM.create('v214_legacy_skill_rate'), n = W.byId[W.sect.masterId];
  n.cult.path = 'CRAFT_CREATION'; n.cult.sub = 'PILL_FURNACE_IMMORTAL'; n.cult.stage = 2;
  n.cult.mantra = CULT.bestMantra(n.cult.path, 2, n).id;
  MARTIAL.skillSet(n, 'ALCHEMY', 0); MARTIAL.skillSet(n, 'FORGING', 0); MARTIAL.skillSet(n, 'ARRAY', 0); MARTIAL.skillSet(n, 'TALISMAN', 0);
  const before = CULT.rate(n);
  MARTIAL.skillSet(n, 'ALCHEMY', 100);
  assert(CULT.rate(n) > before, 'craft skill advancement must invalidate cultivation rate');
  n.cult.sub = 'JADE_MEAL_PREPARER';
  MARTIAL.skillSet(n, 'ALCHEMY', 0); MARTIAL.skillSet(n, 'cooking', 0);
  const beforeCooking = CULT.rate(n);
  MARTIAL.skillSet(n, 'cooking', 100);
  assert(CULT.rate(n) > beforeCooking, 'cooking expertise must refresh the existing craft cultivation modifier');
  n.cult.path = 'XIAN'; n.cult.sub = 'NONE'; n.cult.mantra = CULT.bestMantra('XIAN', 2, n).id;
  MARTIAL.skillSet(n, 'ALCHEMY', 0);
  const beforeGeneral = CULT.rate(n);
  MARTIAL.skillSet(n, 'ALCHEMY', 100);
  assert(CULT.rate(n) > beforeGeneral, 'general paths also refresh skill-based cultivation modifiers');
}

// General breakthrough pill tiers use technique eligibility, not short-path native stage.
{
  const W = SIM.create('v214_short_path_pill'), n = W.byId[W.sect.masterId];
  n.cult.path = 'GOD'; n.cult.stage = 3; n.cult.sub = 'WAR_DEITY'; n.cult.track = null;
  n.cult.btBonus = 0; n.inv.pills = {};
  W.sect.stock = {};
  const key = 'P:ECO2_REC_PILL_CULT_QI_6';
  ECO.add(W, key, 1);
  g.BN.prepare(W, n);
  assert.equal(ECO.count(W, key), 0, 'God stage 3 may use tier 6 general preparation under its effective tier gate');
  assert(n.cult.btBonus > 0, 'valid short-path preparation applies its real breakthrough bonus');
}

console.log('v2.0.14 governance, progression and formation checks passed');
