'use strict';
const assert = require('assert');
const g = require('./load.js');

function makePathParty(W) {
  const paths = Object.keys(g.CULT.PATHS);
  const people = W.npcs.filter(n => n && !n.dead && n.cult);
  while (people.length < paths.length) {
    const n = W.makeNpc({ ageYears: 20, quality: 0.8, rank: 1, stage: 2 });
    assert(n && n.cult, 'test world should be able to add a cultivator');
    people.push(n);
  }
  for (let i = 0; i < paths.length; i++) {
    const n = people[i], path = paths[i];
    n.cult.path = path;
    n.cult.stage = Math.min(3, g.CULT.PATHS[path].maxStage);
    n.cult.sub = 'NONE';
    n.away = false; n.travel = null; n.expId = null;
  }
  return { paths, party: people.slice(0, paths.length) };
}

// Universal Pagoda access, Dao insights, and one complete unique set per path.
{
  const W = g.SIM.create('v210_pagoda_suite');
  const { paths, party } = makePathParty(W);
  const floorCount = paths.length;
  assert.strictEqual(g.EXPLORE.NINE_DAO_PAGODA.floors.length, floorCount);
  assert.deepStrictEqual(g.EXPLORE.NINE_DAO_PAGODA.floors.map(f => f.path), paths);
  assert.strictEqual(g.MARTIAL.RESONANCE_SETS.filter(s => s.id.startsWith('RES_NINE_DAO_')).length, floorCount);
  const ex = g.EXPLORE.departNineDaoPagoda(W, party, { maxFloor: floorCount });
  assert(ex && ex.kind === 'nine_dao_pagoda', 'any path can enter the Pagoda');
  const result = g.EXPLORE.resolveNineDaoPagoda(W, ex, party, { forceClear: true });
  assert.strictEqual(result.floorsCleared, floorCount);
  assert.deepStrictEqual(Object.keys(W.world.nineDaoPagoda.unlockedSets).sort(), paths.slice().sort());
  assert.strictEqual(W.sect.gear.filter(it => it.source === 'NINE_DAO_PAGODA').length, floorCount * 3);
  for (let i = 0; i < paths.length; i++) {
    const n = party[i], setId = 'RES_NINE_DAO_' + paths[i];
    assert.strictEqual(W.sect.daoInsights[paths[i]], 1, paths[i] + ' should receive a Dao insight');
    const pieces = W.sect.gear.filter(it => it.resonanceSetId === setId);
    assert.strictEqual(pieces.length, 3, paths[i] + ' should unlock its three-piece set');
    const equip = Object.fromEntries(pieces.map(it => [it.slot, it]));
    const resonance = g.MARTIAL.evaluateResonanceSet(n, equip);
    assert(resonance.active && resonance.pieces === 3 && resonance.setId === setId, paths[i] + ' resonance set should activate');
  }
  const repeat = g.EXPLORE.resolveNineDaoPagoda(W, { id: 999, kind: 'nine_dao_pagoda', target: floorCount, journal: [], done: false }, party, { forceClear: true });
  assert(repeat && W.sect.gear.filter(it => it.source === 'NINE_DAO_PAGODA').length === floorCount * 3, 'set pieces must not duplicate on repeat runs');
}

// Seasonal element rotation, root affinity bonuses, and elemental catalysts.
{
  const W = g.SIM.create('v210_elemental_suite');
  const n = W.npcs.find(x => x && x.cult);
  assert(n);
  assert.deepStrictEqual([0, 90, 180, 270, 360].map(d => g.EXPLORE.elementalRealmAt(d).id), ['REALM_METAL','REALM_WOOD','REALM_WATER','REALM_FIRE','REALM_EARTH']);
  n.h.root = g.ELEM.buildRootObject(['FIRE'], ['HEAVENLY']);
  const before = g.ELEM.ensureNpc(n).mastery.FIRE || 0;
  assert.notEqual(g.EXPLORE.elementalRealmAt(W.day).id, 'REALM_FIRE');
  assert.equal(g.EXPLORE.departElementalRealm(W, [n], { realmId: 'REALM_FIRE' }), null, 'off-cycle realm requests should be rejected');
  W.day = 270;
  const ex = g.EXPLORE.departElementalRealm(W, [n], { realmId: 'REALM_FIRE' });
  assert(ex && ex.realmId === 'REALM_FIRE');
  const result = g.EXPLORE.resolveElementalRealm(W, ex, [n], { forceClear: true });
  assert.strictEqual(result.floorsCleared, 3);
  assert.strictEqual(result.floorLogs[0].affinityCount, 1, 'matching spiritual roots receive the realm affinity');
  assert.strictEqual(W.sect.catalysts.CAT_PRIMORDIAL_FIRE, 3);
  assert(g.ELEM.ensureNpc(n).mastery.FIRE > before, 'matching root should gain elemental mastery');
}

