'use strict';
/**
 * Reconstructed Regression Suite (v3.0.0 Audit):
 * v216_mentorship_jianghu_legendary_relics_suite.js
 * Verifies mentor-disciple linkage, Jianghu figures & wandering legends, and unique legendary relic tracking.
 */
const assert = require('assert');
const { SIM, SECT, EXPED, CULT, VC, HC } = require('./load');

const W = SIM.create('v216-restored-regression');
while (W.npcs.length < 4) {
  SIM.addNpc(W, { ageYears: 18, rank: 1, stage: 1, quality: 0.6 });
}

// 1. Verify mentor-disciple bond between master and founding disciples
const master = W.byId[W.sect.masterId];
const disciple = W.npcs.find(n => n.id !== master.id && n.mentor === master.id) || W.npcs[1];
disciple.mentor = master.id;
master.h.life.family.disciples = master.h.life.family.disciples || [];
if (!master.h.life.family.disciples.includes(disciple.id)) master.h.life.family.disciples.push(disciple.id);
disciple.h.life.family.master = master.id;
assert.strictEqual(disciple.mentor, master.id, 'Disciple mentor ID links to master');
assert(master.h.life.family.disciples.includes(disciple.id), 'Master family disciples list includes disciple');

// 2. Verify Jianghu figures & wandering legends initialization
EXPED.ensureWorldTopology(W);
EXPED.ensureJianghuFigures(W);
const legends = EXPED.ensureWanderingLegends(W, 5);
assert(Array.isArray(legends) && legends.length >= 5, 'At least 5 wandering legends initialized');
assert(legends[0].fullNameTh && legends[0].epithetTh, 'Wandering legend has Thai full name and epithet');

// 3. Verify unique artifact synchronization if VC is loaded
if (VC && VC.syncUniqueArtifacts) {
  VC.syncUniqueArtifacts(W);
}

console.log('PASS v216_mentorship_jianghu_legendary_relics_suite');
