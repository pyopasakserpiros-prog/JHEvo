'use strict';
/**
 * Reconstructed Regression Suite (v3.0.0 Audit):
 * v219_sect_tiers_alliances_internal_politics_suite.js
 * Verifies canonical sect tiers, Righteous/Demonic/Neutral alliance leadership rules,
 * alliance council resolutions, and disciple cross-alignment encounter probabilities.
 */
const assert = require('assert');
const { SIM, EXPED } = require('./load');

const W = SIM.create('v219-restored-regression');
while (W.npcs.length < 5) {
  SIM.addNpc(W, { ageYears: 24, rank: 2, stage: 3, quality: 0.7 });
}
EXPED.ensureWorldTopology(W);
EXPED.ensureJianghuFigures(W);

// 1. Verify Sect Tier definitions & Canonical Sects
assert(EXPED.SECT_TIER_DEFS && EXPED.SECT_TIER_DEFS.SACRED_LAND, 'SECT_TIER_DEFS defined');
assert(Array.isArray(EXPED.CANONICAL_SECTS) && EXPED.CANONICAL_SECTS.length >= 8, 'Canonical sects populated');

// 2. Verify Alliance Leadership hard rule: Righteous & Demonic have supreme leaders, Neutral has none
const alliances = EXPED.evaluateAllianceLeadership(W);
assert(alliances && alliances.RIGHTEOUS && alliances.RIGHTEOUS.hasSupremeLeader === true, 'Righteous alliance has supreme leader');
assert(alliances.DEMONIC && alliances.DEMONIC.hasSupremeLeader === true, 'Demonic alliance has supreme leader');
assert(alliances.NEUTRAL && alliances.NEUTRAL.hasSupremeLeader === false && alliances.NEUTRAL.leaderSectId === null, 'Neutral network has no supreme alliance leader');

// 3. Verify Alliance Council tick & Disciple Clash Chance
const councilRes = EXPED.tickAllianceCouncil(W, { alignment: 'RIGHTEOUS', quiet: true });
assert(councilRes && councilRes.ok, 'Alliance council resolution succeeds');

const oppChance = EXPED.computeDiscipleClashChance(W, 'RIGHTEOUS', { alignment: 'DEMONIC', attitude: -40 });
const sameChance = EXPED.computeDiscipleClashChance(W, 'RIGHTEOUS', { alignment: 'RIGHTEOUS', attitude: 40 });
assert(oppChance.probability > sameChance.probability, 'Opposite alignment has higher disciple clash probability than friendly same alignment');

console.log('PASS v219_sect_tiers_alliances_internal_politics_suite');
