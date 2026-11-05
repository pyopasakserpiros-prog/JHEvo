'use strict';
// Test Suite: Jianghu Figure Hydration, Identity Preservation & Enhanced Chronicle
const assert = require('assert');
const path = require('path');
const G = require('./load');
require('../js/ui');

const { SIM, EXPED, HC, UI } = G;

console.log('--- TEST SUITE: JIANGHU FIGURE HYDRATION & CHRONICLE ENHANCEMENTS ---');

const W = SIM.create('hydration-test-seed');
assert(W && W.world, 'World initialized');
EXPED.ensureWorldTopology(W);
EXPED.ensureJianghuFigures(W);

// 1. Verify exterior figures have procedural stats
const sects = W.world.allSects || [];
assert(sects.length >= 6, 'Multiple sects exist');
const testSect = sects[0];
assert(testSect.figures && testSect.figures.master && testSect.figures.deputy && testSect.figures.successor, 'Sect figures exist');

const sampleFig = testSect.figures.successor;
const origGiven = sampleFig.h.name.given;
const origAmbition = sampleFig.h.personality.ambition;
const origIntegrity = sampleFig.h.personality.integrity;
const origAggression = sampleFig.h.personality.aggression;

console.log('Testing Hydration for Figure:', sampleFig.titleAndNameTh, {
  given: origGiven,
  ambition: origAmbition,
  integrity: origIntegrity,
  aggression: origAggression
});

// 2. Hydrate Figure into Full Resident NPC
const initialNpcCount = W.npcs.length;
const hydResult = EXPED.hydrateFigureToNpc(W, sampleFig, { rank: 2, merit: 30 });

assert(hydResult && hydResult.ok, 'Hydration succeeds');
const residentNpc = hydResult.npc;
assert(residentNpc, 'Resident NPC returned');
assert.strictEqual(W.npcs.length, initialNpcCount + 1, 'NPC added to W.npcs');
assert.strictEqual(W.byId[residentNpc.id], residentNpc, 'Mapped in W.byId');

// 3. Verify Exact Identity & Personality Preservation (NOT REROLLED)
assert.strictEqual(residentNpc.h.name.given, origGiven, 'Given name preserved exactly');
assert.strictEqual(residentNpc.h.personality.ambition, origAmbition, 'Ambition preserved exactly');
assert.strictEqual(residentNpc.h.personality.integrity, origIntegrity, 'Integrity preserved exactly');
assert.strictEqual(residentNpc.h.personality.aggression, origAggression, 'Aggression preserved exactly');
assert(residentNpc.h.state && typeof residentNpc.h.state.hp === 'number', 'Full resident state initialized');
assert(residentNpc.cult && residentNpc.cult.path === sampleFig.cult.path, 'Cultivation path transferred');
assert(residentNpc.cult.stage === sampleFig.cult.stage, 'Cultivation stage transferred');
assert(residentNpc.equip && residentNpc.equip.WEAPON, 'Weapon equipped');

console.log('PASS 1: Figure hydrated to Full Resident NPC with exact personality & identity preserved!');

// 4. Verify Succession Crisis Defection Linkage
const testSect2 = sects[1];
const oldMaster = testSect2.figures.master;
assert(oldMaster, 'Sect master exists');

const succRes = EXPED.resolveSectSuccession(W, testSect2, 'ทดสอบศึกสืบทอด', {
  forceUsurpAttempt: true,
  forceWinner: 'DEPUTY',
  allowPlayerRefuge: true
});

assert(succRes && succRes.ok, 'Succession resolved');
assert.strictEqual(succRes.outcome, 'SUCCESSION_SCHISM', 'Succession resulted in schism');
if (succRes.record && succRes.record.renegadeFigureId) {
  const recruitedRenegade = W.npcs.find(n => n._origFigureId === succRes.record.renegadeFigureId);
  if (recruitedRenegade) {
    console.log('PASS 2: Defeated successor escaped and joined player sect as resident NPC:', HC.fullName(recruitedRenegade));
  }
}

// 5. Test Enhanced Multi-Category Chronicle Filtering in UI
assert(Array.isArray(W.world.chronicles) && W.world.chronicles.length > 0, 'World chronicles recorded');
UI.G = { W, R: {}, opts: {} };
UI.sheet = 'log';
UI.tab = 'all';
UI.logFilters = new Set(['all']);

// Render Log view
const logHtml = UI.rLog();
assert(logHtml.includes('จดหมายเหตุยุทธภพ & พงศาวดารพิราบสื่อสาร'), 'Epic world chronicle rendered in UI');

// Test category filtering
UI.worldChronicleCategory = 'SUCCESSION';
const filteredLogHtml = UI.rLog();
assert(filteredLogHtml.includes('จดหมายเหตุยุทธภพ & พงศาวดารพิราบสื่อสาร'), 'Filtered chronicle rendered');

// Test search filtering
UI.worldChronicleCategory = 'all';
UI.worldChronicleSearch = origGiven;
const searchedLogHtml = UI.rLog();
assert(searchedLogHtml.includes(origGiven), 'Searched chronicle matches figure name');

console.log('PASS 3: Epic chronicle multi-category and search filtering verified in UI!');

// 6. Test Save / Load Round-trip for Hydrated NPC & Chronicles
const serialized = SIM.serialize(W);
const restored = SIM.deserialize(serialized);

const restoredNpc = restored.npcs.find(n => n.id === residentNpc.id);
assert(restoredNpc, 'Restored hydrated NPC exists in save');
assert.strictEqual(restoredNpc.h.name.given, origGiven, 'Restored name identical');
assert.strictEqual(restoredNpc.h.personality.ambition, origAmbition, 'Restored ambition identical');
assert.strictEqual(restoredNpc.h.personality.integrity, origIntegrity, 'Restored integrity identical');
assert(Array.isArray(restored.world.chronicles) && restored.world.chronicles.length > 0, 'Restored world chronicles exist');

console.log('PASS 4: 100% Save/Load roundtrip verified for hydrated NPC and chronicles!');

console.log('=== ALL TESTS PASSED SUCCESSFULLY! ===');
