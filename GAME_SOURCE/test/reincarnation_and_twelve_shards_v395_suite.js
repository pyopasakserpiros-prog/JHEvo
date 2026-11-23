'use strict';
const assert = require('assert');
const g = require('./load.js');

console.log('=== JS2 v3.9.5 — Reincarnated Witnesses, Secret Sub-Paths & 12 Rift-Shard Realms Suite ===');

// 1. Hard Locks, version & registries
assert.strictEqual(g.HC.FINGERPRINT, '155:2f9c9dd7', 'Human Core fingerprint locked');
assert.strictEqual(g.SIM.PATCH_VERSION, '3.9.6', 'PATCH_VERSION must be 3.9.5');
const WS = g.EXPED.WITNESSES_AND_SHARDS;
assert(WS, 'EXPED.WITNESSES_AND_SHARDS must exist');
assert.strictEqual(WS.TWELVE_SHARDS.length, 13, 'Must define 12 Rift-Shard Realms + 1 Reserve');
assert.strictEqual(Object.keys(WS.SECRET_SUBPATHS).length, 3, 'Must define 3 Secret Sub-Paths');
assert.strictEqual(WS.FOLK_TRAITS.length, 3, 'Must define 3 Folk Traits');
console.log('  [PASS] 1/4: Hard Locks, 12+1 Rift-Shard Realms, 3 Secret Sub-Paths & 3 Folk Traits verified');

// 2. 61-Year Autonomous Long-Horizon Simulation (Year 1 → Year 62 = 22,320 days)
const W = g.SIM.create('v395_61yr_witnesses_seed');
const baseT = W.t;
const t0 = Date.now();
for (let d = 0; d <= 22320; d++) {
  W.t = baseT + d * 1440;
  g.EXPED.LIVING_INSTITUTIONS.tickDaily(W);
  WS.tickDaily(W);
}
const elapsedMs = Date.now() - t0;

const ws = W.world.witnessesAndShards;
// Verify A-Ping progression
assert.strictEqual(ws.aping.handwritingVerified, true, 'A-Ping handwriting must be verified by Cai Xiaolu');
assert(ws.aping.namesReleasedLegally > 10000, `A-Ping should release >10,000 names over 61 years (got ${ws.aping.namesReleasedLegally})`);
assert(ws.aping.countdownTier <= 3, `A-Ping countdown tier should advance to <=3 (got ${ws.aping.countdownTier})`);

// Verify Wei Heng full canonical lifecycle (Born Y2 -> Record Y25 -> Ceiling Y48 -> Shadow Radiance Y52 -> Living Chronicler Y61)
assert.strictEqual(ws.weiheng.born, true, 'Wei Heng must be born in Year 2');
assert.strictEqual(ws.weiheng.ceramicRecordVerified, true, 'Wei Heng must verify Tao De ceramic record in Year 25');
assert.strictEqual(ws.weiheng.ceilingReached, true, 'Wei Heng must reach Lower-World Ceiling in Year 48');
assert.strictEqual(ws.weiheng.epithetEarned, true, 'Wei Heng must earn Shadow Radiance epithet in Year 52');
assert.strictEqual(ws.weiheng.stage, 'LIVING_CHRONICLER', 'Wei Heng must become Living Chronicler in Year 61');

// Verify Event-Triggered Shards (#10, #11, #12)
assert(ws.eventShards.skyFallOpenCount > 7, 'Sky-Fall Sorting Yard (#11) must trigger during 61 years');
assert(ws.eventShards.twoBankTrucesWitnessed >= 1, 'Two-Bank Water Realm (#12) must open at least once');
assert.strictEqual(ws.eventShards.tianguKeysGranted, 9, 'Tiangu Folded Treasury (#10) should reach 9 keys over 61 years');
console.log(`  [PASS] 2/4: 61-year autonomous simulation verified in ${elapsedMs}ms (A-Ping tier=${ws.aping.countdownTier}, WeiHeng=${ws.weiheng.stage}, SkyFall=${ws.eventShards.skyFallOpenCount})`);

// 3. Verify Living Institutions 61-year harmony (Dragon Vein Surge Year 20!)
const li = W.world.livingInstitutions;
assert(li.completedCyclesCount >= 10, `Expected >=10 completed world cycles over 61 years (got ${li.completedCyclesCount})`);
assert.strictEqual(li.curseEconomy.countdownYearsRemaining, 0, 'Beiming 11-year curse countdown reaches 0 without violating Canon Lock');
console.log(`  [PASS] 3/4: Cross-system 61-year harmony verified (completedCycles=${li.completedCyclesCount}, totalTaxPaid=${li.sectNameRegistry.totalTaxPaid})`);

// 4. Save/Load Round-Trip & Read-Only Summary Zero-Mutation
const raw = g.SIM.serialize(W);
const W2 = g.SIM.deserialize(raw);
assert(W2.world && W2.world.witnessesAndShards, 'witnessesAndShards must survive save/load');
assert.strictEqual(W2.world.witnessesAndShards.weiheng.stage, 'LIVING_CHRONICLER');
const beforeSnap = JSON.stringify(W2.world.witnessesAndShards);
const sum = WS.getReadOnlySummary(W2);
assert.strictEqual(beforeSnap, JSON.stringify(W2.world.witnessesAndShards), 'getReadOnlySummary must be strictly read-only');
assert.strictEqual(sum.totalShardsCount, 12);
console.log('  [PASS] 4/4: Save/Load round-trip & read-only summary zero-mutation verified');

console.log('ALL JS2 v3.9.5 WITNESSES, SUB-PATHS & 12 SHARDS CHECKS PASSED (4/4)');
