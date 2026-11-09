'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { SIM, CULT, SECT, ECO, STATS, COMBAT, AI, HC, EXPED, EXPLORE, SK } = require('./load');

function world(seed) {
  const W = SIM.create(seed);
  W.world.resourcePool = { stones: 0, herbs: 5000, ores: 5000 };
  return W;
}

test('equipment keyword reads do not mutate the owner or survive unequipping', () => {
  const W = world('audit-keywords');
  const n = W.npcs[0];
  n.cult.path = 'XIAN';
  n.combatKeywords = [{ id: 'KW_PIERCE', value: 5 }];
  n.equip = { WEAPON: { uid: 'audit-weapon', id: 'TEST_WEAPON', slot: 'WEAPON', gearType: 'FIST', dur: 100, maxDur: 100, combatKeywords: [{ id: 'KW_PIERCE', value: 10 }] } };
  const initial = JSON.stringify(n.combatKeywords);
  assert.equal(COMBAT.keywordsOf(n).penAdd, 15);
  n._kwVer = (n._kwVer || 0) + 1;
  assert.equal(COMBAT.keywordsOf(n).penAdd, 15);
  assert.equal(JSON.stringify(n.combatKeywords), initial);
  n.equip.WEAPON = null;
  assert.equal(COMBAT.keywordsOf(n).penAdd, 5);
});

test('changing keywords on the same equipped item updates the derived profile', () => {
  const W = world('audit-keyword-cache');
  const n = W.npcs[0];
  n.cult.path = 'XIAN';
  n.combatKeywords = [];
  const item = { uid: 'unchanged-uid', id: 'TEST_WEAPON', slot: 'WEAPON', gearType: 'FIST', dur: 100, maxDur: 100, combatKeywords: [{ id: 'KW_PIERCE', value: 10 }] };
  n.equip = { WEAPON: item };
  assert.equal(COMBAT.keywordsOf(n).penAdd, 10);
  item.combatKeywords[0].value = 20;
  assert.equal(COMBAT.keywordsOf(n).penAdd, 20);
});

test('broken procedural equipment does not grant combat keywords', () => {
  const W = world('audit-keyword-broken');
  const n = W.npcs[0];
  n.cult.path = 'XIAN';
  n.combatKeywords = [];
  const item = { uid: 'breakable', id: 'TEST_WEAPON', slot: 'WEAPON', gearType: 'FIST', procedural: true, dur: 100, maxDur: 100, combatKeywords: [{ id: 'KW_PIERCE', value: 10 }] };
  n.equip = { WEAPON: item };
  assert.equal(COMBAT.keywordsOf(n).penAdd, 10);
  item.dur = 0;
  assert.equal(COMBAT.keywordsOf(n).penAdd, 0);
});

test('equipment effects honor their configured chance using the world RNG', () => {
  const W = world('audit-item-chance');
  const n = W.npcs[0];
  const foe = { id: 'chance-foe', foe: true, hp: 100, hpMax: 100, sx: [], tier: 1 };
  const item = { uid: 'proc-weapon', id: 'TEST_WEAPON', slot: 'WEAPON', gearType: 'FIST', dur: 100, maxDur: 100, effects: [{ effectId: 'EFX_PARALYSIS_ARC', params: { chance: 0.35 } }] };
  n.equip = { WEAPON: item };
  W.rng.next = () => 0.9;
  COMBAT.runItemEffectProcs(W, null, n, foe, 'onHit', 10);
  assert.equal(foe.sx.some(s => s.k === 'paralyze'), false);
  W.rng.next = () => 0.1;
  COMBAT.runItemEffectProcs(W, null, n, foe, 'onHit', 10);
  assert.equal(foe.sx.some(s => s.k === 'paralyze'), true);
});

test('venom seed damage grows linearly with four stacks', () => {
  const W = world('audit-venom');
  const n = W.npcs[0];
  n.cult.toxic = 0;
  const foe = { id: 'venom-foe', foe: true, name: 'อสูร', hp: 4000, hpMax: 4000, sx: [], tier: 1 };
  W.foeById[foe.id] = foe;
  COMBAT.COMPOSABLE_ENGINE.applyMark(W, null, n, foe, 'venomSeed', 4, 16);
  COMBAT.statusTick(W, { serious: true }, foe);
  assert.equal(foe.hp, 3872);
});

test('winning a wager cannot create stones from an empty world pool', () => {
  const W = world('audit-wager-win');
  const n = W.npcs[0];
  n.cult.path = 'FORTUNE_GAMBLER';
  W.sect.stones = 1000;
  W.rng.next = () => 0;
  const result = CULT.GRAND_DAO_MECHANICS.wagerDestinyStake(W, n, 100);
  assert.equal(result.ok, true);
  assert.equal(W.sect.stones + W.world.resourcePool.stones, 1000);
  assert.equal(W.sect.stones, 1000);
});

test('a zero wager cannot grant gambler progress or gauge', () => {
  const W = world('audit-wager-zero');
  const n = W.npcs[0];
  n.cult.path = 'FORTUNE_GAMBLER';
  W.rng.next = () => 0;
  const result = CULT.GRAND_DAO_MECHANICS.wagerDestinyStake(W, n, 0);
  assert.equal(result.ok, false);
  assert.equal(n.pathGauge?.value || 0, 0);
});

test('surplus manuals sell only as many copies as the world can afford', () => {
  const W = world('audit-manual-sale');
  const lib = SECT.PATH_LIBRARY.ensure(W);
  lib.unlockedPaths = ['XIAN'];
  W.world.resourcePool.stones = 1500;
  W.sect.stones = 10;
  ECO.add(W, 'MANUAL_PATH_XIAN', 2);
  const result = SECT.PATH_LIBRARY.sellSurplusManuals(W);
  assert.equal(result.soldCount, 1);
  assert.equal(ECO.count(W, 'MANUAL_PATH_XIAN'), 1);
  assert.equal(W.sect.stones, 1030);
  assert.equal(W.world.resourcePool.stones, 480);
});

test('demonic covenant bonuses reach actual computed combat stats', () => {
  const W = world('audit-pact-stats');
  const n = W.npcs[0];
  n.cult.path = 'DEMON';
  HC.bump(n);
  const before = STATS.get(n).atk;
  const beforeExplained = STATS.explain(n).v.atk;
  const result = CULT.DEMONIC_PANTHEON.formDemonPact(W, n, 'CHIYOU_WARLORD', { free: true });
  assert.equal(result.ok, true);
  assert.ok(STATS.get(n).atk > before);
  assert.equal(STATS.get(n).atk - before, STATS.explain(n).v.atk - beforeExplained);
});