// Spirit mounts alter actual expedition duration and enforce the expanded cargo limit.
{
  const W = g.SIM.create('v210_mount_suite');
  const n = W.npcs.find(x => x && x.cult);
  n.pets = [{ uid: 'MOUNT_V210', nameTh: 'วิหคดาวตก', role: 'MOUNT_CHARGER', family: 'AVIAN', active: false }];
  const restingMount = g.EXPED.createParty(W, [n], { baseDays: 8, baseCapacity: 10 });
  assert.strictEqual(restingMount.hasMount, false, 'resting spirit beasts should not provide a mount bonus');
  n.pets[0].active = true;
  const mounted = g.EXPED.createParty(W, [n.id], { baseDays: 8, baseCapacity: 10 });
  const unmountedCultivator = W.npcs.find(x => x && x.cult && x.id !== n.id);
  const unmounted = g.EXPED.createParty(W, [unmountedCultivator], { baseDays: 8, baseCapacity: 10 });
  assert(mounted.ok && mounted.hasMount);
  assert.strictEqual(mounted.days, 6);
  assert.strictEqual(mounted.capacityMultiplier, 1.4);
  assert.strictEqual(mounted.carryCapacity, 14);
  assert.strictEqual(unmounted.days, 8);
  const cargo = { mats: { MAT_TEST: 30 }, pills: {}, items: [], gear: [] };
  const cap = g.EXPED.applyCarryCapacity({ carryCapacity: mounted.carryCapacity }, cargo);
  assert.strictEqual(cap.used, 14);
  assert.strictEqual(cap.overflow, 16);
  const trialTrip = g.EXPLORE.departNineDaoPagoda(W, [n], { maxFloor: 1 });
  assert(trialTrip && trialTrip.hasMount, 'trial expeditions should use the same mount support');
  assert.strictEqual(trialTrip.days, 1.125);
  assert.strictEqual(trialTrip.carryCapacity, 44);
  unmountedCultivator.pets = [{ uid: 'MOUNT_V210_REALM', role: 'MOUNT_CHARGER', family: 'AVIAN', active: true }];
  W.day = 270;
  const realmTrip = g.EXPLORE.departElementalRealm(W, [unmountedCultivator], { realmId: 'REALM_FIRE' });
  assert(realmTrip && realmTrip.hasMount);
  assert.strictEqual(realmTrip.days, 0.9375, 'mount travel reduction should remain 25% on short realm trips');
}

