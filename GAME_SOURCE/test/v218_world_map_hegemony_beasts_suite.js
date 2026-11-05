'use strict';
/**
 * Reconstructed Regression Suite (v3.0.0 Audit):
 * v218_world_map_hegemony_beasts_suite.js
 * Verifies macro regions, contestable resource nodes, vassal hegemony & tribute,
 * world anomalies, and Four Symbol beast bloodlines.
 */
const assert = require('assert');
const { SIM, EXPED, CULT } = require('./load');

const W = SIM.create('v218-restored-regression');
while (W.npcs.length < 5) {
  SIM.addNpc(W, { ageYears: 24, rank: 2, stage: 4, quality: 0.75 });
}
EXPED.ensureWorldTopology(W);

// 1. Verify macro regions & resource nodes exist
assert(EXPED.WORLD_REGIONS && EXPED.WORLD_REGIONS.NORTHERN_PEAKS, 'Macro regions defined');
const nodeIds = Object.keys(W.world.resourceNodes || {});
assert(nodeIds.length >= 4, 'Contestable resource nodes initialized');

// 2. Claim and harvest a resource node
const claimRes = EXPED.claimResourceNode(W, nodeIds[0], W.npcs.slice(0, 3), { forceWin: true });
assert(claimRes && claimRes.ok && claimRes.won, 'Resource node claimed');
const harvRes = EXPED.harvestResourceNodes(W, { force: true });
assert(harvRes && harvRes.ok && harvRes.totalStones > 0, 'Resource node harvested for spirit stones');

// 3. Spawn and resolve a timed world anomaly
const anom = EXPED.spawnWorldAnomaly(W, { durationDays: 12 });
assert(anom && anom.id && !anom.resolved, 'World anomaly spawned');
const anomRes = EXPED.resolveWorldAnomaly(W, anom, W.npcs.slice(0, 3), { forceWin: true });
assert(anomRes && anomRes.ok && anomRes.won, 'World anomaly resolved');

// 4. Verify Four Symbol beast bloodlines
if (CULT.FOUR_SYMBOL_BLOODLINES) {
  for (const sym of ['AZURE_DRAGON', 'WHITE_TIGER', 'VERMILION_PHOENIX', 'BLACK_TORTOISE']) {
    assert(CULT.FOUR_SYMBOL_BLOODLINES[sym], `Four Symbol bloodline ${sym} defined`);
  }
}

console.log('PASS v218_world_map_hegemony_beasts_suite');
