'use strict';
const assert = require('assert');
const G = require('./load.js');
const { SIM, ECO, EXPLORE, EXPED, CULT, COMBAT } = G;

console.log('=== JS2 Deep Round B — Rift-Shard Realms #10–#13 & Secret Sub-Path Combat Suite ===');

// 1. Real Rift-Shard Realms #10–#13 Expedition Pipeline
{
  const W = SIM.create('deep_round_b_realms', { masterIdx: 0 });
  const ws = EXPED.WITNESSES_AND_SHARDS.ensure(W);
  const li = EXPED.LIVING_INSTITUTIONS.ensure(W);
  const curDay = Math.floor((W.t || 0) / 1440);

  // Open all 4 event-triggered shards
  ws.eventShards.tianguTreasuryOpenUntilDay = curDay + 9;
  ws.eventShards.skyFallOpenUntilDay = curDay + 3;
  ws.eventShards.twoBankOpenUntilDay = curDay + 1;
  ws.eventShards.daoZhiArchiveOpenUntilDay = curDay + 3;

  const openShards = EXPLORE.getOpenEventShards(W);
  assert.strictEqual(openShards.length, 4, 'All 4 event-triggered shards (#10-#13) must report as open');

  // Boost party slightly so deterministic victory on all 4 trials
  const party = W.npcs.slice(0, 2);
  party.forEach(n => {
    n.cult.stage = 4;
    n.h.personality.integrity = 85;
    n.h.personality.empathy = 85;
    n.h.personality.rationality = 85;
    n.h.skills.diplomacy = 80;
    n.h.skills.SCRIPTURE = 80;
  });
  party[0].folkTraitId = 'TR_FOLK_ROPE_BEARER';
  party[1].folkTraitId = 'TR_FOLK_SCALE_WALKER';

  // #10 Tiangu Folded Treasury
  const armoryBefore = (W.sect.armory || []).length;
  const ex10 = EXPLORE.departRiftShard(W, party, { realmId: 'TIANGU_FOLDED_TREASURY' });
  assert(ex10 && ex10.kind === 'rift_shard' && ex10.realmId === 'TIANGU_FOLDED_TREASURY');
  const res10 = EXPLORE.resolveRiftShard(W, ex10, party);
  assert(res10.won, 'Party must clear Shard #10 Tiangu Folded Treasury');
  assert(res10.stonesEarned > 0, 'Shard #10 must earn real spirit stones');
  assert((W.sect.armory || []).length > armoryBefore, 'Shard #10 must add procedural gear to sect armory');
  assert(ws.discoveredRelicEchoes.includes('REL_ECHO_BREATH_JADE'), 'Shard #10 must discover Breath Jade echo');

  // #11 Sky-Fall Sorting Yard
  const herbBefore = ECO.count(W, 'MAT_HERB_CINDER_LEAF_1');
  const ex11 = EXPLORE.departRiftShard(W, party, { realmId: 'SKY_FALL_SORTING_YARD' });
  const res11 = EXPLORE.resolveRiftShard(W, ex11, party);
  assert(res11.won, 'Party must clear Shard #11 Sky-Fall Sorting Yard');
  assert.strictEqual(ECO.count(W, 'MAT_HERB_CINDER_LEAF_1'), herbBefore + 4, 'Shard #11 must add +4 real fire herbs');
  assert(ws.discoveredRelicEchoes.includes('REL_ECHO_NAME_COMPASS'), 'Shard #11 must discover Name Compass echo');

  // #12 Two-Bank Water Realm (Diplomacy Trial — lowers Bloodless War localPressure!)
  li.bloodlessWar.localPressure = 6;
  const repBefore = W.sect.rep || 0;
  const ex12 = EXPLORE.departRiftShard(W, party, { realmId: 'TWO_BANK_WATER_REALM' });
  const res12 = EXPLORE.resolveRiftShard(W, ex12, party);
  assert(res12.won, 'Party with Rope Bearer must clear Shard #12 Two-Bank Water Realm');
  assert.strictEqual(li.bloodlessWar.localPressure, 4, 'Shard #12 must reduce Bloodless War localPressure by -2');
  assert.strictEqual(W.sect.rep, repBefore + 6, 'Rope Bearer must boost Shard #12 sect rep gain to +6');
  assert(ws.discoveredRelicEchoes.includes('REL_ECHO_THREE_SIDED_SEAL'), 'Shard #12 must discover Three-Sided Seal echo');

  // #13 Dao Zhi Shadow Archive (Scholar Trial — unlocks real manual in library!)
  const libBefore = (W.sect.library || []).length;
  const ex13 = EXPLORE.departRiftShard(W, party, { realmId: 'DAO_ZHI_SHADOW_ARCHIVE' });
  const res13 = EXPLORE.resolveRiftShard(W, ex13, party);
  assert(res13.won, 'Scholarly party must clear Shard #13 Dao Zhi Shadow Archive');
  assert(res13.manualUnlocked && W.sect.library.length === libBefore + 1, 'Shard #13 must unlock a real manual into W.sect.library');
  assert.strictEqual(ws.shardExpeditionHistory.length, 4, 'All 4 shard expeditions must be recorded in history');
  console.log('  [PASS] 1/4: Real Rift-Shard Realms #10–#13 Expeditions, Loot, Pressure Relief & Library Unlock verified');
}

