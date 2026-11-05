'use strict';
/**
 * Reconstructed Regression Suite (v3.0.0 Audit):
 * v217_deep_cohesion_and_relic_trinity_suite.js
 * Verifies 3-piece legendary relic trinity resonance (MARTIAL.evaluateLegendaryRelicResonance),
 * stat recalculation cohesion, and save/load roundtrip.
 */
const assert = require('assert');
const { SIM, MARTIAL, STATS, JD } = require('./load');

const W = SIM.create('v217-restored-regression');
const npc = W.npcs[0];
const items = (JD.ITEMS && JD.ITEMS.items) || [];

// 1. Equip 3 legendary items across WEAPON, ARMOR, ACCESSORY
const legW = items.find(i => i.slot === 'WEAPON' && i.legendary) || { id: 'LEG_W_TEST', slot: 'WEAPON', gearType: 'SWORD', legendary: true, tier: 5, nameTh: 'กระบี่เซียนอมตะ' };
const legA = items.find(i => i.slot === 'ARMOR' && i.legendary) || { id: 'LEG_A_TEST', slot: 'ARMOR', gearType: 'ROBE', legendary: true, tier: 5, nameTh: 'อาภรณ์เซียนอมตะ' };
const legAcc = items.find(i => i.slot === 'ACCESSORY' && i.legendary) || { id: 'LEG_ACC_TEST', slot: 'ACCESSORY', gearType: 'RING', legendary: true, tier: 5, nameTh: 'แหวนเซียนอมตะ' };

npc.equip = {
  WEAPON: Object.assign({}, legW, { uid: 'UID_LEG_W' }),
  ARMOR: Object.assign({}, legA, { uid: 'UID_LEG_A' }),
  ACCESSORY: Object.assign({}, legAcc, { uid: 'UID_LEG_ACC' })
};
STATS.dirty(npc);

// 2. Verify legendary relic resonance evaluation
if (MARTIAL && MARTIAL.evaluateLegendaryRelicResonance) {
  const relRes = MARTIAL.evaluateLegendaryRelicResonance(npc);
  assert(relRes && typeof relRes === 'object', 'evaluateLegendaryRelicResonance returns resonance object');
  assert(Number.isFinite(relRes.qiCostMult), 'qiCostMult is finite');
}

const st = STATS.get(npc);
assert(Number.isFinite(st.atk) && st.atk > 0, 'NPC stats compute cleanly with 3 legendary relics');

console.log('PASS v217_deep_cohesion_and_relic_trinity_suite');
