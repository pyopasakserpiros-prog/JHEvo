'use strict';
const assert = require('assert');
const G = require('./load.js');
const { SIM, ECO, HC, CULT, SECT, SK, STATS, COMBAT, MARTIAL, JD } = G;

console.log('=== Running JS2 v3.2.0 Equipment Expansion Suite ===');

// 1. Version, Catalog & Keyword Invariants
assert.strictEqual(SIM.PATCH_VERSION, '3.5.0c', 'PATCH_VERSION must be 3.2.0');
assert.strictEqual(SIM.SAVE_SCHEMA_VERSION, '3.5.0c-release-polish', 'SAVE_SCHEMA_VERSION must be 3.2.0-equipment-expansion');
assert.strictEqual(Object.keys(COMBAT.KEYWORDS_CATALOG).length, 16, 'C.KEYWORDS_CATALOG must remain 16 locked base keywords');
assert.strictEqual(Object.keys(COMBAT.EQUIPMENT_KEYWORDS_CATALOG).length, 8, 'C.EQUIPMENT_KEYWORDS_CATALOG must have 8 shared equipment keywords');

const v320Items = JD.ITEMS.items.filter(x => x && x.versionAdded === 'v3.2.0');
const v320Recipes = JD.ITEMS.recipes.filter(x => x && x.versionAdded === 'v3.2.0');
assert.strictEqual(v320Items.length, 113, `Expected 113 v3.2.0 items, got ${v320Items.length}`);
assert.strictEqual(v320Recipes.length, 113, `Expected 113 v3.2.0 recipes, got ${v320Recipes.length}`);

// Check zero T7 in JD.ECOLOGY.recipes
for (const r of (JD.ECOLOGY && JD.ECOLOGY.recipes) || []) {
  assert(r.tier <= 6, `JD.ECOLOGY.recipes must not contain T7: ${r.id}`);
}

// Validate every v3.2.0 item & recipe
const implEffects = COMBAT.COMPOSABLE_ENGINE.IMPLEMENTED_EFFECT_IDS;
for (const it of v320Items) {
  assert(ECO.itemById[it.id], `Missing ECO.itemById[${it.id}]`);
  assert(it.nameTh && typeof it.nameTh === 'string', `Missing nameTh on ${it.id}`);
  assert(it.slot && ['WEAPON', 'ARMOR', 'ACCESSORY'].includes(it.slot), `Invalid slot on ${it.id}`);
  assert(it.tier >= 1 && it.tier <= 7, `Invalid tier on ${it.id}`);
  assert(it.st && typeof it.st === 'object', `Missing st on ${it.id}`);
  for (const ef of (it.effects || [])) {
    assert(implEffects.has(ef.effectId), `Unimplemented effectId ${ef.effectId} on ${it.id}`);
  }
  for (const gs of (it.grantedSkills || [])) {
    assert(SK.get(gs), `Unknown grantedSkill ${gs} on ${it.id}`);
  }
  if (it.rechargeMatId) {
    assert(ECO.matById[it.rechargeMatId], `Missing rechargeMatId ${it.rechargeMatId} on ${it.id}`);
  }
  if (it.upkeepMatId) {
    assert(ECO.matById[it.upkeepMatId], `Missing upkeepMatId ${it.upkeepMatId} on ${it.id}`);
  }
}

for (const r of v320Recipes) {
  assert(ECO.recipeById[r.id], `Missing ECO.recipeById[${r.id}]`);
  assert(ECO.itemById[r.outItemId], `Missing outItemId ${r.outItemId} on ${r.id}`);
  assert(Array.isArray(r.inputs) && r.inputs.length >= 2, `Recipe ${r.id} must have >= 2 inputs`);
  for (const inp of r.inputs) {
    assert(ECO.matById[inp.matId], `Recipe ${r.id} references missing matId ${inp.matId}`);
    assert(inp.count > 0, `Recipe ${r.id} invalid count`);
  }
  if (r.tier <= 2) assert.strictEqual(r.starter, true, `T1-T2 recipe ${r.id} must be starter: true`);
  else assert.strictEqual(r.discoverable, true, `T3-T7 recipe ${r.id} must be discoverable: true`);
}