// 2. Real Cultivation, Power, Defense & Breakthrough Scaling for 3 Secret Sub-Paths & 3 Folk Traits
{
  const W = SIM.create('deep_round_b_cult', { masterIdx: 0 });
  const npc = W.npcs[0];
  npc.secretSubPathId = null;
  npc.folkTraitId = null;

  const basePower = CULT.power(npc);
  const baseDef = CULT.defenseMult(npc);
  const baseBt = CULT.breakthroughChance(npc);

  // BREATH_RELAY_DAO (+10% power, +6% bt)
  npc.secretSubPathId = 'BREATH_RELAY_DAO';
  assert(Math.abs(CULT.power(npc) / basePower - 1.10) < 0.005, 'BREATH_RELAY_DAO must boost CULT.power by +10%');
  assert(CULT.breakthroughChance(npc) > baseBt + 0.04, 'BREATH_RELAY_DAO must boost breakthroughChance');

  // SHADOW_RADIANCE_SUBPATH (+16% power, +8% bt)
  npc.secretSubPathId = 'SHADOW_RADIANCE_SUBPATH';
  assert(Math.abs(CULT.power(npc) / basePower - 1.16) < 0.005, 'SHADOW_RADIANCE_SUBPATH must boost CULT.power by +16%');

  // PENDING_REGISTRY_PATH Countdown Scaling (Tier 5 -> +3%, Tier 0 -> +18%)
  npc.secretSubPathId = 'PENDING_REGISTRY_PATH';
  npc.pendingCountdownTier = 5;
  const pTier5 = CULT.power(npc);
  npc.pendingCountdownTier = 0;
  const pTier0 = CULT.power(npc);
  assert(Math.abs(pTier5 / basePower - 1.03) < 0.005, 'PENDING_REGISTRY_PATH Tier 5 must grant +3% power');
  assert(Math.abs(pTier0 / basePower - 1.18) < 0.005, 'PENDING_REGISTRY_PATH Tier 0 must grant +18% power');
  assert(pTier0 > pTier5, 'Countdown 5->0 must progressively empower practitioner');

  // Folk Traits: TR_FOLK_ROPE_BEARER (+0.05 def) & TR_FOLK_LINGERING_BREATH (+0.04 bt)
  npc.secretSubPathId = null;
  npc.folkTraitId = 'TR_FOLK_ROPE_BEARER';
  assert(Math.abs(CULT.defenseMult(npc) - (baseDef + 0.05)) < 1e-6, 'TR_FOLK_ROPE_BEARER must add +0.05 defenseMult');
  npc.folkTraitId = 'TR_FOLK_LINGERING_BREATH';
  assert(CULT.breakthroughChance(npc) > baseBt + 0.03, 'TR_FOLK_LINGERING_BREATH must boost breakthroughChance');

  // CULT.gain multiplier verification
  npc.secretSubPathId = 'SHADOW_RADIANCE_SUBPATH';
  npc.folkTraitId = null;
  npc.cult.prog = 0;
  CULT.gain(npc, 100, W, 'test_subpath');
  assert(npc.cult.prog >= 114, 'SHADOW_RADIANCE_SUBPATH must amplify CULT.gain by +15%');
  console.log('  [PASS] 2/4: Real CULT.power, CULT.gain, CULT.defenseMult & Countdown Scaling verified');
}

