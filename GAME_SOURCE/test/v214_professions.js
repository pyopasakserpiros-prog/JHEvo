'use strict';
const assert = require('node:assert/strict');
const { SIM, AI, ECO, MARTIAL, STATS, CULT, JD, EXPED } = require('./load.js');

function fixture(seed, sub) {
  const W = SIM.create(seed), n = W.byId[W.sect.masterId];
  n.cult.path = 'CRAFT_CREATION'; n.cult.sub = sub;
  n.h.skills.cooking = 80; n.h.skills.FORGING = 80;
  W.sect.stock.grain = 30; W.sect.stock.meal = 0;
  return { W, n };
}
function startCook(W, n) {
  const ctx = {};
  assert(AI.ACTS.cook.can(n, W));
  assert(AI.ACTS.cook.start(n, W, ctx));
  n.act = { id: 'cook', stage: 'do', started2: true, left: 75, total: 150, ctx };
  return ctx;
}
function finishCook(W, n, ctx) { AI.ACTS.cook.done(n, W, ctx); assert(ctx.m > 0); }
function eat(W, n) {
  const ctx = {};
  assert(AI.ACTS.eat.start(n, W, ctx));
  AI.ACTS.eat.tick(n, W, ctx);
  AI.ACTS.eat.done(n, W, ctx);
  return ctx;
}

// Paid cooking completes once, survives a mid-action save, and tick cannot mint food/buffs.
{
  const { W, n } = fixture('v214_paid_cooking', 'SPIRIT_FEAST_HEALER');
  const ctx = startCook(W, n);
  assert(AI.isProtectedAction(W, n, 'chat'), 'paid cooking should resist casual social interruption');
  const paidGrain = ECO.count(W, 'grain');
  assert(AI.ACTS.cook.start(n, W, ctx));
  assert.equal(ECO.count(W, 'grain'), paidGrain);
  const skillBefore = n.h.skills.cooking;
  for (let i = 0; i < 40; i++) AI.ACTS.cook.tick(n, W, ctx);
  assert(n.h.skills.cooking > skillBefore);
  assert.equal(ECO.count(W, 'meal'), 0);
  assert(!W.sect.mealSpecialties);
  assert(!(n.buffs || []).some(b => b.id === 'professionMeal'));
  const loaded = SIM.deserialize(SIM.serialize(W)), restored = loaded.byId[n.id];
  assert(loaded.sect.craftTransactions.open[restored.act.ctx.craftReceipt.id]);
  finishCook(W, n, ctx); finishCook(loaded, restored, restored.act.ctx);
  assert.deepEqual(loaded.sect.mealSpecialties, W.sect.mealSpecialties);
  assert.equal(ECO.count(loaded, 'meal'), ECO.count(W, 'meal'));
  assert.equal(ECO.count(loaded, 'grain'), paidGrain);
  const count = ECO.count(W, 'meal'), prog = JSON.stringify(n.cult), merit = n.merit;
  AI.ACTS.cook.done(n, W, ctx);
  assert.equal(ECO.count(W, 'meal'), count);
  assert.equal(JSON.stringify(n.cult), prog);
  assert.equal(n.merit, merit);
}