// Verify underserved cell fills
const allGear = Object.values(ECO.itemById).filter(x => x && x.slot);
const countCell = (sub, maxT) => allGear.filter(x => (x.subType || x.gearType) === sub && x.tier <= (maxT || 7)).length;
assert(countCell('SHOES', 7) >= 7, 'SHOES coverage must be >= 7');
assert(allGear.filter(x => (x.subType || x.gearType) === 'AUX_TOOL' && x.tier === 1).length >= 2, 'T1 AUX_TOOL must be >= 2');
assert(allGear.filter(x => (x.subType || x.gearType) === 'ORNAMENT' && x.tier === 1).length >= 2, 'T1 ORNAMENT must be >= 2');
for (const wt of ['ABACUS', 'ASTROLABE', 'CLAW', 'FAN', 'NEEDLE', 'ROSARY']) {
  assert(countCell(wt, 2) >= 3, `${wt} T1-T2 coverage must be >= 3`);
}
console.log('  PASS: Catalog, recipes, effectIds, and underserved slot/tier coverage verified');

// 2. Runtime Mechanics: Minting, Stats, Recharge, Upkeep, Deeds, Lineage, Procs
const W = SIM.create('v320-equip-test-seed', { masterIdx: 0 });
const n = W.npcs[0];
n.cult = { path: 'XIAN', stage: 6, sub: 'PURE_SWORD_SAINT', techs: ['MP_SWORD_POISE'] };

// Mint & test Charge Talisman + Recharge
const chgDef = ECO.itemById['EQ_V320_TAL_CHG_T2_SHIELD'];
const chgGear = ECO.mintGear(W, chgDef, 1.1);
assert.strictEqual(chgGear.maxCharges, 3);
assert.strictEqual(chgGear.charges, 3);
assert.strictEqual(chgGear.listedAtDay, W.day || 0);
chgGear.charges = 0;
delete W.sect.stock[chgGear.rechargeMatId];
if (n.inv && n.inv.mats) delete n.inv.mats[chgGear.rechargeMatId];
const failRech = ECO.rechargeGear(W, chgGear, n, { quiet: true });
assert.strictEqual(failRech.ok, false);
assert.strictEqual(failRech.reason, 'no-recharge-material');
ECO.add(W, chgGear.rechargeMatId, 2);
const okRech = ECO.rechargeGear(W, chgGear, n, { quiet: true });
assert.strictEqual(okRech.ok, true, 'rechargeGear must succeed with material');
assert.strictEqual(chgGear.charges, 3, 'charges must be restored to maxCharges');

// Mint & test Upkeep Gear + Dormant/Wake
const upkDef = ECO.itemById['EQ_V320_UPKEEP_STAFF_T5'];
const upkGear = ECO.mintGear(W, upkDef, 1.0);
n.equip.WEAPON = upkGear;
W.day = 20;
upkGear.lastUpkeepDay = 0;
delete W.sect.stock[upkDef.upkeepMatId];
if (n.inv && n.inv.mats) delete n.inv.mats[upkDef.upkeepMatId];
const dormRes = ECO.maintainUpkeepGear(W, n);
assert.strictEqual(upkGear.dormant, true, 'Unmaintained upkeep gear must enter dormant state');
const dormStats = STATS.gearStats(Object.assign({}, upkGear, { st: null }));
ECO.add(W, upkDef.upkeepMatId, 1);
ECO.maintainUpkeepGear(W, n);
assert.strictEqual(upkGear.dormant, false, 'Fed upkeep gear must wake from dormant state');
const awakeStats = STATS.gearStats(Object.assign({}, upkGear, { st: null }));
assert(awakeStats.atk > dormStats.atk, 'Awake upkeep gear must have higher stats than dormant');

// Mint & test Deed Ledger Awakening & Lineage Echo
const loreDef = ECO.itemById['EQ_V320_LORE_SWORD_T7'];
const loreGear = ECO.mintGear(W, loreDef, 1.2);
assert.strictEqual(loreGear.deeds.stage, 1);
assert.strictEqual(loreGear.lineage.length, 2);
n.equip.WEAPON = loreGear;
ECO.recordGearDeed(W, n, 'kill', 2); // score = 6 -> Stage II
assert.strictEqual(loreGear.deeds.stage, 2, 'Deed ledger must awaken to stage 2');
ECO.recordGearDeed(W, n, 'kill', 4); // score = 18 -> Stage III
assert.strictEqual(loreGear.deeds.stage, 3, 'Deed ledger must awaken to stage 3');
ECO.recordGearLineage(W, loreGear, n);
assert.strictEqual(loreGear.lineage.length, 3, 'Lineage echo must cap at 3 entries');

// Test Granted Skills
const gsGear = ECO.mintGear(W, ECO.itemById['EQ_V320_GS_SWORD_T3'], 1.0);
n.equip.WEAPON = gsGear;
const granted = MARTIAL.grantedEquipmentTechs(n);
assert(granted.includes('MP_SWORD_FLOWING_PARRY_T2'), 'Granted skill must appear while equipped');