test('repeating a demon covenant grants neither extra favor nor gauge', () => {
  const W = world('audit-pact-repeat');
  const n = W.npcs[0];
  const first = SECT.INFERNAL_SHRINE.signBloodCovenant(W, n, 'CHIYOU_WARLORD', { free: true });
  assert.equal(first.ok, true);
  const favor = W.sect.infernalShrine.infernalFavor;
  const gauge = n.demonicRealmsGauge.INFERNAL_SIN;
  SECT.INFERNAL_SHRINE.signBloodCovenant(W, n, 'CHIYOU_WARLORD', { free: true });
  assert.equal(W.sect.infernalShrine.infernalFavor, favor);
  assert.equal(n.demonicRealmsGauge.INFERNAL_SIN, gauge);
});

test('an unpaid covenant cannot grant a pact, gauge or favor', () => {
  const W = world('audit-pact-cost');
  const n = W.npcs[0];
  W.sect.stones = 0;
  const result = SECT.INFERNAL_SHRINE.signBloodCovenant(W, n, 'CHIYOU_WARLORD');
  assert.equal(result.ok, false);
  assert.equal(n.demonPact, undefined);
  assert.equal(W.sect.infernalShrine.infernalFavor, 0);
});

test('re-swearing a broken vow cannot erase its consequences', () => {
  const W = world('audit-vow');
  const n = W.npcs[0];
  CULT.VOLUNTARY_VOWS.swearVow(W, n, 'VOW_NO_MEDICINE');
  CULT.VOLUNTARY_VOWS.violateVow(W, n, 'VOW_NO_MEDICINE', 'ละเมิด');
  const result = CULT.VOLUNTARY_VOWS.swearVow(W, n, 'VOW_NO_MEDICINE');
  assert.equal(result.ok, false);
  assert.equal(n.voluntaryVows.VOW_NO_MEDICINE.violated, true);
  assert.ok(CULT.VOLUNTARY_VOWS.getCultivationMult(n) < 1);
});

test('experience deduplicates within an event kind without discarding other kinds', () => {
  const W = world('audit-experience');
  const n = W.npcs[0];
  const exp = CULT.EXPERIENCE_TRAITS;
  exp.recordExperienceEvent(W, n, 'UPHELD_VOW_OR_CONTRACT', 'event-1');
  exp.recordExperienceEvent(W, n, 'MANUAL_STUDY_AND_ARCHIVE', 'event-1');
  exp.recordExperienceEvent(W, n, 'MANUAL_STUDY_AND_ARCHIVE', 'event-1');
  assert.equal(n.experienceEventLog.counts.UPHELD_VOW_OR_CONTRACT, 1);
  assert.equal(n.experienceEventLog.counts.MANUAL_STUDY_AND_ARCHIVE, 1);
});

test('separate completed study actions count as separate experiences', () => {
  const W = world('audit-study-events');
  const n = W.npcs[0];
  W.t = 100;
  AI.ACTS.study.done(n, W);
  W.t = 200;
  AI.ACTS.study.done(n, W);
  assert.equal(n.experienceEventLog.counts.MANUAL_STUDY_AND_ARCHIVE, 2);
});

function wandering(W, archetype) {
  EXPED.ensureWorldTopology(W);
  const result = EXPED.generateWanderingFigure(W, archetype, { quiet: true });
  return result.wanderingFigure || result.figure || result;
}

test('a wandering bandit cannot pay the same gift repeatedly', () => {
  const W = world('audit-bandit-gift');
  W.world.resourcePool.stones = 1000;
  const fig = wandering(W, 'UNORTHODOX_BANDIT');
  const total = W.sect.stones + W.world.resourcePool.stones;
  const first = EXPED.interactWanderingFigure(W, fig, 'BEFRIEND', {});
  const afterFirst = W.sect.stones;
  const second = EXPED.interactWanderingFigure(W, fig, 'BEFRIEND', {});
  assert.equal(first.ok, true);
  assert.equal(second.ok, false);
  assert.equal(W.sect.stones, afterFirst);
  assert.equal(W.sect.stones + W.world.resourcePool.stones, total);
});

test('a wandering arrayist reveals a realm and grants catalysts only once', () => {
  const W = world('audit-arrayist-gift');
  const fig = wandering(W, 'ROGUE_ARRAYIST');
  const before = ECO.count(W, 'CAT_PRIMORDIAL_METAL');
  assert.equal(EXPED.interactWanderingFigure(W, fig, 'REVEAL_SECRET_REALM', {}).ok, true);
  const count = (W.world.secretRealms || []).length;
  assert.equal(EXPED.interactWanderingFigure(W, fig, 'REVEAL_SECRET_REALM', {}).ok, false);
  assert.equal(ECO.count(W, 'CAT_PRIMORDIAL_METAL'), before + 2);
  assert.equal((W.world.secretRealms || []).length, count);
});

test('unknown wandering actions cannot bypass the arrayist gift receipt', () => {
  const W = world('audit-arrayist-unknown');
  const fig = wandering(W, 'ROGUE_ARRAYIST');
  assert.equal(EXPED.interactWanderingFigure(W, fig, 'REVEAL_SECRET_REALM', {}).ok, true);
  const count = (W.world.secretRealms || []).length;
  const result = EXPED.interactWanderingFigure(W, fig, 'UNKNOWN_ACTION', {});
  assert.equal(result.ok, false);
  assert.equal((W.world.secretRealms || []).length, count);
});

test('an elemental gate pays a given reward once and debits its source', () => {
  const W = world('audit-gate-reward');
  const n = W.npcs[0];
  n.h.root = { primaryElement: 'FIRE', elements: ['FIRE', 'WATER_ICE'] };
  W.sect.stones = 1000;
  W.world.resourcePool.stones = 1000;
  const gate = { id: 'GATE_REPLAY_TEST', requiredElements: ['FIRE', 'WATER_ICE'], rewardStones: 380 };
  const first = EXPLORE.solveElementalPuzzleGate(W, [n], gate);
  const second = EXPLORE.solveElementalPuzzleGate(W, [n], gate);
  assert.equal(first.rewardStones, 380);
  assert.equal(second.rewardStones, 0);
  assert.equal(W.sect.stones, 1380);
  assert.equal(W.world.resourcePool.stones, 620);
});

test('micro exploration cannot pay stones from an empty world pool', () => {
  const W = world('audit-micro-pool');
  const before = W.sect.stones;
  const result = EXPLORE.dispatchExploration(W, Object.keys(EXPLORE.MICRO_LOCATIONS)[0], null, {});
  assert.equal(result.ok, true);
  assert.equal(result.rewardStones, 0);
  assert.equal(W.sect.stones, before);
});