// Both specializations produce distinct consumable outcomes, with shared cooldown and expiry.
for (const [sub, role] of [['SPIRIT_FEAST_HEALER', 'RECOVERY_FOOD'], ['JADE_MEAL_PREPARER', 'CULTIVATION_FOOD']]) {
  const { W, n } = fixture('v214_food_' + sub, sub);
  const ctx = startCook(W, n); finishCook(W, n, ctx);
  assert.equal(W.sect.mealSpecialties[0].role, role);
  assert(W.sect.mealSpecialties[0].servings <= ECO.count(W, 'meal'));
  n.h.state.hp = CULT.hpMax(n) * 0.5; n.h.state.qi = CULT.qiMax(n) * 0.5; n.h.state.rest = 40;
  const hp = n.h.state.hp, qi = n.h.state.qi, rate = CULT.rate(n);
  const before = ECO.count(W, 'meal'), mealCtx = eat(W, n);
  const buff = n.buffs.find(b => b.id === 'professionMeal');
  assert(buff); assert.equal(buff.until, W.t + 180);
  assert.equal(ECO.count(W, 'meal'), before - 1);
  assert.equal(n.specialMealCooldownUntil, W.t + 360);
  if (role === 'RECOVERY_FOOD') { assert(n.h.state.hp > hp); assert(buff.p.def > 0); assert.equal(buff.cultRateBonus, 0); }
  else { assert(n.h.state.qi > qi); assert(buff.cultRateBonus >= 0.03 && buff.cultRateBonus <= 0.06); assert(CULT.rate(n) > rate); assert(CULT.rate(n) <= rate * 1.061); }
  const snapshot = JSON.stringify({ buffs: n.buffs, hp: n.h.state.hp, qi: n.h.state.qi });
  AI.ACTS.eat.done(n, W, mealCtx);
  assert.equal(JSON.stringify({ buffs: n.buffs, hp: n.h.state.hp, qi: n.h.state.qi }), snapshot);
  assert.equal(AI.ACTS.eat.start(n, W, mealCtx), false);
  const until = buff.until; eat(W, n);
  assert.equal(n.buffs.filter(b => b.id === 'professionMeal').length, 1);
  assert.equal(n.buffs.find(b => b.id === 'professionMeal').until, until);
  const loaded = SIM.deserialize(SIM.serialize(W)), restored = loaded.byId[n.id];
  assert.equal(restored.specialMealCooldownUntil, n.specialMealCooldownUntil);
  assert.deepEqual(restored.buffs, n.buffs);
  STATS.purgeExpired(restored, until);
  assert(!restored.buffs.some(b => b.id === 'professionMeal'));
}

// Selling/using stock consumes entitlement; expired meals stay edible without stale buffs.
{
  const { W, n } = fixture('v214_stock_backing', 'SPIRIT_FEAST_HEALER');
  finishCook(W, n, startCook(W, n));
  const meals = ECO.count(W, 'meal');
  assert(ECO.take(W, 'meal', meals));
  ECO.add(W, 'meal', meals);
  eat(W, n);
  assert(!(n.buffs || []).some(b => b.id === 'professionMeal'));
  finishCook(W, n, startCook(W, n));
  W.t += 1441; STATS.now = W.t;
  eat(W, n);
  assert(!(n.buffs || []).some(b => b.id === 'professionMeal'));
}

// Cooking remains available and productive for every path, including legacy saves.
for (const path of Object.keys(CULT.PATHS)) {
  const { W, n } = fixture('v214_universal_' + path, 'NONE'); n.cult.path = path;
  finishCook(W, n, startCook(W, n));
  assert(ECO.count(W, 'meal') > 0);
  assert(!W.sect.mealSpecialties || W.sect.mealSpecialties.length === 0);
}