// Reserve beasts can be assigned, enter the raid as allies, and use each named bloodline hook.
{
  const W = g.SIM.create('v210_gate_beasts_suite');
  const traits = ['ALPHA_FANG','IRON_CARAPACE','VENOM_GLAND','SOVEREIGN_AWAKENED'];
  W.sect.beasts = traits.map((bloodlineTrait, i) => ({
    uid: 'GATE_BEAST_' + i, speciesId: 'B01', nameTh: 'อสูรพิทักษ์ ' + i,
    tier: 3, level: 2, growthStage: 2, family: i === 0 ? 'AVIAN' : 'CANINE',
    role: i === 0 ? 'MOUNT_CHARGER' : 'VANGUARD_BRUISER', bloodlineTrait,
    hp: 240, hpMax: 240, fatigue: 0, bond: 80, loyalty: 80
  }));
  W.sect.gateBeasts = [];
  for (const b of W.sect.beasts) assert(g.EXPED.assignGateBeast(W, b.uid, true).ok);
  assert.strictEqual(W.sect.gateBeasts.length, 4);
  assert.strictEqual(g.EXPED.assignGateBeast(W, 'GATE_BEAST_EXTRA', true).ok, false);
  const fight = g.EXPED.spawnRaid(W, 'bandit', 0.01);
  const gateUnits = fight.ctx.gateBeastIds.map(id => W.foeById[id]);
  assert.strictEqual(gateUnits.length, 4);
  assert.deepStrictEqual(gateUnits.map(u => u.bloodlineTrait).sort(), traits.slice().sort());
  assert(gateUnits.every(u => fight.A.includes(u.id) && u.isGateBeast), 'Gate Vanguard units join the defender side');
  g.EXPED.rally(W, fight);
  assert.strictEqual(fight.ctx.gateBeastIds.length, 4, 'periodic rally must not duplicate beasts');
  const venom = gateUnits.find(u => u.bloodlineTrait === 'VENOM_GLAND');
  const target = W.foeById[fight.B[0]];
  const venomHit = g.COMBAT.strike(W, fight, venom, target, { M: 0.15, forced: true, noCrit: true, noCounter: true });
  assert(venomHit.hit && g.STATS.has(target, 'poison', W.t), 'venom bloodline should poison its surviving target');
  const iron = gateUnits.find(u => u.bloodlineTrait === 'IRON_CARAPACE');
  const plainIron = Object.assign({}, iron, { id: 'GATE_BEAST_COMPARE', bloodlineTrait: null, hp: iron.hp, dead: false, act: null });
  W.foes.push(plainIron); W.foeById[plainIron.id] = plainIron; fight.A.push(plainIron.id); g.COMBAT.enter(W, fight, plainIron.id);
  const enemy = W.foeById[fight.B[0]], originalNext = W.rng.next, originalChance = W.rng.chance;
  W.rng.next = () => 0.5; W.rng.chance = () => false;
  const ironDamage = g.COMBAT.strike(W, fight, enemy, iron, { M: 0.12, type: 'p', forced: true, noCrit: true, noCounter: true, noProc: true }).dmg;
  const plainDamage = g.COMBAT.strike(W, fight, enemy, plainIron, { M: 0.12, type: 'p', forced: true, noCrit: true, noCounter: true, noProc: true }).dmg;
  const alpha = gateUnits.find(u => u.bloodlineTrait === 'ALPHA_FANG');
  const plainAlpha = Object.assign({}, alpha, { id: 'GATE_BEAST_ALPHA_COMPARE', bloodlineTrait: null, act: null });
  W.foes.push(plainAlpha); W.foeById[plainAlpha.id] = plainAlpha; fight.A.push(plainAlpha.id); g.COMBAT.enter(W, fight, plainAlpha.id);
  const alphaDamage = g.COMBAT.strike(W, fight, alpha, target, { M: 0.12, type: 'p', forced: true, noCrit: true, noCounter: true, noProc: true }).dmg;
  const plainAlphaDamage = g.COMBAT.strike(W, fight, plainAlpha, target, { M: 0.12, type: 'p', forced: true, noCrit: true, noCounter: true, noProc: true }).dmg;
  W.rng.next = originalNext; W.rng.chance = originalChance;
  assert(ironDamage < plainDamage, 'iron-carapace bloodline should mitigate incoming strikes');
  assert(alphaDamage > plainAlphaDamage, 'alpha-fang bloodline should increase outgoing strikes');
  W.foes = W.foes.filter(u => u.id !== plainAlpha.id); delete W.foeById[plainAlpha.id]; fight.A = fight.A.filter(id => id !== plainAlpha.id);
  W.foes = W.foes.filter(u => u.id !== plainIron.id); delete W.foeById[plainIron.id]; fight.A = fight.A.filter(id => id !== plainIron.id);
  const sovereign = gateUnits.find(u => u.bloodlineTrait === 'SOVEREIGN_AWAKENED');
  g.COMBAT.applyDamage(W, fight, null, sovereign, sovereign.hpMax * 5);
  assert(!sovereign.dead && sovereign.hp > 0 && sovereign.sovereignGuardUsed, 'awakened sovereign bloodline absorbs a lethal charge once');
  g.EXPED.raidEnd(W, fight, 'B', [], []);
  assert(!W.foes.some(u => u.isGateBeast), 'temporary combat units are removed when the raid ends');
  assert(W.sect.beasts.every(b => Number.isFinite(b.hp) && Number.isFinite(b.fatigue)), 'raid damage and fatigue return to the reserve beasts');
  assert.strictEqual(W.sect.beasts[0].hpMax, 240, 'raid proxy scaling must not permanently lower reserve-beast health capacity');
}