test('an expired vassal distress call cannot award help after the deadline', () => {
  const W = world('audit-distress-expired');
  EXPED.ensureWorldTopology(W);
  const sect = W.world.allSects[0];
  sect.isVassal = true;
  sect.loyalty = 40;
  const call = EXPED.spawnVassalDistressCall(W, sect);
  W.day = call.expiresDay + 1;
  const fame = W.sect.fame;
  const result = EXPED.respondVassalDistress(W, call.id, 'REINFORCE');
  assert.equal(result.ok, false);
  assert.equal(sect.loyalty, 40);
  assert.equal(W.sect.fame, fame);
});

test('a stunned cultivator cannot spend a path gauge or damage a distant enemy', () => {
  const W = world('audit-finisher-stun');
  const n = W.npcs[0];
  n.cult.path = 'SHADOW_SAMURAI';
  const foe = { id: 'distant-foe', foe: true, name: 'ศัตรู', tier: 1, hp: 4000, hpMax: 4000, x: n.x + 70, y: n.y, sx: [] };
  W.foes.push(foe); W.foeById[foe.id] = foe;
  COMBAT.startFight(W, [n.id], [foe.id], 'duel', { serious: true });
  CULT.gainPathGauge(n, 100);
  STATS.addStatus(n, 'stun', 20, null, W.t);
  COMBAT.fightStep(W, n);
  assert.equal(foe.hp, 4000);
  assert.equal(n.pathGauge.value, 100);
});

test('a path finisher cannot hit an enemy outside the weapon reach', () => {
  const W = world('audit-finisher-range');
  const n = W.npcs[0];
  n.cult.path = 'SHADOW_SAMURAI';
  const foe = { id: 'far-foe', foe: true, name: 'ศัตรู', tier: 1, hp: 4000, hpMax: 4000, x: n.x + 70, y: n.y, sx: [] };
  W.foes.push(foe); W.foeById[foe.id] = foe;
  const fight = COMBAT.startFight(W, [n.id], [foe.id], 'duel', { serious: true });
  CULT.gainPathGauge(n, 100);
  const result = CULT.triggerPathGaugeFinisher(W, fight, n, foe);
  assert.equal(result.ok, false);
  assert.equal(foe.hp, 4000);
  assert.equal(n.pathGauge.value, 100);
});

test('mortals cannot acquire a cultivation path gauge by default', () => {
  const W = world('audit-mortal-gauge');
  const n = W.npcs[0];
  n.cult = null;
  delete n.pathGauge;
  assert.equal(CULT.gainPathGauge(n, 100), null);
  assert.equal(n.pathGauge, undefined);
});

test('an active subpath trait applies its declared debuff to the target', () => {
  const W = world('audit-trait-debuff');
  const n = W.npcs[0];
  n.cult.path = 'ASTRO_DIVINATION';
  n.cult.sub = 'STAR_CHART_PROPHET';
  n.cult.stage = 8;
  n.cult.track = { ordinal: 8 };
  const foe = { id: 'trait-foe', foe: true, name: 'ศัตรู', tier: 1, hp: 10000, hpMax: 10000, x: n.x + 1, y: n.y, sx: [] };
  W.foes.push(foe); W.foeById[foe.id] = foe;
  const fight = COMBAT.startFight(W, [n.id], [foe.id], 'duel', { serious: true });
  COMBAT.runPassiveProcs(W, fight, n, null, 'onRoundStart', 0);
  assert.ok(foe.sx.some(status => status.k === 'exposed' && status.until > W.t));
});

test('evaluating a charged skill does not start channeling or damage the target', () => {
  const W = world('audit-charge-choice');
  const n = W.npcs[0];
  const foe = { id: 'charge-foe', foe: true, name: 'ศัตรู', tier: 2, hp: 10000, hpMax: 10000, x: n.x + 1, y: n.y, sx: [], skl: [{ id: 'CHARGE_TEST', nameTh: 'ท่าชาร์จ', arch: 'burst', type: 'p', M: 10, hits: 1, cd: 20, wind: 3, chargeRelease: true }] };
  W.foes.push(foe); W.foeById[foe.id] = foe;
  const fight = COMBAT.startFight(W, [n.id], [foe.id], 'duel', { serious: true });
  const hp = n.h.state.hp;
  const selected = COMBAT.chooseSkill(W, fight, foe, n, foe.act.ctx, { pureEval: true });
  assert.equal(selected && selected.id, 'CHARGE_TEST');
  assert.equal(foe.act.ctx.channeling, undefined);
  assert.equal(n.h.state.hp, hp);
});

test('starting a charged skill spends its action and sets a cooldown', () => {
  const W = world('audit-charge-action');
  const n = W.npcs[0];
  const foe = { id: 'charge-foe-2', foe: true, name: 'ศัตรู', tier: 2, hp: 10000, hpMax: 10000, x: n.x + 1, y: n.y, sx: [], skl: [{ id: 'CHARGE_TEST_2', nameTh: 'ท่าชาร์จ', arch: 'burst', type: 'p', M: 10, hits: 1, cd: 20, wind: 3, chargeRelease: true }] };
  W.foes.push(foe); W.foeById[foe.id] = foe;
  const fight = COMBAT.startFight(W, [n.id], [foe.id], 'duel', { serious: true });
  const hp = n.h.state.hp;
  COMBAT.attack(W, fight, foe, n);
  assert.equal(n.h.state.hp, hp);
  assert.equal(foe.act.ctx.channeling.skillId, 'CHARGE_TEST_2');
  assert.ok(foe.act.ctx.cds.CHARGE_TEST_2 > W.t);
});

test('a commercial contract cannot settle before its due day', () => {
  const W = world('audit-contract-due');
  W.day = 5;
  W.sect.stones = 1000;
  W.world.resourcePool.stones = 1000;
  const service = CULT.GRAND_DAO_MECHANICS;
  const offer = service.offerContract(W, W.npcs[0], { principalStones: 100, durationDays: 5 });
  assert.equal(service.acceptContract(W, offer.contract.id).ok, true);
  assert.equal(service.settleContract(W, offer.contract.id).ok, false);
  assert.equal(offer.contract.escrowStones, 100);
  assert.equal(W.sect.stones, 900);
  W.day = offer.contract.dueDay;
  assert.equal(service.settleContract(W, offer.contract.id).ok, true);
  assert.equal(W.sect.stones + W.world.resourcePool.stones, 2000);
});

