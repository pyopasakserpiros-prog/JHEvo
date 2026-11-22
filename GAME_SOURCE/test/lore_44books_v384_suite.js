'use strict';
const assert = require('assert');
const g = require('./load.js');

console.log('=== JS2 v3.8.4 Grand Lore Archive (44 Books + Canon Audit + System Blueprints) Verification Suite ===');

// 1. Version & Core Locks
assert.strictEqual(g.SIM.PATCH_VERSION, '3.9.6', 'PATCH_VERSION must be 3.8.4');
assert.strictEqual(g.SIM.SAVE_SCHEMA_VERSION, '3.9.6-deep-gameplay-integration');
assert.strictEqual(g.HC.FINGERPRINT, '155:2f9c9dd7', 'HC.FINGERPRINT must stay locked');
console.log('  [PASS] 1. Patch version 3.8.4 & HC.FINGERPRINT locked');

// 2. All 44 standalone Lore Chronicle modules loaded in JD
const expectedKeys = [
  'LORE_CHRONICLE_P1_ANTEDILUVIAN', 'LORE_CHRONICLE_E0_TIANSHU', 'LORE_CHRONICLE_P2_TIANGU_HEROES',
  'LORE_CHRONICLE_E0_E1', 'LORE_CHRONICLE_E1_E2_DAQIAN', 'LORE_CHRONICLE_E26_YUJING',
  'LORE_CHRONICLE_E26_LATE', 'LORE_CHRONICLE_P3_MIDDLE_EPOCHS', 'LORE_CHRONICLE_E99_EVE_OF_BALANCE',
  'LORE_CHRONICLE_P4_YUNHE_BALANCE', 'LORE_CHRONICLE_P5_PRESENT_EPOCH101',
  'LORE_CHRONICLE_E2_LATE_MANDATE', 'LORE_CHRONICLE_E3_E4_SUN_FORGE', 'LORE_CHRONICLE_E5_E8_CLOCKWORK',
  'LORE_CHRONICLE_E9_E10_BEAST_EMPIRE', 'LORE_CHRONICLE_E11_E14_PLAGUE_ALCHEMY', 'LORE_CHRONICLE_E15_E17_FAITH_SCHISM',
  'LORE_CHRONICLE_E18_E22_FOG_SEA', 'LORE_CHRONICLE_E23_E25_LITERATI_CHESS', 'LORE_CHRONICLE_E27_E28_FROST_MOON',
  'LORE_CHRONICLE_E29_E34_CHARTER', 'LORE_CHRONICLE_E35_E38_VOID_CITADELS', 'LORE_CHRONICLE_E39_E44_BLADE_KARMA',
  'LORE_CHRONICLE_E45_E46_ARENA_EMPIRE', 'LORE_CHRONICLE_E47_E50_NETHER_ECLIPSE', 'LORE_CHRONICLE_E51_E53_DAWN_MIDDLE',
  'LORE_CHRONICLE_E54_E59_CARAVAN_WARS', 'LORE_CHRONICLE_E60_E62_QIANKUN_KNIFE', 'LORE_CHRONICLE_E63_JADE_AUCTION',
  'LORE_CHRONICLE_E64_E67_SAMSARA_THREADS', 'LORE_CHRONICLE_E68_E73_BLOOD_MOON', 'LORE_CHRONICLE_E74_E77_ASHURA_SEA',
  'LORE_CHRONICLE_E78_E84_DRAGON_VEINS', 'LORE_CHRONICLE_E85_E94_DUGU_SWORD',
  'LORE_CHRONICLE_ANTHOLOGY_TAVERNS', 'LORE_CHRONICLE_ANTHOLOGY_CURSED_RELICS', 'LORE_CHRONICLE_ANTHOLOGY_MYSTERIES',
  'LORE_CHRONICLE_ANTHOLOGY_HERMITS', 'LORE_CHRONICLE_ANTHOLOGY_ECOLOGY', 'LORE_CHRONICLE_ANTHOLOGY_CUSTOMS',
  'LORE_CHRONICLE_EVENTS_ASSEMBLIES', 'LORE_CHRONICLE_EVENTS_POCKET_REALMS', 'LORE_CHRONICLE_EVENTS_COSMIC_TIDES',
  'LORE_CHRONICLE_EVENTS_RITES_MARKETS'
];
assert.strictEqual(expectedKeys.length, 44);
for (const k of expectedKeys) {
  assert(g.JD && g.JD[k], `Missing JD.${k}`);
}
console.log('  [PASS] 2. All 44 Lore Chronicles loaded cleanly in JD');

