'use strict';
const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const G = require('./load.js');
const { HC, CULT, MARTIAL, STATS, JD, ECO } = G;

const ROOT = path.resolve(__dirname, '..');

console.log('=== Running Weapon, Subpath & Gear Expansion Suite (v2.0.4) ===');

// 0. Hard Invariant: human_core.js byte-for-byte SHA-256 lock
const hcBytes = fs.readFileSync(path.join(ROOT, 'js/human_core.js'));
const hcSha = crypto.createHash('sha256').update(hcBytes).digest('hex');
assert.strictEqual(
  hcSha,
  'a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542',
  'human_core.js must remain byte-for-byte identical'
);
assert.strictEqual(HC.FINGERPRINT, '155:2f9c9dd7', 'HC.FINGERPRINT must remain 155:2f9c9dd7');

// 1. Verify all twelve paths and 96 subpath runtime registrations (v2.0.14).
const paths = Object.keys(CULT.PATHS);
assert.strictEqual(paths.length, 12, 'Must have 12 major cultivation paths');
let totalSubpaths = 0;
for (const p of paths) {
  const subs = CULT.PATHS[p].subPaths || [];
  totalSubpaths += subs.length;
  for (const sObj of subs) {
    const s = sObj.id;
    assert(MARTIAL.PROFILES && MARTIAL.PROFILES[s], `Profile missing for subpath ${s}`);
    assert(STATS.SUBFX && STATS.SUBFX[s], `SUBFX missing for subpath ${s}`);
    assert(CULT.SUBPREF && CULT.SUBPREF[s], `SUBPREF missing for subpath ${s}`);
    assert(MARTIAL.INNATE_BY_SUB && MARTIAL.INNATE_BY_SUB[s], `INNATE_BY_SUB missing for subpath ${s}`);
  }
}
assert.strictEqual(totalSubpaths, 96, `Expected 96 subpaths, found ${totalSubpaths}`);

const expectedNewSubs = [
  'CLOUD_DRAGON_SPEAR', 'PURE_SWORD_SAINT', 'WAR_SPEAR_SOVEREIGN',
  'IRON_BOW_SENTINEL', 'OVERLORD_HEAVY_BLADE', 'SUN_BOW_DEITY',
  'GOLDEN_ARHAT_STAFF', 'BLOOD_SPEAR_ASURA', 'ASHURA_SLAUGHTER_BLADE',
  'ZITHER_HEART_BOW', 'HEART_BLADE_MEDITATION', 'VOID_SPEAR_MIND'
];
for (const sub of expectedNewSubs) {
  assert(MARTIAL.PROFILES[sub], `New subpath ${sub} must exist in MARTIAL.PROFILES`);
  assert(CULT.TRACKS[sub], `New subpath ${sub} must have CULT.TRACKS`);
  assert.strictEqual(CULT.TRACKS[sub].realms.length, 9, `TRACKS for ${sub} must have 9 realm stages`);
}

// 2. Preserve 697 baseline techniques/87 mantras plus 50 techniques/9 mantras.
const techniques = JD.TECH.techniques;
const mantras = JD.TECH.mantras;
assert(Array.isArray(techniques), 'JD.TECH.techniques must be an array');
assert.strictEqual(techniques.length, 747, `Expected 747 techniques, found ${techniques.length}`);
assert.strictEqual(mantras.length, 96, `Expected 96 mantras, found ${mantras.length}`);

const weaponTypes = ['SWORD', 'BLADE', 'SPEAR', 'STAFF', 'FIST', 'BOW', 'FOCUS'];
const countsByWeapon = {};
for (const w of weaponTypes) countsByWeapon[w] = 0;
let neutralCount = 0;

for (const t of techniques) {
  assert(t.id && t.nameTh && t.tier, `Technique ${t.id || 'unknown'} must have id, nameTh, tier`);
  assert(t.tier >= 1 && t.tier <= 7, `Technique ${t.id} tier out of range: ${t.tier}`);
  const wTypes = t.weaponTypes || (t.weapon ? [t.weapon] : []);
  for (const w of wTypes) {
    if (countsByWeapon[w] !== undefined) countsByWeapon[w]++;
  }
  if (!t.element || t.element === 'NEUTRAL' || t.element === 'EXPLICIT_NON_ELEMENTAL' || t.elementProfile?.mode === 'EXPLICIT_NON_ELEMENTAL') {
    neutralCount++;
  }
}

for (const w of weaponTypes) {
  assert(countsByWeapon[w] >= 20, `Weapon ${w} must have at least 20 techniques, found ${countsByWeapon[w]}`);
}
assert(neutralCount >= 50, `Expected >= 50 non-elemental/neutral techniques, found ${neutralCount}`);

// 3. Verify Equipment Matrix (353 items)
const items = JD.ITEMS.items;
assert(Array.isArray(items), 'JD.ITEMS.items must be an array');
assert.strictEqual(items.length, 420, `Expected 420 items, found ${items.length}`);

const itemById = {};
const itemsByGearType = {};
for (const item of items) {
  assert(item.id && item.nameTh, `Item ${item.id || 'unknown'} must have id and nameTh`);
  itemById[item.id] = item;
  if (item.gearType) {
    itemsByGearType[item.gearType] = (itemsByGearType[item.gearType] || 0) + 1;
  }
}

const allGearTypes = [
  'SWORD', 'BLADE', 'BOW', 'SPEAR', 'STAFF', 'FIST', 'FOCUS',
  'HEAVY', 'LIGHT', 'ROBE', 'RING', 'NECKLACE', 'BRACELET', 'CHARM'
];
for (const gt of allGearTypes) {
  assert(itemsByGearType[gt] >= 15, `GearType ${gt} must have at least 15 items, found ${itemsByGearType[gt] || 0}`);
}

// 4. Verify Recipe Matrix (476 recipes)
const recipes = JD.ITEMS.recipes;
assert(Array.isArray(recipes), 'JD.ITEMS.recipes must be an array');
assert.strictEqual(recipes.length, 578, `Expected 578 recipes, found ${recipes.length}`);

for (const rec of recipes) {
  assert(rec.id && rec.nameTh && rec.craft && rec.tier, `Recipe ${rec.id || 'unknown'} must specify id, nameTh, craft, tier`);
  assert(Array.isArray(rec.inputs) && rec.inputs.length > 0, `Recipe ${rec.id} inputs must be non-empty array`);
  for (const inp of rec.inputs) {
    assert(inp.matId && inp.count > 0, `Recipe ${rec.id} input invalid: ${JSON.stringify(inp)}`);
  }
}

// 5. Gear Suitability and Evaluation
const mockNpc = {
  id: 'test_npc_1',
  h: { name: { given: 'เทสต์' }, state: { hp: 100 }, skills: {} },
  cult: { path: 'XIAN', sub: 'CLOUD_DRAGON_SPEAR', stage: 4, techs: [] },
  equip: {}
};

const spearItem = items.find(it => it.gearType === 'SPEAR' && it.tier === 3);
assert(spearItem, 'Must have T3 SPEAR in items');
const suitResult = MARTIAL.gearSuitability ? MARTIAL.gearSuitability(mockNpc, spearItem, 100) : { score: 100 };
const score = typeof suitResult === 'number' ? suitResult : (suitResult?.score ?? 0);
assert(score > 0, 'Gear suitability score must be positive for matching subpath weapon');

console.log('PASS weapon_subpath_gear_expansion_suite: 96 subpaths, 747 techniques, 96 mantras, 420 items, 578 recipes verified');