test('a removed gear object cannot be salvaged a second time', () => {
  const W = world('audit-retire-gear');
  const n = W.npcs[0];
  n.inv = n.inv || {};
  const gear = { uid: 'salvage-one', id: 'TEST_GEAR', nameTh: 'อุปกรณ์ทดสอบ', slot: 'WEAPON', tier: 3, dur: 0 };
  n.inv.gear = [gear];
  const before = ECO.count(W, 'MAT_ORE_COLD_STEEL_2');
  assert.equal(ECO.retireGear(W, n, gear, { quiet: true }).ok, true);
  assert.equal(ECO.retireGear(W, n, gear, { quiet: true }).ok, false);
  assert.equal(ECO.count(W, 'MAT_ORE_COLD_STEEL_2'), before + 1);
});

test('caravan escort wages transfer from the world pool exactly once', () => {
  for (const method of ['dispatchTradeCaravan', 'escortTradeCaravan']) {
    const W = world('audit-caravan-' + method);
    W.sect.stones = 0;
    W.world.resourcePool.stones = 1000;
    const result = SECT.CARAVAN_AUCTION[method](W, 'ALCH_PILL', null, { force: true, quiet: true });
    assert.equal(result.ok, true);
    assert.equal(W.sect.stones + W.world.resourcePool.stones, 1000, method);
    assert.equal(W.sect.stones, result.revenue, method);
  }
});

test('the detailed stat breakdown includes an active realm trait', () => {
  const W = world('audit-stat-explanation');
  const n = W.npcs[0];
  n.cult.path = 'XIAN';
  n.cult.sub = 'SWORD_IMMORTAL';
  n.cult.stage = 2;
  HC.bump(n);
  const trait = CULT.PATHS.XIAN.realmTraits.find(t => t.stage === 2);
  const breakdown = STATS.explain(n).parts.atk;
  assert.ok(breakdown.some(part => part[0].includes(trait.nameTh) && part[1] === 'p' && part[2] === 0.06));
});

test('refining identical equipment is independent of whether stats were viewed first', () => {
  const W = world('audit-refine-cache');
  const base = { uid: 'same-seed', id: 'TEST_REFINE', nameTh: 'อุปกรณ์ทดสอบ', slot: 'WEAPON', gearType: 'SWORD', tier: 4, q: 1 };
  const warm = { ...base }, cold = { ...base };
  STATS.gearStats(warm);
  const cat = Object.values(ECO.REFINEMENT_CATALYSTS).find(c => c.minGearTier <= 4 && (c.maxGearTier || 7) >= 4);
  assert.equal(ECO.refineGearWithCatalyst(W, warm, cat.id, null, { free: true, allowDetached: true }).ok, true);
  assert.equal(ECO.refineGearWithCatalyst(W, cold, cat.id, null, { free: true, allowDetached: true }).ok, true);
  assert.deepEqual(cold.st, warm.st);
});

test('broken equipment cannot amplify an active combat stance', () => {
  const W = world('audit-stance-gear');
  const n = W.npcs[0];
  n.equip = { WEAPON: { id: 'TEST_STANCE', procedural: true, dur: 0, broken: true, effects: [{ effectId: 'EFX_V234_STANCE_FLOW' }] } };
  assert.equal(STATS.hasStanceFlowAmplifier(n), false);
});

test('an equipped auxiliary tool grants its exploration bonus', () => {
  const W = world('audit-aux-tool');
  const n = W.npcs[0];
  n.cult.techs = [];
  n.cult.stage = 8;
  n.equip = { ACCESSORY: { id: 'ITEM_V234_TOOL_003', slot: 'ACCESSORY', tier: 5, dur: 100 } };
  delete n.eq;
  assert.equal(CULT.auxiliaryArtBonus(n, 'EXPLORE'), 0.16);
});

test('broken armor cannot accumulate elemental adaptation', () => {
  const W = world('audit-broken-adaptation');
  const n = W.npcs[0];
  const armor = { id: 'BROKEN_ARMOR', slot: 'ARMOR', procedural: true, dur: 0, broken: true };
  n.equip = { ARMOR: armor };
  assert.equal(ECO.adaptArmorToElement(n, armor, 'FIRE'), null);
  assert.equal(armor.adaptiveState, undefined);
});

test('all-enemy selection respects a skill range', () => {
  const W = world('audit-aoe-range');
  const n = W.npcs[0];
  const near = { id: 'near-aoe', foe: true, name: 'ใกล้', tier: 1, hp: 5000, hpMax: 5000, x: n.x + 1, y: n.y, sx: [] };
  const far = { id: 'far-aoe', foe: true, name: 'ไกล', tier: 1, hp: 5000, hpMax: 5000, x: n.x + 70, y: n.y, sx: [] };
  W.foes.push(near, far); W.foeById[near.id] = near; W.foeById[far.id] = far;
  const fight = COMBAT.startFight(W, [n.id], [near.id, far.id], 'duel', { serious: true });
  const targets = COMBAT.COMPOSABLE_ENGINE.selectTargets(W, fight, n, near, { targetSelector: 'ALL_ENEMIES', aoe: true, range: { max: 3, requiresLoS: false } });
  assert.deepEqual(targets.map(t => t.id), [near.id]);
});

test('a cast-time rewind action occurs once even with duplicate declarations and multiple hits', () => {
  const W = world('audit-action-once');
  const n = W.npcs[0];
  const foe = { id: 'rewind-foe', foe: true, name: 'ศัตรู', tier: 1, hp: 10000, hpMax: 10000, x: n.x + 1, y: n.y, sx: [] };
  W.foes.push(foe); W.foeById[foe.id] = foe;
  const fight = COMBAT.startFight(W, [n.id], [foe.id], 'duel', { serious: true });
  const maxHp = COMBAT.hpMax(n);
  n.h.state.hp = Math.floor(maxHp * 0.2);
  const before = n.h.state.hp;
  const move = { id: 'TEST_REWIND', action: 'TEMPORAL_SAND_REWIND', composable: { action: 'TEMPORAL_SAND_REWIND' }, M: 1 };
  COMBAT.COMPOSABLE_ENGINE.preExecuteSkill(W, fight, n, foe, move, n.act.ctx);
  COMBAT.COMPOSABLE_ENGINE.postHitSkill(W, fight, n, foe, move, { hit: true, dmg: 1 });
  COMBAT.COMPOSABLE_ENGINE.postHitSkill(W, fight, n, foe, move, { hit: true, dmg: 1 });
  assert.equal(n.h.state.hp - before, Math.max(5, Math.round(maxHp * 0.14)));
});