// A formal deep rivalry can settle into a vassal treaty; mere hostility is insufficient.
{
  const W = g.SIM.create('v210_vassal_suite');
  const champ = W.npcs.find(n => n && !n.dead && n.cult);
  const rival = W.world.sects[0];
  rival.treaty = 'RIVAL_FEUD'; rival.attitude = -60;
  const challenge = g.SECT.resolveRivalEnvoyChallenge(W, champ, rival, { forceWin: true, quiet: true });
  assert(challenge.won && challenge.vassalTreaty && challenge.vassalTreaty.ok);
  assert.strictEqual(rival.treaty, 'VASSAL_TREATY');
  const merelyHostile = W.world.sects[1];
  merelyHostile.treaty = 'NONE'; merelyHostile.attitude = -50;
  const nonDecisiveChallenge = g.SECT.resolveRivalEnvoyChallenge(W, champ, merelyHostile, { forceWin: true, quiet: true });
  assert(nonDecisiveChallenge.won && !nonDecisiveChallenge.vassalTreaty, 'mere hostility should not make one envoy duel a vassal settlement');
  assert.strictEqual(merelyHostile.treaty, 'NONE');
  const stones = W.sect.stones;
  W.day = 450;
  g.CONTENT.tickPolitics(W);
  assert.strictEqual(W.world.politics.stats.vassalTributes, 1);
  assert(W.sect.stones > stones, 'vassal contributes seasonal Spirit Stones');
  assert(W.world.politics.events.some(e => e.kind === 'VASSAL_TRIBUTE' && e.herbQty > 0), 'vassal imports a rare herb');
  const fallbackVassal = W.world.sects[1];
  fallbackVassal.treaty = 'VASSAL_TREATY'; fallbackVassal.attitude = -90; fallbackVassal.specialtyMatIds = [];
  W.day = 540;
  g.CONTENT.tickPolitics(W);
  const fallbackTribute = W.world.politics.events.find(e => e.kind === 'VASSAL_TRIBUTE' && e.sectId === fallbackVassal.id && e.day === 540);
  assert(fallbackTribute && fallbackTribute.herbQty > 0, 'fallback herb selection should work when a vassal has no herb specialty');
  assert.strictEqual(fallbackVassal.treaty, 'VASSAL_TREATY', 'hostility must not overwrite a vassal treaty');
}

// Every 1,080 days all external sects enter three equivalent-stage brackets; the event is idempotent.
{
  const W = g.SIM.create('v210_conference_suite');
  const { party } = makePathParty(W);
  party.forEach(n => { n.power = 1000000; });
  W.day = 1080;
  const event = g.SECT.WORLD_MARTIAL_CONFERENCE.tick(W);
  assert(event && event.ok);
  assert.strictEqual(event.conference.invitedSectIds.length, W.world.sects.length);
  assert.strictEqual(event.brackets.length, 3);
  assert(event.brackets.every(b => b.boutCount > 0));
  assert(event.brackets.flatMap(b => b.bouts).some(b => b.formationA.length || b.formationB.length), 'conference bouts should apply real formation synergies');
  assert.strictEqual(event.conference.award.sectId, 'PLAYER');
  assert.strictEqual(W.sect.imperialDecrees, 1);
  assert(W.sect.continentalPrestige >= 20);
  assert.strictEqual(g.SECT.WORLD_MARTIAL_CONFERENCE.tick(W), null, 'same-day conference must not run twice');
  const loaded = g.SIM.deserialize(g.SIM.serialize(W));
  assert.strictEqual(loaded.sect.imperialDecrees, 1);
  assert.strictEqual(loaded.sect.worldMartialConference.history.length, 1);
  assert.strictEqual(loaded.world.nineDaoPagoda.runs, 0, 'trial state survives save/load without inventing a cleared run');
}

// The normal expedition scheduler must dispatch and settle new trial kinds after return travel.
{
  const W = g.SIM.create('v210_trial_scheduler_suite');
  const n = W.npcs.find(x => x && x.cult);
  const ex = g.EXPLORE.departNineDaoPagoda(W, [n], { maxFloor: 1 });
  assert(ex && n.expId === ex.id);
  n.x = g.MAP.EXIT.x; n.y = g.MAP.EXIT.y; n.path = null;
  g.EXPED.travelStep(W, n);
  assert(n.away, 'the expedition should transition from leaving to away at the gate');
  W.t = ex.ret; W.day = Math.floor(W.t / 1440);
  g.EXPED.hourly(W);
  assert(ex.done && ex.out && ex.out.floorLogs.length === 1, 'EXPED.hourly should route trial returns into their dedicated resolver');
  assert.strictEqual(n.expId, null);
  assert.strictEqual(n.away, false);
}

// Partial or older saved trial state is upgraded without losing existing history.
{
  const W = g.SIM.create('v210_legacy_state_suite');
  W.world.nineDaoPagoda = { unlockedSets: { XIAN: 25 }, history: [{ day: 25 }] };
  W.world.elementalRealms = { history: [{ day: 20, realmId: 'REALM_FIRE' }] };
  W.sect.worldMartialConference = { history: [{ day: 1080 }] };
  g.EXPLORE.ensureTrials(W);
  g.SECT.WORLD_MARTIAL_CONFERENCE.ensure(W);
  assert.strictEqual(W.world.nineDaoPagoda.runs, 0);
  assert.strictEqual(W.world.nineDaoPagoda.unlockedSets.XIAN, 25);
  assert.strictEqual(W.world.elementalRealms.runs, 0);
  assert.strictEqual(W.sect.worldMartialConference.lastDay, 0);
  assert.strictEqual(W.sect.worldMartialConference.history.length, 1);
}

console.log('PASS v210_pagoda_warbeasts_conference_suite');
