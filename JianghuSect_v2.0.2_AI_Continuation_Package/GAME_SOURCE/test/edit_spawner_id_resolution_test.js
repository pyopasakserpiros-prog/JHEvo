'use strict';
const assert = require('assert');
const G = require('./load.js');

console.log('=== Running Edit Spawner & Item ID Resolution Test ===');
const W = G.SIM.create('edit-spawner-regression-test');
const n = W.npcs[0];
n.cult = { path: 'XIAN', stage: 7, sub: 'PURE_SWORD_SAINT', techs: [] };

// 1. Verify 100% of all items in catalog can be spawned
const catalog = G.SECT.EDITOR.catalog(W);
assert(catalog.length > 2000, `Catalog must have comprehensive coverage, got ${catalog.length}`);

for (const it of catalog) {
  const res = G.SECT.EDITOR.spawnItem(W, { kind: it.kind, id: it.id, qty: 1, dest: 'sect' });
  assert(res.ok, `Catalog item ${it.kind}:${it.id} (${it.nameTh}) must spawn successfully, got reason: ${res.reason}`);
}
console.log(`PASS: All ${catalog.length} catalog items spawned successfully`);

// 2. Verify all 12 crafted pills specifically (using canonical item ID, recipe ID, and P: prefix)
const craftedPillIds = [
  'ITEM190_PILL_001', 'ITEM190_PILL_002', 'ITEM190_PILL_003', 'ITEM190_PILL_004',
  'ITEM190_PILL_005', 'ITEM190_PILL_006', 'ITEM190_PILL_007', 'ITEM190_PILL_008',
  'ITEM190_PILL_009', 'ITEM190_PILL_010', 'ITEM190_PILL_011', 'ITEM190_PILL_012'
];

for (const itemId of craftedPillIds) {
  const itemDef = G.ECO.itemById[itemId];
  assert(itemDef, `Item definition for ${itemId} must exist`);
  const recipeId = itemDef.recipeId;

  // Spawn by canonical itemId
  const resItem = G.SECT.EDITOR.spawnItem(W, { kind: 'CRAFTED_PILL', id: itemId, qty: 2, dest: 'sect' });
  assert(resItem.ok, `Spawning crafted pill by itemId ${itemId} must succeed`);
  assert.strictEqual(resItem.nameTh, itemDef.nameTh);

  // Spawn by recipeId
  const resRec = G.SECT.EDITOR.spawnItem(W, { kind: 'CRAFTED_PILL', id: recipeId, qty: 1, dest: 'sect' });
  assert(resRec.ok, `Spawning crafted pill by recipeId ${recipeId} must succeed`);

  // Spawn by P: prefixed recipeId and P: prefixed itemId
  const resPrefixedRec = G.SECT.EDITOR.spawnItem(W, { kind: 'CRAFTED_PILL', id: 'P:' + recipeId, qty: 1, dest: 'sect' });
  assert(resPrefixedRec.ok, `Spawning crafted pill by P:${recipeId} must succeed`);

  const resPrefixedItem = G.SECT.EDITOR.spawnItem(W, { kind: 'CRAFTED_PILL', id: 'P:' + itemId, qty: 1, dest: 'sect' });
  assert(resPrefixedItem.ok, `Spawning crafted pill by P:${itemId} must succeed`);

  // Spawn to NPC personal bag
  const resNpc = G.SECT.EDITOR.spawnItem(W, { kind: 'CRAFTED_PILL', id: itemId, dest: 'npc', npcId: n.id, qty: 3 });
  assert(resNpc.ok, `Spawning crafted pill ${itemId} to NPC must succeed`);
  assert(n.inv.pills[itemId] >= 3, `NPC bag must contain ${itemId}`);
}
console.log('PASS: All 12 crafted pills spawnable via item ID, recipe ID, and P: prefix');

// 3. Verify equipment dual ID resolution (recipe ID vs item ID)
const sampleEqRecipes = G.JD.ITEMS.recipes.filter(r => r.outType === 'EQUIPMENT').slice(0, 30);
for (const r of sampleEqRecipes) {
  const resRec = G.SECT.EDITOR.spawnItem(W, { kind: 'EQUIPMENT', id: r.id, dest: 'sect', qty: 1 });
  assert(resRec.ok, `Spawning equipment by recipe ID ${r.id} must succeed, got ${resRec.reason}`);

  if (r.outItemId) {
    const resItem = G.SECT.EDITOR.spawnItem(W, { kind: 'EQUIPMENT', id: r.outItemId, dest: 'sect', qty: 1 });
    assert(resItem.ok, `Spawning equipment by item ID ${r.outItemId} must succeed, got ${resItem.reason}`);
  }
}
console.log('PASS: Equipment dual ID resolution verified');

// 4. Verify search resolution in catalog for both recipe ID and canonical item ID
const tal01SearchByItem = G.SECT.EDITOR.catalogPaginated(W, { search: 'ITEM190_TAL_001' });
assert.strictEqual(tal01SearchByItem.total, 1, 'Search by ITEM190_TAL_001 must find 1 entry');
const tal01SearchByRec = G.SECT.EDITOR.catalogPaginated(W, { search: 'REC190_TAL_001' });
assert.strictEqual(tal01SearchByRec.total, 1, 'Search by REC190_TAL_001 must find 1 entry');

const pill01SearchByItem = G.SECT.EDITOR.catalogPaginated(W, { search: 'ITEM190_PILL_001' });
assert.strictEqual(pill01SearchByItem.total, 1, 'Search by ITEM190_PILL_001 must find 1 entry');
const pill01SearchByRec = G.SECT.EDITOR.catalogPaginated(W, { search: 'REC190_PILL_001' });
assert.strictEqual(pill01SearchByRec.total, 1, 'Search by REC190_PILL_001 must find 1 entry');

console.log('PASS: Search blob indexes both recipe IDs and item IDs');
console.log('=== All Edit Spawner ID Resolution Tests Passed! ===');