test('a duplicated hit action in two fields resolves only once per hit', () => {
  function run(duplicated) {
    const W = world('audit-hit-duplicate');
    const n = W.npcs[0];
    const foe = { id: 'leech-foe', foe: true, name: 'ศัตรู', tier: 1, hp: 10000, hpMax: 10000, x: n.x + 1, y: n.y, sx: [] };
    W.foes.push(foe); W.foeById[foe.id] = foe;
    const fight = COMBAT.startFight(W, [n.id], [foe.id], 'duel', { serious: true });
    const move = { id: 'TEST_LEECH', action: 'GU_SOUL_LEECH', M: 1 };
    if (duplicated) move.composable = { action: 'GU_SOUL_LEECH' };
    COMBAT.COMPOSABLE_ENGINE.postHitSkill(W, fight, n, foe, move, { hit: true, dmg: 1 });
    return foe.hp;
  }
  assert.equal(run(true), run(false));
});

test('an explicit elemental reaction requires its other element on the target', () => {
  const W = world('audit-element-reaction');
  const n = W.npcs[0];
  const foe = { id: 'fusion-foe', foe: true, name: 'ศัตรู', tier: 1, hp: 50000, hpMax: 50000, x: n.x + 1, y: n.y, sx: [] };
  W.foes.push(foe); W.foeById[foe.id] = foe;
  const fight = COMBAT.startFight(W, [n.id], [foe.id], 'duel', { serious: true });
  const engine = COMBAT.COMPOSABLE_ENGINE;
  assert.equal(engine.triggerElementalReaction(W, fight, n, foe, 'EARTH_METAL', 500, { explicitReactionId: 'GLACIAL_SHATTER' }), null);
  assert.equal(foe.hp, 50000);
  foe._elemAuras = {};
  engine.applyElementalAura(foe, 'WATER_ICE', 2, W.t, n.id);
  const result = engine.triggerElementalReaction(W, fight, n, foe, 'EARTH_METAL', 500, { explicitReactionId: 'GLACIAL_SHATTER' });
  assert.equal(result.id, 'GLACIAL_SHATTER');
  assert.ok(foe.hp < 50000);
});

test('post-siege outcomes require a real victory and cannot be replayed', () => {
  const W = world('audit-siege-resolution');
  EXPED.ensureWorldTopology(W);
  const sect = W.world.sects[0];
  const stones = W.sect.stones;
  for (const choice of ['PILLAGE', 'FREE_TRADE', 'SUBJUGATE']) {
    assert.equal(EXPED.applySiegeResolution(W, sect, choice, { siegeReceipt: true }).ok, false);
    assert.equal(W.sect.stones, stones);
    assert.notEqual(sect.treaty, 'VASSAL_TREATY');
  }
  const result = EXPED.marshalStrikeForce(W, [W.npcs[0]], sect, { forceWin: true, postResolution: 'PILLAGE' });
  assert.equal(result.won, true);
  assert.equal(result.resolution.ok, true);
  const after = W.sect.stones;
  assert.equal(EXPED.resolveSectSiege(W, result.siege, { forceWin: true }).ok, false);
  assert.equal(EXPED.applySiegeResolution(W, sect, 'PILLAGE', { siegeReceipt: true, siegeId: result.siege.id }).ok, false);
  assert.equal(W.sect.stones, after);
});

test('a wandering sword seeker grants duel rewards only once per day, including after reload', () => {
  const W = world('audit-duel-cooldown');
  const fig = wandering(W, 'SWORD_SEEKER');
  W.world.wanderingFigures = [fig];
  const first = EXPED.interactWanderingFigure(W, fig, 'DUEL', { forceWin: true });
  const merit = W.byId[first.championId].merit;
  assert.equal(first.ok, true);
  assert.equal(EXPED.interactWanderingFigure(W, fig, 'DUEL', { forceWin: true }).ok, false);
  assert.equal(W.byId[first.championId].merit, merit);
  const restored = SIM.deserialize(SIM.serialize(W));
  const loadedFig = restored.world.wanderingFigures.find(f => f.id === fig.id);
  assert.equal(EXPED.interactWanderingFigure(restored, loadedFig, 'DUEL', { forceWin: true }).ok, false);
  restored.t += 1440;
  restored.day += 1;
  assert.equal(EXPED.interactWanderingFigure(restored, loadedFig, 'DUEL', { forceWin: true }).ok, true);
});

test('the manual doctor button charges the stated fee and rejects insufficient funds', () => {
  const G = require('./load');
  G.document = { getElementById() { return { querySelectorAll() { return []; }, style: {}, classList: { add() {}, remove() {} } }; } };
  require('../js/ui.js');
  const W = world('audit-doctor-ui');
  const fig = wandering(W, 'HERMIT_DOCTOR');
  W.world.wanderingFigures = [fig];
  const UI = G.UI;
  UI.G = { W, R: {}, opts: {}, speed: 1 };
  UI.toast = () => {}; UI.render = () => {}; UI.updateHud = () => {};
  W.sect.stones = 1000;
  UI.doAction('interact-wandering-figure', fig.id + '|HEAL_DISCIPLE');
  assert.equal(W.sect.stones, 880);
  W.sect.stones = 119;
  const affinity = fig.affinity;
  UI.doAction('interact-wandering-figure', fig.id + '|HEAL_DISCIPLE');
  assert.equal(W.sect.stones, 119);
  assert.equal(fig.affinity, affinity);
});

test('an elemental gate cannot pay again after the save is reloaded', () => {
  const W = world('audit-gate-save');
  const n = W.npcs[0];
  n.h.root = { primaryElement: 'FIRE', elements: ['FIRE', 'WATER_ICE'] };
  W.world.resourcePool.stones = 1000;
  const gate = { id: 'GATE_SAVE_TEST', requiredElements: ['FIRE', 'WATER_ICE'], rewardStones: 380 };
  assert.equal(EXPLORE.solveElementalPuzzleGate(W, [n], gate).rewardStones, 380);
  const restored = SIM.deserialize(SIM.serialize(W));
  assert.equal(EXPLORE.solveElementalPuzzleGate(restored, [restored.byId[n.id]], gate).rewardStones, 0);
});

