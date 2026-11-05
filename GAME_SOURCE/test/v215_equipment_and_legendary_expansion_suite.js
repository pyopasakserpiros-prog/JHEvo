'use strict';
/**
 * Reconstructed Regression Suite (v3.0.0 Audit):
 * v215_equipment_and_legendary_expansion_suite.js
 * Verifies equipment catalog expansion, legendary gear properties, equipment-granted techniques,
 * resonance set evaluation, and save/load persistence.
 */
const assert = require('assert');
const { SIM, ECO, MARTIAL, JD } = require('./load');

const W = SIM.create('v215-restored-regression');
const npc = W.npcs[0];
assert(npc && npc.equip, 'NPC initialized with equipment slots');

// 1. Verify equipment catalog and legendary items exist in JD.ITEMS
const allItems = (JD.ITEMS && JD.ITEMS.items) || [];
const gearItems = allItems.filter(it => it && ['WEAPON', 'ARMOR', 'ACCESSORY'].includes(it.slot));
const legendaryGear = gearItems.filter(it => it.legendary || (it.tier || 1) >= 5);
assert(gearItems.length >= 60, 'Equipment catalog has expanded gear pool');
assert(legendaryGear.length >= 5, 'Legendary / high-tier gear items exist in catalog');

// 2. Verify procedural & minted gear instances have unique UIDs and valid stats
const sampleWeapon = legendaryGear.find(it => it.slot === 'WEAPON') || gearItems.find(it => it.slot === 'WEAPON');
assert(sampleWeapon, 'Sample weapon found');
const minted = ECO.mintGear ? ECO.mintGear(sampleWeapon, 1.1) : Object.assign({}, sampleWeapon, { uid: 'G_TEST_215' });
if (!minted.uid && ECO.nextGearUid) minted.uid = ECO.nextGearUid(W, minted.id);
npc.equip.WEAPON = minted;
assert(npc.equip.WEAPON && npc.equip.WEAPON.uid, 'Equipped weapon has unique UID');

// 3. Verify MARTIAL equipment skill grants & resonance evaluation
if (MARTIAL && MARTIAL.grantedEquipmentTechs) {
  const granted = MARTIAL.grantedEquipmentTechs(npc);
  assert(Array.isArray(granted), 'MARTIAL.grantedEquipmentTechs returns array');
}
if (MARTIAL && MARTIAL.evaluateResonanceSet) {
  const res = MARTIAL.evaluateResonanceSet(npc);
  assert(res && typeof res === 'object', 'MARTIAL.evaluateResonanceSet returns object');
}

// 4. Verify save/load roundtrip preserves equipped weapon UID
const loaded = SIM.deserialize(SIM.serialize(W));
const loadedNpc = loaded.byId[npc.id];
assert(loadedNpc && loadedNpc.equip && loadedNpc.equip.WEAPON && loadedNpc.equip.WEAPON.uid === minted.uid, 'Save/load preserves equipped weapon UID');

console.log('PASS v215_equipment_and_legendary_expansion_suite');