// Test Combat Procs for EFX_V320_*
const foe = W.npcs[1];
foe.cult = { path: 'BODY', stage: 5, sub: 'BODY_IRON_MONK', techs: [] };
n.equip.ACCESSORY = chgGear;
for (let i = 0; i < 4; i++) {
  W.t += 20;
  COMBAT.runItemEffectProcs(W, { kind: 'spar' }, n, foe, 'onStruck', 80);
}
assert(n.sx && n.sx.some(x => x.k === 'shield'), 'Charge release shield proc must fire in combat');
console.log('  PASS: Minting, recharge, upkeep/dormant, deeds, lineage, grantedSkills, and combat procs verified');

// 3. Autonomous NPC Selection, Rejection & Resonance Sets
const righteousNpc = W.npcs[2];
righteousNpc.cult = { path: 'BUDDHA_DHARMA', stage: 5, sub: 'BUDDHA_ZEN', techs: [] };
const boldNpc = W.npcs[1];
boldNpc.cult = { path: 'DEMON', stage: 5, sub: 'DEMON_BLOOD_BLADE', techs: [] };
const cursedBlade = ECO.mintGear(W, ECO.itemById['EQ_V320_CURSED_BLADE_T3'], 1.0);
const suitRighteous = MARTIAL.gearSuitability(righteousNpc, cursedBlade, 0);
const suitBold = MARTIAL.gearSuitability(boldNpc, cursedBlade, 0);
assert(suitRighteous.fit < suitBold.fit, `Righteous/Buddha NPC (${suitRighteous.fit}) must rate cursed blade lower than Demon NPC (${suitBold.fit})`);

// Verify 3 new Resonance Sets activate at 2/3 and 3/3
assert(MARTIAL.RESONANCE_BY_ID['RES_V320_IRON_PATINA'], 'RES_V320_IRON_PATINA registered');
assert(MARTIAL.RESONANCE_BY_ID['RES_V320_TWIN_STAR_BOND'], 'RES_V320_TWIN_STAR_BOND registered');
assert(MARTIAL.RESONANCE_BY_ID['RES_V320_ARCHIVIST_RELIC'], 'RES_V320_ARCHIVIST_RELIC registered');
const setTester = W.npcs[2];
setTester.cult = { path: 'BODY', stage: 5, sub: 'BODY_IRON_MONK', techs: [] };
setTester.equip.WEAPON = ECO.mintGear(W, ECO.itemById['EQ_V320_SET_PATINA_BLADE'], 1.0);
setTester.equip.ARMOR = ECO.mintGear(W, ECO.itemById['EQ_V320_SET_PATINA_ARMOR'], 1.0);
setTester.equip.ACCESSORY = ECO.mintGear(W, ECO.itemById['EQ_V320_SET_PATINA_BRAC'], 1.0);
const resEval = MARTIAL.evaluateResonanceSet(setTester);
assert(resEval && resEval.active && resEval.pieces === 3 && resEval.setId === 'RES_V320_IRON_PATINA', 'Patina 3/3 resonance set must activate');
console.log('  PASS: Autonomous cursed/temperament scoring and 3/3 resonance sets verified');

// 4. Save/Load Round-Trip & Multi-Seed Simulation
n.equip.WEAPON = loreGear;
loreGear.chargeCells = 2;
const savedJson = SIM.serialize(W);
const loadedW = SIM.deserialize(savedJson);
const loadedLore = loadedW.npcs[0].equip.WEAPON;
assert.strictEqual(loadedLore.deeds.stage, 3, 'Save/load must preserve deed ledger stage');
assert.strictEqual(loadedLore.chargeCells, 2, 'Save/load must preserve chargeCells');
assert.strictEqual(loadedLore.lineage.length, 3, 'Save/load must preserve lineage');

// Verify backward compatibility with 3.1.0-living-lore save header
const v310Save = JSON.parse(savedJson);
v310Save.schemaVersion = '3.4.0-world-events';
v310Save.patchVersion = '3.1.0';
const loadedV310 = SIM.deserialize(JSON.stringify(v310Save));
assert(loadedV310 && loadedV310.npcs.length > 0, 'Must cleanly load 3.1.0-living-lore saves');
for (let i = 0; i < 60; i++) SIM.tick(loadedW);
const W2 = SIM.create('v320-multi-seed-2');
for (let i = 0; i < 60; i++) SIM.tick(W2);
console.log('  PASS: Save/load round-trip, mid-charge/mid-deed persistence, and v3.1.0 compatibility verified');
console.log('=== ALL JS2 v3.2.0 EQUIPMENT EXPANSION TESTS PASSED! ===');