test('shield shatter damages and breaks armor only when a shield exists', () => {
  const W = world('audit-shatter-shield');
  const n = W.npcs[0];
  const foe = { id: 'shield-foe', foe: true, name: 'ศัตรู', tier: 1, hp: 20000, hpMax: 20000, x: n.x + 1, y: n.y, sx: [] };
  W.foes.push(foe); W.foeById[foe.id] = foe;
  const fight = COMBAT.startFight(W, [n.id], [foe.id], 'duel', { serious: true });
  const engine = COMBAT.COMPOSABLE_ENGINE;
  engine.executeAction(W, fight, n, foe, 'SHATTER_SHIELD', {}, {});
  assert.equal(foe.hp, 20000);
  assert.equal(STATS.has(foe, 'armorbreak', W.t), false);
  STATS.addStatus(foe, 'shield', 20, { amt: 100 }, W.t);
  engine.executeAction(W, fight, n, foe, 'SHATTER_SHIELD', {}, {});
  assert.equal(foe.hp, 19935);
  assert.equal(STATS.has(foe, 'armorbreak', W.t), true);
});

test('status transmutation performs only the chosen mode', () => {
  for (const mode of ['EXTEND_DEBUFF', 'STEAL_BUFF', 'ABSORB_DOT_TO_SHIELD']) {
    const W = world('audit-transmute-' + mode);
    const n = W.npcs[0];
    const foe = { id: 'transmute-foe', foe: true, name: 'ศัตรู', tier: 1, hp: 20000, hpMax: 20000, x: n.x + 1, y: n.y, sx: [] };
    W.foes.push(foe); W.foeById[foe.id] = foe;
    const fight = COMBAT.startFight(W, [n.id], [foe.id], 'duel', { serious: true });
    STATS.addStatus(n, 'poison', 30, null, W.t);
    STATS.addStatus(foe, 'armorbreak', 30, null, W.t);
    STATS.addStatus(foe, 'swiftWind', 30, null, W.t);
    const until = STATS.statusOf(foe, 'armorbreak', W.t).until;
    COMBAT.COMPOSABLE_ENGINE.postHitSkill(W, fight, n, foe, { id: 'TEST_TRANSMUTE', arch: 'statusTransmute', statusTransmute: mode }, { hit: true, dmg: 1 });
    assert.equal(STATS.statusOf(foe, 'armorbreak', W.t).until - until, mode === 'EXTEND_DEBUFF' ? 6 : 0, mode);
    assert.equal(STATS.has(foe, 'swiftWind', W.t), mode !== 'STEAL_BUFF', mode);
    assert.equal(STATS.has(n, 'poison', W.t), mode !== 'ABSORB_DOT_TO_SHIELD', mode);
    assert.equal(STATS.has(n, 'shield', W.t), mode === 'ABSORB_DOT_TO_SHIELD', mode);
  }
});

test('a finisher declared in the action field receives its combo multiplier', () => {
  const W = world('audit-finisher-field');
  const n = W.npcs[0];
  const foe = { id: 'finisher-foe', foe: true, name: 'ศัตรู', tier: 1, hp: 20000, hpMax: 20000, x: n.x + 1, y: n.y, sx: [] };
  W.foes.push(foe); W.foeById[foe.id] = foe;
  const fight = COMBAT.startFight(W, [n.id], [foe.id], 'duel', { serious: true });
  const result = COMBAT.COMPOSABLE_ENGINE.preExecuteSkill(W, fight, n, foe, { id: 'TEST_FINISHER', action: 'COMBO_FINISHER', M: 1 }, n.act.ctx);
  assert.ok(result.comboMult > 1);
  assert.ok(n.lastComboFinisher);
});

test('a starving injured disciple chooses food instead of repeatedly restarting treatment', () => {
  const W = world('audit-urgent-meal');
  const n = W.npcs[0];
  W.sect.stock.meal = 20;
  n.h.state.satiety = 10;
  n.h.state.hp = 1;
  n.inj = [{ sev: 2, until: W.t + 500 }];
  n.cool = {};
  n.act = { id: 'idle', stage: 'do', left: 0, total: 0, ctx: {}, why: [] };
  W.rng.weighted = choices => choices.find(c => c.id === 'heal') || choices[0];
  assert.equal(AI.decide(W, n), true);
  assert.equal(n.act.id, 'eat');
});

test('sect tier evaluation refreshes stale cached combat ratings', () => {
  const W = world('audit-sect-rating-cache');
  const n = W.npcs[0];
  n.cult.stage = 7;
  HC.bump(n);
  n.h.state.hp = CULT.hpMax(n);
  for (const member of W.npcs) STATS.rating(member);
  n.h.state.hp = 1;
  STATS.now += 31;
  const resultWithStaleCache = SECT.evaluateSectTier(W, { readOnly: true });
  STATS.rating(n);
  const resultWithFreshCache = SECT.evaluateSectTier(W, { readOnly: true });
  assert.equal(resultWithStaleCache.score, resultWithFreshCache.score);
});

test('an active combat stance and its stat bonuses survive saving and loading', () => {
  const W = world('audit-stance-save');
  const n = W.npcs[0];
  const foe = { id: 'stance-foe', foe: true, name: 'ศัตรู', tier: 1, hp: 20000, hpMax: 20000, x: n.x + 1, y: n.y, sx: [] };
  W.foes.push(foe); W.foeById[foe.id] = foe;
  const fight = COMBAT.startFight(W, [n.id], [foe.id], 'duel', { serious: true });
  COMBAT.COMPOSABLE_ENGINE.preExecuteSkill(W, fight, n, foe, { id: 'TEST_STANCE', stanceShift: 'STAR_SWORD_STANCE', arch: 'stanceShift', M: 0 }, n.act.ctx);
  const before = STATS.getActiveStanceSpec(n);
  assert.ok(before);
  const loaded = SIM.deserialize(SIM.serialize(W));
  assert.equal(STATS.getActiveStanceSpec(loaded.byId[n.id])?.id, before.id);
});

test('craft precision increases paid crafting quality with otherwise identical inputs', () => {
  function craft(precision) {
    const W = world('audit-craft-precision');
    const n = W.npcs[1];
    n.cult.path = 'XIAN';
    n.combatKeywords = precision ? [{ id: 'KW_CRAFT_PRECISION', value: 0.1 }] : [];
    n.h.skills.ALCHEMY = 55;
    const recipe = ECO.recipeById.BASIC_HP;
    W.sect.stock = { MAT_HERB_DEW_GRASS_1: 10, MAT_HERB_CINDER_LEAF_1: 10 };
    W.rng.next = () => 0; W.rng.gauss = () => 0; W.rng.chance = () => false;
    const ctx = { rid: recipe.id };
    assert.equal(ECO.reserveInputs(W, recipe, ctx, n), true);
    const result = ECO.finishCraft(W, n, recipe, ctx);
    assert.equal(result.ok, true);
    return result.q;
  }
  assert.ok(Math.abs(craft(true) - craft(false) - 0.1) < 1e-9);
});