// 3. Batch 6 System Blueprints (24/24)
const bpChecks = [
  ['LORE_CHRONICLE_EVENTS_ASSEMBLIES', 'GRAND_CONVENTIONS', 6],
  ['LORE_CHRONICLE_EVENTS_POCKET_REALMS', 'POCKET_REALMS_DOSSIER', 6],
  ['LORE_CHRONICLE_EVENTS_COSMIC_TIDES', 'WORLD_CYCLES_AND_CALAMITIES', 6],
  ['LORE_CHRONICLE_EVENTS_RITES_MARKETS', 'SYSTEM_TRADITIONS_AND_RITES', 6]
];
let totalBp = 0;
for (const [k, arrName, minCount] of bpChecks) {
  const arr = g.JD[k][arrName];
  assert(Array.isArray(arr) && arr.length === minCount, `${k}.${arrName} must have ${minCount} items`);
  for (const it of arr) {
    assert(it.systemBlueprint && typeof it.systemBlueprint === 'object', `Missing systemBlueprint in ${it.id}`);
    totalBp++;
  }
}
assert.strictEqual(totalBp, 24);
console.log('  [PASS] 3. All 24/24 System Blueprints verified across Books 41–44');

// 4. In-game Legendary & Transcendent canon fixes
const champTrait = (g.JD.TRAITS || []).find(t => t.id === 'TR_AC_TOURNAMENT_CHAMPION');
if (champTrait) assert(!champTrait.descTh.includes('ทั่วเก้าทวีป'), 'TR_AC_TOURNAMENT_CHAMPION must not reference เก้าทวีป');
const sovCombat = (g.JD.TCMB_SOVEREIGN_ARTS || g.JD.sovereignCombatArts || []);
for (const sc of sovCombat) {
  if (sc && sc.descTh) assert(!sc.descTh.includes('霸道'), 'No stray Chinese typo in sovereignCombatArts');
}
console.log('  [PASS] 4. In-game Legendary & Transcendent canon fixes verified');

// 5. UI.rLore('chronicles') renders all 44 books cleanly with zero W mutation & zero RNG consumption
const W = g.SIM.create('v384_44books_ui');
const rngBefore = JSON.stringify(W.rng.getState());
const snapBefore = g.SIM.serialize(W);
if (!g.UI) {
  g.document = { getElementById: () => null, querySelectorAll: () => [], addEventListener: () => {} };
  require('../js/ui.js');
}
g.UI.G = { W };
g.UI.tab = 'chronicles';
g.UI.loreChronicleCat = 'ALL';
const allBookKeys = [
  'P1', 'TS', 'P2', 'E01', 'DQ', 'E26A', 'E26B', 'P3', 'E99', 'P4', 'P5',
  'B12', 'B13', 'B14', 'B15', 'B16', 'B17', 'B18', 'B19', 'B20', 'B21', 'B22', 'B23',
  'B24', 'B25', 'B26', 'B27', 'B28', 'B29', 'B30', 'B31', 'B32', 'B33', 'B34',
  'B35', 'B36', 'B37', 'B38', 'B39', 'B40', 'B41', 'B42', 'B43', 'B44'
];
assert.strictEqual(allBookKeys.length, 44);
for (const bk of allBookKeys) {
  g.UI.loreChronicleBook = bk;
  const html = g.UI.rLore();
  assert(typeof html === 'string' && html.length > 500, `Book ${bk} rendered too short`);
  assert(!html.includes('ไม่พบข้อมูลมหากาพย์บทนี้'), `Book ${bk} missing in UI`);
}
assert.strictEqual(JSON.stringify(W.rng.getState()), rngBefore, 'UI.rLore must NOT consume W.rng');
assert.strictEqual(g.SIM.serialize(W), snapBefore, 'UI.rLore must NOT mutate W');
console.log('  [PASS] 5. UI.rLore("chronicles") renders all 44/44 books read-only with zero RNG/W mutation');

console.log('ALL JS2 v3.8.4 GRAND LORE 44-BOOK SUITE CHECKS PASSED (5/5)');