// Armor specialization modifies an actual completed paid forge output once, never weapons.
{
  const { W, n } = fixture('v214_armor', 'CELESTIAL_ARMOR_ARTISAN');
  const recipe = JD.ITEMS.recipes.find(r => r.outType === 'EQUIPMENT' && !r.proceduralOut && r.outItemId && ECO.itemById[r.outItemId] && ECO.itemById[r.outItemId].slot === 'ARMOR');
  assert(recipe, 'fixture requires existing armor recipe');
  for (const input of recipe.inputs) ECO.add(W, input.matId, input.count);
  W.sect.recipeTier = 9; W.sect.knownRecipes = [recipe.id];
  const ctx = { rid: recipe.id }; assert(ECO.reserveInputs(W, recipe, ctx, n));
  const chance = ECO.successChance; ECO.successChance = () => 1;
  const result = ECO.finishCraft(W, n, recipe, ctx); ECO.successChance = chance;
  assert(result.ok); assert(result.gear.artisan);
  assert(result.gear.artisan.defenseBonus > 0 && result.gear.artisan.defenseBonus <= 0.08);
  assert(result.gear.maxDur > 100 && result.gear.maxDur <= 112);
  const baseline = structuredClone(result.gear); delete baseline.st; delete baseline.artisan;
  assert(STATS.gearStats(result.gear).def > STATS.gearStats(baseline).def);
  const gearCount = W.sect.gear.length, saved = JSON.stringify(result.gear);
  assert(ECO.finishCraft(W, n, recipe, ctx).rejected);
  assert.equal(W.sect.gear.length, gearCount);
  assert.equal(ECO.applyArmorArtisan(n, result.gear), false);
  assert.equal(JSON.stringify(result.gear), saved);
  const weapon = { slot: 'WEAPON', tier: 1, q: 1, nameTh: 'ดาบทดสอบ' };
  assert.equal(ECO.applyArmorArtisan(n, weapon), false);
  const loaded = SIM.deserialize(SIM.serialize(W));
  assert.deepEqual(loaded.sect.gear.find(x => x.uid === result.gear.uid).artisan, result.gear.artisan);
}