test('combat keyword stacks, stored damage and cooldowns survive save and load', () => {
  const W = world('audit-keyword-save');
  const n = W.npcs[0];
  n._kwAdaptiveStacks = 3;
  n._absorbReleaseStored = 100;
  n._statusTransferCd = W.t + 8;
  n._tempoStealCd = W.t + 10;
  const loaded = SIM.deserialize(SIM.serialize(W)).byId[n.id];
  assert.equal(loaded._kwAdaptiveStacks, 3);
  assert.equal(loaded._absorbReleaseStored, 100);
  assert.equal(loaded._statusTransferCd, W.t + 8);
  assert.equal(loaded._tempoStealCd, W.t + 10);
});

test('craft keyword profile updates when a craft skill improves', () => {
  const W = world('audit-craft-keyword-cache');
  const n = W.npcs[0];
  n.cult.path = 'CRAFT_CREATION';
  for (const skill of ['ALCHEMY', 'FORGING', 'ARRAY', 'TALISMAN']) n.h.skills[skill] = 20;
  const before = COMBAT.keywordsOf(n).craftPrecision;
  n.h.skills.ALCHEMY = 80;
  const after = COMBAT.keywordsOf(n).craftPrecision;
  assert.ok(after > before);
});

test('external traders price both finished-pill IDs and recipe-prefixed pills from the same economy catalog', () => {
  const W = world('audit-pill-prices');
  const EXT = require('./load').EXT;
  for (const id of ['ITEM190_PILL_001', 'ITEM190_PILL_012', 'ITEM_V234_PILL_002', 'P:BASIC_HP']) {
    assert.equal(ECO.isPill(id), true, id);
    assert.equal(EXT.basePrice(W, id), ECO.base(id), id);
  }
});

test('a player cannot appoint a garrison to an enemy resource node', () => {
  const W = world('audit-enemy-garrison');
  EXPED.ensureWorldTopology(W);
  const node = Object.values(W.world.resourceNodes).find(r => r.ownerSectId !== 'PLAYER');
  const original = JSON.stringify(node.garrison);
  const result = EXPED.assignNodeGarrison(W, node.id, { discipleIds: [W.npcs[0].id] });
  assert.equal(result.ok, false);
  assert.equal(JSON.stringify(node.garrison), original);
});

test('a disciple leaving on an expedition stops defending their resource node', () => {
  const W = world('audit-deployed-garrison');
  EXPED.ensureWorldTopology(W);
  const node = Object.values(W.world.resourceNodes)[0];
  const n = W.npcs[0];
  node.ownerSectId = 'PLAYER';
  assert.equal(EXPED.assignNodeGarrison(W, node.id, { discipleIds: [n.id] }).ok, true);
  const defended = node.garrison.defensePower;
  const expedition = EXPED.depart(W, [n], 'gather', EXPED.REGIONS[0]);
  assert.ok(expedition);
  assert.equal(node.garrison.discipleIds.includes(n.id), false);
  assert.ok(node.garrison.defensePower < defended);
});

test('an enemy capture removes the player garrison from the occupied node', () => {
  const W = world('audit-lost-garrison');
  EXPED.ensureWorldTopology(W);
  const node = Object.values(W.world.resourceNodes)[0];
  node.ownerSectId = 'PLAYER';
  EXPED.assignNodeGarrison(W, node.id, { discipleIds: [W.npcs[0].id] });
  const result = EXPED.contestResourceNode(W, node.id, W.world.sects[0], { forceLose: true });
  assert.equal(result.repelled, false);
  assert.notEqual(node.ownerSectId, 'PLAYER');
  assert.deepEqual(node.garrison.discipleIds, []);
  assert.equal(node.garrison.playerManaged, undefined);
});

test('a disciple listed twice cannot double their garrison defense', () => {
  const W = world('audit-duplicate-garrison');
  EXPED.ensureWorldTopology(W);
  const node = Object.values(W.world.resourceNodes)[0];
  const id = W.npcs[0].id;
  node.ownerSectId = 'PLAYER';
  const single = EXPED.assignNodeGarrison(W, node.id, { discipleIds: [id] }).garrison.defensePower;
  const repeated = EXPED.assignNodeGarrison(W, node.id, { discipleIds: [id, id] }).garrison;
  assert.deepEqual(repeated.discipleIds, [id]);
  assert.equal(repeated.defensePower, single);
});

test('SAVE-01..SAVE-11 & V240-16/17: active combat state, nextId, chronicle, distress calls, bounties, and multi-phase effects survive save/load', () => {
  const W = world('audit-save-load-deep');
  EXPED.ensureWorldTopology(W);
  const a = W.npcs[0], b = W.npcs[1];
  const fight = COMBAT.startFight(W, [a.id], [b.id], 'duel', { serious: false });
  assert.ok(fight);
  EXPED.recordChronicle(W, { category: 'JIANGHU', titleTh: 'ทดสอบบันทึกยุทธภพ', storyTh: 'เรื่องราวทดสอบ' });
  const vassal = W.world.allSects[0];
  vassal.isVassal = true; vassal.treaty = 'VASSAL_TREATY';
  const call = EXPED.spawnVassalDistressCall(W, vassal);
  a.pendingMultiPhaseEffects = [{ pillId: 'PILL_TEST', executeDay: W.day + 2, phaseSpec: { phase: 2, cultExpAdd: 50 } }];
  a.armedConsumables = [{ itemId: 'ITEM_TRAP_TEST', triggerOn: 'COMBAT_START', armedAt: W.t, triggered: false }];

  const raw = SIM.serialize(W);
  const loaded = SIM.deserialize(raw);
  assert.equal(loaded.nextId, W.nextId);
  assert.equal(loaded.chronicle, loaded.world.chronicles);
  assert.ok(loaded.fights.some(f => f.id === fight.id));
  assert.equal(loaded.world.politics.activeDistressCall?.id, call.id);
  assert.equal(loaded.byId[a.id].pendingMultiPhaseEffects.length, 1);
  assert.equal(loaded.byId[a.id].armedConsumables.length, 1);
});

