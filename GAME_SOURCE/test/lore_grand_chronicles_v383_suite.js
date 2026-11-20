'use strict';
const assert = require('assert');
const g = require('./load.js');

console.log('=== JS2 v3.8.3 Grand Lore Chronicles (11 Books) Verification Suite ===');

// 1. Version & core locks
assert.strictEqual(g.SIM.PATCH_VERSION, '3.8.4', 'PATCH_VERSION must be 3.8.3');
assert.strictEqual(g.SIM.SAVE_SCHEMA_VERSION, '3.8.4-grand-lore-44books-canon-events');
assert.strictEqual(g.HC.FINGERPRINT, '155:2f9c9dd7', 'HC.FINGERPRINT must stay locked');
console.log('  [PASS] 1. Patch version 3.8.3 & HC.FINGERPRINT locked');

// 2. All 11 standalone Lore Chronicle modules loaded in JD
const expectedKeys = [
  'LORE_CHRONICLE_P1_ANTEDILUVIAN',
  'LORE_CHRONICLE_E0_TIANSHU',
  'LORE_CHRONICLE_P2_TIANGU_HEROES',
  'LORE_CHRONICLE_E0_E1',
  'LORE_CHRONICLE_E1_E2_DAQIAN',
  'LORE_CHRONICLE_E26_YUJING',
  'LORE_CHRONICLE_E26_LATE',
  'LORE_CHRONICLE_P3_MIDDLE_EPOCHS',
  'LORE_CHRONICLE_E99_EVE_OF_BALANCE',
  'LORE_CHRONICLE_P4_YUNHE_BALANCE',
  'LORE_CHRONICLE_P5_PRESENT_EPOCH101'
];
for (const k of expectedKeys) {
  assert(g.JD && g.JD[k], `Missing JD.${k}`);
}
assert.strictEqual(g.JD.LORE_CHRONICLE_P1_ANTEDILUVIAN.OUTER_SIX_EMPIRES.length, 6);
assert.strictEqual(g.JD.LORE_CHRONICLE_P1_ANTEDILUVIAN.BEAST_KINGS.length, 6);
assert.strictEqual(g.JD.LORE_CHRONICLE_P2_TIANGU_HEROES.FIGURES_1_TO_25.length, 25);
assert.strictEqual(g.JD.LORE_CHRONICLE_P2_TIANGU_HEROES.INVADER_EMPIRE_DOSSIER.id, 'OUTER_EMP_JINYANG_SPLINTERS');
assert.strictEqual(g.JD.LORE_CHRONICLE_P3_MIDDLE_EPOCHS.MIDDLE_TWELVE_KINGDOMS.length, 12);
assert.strictEqual(g.JD.LORE_CHRONICLE_P3_MIDDLE_EPOCHS.FIGURES_32_TO_41.length, 10);
assert.strictEqual(g.JD.LORE_CHRONICLE_E99_EVE_OF_BALANCE.EVENTS.length, 7);
assert.strictEqual(g.JD.LORE_CHRONICLE_P4_YUNHE_BALANCE.RECENT_SIX_FALLEN.length, 6);
assert.strictEqual(g.JD.LORE_CHRONICLE_P4_YUNHE_BALANCE.FIVE_BUFFER_KINGDOMS.length, 5);
assert.strictEqual(g.JD.LORE_CHRONICLE_P5_PRESENT_EPOCH101.FIGURES_46_TO_60.length, 15);
console.log('  [PASS] 2. All 11 Lore Chronicles loaded with exact canonical entity counts');

// 3. UI.rLore('chronicles') renders all 11 books cleanly with zero W mutation & zero RNG consumption
const W = g.SIM.create('v383_chronicles_ui');
const rngBefore = JSON.stringify(W.rng.getState());
const snapBefore = g.SIM.serialize(W);
if (!g.UI) {
  g.document = { getElementById: () => null, querySelectorAll: () => [], addEventListener: () => {} };
  require('../js/ui.js');
}
g.UI.G = { W };
g.UI.tab = 'chronicles';
const books = ['P1', 'TS', 'P2', 'E01', 'DQ', 'E26A', 'E26B', 'P3', 'E99', 'P4', 'P5'];
for (const bk of books) {
  g.UI.loreChronicleBook = bk;
  const html = g.UI.rLore();
  assert(typeof html === 'string' && html.length > 500, `Book ${bk} rendered too short`);
  assert(!html.includes('ไม่พบข้อมูลมหากาพย์บทนี้'), `Book ${bk} missing in UI`);
}
assert.strictEqual(JSON.stringify(W.rng.getState()), rngBefore, 'UI.rLore must NOT consume W.rng');
assert.strictEqual(g.SIM.serialize(W), snapBefore, 'UI.rLore must NOT mutate W');
console.log('  [PASS] 3. UI.rLore("chronicles") renders all 11 books read-only with zero RNG/W mutation');

console.log('ALL JS2 v3.8.3 LORE GRAND CHRONICLES CHECKS PASSED (3/3)');