// Skill effects and drill choices respond to skill/subpath changes within the same tick.
{
  const { W, n } = fixture('v214_profession_skill_cache', 'SPIRIT_FEAST_HEALER');
  for (const key of MARTIAL.SKILL_IDS) MARTIAL.skillSet(n, key, 0);
  MARTIAL.skillSet(n, 'cooking', 100);
  const before = MARTIAL.skillEffects(n).cultivation;
  MARTIAL.skillSet(n, 'cooking', 0);
  for (const key of Object.keys(n.h.interests)) n.h.interests[key] = 50;
  globalThis.HC.bump(n);
  assert.equal(MARTIAL.pickSkillPractice(W, n), 'cooking');
  MARTIAL.skillSet(n, 'cooking', 100);
  n.cult.sub = 'CELESTIAL_ARMOR_ARTISAN';
  assert(MARTIAL.skillEffects(n).cultivation < before);
  MARTIAL.skillSet(n, 'ARRAY', 90); const arr = MARTIAL.skillEffects(n);
  MARTIAL.skillSet(n, 'ARRAY', 0); assert(MARTIAL.skillEffects(n).p.mdef < arr.p.mdef);
  MARTIAL.skillSet(n, 'TALISMAN', 90); const tal = MARTIAL.skillEffects(n);
  MARTIAL.skillSet(n, 'TALISMAN', 0); assert(MARTIAL.skillEffects(n).p.def < tal.p.def);
}
// New subpath affinity uses the relevant trained skills rather than weapon skill.
{
  const { n } = fixture('v214_relevant_skill_affinity', 'SPIRIT_FEAST_HEALER');
  for (const [path, sub, primary] of [['CRAFT_CREATION', 'SPIRIT_FEAST_HEALER', 'cooking'], ['STRATEGY_GOVERNANCE', 'SECT_STEWARD', 'administration']]) {
    n.cult.path = path; n.cult.sub = sub;
    for (const id of Object.keys(CULT.subInfo(path, sub).skillWeights)) MARTIAL.skillSet(n, id, 0);
    const before = MARTIAL.pathSkillAffinity(n, path, sub);
    MARTIAL.skillSet(n, primary, 80);
    const after = MARTIAL.pathSkillAffinity(n, path, sub);
    assert(after > before); assert(after >= 0 && after <= 18);
    MARTIAL.skillSet(n, 'SWORD', 100);
    assert.equal(MARTIAL.pathSkillAffinity(n, path, sub), after);
  }
}
// Skill mutation versions invalidate fit caches without per-tick bumps at the skill cap.
{
  const { n } = fixture('v214_path_skill_version', 'SPIRIT_FEAST_HEALER');
  MARTIAL.skillSet(n, 'cooking', 0);
  const version = n._pathSkillVersion;
  MARTIAL.skillSet(n, 'cooking', 0);
  assert.equal(n._pathSkillVersion, version);
  MARTIAL.skillPractice(n, 'cooking', 0.001, 1);
  assert.equal(n._pathSkillVersion, version, 'tiny practice stays within the same quarter-level band');
  MARTIAL.skillPractice(n, 'cooking', 100, 1);
  assert(n._pathSkillVersion > version);
  MARTIAL.skillSet(n, 'cooking', 100);
  const cappedVersion = n._pathSkillVersion;
  MARTIAL.skillPractice(n, 'cooking', 1, 1);
  assert.equal(n._pathSkillVersion, cappedVersion, 'capped practice cannot churn the fit cache');
}
// Path-score cache observes authoritative setters and bounded practice invalidation.
{
  const { n } = fixture('v214_path_score_cache', 'SPIRIT_FEAST_HEALER');
  const score = list => list.find(x => x.sub === 'SPIRIT_FEAST_HEALER').score;
  MARTIAL.skillSet(n, 'cooking', 0);
  const novice = CULT.pathScores(n);
  assert.strictEqual(CULT.pathScores(n), novice, 'unchanged path scores reuse their cache');
  MARTIAL.skillSet(n, 'cooking', 80);
  assert(score(CULT.pathScores(n)) > score(novice), 'skillSet refreshes an already cached subpath score');
  MARTIAL.skillSet(n, 'cooking', 0);
  const beforePractice = CULT.pathScores(n);
  MARTIAL.skillPractice(n, 'cooking', 100, 1);
  assert(score(CULT.pathScores(n)) > score(beforePractice), 'real practice refreshes cached subpath scores');
}
// An actual visiting envoy improves diplomacy, and multiple envoys cannot stack bonuses.
{
  const { W, n } = fixture('v214_envoy_transaction', 'SECT_STEWARD');
  n.cult.path = 'STRATEGY_GOVERNANCE';
  MARTIAL.skillSet(n, 'diplomacy', 100);
  const target = W.world.sects[0]; target.attitude = 0; target.style = 'สงบ';
  W.world.sects = [target]; W.rng.gauss = () => 0; W.sect.policy.openness = 0;
  const out = () => ({ notes: [], mats: {}, pills: {}, gear: [], techs: [], stones: 0, rep: 0 });
  const ordinary = { journal: [] }; EXPED.diplomacyResult(W, ordinary, [n], out());
  const ordinaryAttitude = target.attitude;
  target.attitude = 0; n.cult.sub = 'DIPLOMATIC_ENVOY';
  assert.equal(EXPED.envoyBonus([n]), 2);
  assert.equal(EXPED.envoyBonus([n, n]), 2);
  assert.equal(EXPED.envoyBonus([{ ...n, dead: true }]), 0);
  assert.equal(EXPED.envoyBonus([]), 0);
  const envoy = { journal: [] }; EXPED.diplomacyResult(W, envoy, [n], out());
  assert.equal(target.attitude, ordinaryAttitude + 2, 'participating envoy improves the actual attitude transaction');
  assert(envoy.journal[0].includes('เยือน'));
}
// A civil mentor's real teaching improves practice quality without granting idle skill.
{
  const { W, n } = fixture('v214_civil_mentor', 'CIVIL_TEACHING_MENTOR');
  n.cult.path = 'STRATEGY_GOVERNANCE'; n.h.skills.SCRIPTURE = 100;
  const student = W.npcs.find(x => x !== n && !x.dead);
  n.act = { id: 'pair', stage: 'do', ctx: { skillTgt: 'SCRIPTURE', pair: { type: 'teach', partner: student.id, role: 'a', left: 99 } } };
  student.act = { id: 'pair', stage: 'do', ctx: { pair: { type: 'teach', partner: n.id, role: 'b', left: 99 } } };
  MARTIAL.skillSet(student, 'SCRIPTURE', 20);
  AI.pairTick(W, n);
  const specializedGain = MARTIAL.skillRead(student, 'SCRIPTURE') - 20;
  n.cult.sub = 'BATTLEFIELD_STRATEGIST';
  MARTIAL.skillSet(student, 'SCRIPTURE', 20);
  AI.pairTick(W, n);
  const ordinaryGain = MARTIAL.skillRead(student, 'SCRIPTURE') - 20;
  assert(specializedGain > ordinaryGain);
  assert(specializedGain <= ordinaryGain * 1.1);
}
// Generic pill tiers use shared realm equivalence; path-specific btFor stays raw.
for (const [path, stage] of [['GOD', 4], ['BODY', 5], ['XIAN', 9]]) {
  const { W, n } = fixture('v214_generic_pill_' + path, 'NONE');
  n.cult.path = path; n.cult.stage = stage; n.cult.track = null;
  n.cult.pillT = 0; n.cult.toxic = 0; n.cult.btBonus = 0;
  n.rank = 3; n.inv.stones = 100000; n.cp = 100000; n.cult.prog = 0;
  W.sect.gear = []; n.inv.pills = {};
  const high = 'P:REC140_PARTIAL_DRAGON_PILL_7', low = 'P:REC140_ALC_GOLDEN_CORE_4';
  W.sect.stock = { [high]: 1 };
  assert.equal(CULT.equivalentStage(n), 9);
  assert.equal(AI.wantedPill(W, n).key, high, path + ' can select generic T7 preparation');
  AI.ACTS.breakthrough.start(n, W, {});
  assert.equal(ECO.count(W, high), 0, path + ' actually consumes generic breakthrough preparation');
  assert(n.cult.btBonus >= 0.35);
  n.inv.pills = { [low]: 1, [high]: 1 }; n.cult.pillT = 0;
  AI.ACTS.cultivate.start(n, W, {});
  assert.equal(n.inv.pills[low], 1, path + ' preserves low-tier cultivation pills at equivalent realm9');
  assert.equal(n.inv.pills[high], 1, path + ' applies the same T7 relevance rule at equivalent realm9');
  n.cult.stage = 1; n.cult.bn = null;
  n.inv.pills = { 'P:REC140_ALC_QI_DEW_1': 1 };
  AI.ACTS.cultivate.start(n, W, {});
  assert(!n.inv.pills['P:REC140_ALC_QI_DEW_1'], path + ' novice still consumes suitable generic progress pill');
  n.cult.stage = 2; n.cult.bn = true;
  const specific = 'P:BT_' + path + '_2'; W.sect.stock = { [specific]: 1 };
  assert.equal(AI.wantedPill(W, n).key, specific, 'btFor compares the exact native stage');
  n.cult.stage = 3;
  assert.equal(AI.wantedPill(W, n), null, 'wrong native stage cannot select a path-specific pill');
}
// Element gate skills initialize and train from the actual canonical affinities.
for (const skill of ['WATER_ICE', 'WOOD_LIFE']) {
  const { n } = fixture('v214_element_proficiency_' + skill, 'NONE');
  const low = structuredClone(n), high = structuredClone(n);
  low.h.affinities[skill] = 10; high.h.affinities[skill] = 90;
  delete low.h.skills[skill]; delete high.h.skills[skill];
  globalThis.HC.bump(low); globalThis.HC.bump(high);
  MARTIAL.ensureSkills(low); MARTIAL.ensureSkills(high);
  assert(MARTIAL.skillRead(high, skill) > MARTIAL.skillRead(low, skill), skill + ' initialization respects canonical affinity');
  MARTIAL.skillSet(low, skill, 20); MARTIAL.skillSet(high, skill, 20);
  const lowGain = MARTIAL.skillPractice(low, skill, 1, 1), highGain = MARTIAL.skillPractice(high, skill, 1, 1);
  assert(highGain > lowGain, skill + ' practice respects canonical affinity');
}
console.log('v214 profession runtime: PASS');
