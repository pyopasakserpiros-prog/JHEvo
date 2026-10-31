'use strict';
const assert = require('assert');
const G = require('./load');
const { SIM, SECT, CULT, CPE, MARTIAL, CONTENT } = G;

console.log('Testing Priority C: Unified Donation, Appraisal, Warehouse & Surplus Semantics...');

{
  const W = SIM.create('unified-donation-test');
  const n = W.npcs[1];
  n.cp = 100;
  n.inv = n.inv || {};

  // 1. Duplicate Technique Manual Donation
  const techId = G.JD.TECH.techniques[0].id;
  W.sect.library = [techId]; // sect already knows this tech
  W.sect.surplusTechManuals = [];
  n.inv.techs = [techId];
  delete n.inv.spawnedTechs; // natural acquisition

  const cpBeforeManual = n.cp;
  const donManRes = MARTIAL.donateManual(W, n, techId);
  assert(donManRes.ok, 'Duplicate manual donation must succeed');
  assert.strictEqual(donManRes.duplicate, true, 'Must be marked as duplicate');
  assert.strictEqual(donManRes.reward, 0, 'Duplicate manual gives 0 CP reward (anti-minting)');
  assert(W.sect.surplusTechManuals.includes(techId), 'Physical manual must be stored in W.sect.surplusTechManuals');
  assert.strictEqual(n.cp, cpBeforeManual, 'No unbacked CP minted for duplicate manual');
  assert(!n.inv.techs.includes(techId), 'Manual must be removed from donor bag');

  // 2. Spawned Duplicate Technique Manual Donation (Anti-Minting)
  n.inv.techs = [techId];
  n.inv.spawnedTechs = [techId];
  const cpBeforeSpawned = n.cp;
  const donSpRes = MARTIAL.donateManual(W, n, techId);
  assert(donSpRes.ok && donSpRes.duplicate && donSpRes.playerSpawned, 'Spawned duplicate manual must succeed');
  assert.strictEqual(donSpRes.reward, 0, 'Spawned duplicate manual must give 0 CP reward');
  assert.strictEqual(n.cp, cpBeforeSpawned, 'No CP minted for spawned item');
  assert.strictEqual(W.sect.surplusTechManuals.filter(x => x === techId).length, 2, 'Second physical copy stored in surplus');

  // 3. Duplicate Subpath Manual Donation
  const subId = CULT.subList[0].sub.id;
  W.sect.subLibrary = [subId]; // sect already knows this subpath
  W.sect.surplusSubManuals = [];
  n.inv.subManuals = [subId];
  delete n.inv.spawnedSubManuals;
  const cpBeforeSub = n.cp;
  const donSubRes = MARTIAL.donateManual(W, n, subId, 'sub');
  assert(donSubRes.ok && donSubRes.duplicate, 'Duplicate subpath manual donation must succeed');
  assert.strictEqual(donSubRes.reward, 0, 'Duplicate sub manual gives 0 CP reward (anti-minting)');
  assert(W.sect.surplusSubManuals.includes(subId), 'Physical sub manual must be stored in W.sect.surplusSubManuals');
  assert.strictEqual(n.cp, cpBeforeSub);

  // 4. Duplicate Recipe Scroll Donation
  const recId = G.JD.ITEMS.recipes[0].id;
  W.sect.knownRecipes = [recId]; // sect already knows this recipe
  W.sect.surplusRecipes = [];
  n.inv.recipes = [recId];
  delete n.inv.spawnedRecipes;
  const cpBeforeRec = n.cp;
  const donRecRes = CONTENT.donateRecipe(W, n, recId);
  assert(donRecRes.ok && donRecRes.duplicate, 'Duplicate recipe scroll donation must succeed');
  assert.strictEqual(donRecRes.reward, 0, 'Duplicate recipe scroll gives 0 CP reward (anti-minting)');
  assert(W.sect.surplusRecipes.includes(recId), 'Physical recipe scroll must be stored in W.sect.surplusRecipes');
  assert.strictEqual(n.cp, cpBeforeRec);

  // 5. Crystal Stack at 999 Overflow
  const cryKey = 'S:' + subId;
  W.sect.crystals = W.sect.crystals || {};
  W.sect.crystals[cryKey] = 999;
  W.sect.knowledgeOverflow = {};
  n.inv.crystals = { [cryKey]: 1 };
  delete n.inv.spawnedCrystals;
  const cpBeforeCry = n.cp;
  const donCryRes = MARTIAL.donateCrystal(W, n, cryKey);
  assert(donCryRes.ok, 'Crystal donation when stack is 999 must NOT be rejected');
  assert(donCryRes.overflow, 'Must record overflow');
  assert.strictEqual(W.sect.crystals[cryKey], 999, 'Main stack remains at 999');
  assert.strictEqual(W.sect.knowledgeOverflow[cryKey], 1, 'Overflow stack must hold the new crystal');
  assert(donCryRes.reward > 0, 'Natural crystal donation must grant CP reward');
  assert.strictEqual(n.cp, cpBeforeCry + donCryRes.reward);

  console.log('  PASS: Duplicate manuals, sub manuals, recipe scrolls surplus retention and 999-overflow verified');
}

console.log('ALL UNIFIED DONATION TESTS PASSED.');
