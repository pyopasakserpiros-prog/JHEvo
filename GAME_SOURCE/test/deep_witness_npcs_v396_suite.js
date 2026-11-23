'use strict';
const assert = require('assert');
const G = require('./load.js');
const { SIM, EXPED, CULT, HC } = G;

console.log('=== JS2 v3.9.6 Deep Round C — Real In-World Witness NPCs (A-Ping & Wei Heng) Suite ===');

const W = SIM.create('deep_round_c_witness_npcs', { masterIdx: 0 });
assert.strictEqual(SIM.PATCH_VERSION, '3.9.6');
assert.strictEqual(SIM.SAVE_SCHEMA_VERSION, '3.9.6-deep-gameplay-integration');

const initialSectCount = W.npcs.length;
const startOff = (SIM.CALENDAR && SIM.CALENDAR.START_DAY_OFFSET) || 360;

// 1. Tick to Year 1 Month 1 Day 12 -> A-Ping spawns as a real HC-backed NPC in W.world.witnessNpcs & W.byId!
const rngBefore = W.rng.s;
for (let d = 0; d < 15; d++) {
  W.t = (startOff + d) * 1440;
  W.day = startOff + d;
  EXPED.WITNESSES_AND_SHARDS.tickDaily(W);
}
assert.strictEqual(W.rng.s, rngBefore, 'Witness NPC spawning must consume ZERO W.rng');
assert.strictEqual(W.npcs.length, initialSectCount, 'External witness NPCs must NOT inflate sect disciple payroll/count');

const apNpc = W.byId.WITNESS_APING;
assert(apNpc && W.world.witnessNpcs && W.world.witnessNpcs.aping === apNpc, 'A-Ping must be spawned and registered in W.byId.WITNESS_APING');
assert.strictEqual(apNpc.isExternalWitness, true);
assert.strictEqual(apNpc.secretSubPathId, 'PENDING_REGISTRY_PATH');
assert.strictEqual(apNpc.pendingCountdownTier, 5);
const apPowerEarly = CULT.power(apNpc);
assert(apPowerEarly > 0 && HC.fullName(apNpc).includes('อาผิง'), 'A-Ping must have valid HC.fullName and CULT.power');
console.log(`  [PASS] 1/4: A-Ping real NPC spawned in W.byId (name=${HC.fullName(apNpc)}, power=${Math.round(apPowerEarly)}, tier=5)`);

// 2. Tick through Year 2 Month 1 Day 1 -> Wei Heng is born as a real HC-backed NPC!
for (let d = 15; d <= 365; d++) {
  W.t = (startOff + d) * 1440;
  W.day = startOff + d;
  EXPED.WITNESSES_AND_SHARDS.tickDaily(W);
}
const whNpc = W.byId.WITNESS_WEIHENG;
assert(whNpc && W.world.witnessNpcs.weiheng === whNpc, 'Wei Heng must be spawned and registered in W.byId.WITNESS_WEIHENG on Year 2');
assert.strictEqual(whNpc.secretSubPathId, 'SHADOW_RADIANCE_SUBPATH');
const whPowerChild = CULT.power(whNpc);
assert(whPowerChild > 0 && HC.fullName(whNpc).includes('เว่ย'), 'Wei Heng must have valid HC.fullName and CULT.power');

// 3. Simulate across 61 years (Years 2 -> 61) and verify real growth, Lower-World Ceiling, epithet & autonomous disciple mentorship!
for (let d = 366; d < 61 * 360 + 10; d++) {
  W.t = (startOff + d) * 1440;
  W.day = startOff + d;
  EXPED.WITNESSES_AND_SHARDS.tickDaily(W);
}
const apPowerLate = CULT.power(apNpc);
const whPowerCeiling = CULT.power(whNpc);
assert(apNpc.pendingCountdownTier <= 1, 'A-Ping countdown tier must progress down to Tier 1');
assert(apPowerLate > apPowerEarly, `A-Ping power must grow as names release (${Math.round(apPowerEarly)} -> ${Math.round(apPowerLate)})`);
assert.strictEqual(whNpc.cult.stage, 9, 'Wei Heng must reach Stage 9 Lower-World Ceiling');
assert(whPowerCeiling > whPowerChild * 5, `Wei Heng power must scale dramatically from child to Lower-World Ceiling (${Math.round(whPowerChild)} -> ${Math.round(whPowerCeiling)})`);
assert(Array.isArray(whNpc.assemblyTitles) && whNpc.assemblyTitles.includes('ยอดคนเงาประกาย'), 'Wei Heng must earn ยอดคนเงาประกาย title');
const mentoredDisciple = W.npcs.find(n => n && n.mentoredByWeiHeng);
assert(mentoredDisciple, 'Wei Heng must autonomously mentor a real sect disciple in Year 61');
console.log(`  [PASS] 2/4: 61-year Witness NPC growth verified (A-Ping power ${Math.round(apPowerEarly)}->${Math.round(apPowerLate)}, WeiHeng stage 1->9 power ${Math.round(whPowerChild)}->${Math.round(whPowerCeiling)}, mentored=${HC.fullName(mentoredDisciple)})`);

// 4. Save/Load Round-Trip Integrity (re-registers W.byId for both Witness NPCs!)
const raw = SIM.serialize(W);
const W2 = SIM.deserialize(raw);
assert(W2.byId.WITNESS_APING && W2.byId.WITNESS_APING.secretSubPathId === 'PENDING_REGISTRY_PATH', 'A-Ping must survive Save/Load in W.byId');
assert(W2.byId.WITNESS_WEIHENG && W2.byId.WITNESS_WEIHENG.cult.stage === 9, 'Wei Heng must survive Save/Load in W.byId at stage 9');
assert(W2.npcs.some(n => n && n.mentoredByWeiHeng), 'Mentored disciple state must survive Save/Load');
console.log('  [PASS] 3/4: Save/Load Round-Trip & W.byId re-registration verified');

// 5. Core Lock Integrity
assert.strictEqual(HC.FINGERPRINT, '155:2f9c9dd7');
console.log('  [PASS] 4/4: Human Core fingerprint lock intact (155:2f9c9dd7)');
console.log('=== ALL 4/4 DEEP ROUND C TESTS PASSED ===');
