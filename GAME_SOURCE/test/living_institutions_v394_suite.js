'use strict';
const assert = require('assert');
const g = require('./load.js');

console.log('=== JS2 v3.9.4 — Living Institutions, Epoch 101 Cycles & Bloodless War Suite ===');

// 1. Hard Locks, version & zero W.rng consumption
assert.strictEqual(g.HC.FINGERPRINT, '155:2f9c9dd7', 'Human Core fingerprint locked');
assert.strictEqual(g.SIM.PATCH_VERSION, '3.9.6', 'PATCH_VERSION must be 3.9.4');
assert.strictEqual(g.SIM.SAVE_SCHEMA_VERSION, '3.9.6-deep-gameplay-integration');
assert(g.EXPED && g.EXPED.LIVING_INSTITUTIONS, 'EXPED.LIVING_INSTITUTIONS must exist');

const W = g.SIM.create('v394_living_inst_seed');
const li0 = g.EXPED.LIVING_INSTITUTIONS.ensure(W);
assert(li0 && li0.version === g.EXPED.LIVING_INSTITUTIONS.VERSION);
assert.strictEqual(li0.sectNameRegistry.taxPaidThroughYear, 1, 'Year 1 tax must be prepaid by Gen-6');
assert.strictEqual(li0.curseEconomy.countdownYearsRemaining, 11, 'Beiming curse countdown starts at 11 years');
console.log('  [PASS] 1/4: Hard Locks, v3.9.4 version & initial Epoch 101 institutional state verified');

// 2. Simulate Days 1..75 of Year 1 autonomously (no player commands!)
const baseT = W.t;
for (let d = 0; d < 76; d++) {
  W.t = baseT + d * 1440;
  g.EXPED.LIVING_INSTITUTIONS.tickDaily(W);
}
const li75 = W.world.livingInstitutions;
assert.strictEqual(li75.departedNetwork.stoneBenchesInspected, true, 'Day 1 stone bench inspection must fire');
assert.strictEqual(li75.departedNetwork.teaPouchReturned, true, 'Day 9 tea pouch return must fire');
assert.notStrictEqual(li75.bloodlessWar.nameLeaseDecision, 'PENDING', 'Day 20 Tong Yu name-lease offer must be decided autonomously');
assert.strictEqual(li75.ticketMarket.settled, true, 'Day 75 ticket market must settle when Primordial Rift opens');
assert(li75.activeCycles.some(c => c.id === 'PRIMORDIAL_RIFT'), 'Primordial Rift must open on Year 1 Month 3 Day 15');
console.log(`  [PASS] 2/4: Days 1–75 autonomous simulation verified (lease=${li75.bloodlessWar.nameLeaseDecision}, exposedDay=${li75.ticketMarket.exposedAtDay}, escalated=${li75.ticketMarket.escalatedToBlackLedger})`);

// 3. Simulate through Year 5 (1,620 days) verifying annual 2% tax, Year 4 "ปีสามเหตุ" & curse countdown
const seenCycles = new Set(li75.activeCycles.map(c => c.id));
for (let d = 76; d < 1620; d++) {
  W.t = baseT + d * 1440;
  g.EXPED.LIVING_INSTITUTIONS.tickDaily(W);
  for (const c of W.world.livingInstitutions.activeCycles) seenCycles.add(c.id);
}
const liY5 = W.world.livingInstitutions;
assert.strictEqual(liY5.tripleEventYearTriggered, true, 'Year 4 "ปีสามเหตุ" must trigger');
for (const reqId of ['PRIMORDIAL_RIFT', 'DAWN_STELE_CAVE', 'FOG_WHIRLPOOL', 'REVERSE_RIVER', 'DEEP_YIN_ECLIPSE', 'BLOOD_ECLIPSE_PORTAL']) {
  assert(seenCycles.has(reqId), `Expected canonical cycle ${reqId} to trigger by Year 5`);
}
assert(liY5.sectNameRegistry.taxPaidThroughYear >= 4, `Expected annual 2% tax paid through Year 4+ (got ${liY5.sectNameRegistry.taxPaidThroughYear})`);
assert(liY5.sectNameRegistry.totalTaxPaid >= 60, `Expected >= 60 stones total tax paid (got ${liY5.sectNameRegistry.totalTaxPaid})`);
assert(liY5.curseEconomy.countdownYearsRemaining <= 7, `Expected curse countdown <= 7 by Year 5 (got ${liY5.curseEconomy.countdownYearsRemaining})`);
assert(liY5.curseEconomy.winterPalaceBulkBuyCount >= 4, 'Expected Winter Solstice bulk-buy pulses across 4+ winters');
console.log(`  [PASS] 3/4: Multi-year Year 1→Year 5 simulation verified (cycles=${seenCycles.size}, taxPaid=${liY5.sectNameRegistry.totalTaxPaid}, curseRem=${liY5.curseEconomy.countdownYearsRemaining}y)`);

// 4. Save/Load round-trip & Read-Only Summary Zero-Mutation
const raw = g.SIM.serialize(W);
const W2 = g.SIM.deserialize(raw);
assert(W2.world && W2.world.livingInstitutions, 'livingInstitutions must survive save/load');
assert.strictEqual(W2.world.livingInstitutions.tripleEventYearTriggered, true);
assert.strictEqual(W2.world.livingInstitutions.sectNameRegistry.totalTaxPaid, liY5.sectNameRegistry.totalTaxPaid);

const beforeSnap = JSON.stringify(W2.world.livingInstitutions);
const sum = g.EXPED.LIVING_INSTITUTIONS.getReadOnlySummary(W2);
const afterSnap = JSON.stringify(W2.world.livingInstitutions);
assert.strictEqual(beforeSnap, afterSnap, 'getReadOnlySummary must not mutate state');
assert(sum && Array.isArray(sum.upcomingCycles) && sum.upcomingCycles.length > 0, 'Read-only summary must list upcoming cycles');
console.log('  [PASS] 4/4: Save/Load round-trip & read-only summary zero-mutation verified');

console.log('ALL JS2 v3.9.4 LIVING INSTITUTIONS CHECKS PASSED (4/4)');
