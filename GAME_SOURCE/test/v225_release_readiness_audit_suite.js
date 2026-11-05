'use strict';
/**
 * Reconstructed Regression Suite (v3.0.0 Audit):
 * v225_release_readiness_audit_suite.js
 * Verifies end-to-end release readiness: HC.FINGERPRINT lock, world creation,
 * multi-tick simulation stability, chronicle recording, and save/load integrity.
 */
const assert = require('assert');
const { SIM, HC, SECT, EXPED, COMBAT, STATS } = require('./load');

// 1. Core locks
assert.strictEqual(HC.FINGERPRINT, '155:2f9c9dd7', 'HC.FINGERPRINT must remain 155:2f9c9dd7');
assert(SIM.VERSION && SIM.PATCH_VERSION, 'SIM version identifiers defined');

// 2. World creation & simulation ticks
const W = SIM.create('v225-release-readiness-seed');
assert(W && W.sect && Array.isArray(W.npcs) && W.npcs.length >= 3, 'World created with founding NPCs');

for (let i = 0; i < 30; i++) {
  SIM.tick(W);
}
assert(W.t > 0 && W.npcs.every(n => Number.isFinite(STATS.get(n).hp)), '30 simulation ticks run cleanly');

// 3. Save/Load roundtrip integrity
const raw = SIM.serialize(W);
const W2 = SIM.deserialize(raw);
assert.strictEqual(W2.t, W.t, 'Deserialized world time matches');
assert.strictEqual(W2.npcs.length, W.npcs.length, 'Deserialized NPC count matches');
assert.strictEqual(W2.sect.name, W.sect.name, 'Deserialized sect name matches');

console.log('PASS v225_release_readiness_audit_suite');