// 3. Live Combat Triggers in COMBAT.applyDamage (js/combat.js)
{
  const W = SIM.create('deep_round_b_combat', { masterIdx: 0 });
  const ws = EXPED.WITNESSES_AND_SHARDS.ensure(W);
  const attacker = W.npcs[0];
  const defender = W.npcs[1];
  const makeFight = (id) => ({ id, kind: 'duel', serious: true, log: [], ctx: {} });

  // 3A. BREATH_RELAY_DAO Cheat-Death Relay
  defender.secretSubPathId = 'BREATH_RELAY_DAO';
  defender._cheatDeathSavesCount = 0;
  const hm1 = COMBAT.hpMax(defender);
  COMBAT.setHp(defender, hm1);
  const relayBefore = ws.breathRelay.relayPassCount || 0;
  COMBAT.applyDamage(W, makeFight(9001), attacker, defender, Math.round(hm1 * 0.92), 'test_hit');
  assert(defender.lastBreathRelaySave && defender.lastBreathRelaySave.fightId === 9001, 'BREATH_RELAY_DAO must trigger survival relay at <=14% HP');
  assert(COMBAT.hp(defender) >= Math.round(hm1 * 0.35), 'BREATH_RELAY_DAO must restore HP to ~38%');
  assert.strictEqual(ws.breathRelay.relayPassCount, relayBefore + 1, 'BREATH_RELAY_DAO must increment global relayPassCount');

  // 3B. SHADOW_RADIANCE_SUBPATH 18% Mitigation + Non-Lethal Disarming Counter
  if (G.STATS && G.STATS.clearStatus) G.STATS.clearStatus(defender, () => true);
  defender.secretSubPathId = 'SHADOW_RADIANCE_SUBPATH';
  defender._cheatDeathSavesCount = 0;
  const hmA = COMBAT.hpMax(attacker);
  COMBAT.setHp(attacker, hmA);
  COMBAT.setHp(defender, hm1);
  COMBAT.applyDamage(W, makeFight(9002), attacker, defender, Math.round(hm1 * 0.85), 'test_hit');
  assert(defender.lastShadowRadianceCounter && defender.lastShadowRadianceCounter.fightId === 9002, 'SHADOW_RADIANCE_SUBPATH must trigger disarming counter');
  assert(COMBAT.hp(attacker) < hmA, 'Disarming counter must actually damage the attacker');

  // 3C. PENDING_REGISTRY_PATH (Tier 0) 18% Mitigation + Third-Side Seal Survival
  if (G.STATS && G.STATS.clearStatus) G.STATS.clearStatus(defender, () => true);
  defender.secretSubPathId = 'PENDING_REGISTRY_PATH';
  defender.pendingCountdownTier = 0;
  defender._cheatDeathSavesCount = 0;
  COMBAT.setHp(defender, hm1);
  COMBAT.applyDamage(W, makeFight(9003), attacker, defender, Math.round(hm1 * 1.05), 'test_hit');
  assert(defender.lastPendingSealSave && defender.lastPendingSealSave.fightId === 9003, 'PENDING_REGISTRY_PATH must trigger Third-Side Seal survival');
  assert(COMBAT.hp(defender) >= Math.round(hm1 * 0.25), 'Third-Side Seal must restore HP to ~28%');
  console.log('  [PASS] 3/4: Live Combat Triggers (Breath Relay, Shadow Radiance Counter, Third-Side Seal) verified');
}

// 4. Save/Load Round-Trip Integrity
{
  const W = SIM.create('deep_round_b_saveload', { masterIdx: 0 });
  const ws = EXPED.WITNESSES_AND_SHARDS.ensure(W);
  W.npcs[0].secretSubPathId = 'PENDING_REGISTRY_PATH';
  W.npcs[0].pendingCountdownTier = 2;
  W.npcs[0].folkTraitId = 'TR_FOLK_ROPE_BEARER';
  ws.discoveredRelicEchoes = ['REL_ECHO_THREE_SIDED_SEAL'];
  const W2 = SIM.deserialize(SIM.serialize(W));
  assert.strictEqual(W2.npcs[0].secretSubPathId, 'PENDING_REGISTRY_PATH');
  assert.strictEqual(W2.npcs[0].pendingCountdownTier, 2);
  assert.strictEqual(W2.npcs[0].folkTraitId, 'TR_FOLK_ROPE_BEARER');
  assert.deepStrictEqual(W2.world.witnessesAndShards.discoveredRelicEchoes, ['REL_ECHO_THREE_SIDED_SEAL']);
  console.log('  [PASS] 4/4: Save/Load Round-Trip Integrity verified');
}

console.log('=== ALL 4/4 DEEP ROUND B TESTS PASSED ===');