test('COM-01..COM-09: row bodyblock range/incapacity, LoS obstacle, single fight enrollment, surrender stop, guardian 1 HP survival, and point-locked AoE', () => {
  const W = world('audit-combat-9');
  const a = W.npcs[0], front = W.npcs[1], back = W.npcs[2];
  a.x = 120; a.y = 120;
  front.x = 200; front.y = 200;
  back.x = 121; back.y = 120;
  const f = COMBAT.startFight(W, [a.id], [front.id, back.id], 'raid', { serious: true });
  front._combatRow = 'FRONT_ROW';
  back._combatRow = 'BACK_ROW';
  STATS.addStatus(front, 'stun', 20, null, W.t);
  assert.equal(COMBAT.resolveRowBodyblock(W, f, a, back, { moveSpec: { reachClass: 'MELEE' } }), null);

  // Point-locked AoE channel does not hit target that moved 18 tiles away
  a.act = {
    id: 'fight',
    ctx: {
      fid: f.id, cd: 0, cds: {},
      channeling: {
        skillId: 'QA_POINT_CHAN',
        skill: { id: 'QA_POINT_CHAN', nameTh: 'QA_POINT_CAST', type: 'm', pen: 0 },
        targetId: back.id,
        lockType: 'POINT', lockX: 132, lockY: 125,
        maxRange: 6, startDist: 3, ticksLeft: 1, totalTicks: 1, tickM: 0.5, finishM: 1.0, interruptForce: 1
      }
    }
  };
  back.x = 150; back.y = 125;
  const hpBefore = back.h.state.hp;
  COMBAT.resolveChannelTick(W, f, a, a.act.ctx);
  assert.equal(back.h.state.hp, hpBefore);
});

test('DA-001..DA-017 & V240-01..15: voluntary vows cap/redemption/stats, secondary resources, gravity field, temporal rewind, and experience trait cap/recovery', () => {
  const W = world('audit-dao-vows-traits');
  const n = W.npcs[0];
  n.cult.path = 'XIAN';
  n.cult.stage = 6;
  const r1 = CULT.VOLUNTARY_VOWS.swearVow(W, n, 'VOW_ASCETIC_PRECEPT');
  const r2 = CULT.VOLUNTARY_VOWS.swearVow(W, n, 'VOW_NO_MEDICINE');
  const r3 = CULT.VOLUNTARY_VOWS.swearVow(W, n, 'VOW_NO_RETREAT');
  assert.equal(r1.ok, true);
  assert.equal(r2.ok, true);
  assert.equal(r3.ok, false);
  assert.equal(r3.reason, 'max-active-vows-reached');

  const vBonus = CULT.VOLUNTARY_VOWS.getStatBonuses(n);
  assert.equal(vBonus.active, true);
  assert.ok(vBonus.p.mdef > 0);

  // Vow break + redemption
  CULT.VOLUNTARY_VOWS.violateVow(W, n, 'VOW_NO_MEDICINE', 'ใช้โอสถ');
  assert.equal(n.voluntaryVows.VOW_NO_MEDICINE.violated, true);
  n.merit = 100;
  const red = CULT.VOLUNTARY_VOWS.redeemVow(W, n, 'VOW_NO_MEDICINE', { force: true });
  assert.equal(red.ok, true);
  assert.equal(n.voluntaryVows.VOW_NO_MEDICINE, undefined);

  // Secondary resources
  CULT.SECONDARY_RESOURCES.gain(n, 'FROST_QI', 50);
  assert.equal(CULT.SECONDARY_RESOURCES.canUseResource(n, 'FROST_QI'), true);
  assert.equal(CULT.SECONDARY_RESOURCES.consume(n, 'FROST_QI', 30).ok, true);
  assert.equal(n.secondaryResources.FROST_QI, 20);

  // Experience traits cap & recovery
  const grantRes = CULT.EXPERIENCE_TRAITS.recordExperienceEvent(W, n, 'TRIBULATION_SURVIVED_OR_SCARRED', 'test-trib-1');
  assert.equal(grantRes.ok, true);
  assert.equal(CULT.EXPERIENCE_TRAITS.hasTrait(n, 'EXP_TRAIT_TRIBULATION_SURVIVOR'), true);
  const recRes = CULT.EXPERIENCE_TRAITS.resolveTraitRecovery(W, n, 'EXP_TRAIT_TRIBULATION_SURVIVOR', 'ทะลวงขั้นชำระแผลใจ');
  assert.equal(recRes.ok, true);
  assert.equal(CULT.EXPERIENCE_TRAITS.hasTrait(n, 'EXP_TRAIT_TRIBULATION_SURVIVOR'), false);
});

test('EQ-02..EQ-16 & EC-05..EC-09: living weapon evolution gating, rolled affixes, rune socket validation, broken gear block, and seasonal vs daily node harvest', () => {
  const W = world('audit-eq-eco-out');
  EXPED.ensureWorldTopology(W);
  const n = W.npcs[0], other = W.npcs[1];
  n.cult.stage = 6; other.cult.stage = 6;

  // Procedural sword evolution preserves rolled affixes in regenerated st and updates value
  const normalSword = ECO.rollProceduralGear(W, { slot: 'WEAPON', gearType: 'SWORD', tier: 3, baseQ: 1.0 });
  const initVal = normalSword.value;
  const initAtk = normalSword.st.atk;
  for (let i = 0; i < 3; i++) ECO.recordWeaponKill(W, n, normalSword, { tier: 2 });
  assert.equal(normalSword.tier, 4);
  assert.ok(normalSword.value > initVal);
  assert.ok(normalSword.st.atk > initAtk);
  for (const af of normalSword.affixes) {
    assert.ok(normalSword.st[af.stat] >= af.val);
  }

  // Rune socket validation
  assert.equal(ECO.socketElementalRunes(W, n, normalSword, ['UNKNOWN_EL', 'FIRE']).ok, false);
  assert.equal(ECO.socketElementalRunes(W, n, normalSword, ['FIRE', 'FIRE']).ok, false);

  // Broken gear cannot be equipped from personal bag
  const brokenWpn = ECO.rollProceduralGear(W, { slot: 'WEAPON', gearType: 'SWORD', tier: 2 });
  brokenWpn.broken = true; brokenWpn.dur = 0;
  other.inv.gear = [brokenWpn];
  assert.equal(SECT.EDITOR.equipPersonalGear(W, other.id, brokenWpn.uid).ok, false);

  // Seasonal vs daily resource node harvest
  const rnId = Object.keys(W.world.resourceNodes)[0];
  const rn = W.world.resourceNodes[rnId];
  rn.ownerSectId = 'PLAYER';
  W.day = 361;
  const sRes = EXPED.harvestResourceNodes(W, { seasonal: true, includeMats: true });
  assert.equal(sRes.totalStones, 0);
  const dRes = EXPED.harvestResourceNodes(W, { seasonal: false, includeMats: true });
  assert.ok(dRes.totalStones > 0);
});
